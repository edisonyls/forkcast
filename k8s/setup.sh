#!/bin/bash

# Complete setup script for Forkcast Kubernetes deployment
# This script guides you through the entire setup process

set -e

echo "🚀 Forkcast Kubernetes Setup"
echo "=============================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check cluster connectivity
echo "✅ Checking Kubernetes cluster connectivity..."
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster. Please check your kubectl configuration."
    exit 1
fi

echo "✅ Prerequisites met!"
echo ""

# Get cluster information
echo "📋 Cluster Information:"
kubectl get nodes -o wide
echo ""

# Get worker node hostname
WORKER_NODES=$(kubectl get nodes --no-headers | grep -v master | awk '{print $1}' | head -1)
if [ -z "$WORKER_NODES" ]; then
    echo "❌ No worker nodes found. Please ensure you have worker nodes in your cluster."
    exit 1
fi

echo "🔧 Configuration Setup"
echo "======================"
echo ""

# Update persistent volumes with actual worker node
echo "Updating persistent volumes configuration..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/worker-node/$WORKER_NODES/g" 02-persistent-volumes.yaml
else
    # Linux
    sed -i "s/worker-node/$WORKER_NODES/g" 02-persistent-volumes.yaml
fi
echo "✅ Updated persistent volumes to use worker node: $WORKER_NODES"

# Prompt for registry configuration
echo ""
read -p "Enter your Docker registry (e.g., your-username for Docker Hub, or registry.example.com): " REGISTRY

if [ -z "$REGISTRY" ]; then
    echo "❌ Registry cannot be empty"
    exit 1
fi

# Update build script
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/your-registry.com/$REGISTRY/g" build-images.sh
else
    sed -i "s/your-registry.com/$REGISTRY/g" build-images.sh
fi

# Update Kubernetes manifests
echo "Updating Kubernetes manifests with registry information..."
for file in 05-menu-service.yaml 06-order-service.yaml 07-search-service.yaml 08-notification-service.yaml 09-upload-service.yaml 10-api-gateway.yaml 13-db-migration.yaml; do
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|forkcast/|${REGISTRY}/forkcast/|g" "$file"
    else
        sed -i "s|forkcast/|${REGISTRY}/forkcast/|g" "$file"
    fi
done

echo "✅ Updated registry configuration"

# Prompt for secrets
echo ""
echo "🔐 Security Configuration"
echo "========================="
echo ""

read -s -p "Enter a strong PostgreSQL password: " POSTGRES_PASSWORD
echo ""
read -s -p "Enter a strong JWT secret (min 32 characters): " JWT_SECRET
echo ""

if [ ${#JWT_SECRET} -lt 32 ]; then
    echo "❌ JWT secret must be at least 32 characters long"
    exit 1
fi

# Encode secrets
POSTGRES_PASSWORD_B64=$(echo -n "$POSTGRES_PASSWORD" | base64)
JWT_SECRET_B64=$(echo -n "$JWT_SECRET" | base64)

# Update secrets in configmap
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/cG9zdGdyZXM=/$POSTGRES_PASSWORD_B64/g" 01-configmap-secrets.yaml
    sed -i '' "s/eW91ci1zdXBlci1zZWNyZXQtand0LWtleS1jaGFuZ2UtaW4tcHJvZHVjdGlvbg==/$JWT_SECRET_B64/g" 01-configmap-secrets.yaml
else
    sed -i "s/cG9zdGdyZXM=/$POSTGRES_PASSWORD_B64/g" 01-configmap-secrets.yaml
    sed -i "s/eW91ci1zdXBlci1zZWNyZXQtand0LWtleS1jaGFuZ2UtaW4tcHJvZHVjdGlvbg==/$JWT_SECRET_B64/g" 01-configmap-secrets.yaml
fi

echo "✅ Updated security configuration"

# Create storage directories
echo ""
echo "💾 Storage Setup"
echo "==============="
echo ""

echo "Creating storage directories on worker nodes..."
echo "You may need to enter your sudo password for the worker node..."

# Create directories on worker node
kubectl get nodes --no-headers | grep -v master | while read node rest; do
    echo "Setting up storage on node: $node"
    echo "Note: This assumes you can SSH to your worker nodes with the same username"
    echo "If this fails, manually create directories /mnt/data/postgres, /mnt/data/redis, /mnt/data/uploads on $node"
    
    # Try to create directories (this might fail if SSH is not set up)
    ssh "$node" "sudo mkdir -p /mnt/data/postgres /mnt/data/redis /mnt/data/uploads && sudo chmod 755 /mnt/data/postgres /mnt/data/redis /mnt/data/uploads" || echo "⚠️  Could not SSH to $node. Please create directories manually."
done

echo ""
echo "🏗️  Build and Deploy"
echo "==================="
echo ""

read -p "Do you want to build Docker images now? (y/n): " BUILD_IMAGES

if [[ $BUILD_IMAGES =~ ^[Yy]$ ]]; then
    echo "Building Docker images..."
    ./build-images.sh
    
    echo ""
    echo "📤 Push Images"
    echo "=============="
    echo ""
    echo "Images have been built. You need to push them to your registry."
    echo "First, log in to your registry:"
    echo "  docker login"
    echo ""
    echo "Then push the images:"
    echo "  docker push ${REGISTRY}/forkcast/api-gateway:latest"
    echo "  docker push ${REGISTRY}/forkcast/menu-service:latest"
    echo "  docker push ${REGISTRY}/forkcast/order-service:latest"
    echo "  docker push ${REGISTRY}/forkcast/search-service:latest"
    echo "  docker push ${REGISTRY}/forkcast/notification-service:latest"
    echo "  docker push ${REGISTRY}/forkcast/upload-service:latest"
    echo ""
    
    read -p "Have you pushed all images to the registry? (y/n): " IMAGES_PUSHED
    
    if [[ ! $IMAGES_PUSHED =~ ^[Yy]$ ]]; then
        echo "❌ Please push images before deploying."
        echo "Run: docker login && docker push ${REGISTRY}/forkcast/*:latest"
        exit 1
    fi
fi

echo ""
read -p "Do you want to deploy to Kubernetes now? (y/n): " DEPLOY_NOW

if [[ $DEPLOY_NOW =~ ^[Yy]$ ]]; then
    echo "Deploying to Kubernetes..."
    ./deploy.sh
    
    echo ""
    echo "🎉 Backend Deployment Complete!"
    echo "================================"
    echo ""
    
    # Get master node IP
    MASTER_IP=$(kubectl get nodes -o wide | grep master | awk '{print $6}' | head -1)
    
    echo "Your Forkcast backend services are now running!"
    echo ""
    echo "API Gateway Access:"
    echo "  API Gateway: http://$MASTER_IP:30001"
    echo ""
    echo "Configure your Frontend VM:"
    echo "  Set API_URL=http://$MASTER_IP:30001 in your frontend environment"
    echo "  Update NEXT_PUBLIC_API_URL=http://$MASTER_IP:30001 in your .env file"
    echo ""
    echo "To check backend status:"
    echo "  kubectl get all -n forkcast"
    echo ""
    echo "To view logs:"
    echo "  kubectl logs -f deployment/api-gateway -n forkcast"
    echo ""
else
    echo "Setup complete! To deploy later, run:"
    echo "  ./deploy.sh"
fi

echo ""
echo "📚 Documentation"
echo "==============="
echo "For detailed information, troubleshooting, and production tips, see:"
echo "  README.md"
echo ""
echo "Happy cooking! 👨‍🍳👩‍🍳"
