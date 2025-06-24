# Google Cloud Infrastructure Setup for KrakenGaming

This directory contains infrastructure configuration and setup scripts for deploying KrakenGaming on Google Cloud Platform.

## Prerequisites

1. Google Cloud Project with billing enabled
2. gcloud CLI installed and authenticated
3. Docker installed
4. Node.js 20+ installed

## Environment Setup

### 1. Enable Required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  sql-component.googleapis.com \
  sqladmin.googleapis.com \
  storage-component.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com
```

### 2. Create Service Accounts

```bash
# Create service account for Cloud Run services
gcloud iam service-accounts create krakengaming-runtime \
  --display-name="KrakenGaming Runtime Service Account"

# Create service account for CI/CD
gcloud iam service-accounts create krakengaming-cicd \
  --display-name="KrakenGaming CI/CD Service Account"
```

### 3. Set Up Cloud SQL

```bash
# Production Database
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
  --maintenance-release-channel=production

# Preview Database
gcloud sql instances create krakengaming-db-preview \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=10GB

# Create databases
gcloud sql databases create krakengaming --instance=krakengaming-db-prod
gcloud sql databases create krakengaming --instance=krakengaming-db-preview

# Create database users
gcloud sql users create krakengaming-app \
  --instance=krakengaming-db-prod \
  --password=$(openssl rand -base64 32)

gcloud sql users create krakengaming-app \
  --instance=krakengaming-db-preview \
  --password=$(openssl rand -base64 32)
```

### 4. Set Up Cloud Storage

```bash
# Production bucket
gsutil mb -p $PROJECT_ID -c STANDARD -l us-central1 gs://krakengaming-storage-prod

# Preview bucket
gsutil mb -p $PROJECT_ID -c STANDARD -l us-central1 gs://krakengaming-storage-preview

# Enable public access for static assets (if needed)
gsutil iam ch allUsers:objectViewer gs://krakengaming-storage-prod
gsutil iam ch allUsers:objectViewer gs://krakengaming-storage-preview
```

### 5. Set Up Secret Manager

```bash
# Database URLs
echo "postgresql://krakengaming-app:PASSWORD@/krakengaming?host=/cloudsql/PROJECT_ID:us-central1:krakengaming-db-prod" | \
  gcloud secrets create database-url-prod --data-file=-

echo "postgresql://krakengaming-app:PASSWORD@/krakengaming?host=/cloudsql/PROJECT_ID:us-central1:krakengaming-db-preview" | \
  gcloud secrets create database-url-preview --data-file=-

# JWT Secrets
openssl rand -base64 64 | gcloud secrets create jwt-secret-prod --data-file=-
openssl rand -base64 64 | gcloud secrets create jwt-secret-preview --data-file=-

# Discord Bot Tokens (you'll need to create these in Discord Developer Portal)
echo "YOUR_DISCORD_BOT_TOKEN_PROD" | gcloud secrets create discord-bot-token-prod --data-file=-
echo "YOUR_DISCORD_BOT_TOKEN_PREVIEW" | gcloud secrets create discord-bot-token-preview --data-file=-

# Discord Client IDs and Secrets
echo "YOUR_DISCORD_CLIENT_ID_PROD" | gcloud secrets create discord-client-id-prod --data-file=-
echo "YOUR_DISCORD_CLIENT_SECRET_PROD" | gcloud secrets create discord-client-secret-prod --data-file=-
echo "YOUR_DISCORD_CLIENT_ID_PREVIEW" | gcloud secrets create discord-client-id-preview --data-file=-
echo "YOUR_DISCORD_CLIENT_SECRET_PREVIEW" | gcloud secrets create discord-client-secret-preview --data-file=-

