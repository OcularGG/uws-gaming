# Fix Authentication - Deploy with Discord OAuth credentials
# Replace these with your actual values from Discord Developer Portal

$DISCORD_CLIENT_ID = "1386828263350862025"
$DISCORD_CLIENT_SECRET = "k6i5sueue7rLyEcE-3odwJTeVqNNTuj3"
$NEXTAUTH_SECRET = "kraken-gaming-nextauth-secret-2025-production-secure-key-v1"

Write-Host "🔐 Creating secrets in Google Secret Manager..."

# Create secrets (PowerShell compatible)
echo $DISCORD_CLIENT_ID | gcloud secrets create discord-client-id --data-file=-
echo $DISCORD_CLIENT_SECRET | gcloud secrets create discord-client-secret --data-file=-
echo $NEXTAUTH_SECRET | gcloud secrets create nextauth-secret --data-file=-

Write-Host "🚀 Deploying production with authentication..."

# Deploy production with all environment variables
gcloud run deploy kraken-frontend-prod `
  --image gcr.io/kraken-gaming/frontend-prod `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --port 3000 `
  --memory 512Mi `
  --cpu 1 `
  --set-env-vars="NEXT_PUBLIC_ENV=production,NEXT_PUBLIC_DOMAIN=krakengaming.org,NODE_ENV=production,NEXTAUTH_URL=https://kraken-frontend-prod-1044201442446.us-central1.run.app" `
  --set-secrets="DISCORD_CLIENT_ID=discord-client-id:latest,DISCORD_CLIENT_SECRET=discord-client-secret:latest,NEXTAUTH_SECRET=nextauth-secret:latest"

Write-Host "🔍 Deploying preview with authentication..."

# Deploy preview with all environment variables
gcloud run deploy kraken-frontend-preview `
  --image gcr.io/kraken-gaming/frontend-prod `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --port 3000 `
  --memory 512Mi `
  --cpu 1 `
  --set-env-vars="NEXT_PUBLIC_ENV=preview,NEXT_PUBLIC_DOMAIN=preview.krakengaming.org,NODE_ENV=production,NEXTAUTH_URL=https://kraken-frontend-preview-1044201442446.us-central1.run.app" `
  --set-secrets="DISCORD_CLIENT_ID=discord-client-id:latest,DISCORD_CLIENT_SECRET=discord-client-secret:latest,NEXTAUTH_SECRET=nextauth-secret:latest"

Write-Host "✅ Authentication fix complete!"
Write-Host "🌐 Production: https://kraken-frontend-prod-1044201442446.us-central1.run.app"
Write-Host "🔍 Preview: https://kraken-frontend-preview-1044201442446.us-central1.run.app"
