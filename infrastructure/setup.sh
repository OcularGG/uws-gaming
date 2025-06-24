#!/bin/bash

# KrakenGaming Infrastructure Setup Script
# Run this script to set up the complete Google Cloud infrastructure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    log_error "gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    log_error "No project set. Run 'gcloud config set project PROJECT_ID' first."
    exit 1
fi

log_info "Setting up infrastructure for project: $PROJECT_ID"

# Enable required APIs
log_info "Enabling required Google Cloud APIs..."
gcloud services enable \
  run.googleapis.com \
  sql-component.googleapis.com \
  sqladmin.googleapis.com \
  storage-component.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com \
  vpcaccess.googleapis.com

# Create service accounts
log_info "Creating service accounts..."
gcloud iam service-accounts create krakengaming-runtime \
  --display-name="KrakenGaming Runtime Service Account" || true

gcloud iam service-accounts create krakengaming-cicd \
  --display-name="KrakenGaming CI/CD Service Account" || true

# Set up Cloud SQL instances
log_info "Creating Cloud SQL instances..."

# Generate random passwords
PROD_DB_PASSWORD=$(openssl rand -base64 32)
PREVIEW_DB_PASSWORD=$(openssl rand -base64 32)

# Production database
gcloud sql instances create krakengaming-db-prod \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=10GB \
  --backup-start-time=03:00 \
  --backup-location=us-central1 \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=04 \
  --maintenance-release-channel=production || log_warn "Production database already exists"

# Preview database
gcloud sql instances create krakengaming-db-preview \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=10GB || log_warn "Preview database already exists"

# Create databases
gcloud sql databases create krakengaming --instance=krakengaming-db-prod || true
gcloud sql databases create krakengaming --instance=krakengaming-db-preview || true

# Create database users
gcloud sql users create krakengaming-app \
  --instance=krakengaming-db-prod \
  --password="$PROD_DB_PASSWORD" || true

gcloud sql users create krakengaming-app \
  --instance=krakengaming-db-preview \
  --password="$PREVIEW_DB_PASSWORD" || true

# Set up Cloud Storage
log_info "Creating Cloud Storage buckets..."
gsutil mb -p "$PROJECT_ID" -c STANDARD -l us-central1 "gs://krakengaming-storage-prod" || log_warn "Production bucket already exists"
gsutil mb -p "$PROJECT_ID" -c STANDARD -l us-central1 "gs://krakengaming-storage-preview" || log_warn "Preview bucket already exists"

# Set up VPC Connector
log_info "Creating VPC connector..."
gcloud compute networks vpc-access connectors create krakengaming-connector \
  --region=us-central1 \
  --subnet-project="$PROJECT_ID" \
  --subnet=default \
  --min-instances=2 \
  --max-instances=3 || log_warn "VPC connector already exists"

# Set up secrets
log_info "Creating secrets..."

# Database URLs
echo "postgresql://krakengaming-app:$PROD_DB_PASSWORD@/krakengaming?host=/cloudsql/$PROJECT_ID:us-central1:krakengaming-db-prod" | \
  gcloud secrets create database-url-prod --data-file=- || log_warn "Production database URL secret already exists"

echo "postgresql://krakengaming-app:$PREVIEW_DB_PASSWORD@/krakengaming?host=/cloudsql/$PROJECT_ID:us-central1:krakengaming-db-preview" | \
  gcloud secrets create database-url-preview --data-file=- || log_warn "Preview database URL secret already exists"

# JWT Secrets
openssl rand -base64 64 | gcloud secrets create jwt-secret-prod --data-file=- || log_warn "Production JWT secret already exists"
openssl rand -base64 64 | gcloud secrets create jwt-secret-preview --data-file=- || log_warn "Preview JWT secret already exists"

# Placeholder Discord secrets (you'll need to update these manually)
echo "REPLACE_WITH_DISCORD_BOT_TOKEN_PROD" | gcloud secrets create discord-bot-token-prod --data-file=- || log_warn "Production Discord bot token already exists"
echo "REPLACE_WITH_DISCORD_BOT_TOKEN_PREVIEW" | gcloud secrets create discord-bot-token-preview --data-file=- || log_warn "Preview Discord bot token already exists"
echo "REPLACE_WITH_DISCORD_CLIENT_ID_PROD" | gcloud secrets create discord-client-id-prod --data-file=- || log_warn "Production Discord client ID already exists"
echo "REPLACE_WITH_DISCORD_CLIENT_SECRET_PROD" | gcloud secrets create discord-client-secret-prod --data-file=- || log_warn "Production Discord client secret already exists"
echo "REPLACE_WITH_DISCORD_CLIENT_ID_PREVIEW" | gcloud secrets create discord-client-id-preview --data-file=- || log_warn "Preview Discord client ID already exists"
echo "REPLACE_WITH_DISCORD_CLIENT_SECRET_PREVIEW" | gcloud secrets create discord-client-secret-preview --data-file=- || log_warn "Preview Discord client secret already exists"

# Sentry DSN (optional)
echo "REPLACE_WITH_SENTRY_DSN" | gcloud secrets create sentry-dsn --data-file=- || log_warn "Sentry DSN secret already exists"

# Configure IAM permissions
log_info "Setting up IAM permissions..."

# Runtime service account permissions
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:krakengaming-runtime@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:krakengaming-runtime@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:krakengaming-runtime@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# CI/CD service account permissions
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:krakengaming-cicd@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:krakengaming-cicd@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:krakengaming-cicd@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.admin"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:krakengaming-cicd@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.admin"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:krakengaming-cicd@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

log_info "Infrastructure setup complete!"
log_warn "IMPORTANT: You need to manually update the following secrets with real values:"
log_warn "  - discord-bot-token-prod"
log_warn "  - discord-bot-token-preview"
log_warn "  - discord-client-id-prod"
log_warn "  - discord-client-secret-prod"
log_warn "  - discord-client-id-preview"
log_warn "  - discord-client-secret-preview"
log_warn "  - sentry-dsn (optional)"

log_info "Next steps:"
log_info "1. Update Discord secrets in Secret Manager"
log_info "2. Configure domain DNS to point to Cloud Run"
log_info "3. Set up GitHub Actions secrets"
log_info "4. Deploy the application using GitHub Actions or manual deployment"

log_info "GitHub Actions secrets needed:"
log_info "  - GCP_PROJECT_ID: $PROJECT_ID"
log_info "  - GCP_SA_KEY: JSON key for krakengaming-cicd service account"
