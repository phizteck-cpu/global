import express from 'express';
import Investment from '../models/Investment.js';
import Property from '../models/Property.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { userId: req.user._id };
    if (status) query.status = status;

    const investments = await Investment.find(query)
      .populate('propertyId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Investment.countDocuments(query);

    res.json({
      investments,
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
    const { page = 1, limit = 10, status, propertyId, userId } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (propertyId) query.propertyId = propertyId;
    if (userId) query.userId = userId;

    const investments = await Investment.find(query)
      .populate('userId', 'name email phone')
      .populate('propertyId', 'title location price')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Investment.countDocuments(query);

    res.json({
      investments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id)
      .populate('propertyId')
      .populate('userId', 'name email phone');
    
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    if (investment.userId._id.toString() !== req.user._id.toString() && 
        !['superadmin', 'admin', 'accountant'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(investment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { propertyId, amount, units, paymentMethod, paymentPlan, installmentMonths, transactionId } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.status !== 'available') {
      return res.status(400).json({ message: 'Property is not available for investment' });
    }

    if (property.availableUnits < units) {
      return res.status(400).json({ message: 'Not enough units available' });
    }

    let installments = [];
    if (paymentPlan === 'installment' && installmentMonths > 0) {
      const installmentAmount = amount / installmentMonths;
      for (let i = 0; i < installmentMonths; i++) {
        installments.push({
          amount: installmentAmount,
          dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000),
          status: i === 0 ? 'pending' : 'pending'
        });
      }
    }

    const investment = new Investment({
      userId: req.user._id,
      propertyId,
      amount,
      units,
      paymentMethod,
      paymentPlan,
      installmentMonths,
      installments,
      transactionId,
      status: 'pending'
    });

    await investment.save();

    const transaction = new Transaction({
      userId: req.user._id,
      type: 'investment',
      amount,
      status: 'pending',
      paymentMethod,
      referenceId: investment._id,
      description: `Investment in ${property.title}`
    });
    await transaction.save();

    res.status(201).json({ message: 'Investment created', investment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/confirm', authenticate, authorize('superadmin', 'admin', 'frontdesk'), async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    investment.status = 'confirmed';
    await investment.save();

    await Property.findByIdAndUpdate(investment.propertyId, {
      $inc: { availableUnits: -investment.units }
    });

    const transaction = await Transaction.findOne({ referenceId: investment._id });
    if (transaction) {
      transaction.status = 'completed';
      await transaction.save();
    }

    const wallet = await Wallet.findOne({ userId: investment.userId });
    if (wallet) {
      wallet.totalInvested += investment.amount;
      await wallet.save();
    }

    res.json({ message: 'Investment confirmed', investment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/cancel', authenticate, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    investment.status = 'cancelled';
    await investment.save();

    res.json({ message: 'Investment cancelled', investment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
