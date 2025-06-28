# Test the new Auth.js Discord OAuth system

Write-Host "=== Testing New Auth.js Discord OAuth System ===" -ForegroundColor Green

# Test the new auth endpoints
Write-Host "`n1. Testing new Auth.js endpoints:" -ForegroundColor Yellow

$endpoints = @(
    "https://krakengaming.org/api/auth/providers",
    "https://krakengaming.org/api/auth/session",
    "https://krakengaming.org/api/auth/csrf"
)

foreach ($endpoint in $endpoints) {
    try {
        Write-Host "Testing $endpoint..." -NoNewline
        $response = Invoke-WebRequest -Uri $endpoint -Method GET -TimeoutSec 10
        Write-Host " Status: $($response.StatusCode)" -ForegroundColor Green

        if ($endpoint -like "*providers*") {
            $content = $response.Content | ConvertFrom-Json
            if ($content.discord) {
                Write-Host "  ✓ Discord provider found" -ForegroundColor Green
            } else {
                Write-Host "  ✗ Discord provider not found" -ForegroundColor Red
            }
        }
    }
    catch {
        Write-Host " Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test Discord OAuth signin
Write-Host "`n2. Testing Discord OAuth signin:" -ForegroundColor Yellow
$signinUrl = "https://krakengaming.org/api/auth/signin/discord"
Write-Host "Testing: $signinUrl"

try {
    $response = Invoke-WebRequest -Uri $signinUrl -Method GET -MaximumRedirection 0 -ErrorAction SilentlyContinue
    Write-Host "Response Status: $($response.StatusCode)"
}
catch {
    $errorResponse = $_.Exception.Response
    if ($errorResponse.StatusCode -eq 302) {
        Write-Host "Got redirect (302)" -ForegroundColor Green
        $location = $errorResponse.Headers.Location
        if ($location) {
            Write-Host "Redirect Location: $location"
            if ($location -like "*discord.com*") {
                Write-Host "✅ SUCCESS: Correctly redirecting to Discord OAuth!" -ForegroundColor Green
            } elseif ($location -like "*error*") {
                Write-Host "❌ FAILED: Redirecting to error page" -ForegroundColor Red
            } else {
                Write-Host "⚠️  WARNING: Redirecting somewhere unexpected" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "❌ FAILED: Status $($errorResponse.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`n3. Checking secrets configuration:" -ForegroundColor Yellow
$discordId = gcloud secrets versions access latest --secret="auth-discord-id"
Write-Host "Discord Client ID: $discordId"

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
Write-Host "If Discord OAuth signin redirects to Discord, the implementation is working!"
