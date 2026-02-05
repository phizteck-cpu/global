import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('password123', 10);

    // 1. Get Packages
    const starter = await prisma.package.findUnique({ where: { name: 'STARTER' } });
    const pro = await prisma.package.findUnique({ where: { name: 'PRO' } });

    // 2. Create Stress Test Users
    console.log('Creating stress test users...');

    // User A: Has enough money in wallet
    const userA = await prisma.user.create({
        data: {
            email: 'user_a@test.com',
            fullName: 'Stress User A (Liquid)',
            password,
            role: 'MEMBER',
            phone: '1111111111',
            kycVerified: true,
            wallet: { create: { balance: 50000, lockedBalance: 0 } }
        }
    });

    // User B: Has zero balance
    const userB = await prisma.user.create({
        data: {
            email: 'user_b@test.com',
            fullName: 'Stress User B (Broke)',
            password,
            role: 'MEMBER',
            phone: '2222222222',
            kycVerified: true,
            wallet: { create: { balance: 0, lockedBalance: 0 } }
        }
    });

    // 3. Subscribe them to packages
    console.log('Subscribing users to packages...');

    const upA = await prisma.userPackage.create({
        data: {
            userId: userA.id,
            packageId: starter.id,
            status: 'ACTIVE',
            startDate: new Date(),
            weeksPaid: 0
        }
    });

    const upB = await prisma.userPackage.create({
        data: {
            userId: userB.id,
            packageId: pro.id,
            status: 'ACTIVE',
            startDate: new Date(),
            weeksPaid: 0
        }
    });

    // 4. Create PENDING contributions for TODAY
    console.log('Creating pending contributions...');

    await prisma.contribution.create({
        data: {
            userPackageId: upA.id,
            amount: starter.weeklyAmount,
            weekNumber: 1,
            dueDate: new Date(),
            status: 'PENDING'
        }
    });

    await prisma.contribution.create({
        data: {
            userPackageId: upB.id,
            amount: pro.weeklyAmount,
            weekNumber: 1,
            dueDate: new Date(),
            status: 'PENDING'
        }
    });

    console.log('Stress test data initialized.');
}

main().then(() => prisma.$disconnect());
