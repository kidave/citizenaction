# Roadmap

This roadmap is based on repository review only. It does not change application behavior.

## Current functionality

### User/auth

- Supabase authentication.
- Google OAuth login for production.
- Email OTP login when dev auth mode is enabled.
- Auth context exposes current user, loading state, login/logout, and access-token retrieval.
- Manage routes are protected by middleware.

### Spaces and clubs

- Public space listing and space detail pages.
- Geographic scope-specific space pages.
- Space applications.
- Space management pages.
- Club creation under spaces.
- Club settings update/delete flows.
- Club branding storage for logo/cover assets.

### Feed/actions

- Feed display through `feed_light_view`.
- Feed post creation, update, delete.
- Post editor with content, metadata, attachments, timeline, authority selection, date/time, address, spaces, and governance entities.
- Post support/contribution actions.
- Authority escalation actions.
- Post stats hooks.

### Meetings

- Meeting item read/create/update/delete hooks.
- Meeting preview and editor components.

### Governance/geography

- Governance entity explorer/tree hooks and components.
- Scope selector and scope chain hooks.
- Geographic scope selection and search.

### Media

- Attachment upload to Supabase storage.
- Image, PDF, attachment, and media grid viewer components.
- Link-to-attachment utilities and thumbnail helpers.

### External services

- OpenStreetMap Nominatim search and reverse-geocode proxy API routes.
- Mapbox search component.
- Mapillary assets/CSP allowances.
- Sender domain CSP/image/frame allowances.

## Missing functionality or missing repository assets

- No Supabase migrations or schema definitions are tracked.
- No generated Supabase database types are tracked.
- No explicit test suite scripts are defined beyond dependencies being installed.
- `npm run lint` points to `next lint`, which may be incompatible with newer Next.js versions depending on the installed CLI behavior.
- GitHub Actions workflow references `scripts/sync-osm-roads.js`, but that script is not present in tracked files.
- No `vercel.json` or deployment documentation is present.
- No explicit environment variable example file is present.
- No API contract documentation is present outside the new docs.
- No RLS/storage policy documentation is present.

## Technical debt

- Large route files mix data fetching, form state, validation, rendering, and side effects.
- Supabase access is spread across hooks, pages, components, and API routes.
- Some API routes contain repeated validation and ownership logic.
- Console debug logging is present in production-facing helpers/routes.
- Some comments indicate fallback logic that no longer makes sense, such as trying the same `club` table twice.
- The repository uses both `@supabase/auth-helpers-nextjs` and `@supabase/ssr`; auth helper strategy should be clarified.
- UI primitives and product-specific UI coexist in `components/ui`.
- Missing tests increase regression risk.
- Missing database schema artifacts make backend changes risky.

## Bugs noticed

These are potential issues noticed during static review and should be validated before changes:

1. `middleware.js` redirects unauthenticated `/manage/*` requests to `/auth`, but the tracked auth page is `/auth/login`. If `/auth` is not handled elsewhere, this may be a broken redirect.
2. `.github/workflows/osm-sync.yml` calls `scripts/sync-osm-roads.js`, but no tracked `scripts/` directory or script was found.
3. `.github/workflows/osm-sync.yml` uses `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`, while app code uses `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. This may be intentional for the missing script, but it is undocumented.
4. `src/lib/fetch.js` logs request headers and request/response details. If enabled in production, this can expose sensitive Authorization headers in logs.
5. `NetworkStatusBanner` fetches `NEXT_PUBLIC_SUPABASE_URL + "/rest/v1/"` without checking whether the env var is defined first; if missing, it may fetch an invalid URL.
6. OpenStreetMap proxy routes interpolate unencoded query values into upstream URLs. Special characters in `q`, `lat`, or `lng` should be encoded/validated.
7. Nominatim usage may require rate limiting/caching and policy compliance beyond setting a User-Agent.
8. Club creation route has duplicated fallback code that inserts into `club` after a `club` insert failure, suggesting stale migration/refactor logic.

## Performance improvements

1. Add a documented TanStack Query key strategy and consistent query invalidation.
2. Move repeated Supabase query patterns into small repository/service helpers where appropriate.
3. Audit large pages for unnecessary re-renders and split into memoizable components.
4. Add pagination/infinite loading policies for feed, search, governance explorer, and space lists.
5. Cache OSM proxy responses where allowed by usage policy.
6. Use server-side data fetching selectively for SEO-critical public pages.
7. Review image optimization; `images.unoptimized = true` may be intentional but trades off CDN optimization benefits.
8. Review bundle impact of heavy media/map/editor dependencies.

## Security improvements

1. Remove or gate debug logging that can include tokens, request headers, or user identifiers.
2. Add schema validation to all API route inputs, including query parameters.
3. Document Supabase RLS policies and storage policies in the repository.
4. Add CSRF/threat-model notes for API routes that rely on bearer tokens.
5. Confirm `/manage` middleware redirect target and access control coverage.
6. Ensure service-role helper cannot be imported into browser bundles.
7. Validate and encode all external-service query parameters.
8. Add rate limiting or abuse protection to API proxy routes.
9. Document required environment variables and their intended scope.
10. Avoid exposing concrete Supabase project hostnames in broad config unless required.

## Suggested roadmap ordered by priority

### Priority 1: Operational safety and documentation

- Add environment variable documentation and example names.
- Add Supabase schema export or migrations to the repository.
- Document RLS and storage policies.
- Fix or document the missing OSM sync script referenced by GitHub Actions.
- Remove sensitive request/header logging.

### Priority 2: Authentication and access control hardening

- Confirm `/manage` middleware redirect target.
- Standardize auth helpers around the current recommended Supabase SSR package strategy.
- Centralize server-side ownership checks for spaces and clubs.
- Add API input validation for all routes.

### Priority 3: Test foundation

- Add unit tests for pure utilities and schemas.
- Add API route tests for auth/validation/ownership behavior.
- Add smoke tests for critical page routes.
- Add a CI workflow for lint/build/tests.

### Priority 4: Frontend maintainability

- Split large page components into feature-level sections.
- Move product-specific widgets out of `components/ui`.
- Standardize query keys, loading states, and error states.
- Consolidate media/attachment data modeling.

### Priority 5: Performance and product polish

- Audit bundle size and defer heavy editor/map/media dependencies.
- Add pagination/infinite loading where missing.
- Add allowed caching for external service proxy routes.
- Revisit image optimization strategy.
