# Quick secrets setup for KrakenGaming
Write-Host "Setting up Google Cloud Secrets for KrakenGaming..." -ForegroundColor Green

$PROJECT_ID = "kraken-gaming"
gcloud config set project $PROJECT_ID

# Create secrets with placeholder values (replace with real values later)
Write-Host "Creating secrets with placeholder values..." -ForegroundColor Yellow

# Database URL (placeholder - replace with real PostgreSQL connection string)
$DATABASE_URL = "postgresql://user:password@localhost:5432/krakengaming"
Write-Output $DATABASE_URL | gcloud secrets create database-url --data-file=- --project=$PROJECT_ID

# Discord Bot Token (placeholder - get from Discord Developer Portal)
$DISCORD_TOKEN = "YOUR_DISCORD_BOT_TOKEN_HERE"
Write-Output $DISCORD_TOKEN | gcloud secrets create discord-bot-token --data-file=- --project=$PROJECT_ID

# Discord Client ID (placeholder - get from Discord Developer Portal)
$DISCORD_CLIENT_ID = "YOUR_DISCORD_CLIENT_ID_HERE"
Write-Output $DISCORD_CLIENT_ID | gcloud secrets create discord-client-id --data-file=- --project=$PROJECT_ID

# Discord Client Secret (placeholder - get from Discord Developer Portal)
$DISCORD_CLIENT_SECRET = "YOUR_DISCORD_CLIENT_SECRET_HERE"
Write-Output $DISCORD_CLIENT_SECRET | gcloud secrets create discord-client-secret --data-file=- --project=$PROJECT_ID

# NextAuth Secret (random string)
$NEXTAUTH_SECRET = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
Write-Output $NEXTAUTH_SECRET | gcloud secrets create nextauth-secret --data-file=- --project=$PROJECT_ID

Write-Host "🎉 Secrets created with placeholder values!" -ForegroundColor Green
Write-Host "⚠️  Remember to update these with real values using:" -ForegroundColor Yellow
Write-Host "gcloud secrets versions add SECRET_NAME --data-file=- < value.txt" -ForegroundColor Cyan
