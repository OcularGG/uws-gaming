# GitHub Actions CI/CD Setup Guide

## Overview
This guide will help you set up the CI/CD pipeline for the UWS Gaming project using GitHub Actions.

## Prerequisites
- Access to the GitHub repository: https://github.com/OcularGG/uws-gaming
- Google Cloud project `uws-gaming` configured
- Service account key created (github-actions-key.json)

## GitHub Secrets Setup

You need to add the following secrets to your GitHub repository:

### Go to: Repository Settings > Secrets and variables > Actions

1. **GCP_SA_KEY**
   - Copy the entire content of `github-actions-key.json`
   - This provides authentication to Google Cloud Platform

2. **DISCORD_BOT_TOKEN** (when ready)
   - Your Discord bot token
   - Required for Discord bot deployment

3. **DISCORD_CLIENT_ID** (when ready)
   - Your Discord application client ID
   - Required for OAuth integration

4. **DISCORD_CLIENT_SECRET** (when ready)
   - Your Discord application client secret
   - Required for OAuth integration

## Service Account Permissions

The `github-actions@uws-gaming.iam.gserviceaccount.com` service account has been configured with:
- Cloud Run Admin (deploy services)
- Storage Admin (push to Artifact Registry)
- Secret Manager Secret Accessor (access production secrets)
- DNS Admin (manage domain mappings)

## Workflow Files

### 1. Production Deployment (`.github/workflows/deploy-production.yml`)
- Triggers on push to `main` branch
- Runs tests and builds
- Deploys to Google Cloud Run
- Maps custom domains
- Updates DNS records

### 2. CI Pipeline (`.github/workflows/ci.yml`)
- Triggers on pull requests and pushes
- Runs linting and testing
- Performs security audits
- Builds all packages

## Deployment Process

1. **Push to main branch** triggers production deployment
2. **Pull requests** trigger CI testing
3. **Manual deployment** can be triggered via GitHub Actions UI

## Production URLs

After successful deployment:
- **Frontend**: https://uwsgaming.org
- **Backend API**: https://api.uwsgaming.org
- **Cloud Run Services**: 
  - uwsgaming-frontend
  - uwsgaming-backend

## Google Cloud Services Used

- **Cloud Run**: Application hosting
- **Cloud SQL**: PostgreSQL database
- **Secret Manager**: Secure credential storage
- **Cloud DNS**: Domain management
- **Artifact Registry**: Container image storage

## Next Steps

1. Add the GitHub secrets listed above
2. Push code to the main branch to trigger first deployment
3. Verify deployment success in GitHub Actions logs
4. Test the live application at https://uwsgaming.org

## Troubleshooting

- Check GitHub Actions logs for deployment errors
- Verify Google Cloud permissions if authentication fails
- Ensure all secrets are properly configured
- Check Cloud Run logs for runtime errors

## Security Notes

- Service account key is stored securely in GitHub secrets
- Production secrets are managed via Google Cloud Secret Manager
- Database credentials are never exposed in repository
- All communication uses HTTPS with Google-managed certificates
