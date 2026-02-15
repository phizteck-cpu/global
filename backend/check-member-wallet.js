import prisma from './prisma/client.js';

async function checkMemberWallet() {
    try {
        const member = await prisma.user.findUnique({
            where: { username: 'member123' },
            select: {
                id: true,
                username: true,
                walletBalance: true,
                contributionBalance: true,
                bvBalance: true,
                tier: {
                    select: {
                        name: true,
                        weeklyAmount: true,
                        maintenanceFee: true
                    }
                }
            }
        });

        if (!member) {
            console.log('Member not found');
            return;
        }

        console.log('\n=== Member Wallet Status ===\n');
        console.log(`Username: ${member.username}`);
        console.log(`Wallet Balance: ₦${member.walletBalance}`);
        console.log(`Contribution Balance: ₦${member.contributionBalance}`);
        console.log(`BV Balance: ${member.bvBalance}`);
        console.log(`\nTier: ${member.tier?.name || 'No tier assigned'}`);
        
        if (member.tier) {
            console.log(`Weekly Amount: ₦${member.tier.weeklyAmount}`);
            console.log(`Maintenance Fee: ₦${member.tier.maintenanceFee}`);
            const totalNeeded = member.tier.weeklyAmount + member.tier.maintenanceFee;
            console.log(`Total Needed for Contribution: ₦${totalNeeded}`);
            console.log(`\nCan Pay? ${member.walletBalance >= totalNeeded ? 'YES ✅' : 'NO ❌'}`);
            
            if (member.walletBalance < totalNeeded) {
                console.log(`\nShortfall: ₦${totalNeeded - member.walletBalance}`);
            }
        }
        
        console.log('\n');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkMemberWallet();
