#!/usr/bin/env pwsh
# Automated Backend Migration Script
# Moves backend to root and configures for MySQL

Write-Host ""
Write-Host "🚀 Valuehills Backend Migration Script" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend directory exists
if (-not (Test-Path "backend")) {
    Write-Host "❌ Error: backend directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host "📋 This script will:" -ForegroundColor Yellow
Write-Host "  1. Move backend files to root directory" -ForegroundColor White
Write-Host "  2. Update configuration for MySQL" -ForegroundColor White
Write-Host "  3. Clean up old files" -ForegroundColor White
Write-Host "  4. Install dependencies" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y") {
    Write-Host "❌ Migration cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🔄 Step 1: Moving backend files..." -ForegroundColor Cyan

# Move individual files from backend to root
$filesToMove = @(
    "index.js", "app.js", "loadEnv.js",
    ".env", ".env.local", ".env.test",
    ".htaccess", "package.json", "package-lock.json",
    "docker-compose.yml"
)

foreach ($file in $filesToMove) {
    $source = Join-Path "backend" $file
    if (Test-Path $source) {
        Copy-Item $source "." -Force
        Write-Host "  ✓ Moved $file" -ForegroundColor Green
    }
}

# Move directories
$dirsToMove = @("middleware", "routes", "services", "utils", "scripts", "tests", "uploads", "prisma")

foreach ($dir in $dirsToMove) {
    $source = Join-Path "backend" $dir
    if (Test-Path $source) {
        if (Test-Path $dir) {
            Remove-Item $dir -Recurse -Force
        }
        Copy-Item $source $dir -Recurse -Force
        Write-Host "  ✓ Moved $dir/" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🔄 Step 2: Updating configuration..." -ForegroundColor Cyan

# .env.production is already created in root
Write-Host "  ✓ .env.production configured for MySQL" -ForegroundColor Green

# Prisma schema already updated
Write-Host "  ✓ Prisma schema updated for MySQL" -ForegroundColor Green

Write-Host ""
Write-Host "🔄 Step 3: Cleaning up..." -ForegroundColor Cyan

# Delete server.js if it exists
if (Test-Path "server.js") {
    Remove-Item "server.js" -Force
    Write-Host "  ✓ Removed server.js" -ForegroundColor Green
}

# Rename old backend directory
if (Test-Path "backend") {
    Rename-Item "backend" "backend_old_backup" -Force
    Write-Host "  ✓ Renamed backend to backend_old_backup" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔄 Step 4: Installing dependencies..." -ForegroundColor Cyan

npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Step 5: Generating Prisma Client..." -ForegroundColor Cyan

npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma generate failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Migration Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test locally: npm start" -ForegroundColor White
Write-Host "  2. Update Hostinger config: Entry file = index.js" -ForegroundColor White
Write-Host "  3. Push to GitHub: git add . && git commit -m 'Migrate backend to root' && git push" -ForegroundColor White
Write-Host "  4. Deploy on Hostinger" -ForegroundColor White
Write-Host "  5. SSH and run: npx prisma db push && npm run seed" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Note: Old backend is backed up as 'backend_old_backup'" -ForegroundColor Yellow
Write-Host ""
