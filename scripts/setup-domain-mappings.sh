#!/bin/bash
# Run this script AFTER DNS has propagated to Google nameservers

echo "🔍 Checking DNS propagation..."
nslookup krakengaming.org

echo ""
echo "🌐 If the above shows Google Cloud IP addresses, DNS has propagated!"
echo "Current Google Cloud IPs should be: 216.239.32.21, 216.239.34.21, 216.239.36.21, 216.239.38.21"
echo ""

read -p "Has DNS propagated to Google nameservers? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Creating domain mappings..."

    # Map production domain
    echo "📍 Mapping krakengaming.org to production service..."
    gcloud run domain-mappings create \
      --service kraken-frontend-prod \
      --domain krakengaming.org \
      --region us-central1 \
      --platform managed

    # Map preview domain
    echo "📍 Mapping preview.krakengaming.org to preview service..."
    gcloud run domain-mappings create \
      --service kraken-frontend-preview \
      --domain preview.krakengaming.org \
      --region us-central1 \
      --platform managed

    echo ""
    echo "✅ Domain mappings created!"
    echo ""
    echo "🔒 SSL certificates will be automatically provisioned by Google."
    echo "This may take a few minutes to complete."
    echo ""
    echo "🌐 Your sites will be available at:"
    echo "   Production: https://krakengaming.org"
    echo "   Preview:    https://preview.krakengaming.org"
    echo ""
    echo "📊 Check domain mapping status:"
    echo "   gcloud run domain-mappings list --region us-central1"

else
    echo "⏰ DNS hasn't propagated yet. Wait a bit longer and try again."
    echo "💡 You can check propagation status at: https://www.whatsmydns.net/"
fi
