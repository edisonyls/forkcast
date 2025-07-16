#!/bin/bash

# Health check script for Forkcast services
# Usage: ./test-health.sh <MASTER_NODE_IP>

if [ -z "$1" ]; then
    echo "Usage: $0 <MASTER_NODE_IP>"
    echo "Example: $0 192.168.1.100"
    exit 1
fi

MASTER_IP=$1

echo "Testing Forkcast service health endpoints..."
echo "Master Node IP: $MASTER_IP"
echo "========================================"

# API Gateway (through NodePort)
echo -n "API Gateway (NodePort :30001): "
if curl -s -f http://$MASTER_IP:30001/health >/dev/null 2>&1; then
    echo "✅ HEALTHY"
else
    echo "❌ UNHEALTHY"
fi

# If port forwarding is set up, test individual services
echo ""
echo "Individual services (requires port forwarding):"
echo "-----------------------------------------------"

services=("menu-service:3002" "order-service:3003" "search-service:3004" "notification-service:3005" "upload-service:3006")

for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    echo -n "$name (port $port): "
    if curl -s -f http://$MASTER_IP:$port/health >/dev/null 2>&1; then
        echo "✅ HEALTHY"
    else
        echo "❌ UNHEALTHY (may need port forwarding)"
    fi
done

echo ""
echo "To enable port forwarding, run on master node:"
echo "kubectl port-forward svc/menu-service 3002:3002 -n forkcast --address=0.0.0.0 &"
echo "kubectl port-forward svc/order-service 3003:3003 -n forkcast --address=0.0.0.0 &"
echo "kubectl port-forward svc/search-service 3004:3004 -n forkcast --address=0.0.0.0 &"
echo "kubectl port-forward svc/notification-service 3005:3005 -n forkcast --address=0.0.0.0 &"
echo "kubectl port-forward svc/upload-service 3006:3006 -n forkcast --address=0.0.0.0 &"
