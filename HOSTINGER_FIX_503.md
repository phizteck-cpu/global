# Fix 503 Error on Hostinger Cloud Hosting

## Step-by-Step Instructions for Hostinger

### Step 1: Access SSH Terminal

1. **Login to Hostinger**:
   - Go to https://hpanel.hostinger.com
   - Login with your credentials

2. **Access SSH**:
   - Click on your hosting plan
   - Go to **"Advanced"** → **"SSH Access"**
   - Or look for **"Terminal"** or **"SSH"** in the menu

3. **Enable SSH** (if not already enabled):
   - Click "Enable SSH Access"
   - Note your SSH credentials (username, password, port)

4. **Open Terminal**:
   - **Option A**: Use Hostinger's built-in terminal (if available)
   - **Option B**: Use an SSH client like PuTTY (Windows) or Terminal (Mac/Linux)

### Step 2: Connect via SSH

#### Using Hostinger's Built-in Terminal:
- Just click "Open Terminal" or "Launch Terminal"

#### Using External SSH Client:
```bash
# Replace with your actual details
ssh username@your-server-ip -p port-number

# Example:
ssh u123456789@123.45.67.89 -p 65002
```

Enter your password when prompted.

### Step 3: Navigate to Your Application

```bash
# Find your application directory
cd domains/api2.valuehills.shop/public_html

# Or it might be in:
cd public_html/api2.valuehills.shop

# Or:
cd htdocs

# List files to confirm you're in the right place
ls -la
```

You should see your application files (backend folder, package.json, etc.)

### Step 4: Navigate to Backend Directory

```bash
cd backend
```

### Step 5: Run Database Initialization Commands

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Initialize database
npx prisma db push --accept-data-loss

# 4. Seed initial data
npm run seed
```

### Step 6: Verify Database Was Created

```bash
# Check if database file exists
ls -la prisma/dev.db

# Should show something like:
# -rw-r--r-- 1 user user 12288 Feb 12 12:00 prisma/dev.db
```

### Step 7: Restart Node.js Application

#### Option A: Using PM2 (Recommended)
```bash
# If using PM2
pm2 restart all

# Or restart specific app
pm2 restart valuehills-api

# Check status
pm2 status
```

#### Option B: Using Hostinger's Control Panel
1. Go back to Hostinger control panel
2. Find **"Node.js"** section
3. Click **"Restart"** button

#### Option C: Manual Restart
```bash
# Kill existing Node process
pkill node

# Start application
cd backend
npm start &
```

### Step 8: Test

Visit: https://api2.valuehills.shop/api/health

Should return:
```json
{"status":"up","timestamp":"2026-02-12T..."}
```

## If Commands Fail

### Issue: "npm: command not found"

**Solution**: Install Node.js via Hostinger control panel:
1. Go to **"Advanced"** → **"Node.js"**
2. Enable Node.js
3. Select Node.js version 18 or higher
4. Try commands again

### Issue: "Permission denied"

**Solution**: Fix permissions:
```bash
# Fix directory permissions
chmod -R 755 backend

# Fix database permissions
chmod 644 backend/prisma/dev.db
```

### Issue: "Cannot find module"

**Solution**: Install dependencies:
```bash
cd backend
npm install
npx prisma generate
```

### Issue: "Database locked"

**Solution**: Remove lock file:
```bash
rm backend/prisma/dev.db-journal
```

## Hostinger-Specific Configuration

### Set Up Node.js Application

1. **Go to Hostinger Control Panel**
2. **Navigate to**: Advanced → Node.js
3. **Configure**:
   - **Application Mode**: Production
   - **Application Root**: `/domains/api2.valuehills.shop/public_html/backend`
   - **Application Startup File**: `index.js`
   - **Node.js Version**: 18.x or higher

4. **Environment Variables**:
   - Click "Add Variable"
   - Add these:
     ```
     NODE_ENV=production
     PORT=5000
     DATABASE_URL=file:./prisma/dev.db
     JWT_SECRET=your-secret-key-change-this
     JWT_REFRESH_SECRET=your-refresh-key-change-this
     ```

5. **Click "Save"**

### Set Up PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start your application
cd backend
pm2 start index.js --name valuehills-api

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

## Alternative: Use Hostinger's MySQL Database

If SQLite continues to have issues, use MySQL:

### Step 1: Create MySQL Database

1. **Hostinger Control Panel** → **Databases** → **MySQL Databases**
2. **Create New Database**:
   - Database Name: `valuehills_db`
   - Username: Create new user
   - Password: Set strong password
3. **Note the connection details**

### Step 2: Update DATABASE_URL

```env
DATABASE_URL="mysql://username:password@localhost:3306/valuehills_db"
```

### Step 3: Update schema.prisma

```prisma
datasource db {
  provider = "mysql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 4: Redeploy

```bash
npx prisma generate
npx prisma db push
npm run seed
```

## Check Application Logs

```bash
# View PM2 logs
pm2 logs valuehills-api

# View last 50 lines
pm2 logs valuehills-api --lines 50

# View error logs
pm2 logs valuehills-api --err
```

## Verify Everything is Working

### 1. Check Process is Running
```bash
pm2 status
# or
ps aux | grep node
```

### 2. Check Port is Listening
```bash
netstat -tulpn | grep 5000
```

### 3. Test Locally on Server
```bash
curl http://localhost:5000/api/health
```

### 4. Test Externally
```bash
curl https://api2.valuehills.shop/api/health
```

## Common Hostinger Issues

### Issue: Port Already in Use

**Solution**:
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
export PORT=3000
```

### Issue: File Permissions

**Solution**:
```bash
# Fix ownership
chown -R $USER:$USER backend

# Fix permissions
chmod -R 755 backend
chmod 644 backend/prisma/dev.db
```

### Issue: Out of Memory

**Solution**: Upgrade your Hostinger plan or optimize:
```bash
# Limit Node.js memory
node --max-old-space-size=512 index.js
```

## After Successful Fix

### 1. Create Superadmin Account
```bash
cd backend
node create-superadmin.js
```

### 2. Configure Company Bank Account
- Login as superadmin
- Go to Admin → Funding
- Set bank details

### 3. Set Up Automatic Backups
```bash
# Create backup script
nano ~/backup-db.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp ~/domains/api2.valuehills.shop/public_html/backend/prisma/dev.db ~/backups/db_$DATE.db
find ~/backups -name "db_*.db" -mtime +7 -delete
```

Make executable:
```bash
chmod +x ~/backup-db.sh
```

Add to crontab:
```bash
crontab -e
# Add: 0 2 * * * ~/backup-db.sh
```

## Need More Help?

### Hostinger Support
- Live Chat: Available in hPanel
- Email: support@hostinger.com
- Knowledge Base: https://support.hostinger.com

### Check These:
1. Node.js is enabled in control panel
2. Correct Node.js version (18+)
3. Application root path is correct
4. Environment variables are set
5. Database file has correct permissions

---

## Quick Command Summary

```bash
# Connect to SSH
ssh username@server-ip -p port

# Navigate to backend
cd domains/api2.valuehills.shop/public_html/backend

# Initialize database
npx prisma db push --accept-data-loss
npm run seed

# Restart application
pm2 restart all

# Test
curl https://api2.valuehills.shop/api/health
```

---

**Last Updated**: February 12, 2026
**Platform**: Hostinger Cloud Hosting
