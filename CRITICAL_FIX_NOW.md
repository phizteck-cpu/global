# 🚨 CRITICAL: Fix 503 Error NOW

## Your API is returning 503 at: https://api2.valuehills.shop/

## IMMEDIATE ACTION REQUIRED

### Step 1: Access Your Server Console

**You MUST run these commands on your deployment server.**

#### For Render.com:
1. Go to https://dashboard.render.com
2. Click on your service (api2.valuehills.shop)
3. Click the **"Shell"** tab at the top
4. You'll see a terminal

#### For Railway.app:
1. Go to your Railway dashboard
2. Click on your project
3. Click on your service
4. Click the **terminal/shell icon**

#### For Other Platforms:
Look for "Console", "Shell", "Terminal", or "SSH Access"

### Step 2: Run These Commands (COPY & PASTE)

```bash
# Navigate to backend if needed
cd backend 2>/dev/null || true

# Initialize database
npx prisma db push --accept-data-loss

# Seed initial data
npm run seed

# Verify database exists
ls -la prisma/dev.db
```

### Step 3: Restart Your Service

Most platforms restart automatically. If not:

**Render**: Click "Manual Deploy" → "Deploy latest commit"
**Railway**: Service will restart automatically
**Other**: Look for "Restart" button

### Step 4: Test

Visit: https://api2.valuehills.shop/api/health

Should return:
```json
{"status":"up","timestamp":"2026-02-12T..."}
```

## If You Can't Access Console

### Alternative: Redeploy with Build Command

Update your deployment settings:

**Build Command**:
```bash
npm install && npx prisma generate && npx prisma db push --accept-data-loss
```

**Start Command**:
```bash
npm start
```

Then redeploy.

## Verify Environment Variables

Make sure these are set in your deployment platform:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-key-here
```

## Check Server Logs

Look for these messages in your logs:

### Good ✅:
```
Database connected successfully
🚀 Server running on port 5000
```

### Bad ❌:
```
Failed to connect to database
⚠️ Server running in FALLBACK mode
```

If you see the bad message, the database isn't initialized.

## Emergency: Use PostgreSQL Instead

If SQLite keeps failing, switch to PostgreSQL:

### 1. Add PostgreSQL Database

**Render.com**:
- Dashboard → New → PostgreSQL
- Copy the "Internal Database URL"

**Railway.app**:
- Add PostgreSQL service
- Copy the DATABASE_URL

### 2. Update Environment Variable

Replace `DATABASE_URL` with the PostgreSQL connection string:
```
postgresql://user:password@host:5432/database
```

### 3. Update schema.prisma

In `backend/prisma/schema.prisma`, change:
```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 4. Redeploy

The database will be created automatically.

## Still Getting 503?

### Debug Checklist:

1. **Check if database file exists**:
   ```bash
   ls -la prisma/dev.db
   ```
   If not found, run: `npx prisma db push`

2. **Check Prisma Client**:
   ```bash
   ls -la node_modules/@prisma/client
   ```
   If not found, run: `npx prisma generate`

3. **Check environment variables**:
   ```bash
   echo $DATABASE_URL
   echo $NODE_ENV
   ```

4. **Test database connection**:
   ```bash
   npx prisma studio
   ```
   If this works, database is fine.

5. **Check server logs** for specific error messages

## Common Errors and Fixes

### Error: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Error: "Database file not found"
```bash
npx prisma db push
```

### Error: "Permission denied"
```bash
chmod 755 prisma
chmod 644 prisma/dev.db
```

### Error: "Schema not found"
Make sure you're in the backend directory:
```bash
cd backend
ls prisma/schema.prisma
```

## Test After Fix

Run these tests:

```bash
# 1. Health check
curl https://api2.valuehills.shop/api/health

# 2. Get packages/tiers
curl https://api2.valuehills.shop/api/packages

# 3. Company account
curl https://api2.valuehills.shop/api/auth/company-account
```

All should return 200 OK with JSON data.

## Contact Platform Support

If nothing works:

**Render Support**: https://render.com/support
**Railway Discord**: https://discord.gg/railway

Show them:
1. Your server logs
2. The 503 error
3. That you've run `npx prisma db push`

## Success Indicators

You'll know it's fixed when:
- ✅ https://api2.valuehills.shop/api/health returns 200
- ✅ No 503 errors
- ✅ Server logs show "Database connected successfully"
- ✅ You can access the signup page

---

## TL;DR - Just Run This:

```bash
# In your server console:
npx prisma db push --accept-data-loss && npm run seed
```

Then restart your service.

---

**IMPORTANT**: The database MUST be initialized before the server can work. There's no way around this.

**Last Updated**: February 12, 2026
