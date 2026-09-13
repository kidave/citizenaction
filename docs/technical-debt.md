# Technical Debt

This document tracks active maintenance risks and improvement opportunities. It should describe the current repository, not removed product areas or historical code that no longer exists.

## Architecture and maintainability

### Large mixed-responsibility files

The largest files should be split only when a clear responsibility boundary exists. Current high-value candidates include:

- `src/pages/manage/[space]/settings.js`
- `src/pages/apply/space.js`
- `src/pages/search.js`
- `src/pages/space/index.js`
- `src/components/ui/sidebar.jsx`
- `src/components/ui/timeline.jsx`

The goal is not to split files by line count alone. Extract reusable sections, data access, validation, and side effects when they form independent responsibilities.

### Product widgets inside generic UI

`src/components/ui/` contains both design-system primitives and some higher-level application widgets. Gradually move domain-specific components into feature/shared folders. UI primitives should remain domain independent.

### Scattered data access

Supabase calls exist across hooks, components, pages, and API routes. This is acceptable for small reads, but repeated query shapes, mutation logic, and cache invalidation should move toward small domain query/mutation helpers.

### State and query consistency

TanStack Query is already the server-state layer. Query keys, stale times, mutation invalidation, loading states, and error states should be standardized rather than implemented differently in each feature.

## Authentication and security

### Supabase auth helper migration

The app still uses `@supabase/auth-helpers-nextjs` in middleware. Supabase now recommends `@supabase/ssr` and has deprecated the Auth Helpers packages. Migration should be done as one controlled authentication change rather than mixing both approaches.

### Authorization boundary

Authorization should remain enforced by Supabase RLS and server-side/database functions. Client-side visibility checks are UX only. Privileged `SECURITY DEFINER` functions require individual review before changing grants or security mode.

### Debug/sensitive logging

Production-facing helpers and routes should never log Authorization headers, access tokens, service-role credentials, or unnecessary user identifiers.

### API validation

API routes should validate query/body input with Zod before performing database or external-service work. External-service parameters must be encoded/validated at the boundary.

## Backend source of truth

The database should become reviewable from GitHub through migrations/schema artifacts and generated Supabase types. RLS, grants, storage policies, and privileged functions should be documented alongside those artifacts.

Do not bulk-change Supabase security findings without first reviewing the affected function/table's actual authorization model.

## External services

The Nominatim proxy routes already use `URLSearchParams`/`URL.searchParams` for upstream parameters. The remaining work is rate limiting/caching and policy-aware usage rather than re-solving URL encoding.

The OSM synchronization workflow references `scripts/sync-osm-roads.js`; confirm whether the workflow or script is still part of the current product before restoring or removing either side.

## Testing

Testing dependencies exist, but `package.json` does not currently define a test script. Establish a small test foundation:

- Unit tests for pure utilities and Zod schemas.
- API tests for authentication, validation, ownership, and error responses.
- Component smoke tests for core feed/space/governance UI.
- E2E tests for login, feed creation, space application, and administration flows.
- CI checks for lint, tests, and production build.

## Performance

- Defer heavy map/editor/PDF/media dependencies where practical.
- Audit duplicate icon/media/date libraries before removing anything.
- Add pagination/infinite loading to unbounded feed/search/list queries.
- Centralize TanStack Query keys and invalidation.
- Review `images.unoptimized = true` before changing it; a custom image/storage strategy may be intentional.
- Avoid unnecessary client components and route-wide client boundaries.

## Documentation

Architecture, backend, and frontend documentation should describe active routes and responsibilities only. Removed Club/scope routes must not be reintroduced into documentation as current architecture.

The roadmap should remain the high-level execution plan; this file should remain focused on concrete debt and risks.
