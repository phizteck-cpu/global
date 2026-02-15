import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Create Super Admin
    const superAdminPassword = await bcrypt.hash('superadmin123', 10);
    try {
        const superAdmin = await prisma.user.upsert({
            where: { email: 'superadmin@valuehills.com' },
            update: {},
            create: {
                email: 'superadmin@valuehills.com',
                username: 'superadmin',
                password: superAdminPassword,
                firstName: 'Super',
                lastName: 'Admin',

                role: 'SUPERADMIN',
                status: 'ACTIVE',
                emailVerified: true
            },
        });
        console.log('Super Admin user created:', superAdmin.username);
    } catch (e) {
        console.log('Super Admin creation likely failed due to existing unique constraint:', e.message);
    }

    // Create Standard User
    const userPassword = await bcrypt.hash('user123', 10);
    try {
        const user = await prisma.user.upsert({
            where: { email: 'user@example.com' },
            update: {},
            create: {
                email: 'user@example.com',
                username: 'testuser',
                password: userPassword,
                firstName: 'Test',
                lastName: 'User',

                role: 'MEMBER',
                status: 'ACTIVE',
                emailVerified: true,
                walletBalance: 1000.00
            },
        });
        console.log('Standard User created:', user.username);
    } catch (e) {
        console.log('Standard User creation likely failed due to existing unique constraint:', e.message);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
