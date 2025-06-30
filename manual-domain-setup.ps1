# Manual Domain Setup Guide for uwsgaming.org
# Since domain mappings require beta commands, here's the manual setup process

Write-Host "Manual Domain Setup for uwsgaming.org" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "`n1. VERIFY DOMAIN OWNERSHIP" -ForegroundColor Yellow
Write-Host "Go to Google Search Console: https://search.google.com/search-console" -ForegroundColor White
Write-Host "Add and verify ownership of uwsgaming.org" -ForegroundColor White

Write-Host "`n2. CLOUD RUN DOMAIN MAPPING (via Console)" -ForegroundColor Yellow
Write-Host "Go to Cloud Run Console: https://console.cloud.google.com/run" -ForegroundColor White
Write-Host "Project: uws-gaming" -ForegroundColor White
Write-Host "Region: us-central1" -ForegroundColor White
Write-Host ""
Write-Host "For Frontend Service (uwsgaming-frontend):" -ForegroundColor Green
Write-Host "- Click on 'uwsgaming-frontend' service" -ForegroundColor White
Write-Host "- Go to 'CUSTOM DOMAINS' tab" -ForegroundColor White
Write-Host "- Click 'ADD MAPPING'" -ForegroundColor White
Write-Host "- Enter domain: uwsgaming.org" -ForegroundColor White
Write-Host "- Click 'CONTINUE' and follow verification steps" -ForegroundColor White
Write-Host ""
Write-Host "ALSO ADD WWW SUBDOMAIN:" -ForegroundColor Yellow
Write-Host "- Click 'ADD MAPPING' again" -ForegroundColor White
Write-Host "- Enter domain: www.uwsgaming.org" -ForegroundColor White
Write-Host "- Click 'CONTINUE' and follow verification steps" -ForegroundColor White

Write-Host "`nFor Backend Service (uwsgaming-backend):" -ForegroundColor Green
Write-Host "- The backend service is currently being deployed" -ForegroundColor Yellow
Write-Host "- Once deployment completes, click on 'uwsgaming-backend' service" -ForegroundColor White
Write-Host "- Go to 'CUSTOM DOMAINS' tab" -ForegroundColor White
Write-Host "- Click 'ADD MAPPING'" -ForegroundColor White
Write-Host "- Enter domain: api.uwsgaming.org" -ForegroundColor White
Write-Host "- Click 'CONTINUE' and follow verification steps" -ForegroundColor White

Write-Host "`n3. DNS CONFIGURATION" -ForegroundColor Yellow
Write-Host "Add these DNS records to your domain registrar:" -ForegroundColor White
Write-Host ""
Write-Host "CRITICAL: REMOVE ANY EXISTING A RECORD POINTING TO 8.8.8.8!" -ForegroundColor Red
Write-Host "DNS is now correctly configured with 216.239.x.x IPs." -ForegroundColor Green
Write-Host ""
Write-Host "REQUIRED: Google Site Verification (for domain ownership):" -ForegroundColor Red
Write-Host "Type: TXT" -ForegroundColor White
Write-Host "Name: @ (or root domain)" -ForegroundColor White
Write-Host "Value: google-site-verification=Evl5tN-82zFOBS_qXMPEbRuCQYU1QC6JEBTHTFNYwns" -ForegroundColor White
Write-Host ""
Write-Host "REPLACE EXISTING A RECORDS WITH THESE:" -ForegroundColor Red
Write-Host "For uwsgaming.org (main domain):" -ForegroundColor Green
Write-Host "Type: A" -ForegroundColor White
Write-Host "Name: @" -ForegroundColor White
Write-Host "Value: 216.239.32.21" -ForegroundColor Yellow
Write-Host "Value: 216.239.34.21" -ForegroundColor Yellow
Write-Host "Value: 216.239.36.21" -ForegroundColor Yellow
Write-Host "Value: 216.239.38.21" -ForegroundColor Yellow
Write-Host ""
Write-Host "Type: CNAME" -ForegroundColor White
Write-Host "Name: www" -ForegroundColor White
Write-Host "Value: ghs.googlehosted.com" -ForegroundColor White
Write-Host ""
Write-Host "For api.uwsgaming.org (API subdomain):" -ForegroundColor Green
Write-Host "Type: CNAME" -ForegroundColor White
Write-Host "Name: api" -ForegroundColor White
Write-Host "Value: ghs.googlehosted.com" -ForegroundColor White

Write-Host "`n4. CURRENT SERVICE STATUS" -ForegroundColor Yellow
$frontendUrl = "https://uwsgaming-frontend-582199768810.us-central1.run.app"
$backendUrl = "https://uwsgaming-backend-582199768810.us-central1.run.app"

Write-Host "Current URLs:" -ForegroundColor White
Write-Host "Frontend: $frontendUrl" -ForegroundColor White
Write-Host "Backend: $backendUrl" -ForegroundColor White
Write-Host ""
Write-Host "After domain setup:" -ForegroundColor Green
Write-Host "Frontend: https://uwsgaming.org" -ForegroundColor White
Write-Host "Backend/API: https://api.uwsgaming.org" -ForegroundColor White

