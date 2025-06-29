#!/usr/bin/env pwsh

# KrakenGaming Full Production Deployment Script
# This script deploys frontend, backend, and Discord bot to Google Cloud

Write-Host "🚀 Starting KrakenGaming Full Production Deployment..." -ForegroundColor Green

# Set project and region
$PROJECT_ID = "krakengaming"
$REGION = "us-central1"

# Function to test if command succeeded
function Test-LastCommand {
    param($Message)
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed: $Message" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "✅ Success: $Message" -ForegroundColor Green
    }
}

# Set the project
Write-Host "📋 Setting Google Cloud project..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID
Test-LastCommand "Set project to $PROJECT_ID"

# Enable required APIs
Write-Host "🔧 Enabling required Google Cloud APIs..." -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable sqladmin.googleapis.com
Test-LastCommand "Enable APIs"

# Deploy Backend (Production)
Write-Host "🔧 Deploying Backend (Production)..." -ForegroundColor Yellow
gcloud builds submit --config=cloudbuild-backend.yaml .
Test-LastCommand "Backend Production Deployment"

# Deploy Backend (Preview)
Write-Host "🔧 Deploying Backend (Preview)..." -ForegroundColor Yellow
gcloud builds submit --config=cloudbuild-backend-preview.yaml .
Test-LastCommand "Backend Preview Deployment"

# Deploy Frontend (Production)
Write-Host "🌐 Deploying Frontend (Production)..." -ForegroundColor Yellow
gcloud builds submit --config=cloudbuild-frontend.yaml .
Test-LastCommand "Frontend Production Deployment"

# Deploy Frontend (Preview)
Write-Host "🌐 Deploying Frontend (Preview)..." -ForegroundColor Yellow
gcloud builds submit --config=cloudbuild-frontend-preview.yaml .
Test-LastCommand "Frontend Preview Deployment"

# Deploy Discord Bot
Write-Host "🤖 Deploying Discord Bot..." -ForegroundColor Yellow
gcloud builds submit --config=cloudbuild-discord-bot.yaml .
Test-LastCommand "Discord Bot Deployment"

# Set up domain mappings
Write-Host "🌍 Setting up domain mappings..." -ForegroundColor Yellow

# Map production domain
gcloud run domain-mappings create --service=krakengaming-frontend --domain=krakengaming.org --region=$REGION --platform=managed
Test-LastCommand "Map krakengaming.org domain"

# Map preview domain
gcloud run domain-mappings create --service=krakengaming-frontend-preview --domain=preview.krakengaming.org --region=$REGION --platform=managed
Test-LastCommand "Map preview.krakengaming.org domain"

# Map bugs subdomain
gcloud run domain-mappings create --service=krakengaming-frontend --domain=bugs.krakengaming.org --region=$REGION --platform=managed
Test-LastCommand "Map bugs.krakengaming.org domain"

# Register Discord commands
Write-Host "🤖 Registering Discord bot commands..." -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File ".\register-discord-commands.ps1"
Test-LastCommand "Register Discord commands"

# Get service URLs
Write-Host "📊 Getting service URLs..." -ForegroundColor Yellow
$FRONTEND_URL = gcloud run services describe krakengaming-frontend --region=$REGION --format="value(status.url)"
$PREVIEW_URL = gcloud run services describe krakengaming-frontend-preview --region=$REGION --format="value(status.url)"
$BACKEND_URL = gcloud run services describe krakengaming-backend --region=$REGION --format="value(status.url)"
$BACKEND_PREVIEW_URL = gcloud run services describe krakengaming-backend-preview --region=$REGION --format="value(status.url)"
$BOT_URL = gcloud run services describe discord-bot-prod --region=$REGION --format="value(status.url)"

Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "📋 Service URLs:" -ForegroundColor Cyan
Write-Host "  Frontend (Production): $FRONTEND_URL" -ForegroundColor White
Write-Host "  Frontend (Preview): $PREVIEW_URL" -ForegroundColor White
Write-Host "  Backend (Production): $BACKEND_URL" -ForegroundColor White
Write-Host "  Backend (Preview): $BACKEND_PREVIEW_URL" -ForegroundColor White
Write-Host "  Discord Bot: $BOT_URL" -ForegroundColor White
Write-Host ""
Write-Host "🌍 Custom Domains:" -ForegroundColor Cyan
Write-Host "  Production: https://krakengaming.org" -ForegroundColor White
Write-Host "  Preview: https://preview.krakengaming.org" -ForegroundColor White
Write-Host "  Bug Reports: https://bugs.krakengaming.org" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Note: DNS propagation may take up to 24 hours for custom domains" -ForegroundColor Yellow
Write-Host "🔍 Monitor deployment: https://console.cloud.google.com/run?project=$PROJECT_ID" -ForegroundColor Cyan
