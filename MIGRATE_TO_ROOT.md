# 🔄 Migrate Backend to Root Directory

## Quick Migration Steps

### Step 1: Move Backend Files to Root

Run these commands in PowerShell:

```powershell
# Move all backend files to root (excluding node_modules and dist)
Get-ChildItem -Path "backend" -File | Where-Object { $_.Name -ne "node_modules" -and $_.Name -ne "dist" } | ForEach-Object { Copy-Item $_.FullName ".\" -Force }

# Move backend directories
$dirs = @("middleware", "routes", "services", "utils", "scripts", "tests", "uploads", "prisma")
foreach ($dir in $dirs) { if (Test-Path "backend\$dir") { Copy-Item "backend\$dir" ".\" -Recurse -Force } }

# Copy .env files
Copy-Item "backend\.env" ".env" -Force
Copy-Item "backend\.env.local" ".env.local" -Force
Copy-Item "backend\.htaccess" ".htaccess" -Force
```

### Step 2: Update package.json

Replace root `package.json` with:

```json
{
    "name": "valuehills-server",
    "version": "1.0.0",
    "description": "Backend API for Valuehills",
    "main": "index.js",
    "type": "module",
    "scripts": {
        "start": "node index.js",
        "postinstall": "npx prisma generate",
        "dev": "node --watch index.js",
        "test": "cross-env NODE_ENV=test npx prisma db push --force-reset && cross-env NODE_ENV=test jest --runInBand --forceExit",
        "seed": "node prisma/seed.js",
        "init-db": "npx prisma db push && node prisma/seed.js"
    },
    "dependencies": {
        "@prisma/client": "^5.21.1",
        "axios": "^1.13.3",
        "bcryptjs": "^2.4.3",
        "cors": "^2.8.5",
        "crypto": "^1.0.1",
        "dotenv": "^16.4.5",
        "express": "^4.18.3",
        "express-rate-limit": "^7.1.5",
        "express-validator": "^7.3.1",
        "jsonwebtoken": "^9.0.2",
        "multer": "^2.0.2",
        "node-cron": "^4.2.1"
    },
    "prisma": {
        "seed": "node prisma/seed.js"
    },
    "devDependencies": {
        "cross-env": "^10.1.0",
        "jest": "^30.2.0",
        "prisma": "^5.21.1",
        "supertest": "^7.2.2"
    },
    "engines": {
        "node": ">=18.0.0",
        "npm": ">=9.0.0"
    }
}
```

### Step 3: Delete Unnecessary Files

```powershell
# Delete old server.js (no longer needed)
Remove-Item "server.js" -Force

# Optionally, backup and remove old backend directory
# Rename-Item "backend" "backend_old"
```

### Step 4: Install Dependencies

```powershell
npm install
npx prisma generate
```

### Step 5: Test Locally

```powershell
# Test database connection
npx prisma db push

# Seed database
npm run seed

# Start server
npm start
```

Visit: http://localhost:5000/api/health

### Step 6: Update Hostinger Configuration

In Hostinger control panel:
- **Root directory**: `./` (stays the same)
- **Entry file**: `index.js` (change from server.js)
- **Framework**: Express
- **Node version**: 20.x

### Step 7: Push to GitHub

```powershell
git add .
git commit -m "Restructure: Move backend to root, switch to MySQL"
git push origin main
```

### Step 8: Deploy on Hostinger

After deployment, SSH into server:

```bash
cd domains/api2.valuehills.shop/public_html

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Push database schema to MySQL
npx prisma db push

# Seed database
npm run seed

# Restart application
pm2 restart all
```

## What Changed

### File Structure
```
Before:
├── backend/
│   ├── index.js
│   ├── app.js
│   ├── routes/
│   ├── middleware/
│   └── prisma/
├── frontend/
└── server.js (entry point)

After:
├── index.js (entry point)
├── app.js
├── routes/
├── middleware/
├── prisma/
└── frontend/
```

### Database
- **Before**: SQLite (`file:./prisma/dev.db`)
- **After**: MySQL (`mysql://user:pass@localhost:3306/dbname`)

### Configuration
- **Before**: `backend/.env.production`
- **After**: `.env.production` (in root)

## Benefits

1. ✅ Simpler project structure
2. ✅ No need for server.js proxy
3. ✅ MySQL for production (more reliable)
4. ✅ Direct Hostinger compatibility
5. ✅ Easier deployment and maintenance

## Troubleshooting

### If imports break:
- All imports should still work (no path changes needed)
- `./loadEnv.js`, `./app.js`, `./routes/auth.js` all stay the same

### If database connection fails:
- Verify MySQL credentials in `.env.production`
- Check if MySQL database exists in Hostinger
- Test connection: `npx prisma db push`

### If Hostinger deployment fails:
- Check build logs for errors
- Verify `index.js` exists in root
- Ensure `package.json` has correct scripts

## Rollback Plan

If something goes wrong:

```powershell
# Restore from git
git reset --hard HEAD~1

# Or restore from backup
# Rename-Item "backend_old" "backend"
```

---

**Ready to migrate?** Follow the steps above carefully!
