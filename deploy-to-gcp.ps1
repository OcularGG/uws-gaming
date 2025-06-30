# KrakenGaming Deployment Script for Google Cloud Platform
# This script deploys the entire application stack to Google Cloud

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "uws-gaming",

    [Parameter(Mandatory=$false)]
    [string]$Region = "us-central1",

    [Parameter(Mandatory=$false)]
    [string]$DatabaseInstance = "krakengaming-db",

    [Parameter(Mandatory=$false)]
    [switch]$SkipDatabase = $false,

    [Parameter(Mandatory=$false)]
    [switch]$SkipSecretsSetup = $false
)

# Color coding for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Cyan "🚀 Starting KrakenGaming deployment to Google Cloud Platform..."
Write-ColorOutput Yellow "Project ID: $ProjectId"
Write-ColorOutput Yellow "Region: $Region"

# Verify gcloud authentication
Write-ColorOutput Cyan "🔐 Verifying Google Cloud authentication..."
$currentProject = gcloud config get-value project 2>$null
if ($currentProject -ne $ProjectId) {
    Write-ColorOutput Yellow "Setting project to $ProjectId..."
    gcloud config set project $ProjectId
}

# Enable required APIs
Write-ColorOutput Cyan "🔧 Enabling required Google Cloud APIs..."
$apis = @(
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com"
)

foreach ($api in $apis) {
    Write-ColorOutput Yellow "Enabling $api..."
    gcloud services enable $api
}

# Create Artifact Registry repository if it doesn't exist
Write-ColorOutput Cyan "📦 Setting up Artifact Registry..."
$repoExists = gcloud artifacts repositories describe krakengaming --location=$Region 2>$null
if (!$repoExists) {
    Write-ColorOutput Yellow "Creating Artifact Registry repository..."
    gcloud artifacts repositories create krakengaming --repository-format=docker --location=$Region --description="KrakenGaming Docker images"
}

# Configure Docker for Artifact Registry
Write-ColorOutput Cyan "🔧 Configuring Docker for Artifact Registry..."
gcloud auth configure-docker "$Region-docker.pkg.dev"

# Set up secrets if not skipped
if (!$SkipSecretsSetup) {
    Write-ColorOutput Cyan "🔐 Setting up secrets in Secret Manager..."

    # Generate secure secrets
    $authSecret = -join ((1..32) | ForEach-Object {Get-Random -input ([char[]]([char]'a'..[char]'z') + [char[]]([char]'A'..[char]'Z') + [char[]]([char]'0'..[char]'9'))})
    $adminPassword = "KG_Admin_2025_de3e3b4e87c10f6e775b6bdcad274ced"

    # Create or update secrets
    $secrets = @{
        "auth-secret" = $authSecret
        "admin-password" = $adminPassword
        "database-url-prod" = "postgresql://krakengaming:$(Get-Random -Minimum 100000 -Maximum 999999)@/krakengaming?host=/cloudsql/$ProjectId`:$Region`:$DatabaseInstance"
        "smtp-host" = "smtp.gmail.com"
        "smtp-port" = "587"
        "smtp-user" = "admin@uwsgaming.org"
        "smtp-pass" = "your-app-password-here"
    }

    foreach ($secretName in $secrets.Keys) {
        Write-ColorOutput Yellow "Creating/updating secret: $secretName"
        $secretValue = $secrets[$secretName]
        $secretExists = gcloud secrets describe $secretName 2>$null

        if ($secretExists) {
            Write-Output $secretValue | gcloud secrets versions add $secretName --data-file=-
        } else {
            Write-Output $secretValue | gcloud secrets create $secretName --data-file=-
        }
    }
}

