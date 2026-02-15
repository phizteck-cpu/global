# 🚨 IMMEDIATE FIX for 503 Error

## What to Do Right Now

### Option 1: Redeploy (Easiest - Automatic Fix)

The latest code includes automatic database initialization. Just redeploy:

1. **Go to your deployment platform**
2. **Click "Redeploy" or "Deploy latest commit"**
3. **Wait for deployment to complete**
4. **Test**: Visit `https://your-domain.com/api/health`

The new code will automatically:
- ✅ Create database if missing
- ✅ Push schema
- ✅ Seed initial data

### Option 2: Manual Fix (If Redeploy Doesn't Work)

#### Step 1: Access Console/Shell

**Render.com**: Dashboard → Your Service → "Shell" tab
**Railway.app**: Project → Service → "Shell" icon
**Vercel**: Not available (use Option 1)

#### Step 2: Run These 2 Commands

```bash
npx prisma db push
npm run seed
```

#### Step 3: Restart

The service will restart automatically. Test with:
```bash
curl https://your-domain.com/api/health
```

## Quick Verification

### ✅ It's Fixed When:

1. **Health check works**:
   ```bash
   curl https://your-domain.com/api/health
   # Returns: {"status":"up","timestamp":"..."}
   ```

2. **Signup page loads**:
   Visit: `https://your-domain.com/signup`

3. **No 503 errors** in browser

### ❌ Still Broken If:

- Health check returns 503
- Signup page shows error
- Server logs show "Database connection failed"

## If Still Getting 503

### Check Server Logs

Look for these messages:

**Good** ✅:
```
✅ Database initialized successfully
🚀 Server running on port 5000
Database connected successfully
```

**Bad** ❌:
```
❌ Database connection failed
⚠️ Server running in FALLBACK mode
```

### Run Debug Command

In your platform's console:

```bash
# Check if database exists
ls -la prisma/dev.db

# If not found, create it:
npx prisma db push
```

## Platform-Specific Quick Fixes

### Render.com

```bash
# In Shell tab:
npx prisma db push && npm run seed
```

Then click: **Manual Deploy** → **Clear build cache & deploy**

### Railway.app

```bash
# In Shell:
npx prisma db push && npm run seed
```

Then: **Settings** → **Redeploy**

### Vercel

Add environment variable:
```
DATABASE_URL=file:./prisma/dev.db
```

Then redeploy.

## Emergency: Switch to PostgreSQL

If SQLite keeps failing, use PostgreSQL:

### 1. Add PostgreSQL Database

- **Render**: Add PostgreSQL database (free tier available)
- **Railway**: Add PostgreSQL service
- **Heroku**: Add Heroku Postgres

### 2. Get Connection String

Copy the DATABASE_URL (looks like):
```
postgresql://user:pass@host:5432/dbname
```

### 3. Update Environment Variable

Replace DATABASE_URL with the PostgreSQL connection string

### 4. Redeploy

The database will be created automatically.

## Test Commands

After fixing, test these:

```bash
# 1. Health check
curl https://your-domain.com/api/health

# 2. Get tiers
curl https://your-domain.com/api/packages

# 3. Company account
curl https://your-domain.com/api/auth/company-account
```

All should return 200 OK with JSON data.

## Success Checklist

- [ ] Redeployed with latest code
- [ ] Health check returns 200
- [ ] Signup page loads
- [ ] No 503 errors
- [ ] Server logs show "Database connected"

## Still Need Help?

### 1. Check Build Logs

Look for errors during build/deploy

### 2. Check Runtime Logs

Look for database connection errors

### 3. Verify Environment Variables

Make sure these are set:
- `NODE_ENV=production`
- `DATABASE_URL=file:./prisma/dev.db`
- `JWT_SECRET=...`
- `JWT_REFRESH_SECRET=...`

### 4. Try Clean Deploy

1. Delete current deployment
2. Create new service
3. Set Root Directory to `backend`
4. Deploy

## Contact Points

- **Render Support**: https://render.com/support
- **Railway Discord**: https://discord.gg/railway
- **Vercel Support**: https://vercel.com/support

---

## TL;DR - Just Do This:

```bash
# In your platform's console/shell:
npx prisma db push && npm run seed

# Then redeploy or restart
```

**That's it!** The 503 should be gone.

---

**Last Updated**: February 12, 2026
**Status**: Fix Deployed ✅
