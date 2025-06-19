FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy workspace package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY menu-service/package*.json ./menu-service/

# Install workspace dependencies
RUN npm install

# Copy shared package source and build it
COPY shared/ ./shared/
RUN cd shared && npm run build

# Copy menu service source
COPY menu-service/ ./menu-service/

# Build the menu service
RUN cd menu-service && npm run build

# Set working directory to menu service
WORKDIR /app/menu-service

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3002/health').then(() => process.exit(0)).catch(() => process.exit(1))"

# Start the application
CMD ["npm", "start"] 