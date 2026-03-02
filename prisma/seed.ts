import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hashPassword('Admin123!');
  const userPassword = await hashPassword('User123!');

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: 'admin'
    }
  });

  const user = await prisma.user.create({
    data: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      passwordHash: userPassword,
      role: 'user'
    }
  });

  await prisma.task.create({
    data: {
      ownerId: user.id,
      title: 'Finish onboarding tasks',
      description: 'Complete account setup and read docs',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)
    }
  });

  await prisma.task.create({
    data: {
      ownerId: user.id,
      title: 'Plan weekly sprint',
      description: 'Outline tasks for the upcoming sprint',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    }
  });

  await prisma.task.create({
    data: {
      ownerId: admin.id,
      title: 'Review system stats',
      description: 'Check user growth and task throughput',
      status: 'todo',
      priority: 'low'
    }
  });
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