Write-Host "`n5. GOOGLE CDN (CLOUD CDN) SETUP" -ForegroundColor Yellow
Write-Host "To enable Google CDN for better performance:" -ForegroundColor White
Write-Host ""
Write-Host "Method 1: Via Google Cloud Console" -ForegroundColor Green
Write-Host "1. Go to Network Services > Cloud CDN: https://console.cloud.google.com/net-services/cdn" -ForegroundColor White
Write-Host "2. Click 'ADD ORIGIN'" -ForegroundColor White
Write-Host "3. Select 'Cloud Run' as the origin type" -ForegroundColor White
Write-Host "4. Choose your region: us-central1" -ForegroundColor White
Write-Host "5. Select service: uwsgaming-frontend" -ForegroundColor White
Write-Host "6. Configure caching rules (optional)" -ForegroundColor White
Write-Host "7. Click 'ADD'" -ForegroundColor White
Write-Host ""
Write-Host "Method 2: Via Load Balancer" -ForegroundColor Green
Write-Host "1. Go to Network Services > Load Balancing" -ForegroundColor White
Write-Host "2. Create HTTP(S) Load Balancer" -ForegroundColor White
Write-Host "3. Add Backend Service pointing to Cloud Run" -ForegroundColor White
Write-Host "4. Enable Cloud CDN on the backend service" -ForegroundColor White
Write-Host "5. Configure frontend with your custom domain" -ForegroundColor White
Write-Host ""
Write-Host "Benefits of Cloud CDN:" -ForegroundColor Cyan
Write-Host "- Global edge caching for faster content delivery" -ForegroundColor White
Write-Host "- Reduced origin server load" -ForegroundColor White
Write-Host "- Better performance for users worldwide" -ForegroundColor White
Write-Host "- Automatic cache invalidation support" -ForegroundColor White

Write-Host "`n6. SSL CERTIFICATES" -ForegroundColor Yellow
Write-Host "Google Cloud will automatically provision SSL certificates" -ForegroundColor White
Write-Host "This may take 15-60 minutes after DNS propagation" -ForegroundColor White
Write-Host "With CDN: SSL termination happens at the edge locations" -ForegroundColor White

Write-Host "`n7. TESTING" -ForegroundColor Yellow
Write-Host "Test current frontend: $frontendUrl" -ForegroundColor White
Write-Host "Admin login:" -ForegroundColor Green
Write-Host "Email: admin@uwsgaming.org" -ForegroundColor White
Write-Host "Password: KG_Admin_2025_de3e3b4e87c10f6e775b6bdcad274ced" -ForegroundColor White

# Test current frontend
Write-Host "`nTesting current frontend service..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $frontendUrl -Method Head -TimeoutSec 10
    Write-Host "Frontend Status: $($response.StatusCode) - Service is responding!" -ForegroundColor Green
} catch {
    Write-Host "Frontend Status: Error - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n8. MONITORING AND VERIFICATION" -ForegroundColor Yellow
Write-Host "After DNS propagation (can take up to 48 hours):" -ForegroundColor White
Write-Host ""
Write-Host "Check domain status:" -ForegroundColor Green
Write-Host "gcloud run domain-mappings list --region=us-central1" -ForegroundColor Gray
Write-Host ""
Write-Host "Verify SSL certificate:" -ForegroundColor Green
Write-Host "gcloud run domain-mappings describe uwsgaming.org --region=us-central1" -ForegroundColor Gray
Write-Host ""
Write-Host "Test the website:" -ForegroundColor Green
Write-Host "curl -I https://uwsgaming.org" -ForegroundColor Gray
Write-Host "curl -I https://api.uwsgaming.org" -ForegroundColor Gray
Write-Host ""
Write-Host "Monitor Cloud CDN (if enabled):" -ForegroundColor Green
Write-Host "gcloud compute backend-services list" -ForegroundColor Gray
Write-Host "gcloud compute url-maps list" -ForegroundColor Gray
Write-Host ""
Write-Host "IMPORTANT: Change the admin password after first login!" -ForegroundColor Red

Write-Host "`n=== DOMAIN SETUP COMPLETE ===" -ForegroundColor Green
Write-Host "Your uwsgaming.org domain should be live within 15-60 minutes" -ForegroundColor White
Write-Host "depending on DNS propagation and SSL certificate provisioning." -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Add the DNS records to your domain registrar" -ForegroundColor White
Write-Host "2. Complete domain mapping in Google Cloud Console" -ForegroundColor White
Write-Host "3. Optionally set up Cloud CDN for better performance" -ForegroundColor White
Write-Host "4. Wait for SSL certificate provisioning" -ForegroundColor White
Write-Host "5. Test the live domain and change admin password" -ForegroundColor White
