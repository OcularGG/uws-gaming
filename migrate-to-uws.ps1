#!/usr/bin/env pwsh
# UWS Gaming Migration Script - Complete project migration from KrakenGaming to UWS Gaming

Write-Host "🚀 Starting UWS Gaming Migration..." -ForegroundColor Cyan
Write-Host "📂 This will migrate from KrakenGaming to UWS Gaming" -ForegroundColor White
Write-Host ""

# Configuration
$OLD_PROJECT = "kraken-gaming"
$NEW_PROJECT = "uws-gaming"
$OLD_DOMAIN = "krakengaming.org"
$NEW_DOMAIN = "uwsgaming.org"
$OLD_REPO = "KrakenGaming"
$NEW_REPO = "https://github.com/OcularGG/uws-gaming"
$NEW_REPO_NAME = "uws-gaming"

Write-Host "📋 Migration Configuration:" -ForegroundColor Yellow
Write-Host "  From: $OLD_PROJECT → $NEW_PROJECT" -ForegroundColor White
Write-Host "  Domain: $OLD_DOMAIN → $NEW_DOMAIN" -ForegroundColor White
Write-Host "  Repo: Local → $NEW_REPO" -ForegroundColor White
Write-Host ""

# Step 1: Backup current project
Write-Host "💾 Creating backup of current project..." -ForegroundColor Cyan
$backupDir = "../krakengaming-backup-$(Get-Date -Format 'yyyy-MM-dd-HH-mm')"
Copy-Item -Recurse -Force "." $backupDir -Exclude @(".git", "node_modules", ".next", "dist", "build")
Write-Host "✅ Backup created at: $backupDir" -ForegroundColor Green

# Step 2: Initialize new git repository for UWS Gaming
Write-Host "🔧 Setting up new repository..." -ForegroundColor Cyan
Remove-Item -Recurse -Force ".git" -ErrorAction SilentlyContinue
git init
git remote add origin $NEW_REPO
Write-Host "✅ New git repository initialized" -ForegroundColor Green

Write-Host ""
Write-Host "🎯 Next steps to complete manually:" -ForegroundColor Yellow
Write-Host "1. Run the branding update script: .\update-branding.ps1" -ForegroundColor White
Write-Host "2. Update environment variables and secrets" -ForegroundColor White
Write-Host "3. Create new database in uws-gaming project" -ForegroundColor White
Write-Host "4. Deploy to new infrastructure" -ForegroundColor White
Write-Host "5. Set up uwsgaming.org domain" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Migration preparation complete!" -ForegroundColor Green
