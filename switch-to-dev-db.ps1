#!/usr/bin/env pwsh
# Script to switch local development back to local database

Write-Host "🔄 Switching to Local Development Database..." -ForegroundColor Cyan

$LOCAL_DB_URL = "postgresql://krakengaming:password@localhost:5432/krakengaming_dev"

# Update frontend .env.local
$frontendEnvPath = "apps/frontend/.env.local"
if (Test-Path $frontendEnvPath) {
    $content = Get-Content $frontendEnvPath
    $newContent = $content -replace 'DATABASE_URL=".*"', "DATABASE_URL=`"$LOCAL_DB_URL`""
    $newContent | Set-Content $frontendEnvPath
    Write-Host "✅ Updated frontend .env.local" -ForegroundColor Green
}

# Update backend .env
$backendEnvPath = "apps/backend/.env"
if (Test-Path $backendEnvPath) {
    $content = Get-Content $backendEnvPath
    $newContent = $content -replace 'DATABASE_URL=".*"', "DATABASE_URL=`"$LOCAL_DB_URL`""
    $newContent | Set-Content $backendEnvPath
    Write-Host "✅ Updated backend .env" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Local development is now using the LOCAL database!" -ForegroundColor Green
Write-Host "💡 You can safely test database changes without affecting production" -ForegroundColor Cyan
