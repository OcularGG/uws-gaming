#!/usr/bin/env pwsh
# KrakenGaming - Domain Mapping SSL Certificate Status Check
# This script checks the status of domain mapping and SSL certificate provisioning

param(
    [string]$ProjectId = "kraken-gaming"
)

Write-Host "🔍 KrakenGaming Domain Mapping SSL Status Check" -ForegroundColor Cyan
Write-Host "Project ID: $ProjectId" -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Blue

# Set project
gcloud config set project $ProjectId

Write-Host "`n📊 Current Cloud Run Services Status:" -ForegroundColor Green
gcloud run services list --platform=managed --region=us-central1 --filter='metadata.name~krakengaming-frontend' --format='table(metadata.name,status.url,status.conditions.status)'

Write-Host "`n🌐 DNS Resolution Check:" -ForegroundColor Blue
Write-Host "krakengaming.org DNS:" -ForegroundColor White
nslookup krakengaming.org

Write-Host "`npreview.krakengaming.org DNS:" -ForegroundColor White
nslookup preview.krakengaming.org

Write-Host "`n🔐 SSL Certificate Status:" -ForegroundColor Magenta
Write-Host "When you created the domain mapping, Google Cloud automatically starts provisioning SSL certificates." -ForegroundColor Yellow
Write-Host "This process can take 15-60 minutes to complete." -ForegroundColor Yellow

Write-Host "`n📋 Common Issues & Solutions:" -ForegroundColor Red
Write-Host "1. SSL Certificate Still Provisioning (Most Likely)" -ForegroundColor White
Write-Host "   - Wait 15-60 minutes for certificate to be issued" -ForegroundColor Gray
Write-Host "   - Check Google Cloud Console > Cloud Run > Domain Mappings" -ForegroundColor Gray

Write-Host "`n2. Domain Mapping Configuration Issue" -ForegroundColor White
Write-Host "   - Verify mapping points to 'krakengaming-frontend' service" -ForegroundColor Gray
Write-Host "   - Check region is set to 'us-central1'" -ForegroundColor Gray

Write-Host "`n3. DNS Propagation Delay" -ForegroundColor White
Write-Host "   - DNS changes can take time to propagate globally" -ForegroundColor Gray
Write-Host "   - Try accessing from different networks/devices" -ForegroundColor Gray

Write-Host "`n🧪 Testing URLs:" -ForegroundColor Blue
Write-Host "Direct Cloud Run URL (should work):" -ForegroundColor Green
Write-Host "https://krakengaming-frontend-7235ln35zq-uc.a.run.app" -ForegroundColor Cyan

Write-Host "`nCustom Domain URLs (may show SSL errors until cert is ready):" -ForegroundColor Yellow
Write-Host "https://krakengaming.org" -ForegroundColor Cyan
Write-Host "https://preview.krakengaming.org" -ForegroundColor Cyan

Write-Host "`n⏰ Recommended Actions:" -ForegroundColor Magenta
Write-Host "1. Wait 30-60 minutes for SSL certificate provisioning" -ForegroundColor White
Write-Host "2. Check domain mapping status in Google Cloud Console:" -ForegroundColor White
Write-Host "   https://console.cloud.google.com/run/domains?project=$ProjectId" -ForegroundColor Cyan
Write-Host "3. Look for 'Certificate Status' - should show 'Active' when ready" -ForegroundColor White
Write-Host "4. Test direct Cloud Run URL to ensure service is working" -ForegroundColor White

Write-Host "`n✅ Next Steps:" -ForegroundColor Green
Write-Host "Once SSL certificates are active:" -ForegroundColor White
Write-Host "- https://krakengaming.org should work without SSL errors" -ForegroundColor Green
Write-Host "- Discord OAuth should work correctly" -ForegroundColor Green
Write-Host "- Apply button should be visible" -ForegroundColor Green

Write-Host "`n🔄 Re-run this script in 30 minutes to check progress" -ForegroundColor Blue
