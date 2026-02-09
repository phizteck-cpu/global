import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma/client.js';
import { authenticateToken, isFinance } from '../middleware/auth.js';

const router = express.Router();

// GET /withdrawals - List Withdrawal Requests (Admin)
router.get('/', authenticateToken, isFinance, async (req, res) => {
    try {
        const withdrawals = await prisma.withdrawal.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(withdrawals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch withdrawals' });
    }
});

// POST /withdrawals/request - Submit Withdrawal Request
router.post('/request', authenticateToken, async (req, res) => {
    try {
        const { amount, pin } = req.body;
        const userId = req.user.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                tier: true,
                _count: {
                    select: {
                        contributions: { where: { status: 'PAID' } }
                    }
                }
            }
        });

        if (!user.transactionPin) {
            return res.status(400).json({ error: 'Transaction PIN not set. Please set it in profile settings.' });
        }

        const isPinMatch = await bcrypt.compare(pin, user.transactionPin);
        if (!isPinMatch) {
            return res.status(400).json({ error: 'Incorrect Transaction PIN' });
        }

        // 3.5 Eligibility & Lock Logic
        const joinDate = new Date(user.joinDate);
        const lockEndDate = new Date(joinDate.getTime());
        lockEndDate.setMonth(lockEndDate.getMonth() + 7);

        if (new Date() < lockEndDate) {
            return res.status(400).json({ error: 'Lock period active. Withdrawals allowed after 7 months.' });
        }

        if (user._count.contributions < 45) {
            return res.status(400).json({ error: 'Contribution incomplete. 45 weeks required.' });
        }

        if (user.contributionBalance < amount) {
            return res.status(400).json({ error: 'Insufficient cooperative balance.' });
        }

        const withdrawal = await prisma.withdrawal.create({
            data: {
                userId,
                amount,
                status: 'PENDING'
            }
        });

        res.status(201).json(withdrawal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Withdrawal request failed' });
    }
});

// POST /withdrawals/approve/:id - Approve Withdrawal
router.post('/approve/:id', authenticateToken, isFinance, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;

        const updatedWithdrawal = await prisma.$transaction(async (tx) => {
            const withdrawal = await tx.withdrawal.findUnique({
                where: { id: parseInt(id) },
                include: { user: true }
            });

            if (!withdrawal || withdrawal.status !== 'PENDING') {
                throw new Error('Invalid or non-pending withdrawal request');
            }

            const fee = withdrawal.amount * 0.01; // Example 1% fee
            const netAmount = withdrawal.amount - fee;

            // 1. Deduct from Cooperative Balance
            await tx.user.update({
                where: { id: withdrawal.userId },
                data: {
                    contributionBalance: { decrement: withdrawal.amount }
                }
            });

            // 2. Log Cooperative Out Transaction
            await tx.transaction.create({
                data: {
                    userId: withdrawal.userId,
                    amount: withdrawal.amount,
                    type: 'WITHDRAWAL',
                    ledgerType: 'COOPERATIVE',
                    direction: 'OUT',
                    status: 'SUCCESS',
                    description: `Withdrawal of ${withdrawal.amount}`,
                    reference: `WD-OUT-${withdrawal.id}-${Date.now()}`
                }
            });

            // 3. Log Company Fee Income
            if (fee > 0) {
                await tx.transaction.create({
                    data: {
                        userId: withdrawal.userId,
                        amount: fee,
                        type: 'WITHDRAWAL_FEE',
                        ledgerType: 'COMPANY',
                        direction: 'IN',
                        status: 'SUCCESS',
                        description: `Withdrawal Fee for #${withdrawal.id}`,
                        reference: `WD-FEE-${withdrawal.id}-${Date.now()}`
                    }
                });
            }

            // 4. Update Withdrawal Status
            return tx.withdrawal.update({
                where: { id: withdrawal.id },
                data: {
                    status: 'COMPLETED',
                    fee,
                    adminId,
                    processedAt: new Date()
                }
            });
        });

        res.json({ message: 'Withdrawal approved and processed', data: updatedWithdrawal });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

// POST /withdrawals/reject/:id - Reject Withdrawal
router.post('/reject/:id', authenticateToken, isFinance, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.user.userId;

        const withdrawal = await prisma.withdrawal.findUnique({
            where: { id: parseInt(id) }
        });

        if (!withdrawal || withdrawal.status !== 'PENDING') {
            return res.status(400).json({ error: 'Invalid or non-pending withdrawal request' });
        }

        // Reject the withdrawal - no funds deducted
        const updatedWithdrawal = await prisma.withdrawal.update({
            where: { id: parseInt(id) },
            data: {
                status: 'REJECTED',
                adminId,
                processedAt: new Date()
            }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                adminId,
                action: 'WITHDRAWAL_REJECTION',
                details: `Rejected withdrawal ${id}: ${reason || 'No reason provided'}`,
                targetUserId: withdrawal.userId
            }
        });

        res.json({ message: 'Withdrawal rejected', data: updatedWithdrawal });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

export default router;
