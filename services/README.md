# Forkcast Microservices Backend

A comprehensive Node.js microservices architecture for the Forkcast food delivery platform. This backend supports chef discovery, menu management, order processing, search functionality, and notifications.

## 🏗️ Architecture Overview

The Forkcast backend consists of 6 microservices:

1. **API Gateway** (Port 3000) - Central entry point and request routing
2. **User Service** (Port 3001) - Authentication and user management
3. **Menu Service** (Port 3002) - Chefs, menu items, and categories
4. **Order Service** (Port 3003) - Order processing and management
5. **Search Service** (Port 3004) - Search functionality for chefs and menu items
6. **Notification Service** (Port 3005) - Email notifications and messaging

### Supporting Infrastructure

- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **Prisma** - Database ORM and migrations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Option 1: Docker Setup (Recommended)

1. **Clone and setup:**

```bash
cd services
cp .env.example .env  # Configure environment variables
```

2. **Start all services:**

```bash
npm run docker:up
```

3. **Setup database:**

```bash
# Run database migrations
docker exec -it forkcast-user-service npx prisma migrate dev
```

4. **Check health:**

- API Gateway: http://localhost:3000/health
- All services: http://localhost:300X/health (where X is service port)

### Option 2: Local Development

1. **Install dependencies:**

```bash
npm run install:all
```

2. **Setup environment:**

```bash
# Copy and configure environment variables
cp .env.example .env
```

3. **Start database and Redis:**

```bash
docker-compose up postgres redis -d
```

4. **Setup database:**

```bash
cd shared && npx prisma migrate dev && cd ..
```

5. **Start all services:**

```bash
npm run dev
```

## 📋 API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /verify` - Token verification

### Users (`/api/users`)

- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /chef/register` - Register as chef
- `GET /` - Get all users (admin)
- `PATCH /:userId/activate` - Activate user (admin)
- `PATCH /:userId/deactivate` - Deactivate user (admin)

### Chefs (`/api/chefs`)

- `GET /` - Get all chefs (with pagination)
- `GET /:chefId` - Get chef details
- `PUT /:chefId` - Update chef profile (chef only)
- `GET /:chefId/menu` - Get chef's menu items

### Menu (`/api/menu`)

- `GET /` - Get all menu items
- `GET /:itemId` - Get menu item details
- `POST /` - Create menu item (chef only)
- `PUT /:itemId` - Update menu item (chef only)
- `DELETE /:itemId` - Delete menu item (chef only)

### Categories (`/api/categories`)

- `GET /` - Get all categories
- `POST /` - Create category (admin only)

### Orders (`/api/orders`)

- `GET /` - Get user orders
- `POST /` - Create new order
- `GET /:orderId` - Get order details
- `PATCH /:orderId/status` - Update order status (chef/admin)

### Search (`/api/search`)

- `GET /chefs` - Search chefs
- `GET /menu` - Search menu items

## 🔧 Environment Variables

Create a `.env` file in the services directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/forkcast"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Service URLs (for API Gateway)
USER_SERVICE_URL="http://localhost:3001"
MENU_SERVICE_URL="http://localhost:3002"
ORDER_SERVICE_URL="http://localhost:3003"
SEARCH_SERVICE_URL="http://localhost:3004"
NOTIFICATION_SERVICE_URL="http://localhost:3005"

# Frontend
FRONTEND_URL="http://localhost:3000"

# Email (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User** - User accounts with roles (CUSTOMER, CHEF, ADMIN)
- **Chef** - Chef profiles linked to users
- **Category** - Menu item categories
- **MenuItem** - Individual menu items with customization options
- **Order** - Customer orders with status tracking
- **OrderItem** - Items within orders
- **CustomizationOption** - Menu item customization options

### Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## 🛠️ Development

### Project Structure

```
services/
├── shared/                 # Shared utilities and types
│   ├── src/
│   │   ├── auth/          # JWT and password utilities
│   │   ├── database/      # Prisma client configuration
│   │   ├── middleware/    # Express middleware
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   └── validation/    # Zod schemas
│   └── prisma/            # Database schema
├── api-gateway/           # API Gateway service
├── user-service/          # User management service
├── menu-service/          # Menu and chef service
├── order-service/         # Order processing service
├── search-service/        # Search functionality service
├── notification-service/  # Notification service
└── docker-compose.yml     # Docker configuration
```

### Available Scripts

```bash
# Development
npm run dev                 # Start all services in development
npm run dev:gateway        # Start only API Gateway
npm run dev:user           # Start only User Service

# Building
npm run build:all          # Build all services
npm run install:all        # Install dependencies for all services

# Docker
npm run docker:build       # Build all Docker images
npm run docker:up          # Start all services with Docker
npm run docker:down        # Stop all Docker services
npm run docker:logs        # View logs from all services
```

### Adding New Services

1. Create new service directory under `services/`
2. Add package.json with dependencies
3. Create TypeScript configuration
4. Import shared utilities from `@forkcast/shared`
5. Add service to docker-compose.yml
6. Update API Gateway routing
7. Add service scripts to root package.json

## 🔐 Authentication

The system uses JWT-based authentication:

1. Users register/login through User Service
2. JWT tokens are issued with user ID, email, and role
3. All protected routes validate JWT tokens
4. Role-based access control for admin and chef features

### Authentication Flow

```
Client → API Gateway → User Service → JWT Token → Protected Routes
```

## 📊 Monitoring & Health Checks

Each service provides a health check endpoint:

- API Gateway: `GET /health`
- All services: `GET /health`

Health checks include:

- Service status
- Database connectivity
- Redis connectivity
- Timestamp information

## 🐳 Docker Support

The entire architecture is containerized with Docker:

- Each service has its own Dockerfile
- Docker Compose orchestrates all services
- Automatic service dependencies and health checks
- Persistent volumes for database and Redis data
- Network isolation and service discovery

## 🚨 Error Handling

Standardized error responses across all services:

```json
{
  "success": false,
  "error": "Error message",
  "errors": {
    "field": ["Validation error messages"]
  }
}
```

## 🔄 Data Validation

All input validation uses Zod schemas defined in the shared package:

- Request body validation
- Query parameter validation
- Type-safe validation with TypeScript
- Consistent error messages

## 📈 Scaling Considerations

This architecture supports horizontal scaling:

- Stateless services can be replicated
- Database can be scaled with read replicas
- Redis can be clustered for high availability
- API Gateway can use load balancing
- Services can be deployed independently

## 🤝 Contributing

1. Follow TypeScript and ESLint configurations
2. Add tests for new features
3. Update documentation for API changes
4. Use conventional commit messages
5. Ensure Docker compatibility

## 📝 License

This project is licensed under the MIT License.
