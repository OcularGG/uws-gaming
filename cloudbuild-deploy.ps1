# Deploy using Google Cloud Build - No local Docker required
# This script builds images in the cloud and deploys them

Write-Host "🚀 Cloud Build Deployment to Google Cloud Platform..." -ForegroundColor Cyan

# Configuration
$ProjectId = "uws-gaming"
$Region = "us-central1"

# Set project
Write-Host "📋 Setting project to $ProjectId..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Enable required APIs
Write-Host "🔧 Enabling Cloud Build API..." -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Create Artifact Registry repository if it doesn't exist
Write-Host "📦 Setting up Artifact Registry..." -ForegroundColor Yellow
$repoExists = gcloud artifacts repositories describe krakengaming --location=$Region 2>$null
if (!$repoExists) {
    Write-Host "Creating Artifact Registry repository..." -ForegroundColor Yellow
    gcloud artifacts repositories create krakengaming --repository-format=docker --location=$Region --description="KrakenGaming Docker images"
}

# Build images using Cloud Build
Write-Host "🏗️  Building images using Cloud Build..." -ForegroundColor Cyan

# Build backend using Cloud Build
Write-Host "Building backend..." -ForegroundColor Yellow
gcloud builds submit . --config=cloudbuild-backend.yaml --substitutions=_IMAGE_TAG=latest

# Build frontend using Cloud Build
Write-Host "Building frontend..." -ForegroundColor Yellow
gcloud builds submit . --config=cloudbuild-frontend.yaml --substitutions=_IMAGE_TAG=latest

Write-Host "✅ Build completed!" -ForegroundColor Green

# Get service URLs
$backendUrl = gcloud run services describe krakengaming-backend --region=$Region --format="value(status.url)" 2>$null
$frontendUrl = gcloud run services describe krakengaming-frontend --region=$Region --format="value(status.url)" 2>$null

Write-Host "📋 Deployment Summary:" -ForegroundColor Cyan
if ($backendUrl) {
    Write-Host "Backend: $backendUrl" -ForegroundColor Green
} else {
    Write-Host "Backend: Not deployed" -ForegroundColor Red
}

if ($frontendUrl) {
    Write-Host "Frontend: $frontendUrl" -ForegroundColor Green
} else {
    Write-Host "Frontend: Not deployed" -ForegroundColor Red
}

Write-Host "🔐 Admin Login:" -ForegroundColor Yellow
Write-Host "Email: admin@uwsgaming.org" -ForegroundColor White
Write-Host "Password: KG_Admin_2025_de3e3b4e87c10f6e775b6bdcad274ced" -ForegroundColor White
