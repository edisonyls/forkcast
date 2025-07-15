#!/bin/bash

# Build Docker images for Forkcast backend services - AMD64 ONLY
# Frontend runs in separate VM so not included

set -e

echo "🐳 Building Forkcast Backend Docker Images (AMD64)"
echo "================================================="
echo ""

# Configuration
REGISTRY="edisonyls"
TAG="latest"

echo "Building backend service images for AMD64 architecture..."
echo "Registry: $REGISTRY"
echo "Tag: $TAG"
echo "Platform: linux/amd64"
echo ""

# Ensure buildx is available
if ! docker buildx version &> /dev/null; then
    echo "❌ Docker buildx is required for platform-specific builds"
    echo "Please install Docker Desktop or enable buildx"
    exit 1
fi

cd ../services

echo "🔨 Building API Gateway..."
docker buildx build --platform linux/amd64 --push -f api-gateway/Dockerfile -t "${REGISTRY}/forkcast-api-gateway:${TAG}" .

echo "🔨 Building Menu Service..."
docker buildx build --platform linux/amd64 --push -f menu-service/Dockerfile -t "${REGISTRY}/forkcast-menu-service:${TAG}" .

echo "🔨 Building Order Service..."
docker buildx build --platform linux/amd64 --push -f order-service/Dockerfile -t "${REGISTRY}/forkcast-order-service:${TAG}" .

echo "🔨 Building Search Service..."
docker buildx build --platform linux/amd64 --push -f search-service/Dockerfile -t "${REGISTRY}/forkcast-search-service:${TAG}" .

echo "🔨 Building Notification Service..."
docker buildx build --platform linux/amd64 --push -f notification-service/Dockerfile -t "${REGISTRY}/forkcast-notification-service:${TAG}" .

echo "🔨 Building Upload Service..."
docker buildx build --platform linux/amd64 --push -f upload-service/Dockerfile -t "${REGISTRY}/forkcast-upload-service:${TAG}" .

cd ../k8s

echo ""
echo "✅ All backend images built successfully for AMD64!"
echo ""
echo "Built images:"
echo "  ${REGISTRY}/forkcast-api-gateway:${TAG}"
echo "  ${REGISTRY}/forkcast-menu-service:${TAG}"
echo "  ${REGISTRY}/forkcast-order-service:${TAG}"
echo "  ${REGISTRY}/forkcast-search-service:${TAG}"
echo "  ${REGISTRY}/forkcast-notification-service:${TAG}"
echo "  ${REGISTRY}/forkcast-upload-service:${TAG}"
echo ""
echo "Images have been automatically pushed to registry."
echo ""
echo "Next steps:"
echo "1. Restart the failing deployments to pull the new images:"
echo "   kubectl rollout restart deployment -n forkcast order-service"
echo "   kubectl rollout restart deployment -n forkcast search-service"
echo "   kubectl rollout restart deployment -n forkcast notification-service"
echo "   kubectl rollout restart deployment -n forkcast upload-service"
echo ""