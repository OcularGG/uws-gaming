#!/usr/bin/env pwsh
# UWS Gaming - Start Local Development with Cloud SQL
# This script starts both frontend and backend development servers

Write-Host "🚢 UWS Gaming Development Server Startup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Blue

# Check if setup has been run
if (-not (Test-Path "apps/frontend/.env.local") -or -not (Test-Path "apps/backend/.env.local")) {
    Write-Host "❌ Environment files not found. Please run setup first:" -ForegroundColor Red
    Write-Host "   .\setup-local-dev.ps1" -ForegroundColor Yellow
    exit 1
}

# Check Cloud SQL connection
Write-Host "`n🗃️ Verifying Cloud SQL connection..." -ForegroundColor Blue
try {
    $dbStatus = gcloud sql instances describe uws-gaming-db --format="value(state)" 2>$null
    if ($dbStatus -eq "RUNNABLE") {
        Write-Host "✅ Cloud SQL instance is running!" -ForegroundColor Green
    } else {
        Write-Host "❌ Cloud SQL instance is not running. Status: $dbStatus" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Failed to connect to Cloud SQL. Please check: gcloud auth login" -ForegroundColor Red
    exit 1
}

Write-Host "`n📝 Setting up environment files..." -ForegroundColor Yellow

# Create frontend .env.local if it doesn't exist
if (-not (Test-Path "apps/frontend/.env.local")) {
    Copy-Item ".env.example" "apps/frontend/.env.local"
    Write-Host "✅ Created frontend .env.local from template" -ForegroundColor Green
} else {
    Write-Host "✅ Frontend .env.local already exists" -ForegroundColor Green
}

# Create backend .env.local if it doesn't exist
if (-not (Test-Path "apps/backend/.env.local")) {
    Copy-Item ".env.example" "apps/backend/.env.local"
    Write-Host "✅ Created backend .env.local from template" -ForegroundColor Green
} else {
    Write-Host "✅ Backend .env.local already exists" -ForegroundColor Green
}

Write-Host "`n🚀 Starting Development Servers..." -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "⚡ Backend:  http://localhost:4000" -ForegroundColor Cyan
Write-Host "🗃️ Database: Cloud SQL (uwsgaming_prod)" -ForegroundColor Cyan

Write-Host "`n🎯 Development Features:" -ForegroundColor Magenta
Write-Host "✅ Email-based Authentication - Use real email/password" -ForegroundColor Green
Write-Host "✅ Admin Account: admin@uwsgaming.org / admin123" -ForegroundColor Green
Write-Host "✅ User Account: user@uwsgaming.org / user123" -ForegroundColor Green

Write-Host "`n📋 Available Commands:" -ForegroundColor Blue
Write-Host "Frontend: cd apps/frontend && npm run dev" -ForegroundColor White
Write-Host "Backend:  cd apps/backend && npm run dev" -ForegroundColor White
Write-Host "Database: cd packages/database && npx prisma studio" -ForegroundColor White

# Start both servers using PowerShell jobs
Write-Host "`nStarting backend..." -ForegroundColor Yellow
Start-Job -Name "UWSBackend" -ScriptBlock {
    Set-Location "apps/backend"
    npm run dev
}

Write-Host "Starting frontend..." -ForegroundColor Yellow
Set-Location "apps/frontend"
npm run dev
