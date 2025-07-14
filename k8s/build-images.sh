#!/bin/bash

# Build Docker images for Forkcast backend services
# Frontend runs in separate VM so not included

set -e

echo "🐳 Building Forkcast Backend Docker Images"
echo "==========================================="
echo ""

# Configuration
REGISTRY="your-registry.com"  # Update this with your Docker registry
TAG="latest"

echo "Building backend service images..."
echo "Registry: $REGISTRY"
echo "Tag: $TAG"
echo ""

cd services

echo "🔨 Building API Gateway..."
docker build -f api-gateway/Dockerfile -t "${REGISTRY}/forkcast/api-gateway:${TAG}" .

echo "🔨 Building Menu Service..."
docker build -f menu-service/Dockerfile -t "${REGISTRY}/forkcast/menu-service:${TAG}" .

echo "🔨 Building Order Service..."
docker build -f order-service/Dockerfile -t "${REGISTRY}/forkcast/order-service:${TAG}" .

echo "🔨 Building Search Service..."
docker build -f search-service/Dockerfile -t "${REGISTRY}/forkcast/search-service:${TAG}" .

echo "🔨 Building Notification Service..."
docker build -f notification-service/Dockerfile -t "${REGISTRY}/forkcast/notification-service:${TAG}" .

echo "🔨 Building Upload Service..."
docker build -f upload-service/Dockerfile -t "${REGISTRY}/forkcast/upload-service:${TAG}" .

cd ..

echo ""
echo "✅ All backend images built successfully!"
echo ""
echo "Built images:"
echo "  ${REGISTRY}/forkcast/api-gateway:${TAG}"
echo "  ${REGISTRY}/forkcast/menu-service:${TAG}"
echo "  ${REGISTRY}/forkcast/order-service:${TAG}"
echo "  ${REGISTRY}/forkcast/search-service:${TAG}"
echo "  ${REGISTRY}/forkcast/notification-service:${TAG}"
echo "  ${REGISTRY}/forkcast/upload-service:${TAG}"
echo ""
echo "📤 To push to registry:"
echo "  docker login"
echo "  docker push ${REGISTRY}/forkcast/api-gateway:${TAG}"
echo "  docker push ${REGISTRY}/forkcast/menu-service:${TAG}"
echo "  docker push ${REGISTRY}/forkcast/order-service:${TAG}"
echo "  docker push ${REGISTRY}/forkcast/search-service:${TAG}"
echo "  docker push ${REGISTRY}/forkcast/notification-service:${TAG}"
echo "  docker push ${REGISTRY}/forkcast/upload-service:${TAG}"
echo ""
echo "🌐 Frontend Configuration:"
echo "Configure your frontend VM to connect to the API Gateway at:"
echo "  API_URL=http://<kubernetes-master-ip>:30001"
echo ""
echo "Remember to update the image names in the Kubernetes YAML files to match your registry!"
echo "Update files in k8s/ directory and replace 'forkcast/' with '${REGISTRY}/forkcast/'"
