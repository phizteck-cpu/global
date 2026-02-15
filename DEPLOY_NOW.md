# 🚀 HOSTINGER DEPLOYMENT - READY TO DEPLOY

## ✅ FIXES APPLIED

1. **Created `server.js`** in root directory - matches Hostinger's Entry file configuration
2. **Updated root `package.json`** - all scripts now reference backend folder correctly
3. **Prisma schema path** - explicitly set to `backend/prisma/schema.prisma`

## 📋 DEPLOYMENT STEPS

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Fix: Add server.js entry point for Hostinger deployment"
git push origin main
```

### Step 2: Hostinger Configuration (Already Set)
Your current configuration is CORRECT:
- ✅ Framework preset: Express
- ✅ Branch: main
- ✅ Node version: 20.x
- ✅ Root directory: ./
- ✅ Entry file: server.js
- ✅ Package manager: npm

### Step 3: Environment Variables in Hostinger
Go to your Hostinger control panel and set these environment variables:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=file:./backend/prisma/prod.db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=https://valuehills.shop
```

### Step 4: After Deployment - Initialize Database via SSH

1. SSH into your Hostinger server
2. Navigate to your project directory
3. Run these commands:

```bash
# Initialize database
npm run init-db

# Or manually:
npx prisma db push --schema=backend/prisma/schema.prisma
node backend/prisma/seed.js
```

### Step 5: Test Your Deployment

Visit these URLs:
- Health check: https://api2.valuehills.shop/api/health
- API base: https://api2.valuehills.shop/api

Expected response from health check:
```json
{
  "status": "ok",
  "timestamp": "2026-02-12T...",
  "environment": "production",
  "database": "connected"
}
```

## 🔧 TROUBLESHOOTING

### If you still get 503 errors:

1. **Check Hostinger logs** in your control panel
2. **Verify environment variables** are set correctly
3. **Check database initialization**:
   ```bash
   # SSH into server
   cd /path/to/your/app
   ls -la backend/prisma/
   # Should see prod.db file
   ```

4. **Manual database setup** if needed:
   ```bash
   npx prisma db push --schema=backend/prisma/schema.prisma --accept-data-loss
   node backend/prisma/seed.js
   ```

### If database connection fails:

The server will automatically try to initialize the database on first start. Check logs for:
- "Database connected successfully" ✅
- "Attempting to initialize database..." ⚠️
- "Running prisma db push..." 🔄

## 📝 WHAT CHANGED

### Before:
- Entry file: `server.js` (didn't exist) ❌
- Root directory: `./`
- Result: 503 error

### After:
- Entry file: `server.js` (now exists) ✅
- Imports: `backend/index.js`
- Result: Should work! 🎉

## 🎯 NEXT STEPS

1. Push code to GitHub
2. Hostinger will auto-deploy from main branch
3. Wait for build to complete
4. SSH in and run `npm run init-db`
5. Test at https://api2.valuehills.shop/api/health

## 📞 SUPPORT

If issues persist, check:
- Hostinger build logs
- Application logs in control panel
- Database file permissions
- Environment variables are set

---

**Status**: Ready to deploy! 🚀
**Last Updated**: 2026-02-12
