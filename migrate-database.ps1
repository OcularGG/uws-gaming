# Production Database Migration Script
# This script runs database migrations and sets up production data

Write-Host "🚀 Starting Database Migration for Production..." -ForegroundColor Cyan

# Set variables
$ProjectId = "uws-gaming"
$DatabaseInstance = "krakengaming-db"
$DatabaseName = "uwsgaming"

# Verify environment
if (-not $env:DATABASE_URL) {
    Write-Host "❌ DATABASE_URL environment variable not set!" -ForegroundColor Red
    Write-Host "Please set DATABASE_URL to your production database connection string" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Database URL configured" -ForegroundColor Green

# Check if running in production environment
if ($env:NODE_ENV -ne "production") {
    Write-Host "⚠️  Warning: NODE_ENV is not set to 'production'" -ForegroundColor Yellow
    $confirm = Read-Host "Continue anyway? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Migration cancelled" -ForegroundColor Yellow
        exit 0
    }
}

# Run database migrations
Write-Host "📦 Running database migrations..." -ForegroundColor Yellow
cd apps/frontend
npx prisma migrate deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database migration failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database migrations completed successfully" -ForegroundColor Green

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma client generation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prisma client generated successfully" -ForegroundColor Green

# Seed database with initial data (if needed)
Write-Host "🌱 Checking for database seeding..." -ForegroundColor Yellow
if (Test-Path "prisma/seed.ts") {
    Write-Host "Running database seed..." -ForegroundColor Yellow
    npx prisma db seed

    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Database seeding failed (this may be expected if data already exists)" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Database seeded successfully" -ForegroundColor Green
    }
} else {
    Write-Host "📝 No seed file found, skipping seeding" -ForegroundColor Gray
}

# Test database connection
Write-Host "🔍 Testing database connection..." -ForegroundColor Yellow
npx prisma db pull --preview-feature 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database connection test failed!" -ForegroundColor Red
    Write-Host "Please verify your DATABASE_URL and database accessibility" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Database connection test successful" -ForegroundColor Green

# Return to root directory
cd ../..

Write-Host ""
Write-Host "🎉 Database setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify environment variables are set in Cloud Run" -ForegroundColor White
Write-Host "2. Deploy your application" -ForegroundColor White
Write-Host "3. Test authentication and database operations" -ForegroundColor White
Write-Host "4. Monitor application logs for any issues" -ForegroundColor White
