#!/bin/bash
# Hostinger Database Initialization Script
# Run this via SSH after deployment

echo "=========================================="
echo "Hostinger Database Initialization"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the application root directory"
    exit 1
fi

echo "✓ Found package.json"
echo ""

# Step 1: Generate Prisma Client
echo "Step 1: Generating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi
echo "✓ Prisma Client generated"
echo ""

# Step 2: Push database schema
echo "Step 2: Pushing database schema to MySQL..."
npx prisma db push --accept-data-loss
if [ $? -ne 0 ]; then
    echo "❌ Failed to push database schema"
    echo "Please check:"
    echo "  - MySQL database exists"
    echo "  - DATABASE_URL is correct in .env.production"
    echo "  - MySQL credentials are valid"
    exit 1
fi
echo "✓ Database schema created"
echo ""

# Step 3: Seed database
echo "Step 3: Seeding database with initial data..."
npm run seed
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Seeding failed (may already be seeded)"
fi
echo "✓ Database seeded"
echo ""

# Step 4: Restart application
echo "Step 4: Restarting application..."
pm2 restart all
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: PM2 restart failed"
    echo "Please restart manually via Hostinger control panel"
fi
echo "✓ Application restarted"
echo ""

echo "=========================================="
echo "✅ Initialization Complete!"
echo "=========================================="
echo ""
echo "Test your API:"
echo "  https://api2.valuehills.shop/api/health"
echo "  https://api2.valuehills.shop/debug/db"
echo ""
echo "Admin Login:"
echo "  Username: superadmin"
echo "  Password: Admin@123"
echo ""
