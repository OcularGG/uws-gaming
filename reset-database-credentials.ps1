# Reset Database Credentials Script
# This script resets the database credentials and configures them for both production and local environments

param(
    [string]$ProjectId = "uws-gaming",
    [string]$Region = "us-central1",
    [string]$DatabaseInstance = "uws-gaming-db",
    [string]$DatabaseName = "uwsgaming",
    [string]$DatabaseUser = "uwsgaming",
    [switch]$SkipLocalConfig = $false
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

Write-ColorOutput Cyan "🔄 Starting database credentials reset for KrakenGaming..."
Write-ColorOutput Yellow "Project ID: $ProjectId"
Write-ColorOutput Yellow "Database Instance: $DatabaseInstance"
Write-ColorOutput Yellow "Database Name: $DatabaseName"
Write-ColorOutput Yellow "Database User: $DatabaseUser"

# Verify gcloud authentication
Write-ColorOutput Cyan "🔐 Verifying Google Cloud authentication..."
$currentProject = gcloud config get-value project 2>$null
if ($currentProject -ne $ProjectId) {
    Write-ColorOutput Yellow "Setting project to $ProjectId..."
    gcloud config set project $ProjectId
}

# Generate new secure password
Write-ColorOutput Cyan "🔑 Generating new secure database password..."
$newPassword = -join ((1..32) | ForEach-Object {
    Get-Random -InputObject ([char[]]([char]'a'..[char]'z') + [char[]]([char]'A'..[char]'Z') + [char[]]([char]'0'..[char]'9') + [char[]]'!@#$%^&*')
})

Write-ColorOutput Green "✅ New password generated (32 characters)"

# Update database user password in Cloud SQL
Write-ColorOutput Cyan "🗄️  Updating database user password in Cloud SQL..."
try {
    gcloud sql users set-password $DatabaseUser --instance=$DatabaseInstance --password=$newPassword
    Write-ColorOutput Green "✅ Database user password updated successfully"
} catch {
    Write-ColorOutput Red "❌ Failed to update database user password: $($_.Exception.Message)"
    exit 1
}

# Get database connection info
Write-ColorOutput Cyan "📡 Getting database connection info..."
$dbConnection = gcloud sql instances describe $DatabaseInstance --format="value(connectionName)"
$dbPublicIp = gcloud sql instances describe $DatabaseInstance --format="value(ipAddresses[0].ipAddress)"

Write-ColorOutput Green "✅ Database connection name: $dbConnection"
Write-ColorOutput Green "✅ Database public IP: $dbPublicIp"

# Create production database URL (using Cloud SQL Proxy connection)
$prodDatabaseUrl = "postgresql://${DatabaseUser}:${newPassword}@/${DatabaseName}?host=/cloudsql/$dbConnection"

# Create local database URL (using public IP)
$localDatabaseUrl = "postgresql://${DatabaseUser}:${newPassword}@${dbPublicIp}:5432/$DatabaseName"

Write-ColorOutput Cyan "🔐 Updating secrets in Google Secret Manager..."

# Update or create database URL secret for production
try {
    $secretExists = gcloud secrets describe uws-gaming-database-url 2>$null
    if ($secretExists) {
        Write-Output $prodDatabaseUrl | gcloud secrets versions add uws-gaming-database-url --data-file=-
        Write-ColorOutput Green "✅ Updated existing database URL secret (uws-gaming-database-url)"
    } else {
        Write-Output $prodDatabaseUrl | gcloud secrets create uws-gaming-database-url --data-file=-
        Write-ColorOutput Green "✅ Created new database URL secret (uws-gaming-database-url)"
    }
    
    # Also create/update the deployment script expected name
    $deploySecretExists = gcloud secrets describe database-url-prod 2>$null
    if ($deploySecretExists) {
        Write-Output $prodDatabaseUrl | gcloud secrets versions add database-url-prod --data-file=-
        Write-ColorOutput Green "✅ Updated deployment database URL secret (database-url-prod)"
    } else {
        Write-Output $prodDatabaseUrl | gcloud secrets create database-url-prod --data-file=-
        Write-ColorOutput Green "✅ Created deployment database URL secret (database-url-prod)"
    }
} catch {
    Write-ColorOutput Red "❌ Failed to update database URL secret: $($_.Exception.Message)"
    exit 1
}

# Update or create database password secret
try {
    $passwordSecretExists = gcloud secrets describe uws-gaming-db-password 2>$null
    if ($passwordSecretExists) {
        Write-Output $newPassword | gcloud secrets versions add uws-gaming-db-password --data-file=-
        Write-ColorOutput Green "✅ Updated existing database password secret"
    } else {
        Write-Output $newPassword | gcloud secrets create uws-gaming-db-password --data-file=-
        Write-ColorOutput Green "✅ Created new database password secret"
    }
} catch {
    Write-ColorOutput Red "❌ Failed to update database password secret: $($_.Exception.Message)"
    exit 1
}

# Create local environment file if not skipped
if (!$SkipLocalConfig) {
    Write-ColorOutput Cyan "📁 Creating local environment configuration..."
    
    $envLocalPath = ".env.local"
    $envContent = @"
# Local Development Environment Configuration
# Generated on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

NODE_ENV=development
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_DOMAIN=localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=UWS Gaming (Local)
NEXT_PUBLIC_APP_VERSION=0.1.0-dev
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=false

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=$ProjectId
GOOGLE_CLOUD_REGION=$Region

# Database (Cloud SQL with public IP for local development)
DATABASE_URL=$localDatabaseUrl
DIRECT_URL=$localDatabaseUrl

# API Configuration
API_PORT=4000
API_HOST=localhost
API_CORS_ORIGIN=http://localhost:3000

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-dev-nextauth-secret-$(Get-Random -Minimum 1000 -Maximum 9999)

# JWT Secret
JWT_SECRET=local-dev-jwt-secret-$(Get-Random -Minimum 1000 -Maximum 9999)

# Feature Flags
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Development specific
DEBUG=true
LOG_LEVEL=debug
"@

    try {
        Set-Content -Path $envLocalPath -Value $envContent -Encoding UTF8
        Write-ColorOutput Green "✅ Created $envLocalPath with new database credentials"
    } catch {
        Write-ColorOutput Red "❌ Failed to create local environment file: $($_.Exception.Message)"
    }
}

# Update production environment file
Write-ColorOutput Cyan "📁 Updating production environment configuration..."
$envProdPath = ".env.production"

# Read current production env and update DATABASE_URL
if (Test-Path $envProdPath) {
    $prodEnvContent = Get-Content $envProdPath
    $updatedContent = @()
    
    foreach ($line in $prodEnvContent) {
        if ($line -like "DATABASE_URL=*") {
            $updatedContent += "DATABASE_URL=$prodDatabaseUrl"
        } elseif ($line -like "DIRECT_URL=*") {
            $updatedContent += "DIRECT_URL=$prodDatabaseUrl"
        } else {
            $updatedContent += $line
        }
    }
    
    try {
        Set-Content -Path $envProdPath -Value $updatedContent -Encoding UTF8
        Write-ColorOutput Green "✅ Updated $envProdPath with new database credentials"
    } catch {
        Write-ColorOutput Red "❌ Failed to update production environment file: $($_.Exception.Message)"
    }
}

# Create database connection test script
Write-ColorOutput Cyan "🧪 Creating database connection test script..."
$testScriptContent = @"
# Database Connection Test Script
# Generated on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

param(
    [switch]`$Local = `$false,
    [switch]`$Production = `$false
)

if (`$Local) {
    Write-Host "Testing local database connection..." -ForegroundColor Cyan
    `$env:DATABASE_URL = "$localDatabaseUrl"
} elseif (`$Production) {
    Write-Host "Testing production database connection..." -ForegroundColor Cyan
    `$env:DATABASE_URL = "$prodDatabaseUrl"
} else {
    Write-Host "Please specify -Local or -Production" -ForegroundColor Red
    exit 1
}

Write-Host "Database URL: `$env:DATABASE_URL" -ForegroundColor Yellow

# Test connection using psql if available
if (Get-Command psql -ErrorAction SilentlyContinue) {
    Write-Host "Testing connection with psql..." -ForegroundColor Yellow
    psql "`$env:DATABASE_URL" -c "SELECT version();"
} else {
    Write-Host "psql not found. Install PostgreSQL client to test connection." -ForegroundColor Yellow
}
"@

try {
    Set-Content -Path "test-database-connection.ps1" -Value $testScriptContent -Encoding UTF8
    Write-ColorOutput Green "✅ Created test-database-connection.ps1"
} catch {
    Write-ColorOutput Red "❌ Failed to create test script: $($_.Exception.Message)"
}

# Summary
Write-ColorOutput Green "🎉 Database credentials reset completed successfully!"
Write-ColorOutput Cyan "📋 Summary:"
Write-ColorOutput Yellow "  ✅ Generated new 32-character secure password"
Write-ColorOutput Yellow "  ✅ Updated database user password in Cloud SQL"
Write-ColorOutput Yellow "  ✅ Updated Google Secret Manager secrets:"
Write-ColorOutput Yellow "     - uws-gaming-database-url (current naming)"
Write-ColorOutput Yellow "     - database-url-prod (deployment script naming)"
Write-ColorOutput Yellow "     - uws-gaming-db-password"
if (!$SkipLocalConfig) {
    Write-ColorOutput Yellow "  ✅ Created .env.local for local development"
}
Write-ColorOutput Yellow "  ✅ Updated .env.production"
Write-ColorOutput Yellow "  ✅ Created test-database-connection.ps1"

Write-ColorOutput Cyan "🔄 Next Steps:"
Write-ColorOutput Yellow "  1. Test local connection: .\test-database-connection.ps1 -Local"
Write-ColorOutput Yellow "  2. Test production connection: .\test-database-connection.ps1 -Production"
Write-ColorOutput Yellow "  3. Redeploy your applications to pick up the new secrets"
Write-ColorOutput Yellow "  4. Run database migrations if needed"

Write-ColorOutput Green "✨ All done! Your database credentials have been securely reset."
