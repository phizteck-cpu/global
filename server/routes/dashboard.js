import express from 'express';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Investment from '../models/Investment.js';
import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/user', authenticate, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });
    
    const investments = await Investment.find({ userId: req.user._id, status: 'confirmed' });
    
    const transactions = await Transaction.find({ userId: req.user._id })
      .limit(10)
      .sort({ createdAt: -1 });

    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const activeInvestments = investments.filter(inv => inv.status === 'confirmed').length;
    const totalROI = investments.reduce((sum, inv) => sum + (inv.roiEarned || 0), 0);

    res.json({
      wallet: wallet || { balance: 0, totalInvested: 0, totalROI: 0 },
      stats: {
        totalInvested,
        activeInvestments,
        totalROI,
        totalTransactions: transactions.length
      },
      recentTransactions: transactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/admin', authenticate, authorize('superadmin', 'admin', 'accountant', 'frontdesk'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalProperties,
      totalInvestments,
      totalTransactions,
      recentUsers,
      recentInvestments,
      walletStats
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Property.countDocuments(),
      Investment.countDocuments(),
      Transaction.countDocuments(),
      User.find({ role: 'user' }).select('name email createdAt').limit(5).sort({ createdAt: -1 }),
      Investment.find().populate('userId', 'name').populate('propertyId', 'title').limit(5).sort({ createdAt: -1 }),
      Wallet.aggregate([
        {
          $group: {
            _id: null,
            totalBalance: { $sum: '$balance' },
            totalInvested: { $sum: '$totalInvested' },
            totalROI: { $sum: '$totalROI' }
          }
        }
      ])
    ]);

    const investmentsByStatus = await Investment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);

    const transactionsByType = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$type', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalProperties,
        totalInvestments,
        totalTransactions,
        totalBalance: walletStats[0]?.totalBalance || 0,
        totalInvested: walletStats[0]?.totalInvested || 0,
        totalROI: walletStats[0]?.totalROI || 0
      },
      recentUsers,
      recentInvestments,
      investmentsByStatus,
      transactionsByType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/charts/investments', authenticate, authorize('superadmin', 'admin', 'accountant'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
    else startDate.setFullYear(startDate.getFullYear() - 1);

    const investments = await Investment.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $in: ['confirmed', 'active'] } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/charts/revenue', authenticate, authorize('superadmin', 'admin', 'accountant'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
    else startDate.setFullYear(startDate.getFullYear() - 1);

    const revenue = await Transaction.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate }, 
          status: 'completed',
          type: { $in: ['deposit', 'investment'] }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(revenue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
