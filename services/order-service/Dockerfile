FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy workspace package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY order-service/package*.json ./order-service/

# Install workspace dependencies
RUN npm install

# Copy shared package source and build it
COPY shared/ ./shared/
RUN cd shared && npx tsc --skipLibCheck --noEmitOnError false

# Copy order service source
COPY order-service/ ./order-service/

# Build the order service with lenient type checking
RUN cd order-service && npx tsc --skipLibCheck --noEmitOnError false

# Set working directory to order service
WORKDIR /app/order-service

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3003/health').then(() => process.exit(0)).catch(() => process.exit(1))"

# Start the application
CMD ["npm", "start"] 