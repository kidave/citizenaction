# Architecture

This document describes the current Citizen Action architecture at a high level. It should reflect the active repository and Supabase design, not removed product areas.

## Overall architecture

Citizen Action is a Next.js Pages Router application backed primarily by Supabase. The frontend is a React application under `src/` with domain-focused pages, components, hooks, schemas, utilities, and Supabase helpers. The backend surface consists of Next.js API routes, server-side Supabase clients, and Supabase database functions/RLS.

The preferred architecture is intentionally simple:

```text
Pages
  ↓
Feature/domain components
  ↓
Hooks / queries / mutations
  ↓
Supabase or protected API operation
  ↓
Postgres / Storage
```

Pages orchestrate. Components present UI. Hooks own client-side server-state interaction. Backend/database code owns authorization, business rules, transactions, and integrity.

## Folder structure

```text
.
├── .github/workflows/        # GitHub Actions workflows
├── public/                   # Static assets
├── src/
│   ├── components/           # Shared UI, layout, system, and domain components
│   ├── config/               # Stable application configuration
│   ├── context/              # Truly cross-cutting React context
│   ├── hooks/                # Client-side domain/query hooks
│   ├── lib/                  # Supabase clients, fetch/auth helpers, integrations
│   ├── pages/                # Next.js Pages Router pages and API routes
│   ├── schemas/              # Zod validation schemas
│   ├── styles/               # Global styling and theme
│   └── utils/                # Pure reusable utilities
├── middleware.js             # Next.js middleware
├── next.config.js            # Next.js configuration
├── next-sitemap.config.js    # Sitemap configuration
└── package.json              # Project configuration and dependencies
```

## Architecture rules

1. Pages orchestrate; they should not become large business-logic files.
2. Components render and manage UI interaction; they should not own privileged database access.
3. `components/ui/` is for reusable design-system primitives and should remain domain-independent.
4. Domain-specific product components belong with their feature/domain rather than in the generic UI layer.
5. Client queries and mutations should have canonical hooks/query functions.
6. Protected mutations should have one canonical backend implementation.
7. Authorization must be enforced by the backend/database and never rely solely on hidden UI controls.
8. Zod is the canonical input-validation layer for application boundaries where structured input is accepted.
9. Query keys and cache invalidation should follow a consistent pattern.
10. Heavy browser-only libraries should be lazy-loaded where practical.
11. Service-role credentials are server-only.
12. Privileged Supabase RPC functions must have intentional grants and explicit authorization checks.
13. Every exposed application table must have an intentional RLS policy.
14. When a feature or route is removed, update architecture documentation in the same change.

## Technology stack

### Core runtime

- Next.js 15.x
- React 19.x
- JavaScript and JSX, with gradual adoption of TypeScript for new/shared backend-facing types
- Next.js Pages Router
- Supabase JavaScript client

### Data and state

- Supabase Postgres, views, RPC functions, Auth, and Storage
- TanStack Query for client-side server state and caching
- React Context only for genuinely cross-cutting state such as authentication/media where required

### Forms and validation

- React Hook Form
- Zod

### UI and styling

- Tailwind CSS
- Radix UI primitives
- shadcn-style UI components
- Sonner
- Framer Motion where interaction benefits from animation
- Lucide and other icon libraries used by existing product areas

## Next.js routing

The project uses the Pages Router under `src/pages`.

### Application pages

```text
/                                      -> src/pages/index.js
/about                                 -> src/pages/about.js
/action                                -> src/pages/action.js
/search                                -> src/pages/search.js
/post/[id]                             -> src/pages/post/[id].js
/settings/profile                      -> src/pages/settings/profile.js
/user/[username]                       -> src/pages/user/[username].js
```

### Auth pages

```text
/auth/login
/auth/callback
/auth/privacy
```

### Space pages

Only routes confirmed to exist in the active repository should be listed here. Removed Club and scope-specific route structures are intentionally omitted.

### Management pages

Management routes live under `/manage/*` and are protected by middleware.

## Authentication flow

Authentication is centralized through Supabase Auth and the application auth context.

The browser client uses the Supabase auth session. Protected API routes receive an end-user access token and must verify the user before performing protected operations. Middleware protects management routes.

## Supabase architecture

### Browser client

`src/lib/supabase/client.js` exposes the public Supabase client to browser code.

### Server client

`src/lib/supabase/server.js` provides a user-scoped server client for authenticated server operations.

### Node/service client

`src/lib/supabase/node.js` is restricted to trusted Node-only/service-role use.

The project should converge on one documented SSR/auth helper strategy rather than maintaining overlapping Supabase auth helper approaches indefinitely.

## Data flow

Typical client data flow:

```text
Page
  ↓
Domain component
  ↓
Query/mutation hook
  ↓
Supabase or protected API
```

Typical protected operation:

```text
Component
  ↓
Mutation hook
  ↓
API route or RPC
  ↓
Authorization/business rules
  ↓
Postgres transaction
```

## State management

Use the smallest appropriate state mechanism:

- React local state for local interaction.
- URL state for shareable navigation/filter state.
- TanStack Query for server state.
- Context only for cross-cutting application state.

No general-purpose global state library is currently required.

## Shared components

### `components/ui/`

Reusable design primitives such as buttons, inputs, dialogs, cards, tabs, tooltips, sidebar primitives, and other shadcn/Radix-based components.

Product-specific widgets should move out of this layer when they depend on a specific domain.

### `components/layout/`

Global application shell, navigation, sidebar, profile, logo, and responsive layout components.

### `components/shared/`

Cross-domain widgets that genuinely belong to more than one feature.

### `components/system/`

Error boundary, route/loading infrastructure, and similar app-wide behavior.

## API routes

API routes should remain thin. A route should primarily:

1. validate request shape;
2. establish authentication when required;
3. call a canonical server operation;
4. translate the result into an HTTP response.

Business rules should not be duplicated across routes, components, and RPCs.

## Source of truth

The long-term source of truth should be:

```text
GitHub
├── application code
├── Supabase migrations
├── generated database types
└── architecture documentation

Supabase
├── Postgres
├── RLS policies
├── RPC/functions
└── Storage policies
```

The repository currently needs stronger synchronization between GitHub and the live Supabase schema.

## Deployment

The project is structured for Vercel deployment using Next.js conventions. Environment variables are configured in the deployment environment. Heavy client libraries should be code-split so that routes only load what they need.
