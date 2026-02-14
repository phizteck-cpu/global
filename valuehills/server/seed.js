import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Property from './models/Property.js';
import Wallet from './models/Wallet.js';

dotenv.config();

const sampleProperties = [
  {
    title: "Sunset Valley Resort",
    description: "Luxury beachfront resort with 50 rooms, spa, and infinity pool. High yield investment opportunity in prime tourist location.",
    propertyType: "residential",
    price: 500000,
    area: 25000,
    areaUnit: "sqft",
    bedrooms: 50,
    bathrooms: 55,
    roi: 18,
    roiType: "monthly",
    paymentPlan: "both",
    installmentMonths: 12,
    status: "available",
    featured: true,
    totalUnits: 100,
    availableUnits: 100,
    location: { city: "Miami", state: "Florida", country: "USA", address: "123 Ocean Drive" },
    amenities: ["Pool", "Spa", "Restaurant", "Gym", "Parking"]
  },
  {
    title: "Downtown Luxury Apartments",
    description: "Modern 30-story residential tower in downtown business district. Premium finishes with city views.",
    propertyType: "apartment",
    price: 250000,
    area: 1200,
    areaUnit: "sqft",
    bedrooms: 2,
    bathrooms: 2,
    roi: 15,
    roiType: "monthly",
    paymentPlan: "both",
    installmentMonths: 24,
    status: "available",
    featured: true,
    totalUnits: 200,
    availableUnits: 150,
    location: { city: "New York", state: "NY", country: "USA", address: "456 Manhattan Ave" },
    amenities: ["Gym", "Concierge", "Rooftop", "Parking", "Security"]
  },
  {
    title: "Tech Park Office Complex",
    description: "Grade A office space in thriving tech hub. Leased to Fortune 500 companies with stable returns.",
    propertyType: "commercial",
    price: 1200000,
    area: 50000,
    areaUnit: "sqft",
    roi: 20,
    roiType: "quarterly",
    paymentPlan: "one-time",
    status: "available",
    featured: true,
    totalUnits: 50,
    availableUnits: 50,
    location: { city: "San Francisco", state: "CA", country: "USA", address: "789 Innovation Blvd" },
    amenities: ["Conference Rooms", "Cafeteria", "High-speed Internet", "24/7 Security"]
  },
  {
    title: "Mountain View Villa",
    description: "Exclusive private villa with panoramic mountain views. Ultra-luxury finishes and privacy.",
    propertyType: "villa",
    price: 850000,
    area: 5500,
    areaUnit: "sqft",
    bedrooms: 5,
    bathrooms: 6,
    roi: 12,
    roiType: "annually",
    paymentPlan: "both",
    installmentMonths: 6,
    status: "available",
    featured: false,
    totalUnits: 10,
    availableUnits: 8,
    location: { city: "Aspen", state: "CO", country: "USA", address: "321 Summit Ridge" },
    amenities: ["Pool", "Hot Tub", "Home Theater", "Wine Cellar", "Garage"]
  },
  {
    title: "Coastal Development Land",
    description: "Prime undeveloped land with approved plans for luxury residential community. High growth potential.",
    propertyType: "land",
    price: 350000,
    area: 5,
    areaUnit: "acres",
    roi: 25,
    roiType: "annually",
    paymentPlan: "one-time",
    status: "available",
    featured: false,
    totalUnits: 25,
    availableUnits: 25,
    location: { city: "Malibu", state: "CA", country: "USA", address: "Ocean View Road" },
    amenities: ["Utilities Available", "Ocean View", "Approved Plans"]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/valuehills');
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Property.deleteMany({});
    await Wallet.deleteMany({});

    const superadmin = await User.create({
      email: 'superadmin@valuehills.com',
      password: 'admin123',
      name: 'Super Admin',
      phone: '+1234567890',
      role: 'superadmin',
      kycStatus: 'verified'
    });

    const admin = await User.create({
      email: 'admin@valuehills.com',
      password: 'admin123',
      name: 'Admin User',
      phone: '+1234567891',
      role: 'admin',
      kycStatus: 'verified'
    });

    const accountant = await User.create({
      email: 'accountant@valuehills.com',
      password: 'admin123',
      name: 'Accountant User',
      phone: '+1234567892',
      role: 'accountant',
      kycStatus: 'verified'
    });

    const frontdesk = await User.create({
      email: 'frontdesk@valuehills.com',
      password: 'admin123',
      name: 'Front Desk',
      phone: '+1234567893',
      role: 'frontdesk',
      kycStatus: 'verified'
    });

    const testUser = await User.create({
      email: 'user@example.com',
      password: 'user123',
      name: 'Test User',
      phone: '+1234567894',
      role: 'user',
      kycStatus: 'verified',
      referralCode: 'VHTEST01'
    });

    await Wallet.create({ userId: testUser._id, balance: 10000, totalInvested: 5000 });

    for (const prop of sampleProperties) {
      await Property.create({ ...prop, createdBy: admin._id });
    }

    console.log('Seed data created successfully!');
    console.log('\nTest Accounts:');
    console.log('Superadmin: superadmin@valuehills.com / admin123');
    console.log('Admin: admin@valuehills.com / admin123');
    console.log('Accountant: accountant@valuehills.com / admin123');
    console.log('Frontdesk: frontdesk@valuehills.com / admin123');
    console.log('User: user@example.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
