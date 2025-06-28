FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy source code and TypeScript configuration
COPY src ./src
COPY tsconfig.json ./tsconfig.json

# Install dev dependencies for building
RUN npm install typescript

# Build the TypeScript code
RUN npx tsc

# Set production environment
ENV NODE_ENV=production

# Expose port for health checks
EXPOSE 8080

# Start the bot
CMD ["node", "dist/index-simple.js"]
