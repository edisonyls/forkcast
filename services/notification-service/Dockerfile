FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy workspace package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY notification-service/package*.json ./notification-service/

# Install workspace dependencies
RUN npm install

# Copy shared package source and build it
COPY shared/ ./shared/
RUN cd shared && npm run build

# Copy notification service source
COPY notification-service/ ./notification-service/

# Build the notification service
RUN cd notification-service && npm run build

# Set working directory to notification service
WORKDIR /app/notification-service

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3005/health').then(() => process.exit(0)).catch(() => process.exit(1))"

# Start the application
CMD ["npm", "start"] 