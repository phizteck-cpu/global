import prisma from './prisma/client.js';

async function fundTestWallet() {
    try {
        const username = 'member123';
        const fundAmount = 100000; // ₦100,000 for testing

        const user = await prisma.user.update({
            where: { username },
            data: { walletBalance: { increment: fundAmount } },
            select: {
                username: true,
                walletBalance: true,
                tier: {
                    select: {
                        name: true,
                        weeklyAmount: true,
                        maintenanceFee: true
                    }
                }
            }
        });

        console.log('\n✅ Wallet Funded Successfully!\n');
        console.log(`Username: ${user.username}`);
        console.log(`New Wallet Balance: ₦${user.walletBalance.toLocaleString()}`);
        console.log(`\nTier: ${user.tier?.name || 'No tier'}`);
        
        if (user.tier) {
            const totalNeeded = user.tier.weeklyAmount + user.tier.maintenanceFee;
            const weeksCanPay = Math.floor(user.walletBalance / totalNeeded);
            console.log(`Weekly Amount: ₦${user.tier.weeklyAmount}`);
            console.log(`Maintenance Fee: ₦${user.tier.maintenanceFee}`);
            console.log(`Total per Week: ₦${totalNeeded}`);
            console.log(`\nCan pay for approximately ${weeksCanPay} weeks`);
        }
        
        console.log('\n');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fundTestWallet();
