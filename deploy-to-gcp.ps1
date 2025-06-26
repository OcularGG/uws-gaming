#!/usr/bin/env pwsh
# KrakenGaming - Deploy to Google Cloud Platform
# This script deploys the entire application stack to GCP production and preview environments

param(
    [string]$Environment = "both",  # Options: production, preview, both
    [switch]$SkipBuild = $false,
    [switch]$SkipTests = $false,
    [string]$ProjectId = "kraken-gaming"
)

Write-Host "🚀 KrakenGaming GCP Deployment Script" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Project ID: $ProjectId" -ForegroundColor Yellow

# Set error action preference
$ErrorActionPreference = "Stop"

# Verify prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Blue

# Check if gcloud is installed and configured
try {
    $currentProject = gcloud config get-value project 2>$null
    if ($currentProject -ne $ProjectId) {
        Write-Host "Setting Google Cloud project to $ProjectId" -ForegroundColor Yellow
        gcloud config set project $ProjectId
    }
} catch {
    Write-Error "Google Cloud SDK not found or not configured. Please install and configure gcloud CLI."
    exit 1
}

# Check authentication
try {
    $authAccount = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
    if (-not $authAccount) {
        Write-Error "Not authenticated with Google Cloud. Run 'gcloud auth login' first."
        exit 1
    }
    Write-Host "✅ Authenticated as: $authAccount" -ForegroundColor Green
} catch {
    Write-Error "Failed to check authentication status."
    exit 1
}

# Enable required APIs if not already enabled
Write-Host "🔧 Ensuring required APIs are enabled..." -ForegroundColor Blue
$requiredApis = @(
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "containerregistry.googleapis.com",
    "secretmanager.googleapis.com"
)

foreach ($api in $requiredApis) {
    Write-Host "Enabling $api..." -ForegroundColor Gray
    gcloud services enable $api --quiet
}

# Build and test (if not skipped)
if (-not $SkipBuild) {
    Write-Host "🔨 Building application..." -ForegroundColor Blue
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed"
        exit 1
    }
}

if (-not $SkipTests) {
    Write-Host "🧪 Running tests..." -ForegroundColor Blue
    npm run test
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Tests failed, but continuing deployment..."
    }
}

# Function to deploy a service
function Deploy-Service {
    param(
        [string]$ServiceName,
        [string]$ConfigFile,
        [string]$Environment
    )

    Write-Host "🚀 Deploying $ServiceName to $Environment..." -ForegroundColor Magenta

    try {
        gcloud builds submit --config=$ConfigFile --substitutions=_ENVIRONMENT=$Environment .
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $ServiceName deployed successfully to $Environment" -ForegroundColor Green
        } else {
            Write-Error "❌ Failed to deploy $ServiceName to $Environment"
            return $false
        }
    } catch {
        Write-Error "❌ Exception during $ServiceName deployment: $_"
        return $false
    }

    return $true
}

# Deploy to Production
if ($Environment -eq "production" -or $Environment -eq "both") {
    Write-Host "🌟 Starting Production Deployment..." -ForegroundColor Cyan

    $productionServices = @(
        @{ Name = "Frontend"; Config = "cloudbuild-frontend.yaml" },
        @{ Name = "Backend"; Config = "cloudbuild-backend.yaml" },
        @{ Name = "Discord Bot"; Config = "cloudbuild-discord-bot.yaml" }
    )

    $productionSuccess = $true
    foreach ($service in $productionServices) {
        if (-not (Deploy-Service -ServiceName $service.Name -ConfigFile $service.Config -Environment "production")) {
            $productionSuccess = $false
        }
        Start-Sleep -Seconds 5  # Brief pause between deployments
    }

    if ($productionSuccess) {
        Write-Host "🎉 Production deployment completed successfully!" -ForegroundColor Green
        Write-Host "🌐 Production URL: https://krakengaming.org" -ForegroundColor Cyan
    } else {
        Write-Warning "⚠️ Some production services failed to deploy"
    }
}

# Deploy to Preview
if ($Environment -eq "preview" -or $Environment -eq "both") {
    Write-Host "🔍 Starting Preview Deployment..." -ForegroundColor Cyan

    $previewServices = @(
        @{ Name = "Frontend Preview"; Config = "cloudbuild-frontend-preview.yaml" },
        @{ Name = "Backend Preview"; Config = "cloudbuild-backend-preview.yaml" }
    )

    $previewSuccess = $true
    foreach ($service in $previewServices) {
        if (-not (Deploy-Service -ServiceName $service.Name -ConfigFile $service.Config -Environment "preview")) {
            $previewSuccess = $false
        }
        Start-Sleep -Seconds 5  # Brief pause between deployments
    }

    if ($previewSuccess) {
        Write-Host "🎉 Preview deployment completed successfully!" -ForegroundColor Green
        Write-Host "🌐 Preview URL: https://preview.krakengaming.org" -ForegroundColor Cyan
    } else {
        Write-Warning "⚠️ Some preview services failed to deploy"
    }
}

# Get deployment status
Write-Host "📊 Deployment Status Summary:" -ForegroundColor Blue
Write-Host "=============================" -ForegroundColor Blue

try {
    Write-Host "Cloud Run Services:" -ForegroundColor Yellow
    gcloud run services list --platform=managed --region=us-central1 --format='table(metadata.name,status.url,status.conditions.status)'

    Write-Host "`nContainer Images:" -ForegroundColor Yellow
    gcloud container images list --repository=gcr.io/$ProjectId --format='table(name,tags)'
} catch {
    Write-Warning "Could not retrieve deployment status"
}

Write-Host "✨ Deployment script completed!" -ForegroundColor Green
Write-Host "📝 Check the Google Cloud Console for detailed logs and monitoring" -ForegroundColor Cyan
