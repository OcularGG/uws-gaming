#!/bin/bash

# Update Discord Bot Token in Cloud Run Services
# Run this after enabling the bot user and getting a new token

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Updating Discord Bot Token in Cloud Run Services...${NC}"

# Check if token is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide the Discord bot token${NC}"
    echo "Usage: $0 <DISCORD_BOT_TOKEN>"
    exit 1
fi

DISCORD_BOT_TOKEN="$1"
PROJECT_ID="kraken-gaming"
REGION="us-central1"

echo -e "${YELLOW}Updating frontend service...${NC}"
gcloud run services update krakengaming-frontend \
    --region=$REGION \
    --project=$PROJECT_ID \
    --update-env-vars="DISCORD_BOT_TOKEN=$DISCORD_BOT_TOKEN"

echo -e "${YELLOW}Updating preview service...${NC}"
gcloud run services update krakengaming-preview \
    --region=$REGION \
    --project=$PROJECT_ID \
    --update-env-vars="DISCORD_BOT_TOKEN=$DISCORD_BOT_TOKEN"

echo -e "${GREEN}✅ Discord bot token updated in both services!${NC}"
echo -e "${YELLOW}Note: Services will restart automatically with the new token.${NC}"
