# Forkcast Microservices Setup Guide

Follow these steps to get your Forkcast backend services running:

## 🔧 Step 1: Create Environment Files

### 1. Create `services/.env`

```bash
cd services
touch .env
```

Add this content to `services/.env`:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/forkcast"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Service URLs (for API Gateway)
USER_SERVICE_URL="http://localhost:3001"
MENU_SERVICE_URL="http://localhost:3002"
ORDER_SERVICE_URL="http://localhost:3003"
SEARCH_SERVICE_URL="http://localhost:3004"
NOTIFICATION_SERVICE_URL="http://localhost:3005"

# Frontend Configuration
FRONTEND_URL="http://localhost:3000"

# Email Configuration (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Development/Production Environment
NODE_ENV="development"
```

### 2. Create `services/shared/.env`

```bash
cd shared
touch .env
```

Add this content to `services/shared/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/forkcast"
REDIS_URL="redis://localhost:6379"
```

## 🐳 Step 2: Start Database and Redis

```bash
# From the services directory
cd services
docker-compose up postgres redis -d
```

Wait for the containers to be healthy (about 30 seconds).

## 🗄️ Step 3: Setup Database Schema

```bash
# From the services/shared directory
cd services/shared

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to view database
npx prisma studio
```

## 📦 Step 4: Install Dependencies

```bash
# From the services directory
cd services
npm run install:all
```

## 🚀 Step 5: Start Services

### Option A: Start All Services (Development)

```bash
# From the services directory
npm run dev
```

### Option B: Start Services Individually

```bash
# Terminal 1 - API Gateway
cd services/api-gateway && npm run dev

# Terminal 2 - User Service
cd services/user-service && npm run dev

# Terminal 3 - Menu Service
cd services/menu-service && npm run dev

# Terminal 4 - Order Service
cd services/order-service && npm run dev

# Terminal 5 - Search Service
cd services/search-service && npm run dev

# Terminal 6 - Notification Service
cd services/notification-service && npm run dev
```

## ✅ Step 6: Verify Setup

Check health endpoints:

- API Gateway: http://localhost:3000/health
- User Service: http://localhost:3001/health
- Menu Service: http://localhost:3002/health
- Order Service: http://localhost:3003/health
- Search Service: http://localhost:3004/health
- Notification Service: http://localhost:3005/health

## 📝 Step 7: Seed Database (Optional)

Add some initial data to test the system:

```bash
# From the services/shared directory
npx prisma db seed
```

## 🔧 Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL container is running: `docker ps`
2. Check database logs: `docker logs forkcast-postgres`
3. Verify DATABASE_URL in .env files

### Port Conflicts

If ports are already in use, update these in your .env file:

- API Gateway: PORT=3000
- User Service: PORT=3001
- Menu Service: PORT=3002
- Order Service: PORT=3003
- Search Service: PORT=3004
- Notification Service: PORT=3005

### Module Not Found Errors

1. Run `npm run install:all` from services directory
2. Build shared package: `cd shared && npm run build`
3. Restart services

## 🎯 Next Steps

1. Connect your Next.js frontend to `http://localhost:3000/api/*`
2. Use the API endpoints documented in the main README
3. Start building your features!

## 📋 Quick Commands Reference

```bash
# Start database only
docker-compose up postgres redis -d

# Stop all containers
docker-compose down

# View all service logs
npm run docker:logs

# Reset database
cd shared && npx prisma migrate reset

# Generate new migration
cd shared && npx prisma migrate dev --name your-migration-name
```
