FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy workspace package files and install root dependencies
COPY package*.json ./
RUN npm install

# Copy and build shared package
COPY shared/ ./shared/
RUN cd shared && npm install && (npx tsc --skipLibCheck || true)

# Copy notification service and install its dependencies
COPY notification-service/ ./notification-service/
RUN cd notification-service && npm install && (npx tsc --skipLibCheck || true)

# Set working directory to notification service
WORKDIR /app/notification-service

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3005/health').then(() => process.exit(0)).catch(() => process.exit(1))"

# Start the application
CMD ["npm", "start"] 