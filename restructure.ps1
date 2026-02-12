# PowerShell script to restructure project
# Moves backend files to root directory

Write-Host "🔄 Starting project restructure..." -ForegroundColor Cyan

# 1. Move backend files to root (excluding node_modules and dist)
Write-Host "📦 Moving backend files to root..." -ForegroundColor Yellow

$backendFiles = Get-ChildItem -Path "backend" -Exclude "node_modules","dist","prisma" -File
foreach ($file in $backendFiles) {
    $dest = Join-Path "." $file.Name
    if (Test-Path $dest) {
        Write-Host "  ⚠️  Skipping $($file.Name) (already exists in root)" -ForegroundColor Yellow
    } else {
        Copy-Item $file.FullName $dest
        Write-Host "  ✓ Moved $($file.Name)" -ForegroundColor Green
    }
}

# 2. Move backend directories (excluding node_modules and dist)
Write-Host "📁 Moving backend directories..." -ForegroundColor Yellow

$backendDirs = @("middleware", "routes", "services", "utils", "scripts", "tests", "uploads", "prisma")
foreach ($dir in $backendDirs) {
    $source = Join-Path "backend" $dir
    $dest = Join-Path "." $dir
    
    if (Test-Path $source) {
        if (Test-Path $dest) {
            Write-Host "  ⚠️  Skipping $dir (already exists in root)" -ForegroundColor Yellow
        } else {
            Copy-Item $source $dest -Recurse
            Write-Host "  ✓ Moved $dir/" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "✅ File move complete!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Update .env.production with MySQL credentials"
Write-Host "2. Update prisma/schema.prisma (provider = mysql)"
Write-Host "3. Update package.json scripts"
Write-Host "4. Delete server.js (no longer needed)"
Write-Host "5. Test with: npm install && npx prisma generate"
Write-Host "6. Run: npx prisma db push"
Write-Host ""
