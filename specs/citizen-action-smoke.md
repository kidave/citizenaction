# Citizen Action browser test plan

## Purpose

Protect the highest-value public journeys before adding authenticated and destructive coverage.

## Authentication

- Open `/auth/login`.
- Verify the authentication entry point is visible.
- Verify the Privacy Policy link is reachable.
- Do not submit a real authentication flow in CI yet.

## Home/feed

- Open `/`.
- Verify the application shell renders and the page has a title.
- Expand later to navigation, feed loading, category filtering, and post interactions.

## Governance

- Open `/governance`.
- Verify the Governance heading is present.
- Verify the Organizations / Positions / People directory control is present.
- Verify the geography focus selector is available.
- Expand later to search, organization records, people, positions, and governance tree navigation.

## Mobile

- Run the public smoke flow at a mobile viewport.
- Verify Governance remains visible and usable without horizontal overflow.
- Expand later to the mobile bottom bar, navigation drawer, dialogs, and responsive tables/lists.

## Future authenticated coverage

Use a dedicated test identity and isolated Supabase environment. Do not use a production admin account in CI. Add tests for:

- Google authentication callback/session persistence.
- Space membership and role controls.
- Create/edit/delete post flows.
- Governance administration.
- File/logo upload replacement and cache invalidation.
- Unauthorized access and RLS-sensitive flows.