# Set up Cloud SQL database if not skipped
if (!$SkipDatabase) {
    Write-ColorOutput Cyan "🗄️  Setting up Cloud SQL PostgreSQL database..."

    $dbExists = gcloud sql instances describe $DatabaseInstance 2>$null
    if (!$dbExists) {
        Write-ColorOutput Yellow "Creating Cloud SQL instance: $DatabaseInstance"
        gcloud sql instances create $DatabaseInstance `
            --database-version=POSTGRES_15 `
            --tier=db-f1-micro `
            --region=$Region `
            --storage-type=SSD `
            --storage-size=10GB `
            --storage-auto-increase `
            --backup `
            --enable-bin-log `
            --deletion-protection
    }

    # Create database
    Write-ColorOutput Yellow "Creating database: krakengaming"
    gcloud sql databases create krakengaming --instance=$DatabaseInstance 2>$null

    # Create user
    Write-ColorOutput Yellow "Creating database user: krakengaming"
    $dbPassword = -join ((1..16) | ForEach-Object {Get-Random -input ([char[]]([char]'a'..[char]'z') + [char[]]([char]'A'..[char]'Z') + [char[]]([char]'0'..[char]'9'))})
    gcloud sql users create krakengaming --instance=$DatabaseInstance --password=$dbPassword 2>$null

    # Update database URL secret
    $databaseUrl = "postgresql://krakengaming:$dbPassword@/krakengaming?host=/cloudsql/$ProjectId`:$Region`:$DatabaseInstance"
    Write-Output $databaseUrl | gcloud secrets versions add database-url-prod --data-file=-
}

# Build and push Docker images
Write-ColorOutput Cyan "🏗️  Building and pushing Docker images..."

# Build frontend
Write-ColorOutput Yellow "Building frontend image..."
docker build -t "$Region-docker.pkg.dev/$ProjectId/krakengaming/frontend:latest" -f apps/frontend/Dockerfile .
docker push "$Region-docker.pkg.dev/$ProjectId/krakengaming/frontend:latest"

# Build backend
Write-ColorOutput Yellow "Building backend image..."
docker build -t "$Region-docker.pkg.dev/$ProjectId/krakengaming/backend:latest" -f apps/backend/Dockerfile .
docker push "$Region-docker.pkg.dev/$ProjectId/krakengaming/backend:latest"

# Deploy backend to Cloud Run
Write-ColorOutput Cyan "🚀 Deploying backend to Cloud Run..."
gcloud run deploy krakengaming-backend `
    --image="$Region-docker.pkg.dev/$ProjectId/krakengaming/backend:latest" `
    --region=$Region `
    --platform=managed `
    --allow-unauthenticated `
    --port=4000 `
    --memory=1Gi `
    --cpu=1 `
    --min-instances=0 `
    --max-instances=10 `
    --set-cloudsql-instances="$ProjectId`:$Region`:$DatabaseInstance" `
    --set-secrets="DATABASE_URL=database-url-prod:latest" `
    --set-env-vars="NODE_ENV=production,PORT=4000"

# Get backend URL
$backendUrl = gcloud run services describe krakengaming-backend --region=$Region --format="value(status.url)"
Write-ColorOutput Green "Backend deployed at: $backendUrl"

# Deploy frontend to Cloud Run
Write-ColorOutput Cyan "🚀 Deploying frontend to Cloud Run..."
gcloud run deploy krakengaming-frontend `
    --image="$Region-docker.pkg.dev/$ProjectId/krakengaming/frontend:latest" `
    --region=$Region `
    --platform=managed `
    --allow-unauthenticated `
    --port=3000 `
    --memory=1Gi `
    --cpu=1 `
    --min-instances=0 `
    --max-instances=10 `
    --set-cloudsql-instances="$ProjectId`:$Region`:$DatabaseInstance" `
    --set-secrets="AUTH_SECRET=auth-secret:latest,DATABASE_URL=database-url-prod:latest,SMTP_HOST=smtp-host:latest,SMTP_PORT=smtp-port:latest,SMTP_USER=smtp-user:latest,SMTP_PASS=smtp-pass:latest" `
    --set-env-vars="NEXT_PUBLIC_ENVIRONMENT=production,NEXT_PUBLIC_API_URL=$backendUrl,NEXT_PUBLIC_DOMAIN=uwsgaming.org,NODE_ENV=production"

# Get frontend URL
$frontendUrl = gcloud run services describe krakengaming-frontend --region=$Region --format="value(status.url)"
Write-ColorOutput Green "Frontend deployed at: $frontendUrl"

# Run database migrations and seeding
Write-ColorOutput Cyan "🗄️  Running database migrations and seeding..."
gcloud run jobs create krakengaming-migrate `
    --image="$Region-docker.pkg.dev/$ProjectId/krakengaming/backend:latest" `
    --region=$Region `
    --set-cloudsql-instances="$ProjectId`:$Region`:$DatabaseInstance" `
    --set-secrets="DATABASE_URL=database-url-prod:latest" `
    --set-env-vars="NODE_ENV=production" `
    --command="npm" `
    --args="run,db:migrate" `
    --task-timeout=600 `
    --max-retries=3

gcloud run jobs execute krakengaming-migrate --region=$Region --wait

# Seed the database
gcloud run jobs create krakengaming-seed `
    --image="$Region-docker.pkg.dev/$ProjectId/krakengaming/backend:latest" `
    --region=$Region `
    --set-cloudsql-instances="$ProjectId`:$Region`:$DatabaseInstance" `
    --set-secrets="DATABASE_URL=database-url-prod:latest" `
    --set-env-vars="NODE_ENV=production" `
    --command="npm" `
    --args="run,db:seed" `
    --task-timeout=600 `
    --max-retries=3

gcloud run jobs execute krakengaming-seed --region=$Region --wait

Write-ColorOutput Green "✅ Deployment completed successfully!"
Write-ColorOutput Cyan "📋 Deployment Summary:"
Write-ColorOutput White "Frontend URL: $frontendUrl"
Write-ColorOutput White "Backend URL: $backendUrl"
Write-ColorOutput White "Database Instance: $DatabaseInstance"
Write-ColorOutput Yellow "🔐 Admin Login Credentials:"
Write-ColorOutput White "Email: admin@uwsgaming.org"
Write-ColorOutput White "Password: KG_Admin_2025_de3e3b4e87c10f6e775b6bdcad274ced"
Write-ColorOutput Red "⚠️  Remember to:"
Write-ColorOutput White "1. Set up custom domain mapping for uwsgaming.org"
Write-ColorOutput White "2. Update SMTP credentials in Secret Manager"
Write-ColorOutput White "3. Configure SSL certificates"
Write-ColorOutput White "4. Set up monitoring and alerting"
