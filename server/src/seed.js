
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@croptracker.com' },
    update: {},
    create: {
      email: 'admin@croptracker.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Seed: Admin user created!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());