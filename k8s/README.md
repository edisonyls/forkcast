# Forkcast Kubernetes Deployment

This directory contains Kubernetes manifests and scripts to deploy the Forkcast application on your Kubernetes cluster.

## Prerequisites

- Kubernetes cluster with master and worker nodes
- Calico networking (already configured)
- `kubectl` configured to access your cluster
- Docker for building images
- Access to a Docker registry (Docker Hub, private registry, etc.)

## Architecture

The backend consists of:

- **API Gateway**: Routes requests to microservices
- **Backend Services**: Menu, Order, Search, Notification, Upload services
- **Database**: PostgreSQL with persistent storage
- **Cache**: Redis with persistent storage
- **File Storage**: Persistent volume for uploaded files

**Note**: The frontend runs in a separate VM and connects to the API Gateway via NodePort service.

## Quick Start

### 1. Prepare Your Cluster

Ensure your nodes have the required directories for persistent storage:

```bash
# On your worker node(s), create storage directories
sudo mkdir -p /mnt/data/postgres /mnt/data/redis /mnt/data/uploads
sudo chmod 755 /mnt/data/postgres /mnt/data/redis /mnt/data/uploads
```

### 2. Update Configuration

1. **Update node hostnames** in `02-persistent-volumes.yaml`:

   - Replace `worker-node` with your actual worker node hostname
   - Get hostname with: `kubectl get nodes`

2. **Update secrets** in `01-configmap-secrets.yaml`:

   ```bash
   # Generate base64 encoded secrets
   echo -n "your-strong-postgres-password" | base64
   echo -n "your-super-secret-jwt-key" | base64
   echo -n "your-smtp-password" | base64
   ```

3. **Update SMTP settings** in `01-configmap-secrets.yaml` for email notifications

### 3. Build and Push Docker Images

1. **Update registry configuration** in `build-images.sh`:

   ```bash
   REGISTRY="your-dockerhub-username"  # or your private registry
   ```

2. **Build images**:

   ```bash
   chmod +x k8s/build-images.sh
   ./k8s/build-images.sh
   ```

3. **Push images to your registry**:

   ```bash
   # Login to your registry
   docker login

   # Push images (uncomment the push commands in build-images.sh or run manually)
   docker push your-registry/forkcast/api-gateway:latest
   docker push your-registry/forkcast/menu-service:latest
   # ... etc for all services
   ```

4. **Update image references** in all service YAML files:
   - Replace `forkcast/` with `your-registry/forkcast/` in:
     - `05-menu-service.yaml`
     - `06-order-service.yaml`
     - `07-search-service.yaml`
     - `08-notification-service.yaml`
     - `09-upload-service.yaml`
     - `10-api-gateway.yaml`
     - `11-frontend.yaml`
     - `13-db-migration.yaml`

### 4. Deploy Application

First, validate your configuration:

```bash
chmod +x k8s/validate.sh
./k8s/validate.sh
```

Then deploy:

```bash
chmod +x k8s/deploy.sh
./k8s/deploy.sh
```

### 5. Access Your Backend Services

After deployment completes:

- **API Gateway**: `http://<master-node-ip>:30001`

Configure your frontend VM to connect to the API Gateway:

```bash
# In your frontend VM environment
API_URL=http://<master-node-ip>:30001
NEXT_PUBLIC_API_URL=http://<master-node-ip>:30001
```

Get your master node IP:

```bash
kubectl get nodes -o wide
```

## Configuration Files

| File                           | Description                              |
| ------------------------------ | ---------------------------------------- |
| `00-namespace.yaml`            | Creates the forkcast namespace           |
| `01-configmap-secrets.yaml`    | Configuration and secrets                |
| `02-persistent-volumes.yaml`   | Storage for database, cache, and uploads |
| `03-postgres.yaml`             | PostgreSQL database                      |
| `04-redis.yaml`                | Redis cache                              |
| `05-menu-service.yaml`         | Menu microservice                        |
| `06-order-service.yaml`        | Order microservice                       |
| `07-search-service.yaml`       | Search microservice                      |
| `08-notification-service.yaml` | Notification microservice                |
| `09-upload-service.yaml`       | Upload microservice                      |
| `10-api-gateway.yaml`          | API Gateway                              |
| `11-frontend.yaml`             | Next.js frontend                         |
| `12-ingress.yaml`              | Ingress and NodePort services            |
| `13-db-migration.yaml`         | Database migration job                   |

