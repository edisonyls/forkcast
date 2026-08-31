FROM node:24-alpine

# Install OpenSSL and other dependencies for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Set working directory to parent
WORKDIR /app

# Copy shared package first
COPY shared/ ./shared/

# Install shared dependencies, generate Prisma, and build shared package
WORKDIR /app/shared
RUN npm install && npx prisma generate && npm run build

# Set working directory for upload-service
WORKDIR /app/upload-service

# Copy package.json and package-lock.json (if available)
COPY upload-service/package*.json ./

# Install dependencies (now the ../shared reference will work correctly)
RUN npm install

# Copy upload service source code
COPY upload-service/src ./src
COPY upload-service/tsconfig.json ./

# Build the service
RUN npx tsc --skipLibCheck || true

# Ensure the Docker volume mount point exists
RUN mkdir -p /app/uploads

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
