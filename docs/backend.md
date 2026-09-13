# Backend

This document describes the current backend surface of Citizen Action. It should be kept aligned with the repository and Supabase project; historical routes and removed product areas should not be documented as active architecture.

## Backend surface

The application uses three main backend surfaces:

1. Next.js API routes under `src/pages/api/` for server-side validation, ownership checks, and external-service proxies.
2. Supabase directly from the browser for client-readable data and operations that are intentionally protected by Supabase RLS.
3. Supabase RPC functions for database-side business operations and multi-table transactions.

The Supabase database schema, RLS policies, functions, and storage policies are tracked through migrations under `supabase/migrations/`. Generated database types remain a planned improvement.

## Current API routes

The active API surface should be treated as the source of truth in `src/pages/api/`.

Known current proxy routes include:

### `src/pages/api/osm.js`

OpenStreetMap Nominatim search proxy.

### `src/pages/api/osm-reverse.js`

OpenStreetMap Nominatim reverse-geocoding proxy.

Additional API routes should be documented here only when they are confirmed to exist in the current repository.

## Server/client separation

### Client-side responsibilities

- Render pages and components.
- Manage interactive state and forms.
- Use the browser Supabase client for data access that is safe under RLS.
- Use TanStack Query for server-state caching and invalidation.
- Upload client-owned media through approved Supabase Storage paths.
- Call API routes when server-side validation, ownership checks, or external-service access is required.

### Server-side responsibilities

- Perform operations requiring trusted server execution or external-service proxying.
- Verify the authenticated user for protected API routes.
- Enforce ownership or administrative checks that should not rely on UI state.
- Keep service credentials and privileged integrations server-only.

### Database responsibilities

- Enforce relationships and integrity with constraints.
- Enforce row-level authorization with RLS.
- Keep transactional multi-table business operations in RPC functions where appropriate.
- Maintain auditability for sensitive administrative changes.

## Authentication

Authentication is provided by Supabase Auth.

- Browser authentication uses the Supabase browser client.
- The application uses PKCE for the browser auth flow.
- Production login uses Google OAuth.
- Development authentication may use email OTP when explicitly enabled.
- Protected API routes receive an end-user access token and must verify the user before performing protected operations.
- Middleware protects application management routes.

The application currently uses `@supabase/auth-helpers-nextjs` in middleware. Supabase has deprecated the Auth Helpers package in favor of `@supabase/ssr`; migration is planned and should be performed as one controlled authentication change rather than mixing both strategies.

## Supabase clients

### Browser client

`src/lib/supabase/client.js` is the browser client and uses public Supabase environment variables.

### User-scoped server client

`src/lib/supabase/server.js` creates a Supabase client using the request's bearer access token. It is used for server/API operations that need the caller's RLS context.

### Node/service client

`src/lib/supabase/node.js` is a trusted Node-only/service-role client. The service-role key must never be imported into browser code.

### Future auth architecture

When migrating middleware to `@supabase/ssr`, keep the existing bearer-token API pattern distinct from cookie/session middleware. The current Pages Router API routes should not be rewritten merely to adopt SSR helpers.

## Storage

Current storage usage should be derived from `src/lib/supabase/storage.js` and the feature that owns each asset type.

Known application media includes post attachments and space/governance branding. Removed product areas should not remain documented as active storage consumers.

## Data access policy

New backend work should follow these rules:

- UI components do not call privileged backend operations directly.
- Client data access lives in query hooks/query functions rather than being duplicated across many components.
- Protected mutations have one canonical implementation.
- All external request input is validated.
- Authorization is enforced by the backend/database and never depends solely on whether a button is visible.
- Privileged RPC functions must have intentional grants and explicit authorization checks.

## Source of truth

```text
GitHub
├── application/API code
├── supabase/migrations/
├── database documentation
└── generated database types (planned)

Supabase
├── Postgres
├── RLS policies
├── RPC/functions
└── Storage policies
```

## External services

Current external integrations should be confirmed from the active codebase before being documented here. Known integrations include OpenStreetMap/Nominatim, Mapbox, Mapillary-related resources, and Google OAuth through Supabase Auth.

## Maintenance rule

When a route, feature, table, or integration is deleted, remove it from this document and related architecture documentation in the same change. This prevents documentation from becoming a second, inaccurate architecture.
