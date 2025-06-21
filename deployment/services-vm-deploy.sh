#!/bin/bash

# Deployment script for Services VM
# This script deploys all backend services using Docker Compose

set -e

echo "🚀 Starting Services VM Deployment..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Navigate to services directory
cd "$(dirname "$0")/../services"

# Check if production environment file exists
if [ ! -f "production.env" ]; then
    echo "❌ production.env file not found. Please configure it first."
    echo "📝 Copy production.env.example to production.env and update the values."
    exit 1
fi

# Load environment variables and export them
set -a
source production.env
set +a

# Validate required environment variables
if [ -z "$FRONTEND_URL" ] || [[ "$FRONTEND_URL" == *"CLIENT_VM_IP"* ]]; then
    echo "❌ Please update CLIENT_VM_IP in production.env with the actual Client VM IP address"
    exit 1
fi

if [ -z "$JWT_SECRET" ] || [[ "$JWT_SECRET" == *"change-this"* ]]; then
    echo "❌ Please update JWT_SECRET in production.env with a secure random string"
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Remove old images (optional, uncomment if you want to rebuild from scratch)
# echo "🗑️  Removing old images..."
# docker-compose -f docker-compose.prod.yml down --rmi all

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
if docker-compose -f docker-compose.prod.yml ps | grep -q "unhealthy\|Exited"; then
    echo "❌ Some services are not healthy. Check logs:"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

echo "✅ Services VM deployment completed successfully!"
echo "🌐 API Gateway available at: http://$(hostname -I | awk '{print $1}'):3000"
echo "📊 Check status with: docker-compose -f docker-compose.prod.yml ps"
echo "📝 View logs with: docker-compose -f docker-compose.prod.yml logs -f" 