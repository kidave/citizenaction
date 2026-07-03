# Architecture

This document describes the repository as it exists today. It is intentionally descriptive, not prescriptive: it records current behavior without changing application code.

## Overall architecture

Citizen Action is a Next.js Pages Router application backed primarily by Supabase. The frontend is a React application under `src/` with domain-focused pages, components, hooks, schemas, utilities, and Supabase client helpers. The backend surface inside this repository consists of Next.js API routes plus server-side Supabase clients. The database schema itself is not present in the repository; table, view, function, and storage usage can only be inferred from application code.

At runtime, browser code usually talks directly to Supabase with the anon key through `src/lib/supabase/client.js`. API routes use `createServerSupabase()` from `src/lib/supabase/server.js` with an end-user bearer token. A separate Node helper in `src/lib/supabase/node.js` is intended for service-role usage in scripts or Node-only contexts.

## Folder structure

```text
.
├── .github/workflows/        # GitHub Actions workflows
├── public/                   # Static assets, icons, sitemap, images, Mapillary icons
├── src/
│   ├── components/           # UI, layout, domain, feed, governance, space components
│   ├── config/               # Static client configuration such as scope metadata
│   ├── context/              # React context providers
│   ├── hooks/                # Domain-specific client data hooks
│   ├── lib/                  # Shared helpers, Supabase clients, fetch utilities
│   ├── pages/                # Next.js Pages Router pages and API routes
│   ├── schemas/              # Zod schemas and form/update schema helpers
│   ├── styles/               # Global/component CSS
│   └── utils/                # Pure utility functions for dates, feed, media, text, governance
├── middleware.js             # Next.js middleware for protected manage routes
├── next.config.js            # Next.js image and CSP configuration
├── next-sitemap.config.js    # Sitemap generation configuration
├── package.json              # Scripts and dependencies
├── postcss.config.js         # PostCSS configuration
└── tailwind.config.js        # Tailwind configuration
```

## Technology stack

### Core runtime

- Next.js 15.x
- React 19.x
- JavaScript and JSX, with a small number of TypeScript helper files under `src/schemas/helpers/`
- Next.js Pages Router
- Supabase JavaScript client
- Supabase auth helpers for middleware

### Data and state

- Supabase tables, views, RPC functions, auth, and storage
- TanStack Query for client-side query caching
- React Context for auth and media state
- SWR is installed, though TanStack Query appears to be the primary query layer

### Forms and validation

- React Hook Form
- Zod
- Custom schema helpers under `src/schemas/`

### UI and styling

- Tailwind CSS
- Radix UI primitives
- shadcn-style UI components in `src/components/ui/`
- Sonner toasts
- Framer Motion / Motion
- Embla carousel
- Lucide / Tabler / React Icons

### Maps and media

