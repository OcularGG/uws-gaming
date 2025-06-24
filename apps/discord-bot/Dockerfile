FROM node:20-alpine

WORKDIR /app

# Copy package.json first for better caching
COPY package.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm install

# Copy source code and TypeScript configuration
COPY src ./src
COPY tsconfig.json ./tsconfig.json

# Build the TypeScript code using tsc directly
RUN npx tsc --project tsconfig.json

# Remove dev dependencies for production
RUN npm ci --only=production && npm cache clean --force

# Set production environment
ENV NODE_ENV=production

# Start the bot
CMD ["node", "dist/index.js"]
