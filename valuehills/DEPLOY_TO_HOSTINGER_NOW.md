# 🚀 DEPLOY TO HOSTINGER NOW

## ✅ What's Done

1. ✅ Backend moved to root directory
2. ✅ MySQL configuration set
3. ✅ Prisma schema updated for MySQL
4. ✅ Dependencies installed locally
5. ✅ Code pushed to GitHub
6. ✅ server.js removed (no longer needed)

## 📋 Hostinger Configuration

Update these settings in your Hostinger control panel:

### Application Settings
- **Root directory**: `./` (no change)
- **Entry file**: `index.js` ⚠️ CHANGE THIS from server.js
- **Framework preset**: Express
- **Node version**: 20.x
- **Package manager**: npm

### Environment Variables
Add these in Hostinger environment variables section:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=mysql://u948761456_videra:Videra@2025@localhost:3306/u948761456_idera
JWT_SECRET=e97a212236164e798ef4133567037042e5f5e522ebdc42c39ac159ebe4ac6a40
FRONTEND_URL=https://valuehills.shop
ADMIN_WALLET_ADDRESS=0x1234567890123456789012345678901234567890
API_ONLY=true
```

## 🔄 Deployment Steps

### Step 1: Update Hostinger Config
1. Go to Hostinger control panel
2. Navigate to your application (api2.valuehills.shop)
3. Click "Settings" or "Configuration"
4. Change **Entry file** from `server.js` to `index.js`
5. Save changes

### Step 2: Deploy
1. Click "Deploy" button in Hostinger
2. Or wait for auto-deployment from GitHub
3. Monitor build logs for any errors

### Step 3: Initialize Database (CRITICAL!)
After deployment completes, SSH into your server:

```bash
# Connect to server
ssh your-username@your-server

# Navigate to app directory
cd domains/api2.valuehills.shop/public_html

# Verify files are there
ls -la

# Install dependencies (if needed)
npm install

# Generate Prisma Client
npx prisma generate

# Push database schema to MySQL
npx prisma db push

# Seed database with initial data
npm run seed

# Restart application
pm2 restart all
```

## ✅ Test Your Deployment

### 1. Health Check
Open in browser:
```
https://api2.valuehills.shop/api/health
```
Expected: `{"status":"up","timestamp":"2026-02-12T..."}`

### 2. Root Endpoint
```
https://api2.valuehills.shop/
```
Expected: `{"status":"ok","message":"Backend API is running",...}`

### 3. Database Status
```
https://api2.valuehills.shop/debug/db
```
Expected: `{"status":"connected","error":null,...}`

### 4. Test Admin Login
Use Postman or curl:
```bash
curl -X POST https://api2.valuehills.shop/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"Admin@123"}'
```

Expected: JWT token in response

## 🔧 Troubleshooting

### Build Fails
- Check Hostinger build logs
- Verify Entry file is set to `index.js`
- Ensure package.json exists in root

### 503 Error After Deployment
- Database not initialized → Run SSH commands above
- Check application logs in Hostinger
- Verify DATABASE_URL environment variable

### Database Connection Error
- Verify MySQL database exists in Hostinger
- Check DATABASE_URL format
- Test: `npx prisma db push`

### "Cannot find module" Errors
```bash
npm install
npx prisma generate
pm2 restart all
```

### Prisma Client Not Generated
```bash
npx prisma generate
pm2 restart all
```

## 📊 What Changed

### Before:
```
Structure: backend/ folder with server.js proxy
Database: SQLite (file:./prisma/dev.db)
Entry: server.js → backend/index.js
```

### After:
```
Structure: Backend in root directory
Database: MySQL (mysql://...)
Entry: index.js (direct)
```

## 🎯 Key Points

1. **Entry file MUST be changed** to `index.js` in Hostinger
2. **Database MUST be initialized** via SSH after first deployment
3. **Environment variables** must be set in Hostinger
4. **MySQL database** must exist in Hostinger (create if needed)

## 📞 Need Help?

### Check Logs
- Hostinger control panel → Application → Logs
- Look for errors during startup
- Check database connection messages

### Common Issues
1. **Entry file wrong**: Change to `index.js`
2. **Database not initialized**: Run `npx prisma db push`
3. **Environment variables missing**: Add them in Hostinger
4. **MySQL database doesn't exist**: Create it in Hostinger

## 🎉 Success Indicators

When everything works:
- ✅ Health endpoint returns 200 OK
- ✅ Root endpoint shows API running
- ✅ Debug endpoint shows database connected
- ✅ Admin login returns JWT token
- ✅ No 503 errors

---

**Ready to deploy?** 
1. Update Hostinger config (Entry file = index.js)
2. Deploy
3. SSH and initialize database
4. Test endpoints

Good luck! 🚀