# Sentry DSN (optional)
echo "YOUR_SENTRY_DSN" | gcloud secrets create sentry-dsn --data-file=-
```

### 6. Set Up VPC Connector (for Cloud SQL access)

```bash
gcloud compute networks vpc-access connectors create krakengaming-connector \
  --region=us-central1 \
  --subnet-project=$PROJECT_ID \
  --subnet=default \
  --min-instances=2 \
  --max-instances=3
```

### 7. Configure IAM Permissions

```bash
# Runtime service account permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:krakengaming-runtime@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:krakengaming-runtime@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:krakengaming-runtime@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# CI/CD service account permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:krakengaming-cicd@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:krakengaming-cicd@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:krakengaming-cicd@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.admin"
```

### 8. Set Up Domain and SSL

1. Configure your domain DNS to point to Cloud Run:
   - `krakengaming.org` → Production Cloud Run service
   - `preview.krakengaming.org` → Preview Cloud Run service
   - `api.krakengaming.org` → Production API service
   - `api.preview.krakengaming.org` → Preview API service

2. Map domains in Cloud Run:
```bash
# Map production domain
gcloud run domain-mappings create \
  --service=krakengaming-frontend \
  --domain=krakengaming.org \
  --region=us-central1

# Map preview domain
gcloud run domain-mappings create \
  --service=krakengaming-frontend-preview \
  --domain=preview.krakengaming.org \
  --region=us-central1
```

### 9. Set Up Monitoring and Alerting

```bash
# Create notification channel (replace with your email)
gcloud alpha monitoring channels create \
  --display-name="KrakenGaming Alerts" \
  --type=email \
  --channel-labels=email_address=alerts@krakengaming.org

# Budget alerts
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="KrakenGaming Monthly Budget" \
  --budget-amount=50USD \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

## Deployment

### Initial Deployment

1. Build and push images:
```bash
# Build all services
npm run build

# Build and push Docker images
docker build -f apps/frontend/Dockerfile -t gcr.io/$PROJECT_ID/krakengaming-frontend:production .
docker build -f apps/backend/Dockerfile -t gcr.io/$PROJECT_ID/krakengaming-backend:production .
docker build -f apps/discord-bot/Dockerfile -t gcr.io/$PROJECT_ID/krakengaming-discord-bot:production .

docker push gcr.io/$PROJECT_ID/krakengaming-frontend:production
docker push gcr.io/$PROJECT_ID/krakengaming-backend:production
docker push gcr.io/$PROJECT_ID/krakengaming-discord-bot:production
```

2. Deploy services:
```bash
# Deploy frontend
gcloud run deploy krakengaming-frontend \
  --image=gcr.io/$PROJECT_ID/krakengaming-frontend:production \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1

# Deploy backend
gcloud run deploy krakengaming-backend \
  --image=gcr.io/$PROJECT_ID/krakengaming-backend:production \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --add-cloudsql-instances=$PROJECT_ID:us-central1:krakengaming-db-prod \
  --vpc-connector=krakengaming-connector

# Deploy Discord bot
gcloud run deploy krakengaming-discord-bot \
  --image=gcr.io/$PROJECT_ID/krakengaming-discord-bot:production \
  --platform=managed \
  --region=us-central1 \
  --no-allow-unauthenticated \
  --memory=512Mi \
  --cpu=0.5 \
  --max-instances=1
```

3. Run database migrations:
```bash
# Connect to Cloud SQL and run Prisma migrations
npm run migrate:deploy -w @krakengaming/database
```

## Cost Optimization

- Use `db-f1-micro` instances for development
- Set max instances on Cloud Run services
- Enable autoscaling
- Use regional persistent disks
- Regular cleanup of unused images and resources

## Security

- All secrets stored in Secret Manager
- Least privilege IAM roles
- VPC connector for database access
- Regular security scanning with Trivy
- HTTPS everywhere with automatic SSL certificates

## Monitoring

- Cloud Monitoring for metrics
- Cloud Logging for application logs
- Sentry for error tracking
- Uptime checks for all services
- Budget alerts for cost control
