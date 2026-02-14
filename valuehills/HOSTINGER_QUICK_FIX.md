# 🔧 Hostinger 503 Error - FIXED!

## The Problem
```
❌ Hostinger Config: Root=./, Entry=server.js
❌ Your App: Backend in ./backend/, Entry=index.js
❌ Result: 503 Service Unavailable
```

## The Solution
```
✅ Created: server.js in root directory
✅ This file: Loads and starts ./backend/index.js
✅ Result: Hostinger finds server.js and runs your app!
```

---

## 🚀 Deploy Right Now (3 Steps)

### Step 1: Code is Already Pushed ✅
Your code is on GitHub: https://github.com/phizteck-cpu/global

### Step 2: Deploy on Hostinger
1. Open Hostinger control panel
2. Go to your app (api2.valuehills.shop)
3. Click "Deploy" or wait for auto-deploy
4. ⏳ Wait for build to finish

### Step 3: Initialize Database (MUST DO!)
After deployment, SSH into your server:

```bash
# Connect to server
ssh your-username@your-server

# Go to app directory
cd domains/api2.valuehills.shop/public_html/backend

# Create database
npx prisma db push --accept-data-loss

# Create admin user
npm run seed

# Restart app
pm2 restart all
```

---

## ✅ Test It Works

Open these URLs:

1. **https://api2.valuehills.shop/api/health**
   - Should show: `{"status":"up",...}`

2. **https://api2.valuehills.shop/**
   - Should show: `{"status":"ok","message":"Backend API is running",...}`

3. **https://api2.valuehills.shop/debug/db**
   - Should show: `{"status":"connected",...}`

If all 3 work → 503 error is FIXED! 🎉

---

## 🔐 Admin Login

After database is initialized:
- **Username**: `superadmin`
- **Password**: `Admin@123`

---

## 📋 What Changed in Your Code

### New Files:
- `server.js` - Entry point for Hostinger
- `HOSTINGER_SETUP_COMPLETE.md` - Full deployment guide
- `DEPLOY_NOW.md` - Quick commands
- `FIX_503.txt` - Simple explanation

### Modified Files:
- `package.json` - Added postinstall script
- `backend/app.js` - Fixed CSP headers
- `backend/.htaccess` - Hostinger overrides

---

## ⚠️ Important Notes

1. **Database MUST be initialized** via SSH after first deployment
2. **Without database init**, you'll still get errors
3. **The server.js file** is what fixes the 503 error
4. **Your Hostinger config** doesn't need to change

---

## 🆘 Still Getting 503?

### Check Build Logs
- Look for npm install errors
- Verify "Prisma Client generated" message

### Check Application Logs
- In Hostinger control panel
- Look for "Database connected successfully"

### Verify Database
```bash
ssh your-username@your-server
cd domains/api2.valuehills.shop/public_html/backend
ls -la prisma/dev.db
```
If file doesn't exist → Run `npx prisma db push`

### Restart Application
```bash
pm2 restart all
```
Or use Hostinger control panel restart button

---

## 💡 Pro Tip: Use MySQL Instead

Hostinger provides MySQL databases. For production:

1. Create MySQL database in Hostinger
2. Update `DATABASE_URL` in environment variables:
   ```
   DATABASE_URL="mysql://user:pass@localhost:3306/dbname"
   ```
3. Update `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```
4. Redeploy

MySQL is more reliable than SQLite for production!

---

**Status**: ✅ Code pushed, ready to deploy!
**Next**: Deploy on Hostinger → SSH to initialize DB → Test endpoints
