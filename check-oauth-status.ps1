# Comprehensive OAuth Status Check
# Run this after updating Discord OAuth credentials

Write-Host "🔍 Checking OAuth Configuration Status..." -ForegroundColor Cyan
Write-Host ""

# Check Cloud Run services
Write-Host "📦 Checking Cloud Run Services:" -ForegroundColor Yellow
$services = @(
    "krakengaming-frontend",
    "krakengaming-frontend-preview",
    "krakengaming-backend",
    "krakengaming-backend-preview",
    "krakengaming-discord-bot"
)

foreach ($service in $services) {
    try {
        $status = gcloud run services describe $service --region=us-central1 --format="value(status.url)" 2>$null
        if ($status) {
            Write-Host "✅ $service`: $status" -ForegroundColor Green
        } else {
            Write-Host "❌ $service`: Not found or error" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $service`: Error checking status" -ForegroundColor Red
    }
}

Write-Host ""

# Check secrets
Write-Host "🔐 Checking Secrets:" -ForegroundColor Yellow
$secrets = @(
    "auth-discord-id",
    "auth-discord-secret",
    "auth-secret",
    "auth-url",
    "auth-url-preview",
    "discord-bot-token",
    "database-url"
)

foreach ($secret in $secrets) {
    try {
        $exists = gcloud secrets describe $secret --format="value(name)" 2>$null
        if ($exists) {
            Write-Host "✅ $secret`: Exists" -ForegroundColor Green
        } else {
            Write-Host "❌ $secret`: Not found" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $secret`: Error checking" -ForegroundColor Red
    }
}

Write-Host ""

# Test OAuth endpoints
Write-Host "🌐 Testing OAuth Endpoints:" -ForegroundColor Yellow

$urls = @(
    "https://krakengaming.org/api/auth/signin",
    "https://preview.krakengaming.org/api/auth/signin"
)

foreach ($url in $urls) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method HEAD -TimeoutSec 10 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $url`: Accessible" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $url`: Status $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $url`: Not accessible" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🧪 Manual Testing Steps:" -ForegroundColor Cyan
Write-Host "1. Visit: https://krakengaming.org" -ForegroundColor White
Write-Host "2. Click 'Sign in with Discord'" -ForegroundColor White
Write-Host "3. Should redirect to Discord authorization" -ForegroundColor White
Write-Host "4. After approval, should redirect back and sign in" -ForegroundColor White
Write-Host ""
Write-Host "5. Repeat for preview: https://preview.krakengaming.org" -ForegroundColor White
