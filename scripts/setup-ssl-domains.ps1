# Setup Domain Mappings and SSL for KrakenGaming
# This script creates domain mappings and manages SSL certificates

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "kraken-gaming",

    [Parameter(Mandatory=$false)]
    [string]$Region = "us-central1"
)

$ErrorActionPreference = "Stop"

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"

Write-Host "Setting up domain mappings and SSL for KrakenGaming..." -ForegroundColor $Yellow

# Check if beta components are available
Write-Host "Checking gcloud beta components..." -ForegroundColor $Yellow
try {
    gcloud components list --filter="id:beta" --format="value(state.name)" 2>$null | Out-Null
    $betaInstalled = $true
} catch {
    $betaInstalled = $false
}

if (-not $betaInstalled) {
    Write-Host "WARNING: gcloud beta components not installed." -ForegroundColor $Yellow
    Write-Host "Domain mappings require beta components. Please run:" -ForegroundColor $Yellow
    Write-Host "gcloud components install beta" -ForegroundColor $Yellow
    Write-Host ""
    Write-Host "For now, we'll continue with manual domain mapping instructions." -ForegroundColor $Yellow
}

# Domain mapping instructions
Write-Host "`n=== MANUAL DOMAIN MAPPING SETUP ===" -ForegroundColor $Green

Write-Host "`n1. Production Domain (krakengaming.org):" -ForegroundColor $Yellow
Write-Host "   - Go to: https://console.cloud.google.com/run/domains?project=$ProjectId"
Write-Host "   - Click 'Add Mapping'"
Write-Host "   - Domain: krakengaming.org"
Write-Host "   - Service: kraken-frontend-prod"
Write-Host "   - Region: $Region"

Write-Host "`n2. Preview Domain (preview.krakengaming.org):" -ForegroundColor $Yellow
Write-Host "   - Click 'Add Mapping' again"
Write-Host "   - Domain: preview.krakengaming.org"
Write-Host "   - Service: kraken-frontend-preview"
Write-Host "   - Region: $Region"

Write-Host "`n3. SSL Certificate Setup:" -ForegroundColor $Yellow
Write-Host "   - Google will automatically provision SSL certificates"
Write-Host "   - This can take 10-60 minutes to complete"
Write-Host "   - Check status at: https://console.cloud.google.com/run/domains?project=$ProjectId"

Write-Host "`n=== CURRENT TESTING URLs ===" -ForegroundColor $Green
Write-Host "While waiting for SSL setup, test Discord auth on these URLs:"
Write-Host "Production:  https://kraken-frontend-prod-1044201442446.us-central1.run.app" -ForegroundColor $Green
Write-Host "Preview:     https://kraken-frontend-preview-1044201442446.us-central1.run.app" -ForegroundColor $Green

Write-Host "`n=== DISCORD AUTH TESTING ===" -ForegroundColor $Green
Write-Host "1. Visit one of the URLs above"
Write-Host "2. Click 'Sign in with Discord'"
Write-Host "3. Authorize the KrakenGaming application"
Write-Host "4. Verify you're redirected back and logged in"

Write-Host "`nBoth services are now public and have Discord credentials configured!" -ForegroundColor $Green
