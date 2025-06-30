# Simple Database Credentials Reset Script
param(
    [string]$ProjectId = "uws-gaming",
    [string]$DatabaseInstance = "uws-gaming-db",
    [string]$DatabaseName = "uwsgaming",
    [string]$DatabaseUser = "uwsgaming"
)

Write-Host "Starting database credentials reset..." -ForegroundColor Cyan
Write-Host "Project: $ProjectId" -ForegroundColor Yellow
Write-Host "Database Instance: $DatabaseInstance" -ForegroundColor Yellow

# Set project
gcloud config set project $ProjectId

# Generate new password
Write-Host "Generating new secure password..." -ForegroundColor Cyan
$chars = [char[]]([char]'a'..[char]'z') + [char[]]([char]'A'..[char]'Z') + [char[]]([char]'0'..[char]'9')
$newPassword = -join ((1..32) | ForEach-Object { Get-Random -InputObject $chars })
Write-Host "Password generated (32 characters)" -ForegroundColor Green

# Update database user password
Write-Host "Updating database user password..." -ForegroundColor Cyan
try {
    gcloud sql users set-password $DatabaseUser --instance=$DatabaseInstance --password=$newPassword
    Write-Host "Database password updated successfully" -ForegroundColor Green
} catch {
    Write-Host "Failed to update database password" -ForegroundColor Red
    exit 1
}

# Get database info
Write-Host "Getting database connection info..." -ForegroundColor Cyan
$dbConnection = gcloud sql instances describe $DatabaseInstance --format="value(connectionName)"
$dbPublicIp = gcloud sql instances describe $DatabaseInstance --format="value(ipAddresses[0].ipAddress)"

Write-Host "Connection name: $dbConnection" -ForegroundColor Green
Write-Host "Public IP: $dbPublicIp" -ForegroundColor Green

# Create database URLs
$prodDatabaseUrl = "postgresql://${DatabaseUser}:${newPassword}@/${DatabaseName}?host=/cloudsql/$dbConnection"
$localDatabaseUrl = "postgresql://${DatabaseUser}:${newPassword}@${dbPublicIp}:5432/$DatabaseName"

# Update secrets
Write-Host "Updating Google Secret Manager secrets..." -ForegroundColor Cyan

# Update existing secret
Write-Output $prodDatabaseUrl | gcloud secrets versions add uws-gaming-database-url --data-file=-
Write-Host "Updated uws-gaming-database-url secret" -ForegroundColor Green

# Create/update deployment secret
$deploySecretExists = gcloud secrets describe database-url-prod 2>$null
if ($deploySecretExists) {
    Write-Output $prodDatabaseUrl | gcloud secrets versions add database-url-prod --data-file=-
    Write-Host "Updated database-url-prod secret" -ForegroundColor Green
} else {
    Write-Output $prodDatabaseUrl | gcloud secrets create database-url-prod --data-file=-
    Write-Host "Created database-url-prod secret" -ForegroundColor Green
}

# Update password secret
Write-Output $newPassword | gcloud secrets versions add uws-gaming-db-password --data-file=-
Write-Host "Updated uws-gaming-db-password secret" -ForegroundColor Green

# Create local environment file
Write-Host "Creating local environment file..." -ForegroundColor Cyan
$envContent = @"
# Local Development Environment
NODE_ENV=development
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_DOMAIN=localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=UWS Gaming (Local)

# Database
DATABASE_URL=$localDatabaseUrl
DIRECT_URL=$localDatabaseUrl

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-dev-secret-$(Get-Random -Minimum 1000 -Maximum 9999)

# JWT
JWT_SECRET=local-jwt-secret-$(Get-Random -Minimum 1000 -Maximum 9999)

# API
API_PORT=4000
API_HOST=localhost
API_CORS_ORIGIN=http://localhost:3000
"@

Set-Content -Path ".env.local" -Value $envContent -Encoding UTF8
Write-Host "Created .env.local" -ForegroundColor Green

# Update production environment
Write-Host "Updating production environment..." -ForegroundColor Cyan
if (Test-Path ".env.production") {
    $prodContent = Get-Content ".env.production"
    $updatedContent = @()
    
    foreach ($line in $prodContent) {
        if ($line -like "DATABASE_URL=*") {
            $updatedContent += "DATABASE_URL=$prodDatabaseUrl"
        } elseif ($line -like "DIRECT_URL=*") {
            $updatedContent += "DIRECT_URL=$prodDatabaseUrl"
        } else {
            $updatedContent += $line
        }
    }
    
    Set-Content -Path ".env.production" -Value $updatedContent -Encoding UTF8
    Write-Host "Updated .env.production" -ForegroundColor Green
}

Write-Host "Database credentials reset completed!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "- Generated new 32-character password" -ForegroundColor Yellow
Write-Host "- Updated database user password in Cloud SQL" -ForegroundColor Yellow
Write-Host "- Updated Google Secret Manager secrets" -ForegroundColor Yellow
Write-Host "- Created .env.local for local development" -ForegroundColor Yellow
Write-Host "- Updated .env.production" -ForegroundColor Yellow
Write-Host "" -ForegroundColor White
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test local connection with your app" -ForegroundColor Yellow
Write-Host "2. Redeploy Cloud Run services to pick up new secrets" -ForegroundColor Yellow
Write-Host "3. Test production deployment" -ForegroundColor Yellow
