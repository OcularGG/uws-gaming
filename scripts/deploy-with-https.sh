#!/bin/bash
# Rebuild and redeploy with HTTPS redirect support

echo "🚀 Rebuilding KrakenGaming with HTTPS redirect support..."

# Submit build with updated configuration
gcloud builds submit \
  --config cloudbuild-frontend.yaml \
  --substitutions _SERVICE_NAME=kraken-frontend-prod \
  .

echo "✅ Build submitted! Monitor with: gcloud builds list --limit=5"

# Update both production and preview services
echo "📦 Updating production service..."
gcloud run deploy kraken-frontend-prod \
  --image gcr.io/kraken-gaming/frontend-prod \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars="NEXT_PUBLIC_ENV=production,NEXT_PUBLIC_DOMAIN=krakengaming.org,NODE_ENV=production,NEXTAUTH_URL=https://krakengaming.org" \
  --set-secrets="DISCORD_CLIENT_ID=discord-client-id:latest,DISCORD_CLIENT_SECRET=discord-client-secret:latest,NEXTAUTH_SECRET=nextauth-secret:latest"

echo "🔍 Updating preview service..."
gcloud run deploy kraken-frontend-preview \
  --image gcr.io/kraken-gaming/frontend-prod \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars="NEXT_PUBLIC_ENV=preview,NEXT_PUBLIC_DOMAIN=preview.krakengaming.org,NODE_ENV=production,NEXTAUTH_URL=https://preview.krakengaming.org" \
  --set-secrets="DISCORD_CLIENT_ID=discord-client-id:latest,DISCORD_CLIENT_SECRET=discord-client-secret:latest,NEXTAUTH_SECRET=nextauth-secret:latest"

echo "🌐 Services updated with HTTPS redirect support!"
echo ""
echo "Next steps:"
echo "1. Wait for DNS propagation (check: https://www.whatsmydns.net/)"
echo "2. Create domain mappings once DNS propagates"
echo "3. Test HTTPS redirects"
