import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { DepartmentStatus, EmploymentStatus } from '../src/generated/prisma/enums.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

const PERMISSIONS = [
  'employees:read',
  'employees:create',
  'employees:update',
  'employees:delete',
  'departments:read',
];

async function main() {
  console.log('Seeding permissions...');
  for (const action of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { action },
      update: {},
      create: { action },
    });
  }
  const permId = (action: string) =>
    prisma.permission.findUnique({ where: { action } }).then((p) => p!.id);

  const employeeRead = await permId('employees:read');
  const employeeCreate = await permId('employees:create');
  const employeeUpdate = await permId('employees:update');
  const employeeDelete = await permId('employees:delete');
  const departmentRead = await permId('departments:read');

  console.log('Seeding roles...');
  await seedRole('ADMIN', [
    employeeRead,
    employeeCreate,
    employeeUpdate,
    employeeDelete,
    departmentRead,
  ]);
  await seedRole('EMPLOYEE_VIEWER', [employeeRead, departmentRead]);

  console.log('Seeding departments...');
  const departments = await seedDepartments();

  console.log('Seeding employees...');
  await seedEmployees(departments);

  console.log('Seed complete.');
}

async function seedRole(name: string, permissionIds: number[]) {
  const role = await prisma.role.upsert({
    where: { name },
    update: {},
    create: { name },
  });
  await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
  await prisma.rolePermission.createMany({
    data: permissionIds.map((permissionId) => ({ roleId: role.id, permissionId })),
    skipDuplicates: true,
  });
}

async function seedDepartments() {
  const names = [
    { name: 'Engineering', status: DepartmentStatus.ACTIVE },
    { name: 'Design', status: DepartmentStatus.ACTIVE },
    { name: 'Marketing', status: DepartmentStatus.ACTIVE },
    { name: 'Human Resources', status: DepartmentStatus.ACTIVE },
    { name: 'Operations', status: DepartmentStatus.INACTIVE },
  ];
  const out: { id: number; name: string }[] = [];
  for (const d of names) {
    const created = await prisma.department.upsert({
      where: { name: d.name },
      update: {},
      create: { name: d.name, status: d.status },
    });
    out.push(created);
  }
  return out;
}

const firstNames = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
  'Ivy', 'Jack', 'Kate', 'Leo', 'Mona', 'Nina', 'Oscar', 'Paula',
  'Quinn', 'Rita', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier',
  'Yara', 'Zane', 'Ava', 'Liam', 'Noah', 'Emma',
];
const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Lee', 'Walker', 'Hall', 'Allen',
  'Young', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson',
  'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell',
  'Parker',
];
const jobTitles = [
  'Software Engineer', 'Senior Developer', 'Product Designer', 'QA Analyst',
  'DevOps Engineer', 'Marketing Specialist', 'HR Coordinator', 'Data Analyst',
  'Frontend Developer', 'Backend Engineer', 'Project Manager', 'Support Lead',
  'Systems Admin', 'Technical Writer', 'UX Researcher', 'Sales Associate',
];

function choose<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function seedDate(i: number): Date {
  const base = new Date('2021-01-01').getTime();
  const span = 4 * 365 * 24 * 60 * 60 * 1000; // ~4 years
  return new Date(base + i * 7 * 24 * 60 * 60 * 1000);
}

async function seedEmployees(departments: { id: number; name: string }[]) {
  const existing = await prisma.employee.count({ where: { deletedAt: null } });
  if (existing > 0) {
    console.log(`Already have ${existing} active employees, skipping employee seed.`);
    return;
  }
  for (let i = 0; i < firstNames.length; i++) {
    const fullName = `${firstNames[i]} ${lastNames[i]}`;
    const department =
      departments[i % departments.length];
    await prisma.employee.create({
      data: {
        fullName,
        email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@company.com`,
        departmentId: department.id,
        jobTitle: choose(jobTitles),
        status:
          i % 5 === 0 ? EmploymentStatus.INACTIVE : EmploymentStatus.ACTIVE,
        joiningDate: seedDate(i),
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
