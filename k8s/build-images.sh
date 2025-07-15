#!/bin/bash

# Build Docker images for Forkcast backend services
# Frontend runs in separate VM so not included

set -e

echo "🐳 Building Forkcast Backend Docker Images"
echo "==========================================="
echo ""

# Configuration
REGISTRY="edisonyls"
TAG="latest"

echo "Building backend service images..."
echo "Registry: $REGISTRY"
echo "Tag: $TAG"
echo ""

cd services

echo "🔨 Building API Gateway..."
docker build -f api-gateway/Dockerfile -t "${REGISTRY}/forkcast-api-gateway:${TAG}" .

echo "🔨 Building Menu Service..."
docker build -f menu-service/Dockerfile -t "${REGISTRY}/forkcast-menu-service:${TAG}" .

echo "🔨 Building Order Service..."
docker build -f order-service/Dockerfile -t "${REGISTRY}/forkcast-order-service:${TAG}" .

echo "🔨 Building Search Service..."
docker build -f search-service/Dockerfile -t "${REGISTRY}/forkcast-search-service:${TAG}" .

echo "🔨 Building Notification Service..."
docker build -f notification-service/Dockerfile -t "${REGISTRY}/forkcast-notification-service:${TAG}" .

echo "🔨 Building Upload Service..."
docker build -f upload-service/Dockerfile -t "${REGISTRY}/forkcast-upload-service:${TAG}" .

cd ..

echo ""
echo "✅ All backend images built successfully!"
echo ""
echo "Built images:"
echo "  ${REGISTRY}/forkcast-api-gateway:${TAG}"
echo "  ${REGISTRY}/forkcast-menu-service:${TAG}"
echo "  ${REGISTRY}/forkcast-order-service:${TAG}"
echo "  ${REGISTRY}/forkcast-search-service:${TAG}"
echo "  ${REGISTRY}/forkcast-notification-service:${TAG}"
echo "  ${REGISTRY}/forkcast-upload-service:${TAG}"
echo ""

# Ask user if they want to push images
read -p "Do you want to push images to registry now? (y/n): " PUSH_IMAGES

if [[ $PUSH_IMAGES =~ ^[Yy]$ ]]; then
    echo ""
    echo "📤 Pushing images to registry..."
    echo "Make sure you're logged in: docker login"
    echo ""
    
    echo "Pushing API Gateway..."
    docker push "${REGISTRY}/forkcast-api-gateway:${TAG}"
    
    echo "Pushing Menu Service..."
    docker push "${REGISTRY}/forkcast-menu-service:${TAG}"
    
    echo "Pushing Order Service..."
    docker push "${REGISTRY}/forkcast-order-service:${TAG}"
    
    echo "Pushing Search Service..."
    docker push "${REGISTRY}/forkcast-search-service:${TAG}"
    
    echo "Pushing Notification Service..."
    docker push "${REGISTRY}/forkcast-notification-service:${TAG}"
    
    echo "Pushing Upload Service..."
    docker push "${REGISTRY}/forkcast-upload-service:${TAG}"
    
    echo ""
    echo "✅ All images pushed successfully!"
else
    echo ""
    echo "📤 To push images manually later:"
    echo "  docker login"
    echo "  docker push ${REGISTRY}/forkcast-api-gateway:${TAG}"
    echo "  docker push ${REGISTRY}/forkcast-menu-service:${TAG}"
    echo "  docker push ${REGISTRY}/forkcast-order-service:${TAG}"
    echo "  docker push ${REGISTRY}/forkcast-search-service:${TAG}"
    echo "  docker push ${REGISTRY}/forkcast-notification-service:${TAG}"
    echo "  docker push ${REGISTRY}/forkcast-upload-service:${TAG}"
fi
echo ""
echo "🌐 Frontend Configuration:"
echo "Configure your frontend VM to connect to the API Gateway at:"
echo "  API_URL=http://<kubernetes-master-ip>:30001"
echo ""
echo "Remember to update the image names in the Kubernetes YAML files to match your registry!"
echo "Update files in k8s/ directory and replace 'forkcast/' with '${REGISTRY}/forkcast-'"
