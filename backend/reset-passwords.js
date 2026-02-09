import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Resetting superadmin password...');
    const hashedPassword = await bcrypt.hash('superadmin123', 10);

    try {
        const user = await prisma.user.upsert({
            where: { email: 'superadmin@valuehills.com' },
            update: {
                password: hashedPassword,
                username: 'superadmin',
                role: 'SUPERADMIN',
                status: 'ACTIVE'
            },
            create: {
                email: 'superadmin@valuehills.com',
                username: 'superadmin',
                password: hashedPassword,
                firstName: 'Super',
                lastName: 'Admin',
                role: 'SUPERADMIN',
                status: 'ACTIVE',
                emailVerified: true
            },
        });
        console.log('Super Admin updated successfully:', user.username);
    } catch (e) {
        console.error('Failed to update superadmin:', e);
    }

    console.log('Resetting testuser password...');
    const testUserPass = await bcrypt.hash('user123', 10);
    try {
        const user = await prisma.user.upsert({
            where: { email: 'user@example.com' },
            update: {
                password: testUserPass,
                username: 'testuser',
                role: 'MEMBER',
                status: 'ACTIVE'
            },
            create: {
                email: 'user@example.com',
                username: 'testuser',
                password: testUserPass,
                firstName: 'Test',
                lastName: 'User',
                role: 'MEMBER',
                status: 'ACTIVE',
                emailVerified: true,
                walletBalance: 1000.00
            },
        });
        console.log('Test User updated successfully:', user.username);
    } catch (e) {
        console.error('Failed to update testuser:', e);
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
