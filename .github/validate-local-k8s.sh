#!/bin/bash

# Quick validation # Check if project exists
echo "3. Checking project directory..."
CURRENT_PATH=$(pwd)

if [[ "$CURRENT_PATH" == *"forkcast"* ]]; then
    echo "✅ You're in the forkcast project directory"
    if [[ "$CURRENT_PATH" == *"/forkcast/.github"* ]]; then
        echo "✅ Project should be at ~/forkcast (perfect for the workflow)"
    else
        echo "📝 Make sure the project is at ~/forkcast for the workflow to work"
    fi
else
    echo "⚠️  Make sure you're in the forkcast project directory"
    echo "📝 The workflow expects the project at ~/forkcast"
    echo "Current directory: $CURRENT_PATH"
fi
echo ""l Kubernetes deployment
# Run this to check if your setup is ready for the CI/CD pipeline

echo "🔍 Validating Local Kubernetes CI/CD Setup"
echo "=========================================="
echo ""

# Check if running on the VM (not local machine)
echo "1. Checking environment..."
if kubectl cluster-info &> /dev/null; then
    echo "✅ Kubernetes cluster accessible"
    kubectl get nodes
else
    echo "❌ Kubernetes cluster not accessible"
    echo "💡 Make sure you're running this on your VM with the cluster"
    exit 1
fi
echo ""

# Check if Docker is available
echo "2. Checking Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker is available"
    docker --version
else
    echo "❌ Docker not found"
    exit 1
fi
echo ""

# Check if project exists
echo "3. Checking project directory..."
PROJECT_PATH="/path/to/forkcast"
CURRENT_PATH=$(pwd)

if [[ "$CURRENT_PATH" == *"forkcast"* ]]; then
    echo "✅ You're in the forkcast project directory"
    echo "� Update the workflow file with this path: $CURRENT_PATH"
    echo "   Edit workflows/local-k8s-deploy.yml and replace '/path/to/forkcast' with '$CURRENT_PATH'"
else
    echo "⚠️  Make sure you're in the right directory"
    echo "📝 Update workflows/local-k8s-deploy.yml with your actual project path"
    echo "Current directory: $CURRENT_PATH"
fi
echo ""

# Check if we can build images
echo "4. Testing Docker image build..."
if [ -f "services/api-gateway/Dockerfile" ]; then
    echo "✅ Dockerfile found"
    echo "Testing Docker build (this may take a moment)..."
    if docker build -f services/api-gateway/Dockerfile -t test-build:latest services/ &> /dev/null; then
        echo "✅ Docker build successful"
        docker rmi test-build:latest &> /dev/null
    else
        echo "❌ Docker build failed"
        echo "💡 Check your Dockerfile and dependencies"
    fi
else
    echo "❌ Dockerfile not found - make sure you're in the project root"
fi
echo ""

# Check namespace
echo "5. Checking Kubernetes namespace..."
if kubectl get namespace forkcast &> /dev/null; then
    echo "✅ Namespace 'forkcast' exists"
else
    echo "⚠️  Namespace 'forkcast' not found - it will be created during deployment"
fi
echo ""

# Check existing deployments
echo "6. Checking current deployments..."
deployments=$(kubectl get deployments -n forkcast 2>/dev/null | grep -v NAME | wc -l)
if [ "$deployments" -gt 0 ]; then
    echo "✅ Found $deployments existing deployments in forkcast namespace"
    kubectl get deployments -n forkcast
else
    echo "ℹ️  No existing deployments found - fresh installation"
fi
echo ""

# Summary
echo "📋 Setup Summary:"
echo "================="
echo ""
echo "✅ Prerequisites check completed!"
echo ""
echo "🚀 Next steps:"
echo "1. Update the project path in local-k8s-deploy.yml if needed"
echo "2. Add GitHub secrets: VM_HOST, VM_USERNAME, SSH_PRIVATE_KEY"
echo "3. Make a change to services/ and push to trigger the pipeline"
echo ""
echo "📞 The pipeline will:"
echo "- SSH into this VM"
echo "- Pull latest code"
echo "- Build Docker images locally"
echo "- Update Kubernetes deployments"
echo "- Perform rolling updates of your pods"
echo ""
echo "🎯 Perfect for local Kubernetes clusters! No external registries needed."
