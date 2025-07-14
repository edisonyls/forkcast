#!/bin/bash

# Validation script to check Forkcast Kubernetes configuration
# Run this to validate your setup before deployment

set -e

echo "🔍 Forkcast Kubernetes Configuration Validator"
echo "=============================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to print error
print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((ERRORS++))
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "00-namespace.yaml" ]; then
    print_error "Please run this script from the k8s directory"
    exit 1
fi

echo "Checking Kubernetes configuration files..."
echo ""

# Check for required files
REQUIRED_FILES=(
    "00-namespace.yaml"
    "01-configmap-secrets.yaml"
    "02-persistent-volumes.yaml"
    "03-postgres.yaml"
    "04-redis.yaml"
    "05-menu-service.yaml"
    "06-order-service.yaml"
    "07-search-service.yaml"
    "08-notification-service.yaml"
    "09-upload-service.yaml"
    "10-api-gateway.yaml"
    "12-ingress.yaml"
    "13-db-migration.yaml"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "Found $file"
    else
        print_error "Missing required file: $file"
    fi
done

echo ""
echo "Checking configuration details..."
echo ""

# Check if secrets are still using default values
if grep -q "cG9zdGdyZXM=" 01-configmap-secrets.yaml; then
    print_warning "PostgreSQL password is still using default value 'postgres'"
fi

if grep -q "eW91ci1zdXBlci1zZWNyZXQtand0LWtleS1jaGFuZ2UtaW4tcHJvZHVjdGlvbg==" 01-configmap-secrets.yaml; then
    print_warning "JWT secret is still using default value"
fi

if grep -q "eW91ci1hcHAtcGFzc3dvcmQ=" 01-configmap-secrets.yaml; then
    print_warning "SMTP password is still using default value"
fi

# Check if frontend URL is configured
if grep -q "frontend-vm-ip" 01-configmap-secrets.yaml; then
    print_warning "Frontend URL still contains placeholder 'frontend-vm-ip'"
fi

# Check if worker node is configured in persistent volumes
if grep -q "worker-node" 02-persistent-volumes.yaml; then
    print_warning "Worker node hostname is still using placeholder 'worker-node'"
fi

# Check if image registry is configured
if grep -q "forkcast/" 05-menu-service.yaml; then
    print_warning "Docker images still using placeholder registry 'forkcast/'"
    print_warning "Update image references to use your actual registry"
fi

# Check SMTP configuration
if grep -q "your-email@gmail.com" 01-configmap-secrets.yaml; then
    print_warning "SMTP configuration still using placeholder email"
fi

echo ""
echo "Checking Kubernetes cluster connectivity..."

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed or not in PATH"
else
    print_success "kubectl is available"
    
    # Check cluster connectivity
    if kubectl cluster-info &> /dev/null; then
        print_success "Kubernetes cluster is accessible"
        
        # Check nodes
        NODE_COUNT=$(kubectl get nodes --no-headers | wc -l | tr -d ' ')
        if [ "$NODE_COUNT" -gt 0 ]; then
            print_success "Found $NODE_COUNT Kubernetes node(s)"
            
            # Check for worker nodes
            WORKER_COUNT=$(kubectl get nodes --no-headers | grep -v master | wc -l | tr -d ' ')
            if [ "$WORKER_COUNT" -gt 0 ]; then
                print_success "Found $WORKER_COUNT worker node(s)"
            else
                print_warning "No worker nodes found - this may be a single-node cluster"
            fi
        else
            print_error "No Kubernetes nodes found"
        fi
    else
        print_error "Cannot connect to Kubernetes cluster"
    fi
fi

echo ""
echo "Checking Docker..."

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not in PATH"
else
    print_success "Docker is available"
    
    # Check if Docker daemon is running
    if docker info &> /dev/null; then
        print_success "Docker daemon is running"
    else
        print_error "Docker daemon is not running"
    fi
fi

echo ""
echo "Summary:"
echo "========="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    print_success "Configuration validation passed! ✨"
    echo ""
    echo "You're ready to deploy. Run:"
    echo "  ./deploy.sh"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}Configuration has $WARNINGS warning(s) but should work${NC}"
    echo ""
    echo "Consider addressing the warnings above for production use."
    echo "You can proceed with deployment:"
    echo "  ./deploy.sh"
else
    echo -e "${RED}Configuration has $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo "Please fix the errors above before deploying."
    exit 1
fi

echo ""
echo "For detailed setup instructions, see README.md"
