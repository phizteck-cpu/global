import prisma from './backend/prisma/client.js';

async function test() {
    try {
        console.log('Testing Package findMany...');
        const pkgs = await prisma.package.findMany();
        console.log('Packages:', pkgs);

        console.log('Testing Tier findMany...');
        const tiers = await prisma.tier.findMany();
        console.log('Tiers:', tiers);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
