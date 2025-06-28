#!/usr/bin/env pwsh
# Verify Discord Developer Portal Configuration

Write-Host "=== Discord Configuration Verification ===" -ForegroundColor Cyan

# Get secrets from Google Cloud
Write-Host "`nRetrieving Discord credentials from Google Cloud..." -ForegroundColor Yellow
$CLIENT_ID = gcloud secrets versions access latest --secret="auth-discord-id"
$CLIENT_SECRET = gcloud secrets versions access latest --secret="auth-discord-secret"

Write-Host "Client ID: $CLIENT_ID" -ForegroundColor Green
Write-Host "Client Secret: $($CLIENT_SECRET.Substring(0,8))..." -ForegroundColor Green

Write-Host "`n=== Required Discord Developer Portal Settings ===" -ForegroundColor Cyan
Write-Host "1. Go to: https://discord.com/developers/applications" -ForegroundColor White
Write-Host "2. Select your application with ID: $CLIENT_ID" -ForegroundColor White
Write-Host "3. Go to OAuth2 -> General" -ForegroundColor White
Write-Host "4. Verify these Redirect URIs are configured:" -ForegroundColor White
Write-Host "   - https://krakengaming.org/api/auth/callback/discord" -ForegroundColor Yellow
Write-Host "   - https://preview.krakengaming.org/api/auth/callback/discord" -ForegroundColor Yellow
Write-Host "   - http://localhost:3000/api/auth/callback/discord" -ForegroundColor Yellow

Write-Host "`n=== Testing Discord OAuth Endpoint ===" -ForegroundColor Cyan
try {
    $authUrl = "https://discord.com/api/oauth2/authorize?client_id=$CLIENT_ID&redirect_uri=https%3A%2F%2Fkrakengaming.org%2Fapi%2Fauth%2Fcallback%2Fdiscord&response_type=code&scope=identify%20email"
    Invoke-WebRequest -Uri $authUrl -Method HEAD -ErrorAction Stop | Out-Null
    Write-Host "✓ Discord OAuth endpoint is accessible" -ForegroundColor Green
} catch {
    Write-Host "✗ Discord OAuth endpoint test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Testing Client ID Validity ===" -ForegroundColor Cyan
try {
    $apiUrl = "https://discord.com/api/v10/applications/$CLIENT_ID/rpc"
    Invoke-WebRequest -Uri $apiUrl -Method GET -ErrorAction Stop | Out-Null
    Write-Host "✓ Client ID is valid" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq "Unauthorized") {
        Write-Host "✓ Client ID is valid (got expected 401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "✗ Client ID validation failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Verify the redirect URIs in Discord Developer Portal" -ForegroundColor White
Write-Host "2. Make sure you are using the CLIENT SECRET, not the BOT TOKEN" -ForegroundColor White
Write-Host "3. Test the OAuth flow after verifying the above" -ForegroundColor White
