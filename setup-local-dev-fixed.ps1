#!/usr/bin/env pwsh
# UWS Gaming - Complete Local Development Setup
# This script sets up the complete local development environment

Write-Host "🚢 UWS Gaming - Complete Local Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Blue

# Check if Docker is installed
$dockerInstalled = $false
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "✅ Docker is installed: $dockerVersion" -ForegroundColor Green
        $dockerInstalled = $true
    }
} catch {
    Write-Host "❌ Docker is not available" -ForegroundColor Red
}

if (-not $dockerInstalled) {
    Write-Host "📦 Docker is required for local PostgreSQL database" -ForegroundColor Yellow
    Write-Host "Please install Docker Desktop:" -ForegroundColor Yellow
    Write-Host "  1. Run: winget install Docker.DockerDesktop" -ForegroundColor White
    Write-Host "  2. Restart your computer" -ForegroundColor White
    Write-Host "  3. Start Docker Desktop" -ForegroundColor White
    Write-Host "  4. Run this script again" -ForegroundColor White
    exit 1
}

# Check if Docker is running
try {
    docker ps >$null 2>&1
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

Write-Host "`n🗃️ Setting up PostgreSQL database..." -ForegroundColor Blue

# Start PostgreSQL database
Write-Host "Starting PostgreSQL container..." -ForegroundColor Yellow
docker-compose up -d database

# Wait for database to be ready
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
do {
    $attempt++
    Start-Sleep -Seconds 2
    $dbReady = docker-compose exec -T database pg_isready -U uwsgaming -d uwsgaming_dev 2>$null
    if ($dbReady -like "*accepting connections*") {
        Write-Host "✅ Database is ready!" -ForegroundColor Green
        break
    }
    Write-Host "Waiting... ($attempt/$maxAttempts)" -ForegroundColor Yellow
} while ($attempt -lt $maxAttempts)

if ($attempt -eq $maxAttempts) {
    Write-Host "❌ Database failed to start. Please check Docker logs." -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Installing dependencies..." -ForegroundColor Blue
Set-Location "packages/database"
npm install

Write-Host "`n🔧 Running database migration..." -ForegroundColor Blue
npx prisma generate
npx prisma db push

Write-Host "`n🌱 Seeding database with test accounts..." -ForegroundColor Blue
npm run seed

Write-Host "`n🚀 Setting up frontend..." -ForegroundColor Blue
Set-Location "../../apps/frontend"
npm install

Write-Host "`n⚡ Setting up backend..." -ForegroundColor Blue
Set-Location "../backend"
npm install

Write-Host "`n✅ Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Blue

Write-Host "`n🚢 Login Credentials for Testing:" -ForegroundColor Magenta
Write-Host "==================================" -ForegroundColor Blue
Write-Host "Admin Login:" -ForegroundColor Yellow
Write-Host "  Email: admin@uwsgaming.org" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "User Login:" -ForegroundColor Yellow
Write-Host "  Email: user@uwsgaming.org" -ForegroundColor White
Write-Host "  Password: user123" -ForegroundColor White

Write-Host "`n🚀 To start development:" -ForegroundColor Cyan
Write-Host "  Frontend: cd apps/frontend; npm run dev" -ForegroundColor White
Write-Host "  Backend:  cd apps/backend; npm run dev" -ForegroundColor White
Write-Host "  Visit: http://localhost:3000 (frontend)" -ForegroundColor White
Write-Host "  API:   http://localhost:4000 (backend)" -ForegroundColor White

Write-Host "`n📋 Database Management:" -ForegroundColor Cyan
Write-Host "  View data: npx prisma studio" -ForegroundColor White
Write-Host "  Reset DB: npx prisma db push --force-reset" -ForegroundColor White
Write-Host "  Re-seed: npm run seed" -ForegroundColor White
