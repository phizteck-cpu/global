import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String
  },
  propertyType: {
    type: String,
    enum: ['residential', 'commercial', 'land', 'apartment', 'villa'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  area: {
    type: Number,
    required: true
  },
  areaUnit: {
    type: String,
    enum: ['sqft', 'sqm', 'acres', 'bigha'],
    default: 'sqft'
  },
  bedrooms: Number,
  bathrooms: Number,
  images: [{
    url: String,
    isPrimary: Boolean
  }],
  amenities: [String],
  roi: {
    type: Number,
    required: true
  },
  roiType: {
    type: String,
    enum: ['monthly', 'quarterly', 'annually'],
    default: 'monthly'
  },
  paymentPlan: {
    type: String,
    enum: ['one-time', 'installment', 'both'],
    default: 'one-time'
  },
  installmentMonths: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved', 'maintenance'],
    default: 'available'
  },
  featured: {
    type: Boolean,
    default: false
  },
  totalUnits: {
    type: Number,
    default: 1
  },
  availableUnits: {
    type: Number,
    default: 1
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  documents: [{
    name: String,
    url: String
  }]
}, {
  timestamps: true
});

propertySchema.index({ title: 'text', description: 'text', 'location.city': 'text' });

export default mongoose.model('Property', propertySchema);
