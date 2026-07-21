# Technical Debt

This document records code smells and maintenance risks discovered during static repository review. It does not modify behavior.

## Code smells

### Large mixed-responsibility files

Several files are large and likely combine routing, rendering, state management, validation, side effects, and Supabase calls:

- `src/components/ui/sidebar.jsx` (~687 lines)
- `src/pages/manage/[space]/settings.js` (~592 lines)
- `src/pages/apply/space.js` (~547 lines)
- `src/components/ui/timeline.jsx` (~500 lines)
- `src/pages/apply/space/[space]/club.js` (~360 lines)
- `src/pages/search.js` (~305 lines)
- `src/pages/space/index.js` (~305 lines)
- `src/pages/space/[space]/[scopeType].js` (~305 lines)
- `src/pages/api/club/[space]/[scopeType]/[scopeCode].js` (~293 lines)

### Scattered data access

Supabase calls exist in hooks, components, pages, and API routes. That is workable, but it makes schema changes harder because table/view names and field assumptions are spread across the codebase.

### Debug logging in production paths

`src/lib/fetch.js` logs request data including headers. API routes also log authenticated user identifiers and route operations. These logs may be useful during development but risky in production.

### Incomplete backend source of truth

The repository does not include Supabase migrations, generated database types, policy documentation, or local Supabase configuration. This makes database changes difficult to review safely.

### Mixed auth helper strategy

Both `@supabase/auth-helpers-nextjs` and `@supabase/ssr` are installed, while middleware uses `@supabase/auth-helpers-nextjs`. The repository should document the intended strategy and migration plan.

### Product widgets inside generic UI folder

`src/components/ui/` includes primitive UI components and higher-level product/media widgets. This blurs the boundary between reusable design primitives and application features.

## Duplicate logic

### Club creation fallback

`src/pages/api/space/[slug]/club.js` contains comments and code that try `club` first, then fall back to `club` again. This suggests stale code from a previous table-name migration.

### Auth and protected action patterns

The codebase includes multiple approaches:

- middleware protection for `/manage/*`
- `ProtectedButton`
- `useRequireAuth`
- manual bearer-token API calls
- manual `supabase.auth.getSession()` calls

These should be consolidated into a small set of documented patterns.

### Storage cleanup patterns

Storage cleanup for branding appears in page/API logic. Similar path parsing and bucket handling should eventually be centralized.

### Location/scope selection

There are several scope/location components and hooks. They may be justified by UX differences, but the shared state and data model should be documented to avoid duplication.

## Large components/files that should be split

Recommended future split candidates:

1. `src/pages/manage/[space]/settings.js`
   - split data loading, form sections, branding upload/delete, destructive actions, and page shell.
2. `src/pages/apply/space.js`
   - split form steps/sections, validation, submission, and display components.
3. `src/pages/apply/space/[space]/club.js`
   - split scope selection, form state, submission, and UI sections.
4. `src/pages/api/club/[space]/[scopeType]/[scopeCode].js`
   - split auth verification, ownership check, storage cleanup, and method handlers.
5. `src/pages/api/space/[slug]/club.js`
   - split auth verification, ownership validation, scope validation, duplicate check, and insert logic.
6. `src/components/ui/sidebar.jsx`
   - verify whether this is imported from a UI template; if customized, split into primitives and composed variants.
7. `src/components/ui/timeline.jsx`
   - split timeline primitives from application-specific timeline rendering.
8. `src/hooks/feed/useEditor.js`
   - split editor state transitions if additional editor complexity is added.

## Potential bugs

1. **Middleware redirect target may be wrong.** Middleware redirects unauthenticated `/manage/*` requests to `/auth`, but the tracked login page is `/auth/login`.
2. **Missing workflow script.** GitHub Actions references `scripts/sync-osm-roads.js`, but no tracked script exists.
3. **Potential secret/header logging.** `authFetch()` logs headers, including Authorization.
4. **Unencoded OSM query parameters.** `/api/osm` and `/api/osm-reverse` interpolate query params directly into URLs.
5. **Network status invalid URL risk.** `NetworkStatusBanner` uses `NEXT_PUBLIC_SUPABASE_URL` without guarding missing configuration.
6. **Unclear Supabase env var naming.** App code and GitHub Actions use different Supabase env var names.
7. **No visible handling for Nominatim rate limits.** The proxy routes do not cache or rate limit requests.
8. **Missing schema source.** Without migrations/types, field assumptions can drift from actual Supabase schema.
9. **Potential broad CSP allowances.** CSP includes multiple wildcard domains; intended integrations should be documented and minimized over time.
10. **Image optimization disabled globally.** `images.unoptimized = true` may be intentional, but it bypasses Next image optimization.

## Missing tests

No test script is defined in `package.json`. Testing dependencies are installed, but no obvious test suite structure was found during review.

Recommended test layers:

- Unit tests for pure utilities in `src/utils`.
- Unit tests for Zod schemas in `src/schemas`.
- API route tests for auth/validation/ownership behavior.
- Component smoke tests for core pages and feed components.
- E2E tests for login, feed creation, space application, club creation, and manage settings.
- Build/lint checks in CI.

## Dead code or missing artifacts

Potential dead/missing artifacts:

- `.github/workflows/osm-sync.yml` references missing `scripts/sync-osm-roads.js`.
- `move-to-src.js` may be a one-time migration helper; confirm whether it is still needed.
- Installed dependencies should be audited against actual imports.
- Public assets should be audited for unused legacy logos/icons/images.
- `@supabase/auth-helpers-nextjs` is deprecated upstream in favor of newer SSR helpers; confirm migration status because `@supabase/ssr` is also installed.

## Opportunities for optimization

### Frontend bundle

- Dynamically import heavy editor, map, PDF, carousel, and media viewer components where possible.
- Audit duplicate icon libraries and media packages.
- Split route-level code for large pages.

### Data fetching

- Standardize TanStack Query keys.
- Add pagination/infinite query patterns to feed/search/list views.
- Centralize cache invalidation after mutations.
- Avoid duplicate Supabase calls where page-level data can be passed to child components.

### Backend/API

- Validate all API inputs with Zod schemas.
- Encode all external service query parameters.
- Add caching/rate limiting for OSM proxy endpoints.
- Extract reusable auth and ownership helpers.

### Database

- Add schema migrations or generated schema snapshots.
- Add generated Supabase types for compile-time safety.
- Document RLS policies and storage policies.
- Review indexes for feed, scope, club, and membership lookups.

### Security

- Remove sensitive logs.
- Confirm service role key usage is server-only.
- Tighten CSP after documenting required third-party domains.
- Add explicit environment variable validation at startup/build time.
