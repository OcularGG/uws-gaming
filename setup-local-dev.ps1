#!/usr/bin/env pwsh
# UWS Gaming - Complete Local Development Setup
# This script sets up the local development environment with Cloud SQL

Write-Host "UWS Gaming - Local Setup (Cloud SQL)" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Blue

# Check if gcloud is installed
$gcloudInstalled = $false
try {
    # Refresh PATH first
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")

    $gcloudOutput = gcloud version 2>$null
    if ($gcloudOutput -and $gcloudOutput -match "Google Cloud SDK") {
        Write-Host "Google Cloud SDK is installed" -ForegroundColor Green
        $gcloudInstalled = $true
    }
} catch {
    Write-Host "Google Cloud SDK is not available" -ForegroundColor Red
}

if (-not $gcloudInstalled) {
    Write-Host "Google Cloud SDK is required for Cloud SQL access" -ForegroundColor Yellow
    Write-Host "Please install Google Cloud SDK:" -ForegroundColor Yellow
    Write-Host "  1. Run: winget install Google.CloudSDK" -ForegroundColor White
    Write-Host "  2. Restart your terminal" -ForegroundColor White
    Write-Host "  3. Run: gcloud auth login" -ForegroundColor White
    Write-Host "  4. Run: gcloud config set project uws-gaming" -ForegroundColor White
    Write-Host "  5. Run this script again" -ForegroundColor White
    exit 1
}

# Check if authenticated
try {
    $currentProject = gcloud config get-value project 2>$null
    if ($currentProject -ne "uws-gaming") {
        Write-Host "Please set the correct project:" -ForegroundColor Yellow
        Write-Host "  gcloud config set project uws-gaming" -ForegroundColor White
        exit 1
    }
    Write-Host "Authenticated with project: $currentProject" -ForegroundColor Green
} catch {
    Write-Host "Not authenticated. Please run: gcloud auth login" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Connecting to Cloud SQL database..." -ForegroundColor Blue

# Test database connection
Write-Host "Testing Cloud SQL connection..." -ForegroundColor Yellow
try {
    $dbStatus = gcloud sql instances describe uws-gaming-db --format="value(state)" 2>$null
    if ($dbStatus -eq "RUNNABLE") {
        Write-Host "Cloud SQL instance is running!" -ForegroundColor Green
    } else {
        Write-Host "Cloud SQL instance is not running. Status: $dbStatus" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Failed to connect to Cloud SQL. Please check your authentication." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Creating environment files..." -ForegroundColor Blue

# Create frontend .env.local
if (-not (Test-Path "apps/frontend/.env.local")) {
    Copy-Item ".env.example" "apps/frontend/.env.local"
    Write-Host "Created frontend .env.local from template" -ForegroundColor Green
} else {
    Write-Host "Frontend .env.local already exists" -ForegroundColor Green
}

# Create backend .env.local
if (-not (Test-Path "apps/backend/.env.local")) {
    Copy-Item ".env.example" "apps/backend/.env.local"
    Write-Host "Created backend .env.local from template" -ForegroundColor Green
} else {
    Write-Host "Backend .env.local already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Blue
Set-Location "packages/database"
npm install

Write-Host ""
Write-Host "Running database migration..." -ForegroundColor Blue
npx prisma generate
Write-Host "Database schema is already deployed in Cloud SQL" -ForegroundColor Yellow
Write-Host "If you need to update schema, run: npx prisma db push" -ForegroundColor Cyan

Write-Host ""
Write-Host "Setting up frontend..." -ForegroundColor Blue
Set-Location "../../apps/frontend"
npm install

Write-Host ""
Write-Host "Setting up backend..." -ForegroundColor Blue
Set-Location "../backend"
npm install

Write-Host ""
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "===============" -ForegroundColor Blue

Write-Host ""
Write-Host "Login Credentials for Testing:" -ForegroundColor Magenta
Write-Host "=============================" -ForegroundColor Blue
Write-Host "Admin Login:" -ForegroundColor Yellow
Write-Host "  Email: admin@uwsgaming.org" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "User Login:" -ForegroundColor Yellow
Write-Host "  Email: user@uwsgaming.org" -ForegroundColor White
Write-Host "  Password: user123" -ForegroundColor White

Write-Host ""
Write-Host "To start development:" -ForegroundColor Cyan
Write-Host "  Frontend: cd apps/frontend && npm run dev" -ForegroundColor White
Write-Host "  Backend:  cd apps/backend && npm run dev" -ForegroundColor White
Write-Host "  Visit: http://localhost:3000 (frontend)" -ForegroundColor White
Write-Host "  API:   http://localhost:4000 (backend)" -ForegroundColor White

Write-Host ""
Write-Host "Database Management:" -ForegroundColor Cyan
Write-Host "  View data: cd packages/database && npx prisma studio" -ForegroundColor White
Write-Host "  Update schema: cd packages/database && npx prisma db push" -ForegroundColor White
Write-Host "  Cloud SQL Console: https://console.cloud.google.com/sql/instances" -ForegroundColor White
