# Test Database Connection Script
param(
    [switch]$Local,
    [switch]$Production
)

if ($Local) {
    Write-Host "Testing local database connection..." -ForegroundColor Cyan
    
    if (Test-Path ".env.local") {
        $envContent = Get-Content ".env.local"
        $databaseUrl = ($envContent | Where-Object { $_ -like "DATABASE_URL=*" }) -replace "DATABASE_URL=", ""
        
        if ($databaseUrl) {
            Write-Host "Database URL found in .env.local" -ForegroundColor Green
            Write-Host "URL: $databaseUrl" -ForegroundColor Yellow
            
            # Test if psql is available
            if (Get-Command psql -ErrorAction SilentlyContinue) {
                Write-Host "Testing connection with psql..." -ForegroundColor Cyan
                psql $databaseUrl -c "SELECT version();"
            } else {
                Write-Host "psql not found. Install PostgreSQL client tools to test connection." -ForegroundColor Yellow
                Write-Host "You can also test from your application." -ForegroundColor Yellow
            }
        } else {
            Write-Host "DATABASE_URL not found in .env.local" -ForegroundColor Red
        }
    } else {
        Write-Host ".env.local file not found" -ForegroundColor Red
    }
}

if ($Production) {
    Write-Host "Testing production database connection..." -ForegroundColor Cyan
    
    # Get from Google Secret Manager
    try {
        $prodUrl = gcloud secrets versions access latest --secret=uws-gaming-database-url
        Write-Host "Production database URL retrieved from Secret Manager" -ForegroundColor Green
        Write-Host "URL: $prodUrl" -ForegroundColor Yellow
        
        Write-Host "Note: Production uses Cloud SQL Proxy connection." -ForegroundColor Yellow
        Write-Host "Test from a deployed Cloud Run service or with Cloud SQL Proxy." -ForegroundColor Yellow
    } catch {
        Write-Host "Failed to retrieve production database URL from Secret Manager" -ForegroundColor Red
    }
}

if (!$Local -and !$Production) {
    Write-Host "Please specify -Local or -Production" -ForegroundColor Red
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\test-connection.ps1 -Local" -ForegroundColor Yellow
    Write-Host "  .\test-connection.ps1 -Production" -ForegroundColor Yellow
}
