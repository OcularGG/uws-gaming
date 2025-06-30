# Domain Setup Script for uwsgaming.org
# This script sets up custom domain mapping for Cloud Run services

Write-Host "Setting up uwsgaming.org domain mapping..." -ForegroundColor Cyan

$ProjectId = "uws-gaming"
$Region = "us-central1"
$Domain = "uwsgaming.org"
$FrontendService = "krakengaming-frontend"  # Current working service
$BackendService = "krakengaming-backend"    # Will update when uwsgaming-backend is ready

# Set project
gcloud config set project $ProjectId

# Enable Cloud Domains API
Write-Host "Enabling required APIs..." -ForegroundColor Yellow
gcloud services enable domains.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com

# Verify domain ownership (this needs to be done manually in Google Search Console)
Write-Host "Domain verification required..." -ForegroundColor Yellow
Write-Host "Please verify domain ownership at: https://search.google.com/search-console" -ForegroundColor White

# Check if domain mappings already exist
Write-Host "Checking existing domain mappings..." -ForegroundColor Yellow
gcloud run domain-mappings list --region=$Region

# Create domain mapping for frontend (uwsgaming.org -> frontend)
Write-Host "Creating domain mapping for frontend..." -ForegroundColor Yellow
try {
    gcloud run domain-mappings create --domain=$Domain --service=$FrontendService --region=$Region
    Write-Host "Frontend domain mapping created successfully!" -ForegroundColor Green
} catch {
    Write-Host "Domain mapping may already exist or requires verification." -ForegroundColor Yellow
}

# Create domain mapping for API subdomain (api.uwsgaming.org -> backend)
$ApiDomain = "api.$Domain"
Write-Host "Creating domain mapping for API..." -ForegroundColor Yellow
try {
    gcloud run domain-mappings create --domain=$ApiDomain --service=$BackendService --region=$Region
    Write-Host "API domain mapping created successfully!" -ForegroundColor Green
} catch {
    Write-Host "API domain mapping may already exist or requires verification." -ForegroundColor Yellow
}

# Get the required DNS records
Write-Host "Getting DNS configuration..." -ForegroundColor Cyan
Write-Host "Main domain DNS records:" -ForegroundColor Yellow
gcloud run domain-mappings describe $Domain --region=$Region --format="value(spec.certificateMode,status.conditions,status.observedGeneration,status.url)" 2>$null

Write-Host "API domain DNS records:" -ForegroundColor Yellow
gcloud run domain-mappings describe $ApiDomain --region=$Region --format="value(spec.certificateMode,status.conditions,status.observedGeneration,status.url)" 2>$null

Write-Host "Domain setup instructions:" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host "1. Verify domain ownership in Google Search Console:" -ForegroundColor White
Write-Host "   https://search.google.com/search-console" -ForegroundColor White
Write-Host ""
Write-Host "2. Add these DNS records to your domain registrar:" -ForegroundColor White
Write-Host "   Type: CNAME" -ForegroundColor White
Write-Host "   Name: www" -ForegroundColor White
Write-Host "   Value: ghs.googlehosted.com" -ForegroundColor White
Write-Host ""
Write-Host "   Type: A" -ForegroundColor White
Write-Host "   Name: @" -ForegroundColor White
Write-Host "   Value: 216.239.32.21" -ForegroundColor White
Write-Host "   Value: 216.239.34.21" -ForegroundColor White
Write-Host "   Value: 216.239.36.21" -ForegroundColor White
Write-Host "   Value: 216.239.38.21" -ForegroundColor White
Write-Host ""
Write-Host "   Type: CNAME" -ForegroundColor White
Write-Host "   Name: api" -ForegroundColor White
Write-Host "   Value: ghs.googlehosted.com" -ForegroundColor White
Write-Host ""
Write-Host "3. SSL certificates will be automatically provisioned by Google Cloud" -ForegroundColor White

# Show current service status
Write-Host "Current service URLs:" -ForegroundColor Cyan
Write-Host "Frontend: https://krakengaming-frontend-582199768810.us-central1.run.app" -ForegroundColor White
Write-Host "Expected: https://uwsgaming.org" -ForegroundColor Green
Write-Host "API: https://krakengaming-backend-582199768810.us-central1.run.app" -ForegroundColor White
Write-Host "Expected: https://api.uwsgaming.org" -ForegroundColor Green
