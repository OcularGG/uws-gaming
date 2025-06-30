# Quick Deploy Script for KrakenGaming
# This script builds and deploys the application to Google Cloud Run

Write-Host "🚀 Quick Deploy to Google Cloud Platform..." -ForegroundColor Cyan

# Configuration
$ProjectId = "uws-gaming"
$Region = "us-central1"

# Set project
Write-Host "📋 Setting project to $ProjectId..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Configure Docker for Artifact Registry
Write-Host "🔧 Configuring Docker authentication..." -ForegroundColor Yellow
gcloud auth configure-docker "$Region-docker.pkg.dev"

# Build and push images
Write-Host "🏗️  Building Docker images..." -ForegroundColor Cyan

# Frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
docker build -t "$Region-docker.pkg.dev/$ProjectId/krakengaming/frontend:latest" -f apps/frontend/Dockerfile .
Write-Host "Pushing frontend..." -ForegroundColor Yellow
docker push "$Region-docker.pkg.dev/$ProjectId/krakengaming/frontend:latest"

# Backend
Write-Host "Building backend..." -ForegroundColor Yellow
docker build -t "$Region-docker.pkg.dev/$ProjectId/krakengaming/backend:latest" -f apps/backend/Dockerfile .
Write-Host "Pushing backend..." -ForegroundColor Yellow
docker push "$Region-docker.pkg.dev/$ProjectId/krakengaming/backend:latest"

# Deploy services
Write-Host "🚀 Deploying services..." -ForegroundColor Cyan

# Deploy backend
Write-Host "Deploying backend..." -ForegroundColor Yellow
gcloud run deploy krakengaming-backend `
    --image="$Region-docker.pkg.dev/$ProjectId/krakengaming/backend:latest" `
    --region=$Region `
    --platform=managed `
    --allow-unauthenticated `
    --port=4000 `
    --memory=1Gi `
    --cpu=1

# Get backend URL and deploy frontend
$backendUrl = gcloud run services describe krakengaming-backend --region=$Region --format="value(status.url)"
Write-Host "Backend URL: $backendUrl" -ForegroundColor Green

Write-Host "Deploying frontend..." -ForegroundColor Yellow
gcloud run deploy krakengaming-frontend `
    --image="$Region-docker.pkg.dev/$ProjectId/krakengaming/frontend:latest" `
    --region=$Region `
    --platform=managed `
    --allow-unauthenticated `
    --port=3000 `
    --memory=1Gi `
    --cpu=1 `
    --set-env-vars="NEXT_PUBLIC_API_URL=$backendUrl"

$frontendUrl = gcloud run services describe krakengaming-frontend --region=$Region --format="value(status.url)"

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host "Frontend: $frontendUrl" -ForegroundColor White
Write-Host "Backend: $backendUrl" -ForegroundColor White
