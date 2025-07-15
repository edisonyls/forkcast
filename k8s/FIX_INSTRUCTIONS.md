# Fix Instructions for Kubernetes Deployment

## Problem
Your Docker images were built for ARM64 architecture, but your Kubernetes nodes are AMD64.

## Solution Steps

### 1. Fix Docker Permissions
Run ONE of these options:

**Option A: Add user to docker group (recommended)**
```bash
sudo usermod -aG docker $USER
# Then logout and login again, or run:
newgrp docker
```

**Option B: Use sudo for docker commands**
```bash
# You'll need to prefix all docker commands with sudo
```

### 2. Rebuild Images for AMD64

After fixing Docker permissions, run:
```bash
cd /home/edisonyls/forkcast/k8s
./build-images-amd64.sh
```

This will rebuild all services for AMD64 architecture and push to Docker Hub.

### 3. Redeploy Services

After images are built and pushed:
```bash
# Restart all deployments to pull new images
kubectl rollout restart deployment -n forkcast

# Or restart specific services
kubectl rollout restart deployment/order-service -n forkcast
kubectl rollout restart deployment/search-service -n forkcast
kubectl rollout restart deployment/notification-service -n forkcast
kubectl rollout restart deployment/upload-service -n forkcast
kubectl rollout restart deployment/api-gateway -n forkcast
```

### 4. Deploy Missing Services

The API Gateway hasn't been deployed yet:
```bash
kubectl apply -f 10-api-gateway.yaml
```

### 5. Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n forkcast

# Check logs if any issues
kubectl logs -n forkcast deployment/order-service
```

## Alternative: Build Without Push

If you can't push to Docker Hub, you can build locally and use a local registry:
1. Set up a local Docker registry in your cluster
2. Build images without the --push flag
3. Tag and push to local registry
4. Update YAML files to use local registry

## Current Status
- ✅ PostgreSQL and Redis are running fine
- ✅ Menu service is running (probably was built for AMD64)
- ❌ Order, Search, Notification, Upload services need AMD64 images
- ❌ API Gateway not deployed yet