- OpenStreetMap Nominatim via API proxy routes
- Mapbox Search component through `NEXT_PUBLIC_MAPBOX_TOKEN`
- Leaflet / React Leaflet / Maplibre packages
- Mapillary-related assets and API allowances in CSP
- PDF rendering packages and local `public/pdf.worker.min.js`

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
/auth/login                            -> src/pages/auth/login.js
/auth/callback                         -> src/pages/auth/callback.js
/auth/privacy                          -> src/pages/auth/privacy.js
```

### Space and club pages

```text
/space                                 -> src/pages/space/index.js
/space/[space]                         -> src/pages/space/[space].js
/space/[space]/[scopeType]             -> src/pages/space/[space]/[scopeType].js
/space/[space]/[scopeType]/[scopeCode] -> src/pages/space/[space]/[scopeType]/[scopeCode].js
/space/application/[id]                -> src/pages/space/application/[id].js
/apply/space                           -> src/pages/apply/space.js
/apply/space/[space]/club              -> src/pages/apply/space/[space]/club.js
```

### Management pages

```text
/manage/[space]
/manage/[space]/settings
/manage/[space]/[scopeType]/[scopeCode]
/manage/[space]/[scopeType]/[scopeCode]/settings
```

`middleware.js` protects `/manage/:path*` by checking Supabase auth session state.

### API routes

```text
/api/osm
/api/osm-reverse
/api/space/[slug]/club
/api/club/[space]/[scopeType]/[scopeCode]
```

## Authentication flow

Authentication is centralized in `src/context/AuthContext.js`.

1. `AuthProvider` initializes user state by calling `supabase.auth.getSession()`.
2. It subscribes to `supabase.auth.onAuthStateChange()` and updates local React state.
3. `login()` has two modes:
   - if `NEXT_PUBLIC_DEV_AUTH === "true"`, it requires an email and uses email OTP;
   - otherwise, it uses Google OAuth.
4. OAuth and OTP callbacks redirect to `/auth/callback`.
5. `logout()` signs out via Supabase, clears a `userStatus` localStorage entry, clears related TanStack Query cache, and resets local user state.
6. `getAccessToken()` reads the active Supabase session and returns `session.access_token`.
7. API helper `authFetch()` attaches the session JWT as a bearer token.
8. Middleware protects `/manage/*` routes by looking for an active Supabase session.

## Supabase client architecture

### Browser client

`src/lib/supabase/client.js` exports `supabase`, created from:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The browser client configures PKCE flow, persistent sessions, auto-refresh, URL session detection, and browser localStorage accessors.

### Server client

`src/lib/supabase/server.js` exports `createServerSupabase(accessToken)`. It creates a Supabase client with the public URL and anon key, then adds an Authorization header when a user access token is provided. API routes use this helper to perform user-scoped server-side operations.

### Node/service client

`src/lib/supabase/node.js` loads `.env.local`, requires:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

It creates a Node-safe Supabase client with session persistence disabled. This is suitable for trusted scripts, not browser code.

### Storage helper

`src/lib/supabase/storage.js` provides helpers for `post-attachments`:

- upload a file under `userId/timestamp-filename`
- retrieve public URL
- delete by storage path
- categorize file MIME type for display

## Data flow

Typical client-side data flow:

1. A page renders domain components.
2. Components call domain hooks from `src/hooks/`.
3. Hooks use the browser Supabase client to query tables/views, invoke RPCs, or mutate rows.
4. Some hooks and components use TanStack Query for caching and refresh behavior.
5. Auth-sensitive components use `useAuth()` from `AuthContext`.
6. API routes are used when server-side validation, ownership checks, or external service proxying is needed.
7. Supabase realtime is not clearly used in this repository today.

Typical authenticated API flow:

1. Client retrieves a Supabase access token.
2. Client calls `authFetch()` or performs a manual fetch with `Authorization: Bearer ...`.
3. API route creates a Supabase server client with that token.
4. API route verifies the user with `supabase.auth.getUser()`.
5. API route performs database/storage operations under that user's authorization context.

## State management

State management is intentionally lightweight:

- React local state for component state and forms.
- React Context for auth and media.
- TanStack Query for query caching and server-state invalidation.
- Browser localStorage is used by Supabase session persistence and at least one explicit `userStatus` entry in auth logout.
- No Redux/Zustand/MobX-style global store was found.

## Context providers

`src/pages/_app.js` wraps the application with:

1. `QueryClientProvider`
2. `AuthProvider`
3. `MediaProvider`
4. `Layout`
5. `RouteLoader`
6. `ErrorBoundary`
7. `MobileBottomBar`
8. `Toaster`

`AuthProvider` exposes auth state and auth actions. `MediaProvider` should be treated as the app-level media/viewer context; details should be reviewed before changing media behavior.

## Hooks

Hook folders map closely to product domains:

- `src/hooks/feed/` handles feed posts, post CRUD, metadata, permissions, authority actions, meetings, spaces, stats, and editor state.
- `src/hooks/geography/` handles geographic scopes, scope chains, location search, and scope selector state.
- `src/hooks/governance/` handles governance entities, hierarchy/tree views, and authority exploration.
- `src/hooks/meeting/` handles meeting items.
- `src/hooks/space/` handles space membership.
- `src/hooks/user/` handles profiles and user spaces.
- top-level hooks cover mobile detection, spaces, clubs, and auth requirements.

## Shared components

Important reusable areas:

- `components/ui/`: low-level design-system primitives, form fields, dialogs, drawers, cards, carousel, attachment/media viewers, timeline, sidebar, and other reusable UI elements.
- `components/layout/`: global shell, header, footer, sidebars, navigation, logo, profile, responsive/mobile navigation, and layout primitives such as stack/row/inline/container.
- `components/shared/`: cross-domain selectors and map/location widgets.
- `components/skeletons/`: loading skeletons.
- `components/system/`: error boundary, network status banner, and route loader.
- `components/feed/`, `components/governance/`, `components/space/`, and `components/profile/`: domain components.

## API routes

### `/api/osm`

Search proxy for OpenStreetMap Nominatim. Accepts query parameter `q` and returns up to five results with address details.

### `/api/osm-reverse`

Reverse geocoding proxy for OpenStreetMap Nominatim. Accepts `lat` and `lng` query parameters.

### `/api/space/[slug]/club`

Authenticated POST endpoint for creating a club under a space. It verifies a bearer token, fetches the user, checks space ownership, validates geographic scope, prevents duplicate club for the same space/scope, inserts into `club`, and attempts to add the creator to `club_member`.

### `/api/club/[space]/[scopeType]/[scopeCode]`

Authenticated endpoint for club settings. It supports GET, PUT, and DELETE flows, verifies ownership, reads from `club_view`, updates/deletes `club`, and performs best-effort cleanup of `committee-branding` storage files.

## Environment variables used by the application

Application code references these environment variables:

| Variable | Where used | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client, server, node, network banner | Supabase project URL exposed to browser and server code |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client and server helpers | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Node helper | Trusted service-role key for Node-only usage |
| `NEXT_PUBLIC_DEV_AUTH` | Auth context | Switches login to local/dev email OTP mode when set to `true` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox search component | Browser Mapbox search token |
| `NODE_ENV` | Next config | Enables development-only CSP allowances |

GitHub Actions workflow `.github/workflows/osm-sync.yml` references different secret names for a scheduled script:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

That workflow calls `node scripts/sync-osm-roads.js`, but that script is not tracked in this checkout.

## Build process

Package scripts:

```json
{
  "dev": "next dev",
  "build": "next build",
  "postbuild": "next-sitemap",
  "start": "next start",
  "lint": "next lint"
}
```

Expected build flow:

1. install dependencies with npm
2. run `npm run build`
3. Next.js builds the application
4. `postbuild` runs `next-sitemap`
5. serve with `npm start` or deploy through a platform such as Vercel

## Deployment architecture

The codebase is structured like a standard Vercel-compatible Next.js project:

- Pages Router under `src/pages`
- API routes under `src/pages/api`
- root `next.config.js`
- static assets in `public/`
- build script `next build`
- postbuild sitemap generation

Deployment requires Supabase and Mapbox environment variables to be configured in the hosting environment.

## Vercel integration

There is no `vercel.json` in the repository. Vercel integration is therefore likely convention-based:

- framework auto-detected as Next.js
- build command from `package.json`: `next build`
- postbuild sitemap generation via npm lifecycle
- serverless functions generated from `src/pages/api/*`
- middleware generated from `middleware.js`
- environment variables configured in Vercel project settings

If deployed on Vercel, the API routes and middleware should run as Vercel serverless/edge-compatible functions according to Next.js defaults.
