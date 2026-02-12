# ✅ Hostinger Deployment - Ready to Deploy

## Current Configuration Status

Your Hostinger build configuration is now compatible:
- ✅ Framework preset: Express
- ✅ Branch: main
- ✅ Node version: 20.x
- ✅ Root directory: `./` (project root)
- ✅ Entry file: `server.js` (NOW CREATED)
- ✅ Package manager: npm

## What Was Fixed

1. **Created `server.js` Entry Point**
   - Hostinger expects `server.js` in the root directory
   - This file loads and starts the backend application
   - No need to change Hostinger configuration

2. **Automatic Database Initialization**
   - Backend will attempt to initialize database on first run
   - Falls back gracefully if initialization fails

3. **CSP Headers Configuration**
   - Fixed Content Security Policy to allow JavaScript execution
   - Added `.htaccess` file for Hostinger-specific overrides

## Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add Hostinger entry point and deployment fixes"
git push origin main
```

### Step 2: Deploy on Hostinger
1. Go to your Hostinger control panel
2. Navigate to your application (api2.valuehills.shop)
3. Click "Deploy" or wait for auto-deployment
4. Monitor the build logs

### Step 3: Initialize Database (CRITICAL)
After deployment completes, you MUST initialize the database:

**Option A: Via Hostinger SSH (Recommended)**
```bash
# SSH into your server
ssh your-username@your-server

# Navigate to application directory
cd domains/api2.valuehills.shop/public_html

# Navigate to backend
cd backend

# Initialize database
npx prisma db push --accept-data-loss

# Seed initial data (admin user, etc.)
npm run seed

# Restart application
pm2 restart all
# OR use Hostinger control panel to restart
```

**Option B: Via Hostinger File Manager**
1. Open Hostinger File Manager
2. Navigate to `domains/api2.valuehills.shop/public_html/backend`
3. Open Terminal from File Manager
4. Run the commands above

### Step 4: Verify Deployment
Test these endpoints:

1. **Health Check**
   ```
   https://api2.valuehills.shop/api/health
   ```
   Should return: `{"status":"up","timestamp":"..."}`

2. **Root Endpoint**
   ```
   https://api2.valuehills.shop/
   ```
   Should return: `{"status":"ok","message":"Backend API is running",...}`

3. **Database Debug**
   ```
   https://api2.valuehills.shop/debug/db
   ```
   Should return: `{"status":"connected","error":null,...}`

## Environment Variables

Ensure these are set in Hostinger:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_WALLET_ADDRESS=0x1234567890123456789012345678901234567890
```

## Troubleshooting

### If you still get 503 error:

1. **Check Build Logs**
   - Look for any npm install errors
   - Verify Prisma Client was generated

2. **Check Application Logs**
   - In Hostinger control panel, view application logs
   - Look for database connection errors

3. **Verify Database File**
   - SSH into server
   - Check if `backend/prisma/dev.db` exists
   - If not, run `npx prisma db push`

4. **Check File Permissions**
   ```bash
   chmod -R 755 backend/prisma
   chmod 666 backend/prisma/dev.db
   ```

5. **Restart Application**
   - Use Hostinger control panel
   - Or via SSH: `pm2 restart all`

### If CSP errors persist:

1. Verify `.htaccess` file exists in `backend/` directory
2. Check if Hostinger allows `.htaccess` overrides
3. Contact Hostinger support to disable restrictive CSP

## Alternative: Use MySQL Instead of SQLite

Hostinger provides MySQL databases. For better production performance:

1. **Create MySQL Database in Hostinger**
   - Go to Databases section
   - Create new MySQL database
   - Note: database name, username, password, host

2. **Update DATABASE_URL**
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/database_name"
   ```

3. **Update Prisma Schema**
   In `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```

4. **Redeploy**
   ```bash
   git add .
   git commit -m "Switch to MySQL"
   git push origin main
   ```

## Next Steps After Successful Deployment

1. **Test Registration Flow**
   - Create test user account
   - Upload payment proof
   - Verify admin approval workflow

2. **Test Admin Login**
   - Username: `superadmin`
   - Password: `Admin@123`

3. **Configure Frontend**
   - Update frontend API URL to `https://api2.valuehills.shop`
   - Deploy frontend to main domain

4. **Security Checklist**
   - Change default admin password
   - Update JWT_SECRET
   - Enable HTTPS only
   - Configure CORS for your frontend domain

## Support

If you encounter issues:
1. Check application logs in Hostinger control panel
2. Test endpoints with curl or Postman
3. Verify database was initialized
4. Check file permissions

---

**Status**: Ready to deploy! Push to GitHub and deploy on Hostinger.
