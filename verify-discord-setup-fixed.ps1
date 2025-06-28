# Script to verify Discord OAuth setup and test the flow

Write-Host "=== Discord OAuth Setup Verification ===" -ForegroundColor Green

# Check our secrets
Write-Host "`n1. Checking stored secrets:" -ForegroundColor Yellow
$discordId = gcloud secrets versions access latest --secret="auth-discord-id"
$discordSecretLength = (gcloud secrets versions access latest --secret="auth-discord-secret" | Measure-Object -Character).Characters
$authSecretLength = (gcloud secrets versions access latest --secret="auth-secret" | Measure-Object -Character).Characters

Write-Host "Discord Client ID: $discordId"
Write-Host "Discord Secret Length: $discordSecretLength characters"
Write-Host "Auth Secret Length: $authSecretLength characters"

# Test the OAuth endpoints
Write-Host "`n2. Testing OAuth endpoints:" -ForegroundColor Yellow

$endpoints = @(
    "https://krakengaming.org/api/auth/signin",
    "https://krakengaming.org/api/auth/providers",
    "https://krakengaming.org/api/auth/csrf"
)

foreach ($endpoint in $endpoints) {
    try {
        Write-Host "Testing $endpoint..." -NoNewline
        $response = Invoke-WebRequest -Uri $endpoint -Method GET -TimeoutSec 10
        Write-Host " Status: $($response.StatusCode)" -ForegroundColor Green
    }
    catch {
        Write-Host " Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Check current deployment
Write-Host "`n3. Checking current deployment:" -ForegroundColor Yellow
gcloud run services describe krakengaming-frontend --region=us-central1 --format="value(spec.template.spec.containers[0].env[].name,spec.template.spec.containers[0].env[].value)" | Where-Object { $_ -match "AUTH|DISCORD" }

Write-Host "`n4. Required Discord Developer Portal Settings:" -ForegroundColor Yellow
Write-Host "Application ID: $discordId"
Write-Host "Redirect URIs should include:"
Write-Host "  - https://krakengaming.org/api/auth/callback/discord"
Write-Host "  - https://preview.krakengaming.org/api/auth/callback/discord"
Write-Host "  - http://localhost:3000/api/auth/callback/discord"

Write-Host "`n5. Testing Discord OAuth URL:" -ForegroundColor Yellow
$testUrl = "https://krakengaming.org/api/auth/signin/discord"
Write-Host "Test URL: $testUrl"

try {
    $response = Invoke-WebRequest -Uri $testUrl -Method GET -MaximumRedirection 0 -ErrorAction SilentlyContinue
    Write-Host "Response Status: $($response.StatusCode)"
    if ($response.Headers.Location) {
        Write-Host "Redirect Location: $($response.Headers.Location)"
    }
}
catch {
    $errorResponse = $_.Exception.Response
    if ($errorResponse.StatusCode -eq 302) {
        Write-Host "Got redirect (302) - checking location header..."
        $location = $errorResponse.Headers.Location
        Write-Host "Redirect to: $location"

        if ($location -like "*discord.com*") {
            Write-Host "Correctly redirecting to Discord" -ForegroundColor Green
        } else {
            Write-Host "Not redirecting to Discord" -ForegroundColor Red
        }
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Verification Complete ===" -ForegroundColor Green
