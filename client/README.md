# ForkCast client

The ForkCast web client is a Next.js App Router application.

## Requirements

- Node.js 22 or newer
- A running ForkCast API gateway

## Local setup

Install dependencies:

```bash
npm install
```

Create your local environment file from the committed example:

```bash
cp .env.example .env.local
```

Set both variables in `.env.local` for your environment:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:13000
API_GATEWAY_URL=http://localhost:13000
```

- `NEXT_PUBLIC_API_URL` is exposed to the browser and is used for API requests and uploaded images.
- `API_GATEWAY_URL` is server-only and is used by the Next.js `/api` rewrite. It may point to an internal service address in production.

Do not commit `.env.local`. Environment-specific hostnames, private IP addresses, and credentials belong in ignored environment files or the deployment platform's environment settings.

## Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Changes to `next.config.ts` or `.env.local` may require restarting the development server.

## Verification

Run the unit tests:

```bash
npm test
```

Run tests while developing:

```bash
npm run test:watch
```

Create a production build:

```bash
npm run build
```

## Source structure

- `src/app`: App Router layouts and route pages
- `src/components`: feature and shared UI components
- `src/contexts`: React context providers
- `src/lib`: API and shared application utilities
- `public`: static assets
