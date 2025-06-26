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
Write-Host "🧪 Development login page: http://localhost:3000/dev-login" -ForegroundColor Cyan

Write-Host "`n🎯 Development Features:" -ForegroundColor Magenta
Write-Host "✅ Mock Admin Login - Full admin access" -ForegroundColor Green
Write-Host "✅ Mock User Login - Regular user access" -ForegroundColor Green
Write-Host "✅ Dev Login navigation link (development only)" -ForegroundColor Green
Write-Host "✅ Real Discord OAuth (if configured)" -ForegroundColor Green

Write-Host "`n📋 Quick Test Steps:" -ForegroundColor Blue
Write-Host "1. Visit http://localhost:3000/dev-login" -ForegroundColor White
Write-Host "2. Click 'Login as Admin' to test admin features" -ForegroundColor White
Write-Host "3. Click 'Login as Regular User' to test user features" -ForegroundColor White
Write-Host "4. Navigate around the site to test functionality" -ForegroundColor White

Write-Host "`nStarting frontend..." -ForegroundColor Yellow
npm run dev
