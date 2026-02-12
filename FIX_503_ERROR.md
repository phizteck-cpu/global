# Fix 503 Service Unavailable Error

## Problem
Your backend is returning a 503 error because the database connection is failing. This happens when:
1. The database file doesn't exist
2. Prisma hasn't been initialized
3. The database schema hasn't been pushed

## ✅ Quick Fix (Run These Commands)

### Option 1: Using Platform Console/Shell

Access your deployment platform's console and run:

```bash
# 1. Initialize database
npx prisma db push

# 2. Seed initial data
npm run seed

# 3. Restart the service
# (This happens automatically on most platforms)
```

### Option 2: Redeploy with Updated Code

I've added an automatic database initialization script. Pull the latest code and redeploy:

```bash
git pull origin main
# Then redeploy on your platform
```

The new start script will automatically:
- Check if database exists
- Create it if missing
- Push the schema
- Seed initial data

## Platform-Specific Instructions

### Render.com

1. **Go to your service dashboard**
2. **Click "Shell" tab** (or "Console")
3. **Run these commands**:
   ```bash
   npx prisma db push
   npm run seed
   ```
4. **Restart the service**: Click "Manual Deploy" → "Clear build cache & deploy"

### Railway.app

1. **Open your project**
2. **Click on your service**
3. **Go to "Settings" → "Deploy"**
4. **Add a deploy command**:
   ```bash
   npx prisma db push && npm run seed && npm start
   ```
5. **Redeploy**

### Vercel

1. **Go to your project settings**
2. **Environment Variables** → Add:
   ```
   DATABASE_URL=file:./prisma/dev.db
   ```
3. **Redeploy**

## Manual Database Setup

If the automatic script doesn't work, set up manually:

### Step 1: Access Your Server Console

Most platforms have a shell/console feature. Access it.

### Step 2: Navigate to Backend Directory

```bash
cd backend  # If needed
```

### Step 3: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Create/update database
npx prisma db push

# Seed initial data (tiers, etc.)
npm run seed
```

### Step 4: Create Superadmin

```bash
node create-superadmin.js
```

Follow the prompts to create your admin account.

### Step 5: Restart Service

Most platforms auto-restart. If not:
```bash
# Kill current process
pkill node

# Start again
npm start
```

## Verify Database Connection

### Check Database File Exists

```bash
ls -la prisma/dev.db
```

Should show the database file.

### Test Database Connection

```bash
npx prisma studio
```

This opens a database browser. If it works, your database is fine.

### Check Environment Variables

Make sure these are set:

```env
NODE_ENV=production
DATABASE_URL=file:./prisma/dev.db
PORT=5000
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-key
```

## Debug the 503 Error

### Check Server Logs

Look for these messages:

**Good**:
```
✅ Database initialized successfully
🚀 Server running on port 5000
Database connected successfully
```

**Bad**:
```
❌ Database connection failed
⚠️ Server running in FALLBACK mode
```

### Access Debug Endpoint

Visit: `https://your-domain.com/debug/db`

This will show:
```json
{
  "status": "error",
  "error": "Database connection error message",
  "env": {
    "NODE_ENV": "production",
    "DB_URL_CONFIGURED": true
  }
}
```

## Common Issues and Solutions

### Issue: "Cannot find module '@prisma/client'"

**Solution**:
```bash
npx prisma generate
```

### Issue: "Database file not found"

**Solution**:
```bash
# Create prisma directory if missing
mkdir -p prisma

# Push schema to create database
npx prisma db push
```

### Issue: "Permission denied"

**Solution**:
```bash
# Fix permissions
chmod 755 prisma
chmod 644 prisma/dev.db
```

### Issue: "Schema not found"

**Solution**:
Make sure `prisma/schema.prisma` exists in your backend directory.

### Issue: "Database locked"

**Solution**:
```bash
# Remove lock file
rm prisma/dev.db-journal

# Restart service
```

## Alternative: Use PostgreSQL

If SQLite continues to have issues, switch to PostgreSQL:

### 1. Create PostgreSQL Database

Most platforms offer free PostgreSQL:
- Render: Add PostgreSQL database
- Railway: Add PostgreSQL service
- Heroku: Add Heroku Postgres

### 2. Update DATABASE_URL

```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

### 3. Update schema.prisma

```prisma
datasource db {
  provider = "postgresql"  // Changed from sqlite
  url      = env("DATABASE_URL")
}
```

### 4. Redeploy

```bash
npx prisma db push
npm run seed
```

## Test After Fix

### 1. Health Check

```bash
curl https://your-domain.com/api/health
```

Should return:
```json
{"status":"up","timestamp":"2026-02-12T..."}
```

### 2. Test Signup

Visit: `https://your-domain.com/signup`

Should load the registration form.

### 3. Test API

```bash
curl https://your-domain.com/api/packages
```

Should return tier data.

## Prevention

To avoid this in future deployments:

### 1. Add to Build Command

```bash
npx prisma generate && npx prisma db push
```

### 2. Use Init Script

The updated code now includes `init-db.js` which runs automatically.

### 3. Add Health Checks

Most platforms support health checks. Set:
- **Health Check Path**: `/api/health`
- **Expected Response**: `200 OK`

## Still Getting 503?

### Check These:

1. **Database file exists**: `ls prisma/dev.db`
2. **Prisma generated**: `ls node_modules/@prisma/client`
3. **Environment variables set**: Check platform dashboard
4. **Server logs**: Look for error messages
5. **Port available**: Make sure PORT is set correctly

### Get Detailed Logs

```bash
# Enable debug mode
export DEBUG=*

# Start server
npm start
```

## Success Indicators

You'll know it's fixed when:
- ✅ No 503 errors
- ✅ Health check returns 200
- ✅ Signup page loads
- ✅ API endpoints respond
- ✅ Server logs show "Database connected successfully"

## Need More Help?

1. **Check server logs** - Most important!
2. **Run `npx prisma db push`** - Fixes 90% of issues
3. **Verify environment variables** - Especially DATABASE_URL
4. **Try the debug endpoint** - `/debug/db`
5. **Check platform documentation** - Each platform is different

---

**Quick Command Summary**:
```bash
# Fix 503 in 3 commands:
npx prisma db push
npm run seed
# Restart service (automatic on most platforms)
```

**Last Updated**: February 12, 2026
