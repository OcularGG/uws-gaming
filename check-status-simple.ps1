#!/usr/bin/env pwsh
# KrakenGaming - Simple Deployment Status Check

Write-Host "KrakenGaming Deployment Status Check" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Blue

# Check recent builds
Write-Host "Recent Cloud Builds:" -ForegroundColor Magenta
gcloud builds list --limit=10

Write-Host "`nCloud Run Services:" -ForegroundColor Green
gcloud run services list --platform=managed --region=us-central1

Write-Host "`nContainer Images:" -ForegroundColor Blue
gcloud container images list --repository=gcr.io/kraken-gaming

Write-Host "`nService URLs:" -ForegroundColor Cyan
Write-Host "Production: https://krakengaming.org" -ForegroundColor Green
Write-Host "Preview: https://preview.krakengaming.org" -ForegroundColor Yellow

Write-Host "`nStatus check completed!" -ForegroundColor Green
