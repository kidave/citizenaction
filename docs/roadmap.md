# Improvement Roadmap

This is the execution plan for improving Citizen Action without introducing unnecessary rewrites. Changes should be incremental, verified, and aligned with the current repository.

## Guiding architecture

- Pages orchestrate; feature components render; hooks/query helpers own client-side server state.
- Supabase/database owns authorization, integrity, transactions, and backend business rules.
- `components/ui` contains reusable UI primitives and stays domain independent.
- Use one source of truth for query keys, schemas, auth patterns, and shared domain models.
- Prefer small reusable modules over large files, but do not abstract trivial one-off JSX.
- Keep Pages Router architecture stable; do not migrate to App Router as part of cleanup.

## Phase 1 — completed/current foundation

- [x] Refresh architecture/backend/frontend/database documentation to reflect the active application.
- [x] Remove route-based shell decisions from the global `Layout`.
- [x] Make `AppShell` route-agnostic and let pages opt into shell variants through `getLayout`.
- [x] Move Home's right-sidebar decision to the page.
- [x] Keep standalone pages such as About, Governance, and Space Timeline outside the global shell through page-owned layouts.
- [x] Update TanStack Query v5 configuration from `cacheTime` to `gcTime`.
- [x] Remove obsolete Club/scope routes from current architecture documentation.
- [x] Refresh technical-debt documentation so removed routes are not treated as active debt.
- [x] Fix the `/manage` unauthenticated redirect to the actual `/auth/login` page.
- [x] Restrict anonymous execution of the reviewed privileged mutation RPCs and track the change as a Supabase migration.

## Phase 2 — authentication and backend safety

### Supabase auth

- [ ] Migrate from `@supabase/auth-helpers-nextjs` to the current `@supabase/ssr` approach.
- [ ] Keep one browser client pattern and one server/middleware client pattern.
- [ ] Document where browser sessions, API bearer tokens, and privileged server clients are allowed.
- [ ] Confirm service-role usage is server-only.

### Database authorization

- [ ] Review the remaining `SECURITY DEFINER` functions individually.
- [x] Restrict anonymous execution for the reviewed privileged mutation/admin functions where not required.
- [ ] Add explicit authorization checks inside privileged functions where appropriate.
- [ ] Review the six security-definer views and make RLS/view security intent explicit.
- [ ] Review exposed tables with RLS enabled but no policies; distinguish intentionally private/unused tables from missing policies.
- [ ] Review `search_path` on database functions and make it explicit where appropriate.
- [ ] Review auth warnings: leaked-password protection, OTP expiry, and available PostgreSQL security updates.
- [ ] Do not blindly enable RLS on PostGIS system tables such as `spatial_ref_sys` without confirming intended exposure.

### Database source of truth

- [x] Keep Supabase migrations/schema artifacts in GitHub.
- [ ] Generate and track Supabase database types.
- [x] Document the database architecture, authorization model, and migration source of truth.
- [ ] Review RLS/storage policies and privileged functions in repository documentation.
- [ ] Review indexes for feed, membership, governance, geography, and common lookup paths.

## Phase 3 — data-access architecture

- [ ] Establish consistent query-key factories for TanStack Query.
- [ ] Standardize mutation invalidation rules.
- [ ] Separate read queries from mutation functions where repeated patterns exist.
- [ ] Add small repository/query helpers only for repeated domain access; avoid a generic abstraction layer.
- [ ] Standardize loading, empty, and error states.
- [ ] Validate API inputs with Zod.
- [ ] Centralize repeated authentication/ownership checks.
- [ ] Audit API routes so frontend responsibilities stop at request/response orchestration.

## Phase 4 — frontend structure

- [ ] Gradually move domain-specific widgets out of `components/ui`.
- [ ] Split the largest route components by responsibility: data loading, forms, sections, mutations, and destructive actions.
- [ ] Remove unnecessary client boundaries from simple components.
- [ ] Prefer URL state for shareable filters/navigation state and local state for ephemeral UI state.
- [ ] Avoid adding Redux/Zustand unless a real cross-domain state requirement appears.
- [ ] Keep shared components visually and behaviorally consistent through shadcn primitives.

### Feature organization target

For new or substantially refactored domains, prefer:

```text
src/features/<domain>/
├── components/
├── hooks/
├── queries/
├── mutations/
├── schemas/
├── utils/
└── config/
```

Do not mass-move the existing codebase. Adopt this structure gradually as files are changed for real product work.

## Phase 5 — performance

- [ ] Audit bundle size and identify heavy map/editor/PDF/media dependencies.
- [ ] Dynamically import heavy client-only features where useful.
- [ ] Add pagination/infinite queries to unbounded feed/search/list experiences.
- [ ] Avoid duplicate Supabase requests and duplicate derived-data fetching.
- [ ] Review image optimization and the reason `images.unoptimized` is enabled before changing it.
- [ ] Add caching/rate limiting to external OSM proxy usage where appropriate.
- [ ] Use stable query keys and avoid unnecessary refetches.

## Phase 6 — tests and CI

- [ ] Add a test command to `package.json`.
- [ ] Unit-test utilities and Zod schemas.
- [ ] Test critical API authorization/validation paths.
- [ ] Add component smoke tests for feed, space, governance, and administration.
- [ ] Add E2E coverage for login and the most important user workflows.
- [ ] Run lint, tests, and production build in CI.
- [ ] Keep production deployments gated by successful verification once CI is reliable.

## Phase 7 — operational cleanup

- [ ] Add an environment-variable example/documentation with public vs server-only scope clearly marked.
- [ ] Remove sensitive production logging.
- [ ] Confirm or remove the OSM sync workflow/script pair.
- [ ] Audit installed dependencies for duplicates and unused packages before deleting anything.
- [ ] Document third-party CSP requirements and reduce broad allowances where safe.
- [ ] Keep deployment/runtime documentation current.

## Implementation rule

Do not attempt all phases in one rewrite. Each change should follow:

1. Inspect current usage.
2. Make the smallest architectural change that improves the boundary.
3. Commit it clearly.
4. Verify GitHub state and production build/deployment.
5. Only then move to the next related improvement.

This roadmap intentionally separates safe refactors from database/security changes. Database authorization changes require function/table-specific review and verification before deployment.
