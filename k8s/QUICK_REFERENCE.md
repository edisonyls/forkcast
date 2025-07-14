# Forkcast Kubernetes Backend Quick Reference

**Note**: This setup deploys only the backend services. Frontend runs in a separate VM.

## 🚀 Initial Setup
```bash
cd k8s/
./setup.sh
```

## 🔍 Validate Configuration
```bash
./validate.sh
```

## 🏗️ Manual Steps

### 1. Build Images
```bash
./build-images.sh
docker login
docker push your-registry/forkcast/*:latest
```

### 2. Deploy
```bash
./deploy.sh
```

### 3. Access Backend Services
- **API Gateway**: `http://<master-ip>:30001`

### 4. Configure Frontend VM
In your frontend VM, set environment variables:
```bash
API_URL=http://<master-ip>:30001
NEXT_PUBLIC_API_URL=http://<master-ip>:30001
```

## 📊 Monitoring Commands

### Check Status
```bash
kubectl get all -n forkcast
kubectl get pods -n forkcast -o wide
```

### View Logs
```bash
kubectl logs -f deployment/api-gateway -n forkcast
kubectl logs -f deployment/postgres -n forkcast
```

### Debug Pod Issues
```bash
kubectl describe pod <pod-name> -n forkcast
kubectl get events -n forkcast --sort-by='.lastTimestamp'
```

## 🔧 Common Operations

### Scale Services
```bash
kubectl scale deployment api-gateway --replicas=3 -n forkcast
```

### Update Images
```bash
kubectl set image deployment/api-gateway api-gateway=your-registry/forkcast/api-gateway:new-tag -n forkcast
```

### Restart Services
```bash
kubectl rollout restart deployment/api-gateway -n forkcast
```

### Database Operations
```bash
# Connect to PostgreSQL
kubectl exec -it deployment/postgres -n forkcast -- psql -U postgres -d forkcast

# Run migrations manually
kubectl exec -it deployment/menu-service -n forkcast -- sh -c "cd /app/shared && npx prisma migrate deploy"

# Seed database
kubectl exec -it deployment/menu-service -n forkcast -- sh -c "cd /app/shared && npx prisma db seed"
```

## 🧹 Cleanup
```bash
./cleanup.sh

# Remove persistent data (BE CAREFUL!)
# On worker nodes:
sudo rm -rf /mnt/data/postgres /mnt/data/redis /mnt/data/uploads
```

## 🚨 Troubleshooting

### Pods Stuck in Pending
```bash
kubectl describe nodes
kubectl get pvc -n forkcast
kubectl describe pvc postgres-pvc -n forkcast
```

### Image Pull Errors
- Check image names in YAML files
- Verify images exist in registry
- Check registry credentials

### Service Not Responding
```bash
kubectl get svc -n forkcast
kubectl get endpoints -n forkcast
kubectl port-forward svc/frontend 8080:3000 -n forkcast
```

### Database Issues
```bash
kubectl logs deployment/postgres -n forkcast
kubectl exec -it deployment/postgres -n forkcast -- pg_isready -U postgres
```

## 🔐 Security Notes

- Change default passwords in `01-configmap-secrets.yaml`
- Use proper TLS certificates for production
- Implement network policies
- Regular backup of persistent data

## 📝 File Structure
```
k8s/
├── 00-namespace.yaml          # Namespace
├── 01-configmap-secrets.yaml  # Config & secrets
├── 02-persistent-volumes.yaml # Storage
├── 03-postgres.yaml          # Database
├── 04-redis.yaml             # Cache
├── 05-menu-service.yaml      # Menu service
├── 06-order-service.yaml     # Order service
├── 07-search-service.yaml    # Search service
├── 08-notification-service.yaml # Notification service
├── 09-upload-service.yaml    # Upload service
├── 10-api-gateway.yaml       # API Gateway
├── 12-ingress.yaml           # External access
├── 13-db-migration.yaml      # DB setup
├── build-images.sh           # Build script (backend only)
├── deploy.sh                 # Deploy script
├── cleanup.sh                # Cleanup script
├── setup.sh                  # Complete setup
└── README.md                 # Full documentation
```
