import express from 'express';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, kycStatus, search } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (kycStatus) query.kycStatus = kycStatus;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      users,
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
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/kyc', authenticate, async (req, res) => {
  try {
    const { idCard, proofOfAddress } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        kycDocuments: {
          idCard,
          proofOfAddress,
          submittedAt: new Date()
        },
        kycStatus: 'pending'
      },
      { new: true }
    ).select('-password');

    res.json({ message: 'KYC documents submitted', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/kyc/verify', authenticate, authorize('superadmin', 'admin', 'frontdesk'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { kycStatus: status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `KYC ${status}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/role', authenticate, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const { role } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Role updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/status', authenticate, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User ${isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/referrals/my', authenticate, async (req, res) => {
  try {
    const referrals = await User.find({ referredBy: req.user._id })
      .select('name email phone createdAt');

    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
