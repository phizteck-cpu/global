import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // 1. Create Tiers
    const tiers = [
        { name: 'STARTER', weeklyAmount: 1333.33, onboardingFee: 3000, maintenanceFee: 100, upgradeFee: 0 },
        { name: 'PRO', weeklyAmount: 1333.33, onboardingFee: 5000, maintenanceFee: 500, upgradeFee: 2000 },
        { name: 'ELITE', weeklyAmount: 1333.33, onboardingFee: 10000, maintenanceFee: 1000, upgradeFee: 5000 },
    ];

    console.log('Seeding Tiers...');
    for (const tier of tiers) {
        await prisma.tier.upsert({
            where: { name: tier.name },
            update: tier,
            create: tier,
        });
    }

    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedMemberPassword = await bcrypt.hash('password123', 10);

    // 2. Create Roles
    console.log('Seeding Users...');

    // Super Admin
    await prisma.user.upsert({
        where: { email: 'superadmin@valuehills.com' },
        update: {},
        create: {
            email: 'superadmin@valuehills.com',
            username: 'superadmin',
            password: hashedAdminPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: 'SUPERADMIN',
            phone: '0000000001',
            kycStatus: 'VERIFIED',
        }
    });

    // Admin
    await prisma.user.upsert({
        where: { email: 'admin@valuehills.com' },
        update: {},
        create: {
            email: 'admin@valuehills.com',
            username: 'admin',
            password: hashedAdminPassword,
            firstName: 'Operational',
            lastName: 'Admin',
            role: 'ADMIN',
            phone: '0000000002',
            kycStatus: 'VERIFIED',
        }
    });

    // Accountant
    await prisma.user.upsert({
        where: { email: 'auditor@valuehills.com' },
        update: {},
        create: {
            email: 'auditor@valuehills.com',
            username: 'auditor',
            password: hashedAdminPassword,
            firstName: 'Chief',
            lastName: 'Auditor',
            role: 'ACCOUNTANT',
            phone: '0000000003',
            kycStatus: 'VERIFIED',
        }
    });

    // Sample Member
    const starterTier = await prisma.tier.findUnique({ where: { name: 'STARTER' } });
    await prisma.user.upsert({
        where: { email: 'member@example.com' },
        update: {},
        create: {
            email: 'member@example.com',
            username: 'member123',
            password: hashedMemberPassword,
            firstName: 'John',
            lastName: 'Doe',
            role: 'MEMBER',
            phone: '08012345678',
            tierId: starterTier.id,
            kycStatus: 'PENDING',
        }
    });

    console.log('Seed completed successfully.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
