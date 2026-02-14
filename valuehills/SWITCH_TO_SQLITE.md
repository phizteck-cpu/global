# 🔄 SWITCH TO SQLITE - EASIER SOLUTION

## 🎯 WHY SQLITE?

MySQL requires:
- ❌ Correct username/password
- ❌ Database creation in Hostinger
- ❌ User permissions setup
- ❌ Complex troubleshooting

SQLite requires:
- ✅ Just a file path
- ✅ No credentials needed
- ✅ Auto-creates database
- ✅ Works immediately

## 📋 STEPS TO SWITCH TO SQLITE

### Step 1: Update Prisma Schema

Edit `backend/prisma/schema.prisma` and change line 7:

**FROM:**
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

**TO:**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 2: Update Environment Variable in Hostinger

1. Go to your Node.js application in Hostinger
2. Click **Environment Variables**
3. Update `DATABASE_URL` to:

```
file:./backend/prisma/prod.db
```

That's it! No username, no password, just a file path.

### Step 3: SSH and Initialize Database

```bash
# SSH into Hostinger
ssh u948761456@your-server -p PORT

# Navigate to app
cd domains/api2.valuehills.shop/public_html

# Generate Prisma client for SQLite
npx prisma generate --schema=backend/prisma/schema.prisma

# Create database and tables
npx prisma db push --schema=backend/prisma/schema.prisma

# Seed with initial data
node backend/prisma/seed.js
```

### Step 4: Restart Application

In Hostinger control panel, click **Restart**

### Step 5: Test

Visit: https://api2.valuehills.shop/api/health

Should see:
```json
{
  "status": "ok",
  "database": "connected"
}
```

## 🔧 ALTERNATIVE: DO IT ALL FROM YOUR LOCAL MACHINE

If you can't SSH, you can make the changes locally and push:

### 1. Edit schema locally:

```bash
# Open backend/prisma/schema.prisma
# Change provider from "mysql" to "sqlite"
```

### 2. Commit and push:

```bash
git add backend/prisma/schema.prisma
git commit -m "Switch to SQLite database"
git push origin main
```

### 3. Update DATABASE_URL in Hostinger:

Go to Environment Variables and set:
```
DATABASE_URL=file:./backend/prisma/prod.db
```

### 4. Wait for auto-deploy, then restart

Hostinger will auto-deploy from GitHub, then click Restart.

### 5. Initialize via Hostinger File Manager:

1. Go to **Files** → **File Manager**
2. Navigate to your app folder
3. Click **Terminal** button at top
4. Run:
```bash
npx prisma db push --schema=backend/prisma/schema.prisma
node backend/prisma/seed.js
```

## 📊 SQLITE VS MYSQL COMPARISON

### SQLite (Recommended for Now):
- ✅ No credentials needed
- ✅ Single file database
- ✅ Perfect for small to medium apps
- ✅ Easy backup (just copy the .db file)
- ✅ Works immediately
- ⚠️ Single writer at a time (fine for most apps)

### MySQL (For Later):
- ✅ Better for high-traffic apps
- ✅ Multiple concurrent writers
- ✅ Better for scaling
- ❌ Requires credentials
- ❌ More complex setup

## 🎯 RECOMMENDATION

**Use SQLite for now** to get your app running quickly. You can always migrate to MySQL later when you have more time to troubleshoot the credentials.

## 🚀 QUICK COMMANDS

If you have SSH access:

```bash
# 1. Edit schema
nano backend/prisma/schema.prisma
# Change line 7: provider = "sqlite"
# Save: Ctrl+O, Enter, Ctrl+X

# 2. Initialize
npx prisma generate --schema=backend/prisma/schema.prisma
npx prisma db push --schema=backend/prisma/schema.prisma
node backend/prisma/seed.js

# 3. Done! Restart app in Hostinger panel
```

## 📝 WHAT CHANGES

**Before (MySQL):**
```env
DATABASE_URL=mysql://u948761456_value1:password@127.0.0.1:3306/u948761456_hills
```

**After (SQLite):**
```env
DATABASE_URL=file:./backend/prisma/prod.db
```

**Schema Before:**
```prisma
provider = "mysql"
```

**Schema After:**
```prisma
provider = "sqlite"
```

---

**This is the fastest way to get your app running!** 🚀

You can switch back to MySQL later if needed.
