@echo off
echo.
echo ========================================
echo Valuehills Backend Migration Script
echo ========================================
echo.

if not exist "backend" (
    echo ERROR: backend directory not found!
    exit /b 1
)

echo This script will move backend files to root directory
echo.
set /p confirm="Continue? (y/n): "
if /i not "%confirm%"=="y" (
    echo Migration cancelled
    exit /b 0
)

echo.
echo Step 1: Moving backend files...
echo.

REM Move main files
copy /Y backend\index.js . >nul 2>&1 && echo   Moved index.js
copy /Y backend\app.js . >nul 2>&1 && echo   Moved app.js
copy /Y backend\loadEnv.js . >nul 2>&1 && echo   Moved loadEnv.js
copy /Y backend\package.json . >nul 2>&1 && echo   Moved package.json
copy /Y backend\package-lock.json . >nul 2>&1 && echo   Moved package-lock.json
copy /Y backend\.env . >nul 2>&1 && echo   Moved .env
copy /Y backend\.env.local . >nul 2>&1 && echo   Moved .env.local
copy /Y backend\.env.test . >nul 2>&1 && echo   Moved .env.test
copy /Y backend\.htaccess . >nul 2>&1 && echo   Moved .htaccess

REM Move directories
echo.
echo Moving directories...
xcopy /E /I /Y backend\middleware middleware >nul 2>&1 && echo   Moved middleware/
xcopy /E /I /Y backend\routes routes >nul 2>&1 && echo   Moved routes/
xcopy /E /I /Y backend\services services >nul 2>&1 && echo   Moved services/
xcopy /E /I /Y backend\utils utils >nul 2>&1 && echo   Moved utils/
xcopy /E /I /Y backend\scripts scripts >nul 2>&1 && echo   Moved scripts/
xcopy /E /I /Y backend\tests tests >nul 2>&1 && echo   Moved tests/
xcopy /E /I /Y backend\uploads uploads >nul 2>&1 && echo   Moved uploads/
xcopy /E /I /Y backend\prisma prisma >nul 2>&1 && echo   Moved prisma/

echo.
echo Step 2: Cleaning up...
if exist server.js del /F server.js && echo   Removed server.js
if exist backend rename backend backend_old_backup && echo   Renamed backend to backend_old_backup

echo.
echo Step 3: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    exit /b 1
)

echo.
echo Step 4: Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Prisma generate failed!
    exit /b 1
)

echo.
echo ========================================
echo Migration Complete!
echo ========================================
echo.
echo Next Steps:
echo   1. Test locally: npm start
echo   2. Update Hostinger: Entry file = index.js
echo   3. Push to GitHub
echo   4. Deploy on Hostinger
echo   5. SSH and run: npx prisma db push
echo.
pause
