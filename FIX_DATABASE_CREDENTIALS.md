# 🔧 FIX DATABASE CREDENTIALS - HOSTINGER

## 🚨 CURRENT ERROR

```
Authentication failed against database server at 127.0.0.1
The provided database credentials for u948761456_value1 are not valid
```

## 📋 PROBLEM

Your app is trying to connect to MySQL database `u948761456_value1` but the credentials are incorrect.

## ✅ SOLUTION - GET CORRECT CREDENTIALS FROM HOSTINGER

### Step 1: Find Your MySQL Database Credentials

1. Log into **Hostinger Control Panel** (hPanel)
2. Go to **Databases** → **MySQL Databases**
3. Find your database (likely named `u948761456_hills` or `u948761456_value1`)
4. Note down:
   - Database Name
   - Database Username
   - Database Password (you may need to reset it if you don't have it)
   - Database Host (usually `127.0.0.1` or `localhost`)

### Step 2: Update Environment Variables in Hostinger

1. Go to your **Node.js application** in Hostinger
2. Click on **Environment Variables**
3. Update or add `DATABASE_URL` with the correct format:

```
DATABASE_URL=mysql://USERNAME:PASSWORD@127.0.0.1:3306/DATABASE_NAME
```

**Example with your current database name:**
```
DATABASE_URL=mysql://u948761456_value1:YOUR_ACTUAL_PASSWORD@127.0.0.1:3306/u948761456_hills
```

**IMPORTANT**: If your password contains special characters, you need to URL-encode them:
- `@` → `%40`
- `$` → `%24`
- `!` → `%21`
- `#` → `%23`
- `%` → `%25`

**Example with special characters:**
If password is `Mega4$v@1`, encode it as: `Mega4%24v%401`

### Step 3: Initialize Database Schema

After setting correct credentials, SSH into your Hostinger server and run:

```bash
# Navigate to your app directory
cd /path/to/your/app

# Push Prisma schema to MySQL database
npx prisma db push --schema=backend/prisma/schema.prisma

# Seed the database with initial data
node backend/prisma/seed.js
```

### Step 4: Restart Your Application

In Hostinger control panel:
1. Go to your Node.js application
2. Click **Restart** button

### Step 5: Test

Visit: https://api2.valuehills.shop/api/health

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

## 🔍 ALTERNATIVE: USE SQLITE INSTEAD OF MYSQL

If you prefer to use SQLite (simpler, no credentials needed):

### Update Environment Variable:
```
DATABASE_URL=file:./backend/prisma/prod.db
```

### Update Prisma Schema:

Edit `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"  // Change from "mysql" to "sqlite"
  url      = env("DATABASE_URL")
}
```

Then run:
```bash
npx prisma db push --schema=backend/prisma/schema.prisma
node backend/prisma/seed.js
```

## 📝 WHICH DATABASE TO USE?

### MySQL (Recommended for Production)
✅ Better performance for multiple users
✅ Better for production workloads
✅ Hostinger provides it
❌ Requires correct credentials

### SQLite (Easier Setup)
✅ No credentials needed
✅ Simpler setup
✅ Good for small to medium apps
❌ Single file database

## 🎯 QUICK FIX CHECKLIST

- [ ] Get correct MySQL credentials from Hostinger
- [ ] Update DATABASE_URL in Hostinger environment variables
- [ ] URL-encode special characters in password
- [ ] SSH into server
- [ ] Run `npx prisma db push --schema=backend/prisma/schema.prisma`
- [ ] Run `node backend/prisma/seed.js`
- [ ] Restart application in Hostinger
- [ ] Test health endpoint

## 📞 NEED HELP?

If you can't find your MySQL credentials:
1. Go to Hostinger → Databases → MySQL Databases
2. Click on your database
3. Use "Reset Password" if needed
4. Copy the new credentials
5. Update DATABASE_URL in environment variables

---

**Next Step**: Get your MySQL credentials from Hostinger and update the DATABASE_URL environment variable.
