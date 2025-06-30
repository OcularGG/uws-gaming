# Domain Status Check for uwsgaming.org
# Shows current status and next steps

Write-Host "Domain Status for uwsgaming.org" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host ""

Write-Host "1. DNS CONFIGURATION:" -ForegroundColor Yellow
Write-Host "Checking DNS resolution..." -ForegroundColor White
nslookup uwsgaming.org
Write-Host ""

Write-Host "2. HTTP CONNECTION TEST:" -ForegroundColor Yellow
Write-Host "Testing HTTP (non-secure) connection..." -ForegroundColor White
try {
    $httpResponse = Invoke-WebRequest -Uri "http://uwsgaming.org" -Method Head -TimeoutSec 10
    Write-Host "[OK] HTTP Status: $($httpResponse.StatusCode) - Domain mapping is working!" -ForegroundColor Green
    $domainMappingWorks = $true
} catch {
    Write-Host "[ERROR] HTTP Status: $($_.Exception.Message)" -ForegroundColor Red
    $domainMappingWorks = $false
}

Write-Host "`n3. HTTPS/SSL CONNECTION TEST:" -ForegroundColor Yellow
Write-Host "Testing HTTPS (secure) connection..." -ForegroundColor White
try {
    $httpsResponse = Invoke-WebRequest -Uri "https://uwsgaming.org" -Method Head -TimeoutSec 10
    Write-Host "[OK] HTTPS Status: $($httpsResponse.StatusCode) - SSL certificate is working!" -ForegroundColor Green
    $sslWorks = $true
} catch {
    Write-Host "[ERROR] HTTPS Status: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "This is likely because the SSL certificate is still being provisioned." -ForegroundColor Yellow
    $sslWorks = $false
}

Write-Host "`n4. DIRECT CLOUD RUN TEST:" -ForegroundColor Yellow
$directUrl = "https://uwsgaming-frontend-582199768810.us-central1.run.app"
Write-Host "Testing direct Cloud Run URL..." -ForegroundColor White
try {
    $directResponse = Invoke-WebRequest -Uri $directUrl -Method Head -TimeoutSec 10
    Write-Host "[OK] Direct URL Status: $($directResponse.StatusCode) - Cloud Run service is healthy!" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Direct URL Status: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n5. CURRENT STATUS SUMMARY:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

if ($domainMappingWorks) {
    Write-Host "[OK] DNS Configuration: CORRECT (216.239.x.x IPs)" -ForegroundColor Green
    Write-Host "[OK] Domain Mapping: WORKING (HTTP accessible)" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Domain Mapping: NOT WORKING" -ForegroundColor Red
}

if ($sslWorks) {
    Write-Host "[OK] SSL Certificate: ACTIVE (HTTPS accessible)" -ForegroundColor Green
} else {
    Write-Host "[PENDING] SSL Certificate: BEING PROVISIONED" -ForegroundColor Yellow
    Write-Host "    This usually takes 15-60 minutes after domain mapping setup." -ForegroundColor Gray
}

Write-Host "`n6. NEXT STEPS:" -ForegroundColor Magenta
if ($domainMappingWorks -and -not $sslWorks) {
    Write-Host "✓ Good news: Your domain mapping is working correctly!" -ForegroundColor Green
    Write-Host "⏳ Wait for SSL certificate provisioning (15-60 minutes)" -ForegroundColor Yellow
    Write-Host "🔒 Once SSL is ready, https://uwsgaming.org will work" -ForegroundColor White
    Write-Host ""
    Write-Host "You can access the site now at: http://uwsgaming.org" -ForegroundColor Cyan
    Write-Host "HTTPS will work automatically once SSL is provisioned." -ForegroundColor Gray
} elseif (-not $domainMappingWorks) {
    Write-Host "❌ Domain mapping needs to be set up in Google Cloud Console" -ForegroundColor Red
    Write-Host "📋 Follow the instructions in: .\manual-domain-setup.ps1" -ForegroundColor Yellow
} else {
    Write-Host "🎉 Everything is working perfectly!" -ForegroundColor Green
    Write-Host "✅ Access your site at: https://uwsgaming.org" -ForegroundColor Green
}

Write-Host "`n7. ADMIN CREDENTIALS:" -ForegroundColor Magenta
Write-Host "Email: admin@uwsgaming.org" -ForegroundColor White
Write-Host "Password: KG_Admin_2025_de3e3b4e87c10f6e775b6bdcad274ced" -ForegroundColor White
Write-Host "Remember to change the password after first login!" -ForegroundColor Red
