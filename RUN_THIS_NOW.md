# 🎯 QUICK START - Run This Now!

## Automated Migration (Recommended)

Run this single command in PowerShell:

```powershell
.\migrate-backend.ps1
```

This script will:
- ✅ Move all backend files to root
- ✅ Configure MySQL database
- ✅ Clean up old files
- ✅ Install dependencies
- ✅ Generate Prisma Client

---

## Manual Migration (If script fails)

### 1. Move Files

```powershell
# Copy backend files to root
Copy-Item backend\*.js .\ -Force
Copy-Item backend\*.json .\ -Force
Copy-Item backend\.env* .\ -Force
Copy-Item backend\.htaccess .\ -Force

# Copy directories
Copy-Item backend\middleware .\ -Recurse -Force
Copy-Item backend\routes .\ -Recurse -Force
Copy-Item backend\services .\ -Recurse -Force
Copy-Item backend\utils .\ -Recurse -Force
Copy-Item backend\prisma .\ -Recurse -Force
Copy-Item backend\scripts .\ -Recurse -Force
Copy-Item backend\tests .\ -Recurse -Force
Copy-Item backend\uploads .\ -Recurse -Force
```

### 2. Delete Old Files

```powershell
Remove-Item server.js -Force
Rename-Item backend backend_old_backup
```

### 3. Install

```powershell
npm install
npx prisma generate
```

---

## After Migration

### Test Locally

```powershell
npm start
```

Visit: http://localhost:5000/api/health

### Update Hostinger

In Hostinger control panel:
- **Entry file**: Change from `server.js` to `index.js`
- Everything else stays the same

### Push to GitHub

```powershell
git add .
git commit -m "Migrate backend to root with MySQL"
git push origin main
```

### Deploy on Hostinger

After deployment, SSH into server:

```bash
cd domains/api2.valuehills.shop/public_html
npm install
npx prisma generate
npx prisma db push
npm run seed
pm2 restart all
```

---

## What's Different Now?

### Before:
```
Root: server.js → loads backend/index.js
Database: SQLite
Config: backend/.env.production
```

### After:
```
Root: index.js (direct entry)
Database: MySQL
Config: .env.production (in root)
```

---

## Your MySQL Credentials

Already configured in `.env.production`:

```
DB_HOST=localhost
DB_USER=u948761456_videra
DB_PASSWORD=Videra@2025
DB_NAME=u948761456_idera
```

---

**Ready?** Run `.\migrate-backend.ps1` now!
