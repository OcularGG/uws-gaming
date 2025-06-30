# Simple Database Credentials Backup Script
param(
    [string]$ProjectId = "uws-gaming"
)

Write-Host "Backing up current database credentials..." -ForegroundColor Cyan

# Create backup directory
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupDir = "credential-backups"
$backupPath = "$backupDir\backup_$timestamp"

if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

if (!(Test-Path $backupPath)) {
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
}

Write-Host "Backup directory: $backupPath" -ForegroundColor Yellow

# Set project
gcloud config set project $ProjectId

# Backup secrets
Write-Host "Backing up secrets..." -ForegroundColor Cyan
$secrets = @("uws-gaming-database-url", "uws-gaming-db-password", "uws-gaming-jwt-secret", "uws-gaming-nextauth-secret")

foreach ($secret in $secrets) {
    try {
        $secretValue = gcloud secrets versions access latest --secret=$secret 2>$null
        if ($secretValue) {
            Set-Content -Path "$backupPath\$secret.txt" -Value $secretValue -Encoding UTF8
            Write-Host "Backed up: $secret" -ForegroundColor Green
        } else {
            Write-Host "Secret not found: $secret" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Failed to backup: $secret" -ForegroundColor Red
    }
}

# Backup environment files
Write-Host "Backing up environment files..." -ForegroundColor Cyan
$envFiles = @(".env.local", ".env.production", ".env.example")

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Copy-Item $envFile "$backupPath\$envFile" -Force
        Write-Host "Backed up: $envFile" -ForegroundColor Green
    }
}

Write-Host "Backup completed: $backupPath" -ForegroundColor Green
