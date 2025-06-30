#!/usr/bin/env pwsh
# UWS Gaming - Start Backend Development Server

Write-Host "⚡ UWS Gaming Backend Development Server" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Blue

# Navigate to backend directory
Set-Location "apps/backend"

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creating backend .env.local file..." -ForegroundColor Yellow
    Copy-Item "../../.env.example" ".env.local"
    Write-Host "✅ Created .env.local from template" -ForegroundColor Green
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "`n🚀 Starting Backend Development Server..." -ForegroundColor Green
Write-Host "⚡ Backend API will be available at: http://localhost:4000" -ForegroundColor Cyan
Write-Host "📋 API Documentation: http://localhost:4000/documentation" -ForegroundColor Cyan

Write-Host "`nStarting backend..." -ForegroundColor Yellow
npm run dev
