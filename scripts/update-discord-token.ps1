# Update Discord Bot Token in Cloud Run Services
# Run this after enabling the bot user and getting a new token
# Usage: .\update-discord-token.ps1 "YOUR_BOT_TOKEN_HERE"

param(
    [Parameter(Mandatory=$true)]
    [string]$DiscordBotToken
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"

Write-Host "Updating Discord Bot Token in Cloud Run Services..." -ForegroundColor $Yellow

# Check if gcloud is installed
try {
    gcloud version | Out-Null
} catch {
    Write-Host "Error: gcloud CLI is not installed or not in PATH" -ForegroundColor $Red
    Write-Host "Please install Google Cloud CLI first: https://cloud.google.com/sdk/docs/install" -ForegroundColor $Yellow
    exit 1
}

$PROJECT_ID = "kraken-gaming"
$REGION = "us-central1"

Write-Host "Updating frontend service..." -ForegroundColor $Yellow
try {
    gcloud run services update kraken-frontend-prod `
        --region=$REGION `
        --project=$PROJECT_ID `
        --update-env-vars="DISCORD_BOT_TOKEN=$DiscordBotToken,DISCORD_GUILD_ID=1386130264895520868"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend service updated successfully!" -ForegroundColor $Green
    } else {
        Write-Host "❌ Failed to update frontend service" -ForegroundColor $Red
        exit 1
    }
} catch {
    Write-Host "❌ Error updating frontend service: $_" -ForegroundColor $Red
    exit 1
}

Write-Host "Updating preview service..." -ForegroundColor $Yellow
try {
    gcloud run services update kraken-frontend-preview `
        --region=$REGION `
        --project=$PROJECT_ID `
        --update-env-vars="DISCORD_BOT_TOKEN=$DiscordBotToken,DISCORD_GUILD_ID=1386130264895520868"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Preview service updated successfully!" -ForegroundColor $Green
    } else {
        Write-Host "❌ Failed to update preview service" -ForegroundColor $Red
        exit 1
    }
} catch {
    Write-Host "❌ Error updating preview service: $_" -ForegroundColor $Red
    exit 1
}

Write-Host "`n✅ Discord bot token updated in both services!" -ForegroundColor $Green
Write-Host "Note: Services will restart automatically with the new token." -ForegroundColor $Yellow
Write-Host "`nYou can now test the Discord bot invite URL:" -ForegroundColor $Yellow
Write-Host "https://discord.com/api/oauth2/authorize?client_id=1386828263350862025&permissions=8&scope=bot%20applications.commands%20identify%20email%20guilds%20guilds.join%20guilds.members.read%20messages.read" -ForegroundColor $Yellow
