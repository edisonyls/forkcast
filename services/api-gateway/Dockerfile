FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy workspace package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY api-gateway/package*.json ./api-gateway/

# Install workspace dependencies
RUN npm install

# Copy shared package source and build it
COPY shared/ ./shared/
RUN cd shared && npm run build

# Copy api gateway source
COPY api-gateway/ ./api-gateway/

# Build the api gateway
RUN cd api-gateway && npm run build

# Set working directory to api gateway
WORKDIR /app/api-gateway

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(() => process.exit(0)).catch(() => process.exit(1))"

# Start the application
CMD ["npm", "start"] 