# Create a test script to verify environment variables in Cloud Run

Write-Host "=== Testing Cloud Run Environment Variables ===" -ForegroundColor Green

# Create a temporary file with a simple test endpoint
$testCode = @"
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID || 'undefined',
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET ? 'has_value_length_' + process.env.AUTH_DISCORD_SECRET.length : 'undefined',
    AUTH_SECRET: process.env.AUTH_SECRET ? 'has_value_length_' + process.env.AUTH_SECRET.length : 'undefined',
    AUTH_URL: process.env.AUTH_URL || 'undefined',
    DATABASE_URL: process.env.DATABASE_URL ? 'has_value' : 'undefined'
  });
}
"@

# Create the test endpoint file
$testDir = "apps/frontend/src/app/api/debug-env"
New-Item -ItemType Directory -Force -Path $testDir | Out-Null
$testCode | Out-File -FilePath "$testDir/route.ts" -Encoding UTF8

Write-Host "Created temporary debug endpoint at /api/debug-env" -ForegroundColor Yellow

# Redeploy with the debug endpoint
Write-Host "Redeploying with debug endpoint..." -ForegroundColor Yellow
gcloud builds submit --config cloudbuild-frontend.yaml

Write-Host "Testing debug endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://krakengaming.org/api/debug-env" -Method GET
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Environment Variables Status:" -ForegroundColor Green
    $json | Format-Table -AutoSize
}
catch {
    Write-Host "Error testing debug endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

# Clean up
Write-Host "Cleaning up debug endpoint..." -ForegroundColor Yellow
Remove-Item -Path $testDir -Recurse -Force
Write-Host "Debug test complete" -ForegroundColor Green
