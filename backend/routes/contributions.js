import express from 'express';
import prisma from '../prisma/client.js';
import { authenticateToken } from '../middleware/auth.js';
import { processReferralBonus } from '../utils/referralSystem.js';
import { 
    getCurrentWeek, 
    isContributionWindowOpen, 
    hasContributedThisWeek,
    calculateLateFee,
    getWeeklyContributionStatus
} from '../utils/weeklyContribution.js';

const router = express.Router();

// Get Contribution History
router.get('/', authenticateToken, async (req, res) => {
    try {
        const contributions = await prisma.contribution.findMany({
            where: { userId: req.user.userId },
            orderBy: { weekNumber: 'asc' }
        });
        res.json(contributions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch contributions' });
    }
});

// Get Weekly Contribution Status
router.get('/weekly-status', authenticateToken, async (req, res) => {
    try {
        const status = await getWeeklyContributionStatus(prisma, req.user.userId);
        res.json(status);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch weekly status' });
    }
});

// Pay Contribution
router.post('/pay', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const now = new Date();

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { tier: true }
        });

        if (!user.tier) {
            return res.status(400).json({ error: 'No active tier found. Please select a tier first.' });
        }

        // Check if contribution window is open (Friday-Saturday)
        const isWindowOpen = isContributionWindowOpen();
        if (!isWindowOpen) {
            const { contributionWindowStart } = getCurrentWeek();
            return res.status(400).json({ 
                error: 'Contribution window is closed. You can only contribute on Friday or Saturday.',
                nextWindow: contributionWindowStart.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
            });
        }

        // Check if user has already contributed this week
        const alreadyContributed = await hasContributedThisWeek(prisma, userId);
        if (alreadyContributed) {
            return res.status(400).json({ error: 'You have already contributed this week. You can only contribute once per week.' });
        }

        const amount = user.tier.weeklyAmount;
        const maintenanceFee = user.tier.maintenanceFee;
        
        // Calculate late fee if applicable (paying after Saturday deadline)
        const { weekStart, weekEnd } = getCurrentWeek();
        const lateFee = calculateLateFee(now, weekEnd);
        const totalToDeduct = amount + maintenanceFee + lateFee;

        // Check wallet balance
        if (user.walletBalance < totalToDeduct) {
            return res.status(400).json({ 
                error: `Insufficient wallet balance. Required: ₦${totalToDeduct.toLocaleString()} (includes ${lateFee > 0 ? `₦${lateFee} late fee` : 'no late fee'})` 
            });
        }

        // Find next contribution week
        const lastContribution = await prisma.contribution.findFirst({
            where: { userId },
            orderBy: { weekNumber: 'desc' }
        });
        const nextWeek = lastContribution ? lastContribution.weekNumber + 1 : 1;

        // Check if user has completed their tier duration
        const tierDuration = user.tier.durationWeeks || 45;
        if (nextWeek > tierDuration) {
            return res.status(400).json({ error: `You have completed all ${tierDuration} weeks of contributions for your tier.` });
        }

        await prisma.$transaction(async (tx) => {
            // 1. Update User Balances
            await tx.user.update({
                where: { id: userId },
                data: {
                    walletBalance: { decrement: totalToDeduct },
                    contributionBalance: { increment: amount },
                    bvBalance: { increment: amount },
                }
            });

            // 2. Log Cooperative Transaction
            await tx.transaction.create({
                data: {
                    userId,
                    amount,
                    type: 'CONTRIBUTION',
                    ledgerType: 'COOPERATIVE',
                    direction: 'IN',
                    status: 'SUCCESS',
                    description: `Week ${nextWeek} Contribution${lateFee > 0 ? ' (Late Payment)' : ''}`,
                    reference: `CON-${userId}-WK${nextWeek}-${Date.now()}`
                }
            });

            // 3. Log Company Maintenance Fee
            if (maintenanceFee > 0) {
                await tx.transaction.create({
                    data: {
                        userId,
                        amount: maintenanceFee,
                        type: 'MAINTENANCE_FEE',
                        ledgerType: 'COMPANY',
                        direction: 'IN',
                        status: 'SUCCESS',
                        description: `Week ${nextWeek} Maintenance Fee`,
                        reference: `MNT-${userId}-WK${nextWeek}-${Date.now()}`
                    }
                });
            }

            // 4. Log Late Fee if applicable
            if (lateFee > 0) {
                await tx.transaction.create({
                    data: {
                        userId,
                        amount: lateFee,
                        type: 'LATE_FEE',
                        ledgerType: 'COMPANY',
                        direction: 'IN',
                        status: 'SUCCESS',
                        description: `Week ${nextWeek} Late Payment Fee`,
                        reference: `LATE-${userId}-WK${nextWeek}-${Date.now()}`
                    }
                });
            }

            // 5. Create Contribution Record
            await tx.contribution.create({
                data: {
                    userId,
                    weekNumber: nextWeek,
                    amount,
                    status: lateFee > 0 ? 'LATE' : 'PAID',
                    weekStartDate: weekStart,
                    weekEndDate: weekEnd,
                    paidAt: now,
                    lateFee
                }
            });

            // 6. Create notification
            await tx.notification.create({
                data: {
                    userId,
                    type: 'CONTRIBUTION',
                    title: lateFee > 0 ? 'Late Contribution Processed ⚠️' : 'Contribution Successful ✅',
                    message: `Week ${nextWeek} contribution processed. Amount: ₦${amount.toLocaleString()}${lateFee > 0 ? ` + ₦${lateFee.toLocaleString()} late fee` : ''}`
                }
            });
        });

        res.json({ 
            message: `Week ${nextWeek} contribution successful${lateFee > 0 ? ' (late payment fee applied)' : ''}`, 
            week: nextWeek,
            lateFee,
            totalPaid: totalToDeduct
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Payment failed' });
    }
});

export default router;
