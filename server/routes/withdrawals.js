import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isFinance } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// POST /withdrawals/approve/:id - Approve Withdrawal
router.post('/approve/:id', authenticateToken, isFinance, async (req, res) => {
    try {
        const { id } = req.params;

        const updatedTx = await prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.findUnique({
                where: { id: parseInt(id) },
                include: { wallet: true }
            });

            if (!transaction || transaction.status !== 'PENDING' || transaction.type !== 'WITHDRAWAL') {
                throw new Error('Invalid or non-pending withdrawal request');
            }

            // Mark as Success
            const successTx = await tx.transaction.update({
                where: { id: transaction.id },
                data: { status: 'SUCCESS' }
            });

            // Log Audit
            await tx.auditLog.create({
                data: {
                    adminId: req.user.userId,
                    action: 'APPROVE_WITHDRAWAL',
                    details: `Approved withdrawal of N${transaction.amount} for Wallet #${transaction.walletId}`,
                    targetUserId: transaction.wallet.userId
                }
            });

            // Notify User
            await tx.notification.create({
                data: {
                    userId: transaction.wallet.userId,
                    title: 'Withdrawal Approved! ✅',
                    message: `Your withdrawal of ₦${transaction.amount.toLocaleString()} has been processed.`
                }
            });

            return successTx;
        });

        res.json({ message: 'Withdrawal approved successfully', data: updatedTx });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

// POST /withdrawals/reject/:id - Reject Withdrawal
router.post('/reject/:id', authenticateToken, isFinance, async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.findUnique({
                where: { id: parseInt(id) },
                include: { wallet: true }
            });

            if (!transaction || transaction.status !== 'PENDING' || transaction.type !== 'WITHDRAWAL') {
                throw new Error('Invalid or non-pending withdrawal request');
            }

            // Refund the wallet balance
            await tx.wallet.update({
                where: { id: transaction.walletId },
                data: { balance: { increment: transaction.amount } }
            });

            // Mark as Failed
            await tx.transaction.update({
                where: { id: transaction.id },
                data: { status: 'FAILED' }
            });

            // Log Audit
            await tx.auditLog.create({
                data: {
                    adminId: req.user.userId,
                    action: 'REJECT_WITHDRAWAL',
                    details: `Rejected & Refunded withdrawal of N${transaction.amount} for Wallet #${transaction.walletId}`,
                    targetUserId: transaction.wallet.userId
                }
            });

            // Notify User
            await tx.notification.create({
                data: {
                    userId: transaction.wallet.userId,
                    title: 'Withdrawal Rejected ❌',
                    message: `Your withdrawal request of ₦${transaction.amount.toLocaleString()} was declined and refunded to your wallet.`
                }
            });
        });

        res.json({ message: 'Withdrawal rejected and refunded' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

export default router;
