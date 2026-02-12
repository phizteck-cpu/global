# 🚀 DEPLOY NOW - Quick Commands

## 1. Push to GitHub (Run these commands)

```bash
git add .
git commit -m "Add Hostinger deployment configuration"
git push origin main
```

## 2. After Hostinger Deploys - Initialize Database

**SSH into your Hostinger server and run:**

```bash
# Navigate to your app directory
cd domains/api2.valuehills.shop/public_html/backend

# Initialize database
npx prisma db push --accept-data-loss

# Create admin user and seed data
npm run seed

# Restart the application
pm2 restart all
```

## 3. Test Your Deployment

Open these URLs in your browser:

1. **Health Check**: https://api2.valuehills.shop/api/health
2. **Root**: https://api2.valuehills.shop/
3. **DB Status**: https://api2.valuehills.shop/debug/db

All should return JSON responses without 503 errors.

## 4. Login to Admin Panel

- **URL**: https://api2.valuehills.shop/api/auth/login
- **Username**: `superadmin`
- **Password**: `Admin@123`

---

## What Changed?

✅ Created `server.js` - Hostinger entry point
✅ Updated `package.json` - Auto-install backend dependencies
✅ Fixed CSP headers - Allow JavaScript execution
✅ Added database auto-initialization
✅ Created `.htaccess` - Hostinger-specific config

## If You Get Errors

### 503 Service Unavailable
- Database not initialized → Run the SSH commands above
- Check Hostinger application logs

### CSP Errors
- `.htaccess` file should override Hostinger's CSP
- If not, contact Hostinger support

### Build Errors
- Check Hostinger build logs
- Verify Node version is 20.x
- Ensure npm install completed

---

**Ready?** Run the git commands above and deploy! 🎉
