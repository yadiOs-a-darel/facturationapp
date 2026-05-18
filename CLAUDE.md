# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Development (run in separate terminals)
pnpm run dev:api      # Express API server on port 4000
pnpm run dev:web      # Vite dev server on port 5173 (proxies /api to :4000)
pnpm run dev:desktop  # Electron desktop app

# Build (for production)
pnpm run build        # Builds @gestfacturation/shared then @gestfacturation/web

# Build executable (API only)
pnpm run build:exe        # Builds executable for all platforms
pnpm run build:exe:linux  # Linux x64
pnpm run build:exe:macos  # macOS x64
pnpm run build:exe:win    # Windows x64 (.exe)

# Linting
pnpm run lint         # Runs lint across all packages (Biome)
pnpm run lint:check   # Lint without fixing
pnpm run format       # Format code with Biome

# Type checking
pnpm --filter @gestfacturation/shared type-check   # Type check shared package

# Database
pnpm run drizzle:generate   # Generate Drizzle migration
pnpm run drizzle:migrate    # Run Drizzle migration

# Environment
# Copy .env.example to .env and configure:
#   packages/api/.env.example
#   packages/shared/.env.example
#   apps/web/.env.example
```

## Monorepo Structure

This is a pnpm workspace monorepo with five packages:

- `apps/web` - Vite + React web application (thin wrapper, imports everything from shared)
- `apps/desktop` - Electron desktop application
- `packages/shared` - All UI components, pages, hooks, and business logic
- `packages/api` - Express.js API server
- `packages/database` - Drizzle database configuration

## Key Architectural Patterns

### Shared Package Architecture

The `@gestfacturation/shared` package contains all the application code:

- **Components**: UI components in `src/components/ui/` (shadcn/ui based)
- **Pages**: Feature-based page components in `src/features/*/pages/`
- **Hooks**: TanStack Query hooks for data fetching in `src/features/*/hooks/`
- **API Clients**: Axios-based API clients in `src/features/*/api/client.ts`
- **Layouts**: Route layouts in `src/app/layouts/`

The web app (`apps/web`) is intentionally minimal - it only imports and renders `<App />` from the shared package.

### Routing

Uses **TanStack Router** (`@tanstack/react-router`) with file-based route configuration in `packages/shared/src/app/routes.tsx`:

- `rootRoute` - Root layout with sidebar
- `protectedLayout` - Layout that requires authentication
- Routes: `/`, `/customers`, `/products`, `/invoices`, `/stock`, `/auth/login`, `/auth/register-tenant`

### State Management & Data Fetching

Uses **TanStack Query** (`@tanstack/react-query`) with:

- Query keys defined in `packages/shared/src/lib/query.ts` (e.g., `customersKeys`, `invoicesKeys`)
- Stale time: 2 minutes
- Global error handling via toast notifications

### Authentication Flow

- JWT tokens stored in `localStorage` key `gestfacturation_token`
- API client adds `Authorization: Bearer` header automatically in `packages/shared/src/lib/api-client.ts`
- API validates JWT in `packages/api/src/middleware/auth.ts`
- Protected routes redirect to `/auth/login` if no token exists

### API Structure

Express API in `packages/api/src/`:

- Modular route structure: `modules/*/module.routes.ts` and `module.controller.ts`
- JWT middleware for protected routes
- CORS enabled for all origins
- Static file serving from `/uploads` for file attachments

### UI Components

Uses **shadcn/ui** components located in `packages/shared/src/components/ui/`. Components are built on top of Radix UI primitives with Tailwind CSS styling.

## Workspace Dependencies

Packages reference each other using `workspace:*` protocol:

- `@gestfacturation/web` depends on `@gestfacturation/shared`
- `@gestfacturation/api` depends on `@gestfacturation/database`

## Environment Configuration

Each package has its own `.env` file (see `.env.example` in each directory):

- `packages/api/.env` - Database URL, JWT_SECRET, PORT
- `packages/shared/.env` - VITE_API_URL
- `apps/web/.env` - Vite environment variables

## Executable Build

The API can be built as a standalone executable for Linux, macOS, and Windows using `pkg`. See `packages/api/README-EXECUTABLE.md` for detailed instructions.

After building, executables are placed in `packages/api/dist/executables/`:
- `gestfacturation-api-linux-x64`
- `gestfacturation-api-macos-x64`
- `gestfacturation-api-win.exe`

## Testing

Currently, there are no test scripts defined in the repository. Test files (if any) are not committed to the source code.
