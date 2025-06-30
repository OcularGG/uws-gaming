# Multi-stage build for production
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/database/package*.json ./packages/database/

# Install all dependencies (including dev for build)
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app

# Copy package files and install all dependencies including dev
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/database/package*.json ./packages/database/
RUN npm ci

# Copy source code after installing dependencies
COPY . .

# Build the application
RUN cd apps/backend && npx tsup src/index.ts --format cjs --outDir dist

# Production dependencies stage
FROM base AS production-deps
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/database/package*.json ./packages/database/
RUN npm ci --only=production

# Production stage
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 api

# Copy built application
COPY --from=builder --chown=api:nodejs /app/apps/backend/dist ./dist
COPY --from=builder --chown=api:nodejs /app/apps/backend/package*.json ./
COPY --from=production-deps --chown=api:nodejs /app/node_modules ./node_modules

# Set up environment
USER api
EXPOSE 4000
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT:-4000}/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/index.js"]
