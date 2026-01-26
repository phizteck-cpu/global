import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Create Packages
    const packages = [
        { name: 'STARTER', weeklyAmount: 1000, totalAmount: 45000, foodValue: 0 },
        { name: 'PRO', weeklyAmount: 5000, totalAmount: 225000, foodValue: 10000 },
        { name: 'ELITE', weeklyAmount: 10000, totalAmount: 450000, foodValue: 25000 },
    ];

    for (const pkg of packages) {
        await prisma.package.upsert({
            where: { name: pkg.name },
            update: {},
            create: pkg,
        });
    }

    const password = await bcrypt.hash('password123', 10);

    // Helper to create user with wallet
    const createUser = async (email, fName, lName, role, phone) => {
        return prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                fullName: `${fName} ${lName}`,
                password,
                role,
                phone,
                kycVerified: true,
                wallet: {
                    create: {
                        balance: 0,
                        lockedBalance: 0
                    }
                }
            },
        });
    };

    // Super Admin
    const superAdmin = await createUser('superadmin@valuehills.com', 'Super', 'Admin', 'SUPERADMIN', '0000000001');

    // Admin
    const admin = await createUser('admin@valuehills.com', 'Operational', 'Admin', 'ADMIN', '0000000002');

    // Accountant
    const accountant = await createUser('auditor@valuehills.com', 'Chief', 'Auditor', 'ACCOUNTANT', '0000000003');

    console.log({ superAdmin, admin, accountant });
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
