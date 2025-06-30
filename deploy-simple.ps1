# UWS Gaming Direct Deployment Script
# Uses Cloud Build to deploy frontend and backend to Google Cloud Run

param(
    [string]$Component = "all"
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

# Check authentication
Write-ColorOutput "Checking Google Cloud authentication..." $Blue
$currentProject = gcloud config get-value project 2>$null
if ($currentProject -ne $PROJECT_ID) {
    Write-ColorOutput "Setting project to $PROJECT_ID..." $Yellow
    gcloud config set project $PROJECT_ID
}

Write-ColorOutput "Prerequisites validated" $Green

# Deploy Backend
function Start-BackendDeploy {
    Write-ColorOutput "Deploying Backend using Cloud Build..." $Blue

    Write-ColorOutput "Submitting backend build to Cloud Build..." $Yellow

    $result = gcloud builds submit . --config=cloudbuild-backend.yaml

    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "Backend deployed successfully" $Green
        return $true
    } else {
        Write-ColorOutput "Backend deployment failed" $Red
        return $false
    }
}

# Deploy Frontend
function Start-FrontendDeploy {
    Write-ColorOutput "Deploying Frontend using Cloud Build..." $Blue

    Write-ColorOutput "Submitting frontend build to Cloud Build..." $Yellow

    $result = gcloud builds submit . --config=cloudbuild-frontend.yaml

    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "Frontend deployed successfully" $Green
        return $true
    } else {
        Write-ColorOutput "Frontend deployment failed" $Red
        return $false
    }
}

# Main deployment logic
Write-ColorOutput "UWS Gaming Direct Deployment" $Blue
Write-ColorOutput "Using Cloud Build for deployment" $Yellow

$success = $true

switch ($Component.ToLower()) {
    "frontend" {
        $success = Start-FrontendDeploy
    }
    "backend" {
        $success = Start-BackendDeploy
    }
    "all" {
        $success = Start-BackendDeploy
        if ($success) {
            $success = Start-FrontendDeploy
        }
    }
    default {
        Write-ColorOutput "Invalid component: $Component. Use 'frontend', 'backend', or 'all'" $Red
        exit 1
    }
}

if ($success) {
    Write-ColorOutput "Deployment completed successfully!" $Green
    Write-ColorOutput "Check your services:" $Blue
    Write-ColorOutput "Console: https://console.cloud.google.com/run?project=$PROJECT_ID" $Blue
    Write-ColorOutput "Ready for production!" $Green
} else {
    Write-ColorOutput "Deployment failed!" $Red
    exit 1
}
