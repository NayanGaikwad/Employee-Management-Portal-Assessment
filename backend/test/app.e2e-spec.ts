import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://nayangaikwad@localhost:5432/employee_portal_test?schema=public';

process.env.DATABASE_URL = TEST_DATABASE_URL;

const PERMISSIONS = [
  'employees:read',
  'employees:create',
  'employees:update',
  'employees:delete',
  'departments:read',
];

async function seedTestDb() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: TEST_DATABASE_URL }),
  });

  // Clean up prior test runs for repeatability.
  const testEmails = ['admin@test.com', 'register@test.com', 'viewer@test.com'];
  await prisma.employee.deleteMany({
    where: { email: { in: ['e2e@test.com'] } },
  });
  await prisma.user.deleteMany({ where: { email: { in: testEmails } } });

  for (const action of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { action },
      update: {},
      create: { action },
    });
  }
  const perms = await prisma.permission.findMany({
    where: { action: { in: PERMISSIONS } },
  });
  const permId = Object.fromEntries(perms.map((p) => [p.action, p.id]));

  const admin = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });
  const viewer = await prisma.role.upsert({
    where: { name: 'EMPLOYEE_VIEWER' },
    update: {},
    create: { name: 'EMPLOYEE_VIEWER' },
  });
  const bind = async (roleId: number, ids: number[]) => {
    await prisma.rolePermission.deleteMany({ where: { roleId } });
    await prisma.rolePermission.createMany({
      data: ids.map((permissionId) => ({ roleId, permissionId })),
      skipDuplicates: true,
    });
  };
  await bind(admin.id, Object.values(permId));
  await bind(viewer.id, [permId['employees:read'], permId['departments:read']]);

  const adminHash = await bcrypt.hash('password', 10);
  await prisma.user.create({
    data: {
      email: 'admin@test.com',
      passwordHash: adminHash,
      roleId: admin.id,
    },
  });

  const dept = await prisma.department.upsert({
    where: { name: 'E2E Engineering' },
    update: {},
    create: { name: 'E2E Engineering', status: 'ACTIVE' },
  });

  await prisma.$disconnect();
  return { dept };
}

describe('Employee Portal API (e2e)', () => {
  let app: INestApplication;
  let deptId: number;
  let adminToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    const seeded = await seedTestDb();
    deptId = seeded.dept.id;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects protected routes without a token (401)', async () => {
    await request(app.getHttpServer()).get('/api/employees').expect(401);
  });

  describe('auth', () => {
    it('registers a new user and returns a token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'register@test.com', password: 'Password@123' })
        .expect(201);
      expect(res.body.accessToken).toBeTruthy();
      expect(res.body.user.roleName).toBe('EMPLOYEE_VIEWER');
    });

    it('rejects duplicate registration (409)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'register@test.com', password: 'Password@123' })
        .expect(409);
    });

    it('logs in and returns a JWT', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'password' })
        .expect(200);
      adminToken = res.body.accessToken;
      expect(adminToken).toBeTruthy();
    });
  });

  describe('departments', () => {
    it('lists departments for an authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('employees', () => {
    let createdId: number;

    it('creates an employee as admin (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'E2E Employee',
          email: 'e2e@test.com',
          departmentId: deptId,
          jobTitle: 'Engineer',
          joiningDate: '2023-01-15',
        })
        .expect(201);
      createdId = res.body.id;
      expect(res.body.fullName).toBe('E2E Employee');
    });

    it('rejects a duplicate email (409)', async () => {
      await request(app.getHttpServer())
        .post('/api/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Duplicate',
          email: 'e2e@test.com',
          departmentId: deptId,
          jobTitle: 'Engineer',
          joiningDate: '2023-01-15',
        })
        .expect(409);
    });

    it('rejects a non-existent department (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Bad Dept',
          email: 'baddept@test.com',
          departmentId: 999999,
          jobTitle: 'Engineer',
          joiningDate: '2023-01-15',
        })
        .expect(400);
    });

    it('lists employees with pagination metadata', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/employees?page=1&pageSize=10&search=e2e')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body).toHaveProperty('totalItems');
      expect(res.body).toHaveProperty('totalPages');
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    it('updates an employee (200)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/employees/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ jobTitle: 'Senior Engineer' })
        .expect(200);
      expect(res.body.jobTitle).toBe('Senior Engineer');
    });

    it('soft-deletes an employee, then cannot retrieve it (404)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/employees/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      await request(app.getHttpServer())
        .get(`/api/employees/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('returns 404 for an unknown employee id', async () => {
      await request(app.getHttpServer())
        .get('/api/employees/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
  describe('role-based access control', () => {
    it('allows a viewer to read but denies creating (403)', async () => {
      const reg = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'viewer@test.com', password: 'Password@123' })
        .expect(201);
      viewerToken = reg.body.accessToken;

      await request(app.getHttpServer())
        .get('/api/employees')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/employees')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          fullName: 'No',
          email: 'no@test.com',
          departmentId: deptId,
          jobTitle: 'Engineer',
          joiningDate: '2023-01-15',
        })
        .expect(403);
    });
  });
});
