# Final deployment verification and status check
# Verifies all services are deployed and provides next steps for domain setup

Write-Host "UWS Gaming Deployment Verification" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

Write-Host "`n1. CHECKING CLOUD RUN SERVICES" -ForegroundColor Yellow

Write-Host "Current deployed services:" -ForegroundColor White
gcloud run services list --region=us-central1

# Check if target services exist
$frontendExists = $false
$backendExists = $false
$frontendUrl = ""
$backendUrl = ""

foreach ($line in (gcloud run services list --region=us-central1 --format="value(SERVICE_NAME,SERVICE_URL)")) {
    $parts = $line -split "`t"
    if ($parts.Length -ge 2) {
        $serviceName = $parts[0].Trim()
        $serviceUrl = $parts[1].Trim()

        if ($serviceName -eq "uwsgaming-frontend") {
            $frontendExists = $true
            $frontendUrl = $serviceUrl
            Write-Host "[OK] Frontend service found: $serviceUrl" -ForegroundColor Green
        }
        elseif ($serviceName -eq "uwsgaming-backend") {
            $backendExists = $true
            $backendUrl = $serviceUrl
            Write-Host "[OK] Backend service found: $serviceUrl" -ForegroundColor Green
        }
    }
}

if (-not $frontendExists) {
    Write-Host "[ERROR] uwsgaming-frontend service not found" -ForegroundColor Red
}

if (-not $backendExists) {
    Write-Host "[ERROR] uwsgaming-backend service not found" -ForegroundColor Red
}

Write-Host "`n2. TESTING SERVICES" -ForegroundColor Yellow

if ($frontendExists) {
    Write-Host "Testing frontend service..." -ForegroundColor White
    try {
        $response = Invoke-WebRequest -Uri $frontendUrl -Method Head -TimeoutSec 10
        Write-Host "✓ Frontend Status: $($response.StatusCode) - Service responding!" -ForegroundColor Green
    } catch {
        Write-Host "✗ Frontend Status: Error - $($_.Exception.Message)" -ForegroundColor Red
    }
}

if ($backendExists) {
    Write-Host "Testing backend service..." -ForegroundColor White
    try {
        $healthUrl = "$backendUrl/health"
        $response = Invoke-WebRequest -Uri $healthUrl -Method Get -TimeoutSec 10
        Write-Host "✓ Backend Status: $($response.StatusCode) - Service responding!" -ForegroundColor Green
    } catch {
        Write-Host "✗ Backend Status: Error - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n3. DATABASE STATUS" -ForegroundColor Yellow
Write-Host "Checking Cloud SQL instance..." -ForegroundColor White
try {
    $dbStatus = gcloud sql instances describe uwsgaming-db --format="value(state)"
    Write-Host "✓ Database Status: $dbStatus" -ForegroundColor Green
} catch {
    Write-Host "✗ Database Status: Error - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. ADMIN LOGIN CREDENTIALS" -ForegroundColor Yellow
Write-Host "Admin Email: admin@uwsgaming.org" -ForegroundColor White
Write-Host "Admin Password: KG_Admin_2025_de3e3b4e87c10f6e775b6bdcad274ced" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT: Change this password after first login!" -ForegroundColor Red

Write-Host "`n5. CURRENT URLs" -ForegroundColor Yellow
if ($frontendUrl) {
    Write-Host "Frontend: $frontendUrl" -ForegroundColor White
}
if ($backendUrl) {
    Write-Host "Backend: $backendUrl" -ForegroundColor White
}

Write-Host "`n6. NEXT STEPS FOR DOMAIN SETUP" -ForegroundColor Yellow
Write-Host "To set up uwsgaming.org domain:" -ForegroundColor White
Write-Host "1. Run: .\manual-domain-setup.ps1" -ForegroundColor Green
Write-Host "2. Follow the instructions to add DNS records" -ForegroundColor White
Write-Host "3. Complete domain mapping in Google Cloud Console" -ForegroundColor White
Write-Host "4. Wait for SSL certificate provisioning (15-60 minutes)" -ForegroundColor White

if ($frontendExists -and $backendExists) {
    Write-Host "`n[SUCCESS] DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "Both frontend and backend services are deployed and ready for domain setup." -ForegroundColor White
} else {
    Write-Host "`n[WARNING] DEPLOYMENT INCOMPLETE" -ForegroundColor Yellow
    Write-Host "Some services are missing. Check the Cloud Build logs and re-run deployments as needed." -ForegroundColor White
}

Write-Host "`n7. CLEANUP OLD SERVICES" -ForegroundColor Yellow
Write-Host "After verifying new services work, run: .\cleanup-old-services.ps1" -ForegroundColor White
Write-Host "This will remove the old krakengaming-* services." -ForegroundColor Gray
