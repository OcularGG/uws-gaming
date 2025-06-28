# Discord OAuth Configuration Checklist
# Use this to verify your Discord application settings

Write-Host "🔍 Discord OAuth Configuration Checklist" -ForegroundColor Cyan
Write-Host "Please verify the following in Discord Developer Portal:" -ForegroundColor White
Write-Host ""

Write-Host "1. Go to: https://discord.com/developers/applications" -ForegroundColor Yellow
Write-Host "2. Select your KrakenGaming application" -ForegroundColor Yellow
Write-Host "3. Go to OAuth2 → General" -ForegroundColor Yellow
Write-Host ""

Write-Host "4. Verify Redirect URIs include:" -ForegroundColor Green
Write-Host "   ✓ https://krakengaming.org/api/auth/callback/discord" -ForegroundColor White
Write-Host "   ✓ https://preview.krakengaming.org/api/auth/callback/discord" -ForegroundColor White
Write-Host ""

Write-Host "5. Copy the following values:" -ForegroundColor Green
Write-Host "   - Client ID (public, starts with numbers)" -ForegroundColor White
Write-Host "   - Client Secret (private, long alphanumeric string)" -ForegroundColor White
Write-Host ""

Write-Host "6. Run the fix script with your values:" -ForegroundColor Cyan
Write-Host "   .\fix-discord-oauth.ps1 -DiscordClientId 'YOUR_CLIENT_ID' -DiscordClientSecret 'YOUR_CLIENT_SECRET'" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  Make sure Client Secret is NOT the Bot Token!" -ForegroundColor Red
Write-Host "   Bot Token: Used for Discord bot (starts with 'Bot')" -ForegroundColor Yellow
Write-Host "   Client Secret: Used for OAuth (alphanumeric string)" -ForegroundColor Yellow
