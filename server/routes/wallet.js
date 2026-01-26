import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { initializeTransaction } from '../services/paymentService.js';
import crypto from 'crypto';

const prisma = new PrismaClient();
const router = express.Router();

// GET /wallet - Get Wallet Balance
router.get('/', authenticateToken, async (req, res) => {
    try {
        const wallet = await prisma.wallet.findUnique({
            where: { userId: req.user.userId }
        });
        res.json(wallet);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch wallet' });
    }
});

// POST /wallet/fund - Fund Wallet with Paystack
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

        // Log the pending transaction
        const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
        await prisma.transaction.create({
            data: {
                walletId: wallet.id,
                type: 'FUNDING',
                amount: parseFloat(amount),
                status: 'PENDING',
                paymentProvider: 'PAYSTACK',
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

// POST /wallet/withdraw - Withdraw Funds
router.post('/withdraw', authenticateToken, async (req, res) => {
    try {
        const { amount, bankName, accountNumber, accountName } = req.body;
        const userId = req.user.userId;

        const wallet = await prisma.wallet.findUnique({ where: { userId } });

        if (wallet.balance < amount) {
            return res.status(400).json({ error: 'Insufficient wallet balance' });
        }

        await prisma.$transaction(async (tx) => {
            // Deduct from wallet
            await tx.wallet.update({
                where: { userId },
                data: { balance: { decrement: amount } }
            });

            // Create Transaction
            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'WITHDRAWAL',
                    amount,
                    status: 'PENDING',
                    description: `Withdrawal to ${bankName} (${accountNumber})`,
                    reference: `WD-${Date.now()}`
                }
            });
        });

        res.json({ message: 'Withdrawal request submitted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Withdrawal failed' });
    }
});

// POST /wallet/webhook - Paystack Webhook Handler
router.post('/webhook', async (req, res) => {
    try {
        // Validate Paystack Signature
        const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET || 'sk_test_mock_key')
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== req.headers['x-paystack-signature']) {
            // In real world, we would return 401, but for testing or if key is slightly off we log
            console.warn('Webhook Signature mismatch');
            return res.status(401).send('Unauthorized');
        }

        const event = req.body;
        if (event.event === 'charge.success') {
            const { reference, amount, metadata } = event.data;
            const userId = metadata.userId;

            // Credit Wallet and Update Transaction
            await prisma.$transaction(async (tx) => {
                const transaction = await tx.transaction.findUnique({ where: { reference } });

                if (transaction && transaction.status === 'PENDING') {
                    // Update Transaction
                    await tx.transaction.update({
                        where: { id: transaction.id },
                        data: { status: 'SUCCESS' }
                    });

                    // Credit Wallet
                    await tx.wallet.update({
                        where: { userId: parseInt(userId) },
                        data: { balance: { increment: amount / 100 } }
                    });

                    // Notify User (Internal)
                    await tx.notification.create({
                        data: {
                            userId: parseInt(userId),
                            title: 'Wallet Funded! 💸',
                            message: `Your account has been successfully credited with ₦${(amount / 100).toLocaleString()}.`
                        }
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
