# Database Setup Script for KrakenGaming
# This script sets up the Cloud SQL database and runs migrations

Write-Host "Setting up Cloud SQL Database..." -ForegroundColor Cyan

# Configuration
$ProjectId = "uws-gaming"
$Region = "us-central1"
$DatabaseInstance = "krakengaming-db"

# Set project
gcloud config set project $ProjectId

# Create Cloud SQL instance if it doesn't exist
Write-Host "Checking for existing Cloud SQL instance..." -ForegroundColor Yellow
$dbExists = gcloud sql instances describe $DatabaseInstance 2>$null
if (!$dbExists) {
    Write-Host "Creating Cloud SQL PostgreSQL instance..." -ForegroundColor Yellow
    gcloud sql instances create $DatabaseInstance `
        --database-version=POSTGRES_15 `
        --tier=db-f1-micro `
        --region=$Region `
        --storage-type=SSD `
        --storage-size=10GB `
        --storage-auto-increase `
        --backup `
        --deletion-protection=false

    Write-Host "Cloud SQL instance created!" -ForegroundColor Green
} else {
    Write-Host "Cloud SQL instance already exists." -ForegroundColor Green
}

# Create database
Write-Host "Creating database 'krakengaming'..." -ForegroundColor Yellow
gcloud sql databases create krakengaming --instance=$DatabaseInstance 2>$null

# Create database user
Write-Host "Creating database user..." -ForegroundColor Yellow
$dbPassword = "KrakenGaming2025SecurePassword123"
gcloud sql users create krakengaming --instance=$DatabaseInstance --password=$dbPassword 2>$null

# Generate connection string
$connectionString = "postgresql://krakengaming:$dbPassword@127.0.0.1:5432/krakengaming?host=/cloudsql/$ProjectId`:$Region`:$DatabaseInstance"

Write-Host "Database setup completed!" -ForegroundColor Green
Write-Host "Connection String: $connectionString" -ForegroundColor White
Write-Host "You can now update your Cloud Run services with this DATABASE_URL" -ForegroundColor Yellow
