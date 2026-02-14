import express from 'express';
import User from '../models/User.js';
import Investment from '../models/Investment.js';
import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/staff', authenticate, authorize('superadmin'), async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['admin', 'accountant', 'frontdesk'] } })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/staff', authenticate, authorize('superadmin'), async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      email,
      password,
      name,
      phone,
      role
    });

    await user.save();

    res.status(201).json({ message: 'Staff created', user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/staff/:id', authenticate, authorize('superadmin'), async (req, res) => {
  try {
    const { name, phone, role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, role, isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Staff updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/staff/:id', authenticate, authorize('superadmin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'superadmin') {
      return res.status(400).json({ message: 'Cannot delete superadmin' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Staff deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/roi/distribute', authenticate, authorize('superadmin', 'admin', 'accountant'), async (req, res) => {
  try {
    const { investmentIds, amount } = req.body;

    if (!investmentIds || !investmentIds.length) {
      return res.status(400).json({ message: 'No investments selected' });
    }

    const investments = await Investment.find({ 
      _id: { $in: investmentIds },
      status: { $in: ['confirmed', 'active'] }
    });

    const transactions = [];
    for (const investment of investments) {
      const userId = investment.userId;
      
      let wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        wallet = new Wallet({ userId });
      }

      wallet.balance += amount;
      wallet.totalROI += amount;
      await wallet.save();

      const transaction = new Transaction({
        userId,
        type: 'roi',
        amount,
        status: 'completed',
        referenceId: investment._id,
        description: `ROI distribution for investment`,
        processedBy: req.user._id,
        processedAt: new Date()
      });
      await transaction.save();

      investment.roiEarned = (investment.roiEarned || 0) + amount;
      await investment.save();

      transactions.push(transaction);
    }

    res.json({ message: 'ROI distributed successfully', count: transactions.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/reports', authenticate, authorize('superadmin', 'accountant'), async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    const match = { status: 'completed' };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }
    if (type) match.type = type;

    const transactions = await Transaction.find(match)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const summary = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({ transactions, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
