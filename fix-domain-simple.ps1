#!/usr/bin/env pwsh
# KrakenGaming - Fix Domain Mapping
# This script shows how to fix domain mapping to point to correct Cloud Run services

Write-Host "KrakenGaming Domain Mapping Fix" -ForegroundColor Cyan
Write-Host "Project ID: kraken-gaming" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Blue

# Check current services
Write-Host "Current Cloud Run Services:" -ForegroundColor Magenta
gcloud run services list --platform=managed --region=us-central1

Write-Host ""
Write-Host "ISSUE IDENTIFIED:" -ForegroundColor Red
Write-Host "krakengaming.org is likely mapped to the wrong service" -ForegroundColor Yellow
Write-Host ""
Write-Host "SOLUTION:" -ForegroundColor Green
Write-Host "1. Go to: https://console.cloud.google.com/run/domains?project=kraken-gaming" -ForegroundColor White
Write-Host "2. Update or create domain mappings:" -ForegroundColor White
Write-Host "   - krakengaming.org -> krakengaming-frontend" -ForegroundColor Cyan
Write-Host "   - preview.krakengaming.org -> krakengaming-frontend-preview" -ForegroundColor Cyan
Write-Host ""
Write-Host "Current service URLs:" -ForegroundColor Blue
Write-Host "Production: https://krakengaming-frontend-1044201442446.us-central1.run.app" -ForegroundColor White
Write-Host "Preview: https://krakengaming-frontend-preview-1044201442446.us-central1.run.app" -ForegroundColor White
Write-Host ""
Write-Host "After fixing domain mapping, Discord OAuth should work!" -ForegroundColor Green
