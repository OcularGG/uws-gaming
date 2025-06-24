#!/usr/bin/env pwsh
# Deploy KrakenGaming frontend with authentication secrets

Write-Host "🚀 Deploying KrakenGaming frontend with authentication..." -ForegroundColor Green

# First, let's update the production service with secrets
Write-Host "📦 Updating production service with secrets..." -ForegroundColor Yellow
gcloud run deploy kraken-frontend-prod `
  --image gcr.io/kraken-gaming/frontend-prod `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --port 3000 `
  --memory 512Mi `
  --cpu 1 `
  --set-env-vars="NEXT_PUBLIC_ENV=production,NEXT_PUBLIC_DOMAIN=krakengaming.org,NODE_ENV=production,NEXTAUTH_URL=https://krakengaming.org" `
  --set-secrets="DISCORD_CLIENT_ID=discord-client-id:latest,DISCORD_CLIENT_SECRET=discord-client-secret:latest,NEXTAUTH_SECRET=nextauth-secret:latest"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Production service updated successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to update production service" -ForegroundColor Red
    exit 1
}

# Now update the preview service
Write-Host "🔍 Updating preview service with secrets..." -ForegroundColor Yellow
gcloud run deploy kraken-frontend-preview `
  --image gcr.io/kraken-gaming/frontend-prod `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --port 3000 `
  --memory 512Mi `
  --cpu 1 `
  --set-env-vars="NEXT_PUBLIC_ENV=preview,NEXT_PUBLIC_DOMAIN=preview.krakengaming.org,NODE_ENV=production,NEXTAUTH_URL=https://preview.krakengaming.org" `
  --set-secrets="DISCORD_CLIENT_ID=discord-client-id:latest,DISCORD_CLIENT_SECRET=discord-client-secret:latest,NEXTAUTH_SECRET=nextauth-secret:latest"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Preview service updated successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to update preview service" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Both services deployed with authentication secrets!" -ForegroundColor Green
Write-Host "🔗 Production: https://krakengaming.org" -ForegroundColor Cyan
Write-Host "🔗 Preview: https://preview.krakengaming.org" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test Discord OAuth login on production" -ForegroundColor White
Write-Host "2. Check /auth/debug page for session info" -ForegroundColor White
Write-Host "3. Verify authentication works properly" -ForegroundColor White
