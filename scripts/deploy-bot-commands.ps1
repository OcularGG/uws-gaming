# Deploy Discord Bot Slash Commands
# Run this after the bot is deployed to register slash commands

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "kraken-gaming"
)

$ErrorActionPreference = "Stop"

Write-Host "🔧 Deploying Discord bot slash commands..." -ForegroundColor Yellow

# Build and run the command deployment locally with the Discord credentials
$env:NODE_ENV = "production"
$env:DISCORD_BOT_TOKEN = "MTM4NjgyODI2MzM1MDg2MjAyNQ.GTOjAV.O4Toi91JUYXb8VwBJ_Qgaraz7kJ5xKWfhTX_e4"
$env:DISCORD_CLIENT_ID = "1386828263350862025"
$env:DISCORD_CLIENT_SECRET = "Pj89xzjlPiOhkCxMT5Stk9iRQ9NpyQ0a"

try {
    Set-Location "apps/discord-bot"

    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install

    Write-Host "🔨 Building TypeScript..." -ForegroundColor Yellow
    npm run build

    Write-Host "🚀 Deploying slash commands..." -ForegroundColor Yellow
    npm run deploy-commands

    Write-Host "✅ Slash commands deployed successfully!" -ForegroundColor Green
    Write-Host "Available commands:" -ForegroundColor Yellow
    Write-Host "  /ping - Test bot latency" -ForegroundColor Cyan
    Write-Host "  /info - Show KrakenGaming information" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Error deploying commands: $_" -ForegroundColor Red
    exit 1
} finally {
    Set-Location "../.."
}

Write-Host "`n🎯 Commands are now available in Discord!" -ForegroundColor Green
