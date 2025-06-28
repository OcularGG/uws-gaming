# Test Discord OAuth redirect
try {
    $response = Invoke-WebRequest -Uri "https://krakengaming.org/api/auth/signin/discord" -MaximumRedirection 0 -ErrorAction Stop
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Headers: $($response.Headers.GetEnumerator() | Out-String)"
}
catch {
    $errorResponse = $_.Exception.Response
    Write-Host "Status: $($errorResponse.StatusCode)"
    $location = $errorResponse.Headers.Location
    if ($location) {
        Write-Host "Redirect Location: $location"
        if ($location -like "*discord.com*") {
            Write-Host "✅ SUCCESS: Redirecting to Discord OAuth!" -ForegroundColor Green
        } else {
            Write-Host "❌ FAILED: Not redirecting to Discord" -ForegroundColor Red
        }
    }
}
