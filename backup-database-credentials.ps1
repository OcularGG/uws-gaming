# Backup Current Database Credentials
# This script backs up the current database credentials before reset

param(
    [string]$ProjectId = "uws-gaming",
    [string]$BackupDir = "credential-backups"
)

function Write-ColorOutput {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Color,
        [Parameter(Mandatory=$true)]
        [string]$Message
    )
    
    $colorMap = @{
        'Red' = 'Red'
        'Green' = 'Green'
        'Yellow' = 'Yellow'
        'Blue' = 'Blue'
        'Cyan' = 'Cyan'
        'Magenta' = 'Magenta'
        'White' = 'White'
    }
    
    Write-Host $Message -ForegroundColor $colorMap[$Color]
}

Write-ColorOutput Cyan "📦 Backing up current database credentials..."

# Create backup directory
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupPath = "$BackupDir\backup_$timestamp"

if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

if (!(Test-Path $backupPath)) {
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
}

Write-ColorOutput Yellow "Backup directory: $backupPath"

# Verify gcloud authentication
$currentProject = gcloud config get-value project 2>$null
if ($currentProject -ne $ProjectId) {
    Write-ColorOutput Yellow "Setting project to $ProjectId..."
    gcloud config set project $ProjectId
}

# Backup Google Secrets
Write-ColorOutput Cyan "🔐 Backing up Google Secret Manager secrets..."

$secrets = @(
    "uws-gaming-database-url",
    "uws-gaming-db-password",
    "uws-gaming-jwt-secret",
    "uws-gaming-nextauth-secret"
)

foreach ($secret in $secrets) {
    try {
        $secretExists = gcloud secrets describe $secret 2>$null
        if ($secretExists) {
            Write-ColorOutput Yellow "Backing up secret: $secret"
            $secretValue = gcloud secrets versions access latest --secret=$secret
            Set-Content -Path "$backupPath\$secret.txt" -Value $secretValue -Encoding UTF8
            Write-ColorOutput Green "✅ Backed up $secret"
        } else {
            Write-ColorOutput Yellow "⚠️  Secret $secret not found, skipping..."
        }
    } catch {
        Write-ColorOutput Red "❌ Failed to backup secret $secret: $($_.Exception.Message)"
    }
}

# Backup environment files
Write-ColorOutput Cyan "📁 Backing up environment files..."

$envFiles = @(
    ".env.local",
    ".env.production",
    ".env.example"
)

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        try {
            Copy-Item $envFile "$backupPath\$envFile" -Force
            Write-ColorOutput Green "✅ Backed up $envFile"
        } catch {
            Write-ColorOutput Red "❌ Failed to backup $envFile: $($_.Exception.Message)"
        }
    } else {
        Write-ColorOutput Yellow "⚠️  File $envFile not found, skipping..."
    }
}

# Create backup manifest
Write-ColorOutput Cyan "📝 Creating backup manifest..."

$manifest = @"
# Database Credentials Backup Manifest
# Created: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
# Project: $ProjectId

## Backed up secrets:
$(foreach ($secret in $secrets) { "- $secret" })

## Backed up files:
$(foreach ($envFile in $envFiles) { if (Test-Path $envFile) { "- $envFile" } })

## Database instance info:
$(gcloud sql instances describe uws-gaming-db --format="yaml" 2>$null | Select-String -Pattern "name:|state:|databaseVersion:|ipAddresses:")

## Database users:
$(gcloud sql users list --instance=uws-gaming-db --format="table(name,host,type)" 2>$null)
"@

try {
    Set-Content -Path "$backupPath\backup-manifest.md" -Value $manifest -Encoding UTF8
    Write-ColorOutput Green "✅ Created backup manifest"
} catch {
    Write-ColorOutput Red "Failed to create backup manifest: $($_.Exception.Message)"
}

Write-ColorOutput Green "✅ Backup completed successfully!"
Write-ColorOutput Cyan "📍 Backup location: $backupPath"
Write-ColorOutput Yellow "Keep this backup safe in case you need to restore credentials"
