# Cleanup script to remove old Cloud Run services with incorrect naming
# Run this after confirming new uwsgaming-* services are working

Write-Host "Cleanup Old Cloud Run Services" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

Write-Host "`nCurrent services:" -ForegroundColor Yellow
gcloud run services list --region=us-central1

Write-Host "`nServices to delete (old naming):" -ForegroundColor Red
Write-Host "- krakengaming-frontend" -ForegroundColor White
Write-Host "- krakengaming-backend" -ForegroundColor White

$confirmation = Read-Host "`nDo you want to delete the old krakengaming-* services? (y/N)"

if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
    Write-Host "`nDeleting old services..." -ForegroundColor Yellow

    Write-Host "Deleting krakengaming-frontend..." -ForegroundColor White
    try {
        gcloud run services delete krakengaming-frontend --region=us-central1 --quiet
        Write-Host "✓ krakengaming-frontend deleted" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to delete krakengaming-frontend: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host "Deleting krakengaming-backend..." -ForegroundColor White
    try {
        gcloud run services delete krakengaming-backend --region=us-central1 --quiet
        Write-Host "✓ krakengaming-backend deleted" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to delete krakengaming-backend: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host "`nCleaned up services:" -ForegroundColor Green
    gcloud run services list --region=us-central1

} else {
    Write-Host "`nCleanup cancelled. Old services remain." -ForegroundColor Yellow
}

Write-Host "`nTo manually delete services later, use:" -ForegroundColor Cyan
Write-Host "gcloud run services delete SERVICE_NAME --region=us-central1" -ForegroundColor Gray
