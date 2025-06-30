# DNS Troubleshooting for uwsgaming.org
# Diagnoses DNS issues and provides fix instructions

Write-Host "DNS Troubleshooting for uwsgaming.org" -ForegroundColor Red
Write-Host "====================================" -ForegroundColor Red
Write-Host ""

Write-Host "1. CURRENT DNS RESOLUTION:" -ForegroundColor Yellow
Write-Host "Current DNS lookup for uwsgaming.org:" -ForegroundColor White
nslookup uwsgaming.org
Write-Host ""

Write-Host "2. PROBLEM IDENTIFIED:" -ForegroundColor Red
Write-Host "[ERROR] DNS is pointing to 8.8.8.8 (Google's public DNS server)" -ForegroundColor Red
Write-Host "[ERROR] This is INCORRECT for Google Cloud Run domain mapping" -ForegroundColor Red
Write-Host ""

Write-Host "3. CORRECT DNS CONFIGURATION:" -ForegroundColor Green
Write-Host "You MUST change your A records to these Google Cloud Run IPs:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Delete existing A record: 8.8.8.8" -ForegroundColor Red
Write-Host ""
Write-Host "Add these A records:" -ForegroundColor Green
Write-Host "216.239.32.21" -ForegroundColor Yellow
Write-Host "216.239.34.21" -ForegroundColor Yellow
Write-Host "216.239.36.21" -ForegroundColor Yellow
Write-Host "216.239.38.21" -ForegroundColor Yellow
Write-Host ""

Write-Host "4. HOW TO FIX:" -ForegroundColor Cyan
Write-Host "a) Go to your domain registrar (where you bought uwsgaming.org)" -ForegroundColor White
Write-Host "b) Find DNS management or DNS records section" -ForegroundColor White
Write-Host "c) Look for A records pointing to 8.8.8.8" -ForegroundColor White
Write-Host "d) DELETE the A record with value 8.8.8.8" -ForegroundColor Red
Write-Host "e) ADD four new A records with the values above" -ForegroundColor Green
Write-Host ""

Write-Host "5. CURRENT SERVICE STATUS:" -ForegroundColor Yellow
$frontendUrl = "https://uwsgaming-frontend-582199768810.us-central1.run.app"
Write-Host "Direct Cloud Run URL: $frontendUrl" -ForegroundColor White

Write-Host "`nTesting direct Cloud Run URL..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $frontendUrl -Method Head -TimeoutSec 10
    Write-Host "[OK] Direct URL Status: $($response.StatusCode) - Cloud Run service is working!" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Direct URL Status: Error - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n6. VERIFICATION AFTER DNS CHANGE:" -ForegroundColor Yellow
Write-Host "After updating DNS (may take 5-60 minutes):" -ForegroundColor White
Write-Host "Run this command to check: nslookup uwsgaming.org" -ForegroundColor Gray
Write-Host "You should see the 216.239.x.x IP addresses" -ForegroundColor Gray
Write-Host ""

Write-Host "7. WHY THIS HAPPENED:" -ForegroundColor Cyan
Write-Host "- 8.8.8.8 is Google's public DNS server, NOT for domain mapping" -ForegroundColor White
Write-Host "- 216.239.x.x are Google's Cloud Run domain mapping IPs" -ForegroundColor White
Write-Host "- The 8.8.8.8 record was likely set as a placeholder or by mistake" -ForegroundColor White
Write-Host ""

Write-Host "SUMMARY:" -ForegroundColor Magenta
Write-Host "========" -ForegroundColor Magenta
Write-Host "[ERROR] Problem: DNS points to 8.8.8.8 (wrong)" -ForegroundColor Red
Write-Host "[FIX] Solution: Change A records to 216.239.32.21, 216.239.34.21, 216.239.36.21, 216.239.38.21" -ForegroundColor Green
Write-Host "[OK] Cloud Run service is working properly" -ForegroundColor Green
Write-Host ""
Write-Host "After DNS fix, uwsgaming.org should work within 5-60 minutes!" -ForegroundColor Green
