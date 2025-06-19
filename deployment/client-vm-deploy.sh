#!/bin/bash

# Deployment script for Client VM
# This script deploys the Next.js frontend application

set -e

echo "🚀 Starting Client VM Deployment..."

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v18+) first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to web-app directory
cd "$(dirname "$0")/../clients/web-app"

# Check if SERVICES_VM_IP is set
if [ -z "$SERVICES_VM_IP" ]; then
    echo "❌ SERVICES_VM_IP environment variable is not set."
    echo "📝 Please set it with: export SERVICES_VM_IP=<your_services_vm_ip>"
    exit 1
fi

# Validate SERVICES_VM_IP is not placeholder
if [[ "$SERVICES_VM_IP" == *"SERVICES_VM_IP"* ]]; then
    echo "❌ Please set SERVICES_VM_IP to the actual Services VM IP address"
    exit 1
fi

# Use production configuration
echo "🔧 Using production configuration..."
if [ -f "next.config.prod.ts" ]; then
    cp next.config.prod.ts next.config.ts
    echo "✅ Production configuration applied"
else
    echo "❌ Production configuration file not found"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build the application
echo "🔨 Building the application..."
npm run build

# Stop any existing Next.js processes
echo "🛑 Stopping existing processes..."
pkill -f "next" || true

# Start the application
echo "🚀 Starting the application..."
nohup npm start > app.log 2>&1 &

# Wait for the application to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check if the application is running
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Client VM deployment completed successfully!"
    echo "🌐 Frontend available at: http://$(hostname -I | awk '{print $1}'):3000"
    echo "🔗 Connected to Services VM at: $SERVICES_VM_IP"
    echo "📝 View logs with: tail -f app.log"
else
    echo "❌ Application failed to start. Check logs:"
    tail -n 20 app.log
    exit 1
fi 