## Monitoring and Troubleshooting

### Check Deployment Status

```bash
kubectl get all -n forkcast
```

### View Logs

```bash
# Frontend logs
kubectl logs -f deployment/frontend -n forkcast

# API Gateway logs
kubectl logs -f deployment/api-gateway -n forkcast

# Database logs
kubectl logs -f deployment/postgres -n forkcast

# All pods in namespace
kubectl logs -f --all-containers -n forkcast
```

### Check Service Health

```bash
# Get service endpoints
kubectl get endpoints -n forkcast

# Check pod status
kubectl get pods -n forkcast -o wide

# Describe problematic pods
kubectl describe pod <pod-name> -n forkcast
```

### Database Access

```bash
# Connect to PostgreSQL
kubectl exec -it deployment/postgres -n forkcast -- psql -U postgres -d forkcast

# Check database tables
kubectl exec -it deployment/postgres -n forkcast -- psql -U postgres -d forkcast -c "\\dt"
```

### Redis Access

```bash
# Connect to Redis
kubectl exec -it deployment/redis -n forkcast -- redis-cli

# Check Redis keys
kubectl exec -it deployment/redis -n forkcast -- redis-cli keys "*"
```

## Scaling

Scale individual services:

```bash
# Scale frontend
kubectl scale deployment frontend --replicas=3 -n forkcast

# Scale API gateway
kubectl scale deployment api-gateway --replicas=3 -n forkcast

# Scale backend services
kubectl scale deployment menu-service --replicas=3 -n forkcast
```

## Cleanup

To remove the entire application:

```bash
chmod +x k8s/cleanup.sh
./k8s/cleanup.sh
```

**Note**: This preserves persistent data. To completely remove data:

```bash
# On worker nodes
sudo rm -rf /mnt/data/postgres /mnt/data/redis /mnt/data/uploads
```

## Production Considerations

### Security

1. **Change default passwords** in secrets
2. **Use proper TLS certificates** for production domains
3. **Implement network policies** to restrict pod-to-pod communication
4. **Use secret management tools** like Kubernetes secrets or external secret managers

### Performance

1. **Resource limits**: Adjust CPU/memory limits based on your node capacity
2. **Horizontal Pod Autoscaling**: Implement HPA for automatic scaling
3. **Database optimization**: Consider PostgreSQL configuration tuning
4. **CDN**: Use a CDN for static assets in production

### Storage

1. **Backup strategy**: Implement regular database and file backups
2. **Storage classes**: Use appropriate storage classes for your environment
3. **Data persistence**: Ensure PersistentVolumes have proper backup and recovery

### Monitoring

1. **Implement monitoring** with Prometheus/Grafana
2. **Set up alerting** for critical services
3. **Log aggregation** with ELK stack or similar

## Troubleshooting Common Issues

### Pods Stuck in Pending

- Check node resources: `kubectl describe nodes`
- Check PVC status: `kubectl get pvc -n forkcast`
- Verify storage directories exist on worker nodes

### Database Connection Issues

- Verify PostgreSQL is running: `kubectl get pods -n forkcast | grep postgres`
- Check database logs: `kubectl logs deployment/postgres -n forkcast`
- Verify connection string in services

### Image Pull Errors

- Ensure images are pushed to your registry
- Check image names in YAML files match your registry
- Verify registry credentials if using private registry

### Service Not Accessible

- Check service status: `kubectl get svc -n forkcast`
- Verify NodePort services: `kubectl get svc -n forkcast | grep NodePort`
- Check firewall rules on master/worker nodes
