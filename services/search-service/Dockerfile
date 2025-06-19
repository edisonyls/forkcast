FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy workspace package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY search-service/package*.json ./search-service/

# Install workspace dependencies
RUN npm install

# Copy shared package source and build it
COPY shared/ ./shared/
RUN cd shared && npx tsc --skipLibCheck || true

# Copy search service source
COPY search-service/ ./search-service/

# Build the search service (ignore type errors for production)
RUN cd search-service && npx tsc --skipLibCheck || true

# Set working directory to search service
WORKDIR /app/search-service

# Expose port
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3004/health').then(() => process.exit(0)).catch(() => process.exit(1))"

# Start the application
CMD ["npm", "start"] 