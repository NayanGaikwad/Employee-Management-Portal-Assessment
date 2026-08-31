import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

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
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment/.env',
    );
  }

  await ensurePermissionsAndRole();

  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });
    console.log(`Updated admin user: ${email}`);
  } else {
    const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
    await prisma.user.create({
      data: { email, passwordHash, roleId: adminRole!.id },
    });
    console.log(`Created admin user: ${email}`);
  }
}

async function ensurePermissionsAndRole() {
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
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });
  await prisma.rolePermission.deleteMany({ where: { roleId: adminRole.id } });
  await prisma.rolePermission.createMany({
    data: perms.map((p) => ({ roleId: adminRole.id, permissionId: p.id })),
    skipDuplicates: true,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
