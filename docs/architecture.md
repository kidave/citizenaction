# Citizen Action — Architecture & Source of Truth

> Canonical project context for future development. Update this document when architecture or ownership changes. Chat history is not the source of truth.

## 1. Source-of-truth model

Citizen Action uses three authoritative systems:

| System | Source of truth for |
| --- | --- |
| **GitHub — `kidave/citizenaction`** | Application code, repository configuration, Supabase migrations committed to the repo, architecture documentation, and version history |
| **Supabase — project `ward`** | Live Postgres database, RLS, SQL functions/RPCs, Auth, and Storage |
| **Vercel — project `citizenaction`** | Deployment configuration, build/runtime state, production/preview deployments, domains, and deployment environment variables |

The repository is the canonical **development memory**. The live Supabase project is the canonical **runtime database state**. Vercel is the canonical **deployment/runtime state**.

Old ChatGPT conversations, temporary uploaded files, screenshots, and local copies are historical context only. They must not override the repository or live services.

## 2. Current connected services

- GitHub repository: `kidave/citizenaction`
- Default branch: `main`
- Vercel project: `citizenaction`
- Supabase project: `ward`
- Supabase region: `ap-south-1`
- Vercel framework: Next.js
- Vercel Node runtime: 22.x

Vercel is connected directly to the GitHub repository. Changes intended for production should therefore be committed to GitHub and allowed to flow through the deployment pipeline rather than maintained only in a deployed copy.

## 3. Application stack

### Frontend

- Next.js 15.x
- React 19.x
- JavaScript/JSX
- Next.js Pages Router
- Tailwind CSS
- shadcn-style UI / Radix primitives
- Framer Motion
- Lucide icons
- Sonner

### Data and backend

- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Supabase RPC/functions and views
- Row Level Security (RLS)
- TanStack Query for client-side server state

### Forms and validation

- React Hook Form
- Zod

### Maps/geospatial capabilities

Existing project integrations include MapLibre, Leaflet, Mapillary and geospatial/PostGIS functionality.

## 4. Repository architecture

The active application lives under `src/`.

```text
src/
├── components/       # UI and product/domain components
├── config/           # Stable app configuration
├── context/          # Cross-cutting React context
├── hooks/            # Query/mutation and reusable client hooks
├── lib/              # Supabase clients and server integrations
├── pages/            # Next.js Pages Router pages and API routes
├── schemas/          # Zod schemas
├── styles/           # Global styling
└── utils/            # Pure reusable utilities

supabase/
└── migrations/       # Database schema/history intended to be versioned with code

docs/
└── *.md              # Durable architecture, backend, database, roadmap and technical notes
```

## 5. Architectural rules

1. **Pages orchestrate.** They should compose feature components and hooks instead of accumulating business logic.
2. **Components present UI.** Product components may manage interaction, but must not bypass authorization boundaries.
3. **Hooks own client-side server-state interaction.** Use canonical query/mutation functions and predictable query keys.
4. **Backend/database owns authorization and integrity.** Hiding a button is never authorization.
5. **RLS is mandatory for exposed application tables.** Each table needs intentional policies matching the access model.
6. **RPCs must have intentional execute grants and explicit authorization checks.** Avoid anonymous access to privileged operations.
7. **Zod validates structured application input** at API/form boundaries.
8. **React Hook Form owns complex form state** rather than duplicating form state across unrelated components.
9. **TanStack Query owns server state and cache invalidation.** Avoid ad-hoc duplicated fetching/caching strategies.
10. **Use Context sparingly** for genuinely cross-cutting state.
11. **Service-role credentials are server-only.** Never expose them through `NEXT_PUBLIC_*` variables or browser bundles.
12. **One canonical implementation per mutation.** Do not maintain competing RPC/API implementations for the same operation unless a compatibility boundary is intentional and documented.
13. **Removed features must be removed from documentation too.** Avoid preserving old route/table names as if they are still current.
14. **Before making a schema change, inspect the live Supabase state and existing migrations.** Do not recreate already-existing objects under new names merely to avoid understanding the existing design.
15. **Prefer additive, reversible changes.** Destructive cleanup should happen only after references and data dependencies are understood.

