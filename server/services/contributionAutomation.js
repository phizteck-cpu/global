import prisma from '../prisma/client.js';

/**
 * Main automation worker that runs daily deductions.
 */
export const runDailyContributions = async () => {
    console.log('[AUTOMATION] Starting daily contribution processing...');
    const now = new Date();

    try {
        // 1. Find all PENDING contributions that are due TODAY or OVERDUE
        const dueContributions = await prisma.contribution.findMany({
            where: {
                status: 'PENDING',
                dueDate: { lte: now }
            },
            include: {
                userPackage: {
                    include: {
                        user: { include: { wallet: true } }
                    }
                }
            }
        });

        console.log(`[AUTOMATION] Found ${dueContributions.length} contributions to process.`);

        for (const contribution of dueContributions) {
            await processSingleContribution(contribution);
        }

        // 2. Handle Grace Period / Missed Payments
        // If a contribution is still PENDING and older than 48 hours past due date, mark as MISSED
        const graceDeadline = new Date(now.getTime() - (48 * 60 * 60 * 1000));

        const missedContributions = await prisma.contribution.updateMany({
            where: {
                status: 'PENDING',
                dueDate: { lt: graceDeadline }
            },
            data: {
                status: 'MISSED'
            }
        });

        if (missedContributions.count > 0) {
            console.log(`[AUTOMATION] Marked ${missedContributions.count} contributions as MISSED.`);
            // Update UserPackage missed count for all affected packages
            // In a better implementation, we'd loop through them to trigger "DEFAULTED" status logic.
            await handleDefaultedPackages();
        }

    } catch (error) {
        console.error('[AUTOMATION] Worker Error:', error);
    }
};

/**
 * Attempt deduction for a single contribution
 */
const processSingleContribution = async (contribution) => {
    const { userPackage, amount, id: contributionId } = contribution;
    const { user, id: packageId } = userPackage;
    const wallet = user.wallet;

    try {
        if (!wallet) return;

        if (wallet.balance >= amount) {
            // SUCCESS: Deduct and mark PAID
            await prisma.$transaction(async (tx) => {
                // Update Wallet
                await tx.wallet.update({
                    where: { id: wallet.id },
                    data: {
                        balance: { decrement: amount },
                        lockedBalance: { increment: amount }
                    }
                });

                // Update Contribution
                await tx.contribution.update({
                    where: { id: contributionId },
                    data: {
                        status: 'PAID',
                        paidAt: new Date(),
                        attemptCount: { increment: 1 }
                    }
                });

                // Increment weeks paid
                const updatedPackage = await tx.userPackage.update({
                    where: { id: packageId },
                    data: { weeksPaid: { increment: 1 } }
                });

                // Log Transaction
                await tx.transaction.create({
                    data: {
                        walletId: wallet.id,
                        type: 'CONTRIBUTION',
                        amount,
                        status: 'SUCCESS',
                        description: `Weekly Contribution (Week ${contribution.weekNumber})`,
                        reference: `AUTO-CON-${contributionId}-${Date.now()}`
                    }
                });

                // Check Completion
                const pkg = await tx.package.findUnique({ where: { id: updatedPackage.packageId } });
                if (updatedPackage.weeksPaid >= (pkg.durationWeeks || 45)) {
                    await tx.userPackage.update({
                        where: { id: packageId },
                        data: { status: 'COMPLETED', endDate: new Date() }
                    });

                    // Notify User
                    await tx.notification.create({
                        data: {
                            userId: user.id,
                            title: 'Cycle Completed! 🍚',
                            message: `Congratulations! You have completed your 45-week contribution cycle for ${pkg.name}. You can now redeem your food benefits.`
                        }
                    });
                }
            });
            console.log(`[AUTOMATION] Successfully charged User ${user.id} for Week ${contribution.weekNumber}`);
        } else {
            // FAILURE: Insufficient Balance
            await prisma.contribution.update({
                where: { id: contributionId },
                data: {
                    attemptCount: { increment: 1 },
                    lastAttemptAt: new Date()
                }
            });

            // Notify User
            await prisma.notification.create({
                data: {
                    userId: user.id,
                    title: 'Payment Reminder ⚠️',
                    message: `We attempted to deduct your weekly contribution of ₦${amount.toLocaleString()} but your balance was insufficient. Please fund your wallet to avoid missed payments.`
                }
            });
            console.log(`[AUTOMATION] Insufficient balance for User ${user.id}. Notification sent.`);
        }
    } catch (error) {
        console.error(`[AUTOMATION] Error processing contribution ${contributionId}:`, error);
    }
};

/**
 * Check for users who missed 2+ payments and mark as DEFAULTED
 */
const handleDefaultedPackages = async () => {
    // Logic: Count MISSED contributions per active package
    // For simplicity, we can do this in one pass
    const activePackages = await prisma.userPackage.findMany({
        where: { status: 'ACTIVE' },
        include: { contributions: true }
    });

    for (const pkg of activePackages) {
        const missedCount = pkg.contributions.filter(c => c.status === 'MISSED').length;
        if (missedCount >= 2 && pkg.status !== 'DEFAULTED') {
            await prisma.userPackage.update({
                where: { id: pkg.id },
                data: { status: 'DEFAULTED', missedCount }
            });

            await prisma.notification.create({
                data: {
                    userId: pkg.userId,
                    title: 'Account Frozen ❄️',
                    message: 'Your package has been marked as DEFAULTED due to 2 missed contributions. Withdrawals are frozen until you settle outstanding payments.'
                }
            });
            console.log(`[AUTOMATION] Package ${pkg.id} marked as DEFAULTED.`);
        }
    }
};
