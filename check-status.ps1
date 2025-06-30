# Check deployment status of KrakenGaming services

Write-Host "Checking KrakenGaming Deployment Status..." -ForegroundColor Cyan

$ProjectId = "uws-gaming"
$Region = "us-central1"

# Set project
gcloud config set project $ProjectId

Write-Host "Cloud Run Services:" -ForegroundColor Yellow
gcloud run services list --region=$Region

Write-Host "`nCloud Build Status:" -ForegroundColor Yellow
gcloud builds list --limit=5

Write-Host "`nCloud SQL Instances:" -ForegroundColor Yellow
gcloud sql instances list

Write-Host "`nArtifact Registry Images:" -ForegroundColor Yellow
gcloud artifacts docker images list us-central1-docker.pkg.dev/$ProjectId/krakengaming 2>$null

# Get service URLs if they exist
$backendUrl = gcloud run services describe uwsgaming-backend --region=$Region --format="value(status.url)" 2>$null
$frontendUrl = gcloud run services describe uwsgaming-frontend --region=$Region --format="value(status.url)" 2>$null

Write-Host "`nService URLs:" -ForegroundColor Green
if ($backendUrl) {
    Write-Host "Backend: $backendUrl" -ForegroundColor White
} else {
    Write-Host "Backend: Not deployed" -ForegroundColor Red
}

if ($frontendUrl) {
    Write-Host "Frontend: $frontendUrl" -ForegroundColor White
} else {
    Write-Host "Frontend: Not deployed" -ForegroundColor Red
}
