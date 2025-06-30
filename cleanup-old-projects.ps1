# Google Cloud Project Cleanup Script
# Removes old KrakenGaming and KRAKEN Naval Clan projects
# CAUTION: This will permanently delete all resources in these projects!

Write-Host "Google Cloud Project Cleanup" -ForegroundColor Red
Write-Host "============================" -ForegroundColor Red
Write-Host ""
Write-Host "WARNING: This script will PERMANENTLY DELETE the following projects:" -ForegroundColor Red
Write-Host "- kraken-gaming (KrakenGaming)" -ForegroundColor Yellow
Write-Host "- kraken-naval-clan (KRAKEN Naval Clan)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Current project 'uws-gaming' will be kept." -ForegroundColor Green
Write-Host ""

# Show current projects
Write-Host "Current Google Cloud Projects:" -ForegroundColor Cyan
gcloud projects list

Write-Host "`nResources in kraken-gaming project:" -ForegroundColor Yellow
gcloud config set project kraken-gaming --quiet
Write-Host "Cloud Run Services:" -ForegroundColor White
gcloud run services list --region=us-central1 --format="table(SERVICE_NAME,URL)"
Write-Host "`nCloud SQL Instances:" -ForegroundColor White
gcloud sql instances list --format="table(NAME,DATABASE_VERSION,STATUS)"

Write-Host "`nResources in kraken-naval-clan project:" -ForegroundColor Yellow
gcloud config set project kraken-naval-clan --quiet
Write-Host "Cloud Run Services:" -ForegroundColor White
gcloud run services list --region=us-central1 --format="table(SERVICE_NAME,URL)"
Write-Host "`nCloud SQL Instances:" -ForegroundColor White
gcloud sql instances list --format="table(NAME,DATABASE_VERSION,STATUS)"

# Switch back to current project
gcloud config set project uws-gaming --quiet

Write-Host "`n" -ForegroundColor Red
Write-Host "IMPORTANT WARNINGS:" -ForegroundColor Red
Write-Host "===================" -ForegroundColor Red
Write-Host "1. This action is IRREVERSIBLE!" -ForegroundColor Red
Write-Host "2. All data, databases, and services will be permanently lost!" -ForegroundColor Red
Write-Host "3. Any billing associated with these projects will stop." -ForegroundColor Red
Write-Host "4. Domain mappings associated with these projects will be removed." -ForegroundColor Red
Write-Host ""

$confirmation1 = Read-Host "Type 'DELETE' (all caps) to confirm you want to delete the old projects"

if ($confirmation1 -ne "DELETE") {
    Write-Host "`nCleanup cancelled. No projects were deleted." -ForegroundColor Green
    exit 0
}

$confirmation2 = Read-Host "`nAre you absolutely sure? Type 'YES' to proceed with deletion"

if ($confirmation2 -ne "YES") {
    Write-Host "`nCleanup cancelled. No projects were deleted." -ForegroundColor Green
    exit 0
}

Write-Host "`nProceeding with project deletion..." -ForegroundColor Red

# Delete kraken-gaming project
Write-Host "`nDeleting kraken-gaming project..." -ForegroundColor Yellow
try {
    gcloud projects delete kraken-gaming --quiet
    Write-Host "✓ kraken-gaming project deleted successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to delete kraken-gaming project: $($_.Exception.Message)" -ForegroundColor Red
}

# Delete kraken-naval-clan project
Write-Host "`nDeleting kraken-naval-clan project..." -ForegroundColor Yellow
try {
    gcloud projects delete kraken-naval-clan --quiet
    Write-Host "✓ kraken-naval-clan project deleted successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to delete kraken-naval-clan project: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nProject cleanup completed!" -ForegroundColor Green
Write-Host "Remaining projects:" -ForegroundColor Cyan
gcloud projects list

Write-Host "`nCurrent active project:" -ForegroundColor Cyan
gcloud config get-value project

Write-Host "`nNOTE: It may take a few minutes for the projects to be fully removed from the console." -ForegroundColor Yellow
