#!/usr/bin/env pwsh
# KrakenGaming - Local Development Setup
# This script sets up the local development environment

Write-Host "🏴‍☠️ KrakenGaming Local Development Setup" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Blue

# Navigate to frontend directory
Set-Location "apps/frontend"

# Copy development environment file
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item ".env.development" ".env.local"
    Write-Host "✅ Created .env.local from template" -ForegroundColor Green
    Write-Host "💡 You can edit .env.local to customize your local settings" -ForegroundColor Cyan
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "`n🚀 Starting Development Server..." -ForegroundColor Green
Write-Host "🌐 Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🗃️ PostgreSQL Database: localhost:5432/krakengaming_dev" -ForegroundColor Cyan

Write-Host "`n🎯 Development Features:" -ForegroundColor Magenta
Write-Host "✅ Email-based Authentication - Use real email/password" -ForegroundColor Green
Write-Host "✅ Admin Account: admin@krakengaming.org / admin123" -ForegroundColor Green
Write-Host "✅ User Account: user@krakengaming.org / user123" -ForegroundColor Green
Write-Host "✅ Real Discord OAuth (if configured)" -ForegroundColor Green

Write-Host "`n📋 Quick Test Steps:" -ForegroundColor Blue
Write-Host "1. Start PostgreSQL: docker-compose up -d database" -ForegroundColor White
Write-Host "2. Run database migration: npm run db:migrate" -ForegroundColor White
Write-Host "3. Seed test accounts: npm run db:seed" -ForegroundColor White
Write-Host "4. Visit http://localhost:3000/auth/login to sign in" -ForegroundColor White

Write-Host "`nStarting frontend..." -ForegroundColor Yellow
npm run dev
