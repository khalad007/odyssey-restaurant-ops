# Odyssey Restaurant Operations

## Overview

Odyssey is a restaurant operations dashboard for managing orders, menus, customers, and settings.  
Staff can create orders, advance their status, manage availability, and review sales summaries.  
The browser dashboard shares a generated API contract with the backend.

## Stack

- pnpm workspaces and Turborepo; TypeScript.
- Expo Router, React Native Web, TanStack Query.
- Hono/OpenAPI on Cloudflare Workers; postgres.js.
- PostgreSQL 16, Drizzle ORM, drizzle-zod, Zod, Orval.
- Vitest; Jest Expo and React Native Testing Library.

## Quick start

Run commands from the repository root. Copy commands below use PowerShell.

1. Install Node **22.18+** (24.3+ recommended) and Docker with Compose; start Docker. Although Node 20+ was the original target, installed Expo/React Native require at least 22.13, and the existing Node-based tests need default TypeScript stripping available from 22.18. Enable pnpm through Corepack:

   ```powershell
   npm install --global corepack
   corepack enable
   corepack pnpm --version
   ```

   The repository pins pnpm 10.11.0 through `packageManager`.

2. Install dependencies:

   ```powershell
   pnpm install
   ```

3. Start PostgreSQL:

   ```powershell
   pnpm db:up
   ```

4. Create local environment files:

   ```powershell
   Copy-Item services/backend/.dev.vars.example services/backend/.dev.vars
   Copy-Item services/backend/.env.example services/backend/.env
   Copy-Item apps/dashboard/.env.example apps/dashboard/.env
   ```

   `.dev.vars` supplies Worker bindings; `.env` supplies Drizzle CLI and seed configuration. Both database examples point to `postgres://postgres:postgres@localhost:5432/odyssey`. The dashboard example points to `http://localhost:8787`.

5. Apply migrations (there is no root `db:migrate` script):

   ```powershell
   pnpm --filter @odyssey/backend db:migrate
   ```

6. Seed the database:

   ```powershell
   pnpm db:seed
   ```

   Seeding replaces the seeded tables transactionally with deterministic demo data: 5 categories, 25 items, 15 customers, settings, and 40 orders. Rerunning it resets those tables.

7. Start the backend in one terminal:

   ```powershell
   pnpm dev:backend
   ```

8. Start the dashboard in another terminal:

   ```powershell
   pnpm dev:dashboard
   ```

Open the dashboard at **http://localhost:8081**, the component reference at **http://localhost:8081/ui-library**, backend health at **http://localhost:8787/health**, and OpenAPI at **http://localhost:8787/openapi.json**. Expo may choose another port if occupied; use its printed URL and configure the backend `ALLOWED_ORIGINS` binding accordingly. Default allowed origins are `http://localhost:8081` and `http://localhost:19006`.

## Scripts

| Root command | Purpose |
| --- | --- |
| `pnpm dev:dashboard` | Start Expo in web mode. |
| `pnpm dev:backend` | Start the Worker locally with Wrangler. |
| `pnpm gen:contract` | Generate backend OpenAPI, then Orval hooks, types, and form validators. |
| `pnpm lint` | Run workspace ESLint checks, including token rules. |
| `pnpm typecheck` | Run workspace TypeScript checks. |
| `pnpm test` | Run workspace tests through Turbo; PostgreSQL must be running. |
| `pnpm db:up` | Start PostgreSQL with Docker Compose. |
| `pnpm db:seed` | Replace demo data through the backend seed script. |

## Architecture

```text
Drizzle schema → drizzle-zod → Hono routes / OpenAPI
                                      ↓
                                    Orval
                                      ↓
                     generated types, validators, Query hooks
                                      ↓
                              dashboard features
```

```text
apps/dashboard/src/
  app/                  Thin Expo Router pages
  features/             Home, orders, menu, CRM, settings, UI library
  ui/                   Presentational primitives and application shell
services/backend/
  src/db/               Drizzle schema, derived validation, seed
  src/routes/           OpenAPI route declarations
  src/services/         Business rules and database operations
  drizzle/              Database migrations
  openapi.json          Generated contract
packages/
  api-client/           Orval configuration, transport, generated artifacts
  shared/               Design tokens and non-API utilities
  types/                Reserved for non-API types and derived re-exports
```

Order transitions are centralized in `orderStateMachine.ts`. The client sends an **action**, the server maps it to a valid status, and backend `allowedActions` drives UI buttons. The flow is pending → confirmed → preparing → ready → completed; cancellation is allowed from pending, confirmed, and preparing. Completed and cancelled are final; invalid transitions return 409.

Order creation reads current menu prices and computes totals inside a server transaction. Money uses integer cents. Order lines retain name and unit-price snapshots so later menu edits do not rewrite order history. The frontend total is explicitly an estimate. Settings control order acceptance and auto-acceptance; the detail Drawer displays configured prep time.

Design tokens live in `packages/shared`; primitives live in `apps/dashboard/src/ui`. Features compose them, and `/ui-library` demonstrates tokens, components, and interaction states. Generated files are changed through their source and regenerated, never edited manually.

## Demo the contract pipeline

1. Add an optional column to `menuItems` in `services/backend/src/db/schema.ts`. Its insert/select validation and menu contracts derive from that schema; check the route schemas in `src/db/zod.ts` for explicit picks/omissions.
2. Run:

   ```powershell
   pnpm gen:contract
   pnpm typecheck
   ```

3. Inspect `services/backend/openapi.json`, `packages/api-client/src/generated/models/menuItem.ts`, and `packages/api-client/src/generated-validation/menu.ts`. The generated item type and form validator now expose the new field without a handwritten frontend DTO.
4. Before exercising a database-column change, generate and apply its migration:

   ```powershell
   pnpm --filter @odyssey/backend db:generate
   pnpm --filter @odyssey/backend db:migrate
   ```

## Testing

`pnpm test` covers backend state transitions, integer totals, route validation, order creation/rejections, settings, menu/customer operations, and real PostgreSQL order flows. Integration tests create and drop isolated databases; they do not use seeded development data. The default admin connection is the local `postgres` database; `TEST_DATABASE_ADMIN_URL` overrides it and needs permission to create databases.

Frontend tests mock generated hooks and cover filters, search debounce, subtotal previews, restricted create/transition payloads, settings dirty state and prep-time bounds. Component tests cover blocked/loading buttons, feedback actions, status colors, and the mobile table fallback. Currency formatting and client transport have separate tests. There are no snapshot tests.

## Tradeoffs and incomplete areas

- Browser-focused: native iOS/Android behavior is untested.
- No authentication, authorization, or production deployment setup.
- Workers deployment needs a reachable PostgreSQL service. Hyperdrive or Neon are possible production approaches; their adapters/bindings are not configured here.
- Orders use basic page/offset pagination; CRM search and sorting operate on the loaded customer list.
- Opening hours are stored and editable; they do not automatically schedule order acceptance. Prep time is an estimate, not a delivery-time prediction.
- No maintained end-to-end test suite; automated coverage is unit, hook, component, route, and database integration testing.

## How AI was used

`AGENTS.md` guardrails were established first: one contract pipeline, generated API types, thin pages, server-owned order rules, and token-only UI primitives. Features were built in small reviewable steps. Changes were checked with contract regeneration, TypeScript, ESLint, targeted tests, and repository searches for raw dashboard fetch calls, duplicated API types, literal colors, and dead code.
