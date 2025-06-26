#!/usr/bin/env pwsh
# Krak# Get actual service URLs from Cloud Run
Write-Host "`n📍 Actual Cloud Run URLs:" -ForegroundColor Magenta
$services = gcloud run services list --platform=managed --region=us-central1 --format='value(metadata.name,status.url)' 2>$null
if ($services) {
    foreach ($service in $services) {
        $parts = $service -split "`t"
        if ($parts.Count -eq 2) {
            Write-Host "$($parts[0]): $($parts[1])" -ForegroundColor White
        }
    }
}

Write-Host "`n✅ Status check completed!" -ForegroundColor Greeneck Deployment Status
# This script checks the status of all deployed services

param(
    [string]$ProjectId = "kraken-gaming"
)

Write-Host "🔍 KrakenGaming Deployment Status Check" -ForegroundColor Cyan
Write-Host "Project ID: $ProjectId" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Blue

# Check recent builds
Write-Host "📊 Recent Cloud Builds:" -ForegroundColor Magenta
gcloud builds list --limit=10 --format='table(id,status,createTime,duration,source.repoSource.repoName)'

Write-Host "`n🚀 Cloud Run Services:" -ForegroundColor Green
gcloud run services list --platform=managed --region=us-central1 --format='table(metadata.name,status.url,status.conditions.status)'

Write-Host "`n🐳 Container Images:" -ForegroundColor Blue
gcloud container images list --repository=gcr.io/$ProjectId --format='table(name,tags)'

Write-Host "`n🌐 Service URLs:" -ForegroundColor Cyan
Write-Host "Production Frontend: https://krakengaming.org" -ForegroundColor Green
Write-Host "Preview Frontend: https://preview.krakengaming.org" -ForegroundColor Yellow

# Get actual service URLs from Cloud Run
Write-Host "`n📍 Actual Cloud Run URLs:" -ForegroundColor Magenta
$services = gcloud run services list --platform=managed --region=us-central1 --format="value(metadata.name,status.url)" 2>/dev/null
if ($services) {
    foreach ($service in $services) {
        $parts = $service -split "`t"
        if ($parts.Count -eq 2) {
            Write-Host "$($parts[0]): $($parts[1])" -ForegroundColor White
        }
    }
}

Write-Host "`n✅ Status check completed!" -ForegroundColor Green
