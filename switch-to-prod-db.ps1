#!/usr/bin/env pwsh
# Script to switch local development to use production database

Write-Host "🔄 Switching to Production Database..." -ForegroundColor Cyan

# Production database URL
$PROD_DB_URL = "postgresql://prod-user:temp-password-123@34.61.91.149:5432/krakengaming_prod"

# Update frontend .env.local
$frontendEnvPath = "apps/frontend/.env.local"
if (Test-Path $frontendEnvPath) {
    $content = Get-Content $frontendEnvPath
    $newContent = $content -replace 'DATABASE_URL=".*"', "DATABASE_URL=`"$PROD_DB_URL`""
    $newContent | Set-Content $frontendEnvPath
    Write-Host "✅ Updated frontend .env.local" -ForegroundColor Green
}

# Update backend .env
$backendEnvPath = "apps/backend/.env"
if (Test-Path $backendEnvPath) {
    $content = Get-Content $backendEnvPath
    $newContent = $content -replace 'DATABASE_URL=".*"', "DATABASE_URL=`"$PROD_DB_URL`""
    $newContent | Set-Content $backendEnvPath
    Write-Host "✅ Updated backend .env" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Local development is now using the PRODUCTION database!" -ForegroundColor Green
Write-Host "📊 Database: krakengaming_prod" -ForegroundColor White
Write-Host "🌐 Host: 34.61.91.149" -ForegroundColor White
Write-Host "👤 User: prod-user" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  WARNING: Be careful with database changes!" -ForegroundColor Yellow
Write-Host "💡 Run './switch-to-dev-db.ps1' to switch back to local development database" -ForegroundColor Cyan
