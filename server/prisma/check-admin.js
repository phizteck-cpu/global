import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'SUPERADMIN' },
    });

    if (admin) {
      console.log('Admin found:');
      console.log('ID:', admin.id);
      console.log('Username:', admin.username);
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Status:', admin.status);
    } else {
      console.log('No admin account found.');
      console.log('Creating admin...');

      // Create admin
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('MyPassword123', 10);

      const newAdmin = await prisma.user.create({
        data: {
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

      console.log('Admin created:');
      console.log('Username:', newAdmin.username);
      console.log('Password: MyPassword123');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
