#!/usr/bin/env pwsh
# KrakenGaming - Fix Domain Mapping and Clean Up Services
# This script fixes domain mapping and removes redundant services

param(
    [string]$ProjectId = "kraken-gaming",
    [switch]$Force = $false
)

Write-Host "🌐 KrakenGaming Domain Mapping Fix & Cleanup" -ForegroundColor Cyan
Write-Host "Project ID: $ProjectId" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Blue

# Set project
gcloud config set project $ProjectId

# Check current frontend services
Write-Host "Current Frontend Services:" -ForegroundColor Magenta
gcloud run services list --platform=managed --region=us-central1 --filter='metadata.name~frontend' --format='table(metadata.name,status.url,metadata.creationTimestamp)'

# Services to keep (current/latest)
$KEEP_SERVICES = @(
    "krakengaming-frontend",           # Production
    "krakengaming-frontend-preview",   # Preview
    "krakengaming-backend",           # Backend Production
    "krakengaming-backend-preview"    # Backend Preview
)

# Services to remove (old/redundant)
$REMOVE_SERVICES = @(
    "kraken-frontend-prod",
    "kraken-frontend-preview",
    "kraken-backend-prod"
)

Write-Host "`n🎯 Services Management:" -ForegroundColor Green
Write-Host "KEEPING: $($KEEP_SERVICES -join ', ')" -ForegroundColor Green
Write-Host "REMOVING: $($REMOVE_SERVICES -join ', ')" -ForegroundColor Red

if (-not $Force) {
    Write-Host "`n⚠️  This will DELETE the old services. Continue? (y/N): " -ForegroundColor Yellow -NoNewline
    $response = Read-Host
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host "Cancelled." -ForegroundColor Red
        exit 0
    }
}

# Remove old services
Write-Host "`nRemoving old services..." -ForegroundColor Red
foreach ($service in $REMOVE_SERVICES) {
    Write-Host "Deleting $service..." -ForegroundColor Gray
    try {
        gcloud run services delete $service --region=us-central1 --quiet
        Write-Host "Deleted $service successfully" -ForegroundColor Green
    } catch {
        Write-Host "Failed to delete $service (might not exist)" -ForegroundColor Yellow
    }
}

Write-Host "`n🌐 Domain Mapping Instructions:" -ForegroundColor Cyan
Write-Host "Now you need to update domain mappings in Google Cloud Console:" -ForegroundColor White
Write-Host "1. Go to: https://console.cloud.google.com/run/domains?project=$ProjectId" -ForegroundColor Cyan
Write-Host "2. Delete any existing mappings for:" -ForegroundColor Yellow
Write-Host "   - krakengaming.org" -ForegroundColor White
Write-Host "   - preview.krakengaming.org" -ForegroundColor White
Write-Host "3. Create NEW mappings:" -ForegroundColor Green
Write-Host "   Production:" -ForegroundColor Cyan
Write-Host "   - Domain: krakengaming.org" -ForegroundColor White
Write-Host "   - Service: krakengaming-frontend" -ForegroundColor White
Write-Host "   - Region: us-central1" -ForegroundColor White
Write-Host "   Preview:" -ForegroundColor Cyan
Write-Host "   - Domain: preview.krakengaming.org" -ForegroundColor White
Write-Host "   - Service: krakengaming-frontend-preview" -ForegroundColor White
Write-Host "   - Region: us-central1" -ForegroundColor White

Write-Host "`n� Fix Discord OAuth:" -ForegroundColor Magenta
Write-Host "After domain mapping, update Discord OAuth settings:" -ForegroundColor White
Write-Host "1. Go to https://discord.com/developers/applications" -ForegroundColor Cyan
Write-Host "2. Select your KrakenGaming application" -ForegroundColor White
Write-Host "3. Go to OAuth2 -> General" -ForegroundColor White
Write-Host "4. Update Redirect URIs to:" -ForegroundColor White
Write-Host "   - https://krakengaming.org/api/auth/callback/discord" -ForegroundColor Green
Write-Host "   - https://preview.krakengaming.org/api/auth/callback/discord" -ForegroundColor Green

Write-Host "`n🧪 Testing Commands:" -ForegroundColor Blue
Write-Host "After mapping is complete, test these URLs:" -ForegroundColor White
Write-Host "curl -I https://krakengaming.org" -ForegroundColor Gray
Write-Host "curl -I https://preview.krakengaming.org" -ForegroundColor Gray

# Final status check
Write-Host "`nCurrent Service Status:" -ForegroundColor Blue
gcloud run services list --platform=managed --region=us-central1 --filter='metadata.name~frontend OR metadata.name~backend' --format='table(metadata.name,status.url)'

Write-Host "`nCleanup and mapping guide completed!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update domain mappings in Google Cloud Console" -ForegroundColor White
Write-Host "2. Update Discord OAuth redirect URIs" -ForegroundColor White
Write-Host "3. Test both domains work correctly" -ForegroundColor White