## 6. Data architecture

The current Supabase database is centered around several product domains.

### Identity and access

- `profile`
- `user_capabilities`
- space membership/application tables
- Supabase Auth

### Spaces and civic activity

- `space`
- `space_member`
- `space_application`
- `space_member_application`
- `post`
- `post_space`
- `contribution`
- `attachment`
- `link`
- `category`
- `action_support`

### Governance directory

- `governance`
- `governance_contribution`
- `governance_timeline`
- `geographies`
- `person`
- `position`
- `position_appointment`

The governance model has recently been normalized around canonical governance entities, geography, people, positions and appointments. New work should extend the current canonical model rather than resurrecting removed legacy governance tables, overloads, or route concepts.

### Classification

- `classification_system`
- `classification_dimension`
- `classification_code`
- `classification_closure`
- `classification_alias`
- `classification_mapping`

These support structured classification/taxonomy use cases and should be preferred over storing uncontrolled category strings when a canonical classification already exists.

## 7. Database migration policy

Supabase reports a long migration history through September 2026, including substantial cleanup of legacy governance/RPC structures, normalization of governance relationships, geography, organization/position/person modeling, and security grants.

The rule going forward is:

```text
Design/change
   ↓
Supabase migration
   ↓
Verify against live database
   ↓
Commit migration/documentation to GitHub
   ↓
Deploy application through Vercel
```

A live database change that exists only in the Supabase dashboard is considered **undocumented drift** and should be brought back into the repository as soon as practical.

## 8. Deployment model

Vercel hosts the Next.js application and is connected to GitHub.

Use GitHub as the change record. Use Vercel to inspect builds, deployments, runtime behavior, domains and environment configuration.

Production debugging should follow this order:

```text
Repository/code
   ↓
Vercel deployment/build logs
   ↓
Vercel runtime errors/logs
   ↓
Supabase schema/RPC/RLS/logical behavior
```

Do not patch production-only behavior in a way that leaves GitHub behind.

## 9. How future work should be approached

For any new Citizen Action task:

1. Inspect the current GitHub implementation before relying on historical conversation context.
2. Inspect the relevant Supabase tables, migrations, RLS and RPCs for backend changes.
3. Inspect Vercel deployment/runtime state for production issues.
4. Make the smallest coherent change that fits the existing architecture.
5. Verify the result against the live system when the change affects Supabase or production behavior.
6. Commit the durable implementation and documentation to GitHub.

### What not to use as authoritative context

- Old ChatGPT chats
- Previously uploaded project files that have since been superseded
- Screenshots of old UI
- Old copied SQL snippets
- Stale generated code
- Previous architecture proposals that were not implemented

Historical discussions can explain **why** a decision was made, but the implementation in GitHub/Supabase/Vercel determines **what is actually true now**.

## 10. Documentation hierarchy

Use the `docs/` directory as durable project memory:

- `architecture.md` — current architecture and source-of-truth rules
- `frontend.md` — frontend implementation conventions
- `backend.md` — backend/API/Supabase integration conventions
- `database.md` — database model and database-specific conventions
- `roadmap.md` — intended future work
- `technical-debt.md` — known technical debt
- dated audit documents — point-in-time audits; they do not override current architecture unless explicitly incorporated

When these documents conflict with the code or live systems, update the documentation rather than assuming the older text is correct.

## 11. Current known infrastructure note

As of the September 15, 2026 architecture review, Supabase reports one RLS-disabled relation: `public.spatial_ref_sys`, which is typically a PostGIS system table. This was **not changed automatically** because enabling RLS without appropriate policies could break access. Treat it as a deliberate infrastructure/security review item rather than a blind cleanup task.

## 12. Project principle

> **Build in GitHub. Store application truth in Supabase. Run and observe it through Vercel. Document durable decisions in the repository. Do not depend on chat history as project memory.**
