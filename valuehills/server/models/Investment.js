import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  units: {
    type: Number,
    default: 1
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'upi', 'card', 'wallet'],
    required: true
  },
  paymentPlan: {
    type: String,
    enum: ['one-time', 'installment'],
    default: 'one-time'
  },
  installmentMonths: {
    type: Number,
    default: 0
  },
  installments: [{
    amount: Number,
    dueDate: Date,
    paidDate: Date,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending'
    },
    transactionId: mongoose.Schema.Types.ObjectId
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String
  },
  roiEarned: {
    type: Number,
    default: 0
  },
  nextROIPayment: {
    type: Date
  },
  referralBonus: {
    type: Number,
    default: 0
  },
  notes: String
}, {
  timestamps: true
});

export default mongoose.model('Investment', investmentSchema);
