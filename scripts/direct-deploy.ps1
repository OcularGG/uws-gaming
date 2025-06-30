#!/usr/bin/env pwsh
# UWS Gaming Direct Deployment Script
# Uses Cloud Build to deploy frontend and backend to Google Cloud Run

param(
    [string]$Component = "all"  # "frontend", "backend", or "all"
)

# Configuration
$PROJECT_ID = "uws-gaming"
$REGION = "us-central1"

# Colors for output
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = $Reset)
    Write-Host "${Color}${Message}${Reset}"
}

function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Validate prerequisites
Write-ColorOutput "🔍 Validating prerequisites..." $Blue

if (!(Test-Command "gcloud")) {
    Write-ColorOutput "❌ gcloud CLI not found. Please install Google Cloud SDK." $Red
    exit 1
}

# Check authentication
$currentProject = gcloud config get-value project 2>$null
if ($currentProject -ne $PROJECT_ID) {
    Write-ColorOutput "⚙️ Setting project to $PROJECT_ID..." $Yellow
    gcloud config set project $PROJECT_ID
}

Write-ColorOutput "✅ Prerequisites validated" $Green

# Deploy using Cloud Build
function Deploy-Frontend {
    Write-ColorOutput "`n🚀 Deploying Frontend using Cloud Build..." $Blue

    # Create production environment variables for Cloud Build
    $frontendEnvVars = @"
NODE_ENV=production
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_DOMAIN=uwsgaming.org
NEXT_PUBLIC_API_URL=https://uwsgaming-backend-1089166264123.us-central1.run.app
NEXT_PUBLIC_APP_NAME=UWS Gaming
DATABASE_URL=postgresql://uwsgaming:Adm1nP@ss2024!@34.63.231.8:5432/uwsgaming
NEXTAUTH_URL=https://uwsgaming.org
NEXTAUTH_SECRET=your-production-nextauth-secret-key-here
"@

    Write-ColorOutput "Submitting frontend build to Cloud Build..." $Yellow

    $result = gcloud builds submit . --config=cloudbuild-frontend.yaml --substitutions="_FRONTEND_ENV_VARS=$frontendEnvVars" 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✅ Frontend deployed successfully" $Green

        # Get the frontend URL
        $frontendUrl = gcloud run services describe uwsgaming-frontend --region=$REGION --format="value(status.url)" 2>$null
        if ($frontendUrl) {
            Write-ColorOutput "🌐 Frontend URL: $frontendUrl" $Blue
        }
    } else {
        Write-ColorOutput "❌ Frontend deployment failed" $Red
        Write-ColorOutput $result $Red
        return $false
    }
    return $true
}

function Deploy-Backend {
    Write-ColorOutput "`n🚀 Deploying Backend using Cloud Build..." $Blue

    Write-ColorOutput "Submitting backend build to Cloud Build..." $Yellow

    $result = gcloud builds submit . --config=cloudbuild-backend.yaml 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✅ Backend deployed successfully" $Green

        # Get the backend URL
        $backendUrl = gcloud run services describe uwsgaming-backend --region=$REGION --format="value(status.url)" 2>$null
        if ($backendUrl) {
            Write-ColorOutput "🌐 Backend URL: $backendUrl" $Blue
        }
    } else {
        Write-ColorOutput "❌ Backend deployment failed" $Red
        Write-ColorOutput $result $Red
        return $false
    }
    return $true
}

# Main deployment logic
Write-ColorOutput "🚢 UWS Gaming Direct Deployment" $Blue
Write-ColorOutput "================================" $Blue
Write-ColorOutput "Using Cloud Build for deployment" $Yellow

$success = $true

switch ($Component.ToLower()) {
    "frontend" {
        $success = Deploy-Frontend
    }
    "backend" {
        $success = Deploy-Backend
    }
    "all" {
        $success = Deploy-Backend
        if ($success) {
            $success = Deploy-Frontend
        }
    }
    default {
        Write-ColorOutput "❌ Invalid component: $Component. Use 'frontend', 'backend', or 'all'" $Red
        exit 1
    }
}

if ($success) {
    Write-ColorOutput "`n🎉 Deployment completed successfully!" $Green
    Write-ColorOutput "🔍 Check your services:" $Blue
    Write-ColorOutput "   Console: https://console.cloud.google.com/run?project=$PROJECT_ID" $Blue
    Write-ColorOutput "   Frontend: https://uwsgaming.org" $Blue
    Write-ColorOutput "   Backend:  https://uwsgaming-backend-1089166264123.us-central1.run.app" $Blue
    Write-ColorOutput "`n✨ Ready for production!" $Green
} else {
    Write-ColorOutput "`n❌ Deployment failed!" $Red
    exit 1
}
