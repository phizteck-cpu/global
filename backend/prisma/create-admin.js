import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('MyPassword123', 10);

    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        email: 'admin@valuehills.com',
        username: 'admin',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'SUPERADMIN',
        status: 'ACTIVE',
        kycStatus: 'VERIFIED',
      },
    });

    console.log('Admin created/updated successfully:', admin.username);
    console.log('Email:', admin.email);
    console.log('Password: MyPassword123');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
