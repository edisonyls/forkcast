FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy workspace package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY upload-service/package*.json ./upload-service/

# Install workspace dependencies
RUN npm install

# Copy shared package source and build it
COPY shared/ ./shared/
RUN cd shared && npm run build

# Copy upload service source
COPY upload-service/ ./upload-service/

# Build the upload service
RUN cd upload-service && npm run build

# Set working directory to upload service
WORKDIR /app/upload-service

# Create uploads directory
RUN mkdir -p uploads/profiles

# Expose port
EXPOSE 3006

# Start the application
CMD ["npm", "start"] 