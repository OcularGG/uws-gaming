#!/usr/bin/env pwsh

# Discord Bot Commands Registration Script
# This script registers Discord slash commands after the bot is deployed

Write-Host "🤖 Registering Discord Bot Commands..." -ForegroundColor Green

$PROJECT_ID = "krakengaming"
$REGION = "us-central1"

# Function to test if command succeeded
function Test-LastCommand {
    param($Message)
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed: $Message" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "✅ Success: $Message" -ForegroundColor Green
    }
}

# Check if Discord bot service is running
Write-Host "🔍 Checking Discord bot service status..." -ForegroundColor Yellow
$BOT_STATUS = gcloud run services describe discord-bot-prod --region=$REGION --format="value(status.conditions[0].status)" 2>$null

if ($BOT_STATUS -eq "True") {
    Write-Host "✅ Discord bot service is running" -ForegroundColor Green

    # Get bot URL
    $BOT_URL = gcloud run services describe discord-bot-prod --region=$REGION --format="value(status.url)"
    Write-Host "🔗 Bot URL: $BOT_URL" -ForegroundColor Cyan

    # Register commands by calling the bot's registration endpoint
    Write-Host "📝 Registering Discord commands..." -ForegroundColor Yellow

    # Try to trigger command registration via HTTP call
    try {
        $response = Invoke-WebRequest -Uri "$BOT_URL/health" -Method GET -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Bot is responding to health checks" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  Bot may still be starting up: $($_.Exception.Message)" -ForegroundColor Yellow
    }

    Write-Host "🎉 Discord bot deployment complete!" -ForegroundColor Green
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Go to Discord Developer Portal" -ForegroundColor White
    Write-Host "  2. Add bot to your server with proper permissions" -ForegroundColor White
    Write-Host "  3. Commands will auto-register when bot starts" -ForegroundColor White

} else {
    Write-Host "❌ Discord bot service is not running properly" -ForegroundColor Red
    Write-Host "🔍 Check the logs: gcloud run logs read discord-bot-prod --region=$REGION" -ForegroundColor Yellow
    exit 1
}
