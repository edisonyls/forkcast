# Forkcast Backend

Node.js microservices for Forkcast, with an API gateway, PostgreSQL, Redis,
Prisma, and image uploads.

This guide covers local development with `docker-compose.yml`.

## Architecture

The frontend should send requests through the API gateway. Service names and
container ports are used inside the Docker network; host ports are available
for local access and debugging.

| Component            | Container port | Host port | Purpose                                              |
| -------------------- | -------------: | --------: | ---------------------------------------------------- |
| API gateway          |           3000 |     13000 | Frontend entry point and request routing             |
| Menu service         |           3002 |     13002 | Chefs, authentication, menus, categories, and events |
| Order service        |           3003 |     13003 | Order service shell and health check                 |
| Search service       |           3004 |     13004 | Search service shell and health check                |
| Notification service |           3005 |     13005 | Notification service shell and health check          |
| Upload service       |           3006 |     13006 | Image uploads and static files                       |
| PostgreSQL           |           5432 |     15432 | Application database                                 |
| Redis                |           6379 |     16379 | Cache                                                |

Order, search, and notification route handlers are not implemented yet. Their
containers currently provide health checks only.

## Local Docker setup

### Prerequisites

- Docker Desktop with Docker Compose
- Node.js 20 or later
- npm

### 1. Install dependencies

From the `services` directory:

```bash
npm install
```

The Compose file contains the development configuration for PostgreSQL, Redis,
JWT authentication, and service discovery. No `.env` files are required.

#### Optional local environment overrides

Contributors who want to customize the local configuration can copy the
optional template:

```bash
cp .env.example .env
```

Edit `.env`, then run Compose from the `services` directory. Compose loads that
file automatically and substitutes the variables referenced by
`docker-compose.yml`:

```bash
docker compose up -d --build
```

To select a file explicitly, use:

```bash
docker compose --env-file .env up -d --build
```

From the repository root, include both paths:

```bash
docker compose --env-file services/.env \
  -f services/docker-compose.yml up -d --build
```

The real `.env` remains ignored by Git. Only `.env.example`, which contains no
real credentials, is committed. Environment files provide Compose values; they
are not copied into the Docker images.

### 2. Build and start the containers

```bash
mkdir -p uploads
docker compose up -d --build
docker compose ps
```

All services should report `Up` or `healthy`.

### 3. Apply database migrations

Run Prisma from the host against PostgreSQL's mapped port:

```bash
DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:15432/forkcast?schema=public' \
  npx prisma migrate deploy --schema shared/prisma/schema.prisma
```

This step is required for a new Docker volume. A healthy PostgreSQL container
only means that PostgreSQL accepts connections; it does not mean the
application tables have been created.

### 4. Verify the backend

```bash
curl --fail http://localhost:13000/health
curl --fail http://localhost:13000/api/chefs
```

The first request checks the gateway. The second checks the complete path from
the gateway through the menu service to PostgreSQL.

## Image storage

The upload service always reads and writes `/app/uploads` inside its container.
Compose binds that directory to `UPLOADS_PATH` on the Docker host. The setting
defaults to `services/uploads`, so you can use local storage without
creating a `.env` file. PostgreSQL stores the resulting `/uploads/...` URL, not
the image bytes or a base64 data URL. Uploaded files are runtime data and are
ignored by Git.

### Store images on the local machine

From the `services` directory, create the default storage directory and start
the stack:

```bash
mkdir -p uploads
docker compose up -d --build
```

Images are stored under `services/uploads`. Stopping or recreating the
containers does not remove them. Deleting that host directory does.

### Store images on an NFS mount

Mount the NFS export on the machine running Docker before starting Compose.
The exact mount command depends on the operating system and NFS server. For
macOS, use a mount point under your home directory because `/mnt` is on the
read-only system volume:

```bash
mkdir -p "$HOME/forkcast-uploads"
sudo mount -t nfs -o vers=4 nfs.example.com:/exports/forkcast \
  "$HOME/forkcast-uploads"
export UPLOADS_PATH="$HOME/forkcast-uploads"
```

On a Linux Docker host, `/mnt` is a conventional location:

```bash
sudo mkdir -p /mnt/forkcast-uploads
sudo mount -t nfs -o nfsvers=4 nfs.example.com:/exports/forkcast \
  /mnt/forkcast-uploads
export UPLOADS_PATH=/mnt/forkcast-uploads
```

Replace the example server and export path with the real values. Confirm that
the mount is present and writable, then start the stack:

```bash
docker compose up -d --build
docker compose exec upload-service sh -c 'test -w /app/uploads'
```

`UPLOADS_PATH` must be a host filesystem path, not an NFS URL. When using
Docker Desktop, make sure the mounted directory is shared with Docker. Keep
`UPLOADS_PATH` set whenever running `docker compose up`; otherwise Compose uses
the local `services/uploads` default. If the write check fails, fix the NFS
export, mount, or directory permissions before accepting uploads.

## Connect the frontend

Create `client/.env.local` with:

```env
API_GATEWAY_URL=http://127.0.0.1:13000
NEXT_PUBLIC_API_URL=http://localhost:13000
```

Then restart the frontend so Next.js reloads the environment variables:

```bash
cd ../client
npm install
npm run dev
```

Open the frontend at <http://localhost:3000>. The gateway permits this origin
in the local Compose configuration.

## API gateway routes

Base URL: `http://localhost:13000`

| Route               | Service                                             |
| ------------------- | --------------------------------------------------- |
| `/api/chef/*`       | Menu service chef authentication and profile routes |
| `/api/chefs/*`      | Menu service public chef routes                     |
| `/api/menu/*`       | Menu items, categories, and customizations          |
| `/api/categories/*` | Menu categories                                     |
| `/api/events/*`     | Events and event orders                             |
| `/api/upload/*`     | Image uploads                                       |
| `/uploads/*`        | Uploaded static files                               |

The gateway also reserves `/api/orders`, `/api/search`, and
`/api/notifications`, but the corresponding service handlers are still TODO.

## Common commands

Run these from the `services` directory.

```bash
# Show container status
docker compose ps

# Follow all logs
docker compose logs -f --tail=200

# Follow selected logs
docker compose logs -f api-gateway menu-service postgres

# Rebuild after source or dependency changes
docker compose up -d --build

# Stop containers while preserving data volumes
docker compose down
```

### Prisma commands

```bash
# Show migration status
DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:15432/forkcast?schema=public' \
  npx prisma migrate status --schema shared/prisma/schema.prisma

# Create a migration after changing schema.prisma
DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:15432/forkcast?schema=public' \
  npx prisma migrate dev --name describe_the_change \
  --schema shared/prisma/schema.prisma

# Open Prisma Studio
DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:15432/forkcast?schema=public' \
  npx prisma studio --schema shared/prisma/schema.prisma
```

Commit generated migration files under `shared/prisma/migrations/`. Use
`migrate deploy` to apply committed migrations and `migrate dev` only when
creating migrations during development.

## Project structure

```text
services/
├── api-gateway/          # Public API entry point
├── menu-service/         # Chefs, menus, categories, and events
├── order-service/        # Order service shell
├── search-service/       # Search service shell
├── notification-service/ # Notification service shell
├── upload-service/       # Image uploads
├── shared/               # Prisma schema and shared TypeScript code
└── docker-compose.yml    # Local development
```
