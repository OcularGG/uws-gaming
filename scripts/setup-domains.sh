#!/bin/bash
# Domain mapping script - run after domain verification

echo "Creating domain mappings for KrakenGaming..."

# Map production domain
echo "Mapping krakengaming.org to production service..."
gcloud run domain-mappings create \
  --service kraken-frontend-prod \
  --domain krakengaming.org \
  --region us-central1 \
  --platform managed

# Map preview domain
echo "Mapping preview.krakengaming.org to preview service..."
gcloud run domain-mappings create \
  --service kraken-frontend-preview \
  --domain preview.krakengaming.org \
  --region us-central1 \
  --platform managed

echo "Domain mappings created! Check status with:"
echo "gcloud run domain-mappings list --region us-central1"
