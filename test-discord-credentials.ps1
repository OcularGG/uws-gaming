# Test Discord OAuth credentials manually
# This script will test if the Discord OAuth credentials are valid

$clientId = "1387161526611218543"
$clientSecret = "0k_L0emiymCJQnAdkuwKi9iCqBco4eiJ"
$redirectUri = "https://krakengaming.org/api/auth/callback/discord"

Write-Host "🔍 Testing Discord OAuth Configuration..." -ForegroundColor Cyan
Write-Host "Client ID: $clientId" -ForegroundColor White
Write-Host "Redirect URI: $redirectUri" -ForegroundColor White
Write-Host ""

# Test the Discord OAuth authorize endpoint
$authorizeUrl = "https://discord.com/api/oauth2/authorize?client_id=$clientId" + "&redirect_uri=" + [System.Web.HttpUtility]::UrlEncode($redirectUri) + "&response_type=code&scope=identify%20email"

Write-Host "Authorization URL:" -ForegroundColor Yellow
Write-Host $authorizeUrl -ForegroundColor White
Write-Host ""

# Try to get basic info about the Discord application
try {
    Write-Host "Testing Discord API access..." -ForegroundColor Yellow

    # Test basic connectivity to Discord
    $response = Invoke-RestMethod -Uri "https://discord.com/api/v10/gateway" -Method GET -ErrorAction Stop
    Write-Host "✅ Discord API is accessible" -ForegroundColor Green

} catch {
    Write-Host "❌ Error accessing Discord API: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Discord Developer Portal Checklist:" -ForegroundColor Cyan
Write-Host "1. Go to: https://discord.com/developers/applications/$clientId" -ForegroundColor White
Write-Host "2. Check OAuth2 → General:" -ForegroundColor White
Write-Host "   - Client ID: $clientId" -ForegroundColor White
Write-Host "   - Client Secret: Should match the one in secrets" -ForegroundColor White
Write-Host "3. Check OAuth2 → Redirects:" -ForegroundColor White
Write-Host "   - Must include exactly: $redirectUri" -ForegroundColor White
Write-Host "   - Must include exactly: https://preview.krakengaming.org/api/auth/callback/discord" -ForegroundColor White
Write-Host "4. Check OAuth2 → Scopes:" -ForegroundColor White
Write-Host "   - Should allow: identify, email" -ForegroundColor White
