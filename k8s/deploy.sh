#!/bin/bash

# Deploy Forkcast application to Kubernetes
# Make sure kubectl is configured to connect to your cluster

set -e

echo "Deploying Forkcast application to Kubernetes..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "kubectl is not installed or not in PATH"
    exit 1
fi

# Check if cluster is accessible
echo "Checking cluster connectivity..."
kubectl cluster-info

echo "Creating namespace and basic configuration..."
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-configmap-secrets.yaml

echo "Creating persistent volumes..."
kubectl apply -f 02-persistent-volumes.yaml

echo "Waiting for persistent volumes to be available..."
sleep 10

echo "Deploying database and cache..."
kubectl apply -f 03-postgres.yaml
kubectl apply -f 04-redis.yaml

echo "Waiting for database and Redis to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n forkcast --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n forkcast --timeout=300s

echo "Running database migrations..."
echo "⚠️  Note: Make sure you've built and pushed images first with ./build-images.sh"
read -p "Have you built and pushed all Docker images? (y/n): " IMAGES_READY

if [[ $IMAGES_READY =~ ^[Yy]$ ]]; then
    kubectl apply -f 13-db-migration.yaml
    kubectl wait --for=condition=complete job/db-migration -n forkcast --timeout=300s
else
    echo "⚠️  Skipping migrations - please build images first, then run:"
    echo "   kubectl apply -f 13-db-migration.yaml"
    echo "   kubectl wait --for=condition=complete job/db-migration -n forkcast --timeout=300s"
fi

echo "Deploying backend services..."
kubectl apply -f 05-menu-service.yaml
kubectl apply -f 06-order-service.yaml
kubectl apply -f 07-search-service.yaml
kubectl apply -f 08-notification-service.yaml
kubectl apply -f 09-upload-service.yaml

echo "Waiting for backend services to be ready..."
kubectl wait --for=condition=ready pod -l app=menu-service -n forkcast --timeout=300s
kubectl wait --for=condition=ready pod -l app=order-service -n forkcast --timeout=300s
kubectl wait --for=condition=ready pod -l app=search-service -n forkcast --timeout=300s
kubectl wait --for=condition=ready pod -l app=notification-service -n forkcast --timeout=300s
kubectl wait --for=condition=ready pod -l app=upload-service -n forkcast --timeout=300s

echo "Deploying API Gateway..."
kubectl apply -f 10-api-gateway.yaml
kubectl wait --for=condition=ready pod -l app=api-gateway -n forkcast --timeout=300s

echo "Setting up ingress and external access..."
kubectl apply -f 12-ingress.yaml

echo ""
echo "⚠️  Skipping frontend deployment (11-frontend.yaml) - frontend runs in separate VM"
echo ""
echo "Deployment complete! 🎉"
echo ""
echo "To check the status of your deployment:"
echo "  kubectl get all -n forkcast"
echo ""
echo "To view logs for a specific service:"
echo "  kubectl logs -f deployment/api-gateway -n forkcast"
echo "  kubectl logs -f deployment/menu-service -n forkcast"
echo ""
echo "Backend API access:"
echo "  API Gateway (NodePort): http://<master-node-ip>:30001"
echo ""
echo "Configure your frontend VM to connect to:"
echo "  API_URL=http://<master-node-ip>:30001"
echo ""
echo "If you have Ingress controller installed:"
echo "  Add 'api.forkcast.local' to your /etc/hosts pointing to your master node IP"
echo "  Then frontend can access: http://api.forkcast.local"
echo ""
echo "To get your master node IP:"
echo "  kubectl get nodes -o wide"
