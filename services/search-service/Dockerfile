FROM node:24-alpine

# Install OpenSSL and other dependencies for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Set working directory
WORKDIR /app

# Copy workspace package files and install root dependencies
COPY package*.json ./
RUN npm install

# Copy and build shared package
COPY shared/ ./shared/
RUN cd shared && npm install && npx prisma generate && (npx tsc --skipLibCheck || true)

# Copy search service and install its dependencies
COPY search-service/ ./search-service/
RUN cd search-service && npm install && (npx tsc --skipLibCheck || true)

# Set working directory to search service
WORKDIR /app/search-service

# Expose port
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3004/health').then(() => process.exit(0)).catch(() => process.exit(1))"

# Start the application
CMD ["npm", "start"]
