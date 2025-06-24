# Deployment Guide

This guide covers deploying the KrakenGaming application to Google Cloud Platform.

## Prerequisites

1. Google Cloud Project with billing enabled
2. Domain name configured (krakengaming.org)
3. GitHub repository with proper secrets configured
4. Sentry project for error tracking

## Initial Setup

### 1. Google Cloud Setup

```bash
# Set project ID
export PROJECT_ID="krakengaming-prod"
gcloud config set project $PROJECT_ID

# Enable required services
gcloud services enable \
  run.googleapis.com \
  sql-component.googleapis.com \
  sqladmin.googleapis.com \
  storage-component.googleapis.com \
  cloudresourcemanager.googleapis.com \
  container.googleapis.com \
  iam.googleapis.com \
  secretmanager.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com

# Create service account for CI/CD
gcloud iam service-accounts create krakengaming-deploy \
  --display-name="KrakenGaming Deployment Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:krakengaming-deploy@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:krakengaming-deploy@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:krakengaming-deploy@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.admin"
```

### 2. Database Setup

```bash
# Create Cloud SQL instance
gcloud sql instances create krakengaming-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=10GB \
  --storage-auto-increase

# Create database
gcloud sql databases create krakengaming \
  --instance=krakengaming-db

# Create database user
gcloud sql users create krakengaming-user \
  --instance=krakengaming-db \
  --password=SecurePassword123!
```

### 3. Storage Setup

```bash
# Create storage bucket for uploads
gsutil mb gs://krakengaming-uploads
gsutil mb gs://krakengaming-static

# Set bucket permissions
gsutil iam ch allUsers:objectViewer gs://krakengaming-static
```

### 4. Secrets Management

```bash
# Create secrets
gcloud secrets create database-url --data-file=-
# Enter: postgresql://krakengaming-user:SecurePassword123!@/krakengaming?host=/cloudsql/PROJECT_ID:us-central1:krakengaming-db

gcloud secrets create jwt-secret --data-file=-
# Enter: your-super-secure-jwt-secret-here

gcloud secrets create discord-bot-token --data-file=-
# Enter: your-discord-bot-token-here

gcloud secrets create sentry-dsn --data-file=-
# Enter: your-sentry-dsn-here
```

### 5. GitHub Secrets

Add these secrets to your GitHub repository:

```
GCP_PROJECT_ID: your-project-id
GCP_SA_KEY: base64-encoded service account key JSON
SENTRY_AUTH_TOKEN: your-sentry-auth-token
DISCORD_BOT_TOKEN: your-discord-bot-token
```

## Deployment Process

### Automated Deployment (Recommended)

1. **Push to main branch**: Triggers production deployment
2. **Push to preview branch**: Triggers preview environment deployment
3. **Create pull request**: Triggers preview environment with unique URL

### Manual Deployment

```bash
# Build and deploy frontend
gcloud run deploy krakengaming-frontend \
  --source apps/frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi

# Build and deploy backend
gcloud run deploy krakengaming-backend \
  --source apps/backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi

# Build and deploy Discord bot
gcloud run deploy krakengaming-discord-bot \
  --source apps/discord-bot \
  --platform managed \
  --region us-central1 \
  --no-allow-unauthenticated \
  --memory 512Mi \
  --cpu 0.5 \
  --max-instances 1
```

## Domain Configuration

### 1. Cloud Run Domain Mapping

```bash
# Map domain to services
gcloud run domain-mappings create \
  --service krakengaming-frontend \
  --domain krakengaming.org \
  --region us-central1

gcloud run domain-mappings create \
  --service krakengaming-backend \
  --domain api.krakengaming.org \
  --region us-central1
```

### 2. DNS Configuration

Configure your DNS provider with the following records:

```
Type: A
Name: @
Value: [Cloud Run IP]

Type: A
Name: api
Value: [Cloud Run IP]

Type: A
Name: preview
Value: [Cloud Run IP]

Type: CNAME
Name: www
Value: krakengaming.org
```

## Environment Variables

### Production Environment

Configure these environment variables in Cloud Run:

