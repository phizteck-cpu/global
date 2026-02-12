import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma/client.js';
import { authenticateToken } from '../middleware/auth.js';
import { initializeTransaction } from '../services/paymentService.js';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/payment-proofs';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `proof-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images (JPEG, PNG) and PDF files are allowed'));
        }
    }
});

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

// GET /api/wallet/company-account - Get company bank account for deposits (public for authenticated users)
router.get('/company-account', authenticateToken, async (req, res) => {
    try {
        const bankName = await prisma.systemConfig.findUnique({ where: { key: 'COMPANY_BANK_NAME' } });
        const accountNumber = await prisma.systemConfig.findUnique({ where: { key: 'COMPANY_ACCOUNT_NUMBER' } });
        const accountName = await prisma.systemConfig.findUnique({ where: { key: 'COMPANY_ACCOUNT_NAME' } });

        res.json({
            bankName: bankName?.value || 'Zenith Bank',
            accountNumber: accountNumber?.value || '1010101010',
            accountName: accountName?.value || 'ValueHills Cooperative'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch company account' });
    }
});

// GET /api/wallet/payment-proofs - Get user's payment proof history
router.get('/payment-proofs', authenticateToken, async (req, res) => {
    try {
        const proofs = await prisma.paymentProof.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(proofs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch payment proofs' });
    }
});

// POST /api/wallet/fund - Fund Wallet with Payment Proof Upload
router.post('/fund', authenticateToken, upload.single('proofImage'), async (req, res) => {
    try {
        const { amount, bankName, accountName, transactionRef } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

        if (!amount || amount < 100) {
            return res.status(400).json({ error: 'Minimum funding amount is ₦100' });
        }

        // Check if proof image was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'Payment proof image is required' });
        }

        const proofImageUrl = req.file.path;

        // Create payment proof record
        const paymentProof = await prisma.paymentProof.create({
            data: {
                userId: user.id,
                amount: parseFloat(amount),
                proofImageUrl,
                bankName: bankName || null,
                accountName: accountName || null,
                transactionRef: transactionRef || null,
                status: 'PENDING'
            }
        });

        // Create notification for user
        await prisma.notification.create({
            data: {
                userId: user.id,
                type: 'SYSTEM',
                title: 'Payment Proof Submitted',
                message: `Your payment proof for ₦${parseFloat(amount).toLocaleString()} has been submitted and is awaiting admin approval.`
            }
        });

        res.json({
            message: 'Payment proof submitted successfully. Awaiting admin approval.',
            proofId: paymentProof.id,
            status: 'PENDING'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit payment proof: ' + error.message });
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
