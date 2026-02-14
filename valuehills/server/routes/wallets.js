import express from 'express';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      wallet = new Wallet({ userId: req.user._id });
      await wallet.save();
    }
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all', authenticate, authorize('superadmin', 'admin', 'accountant'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const wallets = await Wallet.find()
      .populate('userId', 'name email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    const count = await Wallet.countDocuments();
    const totals = await Wallet.aggregate([
      { $group: { _id: null, totalBalance: { $sum: '$balance' }, totalInvested: { $sum: '$totalInvested' }, totalROI: { $sum: '$totalROI' }, totalWithdrawn: { $sum: '$totalWithdrawn' } } }
    ]);
    res.json({ wallets, totalPages: Math.ceil(count / limit), currentPage: page, total: count, totals: totals[0] || {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/bank-details', authenticate, async (req, res) => {
  try {
    const { bankName, accountNumber, accountName, ifscCode, upiId } = req.body;
    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) { wallet = new Wallet({ userId: req.user._id }); }
    wallet.bankDetails = { bankName, accountNumber, accountName, ifscCode, upiId };
    await wallet.save();
    res.json({ message: 'Bank details updated', wallet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/deposit', authenticate, async (req, res) => {
  try {
    const { amount, transactionId } = req.body;
    if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) { wallet = new Wallet({ userId: req.user._id }); }
    wallet.balance += amount;
    await wallet.save();
    const transaction = new Transaction({ userId: req.user._id, type: 'deposit', amount, status: 'completed', paymentDetails: { transactionId }, description: 'Wallet deposit' });
    await transaction.save();
    res.json({ message: 'Deposit successful', wallet, transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/withdraw', authenticate, async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;
    if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet || wallet.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });
    wallet.balance -= amount;
    wallet.totalWithdrawn += amount;
    await wallet.save();
    const transaction = new Transaction({ userId: req.user._id, type: 'withdrawal', amount, status: 'completed', paymentMethod: 'bank_transfer', paymentDetails: bankDetails, description: 'Wallet withdrawal' });
    await transaction.save();
    res.json({ message: 'Withdrawal successful', wallet, transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
