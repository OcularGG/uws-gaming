#!/usr/bin/env pwsh
# Update Discord Client Secret

Write-Host "=== Update Discord Client Secret ===" -ForegroundColor Cyan
Write-Host "Paste your NEW Discord client secret below and press Enter:" -ForegroundColor Yellow
$newSecret = Read-Host

if ($newSecret.Length -lt 10) {
    Write-Host "❌ Secret seems too short. Discord client secrets are usually 32+ characters." -ForegroundColor Red
    Write-Host "Please double-check you copied the CLIENT SECRET (not bot token)" -ForegroundColor Red
    exit 1
}

Write-Host "`nUpdating Google Cloud secret..." -ForegroundColor Yellow
echo $newSecret | gcloud secrets versions add auth-discord-secret --data-file=-

Write-Host "✅ Secret updated successfully!" -ForegroundColor Green
Write-Host "`nNow redeploying frontend..." -ForegroundColor Yellow
gcloud builds submit --config cloudbuild-frontend.yaml .

Write-Host "✅ Deployment started!" -ForegroundColor Green
Write-Host "Test the OAuth at: https://krakengaming.org" -ForegroundColor Cyan
