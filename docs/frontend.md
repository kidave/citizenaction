# Frontend

This document describes the current frontend structure. It should be updated whenever routes or major frontend responsibilities change.

## Runtime and routing

The application uses the Next.js Pages Router under `src/pages`.

`src/pages/_app.js` owns the application-wide providers and framework integrations:

```text
_app.js
├── QueryClientProvider
├── ThemeProvider
├── AuthProvider
├── GoogleOneTap
├── MediaProvider
├── Layout
│   ├── RouteLoader
│   ├── ErrorBoundary
│   └── page layout declared by Component.getLayout
├── Toaster
├── Analytics
└── SpeedInsights
```

Pages may define `Component.getLayout` when they require a specific shell. This keeps global layout code route-agnostic.

### Public/top-level pages

```text
/                 index.js
/about            about.js
/action           action.js
/search           search.js
/post/[id]        post/[id].js
/user/[username]  user/[username].js
```

### Auth pages

```text
/auth/login
/auth/callback
/auth/privacy
```

### Space pages

Only active routes should be listed here. Removed Club and scope-specific routes are intentionally omitted.

### Management pages

Management pages live under `/manage/*` and are protected by middleware.

## Layout architecture

`src/components/layout/` contains the global shell and its supporting components.

```text
Layout
└── page-declared layout
    └── AppShell (when requested)
        ├── LeftSidebar
        ├── CenterColumn
        ├── FloatingMenu
        └── RightSidebar (when requested)
```

`Layout` itself is intentionally route-agnostic. Pages decide whether they need the main shell or a special standalone layout.

`AppShell` is also route-agnostic. A page can request the right sidebar with:

```js
Page.getLayout = (page) => <AppShell showRightSidebar>{page}</AppShell>;
```

This prevents route-specific conditions from accumulating inside global layout components.

## Component organization

### Domain components

Current domain areas include feed, governance, geography, space, timeline, user/profile, standards, and related product features.

The project already follows a component + hook pattern in many of these areas:

```text
Page
  ↓
Domain component
  ↓
Domain hook/query/mutation
  ↓
Supabase or protected API
```

### `components/ui/`

This is the shadcn/Radix-oriented design-system layer. New components placed here should be domain-independent.

Product-specific widgets currently coexist here in some places and should be moved gradually into their owning domain rather than introducing new product-specific components into `ui`.

### `components/layout/`

Application shell, navigation, sidebars, logos, profile UI, responsive navigation, and shared layout primitives.

### `components/shared/`

Cross-domain components that are genuinely reused by multiple features.

### `components/system/`

Application-wide infrastructure such as error handling and loading/route infrastructure.

### `components/skeletons/`

Loading placeholders shared by pages and features.

## State and data fetching

### Server state

TanStack Query is the primary server-state library.

New query hooks should:

- use stable, predictable query keys;
- define one canonical query function per resource;
- use consistent invalidation after mutations;
- keep loading/error handling predictable.

### Local state

Use React state for component-local interaction and UI state.

### URL state

Use the URL for state that should be shareable or navigable, such as route identity and appropriate filters.

### Context

React Context should be reserved for cross-cutting state such as authentication and media state.

## Forms and validation

React Hook Form is the preferred form state layer and Zod is the preferred validation layer.

Validation should be shared where the same input crosses frontend and backend boundaries, rather than duplicated as slightly different rules.

## Performance principles

Citizen Action uses a number of heavy browser libraries for maps, media, PDFs, editing, and rich interaction. These should be loaded only where needed.

Prefer:

- dynamic imports for heavy client-only features;
- `next/image` where appropriate;
- stable query caching;
- pagination/infinite queries for growing lists;
- avoiding unnecessary client components;
- keeping the global provider tree small.

## Authentication

Authentication is provided by Supabase Auth.

UI-level checks can control whether actions are visible, but authorization must ultimately be enforced by the backend/database.

Protected operations should have a canonical mutation path rather than separate implementations in multiple components.

## Documentation rule

When a route, feature, or major architectural responsibility is removed or renamed, update this document and the architecture/backend documentation in the same change. The documentation should describe the active repository, not historical architecture.
