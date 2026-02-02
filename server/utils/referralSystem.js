import prisma from '../prisma/client.js';

/**
 * Process the Direct Referral Bonus (Level 1)
 * Triggered when a user completes their FIRST contribution.
 */
export const processReferralBonus = async (refereeId, tx = prisma) => {
    try {
        // 1. Find the referral record
        const referral = await tx.referral.findUnique({
            where: { refereeId: parseInt(refereeId) },
            include: { refereeUser: true }
        });

        if (!referral || referral.status === 'PAID') return;

        const bonusAmount = 1000.00; // NGN 1,000 as per spec example
        const referrerId = referral.referrerId;

        // 2. Credit Referrer Wallet (Available Balance)
        const referrerWallet = await tx.wallet.findUnique({ where: { userId: referrerId } });
        if (!referrerWallet) return;

        await tx.wallet.update({
            where: { id: referrerWallet.id },
            data: { balance: { increment: bonusAmount } }
        });

        // 3. Create Bonus Record
        await tx.bonus.create({
            data: {
                userId: referrerId,
                sourceUserId: refereeId,
                amount: bonusAmount,
                type: 'DIRECT',
                status: 'PAID'
            }
        });

        // 4. Create Transaction Record
        await tx.transaction.create({
            data: {
                walletId: referrerWallet.id,
                type: 'BONUS',
                amount: bonusAmount,
                status: 'SUCCESS',
                description: `Direct Referral Bonus: ${referral.refereeUser.fullName} started contributions`,
                reference: `REF-DIR-${referral.id}-${Date.now()}`
            }
        });

        // 5. Update Referral Status
        await tx.referral.update({
            where: { id: referral.id },
            data: { status: 'PAID' }
        });

        // 6. Check for Team Milestone Bonuses
        await checkMilestoneBonus(referrerId, tx);

    } catch (error) {
        console.error('Referral Bonus Processing Error:', error);
    }
};

/**
 * Check and pay Team Milestone Bonuses (Level 2)
 */
export const checkMilestoneBonus = async (referrerId, tx = prisma) => {
    try {
        // Count total PAID direct referrals
        const activeReferralsCount = await tx.referral.count({
            where: {
                referrerId: parseInt(referrerId),
                status: 'PAID'
            }
        });

        const milestones = [
            { count: 5, reward: 5000 },
            { count: 10, reward: 15000 },
            { count: 25, reward: 50000 }
        ];

        for (const milestone of milestones) {
            if (activeReferralsCount >= milestone.count) {
                // Check if this specific milestone bonus has already been paid
                const bonusExists = await tx.bonus.findFirst({
                    where: {
                        userId: referrerId,
                        type: 'TEAM',
                        amount: milestone.reward,
                        // We can store the milestone info in metadata or just check if any TEAM bonus of this exact amount exists for this user.
                        // Simple approach for dev: check if a TEAM bonus of this amount exists.
                    }
                });

                if (!bonusExists) {
                    const referrerWallet = await tx.wallet.findUnique({ where: { userId: referrerId } });

                    // Credit Wallet
                    await tx.wallet.update({
                        where: { id: referrerWallet.id },
                        data: { balance: { increment: milestone.reward } }
                    });

                    // Record Bonus
                    await tx.bonus.create({
                        data: {
                            userId: referrerId,
                            amount: milestone.reward,
                            type: 'TEAM',
                            status: 'PAID',
                            // Details stored in metadata if needed
                        }
                    });

                    // Log Transaction
                    await tx.transaction.create({
                        data: {
                            walletId: referrerWallet.id,
                            type: 'BONUS',
                            amount: milestone.reward,
                            status: 'SUCCESS',
                            description: `Team Milestone Bonus (${milestone.count} active referrals reached)`,
                            reference: `MS-${referrerId}-${milestone.count}-${Date.now()}`
                        }
                    });

                    // Notification (Optional: could be triggered later)
                }
            }
        }
    } catch (error) {
        console.error('Milestone Bonus Check Error:', error);
    }
};
