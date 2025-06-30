# Redeploy Cloud Run Services with Updated Secrets
param(
    [string]$ProjectId = "uws-gaming",
    [string]$Region = "us-central1"
)

Write-Host "Redeploying Cloud Run services with updated secrets..." -ForegroundColor Cyan
Write-Host "Project: $ProjectId" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow

# Set project
gcloud config set project $ProjectId

# Get current service images
Write-Host "Getting current service information..." -ForegroundColor Cyan

$backendImage = gcloud run services describe krakengaming-backend --region=$Region --format="value(spec.template.spec.template.spec.containers[0].image)" 2>$null
$frontendImage = gcloud run services describe krakengaming-frontend --region=$Region --format="value(spec.template.spec.template.spec.containers[0].image)" 2>$null

if ($backendImage) {
    Write-Host "Found backend service with image: $backendImage" -ForegroundColor Green
} else {
    Write-Host "Backend service not found or not deployed" -ForegroundColor Yellow
}

if ($frontendImage) {
    Write-Host "Found frontend service with image: $frontendImage" -ForegroundColor Green
} else {
    Write-Host "Frontend service not found or not deployed" -ForegroundColor Yellow
}

# Redeploy backend with updated secrets
if ($backendImage) {
    Write-Host "Redeploying backend service..." -ForegroundColor Cyan
    
    gcloud run deploy krakengaming-backend `
        --image=$backendImage `
        --region=$Region `
        --platform=managed `
        --allow-unauthenticated `
        --port=4000 `
        --memory=1Gi `
        --cpu=1 `
        --min-instances=0 `
        --max-instances=10 `
        --set-cloudsql-instances="uws-gaming:$Region`:uws-gaming-db" `
        --set-secrets="DATABASE_URL=database-url-prod:latest" `
        --set-env-vars="NODE_ENV=production,PORT=4000"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Backend redeployed successfully" -ForegroundColor Green
    } else {
        Write-Host "Backend redeployment failed" -ForegroundColor Red
    }
}

# Redeploy frontend with updated secrets
if ($frontendImage) {
    Write-Host "Redeploying frontend service..." -ForegroundColor Cyan
    
    # Get backend URL for frontend env
    $backendUrl = gcloud run services describe krakengaming-backend --region=$Region --format="value(status.url)" 2>$null
    if (!$backendUrl) {
        $backendUrl = "https://krakengaming-backend-default.a.run.app"
    }
    
    gcloud run deploy krakengaming-frontend `
        --image=$frontendImage `
        --region=$Region `
        --platform=managed `
        --allow-unauthenticated `
        --port=3000 `
        --memory=1Gi `
        --cpu=1 `
        --min-instances=0 `
        --max-instances=10 `
        --set-cloudsql-instances="uws-gaming:$Region`:uws-gaming-db" `
        --set-secrets="DATABASE_URL=database-url-prod:latest,NEXTAUTH_SECRET=uws-gaming-nextauth-secret:latest" `
        --set-env-vars="NEXT_PUBLIC_ENVIRONMENT=production,NEXT_PUBLIC_API_URL=$backendUrl,NEXT_PUBLIC_DOMAIN=uwsgaming.org,NODE_ENV=production"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Frontend redeployed successfully" -ForegroundColor Green
    } else {
        Write-Host "Frontend redeployment failed" -ForegroundColor Red
    }
}

Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "Service URLs:" -ForegroundColor Cyan

if ($backendImage) {
    $newBackendUrl = gcloud run services describe krakengaming-backend --region=$Region --format="value(status.url)" 2>$null
    if ($newBackendUrl) {
        Write-Host "Backend: $newBackendUrl" -ForegroundColor Yellow
    }
}

if ($frontendImage) {
    $newFrontendUrl = gcloud run services describe krakengaming-frontend --region=$Region --format="value(status.url)" 2>$null
    if ($newFrontendUrl) {
        Write-Host "Frontend: $newFrontendUrl" -ForegroundColor Yellow
    }
}

Write-Host "" -ForegroundColor White
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test your applications to ensure they work with new credentials" -ForegroundColor Yellow
Write-Host "2. Run database migrations if needed" -ForegroundColor Yellow
Write-Host "3. Monitor application logs for any connection issues" -ForegroundColor Yellow
