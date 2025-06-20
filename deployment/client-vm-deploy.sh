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

# Detect deployment mode
DEPLOYMENT_MODE="production"
USE_SYSTEMD=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --local|--dev|--development)
            DEPLOYMENT_MODE="development"
            echo "🔧 Running in LOCAL DEVELOPMENT mode"
            shift
            ;;
        --systemd|--nginx)
            USE_SYSTEMD=true
            echo "🔧 Using systemd service (for nginx setup)"
            shift
            ;;
        *)
            echo "Unknown option $1"
            echo "Usage: $0 [--local|--dev|--development] [--systemd|--nginx]"
            exit 1
            ;;
    esac
done

# Auto-detect if no explicit flag provided
if [[ "$DEPLOYMENT_MODE" == "production" ]] && [[ "$USE_SYSTEMD" == "false" ]]; then
    if [[ -f "/proc/version" ]] && grep -q "Microsoft" /proc/version 2>/dev/null; then
        # Running in WSL, likely local development
        DEPLOYMENT_MODE="development"
        echo "🔧 Detected WSL environment - Running in LOCAL DEVELOPMENT mode"
    elif [[ "$USER" == "$(whoami)" ]] && [[ -d "/Users" ]] && [[ "$(uname)" == "Darwin" ]]; then
        # Running on macOS, likely local development
        DEPLOYMENT_MODE="development"
        echo "🔧 Detected macOS environment - Running in LOCAL DEVELOPMENT mode"
    else
        echo "🚀 Running in PRODUCTION VM mode"
    fi
fi

# Check if .env.local exists and extract SERVICES_VM_IP from it
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found."
    echo "📝 Please create .env.local from env.production.example and set your Services VM IP"
    echo "💡 Run: cp env.production.example .env.local"
    if [[ "$DEPLOYMENT_MODE" == "development" ]]; then
        echo "💡 For local development, you can use: NEXT_PUBLIC_API_URL=http://localhost:3000"
    else
        echo "💡 For production, replace localhost with your Services VM IP"
    fi
    exit 1
fi

# Extract SERVICES_VM_IP from .env.local
SERVICES_VM_IP=$(grep "NEXT_PUBLIC_API_URL" .env.local | sed 's/.*http:\/\/\([^:]*\):.*/\1/')

# Validate SERVICES_VM_IP based on deployment mode
if [ -z "$SERVICES_VM_IP" ]; then
    echo "❌ Could not extract Services VM IP from .env.local"
    echo "📝 Please ensure .env.local has a line like: NEXT_PUBLIC_API_URL=http://YOUR_SERVICES_VM_IP:3000"
    exit 1
fi

if [[ "$DEPLOYMENT_MODE" == "production" ]]; then
    # Production mode: reject localhost
    if [ "$SERVICES_VM_IP" = "localhost" ] || [ "$SERVICES_VM_IP" = "127.0.0.1" ]; then
        echo "❌ Services VM IP is still set to localhost in .env.local"
        echo "📝 For PRODUCTION deployment, please edit .env.local and replace localhost with your actual Services VM IP address"
        echo "💡 Example: NEXT_PUBLIC_API_URL=http://192.168.1.100:3000"
        echo "💡 Or run with --local flag for development: $0 --local"
        exit 1
    fi
    echo "✅ Using Services VM IP: $SERVICES_VM_IP (PRODUCTION mode)"
else
    # Development mode: allow localhost
    if [ "$SERVICES_VM_IP" = "localhost" ] || [ "$SERVICES_VM_IP" = "127.0.0.1" ]; then
        echo "✅ Using localhost for DEVELOPMENT mode: $SERVICES_VM_IP"
    else
        echo "✅ Using Services VM IP: $SERVICES_VM_IP (DEVELOPMENT mode - connecting to remote services)"
    fi
fi

# Use production configuration
echo "🔧 Using production configuration..."
if [ -f "next.config.prod.ts" ]; then
    cp next.config.prod.ts next.config.ts
    echo "✅ Production Next.js configuration applied"
else
    echo "❌ Production configuration file not found"
    exit 1
fi

# The .env.local file is already configured, so we can skip the environment setup step
echo "✅ Environment already configured in .env.local"

# Install dependencies
echo "📦 Installing dependencies..."
if [[ "$DEPLOYMENT_MODE" == "development" ]]; then
    # Development: install all dependencies (including devDependencies needed for build)
    npm ci
