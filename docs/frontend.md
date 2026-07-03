# Frontend

This document describes the current frontend structure and opportunities to simplify it without changing behavior.

## Page hierarchy

The application uses Next.js Pages Router under `src/pages`.

### Global wrapper

`src/pages/_app.js` configures global styles, React Query, auth/media context providers, layout, error boundary, route loader, mobile navigation, and global toast rendering.

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

### Space/club pages

```text
/space
/space/[space]
/space/[space]/[scopeType]
/space/[space]/[scopeType]/[scopeCode]
/space/application/[id]
/apply/space
/apply/space/[space]/club
```

### Management pages

```text
/manage/[space]
/manage/[space]/settings
/manage/[space]/[scopeType]/[scopeCode]
/manage/[space]/[scopeType]/[scopeCode]/settings
```

These routes are protected by middleware at the `/manage/:path*` level.

## Component hierarchy

### Application shell

```text
_app.js
└── QueryClientProvider
    └── AuthProvider
        └── MediaProvider
            └── Layout
                ├── RouteLoader
                ├── ErrorBoundary
                │   ├── page component
                │   └── MobileBottomBar
                └── Toaster
```

### Layout components

`src/components/layout/` contains the shell and layout primitives:

- `Layout`
- `Header`
- `Footer`
- `Navigation`
- `LeftSidebar`
- `RightSidebar`
- `MobileBottomBar`
- `MobileFloatingDock`
- `Logo`, `LogoSwitcher`
- `Profile`
- `PageBreadcrumbs`
- primitive layout helpers: `Container`, `Center`, `Row`, `Stack`, `Inline`

### Feed components

`src/components/feed/` is the largest domain-specific area. It includes:

- feed rendering: `Feed`, `CreatePostTrigger`, `MenuButton`, `PostShareButton`
- post card sections: header, content, metadata, timeline, attachments, actions, footer
- post editor sections: modal, header, content, metadata, address, date/time, type selector, authority selector, attachments, timeline
- post meeting components
- post activity preview components

### Governance components

Governance UI includes authority cards, explorer/search modals, selector modals, entity type selector, hover cards, and avatar groups.

### Shared cross-domain components

`src/components/shared/` includes selectors and location/map widgets:

- location search inputs
- Mapbox location search
- Leaflet map preview
- scope selector/combobox/modal
- space selector
- featured space card
- post calendar actions

### Reusable UI components

`src/components/ui/` contains a design-system-like layer. It combines primitive wrappers around Radix UI patterns with custom media and display components.

Examples:

- form controls: button, input, textarea, select, checkbox, switch, label, field, form
- overlays: dialog, drawer, sheet, popover, tooltip, hover-card, alert-dialog, dropdown-menu
- display: card, badge, avatar, skeleton, metric-card, timeline, focus-cards
- navigation/layout: accordion, tabs, navigation-menu, sidebar, carousel
- media: AttachmentPicker, AttachmentViewer, Attachments, ImageGrid, ImageViewer, PDFViewer, UnifiedMediaGrid, AutoImageCarousel

## Design patterns

### Domain hooks + domain components

The code generally separates Supabase access into hooks and presentation into components. Feed, governance, geography, meeting, space, and user code follow this pattern.

### Modal-heavy editing flows

Post creation/editing and timeline editing are modal-driven. Editor state appears to be centralized in `usePostEditor`, with specific editor subcomponents for sections of a post.

### Supabase-first data access

Most frontend data access goes directly to Supabase from hooks using the browser client. API routes are reserved for operations needing server-side verification or external API proxying.

### Utility-based styling

The UI uses Tailwind utility classes heavily, supported by a shadcn-like component layer.

### Responsive/mobile support

There are explicit mobile components such as `MobileBottomBar`, `MobileFloatingDock`, and `use-mobile.jsx`.

## Opportunities to simplify the frontend

These are documentation findings only; no behavior was changed.

1. **Split large route components.** Several page files are large enough to make routing, data fetching, forms, and presentation hard to reason about. Good candidates include:
   - `src/pages/manage/[space]/settings.js`
   - `src/pages/apply/space.js`
   - `src/pages/apply/space/[space]/club.js`
   - `src/pages/space/index.js`
   - `src/pages/search.js`
   - `src/pages/space/[space]/[scopeType].js`

2. **Document or consolidate form schemas.** Zod schemas exist, but some validation is still inline in API routes and pages. Over time, shared validation between frontend forms and API routes could reduce drift.

3. **Create a clear feature-module boundary.** Current code is partly domain-grouped by hooks/components, but pages still compose many responsibilities. Feature folders could eventually group page-level components, hooks, schemas, and utilities by domain.

4. **Standardize server-state patterns.** TanStack Query is installed and used globally, while some code directly calls Supabase in effects or handlers. A clear policy for query keys, invalidation, and loading/error handling would simplify maintenance.

5. **Reduce duplicate media handling.** There are many media/attachment components and media utilities. A single documented media model would help avoid duplicated normalization and preview logic.

6. **Standardize protected actions.** `ProtectedButton`, `useRequireAuth`, middleware, and manual auth checks all appear to coexist. A single auth boundary pattern could reduce surprises.

7. **Audit design-system ownership.** `src/components/ui/` is broad and includes both low-level primitives and product-specific widgets. Moving product-specific widgets out of `ui` would make the reusable layer clearer.
