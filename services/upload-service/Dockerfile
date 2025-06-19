FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy workspace package files and install root dependencies
COPY package*.json ./
RUN npm install

# Copy and build shared package
COPY shared/ ./shared/
RUN cd shared && npm install && (npx tsc --skipLibCheck || true)

# Copy upload service and install its dependencies
COPY upload-service/ ./upload-service/
RUN cd upload-service && npm install && (npx tsc --skipLibCheck || true)

# Set working directory to upload service
WORKDIR /app/upload-service

# Create uploads directory
RUN mkdir -p uploads/profiles

# Expose port
EXPOSE 3006

# Start the application
CMD ["npm", "start"] 