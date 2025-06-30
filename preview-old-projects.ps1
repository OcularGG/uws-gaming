# Preview Google Cloud Project Resources
# Shows what resources exist in old projects before deletion
# This script is SAFE - it only shows information, doesn't delete anything

Write-Host "Google Cloud Project Resource Preview" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script shows what resources exist in the old projects." -ForegroundColor Green
Write-Host "No resources will be deleted by this script." -ForegroundColor Green
Write-Host ""

# Show current projects
Write-Host "All Google Cloud Projects:" -ForegroundColor Yellow
gcloud projects list
Write-Host ""

# Current project info
$currentProject = gcloud config get-value project
Write-Host "Current active project: $currentProject" -ForegroundColor Green
Write-Host ""

Write-Host "=== KRAKEN-GAMING PROJECT RESOURCES ===" -ForegroundColor Yellow
gcloud config set project kraken-gaming --quiet

Write-Host "`nCloud Run Services:" -ForegroundColor White
gcloud run services list --region=us-central1

Write-Host "`nCloud SQL Instances:" -ForegroundColor White
gcloud sql instances list

Write-Host "`nCompute Engine VMs:" -ForegroundColor White
gcloud compute instances list 2>$null

Write-Host "`nCloud Storage Buckets:" -ForegroundColor White
gcloud storage buckets list 2>$null

Write-Host "`n=== KRAKEN-NAVAL-CLAN PROJECT RESOURCES ===" -ForegroundColor Yellow
gcloud config set project kraken-naval-clan --quiet

Write-Host "`nCloud Run Services:" -ForegroundColor White
gcloud run services list --region=us-central1

Write-Host "`nCloud SQL Instances:" -ForegroundColor White
gcloud sql instances list

Write-Host "`nCompute Engine VMs:" -ForegroundColor White
gcloud compute instances list 2>$null

Write-Host "`nCloud Storage Buckets:" -ForegroundColor White
gcloud storage buckets list 2>$null

Write-Host "`n=== UWS-GAMING PROJECT RESOURCES (CURRENT) ===" -ForegroundColor Green
gcloud config set project uws-gaming --quiet

Write-Host "`nCloud Run Services:" -ForegroundColor White
gcloud run services list --region=us-central1

Write-Host "`nCloud SQL Instances:" -ForegroundColor White
gcloud sql instances list

Write-Host "`nCompute Engine VMs:" -ForegroundColor White
gcloud compute instances list 2>$null

Write-Host "`nCloud Storage Buckets:" -ForegroundColor White
gcloud storage buckets list 2>$null

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Projects to keep:" -ForegroundColor Green
Write-Host "- uws-gaming (UWS Gaming) - Current project with uwsgaming.org" -ForegroundColor White

Write-Host "`nProjects that can be deleted:" -ForegroundColor Red
Write-Host "- kraken-gaming (KrakenGaming) - Old project" -ForegroundColor White
Write-Host "- kraken-naval-clan (KRAKEN Naval Clan) - Old project" -ForegroundColor White

Write-Host "`nTo delete the old projects, run: .\cleanup-old-projects.ps1" -ForegroundColor Yellow
Write-Host "WARNING: Deletion is permanent and irreversible!" -ForegroundColor Red
