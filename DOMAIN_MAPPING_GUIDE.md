# Domain Mapping Setup Guide for KrakenGaming
# Manual setup through Google Cloud Console

## 🌐 **Step 1: Add Domain Mappings**

### Production Domain (krakengaming.org)
1. Go to: https://console.cloud.google.com/run/domains?project=kraken-gaming
2. Click **"Add Mapping"**
3. Fill in:
   - **Domain**: `krakengaming.org`
   - **Service**: `kraken-frontend-prod`
   - **Region**: `us-central1`
4. Click **"Continue"**
5. Click **"Done"**

### Preview Domain (preview.krakengaming.org)
1. Click **"Add Mapping"** again
2. Fill in:
   - **Domain**: `preview.krakengaming.org`
   - **Service**: `kraken-frontend-preview`
   - **Region**: `us-central1`
3. Click **"Continue"**
4. Click **"Done"**

## 🔒 **Step 2: SSL Certificate Status**
After adding mappings, Google will automatically:
- ✅ Create managed SSL certificates
- ✅ Configure load balancer
- ✅ Set up HTTPS redirects

**Timeline**: 10-60 minutes for SSL certificate provisioning

## 📊 **Step 3: Monitor Status**
Check domain mapping status at:
https://console.cloud.google.com/run/domains?project=kraken-gaming

**Status Indicators**:
- 🟡 **Yellow**: Certificate provisioning in progress
- 🟢 **Green**: Ready and SSL certificate active
- 🔴 **Red**: Error (check DNS configuration)

## 🔍 **Step 4: Verify DNS (Already Done)**
Our DNS records are correctly configured:
```
krakengaming.org          A    216.239.32.21
krakengaming.org          A    216.239.34.21
krakengaming.org          A    216.239.36.21
krakengaming.org          A    216.239.38.21
preview.krakengaming.org  A    216.239.32.21
preview.krakengaming.org  A    216.239.34.21
preview.krakengaming.org  A    216.239.36.21
preview.krakengaming.org  A    216.239.38.21
```

## ⚡ **Step 5: Test After Setup**
Once SSL certificates are active (green status):
- Production: https://krakengaming.org
- Preview: https://preview.krakengaming.org

## 🚨 **Troubleshooting**
If domains show red status:
1. Verify DNS propagation: `nslookup krakengaming.org`
2. Check domain ownership verification
3. Ensure services are public (we already did this)

## 📝 **Current Service Status**
- ✅ kraken-frontend-prod: Public, Discord credentials configured
- ✅ kraken-frontend-preview: Public, Discord credentials configured
- ✅ DNS: Correctly pointing to Google Cloud Load Balancer
- 🟡 SSL: Pending domain mapping setup

**Next**: Follow the manual steps above to create domain mappings.