**Frontend:**
```
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_API_URL=https://api.krakengaming.org
NEXT_PUBLIC_DOMAIN=krakengaming.org
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

**Backend:**
```
NODE_ENV=production
DATABASE_URL=secret:database-url:latest
JWT_SECRET=secret:jwt-secret:latest
SENTRY_DSN=secret:sentry-dsn:latest
```

**Discord Bot:**
```
NODE_ENV=production
DISCORD_BOT_TOKEN=secret:discord-bot-token:latest
API_BASE_URL=https://api.krakengaming.org
SENTRY_DSN=secret:sentry-dsn:latest
```

## Database Migrations

### Production Migration

```bash
# Connect to Cloud SQL
gcloud sql connect krakengaming-db --user=krakengaming-user

# Run migrations
npm run prisma:deploy
```

### Backup Strategy

```bash
# Create automated backup
gcloud sql backups create \
  --instance=krakengaming-db \
  --description="Pre-deployment backup"

# Schedule daily backups
gcloud sql instances patch krakengaming-db \
  --backup-start-time=02:00
```

## Monitoring and Logging

### 1. Enable Monitoring

```bash
# Create monitoring workspace
gcloud monitoring workspaces create

# Install monitoring agent (if using GCE)
curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
sudo bash add-google-cloud-ops-agent-repo.sh --also-install
```

### 2. Set Up Alerts

```bash
# Create alerting policy
gcloud alpha monitoring policies create monitoring/alerts/application-alerts.yml
```

### 3. Log Analysis

```bash
# View application logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=krakengaming-frontend"

# Create log-based metrics
gcloud logging metrics create error_rate \
  --description="Error rate metric" \
  --log-filter="severity>=ERROR"
```

## Security Considerations

### 1. IAM Policies

- Use least privilege principle
- Regularly audit service account permissions
- Enable IAM conditions where possible

### 2. VPC Configuration

```bash
# Create VPC
gcloud compute networks create krakengaming-vpc \
  --subnet-mode custom

# Create subnet
gcloud compute networks subnets create krakengaming-subnet \
  --network krakengaming-vpc \
  --range 10.0.0.0/24 \
  --region us-central1
```

### 3. Security Headers

Ensure these headers are configured in your services:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

## Performance Optimization

### 1. CDN Setup

```bash
# Create Cloud CDN
gcloud compute backend-services create krakengaming-backend \
  --global

# Enable CDN
gcloud compute backend-services update krakengaming-backend \
  --enable-cdn \
  --global
```

### 2. Caching Strategy

- Static assets: 1 year cache
- API responses: Based on content type
- Database queries: Redis caching layer

### 3. Auto-scaling

Configure auto-scaling in Cloud Run:
- Min instances: 1 (production), 0 (preview)
- Max instances: 10 (production), 3 (preview)
- Concurrency: 100 requests per instance

## Rollback Procedures

### 1. Quick Rollback

```bash
# Rollback to previous revision
gcloud run services update-traffic krakengaming-frontend \
  --to-revisions PREVIOUS_REVISION=100

# Rollback database migration
npm run prisma:migrate reset
npm run prisma:migrate deploy
```

### 2. Full Environment Restore

1. Restore database from backup
2. Deploy previous container images
3. Update DNS if necessary
4. Verify functionality

## Cost Optimization

### 1. Resource Monitoring

```bash
# Set budget alerts
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="KrakenGaming Budget" \
  --budget-amount=100USD \
  --threshold-rule=percent=50,basis=CURRENT_SPEND \
  --threshold-rule=percent=90,basis=CURRENT_SPEND
```

### 2. Resource Cleanup

- Schedule cleanup of old container images
- Clean up unused Cloud SQL backups
- Monitor and optimize Cloud Run resource allocation

## Troubleshooting

### Common Issues

1. **Service Not Starting**: Check logs and resource limits
2. **Database Connection Issues**: Verify Cloud SQL connectivity
3. **Domain Not Resolving**: Check DNS configuration and domain mapping
4. **High Response Times**: Check resource allocation and database performance

### Debug Commands

```bash
# Check service logs
gcloud run services logs read krakengaming-frontend

# Check service configuration
gcloud run services describe krakengaming-frontend

# Test connectivity
gcloud sql connect krakengaming-db --user=krakengaming-user
```

## Support and Maintenance

### Regular Tasks

1. **Weekly**: Review monitoring dashboards and alerts
2. **Monthly**: Update dependencies and security patches
3. **Quarterly**: Review resource usage and costs
4. **Annually**: Security audit and disaster recovery testing

### Emergency Contacts

- Infrastructure Team: infrastructure@krakengaming.org
- Database Admin: dba@krakengaming.org
- Security Team: security@krakengaming.org