else
    # Production: also need all dependencies for build process
    # We can't use --production here because build requires devDependencies
    npm ci
fi

# Build the application
echo "🔨 Building the application..."
npm run build

# Optional: Remove devDependencies after build in production (saves disk space)
if [[ "$DEPLOYMENT_MODE" == "production" ]] && [[ "$USE_SYSTEMD" == "true" ]]; then
    echo "🧹 Removing devDependencies (build complete, no longer needed)..."
    npm prune --production
fi

# Stop any existing Next.js processes
echo "🛑 Stopping existing processes..."
if [[ "$DEPLOYMENT_MODE" == "development" ]]; then
    # In development, be more specific about stopping Next.js processes
    pkill -f "next start" || true
    pkill -f "next dev" || true
else
    # In production, stop all Next.js processes
    pkill -f "next" || true
fi

# Function to find next available port starting from a given port
find_available_port() {
    local start_port=$1
    local port=$start_port
    local max_attempts=10  # Check up to 10 ports (3000-3009)
    
    while [ $((port - start_port)) -lt $max_attempts ]; do
        if ! lsof -ti :$port > /dev/null 2>&1; then
            echo $port
            return 0
        fi
        ((port++))
    done
    
    # If no port found, return the start port anyway and let it fail gracefully
    echo $start_port
    return 1
}

# Check for available port starting from 3000
echo "🔍 Checking for available ports..."
FRONTEND_PORT=$(find_available_port 3000)

if lsof -ti :$FRONTEND_PORT > /dev/null 2>&1; then
    echo "⚠️  All ports from 3000-3009 are in use. Will attempt to use port $FRONTEND_PORT anyway."
    echo "🛑 Stopping existing process on port $FRONTEND_PORT..."
    kill -9 $(lsof -ti :$FRONTEND_PORT) 2>/dev/null || true
    sleep 2
    
    # Double check if port is now free
    if lsof -ti :$FRONTEND_PORT > /dev/null 2>&1; then
        echo "❌ Failed to free up port $FRONTEND_PORT. Please manually stop the process using this port."
        exit 1
    fi
else
    if [[ "$FRONTEND_PORT" != "3000" ]]; then
        echo "⚠️  Port 3000 is in use, using port $FRONTEND_PORT for frontend"
    else
        echo "✅ Using port $FRONTEND_PORT for frontend"
    fi
fi

# Start the application
echo "🚀 Starting the application..."
if [[ "$USE_SYSTEMD" == "true" ]]; then
    echo "🔧 Skipping application start - will be managed by systemd service"
    echo "📝 To start the service, run: sudo systemctl start forkcast-frontend"
    echo "📝 To enable auto-start on boot: sudo systemctl enable forkcast-frontend"
elif [[ "$DEPLOYMENT_MODE" == "development" ]]; then
    # Development: use the determined port
    nohup npm start -- -p $FRONTEND_PORT > app.log 2>&1 &
else
    # Production: use the dynamically determined port
    nohup npm start -- -p $FRONTEND_PORT > app.log 2>&1 &
fi

# Wait for the application to start (skip for systemd)
if [[ "$USE_SYSTEMD" != "true" ]]; then
    echo "⏳ Waiting for application to start..."
    sleep 10

    # Check if the application is running
    if curl -f http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
        echo "✅ Client VM deployment completed successfully!"
        if [[ "$DEPLOYMENT_MODE" == "development" ]]; then
            echo "🌐 Frontend available at: http://localhost:$FRONTEND_PORT"
            if [[ "$FRONTEND_PORT" != "3000" ]]; then
                echo "🔗 Backend services running at: http://localhost:3000"
            fi
        else
            echo "🌐 Frontend available at: http://$(hostname -I | awk '{print $1}'):$FRONTEND_PORT"
            echo "🔗 Connected to Services VM at: $SERVICES_VM_IP"
        fi
        echo "📝 View logs with: tail -f app.log"
    else
        echo "❌ Application failed to start. Check logs:"
        tail -n 20 app.log
        exit 1
    fi
else
    echo "✅ Application build completed successfully!"
    echo "🔧 Next steps for systemd + nginx setup:"
    echo "   1. Create systemd service: sudo systemctl enable forkcast-frontend"
    echo "   2. Start service: sudo systemctl start forkcast-frontend"
    echo "   3. Configure nginx reverse proxy"
    echo "   4. Setup SSL with Let's Encrypt"
fi 