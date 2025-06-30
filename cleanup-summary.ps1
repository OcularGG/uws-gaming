# Google Cloud Cleanup Summary
# Completed on June 29, 2025

Write-Host "Google Cloud Cleanup Summary" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green
Write-Host ""

Write-Host "SUCCESSFULLY DELETED PROJECTS:" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""

Write-Host "1. kraken-gaming (KrakenGaming)" -ForegroundColor Yellow
Write-Host "   - Status: DELETE_REQUESTED" -ForegroundColor White
Write-Host "   - Resources deleted:" -ForegroundColor White
Write-Host "     * 6 Cloud Run services (frontend, backend, preview, discord bots)" -ForegroundColor Gray
Write-Host "     * 1 PostgreSQL database (kraken-gaming-db)" -ForegroundColor Gray
Write-Host "     * 2 Cloud Storage buckets" -ForegroundColor Gray
Write-Host ""

Write-Host "2. kraken-naval-clan (KRAKEN Naval Clan)" -ForegroundColor Yellow
Write-Host "   - Status: DELETE_REQUESTED" -ForegroundColor White
Write-Host "   - Resources deleted:" -ForegroundColor White
Write-Host "     * 3 Cloud Run services (kraken-app, kraken-naval-clan, kraken-website)" -ForegroundColor Gray
Write-Host "     * 1 PostgreSQL database (kraken-db)" -ForegroundColor Gray
Write-Host "     * 1 Cloud Storage bucket" -ForegroundColor Gray
Write-Host ""

Write-Host "CLEANED UP IN CURRENT PROJECT (uws-gaming):" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Deleted old services with incorrect naming:" -ForegroundColor Yellow
Write-Host "- krakengaming-frontend" -ForegroundColor White
Write-Host "- krakengaming-backend" -ForegroundColor White
Write-Host ""

Write-Host "CURRENT ACTIVE RESOURCES:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Project: uws-gaming (UWS Gaming)" -ForegroundColor Green
Write-Host "Cloud Run Services:" -ForegroundColor White
gcloud run services list --region=us-central1
Write-Host ""
Write-Host "Cloud SQL Databases:" -ForegroundColor White
gcloud sql instances list
Write-Host ""

Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "==========" -ForegroundColor Yellow
Write-Host "1. Deploy uwsgaming-backend service" -ForegroundColor White
Write-Host "2. Set up domain mapping for uwsgaming.org" -ForegroundColor White
Write-Host "3. Configure Google CDN if desired" -ForegroundColor White
Write-Host "4. Test the application at uwsgaming.org" -ForegroundColor White
Write-Host ""

Write-Host "ADMIN CREDENTIALS:" -ForegroundColor Magenta
Write-Host "==================" -ForegroundColor Magenta
Write-Host "Email: admin@uwsgaming.org" -ForegroundColor White
Write-Host "Password: KG_Admin_2025_de3e3b4e87c10f6e775b6bdcad274ced" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT: Change the admin password after first login!" -ForegroundColor Red
Write-Host ""

Write-Host "DOMAIN SETUP:" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan
Write-Host "Run: .\manual-domain-setup.ps1" -ForegroundColor Green
Write-Host "Add DNS records with these A records:" -ForegroundColor White
Write-Host "216.239.32.21, 216.239.34.21, 216.239.36.21, 216.239.38.21" -ForegroundColor Gray
Write-Host ""

Write-Host "[SUCCESS] CLEANUP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
