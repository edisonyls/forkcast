#!/bin/bash

# Quick fix: Use official Node.js image as a temporary solution
# This will help test if the architecture is the issue

echo "🔧 Quick Fix: Using official Node.js images temporarily"
echo "======================================================"
echo ""
echo "This script will update deployments to use the official Node.js image"
echo "to verify that the architecture mismatch is the issue."
echo ""

# Update deployments to use official node image temporarily
kubectl set image deployment/order-service order-service=node:18-alpine -n forkcast
kubectl set image deployment/search-service search-service=node:18-alpine -n forkcast
kubectl set image deployment/notification-service notification-service=node:18-alpine -n forkcast
kubectl set image deployment/upload-service upload-service=node:18-alpine -n forkcast

echo ""
echo "✅ Deployments updated with official Node.js image"
echo ""
echo "Checking rollout status..."
kubectl rollout status deployment/order-service -n forkcast --timeout=60s || true
kubectl rollout status deployment/search-service -n forkcast --timeout=60s || true
kubectl rollout status deployment/notification-service -n forkcast --timeout=60s || true
kubectl rollout status deployment/upload-service -n forkcast --timeout=60s || true

echo ""
echo "Current pod status:"
kubectl get pods -n forkcast | grep -E "(order|search|notification|upload)"
echo ""
echo "⚠️  Note: Services won't work properly with generic Node image,"
echo "    but this confirms if architecture was the issue."
echo ""
echo "To properly fix, you need to:"
echo "1. Add yourself to docker group: sudo usermod -aG docker $USER"
echo "2. Log out and back in"
echo "3. Run: ./build-images-amd64.sh"
echo "4. Then run: ./deploy.sh to redeploy with correct images"