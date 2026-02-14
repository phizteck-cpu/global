import express from 'express';
import Transaction from '../models/Transaction.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    
    const query = { userId: req.user._id };
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Transaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all', authenticate, authorize('superadmin', 'admin', 'accountant'), async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, userId, startDate, endDate } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (userId) query.userId = userId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('userId', 'name email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Transaction.countDocuments(query);

    const totalAmount = await Transaction.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
      totalAmount: totalAmount[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('userId', 'name email phone');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/deposit', authenticate, async (req, res) => {
  try {
    const { amount, paymentMethod, paymentDetails } = req.body;

    const transaction = new Transaction({
      userId: req.user._id,
      type: 'deposit',
      amount,
      status: 'pending',
      paymentMethod,
      paymentDetails,
      description: 'Wallet deposit'
    });

    await transaction.save();
    res.status(201).json({ message: 'Deposit request submitted', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/withdraw', authenticate, async (req, res) => {
  try {
    const { amount, paymentMethod, paymentDetails } = req.body;

    const transaction = new Transaction({
      userId: req.user._id,
      type: 'withdrawal',
      amount,
      status: 'pending',
      paymentMethod,
      paymentDetails,
      description: 'Wallet withdrawal'
    });

    await transaction.save();
    res.status(201).json({ message: 'Withdrawal request submitted', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/approve', authenticate, authorize('superadmin', 'admin', 'accountant'), async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.status = 'completed';
    transaction.processedBy = req.user._id;
    transaction.processedAt = new Date();
    await transaction.save();

    res.json({ message: 'Transaction approved', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/reject', authenticate, authorize('superadmin', 'admin', 'accountant'), async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.status = 'failed';
    transaction.processedBy = req.user._id;
    transaction.processedAt = new Date();
    await transaction.save();

    res.json({ message: 'Transaction rejected', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
