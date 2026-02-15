@echo off
REM Hostinger Database Initialization Script
REM Run this via SSH after deployment

echo.
echo ==========================================
echo Hostinger Database Initialization
echo ==========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this script from the application root directory
    exit /b 1
)

echo Found package.json
echo.

REM Step 1: Generate Prisma Client
echo Step 1: Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Failed to generate Prisma Client
    exit /b 1
)
echo Prisma Client generated
echo.

REM Step 2: Push database schema
echo Step 2: Pushing database schema to MySQL...
call npx prisma db push --accept-data-loss
if errorlevel 1 (
    echo ERROR: Failed to push database schema
    echo Please check:
    echo   - MySQL database exists
    echo   - DATABASE_URL is correct in .env.production
    echo   - MySQL credentials are valid
    exit /b 1
)
echo Database schema created
echo.

REM Step 3: Seed database
echo Step 3: Seeding database with initial data...
call npm run seed
if errorlevel 1 (
    echo Warning: Seeding failed (may already be seeded)
)
echo Database seeded
echo.

REM Step 4: Restart application
echo Step 4: Restarting application...
call pm2 restart all
if errorlevel 1 (
    echo Warning: PM2 restart failed
    echo Please restart manually via Hostinger control panel
)
echo Application restarted
echo.

echo ==========================================
echo Initialization Complete!
echo ==========================================
echo.
echo Test your API:
echo   https://api2.valuehills.shop/api/health
echo   https://api2.valuehills.shop/debug/db
echo.
echo Admin Login:
echo   Username: superadmin
echo   Password: Admin@123
echo.
pause
