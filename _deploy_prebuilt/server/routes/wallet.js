import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma/client.js';
import { authenticateToken } from '../middleware/auth.js';
import { initializeTransaction } from '../services/paymentService.js';
import crypto from 'crypto';

const router = express.Router();

// GET /api/wallet - Get Wallet Balances
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { walletBalance: true, contributionBalance: true, bvBalance: true }
        });
        res.json({
            balance: user.walletBalance,
            lockedBalance: user.contributionBalance,
            bvBalance: user.bvBalance
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch wallet' });
    }
});

// POST /api/wallet/fund - Fund Wallet with Paystack
router.post('/fund', authenticateToken, async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

        if (!amount || amount < 100) {
            return res.status(400).json({ error: 'Minimum funding amount is N100' });
        }

        const payment = await initializeTransaction(user.email, amount, {
            userId: user.id,
            purpose: 'WALLET_FUNDING'
        });

        // Log the pending transaction (VIRTUAL ledger)
        await prisma.transaction.create({
            data: {
                userId: user.id,
                type: 'FUNDING',
                ledgerType: 'VIRTUAL',
                direction: 'IN',
                amount: parseFloat(amount),
                status: 'PENDING',
                reference: payment.data.reference,
                description: 'Wallet Funding via Paystack'
            }
        });

        res.json({
            message: 'Payment initialized',
            amount,
            payment_url: payment.data.authorization_url,
            reference: payment.data.reference
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to initiate funding: ' + error.message });
    }
});

// POST /api/wallet/withdraw - Withdraw Funds (Redirects to Withdrawal model for cooperative)
// This endpoint specifically for the VIRTUAL wallet (Operating/Earnings)
router.post('/withdraw', authenticateToken, async (req, res) => {
    try {
        const { amount, bankName, accountNumber, accountName, pin } = req.body;
        const userId = req.user.userId;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user.transactionPin) {
            return res.status(400).json({ error: 'Transaction PIN not set. Please set it in profile settings.' });
        }

        const isPinMatch = await bcrypt.compare(pin, user.transactionPin);
        if (!isPinMatch) {
            return res.status(400).json({ error: 'Incorrect Transaction PIN' });
        }

        if (user.walletBalance < amount) {
            return res.status(400).json({ error: 'Insufficient wallet balance' });
        }

        await prisma.$transaction(async (tx) => {
            // Deduct from wallet
            await tx.user.update({
                where: { id: userId },
                data: {
                    walletBalance: { decrement: amount },
                    bankName,
                    accountNumber,
                    accountName
                }
            });

            // Create Transaction
            await tx.transaction.create({
                data: {
                    userId,
                    amount,
                    type: 'WITHDRAWAL',
                    ledgerType: 'VIRTUAL',
                    direction: 'OUT',
                    status: 'PENDING',
                    description: `Withdrawal from Virtual Wallet to ${bankName}`,
                    reference: `WD-VIRT-${Date.now()}`
                }
            });
        });

        res.json({ message: 'Withdrawal request submitted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Withdrawal failed' });
    }
});

// POST /api/wallet/webhook - Paystack Webhook Handler
router.post('/webhook', async (req, res) => {
    try {
        // Validate Paystack Signature
        const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET || 'sk_test_mock_key')
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== req.headers['x-paystack-signature']) {
            console.warn('Webhook Signature mismatch');
            return res.status(401).send('Unauthorized');
        }

        const event = req.body;
        if (event.event === 'charge.success') {
            const { reference, amount, metadata } = event.data;
            const userId = metadata.userId;

            // Credit User Wallet and Update Transaction
            await prisma.$transaction(async (tx) => {
                const transaction = await tx.transaction.findUnique({ where: { reference } });

                if (transaction && transaction.status === 'PENDING') {
                    // Update Transaction
                    await tx.transaction.update({
                        where: { id: transaction.id },
                        data: { status: 'SUCCESS' }
                    });

                    // Credit User
                    await tx.user.update({
                        where: { id: parseInt(userId) },
                        data: { walletBalance: { increment: amount / 100 } }
                    });
                }
            });
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).send('Webhook Error');
    }
});

export default router;
