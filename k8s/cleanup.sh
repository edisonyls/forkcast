#!/bin/bash

# Clean up Forkcast application from Kubernetes

set -e

echo "Cleaning up Forkcast application from Kubernetes..."

# Delete in reverse order
echo "Removing ingress and external access..."
kubectl delete -f 12-ingress.yaml --ignore-not-found=true

echo "Removing API Gateway..."
kubectl delete -f 10-api-gateway.yaml --ignore-not-found=true

echo "Removing backend services..."
kubectl delete -f 09-upload-service.yaml --ignore-not-found=true
kubectl delete -f 08-notification-service.yaml --ignore-not-found=true
kubectl delete -f 07-search-service.yaml --ignore-not-found=true
kubectl delete -f 06-order-service.yaml --ignore-not-found=true
kubectl delete -f 05-menu-service.yaml --ignore-not-found=true

echo "Removing migration jobs..."
kubectl delete -f 13-db-migration.yaml --ignore-not-found=true

echo "Removing database and cache..."
kubectl delete -f 04-redis.yaml --ignore-not-found=true
kubectl delete -f 03-postgres.yaml --ignore-not-found=true

echo "Removing persistent volumes..."
kubectl delete -f 02-persistent-volumes.yaml --ignore-not-found=true

echo "Removing configuration..."
kubectl delete -f 01-configmap-secrets.yaml --ignore-not-found=true

echo "Removing namespace..."
kubectl delete -f 00-namespace.yaml --ignore-not-found=true

echo ""
echo "Cleanup complete! 🧹"
echo ""
echo "Note: Persistent data might still exist on your nodes at:"
echo "  /mnt/data/postgres"
echo "  /mnt/data/redis"
echo "  /mnt/data/uploads"
echo ""
echo "To completely remove data, run on your worker nodes:"
echo "  sudo rm -rf /mnt/data/postgres /mnt/data/redis /mnt/data/uploads"
