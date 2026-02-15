# 🔧 Fix Database Connection Error

## Current Error
```json
{
  "error": "Service Unavailable",
  "message": "Database connection failed",
  "details": "Please contact support or try again later."
}
```

## Root Cause
The MySQL database hasn't been initialized yet. The server is running but can't connect to the database.

## Solution - SSH into Hostinger

### Step 1: Connect to Your Server
```bash
ssh your-username@your-server
```

### Step 2: Navigate to Application Directory
```bash
cd domains/api2.valuehills.shop/public_html
```

### Step 3: Check Environment Variables
```bash
# Check if .env.production exists
cat .env.production

# If it doesn't exist or is wrong, create it:
nano .env.production
```

Paste this content:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL="mysql://u948761456_videra:Videra@2025@localhost:3306/u948761456_idera"
JWT_SECRET=e97a212236164e798ef4133567037042e5f5e522ebdc42c39ac159ebe4ac6a40
FRONTEND_URL=https://valuehills.shop
ADMIN_WALLET_ADDRESS=0x1234567890123456789012345678901234567890
API_ONLY=true
```

Save with: `Ctrl+X`, then `Y`, then `Enter`

### Step 4: Verify MySQL Database Exists
```bash
# Login to MySQL
mysql -u u948761456_videra -p

# Enter password: Videra@2025

# Check if database exists
SHOW DATABASES;

# If u948761456_idera doesn't exist, create it:
CREATE DATABASE u948761456_idera;

# Exit MySQL
exit
```

### Step 5: Initialize Database Schema
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to MySQL
npx prisma db push

# This will create all tables
```

### Step 6: Seed Initial Data
```bash
# Create admin user and initial data
npm run seed
```

### Step 7: Restart Application
```bash
# Restart using PM2
pm2 restart all

# Or restart via Hostinger control panel
```

### Step 8: Test
Open in browser:
```
https://api2.valuehills.shop/api/health
```

Should return:
```json
{"status":"up","timestamp":"2026-02-12T..."}
```

## Alternative: Check Hostinger MySQL Panel

### Option A: Create Database via Hostinger Panel
1. Go to Hostinger control panel
2. Navigate to "Databases" → "MySQL Databases"
3. Check if database `u948761456_idera` exists
4. If not, create it:
   - Database name: `u948761456_idera`
   - User: `u948761456_videra`
   - Password: `Videra@2025`

### Option B: Check Database Credentials
1. In Hostinger MySQL panel, verify:
   - Database name
   - Username
   - Password
   - Host (usually `localhost`)
2. Update `.env.production` if credentials are different

## Troubleshooting

### Error: "Access denied for user"
- Wrong password or username
- Check credentials in Hostinger MySQL panel
- Update `.env.production` with correct credentials

### Error: "Unknown database"
- Database doesn't exist
- Create it via Hostinger panel or MySQL command line

### Error: "Can't connect to MySQL server"
- MySQL service not running
- Contact Hostinger support
- Check if MySQL is enabled for your hosting plan

### Error: "Too many connections"
- Close unused connections
- Restart MySQL service
- Contact Hostinger support

## Quick Fix Commands (All in One)

SSH into server and run:
```bash
cd domains/api2.valuehills.shop/public_html
npx prisma generate
npx prisma db push --accept-data-loss
npm run seed
pm2 restart all
```

Then test: https://api2.valuehills.shop/api/health

## If You Can't SSH

### Use Hostinger File Manager
1. Open Hostinger File Manager
2. Navigate to `domains/api2.valuehills.shop/public_html`
3. Click "Terminal" button (if available)
4. Run the commands above

### Use Hostinger phpMyAdmin
1. Open phpMyAdmin from Hostinger panel
2. Select database `u948761456_idera`
3. Import SQL schema manually (from `prisma/schema.sql`)

## Check Application Logs

In Hostinger control panel:
1. Go to your application
2. Click "Logs" or "Application Logs"
3. Look for database connection errors
4. Check what DATABASE_URL is being used

## Need More Help?

Check the debug endpoint:
```
https://api2.valuehills.shop/debug/db
```

This will show:
- Database connection status
- Environment configuration
- Error details

---

**Most Common Fix**: SSH into server and run:
```bash
cd domains/api2.valuehills.shop/public_html
npx prisma db push
npm run seed
pm2 restart all
```
