FROM node:18-alpine3.18

# Install OpenSSL and other dependencies for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Set working directory
WORKDIR /app/upload-service

# Copy package.json and package-lock.json (if available)
COPY upload-service/package*.json ./

# Install dependencies
RUN npm install

# Copy shared package first
COPY shared/ /app/shared/

# Install shared dependencies and generate Prisma
WORKDIR /app/shared
RUN npm install && npx prisma generate

# Go back to upload-service
WORKDIR /app/upload-service

# Copy upload service source code
COPY upload-service/src ./src
COPY upload-service/tsconfig.json ./

# Build the service
RUN npx tsc --skipLibCheck || true

# Create uploads directory
RUN mkdir -p uploads/profiles

# Set default environment variables
ENV PORT=3006
ENV NODE_ENV=production

# Expose port
EXPOSE 3006

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3006/health').then(() => process.exit(0)).catch(() => process.exit(1))"

# Start the application
CMD ["npm", "start"] 