# Quick OAuth Test
# Test the current OAuth configuration

param(
    [string]$Environment = "production"
)

$baseUrl = if ($Environment -eq "production") { "https://krakengaming.org" } else { "https://preview.krakengaming.org" }

Write-Host "🧪 Testing OAuth for $Environment environment..." -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor White

# Test the sign-in endpoint
try {
    Write-Host "Testing /api/auth/signin..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/signin" -Method GET -TimeoutSec 10
    Write-Host "✅ Sign-in endpoint accessible (Status: $($response.StatusCode))" -ForegroundColor Green

    # Check if it contains Discord provider
    if ($response.Content -match "discord") {
        Write-Host "✅ Discord provider detected in response" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Discord provider not found in response" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error accessing sign-in endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

# Test the providers endpoint
try {
    Write-Host "Testing /api/auth/providers..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/providers" -Method GET -TimeoutSec 10
    $providers = $response.Content | ConvertFrom-Json

    if ($providers.discord) {
        Write-Host "✅ Discord provider configured:" -ForegroundColor Green
        Write-Host "   Name: $($providers.discord.name)" -ForegroundColor White
        Write-Host "   Type: $($providers.discord.type)" -ForegroundColor White
    } else {
        Write-Host "❌ Discord provider not found in providers list" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error accessing providers endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 Manual test: Visit $baseUrl and try signing in" -ForegroundColor Cyan
