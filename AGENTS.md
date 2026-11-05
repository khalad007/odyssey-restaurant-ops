# Architecture rules

Forbidden: no Next.js, Prisma, tRPC, Supabase, Firebase, or handwritten frontend DTOs.

## Contract pipeline

- Follow this single source of truth: Drizzle schema → drizzle-zod schemas → Hono routes and OpenAPI document → Orval-generated API client and types.
- Define database entities in `services/backend` with Drizzle. Derive validation schemas with drizzle-zod; derive request and response contracts from those schemas.
- Register Hono endpoints with their validation schemas and OpenAPI metadata. Generate the OpenAPI document from the registered routes.
- Generate `packages/api-client` from that document with Orval. The dashboard must consume this client instead of duplicating endpoint definitions or fetch wrappers.
- Do not handwrite DTOs, duplicate API interfaces, or recreate types already derivable from schemas or generated contracts. Infer types from the authoritative schema or generated client.
- Keep `packages/types` for shared non-API types and re-exports of derived types. Keep reusable non-API utilities and design tokens in `packages/shared`.

## Backend rules

- Order status changes must go through server-side transition rules, never a loose field update.
- Always compute order totals on the server.
- Store money as integer cents.
- Define the order status enum once in the Drizzle schema and only re-export it elsewhere.

## Dashboard structure

- Feature code lives in apps/dashboard/src/features/<name>: page files are thin, data logic is in hooks, and UI comes from src/ui.
- UI primitives live in apps/dashboard/src/ui, are presentational, and use tokens only. New repeated patterns become shared components.
- Keep pages thin: compose feature components and connect routing, parameters, and feature entry points.
- Put business logic, data access, and reusable UI outside page files in focused feature modules or shared components.
- All literal colors and visual sizes, including typography, spacing, radii, borders, shadows, layout dimensions, and motion durations, must live in `packages/shared`. Handwritten UI code must consume those tokens. Generated files must be regenerated rather than edited.

## Generated artifacts

- Never hand-edit generated files, including Orval output and generated OpenAPI artifacts.
- Change the upstream schema, route declaration, or generator configuration, then regenerate with `pnpm gen:contract`.
- Keep generated output in clearly identified directories and mark it as generated. Review generator diffs alongside source changes.

## Workspace boundaries

- `apps/dashboard`: dashboard application.
- `services/backend`: Drizzle schema, validation, Hono routes, and OpenAPI generation.
- `packages/shared`: reusable utilities and centralized design tokens.
- `packages/types`: shared non-API types and derived type re-exports.
- `packages/api-client`: Orval configuration and generated API client.
- Use workspace dependencies for internal packages and Turborepo for task orchestration.
