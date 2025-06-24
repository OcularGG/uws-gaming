# Deploy Discord Bot to Cloud Run
# This script builds and deploys the KrakenGaming Discord bot

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "kraken-gaming",

    [Parameter(Mandatory=$false)]
    [string]$Region = "us-central1"
)

$ErrorActionPreference = "Stop"

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"

Write-Host "🤖 Deploying KrakenGaming Discord Bot..." -ForegroundColor $Yellow

# Check if we're in the right directory
if (-not (Test-Path "apps/discord-bot/Dockerfile")) {
    Write-Host "❌ Error: Must run from project root directory" -ForegroundColor $Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor $Red
    exit 1
}

Write-Host "📦 Building and deploying Discord bot..." -ForegroundColor $Yellow

try {
    # Submit build to Cloud Build
    $buildResult = gcloud builds submit --config=cloudbuild-discord-bot.yaml --project=$ProjectId . 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Discord bot deployed successfully!" -ForegroundColor $Green
        Write-Host "🔍 Check bot status:" -ForegroundColor $Yellow
        Write-Host "   - Cloud Run: https://console.cloud.google.com/run?project=$ProjectId" -ForegroundColor $Yellow
        Write-Host "   - Logs: gcloud logs read --project=$ProjectId --resource-names=kraken-discord-bot" -ForegroundColor $Yellow
        Write-Host "   - Discord: Bot should appear online in your Discord server" -ForegroundColor $Yellow
    } else {
        Write-Host "❌ Build failed:" -ForegroundColor $Red
        Write-Host $buildResult -ForegroundColor $Red
        exit 1
    }
} catch {
    Write-Host "❌ Deployment error: $_" -ForegroundColor $Red
    exit 1
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor $Green
Write-Host "1. Check Discord server - bot should show as online" -ForegroundColor $Yellow
Write-Host "2. Test bot commands like /ping" -ForegroundColor $Yellow
Write-Host "3. Monitor logs for any errors" -ForegroundColor $Yellow
Write-Host "`n🚀 Discord bot deployment complete!" -ForegroundColor $Green
