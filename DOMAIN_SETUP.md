# Domain Setup Instructions for KrakenGaming

## Option A: Easy Setup with Google Cloud DNS (Recommended)

### Step 1: Create Cloud DNS Zone
```bash
gcloud dns managed-zones create krakengaming-zone \
  --description="DNS zone for krakengaming.org" \
  --dns-name="krakengaming.org." \
  --visibility="public"
```

### Step 2: Get Google Nameservers
```bash
gcloud dns managed-zones describe krakengaming-zone --format="value(nameServers)"
```

### Step 3: Update Domain Registrar
1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Change nameservers to the Google nameservers from Step 2
3. Wait for propagation (usually 24-48 hours)

### Step 4: Create DNS Records
```bash
# Production site (root domain)
gcloud dns record-sets create krakengaming.org. \
  --zone="krakengaming-zone" \
  --type="A" \
  --ttl="300" \
  --rrdatas="216.239.32.21,216.239.34.21,216.239.36.21,216.239.38.21"

# Preview subdomain
gcloud dns record-sets create preview.krakengaming.org. \
  --zone="krakengaming-zone" \
  --type="CNAME" \
  --ttl="300" \
  --rrdatas="ghs.googlehosted.com."

# API subdomain (for future use)
gcloud dns record-sets create api.krakengaming.org. \
  --zone="krakengaming-zone" \
  --type="CNAME" \
  --ttl="300" \
  --rrdatas="ghs.googlehosted.com."
```

### Benefits of Google Cloud DNS:
- ✅ Integrated with Google Cloud services
- ✅ Automatic SSL certificate management
- ✅ Global anycast network (faster DNS resolution)
- ✅ Easy programmatic management
- ✅ Built-in monitoring and logging
- ✅ Cost-effective ($0.50 per hosted zone per month)

---

## Option B: Keep Current Nameservers (Manual Setup)

## Step 1: Domain Verification
1. Go to Google Search Console: https://search.google.com/search-console/
2. Add `krakengaming.org` as a domain property
3. Add the TXT record provided by Google to your DNS settings
4. Verify ownership

## Step 2: DNS Configuration
Add these DNS records to your domain registrar:

### For Production (krakengaming.org)
```
Type: CNAME
Name: @
Value: ghs.googlehosted.com
```

### For Preview (preview.krakengaming.org)
```
Type: CNAME
Name: preview
Value: ghs.googlehosted.com
```

### For API (api.krakengaming.org) - Future use
```
Type: CNAME
Name: api
Value: ghs.googlehosted.com
```

## Step 3: Google Cloud Domain Mapping Commands
After domain verification, run these commands:

### Map Production Domain
```bash
gcloud run domain-mappings create --service kraken-frontend-prod --domain krakengaming.org --region us-central1
```

### Map Preview Domain
```bash
gcloud run domain-mappings create --service kraken-frontend-preview --domain preview.krakengaming.org --region us-central1
```

## Step 4: SSL Certificate
Google Cloud Run automatically provisions SSL certificates for custom domains.

## Step 5: Verification
After DNS propagation (up to 24 hours), verify:
- https://krakengaming.org (Production)
- https://preview.krakengaming.org (Preview)
