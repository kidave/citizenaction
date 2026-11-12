# Citizen Action Component Redundancy and Standardization Audit

**Audit date:** 2026-10-22  
**Status:** Read-only audit; recommendations are not approved implementation work.

## Executive summary

The repository has a useful separation between reusable controls in `src/components/ui/` and feature components for governance, spaces, posts, geography, editor, and administration. The feature components frequently contain real authorization, query, upload, navigation, or domain behavior; replacing those with generic shadcn/ui primitives would lose important application behavior. The best standardization target is shared presentation and pure logic, not domain workflows.

The strongest opportunities supported by implementation and import evidence are:

1. Reduce the number of near-identical adapters around the shared `Topbar` while preserving each area’s breadcrumbs, defaults, and navigation.
2. Consolidate image-compression behavior: the attachment utility is a no-op while a separate media utility performs actual compression, and both are used by production paths.
3. Share repeated date-format and loading/empty-state presentation without changing each caller’s formatting contract or state behavior.
4. Reuse one link-management implementation where the app and story-only UI copy currently diverge, after reconciling their APIs and mobile behavior.
5. Factor repeated geography query construction and editor-layout shells, but leave domain-specific query rules, persistence, permissions, and validation at their current feature boundaries.

No component has been removed, consolidated, or standardized by this audit. Static no-import results are candidates for manual verification, not proof of safe deletion. No application code, tests, configuration, or data were changed.

## Scope, evidence, and classification

Reviewed the existing [Storybook report](./STORYBOOK-REPORT.md) and the relevant prior [performance audit](./docs/performance-audit-2026-08-24.md) first. The Storybook report is the existing record of setup, story coverage, test results, and its source-module inventory. There was no existing `COMPONENT-AUDIT.md`.

The audit used source inspection, repository-wide import/reference searches, route usage, stories, schemas, hooks, and configuration. The findings below distinguish direct code evidence from recommendations. Stories show renderable examples, but are not treated as proof that a component is used by the application or safe to remove.

Classification:

- **Keep / application-specific:** Meaningful business, data, permission, interaction, or feature behavior belongs in the feature layer.
- **Consolidate:** Evidence shows materially repeated implementation or behavior; share the narrow common part.
- **Replace / use existing primitive:** A custom component duplicates an existing primitive without meaningful extra behavior.
- **Shared application pattern:** Repeated page/list/layout presentation should be represented once while retaining feature configuration.
- **Deprecation candidate:** No static app references were found; removal requires dynamic/runtime and product-owner checks.

## Dated change log

### Previously completed work (recorded before this audit)

- The Storybook report records the existing Storybook 10.6.3 setup, Vite alias, application styles and themes, and MCP manifest configuration.
- It records 105 indexed stories, 21 manifest entries with zero docgen errors, and a passing Storybook browser/accessibility suite of 29 files and 105 tests.
- It records stories and isolated mocks for selected UI and feature components. These are coverage work, not component consolidations.

### Newly completed on 2026-10-22

- Performed a read-only redundancy and standardization audit across the component groups, route usage, shared hooks/utilities/schemas, Storybook evidence, and repository-level configuration.
- Recorded evidence-backed duplication groups, shadcn/ui comparisons, architectural recommendations, and unused-component candidates below.
- The audit began on the existing `main` branch with a dirty worktree; preserved those pre-existing changes and added only this audit document.
- Left all application implementation, configuration, tests, branch state, and existing worktree changes untouched.

### Verification and outstanding issues

- **Audit verification:** Static source and reference inspection only. No app, browser, build, or test commands were run for this audit. The Storybook results above are cited from the prior report and were not rerun.
- **Dependency graph:** `.dependency-cruiser.js` defines circular-dependency and orphan rules, but dependency-cruiser is not installed locally. No generated circular/orphan report was available; circular dependencies and dead-code status therefore remain unverified.
- **Inventory reconciliation:** The Storybook report records 272 non-story/non-mock modules across 23 component groups. The existing `component-files.txt` has 275 `src/components/` entries, including three count differences relative to that report: `animation` (2 vs 1), `attachment` (9 vs 8), and `geography` (9 vs 8). Its inclusion/exclusion rules have not been validated, so the discrepancy must be reconciled before treating either count as a definitive current inventory.
- **Manual verification:** Responsive behavior, dynamic imports/registrations, and the no-static-reference candidates below need runtime or owner confirmation before implementation.

## Component inventory

The group counts and story-coverage notes in the first table are the **previously recorded** Storybook inventory, not a freshly generated count; see the reconciliation issue above. Paths are directory scopes. Representative paths and live-use evidence show how each area participates in the application. The detailed module/story lists remain in [STORYBOOK-REPORT.md](./STORYBOOK-REPORT.md).

| Group / path | Recorded modules | Purpose and usage evidence | Classification and recommendation |
|---|---:|---|---|
| `src/components/ui/` | 62 | Shared controls, wrappers, feedback, layout, and utilities; examples include `SearchableSelect` in governance selectors and `MenuButton` in post/document headers. | **Keep/shared.** Prefer existing shadcn primitives; audit app-integrated components separately from primitives. |
| `src/components/layout/` | 16 | App shell, navigation, sidebars, menus, and shared `Topbar`; routes and domain header adapters consume these. | **Shared application pattern.** Keep the canonical shell and consolidate repeated adapters/configuration. |
| `src/components/governance/` | 31 | Governance directory, entities, positions, appointments, resources, and mutation flows; consumed by governance pages and admin/editor flows. | **Keep/application-specific.** Share presentation/query construction only where evidence confirms equivalence. |
| `src/components/editor/` | 27 | Post/document editing, content blocks, metadata, attachments, and editor layout. The feed composes editor workflows; hooks own associated state. | **Keep/application-specific.** Preserve Editor.js integrations, persistence, permissions, and validation; share only layout shells. |
| `src/components/space/` | 22 | Space cards, members, settings, activity, applications, and timeline views; used by space pages, search, and application routes. | **Keep/application-specific.** Consolidate repeated shells, not space policy or data behavior. |
| `src/components/standards/` | 19 | Classification browsing, tree/table, toolbar, pagination, and code actions; used by standards pages and admin routes. | **Keep/shared pattern.** Reuse table primitives while verifying responsive behavior and hidden-column handling. |
| `src/components/skeletons/` | 15 | Feature-specific placeholders for feeds, profiles, posts, spaces, and settings. | **Keep/shared application pattern.** Standardize consistent geometry where appropriate; retain context-specific shapes. |
| `src/components/post/` | 13 | Post display, actions, links, attachments, share, map, and modal behavior; used by feed, document, and timeline features. | **Keep/application-specific.** Share action-menu presentation with contribution flows, preserving permissions and confirmations. |
| `src/components/admin/` | 11 | Admin dashboards, geography/governance tools, user lists, and space-application review. | **Keep/application-specific.** Consolidate list shells and shared headers; retain administrative authorization and mutations. |
| `src/components/system/` | 10 | App-level providers, logo, network status, errors, and system interactions. | **Keep/shared.** Preserve provider, runtime, and accessibility behavior. |
| `src/components/user/` | 10 | Profile, posts, spaces, contributions, and identity presentation. | **Keep/application-specific.** Share empty-state scaffolding but retain user/profile semantics. |
| `src/components/geography/` | 8 | Geography selection/search, maps, location previews, and selected-location UI. | **Keep/application-specific.** Share boundary query construction only; preserve picker versus hierarchical/map workflows. |
| `src/components/attachment/` | 8 | Local attachment selection, previews, grids, carousels, and image picking. | **Keep/shared media.** Do not conflate multi-file local attachments with storage-backed single-image uploads. |
| `src/components/contribution/` | 4 | Contribution cards, drawer, avatars, and post contribution interactions. | **Keep/application-specific.** Share action-menu presentation with post actions; leave policy and mutation ownership to callers. |
| `src/components/feed/` | 4 | Feed composition, filters, create trigger, and animation. | **Keep/application-specific.** Preserve feed query/filter semantics. |
| `src/components/link/` | 3 | App link management, dialog, and row editing. | **Keep/application-specific.** Resolve duplication with the story-only UI copy; verify edit persistence before standardizing. |
| `src/components/auth/` | 3 | Authentication presentation and provider integrations. | **Keep/application-specific.** Preserve auth-provider and routing behavior. |
| `src/components/document/` | 1 | Document header and authored-document presentation. | **Keep/application-specific.** Reuse menu primitives, not document-specific context and permissions. |
| `src/components/calendar/` | 1 | Action-date selection. | **Keep/shared** if consumers require it; verify actual consumer coverage before treating as app-wide standard. |
| `src/components/application/` | 1 | Application-specific topbar adapter. | **Shared application pattern.** Candidate to collapse into the common topbar configuration. |
| `src/components/activity/` | 1 | Activity preview used in space timeline and activity tabs. | **Keep/application-specific.** Preserve its rendering and animation behavior. |
| `src/components/about/` | 1 | About-page content. | **Keep/application-specific.** |
| `src/components/animation/` | 1 | Lottie and motion helpers. | **Keep/shared** pending the module-count reconciliation; dynamically loaded animation dependencies are reported in use. |

The inventory totals above intentionally preserve the previous report's values and avoid implying that each group has been independently counted in this audit. There are also 77 hook modules, 22 utility modules, five schema modules, two contexts, one service, and seven config modules in the source inventory. Hooks and schemas are not UI primitives: keep data access, validation, and permission rules aligned with their feature domains, and consolidate only equivalent pure logic.

## Evidence-backed duplication and standardization groups

### 1. Header adapters around `Topbar`

Several feature headers forward nearly identical props to the shared `Topbar`: [AdminPageHeader.jsx](./src/components/admin/AdminPageHeader.jsx), [StandardsTopbar.jsx](./src/components/standards/StandardsTopbar.jsx), [UserTopbar.jsx](./src/components/user/UserTopbar.jsx), [ApplicationTopbar.jsx](./src/components/application/ApplicationTopbar.jsx), [GovernancePageHeader.jsx](./src/components/governance/GovernancePageHeader.jsx), and [SpaceTopbar.jsx](./src/components/space/SpaceTopbar.jsx). Their pages actively consume the adapters; for example, [pages/application/space/[id].js](./src/pages/application/space/[id].js#L11) and [pages/standards/index.jsx](./src/pages/standards/index.jsx#L8) import their area headers. The shared implementation is [Topbar.jsx](./src/components/layout/Topbar.jsx).

**Recommendation:** Keep `Topbar` canonical and simplify identical forwarding wrappers into configuration or thin adapters. Preserve admin/governance breadcrumbs, default titles, the governance Home item, and area-specific route behavior. Before changing action APIs, verify that `primaryActions` and `overflowActions` remain distinct: the current implementation combines them and renders the first three inline ([Topbar.jsx](./src/components/layout/Topbar.jsx#L95), [Topbar.jsx](./src/components/layout/Topbar.jsx#L162)). On narrow widths, fixed inline actions can crowd the title.

**Risk / effort:** Low–medium / small. Validate navigation, action ordering, breadcrumbs, keyboard names, and narrow viewports.

### 2. Image compression implementations

There are two different `compressImage` exports:

- [utils/attachment/compressImage.js](./src/utils/attachment/compressImage.js#L1) returns the original file unchanged.
- [utils/media/compressImage.js](./src/utils/media/compressImage.js#L1) performs actual raster resizing/compression and handles SVG/GIF, canvas failures, output size, and browser errors.

Both are on production paths. [useAttachmentProcessor.js](./src/hooks/useAttachmentProcessor.js#L6) imports the no-op implementation and invokes it by default ([useAttachmentProcessor.js](./src/hooks/useAttachmentProcessor.js#L38)); [ImagePicker.jsx](./src/components/attachment/ImagePicker.jsx#L13) uses the same no-op. Meanwhile [storage.js](./src/lib/supabase/storage.js#L2) calls [prepareAttachment.js](./src/utils/media/prepareAttachment.js#L1), which uses the real compressor.

**Recommendation:** Make a single compression implementation canonical after confirming import/API compatibility and browser behavior. This is a behavior correction, not merely dead-code cleanup: callers configured to compress currently receive the original image on the attachment utility path. Add focused tests for unchanged formats, file-size outcomes, and unavailable browser APIs before changing any consumer.

**Risk / effort:** Medium / small–medium. Changes affect file bytes, MIME type/name, upload size, and storage flows. Do not alter storage or uploads as part of a generic primitive cleanup.

### 3. Date formatting

Several modules independently format dates. Two member-application routes contain effectively identical `Intl.DateTimeFormat("en-GB", { day, month, year })` helpers at [application/member/[id].js](./src/pages/space/%5Bspace%5D/application/member/%5Bid%5D.js#L178) and [admin/application/member/[id].js](./src/pages/space/%5Bspace%5D/admin/application/member/%5Bid%5D.js#L246). Similar local helpers exist in [SpaceMemberApplications.jsx](./src/components/space/SpaceMemberApplications.jsx#L134) and [MemberCard.jsx](./src/components/space/MemberCard.jsx#L135). A shared `date-fns` formatter already provides relative and absolute modes in [formatDate.js](./src/utils/date/formatDate.js#L3), while feed date state has separate countdown/business-state behavior in [getPostDateState.js](./src/utils/feed/getPostDateState.js#L37).

**Recommendation:** Consolidate only equivalent display formats behind named options or small shared helpers. Preserve locale, invalid-date behavior, relative-vs-absolute choice, and feed status/countdown semantics; do not route all date logic through one ambiguous formatter.

**Risk / effort:** Low–medium / small. Verify valid, invalid, absent, timezone-boundary, relative, and absolute values.

### 4. App and UI link managers

[components/ui/LinkManager.jsx](./src/components/ui/LinkManager.jsx#L22) implements link resolution and dialog/list behavior, while the application uses [components/link/LinkManager.jsx](./src/components/link/LinkManager.jsx#L19), [LinkManagerDialog.jsx](./src/components/link/LinkManagerDialog.jsx#L17), and [LinkRow.jsx](./src/components/link/LinkRow.jsx#L19). App consumers include [EditorFooter.jsx](./src/components/editor/EditorFooter.jsx#L7) and [GovernanceResourceDialogs.jsx](./src/components/governance/GovernanceResourceDialogs.jsx#L8). The UI implementation is referenced by its Storybook story; a static scan found no application consumer for that copy.

**Recommendation:** Designate the application implementation as the candidate canonical integration, then migrate or remove the UI copy only after comparing exported props, story requirements, link-resolution behavior, and keyboard/mobile behavior. The app trigger needs an accessible name, and both copies hide reorder controls at small widths; do not silently lose any interaction.

**Risk / effort:** Medium / low–medium. Component API and mobile reordering require explicit verification.

### 5. Loading, error, and empty-state shells

[empty-state.jsx](./src/components/ui/empty-state.jsx#L3) and [error-state.jsx](./src/components/ui/error-state.jsx#L3) use substantially the same centered layout but communicate different states. Both are used by governance directories, e.g. [PositionDirectory.jsx](./src/components/governance/PositionDirectory.jsx#L124). The separate compound [empty.jsx](./src/components/ui/empty.jsx#L4) offers composition and is story-referenced; it is not automatically a duplicate of either state API.

Repeated page-level loading markup also appears in application/space pages, while user posts/spaces/contributions repeat centered empty scaffolding. Admin list components repeat embedded-vs-page container sizing in [AdminUserList.jsx](./src/components/admin/user/AdminUserList.jsx#L31) and [AdminSpaceApplications.jsx](./src/components/admin/space/AdminSpaceApplications.jsx#L17).

**Recommendation:** Share only the common visual shell and keep distinct empty/error/loading semantics and caller-owned text. Ensure dynamic errors are announced: `ErrorState` currently has no `role="alert"` or live-region attribute. Avoid converting all state components into one generic component with a mode string.

**Risk / effort:** Low / small. Test accessibility announcements, layout height, and embedded/page variants.

### 6. Duplicate action-menu presentation

Post and contribution flows both provide Edit/Delete dropdown actions: [PostHeader.jsx](./src/components/post/PostHeader.jsx#L56) uses [MenuButton.jsx](./src/components/ui/MenuButton.jsx#L9), while [ContributionCard.jsx](./src/components/contribution/ContributionCard.jsx#L34) uses [PostActions.jsx](./src/components/post/PostActions.jsx#L13). Confirmation is not equivalent: `MenuButton` owns a confirmation dialog, while contribution deletion confirms in its caller.

**Recommendation:** Consider a shared action-menu presentation that receives permitted actions and callbacks, but leave authorization, confirmation timing, pending state, and mutations with the domain/caller. `MenuButton` also has document/post-specific optional actions and should not be treated as a purely generic primitive without first splitting that behavior.

**Risk / effort:** Medium / small–medium. Confirm permissions, pending behavior, keyboard support, and existing action semantics.

### 7. Editor layouts

[PostEditorLayout.jsx](./src/components/editor/PostEditorLayout.jsx#L5) and [DocumentEditorLayout.jsx](./src/components/editor/DocumentEditorLayout.jsx#L5) have the same basic structure; the document version uses a semantic `<main>`.

**Recommendation:** Extract a layout shell only if it preserves the semantic landmark difference, responsive constraints, and editor-specific controls. Keep authoring flows and state independent.

**Risk / effort:** Low / small.

### 8. Geography query construction

[GeographyPicker.jsx](./src/components/geography/GeographyPicker.jsx#L28) and [AddGeographyDialog.jsx](./src/components/geography/AddGeographyDialog.jsx#L125) query geographies with overlapping category, optional type, and name-search criteria. The latter uses paginated/infinite loading and hierarchical/map selection; the picker uses a fixed 80-row limit.

**Recommendation:** Extract only a pure query/filter builder after confirming result ordering, pagination, category constraints, and empty/search behavior. Keep the two workflows separate.

**Risk / effort:** Medium / medium. Supabase query shape and pagination are dependencies.

### 9. Link row editing does not persist changes

[LinkRow.jsx](./src/components/link/LinkRow.jsx#L19) accepts and calls `onUpdate`, but [LinkManagerDialog.jsx](./src/components/link/LinkManagerDialog.jsx#L93) does not pass that callback. The editor hook [useLinkManager.js](./src/hooks/editor/useLinkManager.js#L136) exposes no update operation. The edit UI therefore closes without persisting the changed title/description.

**Recommendation:** In a separately approved implementation, either wire an update through the hook and dialog or remove the misleading edit control. Preserve existing link-resolution, authorization, and persistence behavior.

**Risk / effort:** Medium / low. Confirm database/API update semantics and add a focused interaction test.

### 10. User/admin empty and loading layouts

User posts, spaces, and contributions repeat the same centered empty-state scaffold while the content/message differs: [UserPosts.jsx](./src/components/user/UserPosts.jsx#L26), [UserSpaces.jsx](./src/components/user/UserSpaces.jsx#L26), and [UserContributions.jsx](./src/components/user/UserContributions.jsx#L49). Admin user/space-application lists repeat centered loading and container-size variants.

**Recommendation:** Prefer the shared state components or a narrowly scoped list shell; preserve each feature’s wording and embedded-vs-full-page dimensions. This overlaps with finding 5 and should be handled as one design task.

**Risk / effort:** Low / small.

### 11. Other evidence-backed accessibility and responsive risks

- [MemberCard.jsx](./src/components/space/MemberCard.jsx#L71) reveals the full member introduction only on mouse hover; there is no equivalent focus/touch interaction.
- [TimelineControls.jsx](./src/components/space/timeline/TimelineControls.jsx#L37) visually indicates the selected timeline layout but does not expose a programmatic selected state such as `aria-pressed`.
- The app link-manager trigger in [components/link/LinkManager.jsx](./src/components/link/LinkManager.jsx#L41) lacks an explicit accessible name; the story-only UI copy has one.
- [ImageUpload.jsx](./src/components/ui/ImageUpload.jsx#L298) renders upload error text without an alert/live-region role.
- The standards toolbar and data-table responsive/hidden-column concerns are detailed above.

These are audit findings, not claims that remediation has occurred. Verify the intended interaction and supported assistive-technology behavior before changing APIs.

**Risk / effort:** Low–medium / small. Accessibility and viewport regression tests should accompany any approved fix.

## Custom components versus existing shadcn/ui primitives

| Component/pattern | Existing equivalent | Audit judgment |
|---|---|---|
| `SearchableSelect.jsx` | `Popover` + `Command` composition; ordinary `Select` is also present | Not a proven duplicate. It implements searchable selection and has governance consumers; retain its behavior and document when to use it versus `Select` or `Combobox`. |
| `combobox.jsx` and `select.jsx` | Base UI/Radix-backed selection primitives | Similar surface area does not establish equivalent semantics. Keep separate until supported keyboard, filtering, and value behaviors are compared. |
| `ConfirmDialog.jsx` | `alert-dialog.jsx` | A useful thin composition for common destructive confirmation copy/style, not a replacement for generic `dialog.jsx`. Reuse it where pending/loading behavior can be represented safely. |
| `ui/LinkManager.jsx` | `components/link/LinkManager.jsx` + dialog/row | These are feature implementations, not shadcn primitives. Prefer one canonical app integration after API and story migration checks. |
| `ui/ImageUpload.jsx` | `attachment/ImagePicker.jsx` | Not duplicates: `ImageUpload` handles a storage-backed single image and deletion; `ImagePicker` processes local multi-file attachments. Preserve both roles. |
| `MenuButton.jsx` | Dropdown menu and alert-dialog primitives | It composes primitives but adds app-specific relation/geography actions and confirmation. Split generic presentation from domain actions only if consumers demonstrate a stable shared contract. |
| `ErrorState` / `EmptyState` | Existing UI feedback components | Share shell/layout; keep semantically distinct components and accessible announcements. |
| Governance/standards tables and toolbars | Existing table, pagination, select, and button primitives | Prefer these primitives over new parallel base controls; do not replace feature query/filter rules with generic blocks. |

## Proposed shared layout and design-pattern architecture

1. **Primitive layer — `src/components/ui/`:** shadcn/Base UI/Radix-backed controls and small composition wrappers. Keep APIs focused on interaction/accessibility, not Supabase or domain mutations. Prefer existing `Button`, `Dialog`/`AlertDialog`, `DropdownMenu`, `Select`, `Popover`, `Command`, `Table`, and form primitives before adding another abstraction.
2. **Application-pattern layer — shared layout/status/table patterns:** one configurable topbar/header, list/page shell, and consistent empty/loading/error presentation. Feature adapters may supply breadcrumbs, title, actions, and layout semantics; avoid duplicating wrappers whose only purpose is prop forwarding.
3. **Feature presentation — `src/components/<domain>/`:** render domain concepts and compose primitives/application patterns. Keep route-specific responsive behavior and domain-specific interaction where evidence indicates different semantics.
4. **Feature hooks and schemas — `src/hooks/` and `src/schemas/`:** keep Supabase calls, query keys, mutations, authorization, form validation, and cache behavior in the owning domain. Reuse only identical pure transformations/query construction and keep database contracts explicit.
5. **Pure utilities — `src/utils/`:** canonical date, media, text, and status helpers with tests for their contracts. Avoid duplicate same-named helpers in other domains; retain distinct behavior as named functions/options.

### Design consistency observations

- Color, radius, and application theme tokens are centralized in `tailwind.config.js` and `src/styles/main.css`; use tokens rather than literal colors for shared primitives.
- Some list/status layouts and fixed-width toolbar controls differ across feature surfaces. The standards table has a fixed-width search control and a non-wrapping toolbar; the empty table cell spans `columns.length` while rows use visible columns ([toolbar.jsx](./src/components/standards/code-table/toolbar.jsx#L15), [data-table.jsx](./src/components/standards/code-table/data-table.jsx#L97)). Verify hidden-column alignment and small viewports before refactoring.
- `Topbar` overflow action grouping and fixed inline controls need narrow-width and keyboard verification before consolidating adapters.
- No recommendation here changes spacing, typography, colors, or breakpoints globally; establish visual baselines per pattern first.

## Confirmed unused and potentially unused files

### Confirmed unused

**None confirmed.** Static searches cannot prove a file is unused when dynamic imports, framework conventions, manual registration, or external consumers may exist. No deletion is recommended based solely on absent direct imports.

### Potentially unused — verify before removal

The following had no non-story static application import in the scoped scan; several are nevertheless referenced by Storybook. Confidence is **medium-high for no static app import**, but not a claim of runtime dead code:

- UI candidates: [back-button.jsx](./src/components/ui/back-button.jsx), [button-group.jsx](./src/components/ui/button-group.jsx), [date-time.jsx](./src/components/ui/date-time.jsx), [empty.jsx](./src/components/ui/empty.jsx), [hover-card.jsx](./src/components/ui/hover-card.jsx), [InlineLinkInput.jsx](./src/components/ui/InlineLinkInput.jsx), [LinkManager.jsx](./src/components/ui/LinkManager.jsx), [navigation-menu.jsx](./src/components/ui/navigation-menu.jsx), [progress.jsx](./src/components/ui/progress.jsx), [slider.jsx](./src/components/ui/slider.jsx), [toggle-group.jsx](./src/components/ui/toggle-group.jsx).
- Attachment candidate: [AttachmentGrid.jsx](./src/components/attachment/AttachmentGrid.jsx) (no import/use found in static scan).
- Feature candidates: [GeographySearch.jsx](./src/components/geography/GeographySearch.jsx), [GovernanceAppointmentAddressSheet.jsx](./src/components/governance/GovernanceAppointmentAddressSheet.jsx), [GovernanceEditorResources.jsx](./src/components/governance/GovernanceEditorResources.jsx), [GovernanceOrganizationSelector.jsx](./src/components/governance/GovernanceOrganizationSelector.jsx), [GovernanceResources.jsx](./src/components/governance/GovernanceResources.jsx), [SpaceSelectorDrawer.jsx](./src/components/space/SpaceSelectorDrawer.jsx) (no repository import/render reference found in static scans).

**Required evidence before deprecation:** inspect dynamic imports, exports/barrels, route and registration conventions, feature flags, Storybook/docs consumers, and any external consumers; ask the owning feature maintainer; then run targeted tests/build and compare runtime routes. Keep story-only components if Storybook coverage is still an explicit product requirement.

## Risk, dependencies, and relative effort

| Recommendation | Benefit | Risk | Dependencies | Effort |
|---|---|---|---|---|
| Canonicalize compression implementation | Restore consistent compression behavior and remove split ownership | Medium: file bytes/MIME/name and upload path can change | Browser APIs, upload/storage behavior, hook consumers, tests | Small–medium |
| Consolidate topbar adapters | Reduce repeated wrappers and keep action/header behavior consistent | Low–medium: navigation, breadcrumbs, title, and action ordering | Route consumers, Topbar props, responsive/accessibility checks | Small |
| Share date formatting | Reduce duplicated output and locale drift | Low–medium: relative/absolute and timezone/invalid-date differences | Call-site contract review and date tests | Small |
| Reconcile link managers | Avoid divergent link editing and resolution behavior | Medium: API, data resolution, mobile reorder, accessible trigger | Editor and governance consumers, Supabase mock/story | Low–medium |
| Share state/list shells | Consistent feedback and loading geometry | Low: live-region semantics and embedded dimensions | Existing UI states, page/list consumers | Small |
| Share action menu presentation | Reduce post/contribution action UI drift | Medium: caller-owned permission/confirmation/pending behavior | Post/contribution hooks and menus | Small–medium |
| Extract geography query builder | Reduce duplicated filters while preserving domain flow | Medium: query shape/pagination/order | Supabase schema, geography pages, infinite query tests | Medium |
| Deprecate no-static-use candidates | Lower maintenance only if genuinely unused | Medium until runtime/external usage is excluded | Dynamic imports, routes, docs, owners | Small per file to verify |

## Phased implementation plan (requires separate approval)

1. **Baseline and contracts:** confirm inventory counts; add or identify focused tests for compression, dates, topbar actions, link updates, query filters, and accessible status states. Record existing output and route behavior.
2. **Low-risk pure reuse:** consolidate equivalent date formatting and shared loading/empty shells, retaining exact locale, invalid-input, semantic, and embedded-layout behavior.
3. **High-value behavior alignment:** select one compression implementation and migrate both attachment consumers; validate MIME/name/size and Supabase storage behavior before removing the no-op export.
4. **Application pattern consolidation:** reduce topbar adapters and share editor/list shells; verify each route’s breadcrumb/title, semantic landmarks, action ordering, and responsive layout.
5. **Feature-level duplication:** reconcile link managers and action menus; then factor only the common geography query builder while preserving permissions, mutations, pagination, and route semantics.
6. **Unused-candidate review:** resolve every candidate against dynamic/runtime and external usage; remove only after owner approval and targeted verification. Do not use Storybook coverage alone as the deletion criterion.
7. **Visual/accessibility regression pass:** run targeted Storybook tests/build, relevant route/component tests, responsive browser checks, and production build in an approved implementation task. Compare the previously recorded Storybook results; do not weaken a11y checks.

## Highest-value opportunities and evidence still needed

1. **Compression:** direct source evidence shows a no-op utility on two production paths and a separate real implementation on a storage path. Before implementation, establish the desired compression contract and test file metadata and storage side effects.
2. **Topbar:** six adapters share one implementation, and real pages import them. Before implementation, inventory every adapter-specific default, breadcrumb, action list, and narrow-screen state.
3. **Date/state patterns:** matching route-local date helpers and repeated user/admin empty/loading shells are visible. Before implementation, map locale/timezone semantics and accessibility behavior.
4. **Link editing:** app and UI copies differ; the UI copy is story-referenced while the feature implementation is used by editor/governance. Before implementation, verify the story API, edit persistence, accessible trigger name, and mobile reorder controls.
5. **Geography:** query criteria overlap, but the picker and dialog have different pagination and selection workflows. Before implementation, compare result ordering, filters, and infinite-load edge cases.
6. **Potentially unused components:** absent static imports are only a clue. Before implementation, run a proper dependency graph (install/use only through the project’s approved dependency process), inspect framework/dynamic registrations and route traces, and get feature-owner confirmation.

## Components that should remain custom

- Governance directory/entity/appointment components and hooks: government organization relationships, appointments, geography scopes, permissions, and resource mutations are domain logic.
- Geography pickers/maps: hierarchical boundary semantics, map behavior, filtering, and Supabase queries are not generic select behavior.
- Editor and post authoring components: Editor.js integrations, post/document schemas, attachment management, drafts, and permission rules should remain feature-owned.
- Space membership/application, timeline, and feed components: application state, eligibility, mutation rules, timeline aggregation, and feed filters are application behavior.
- `ImageUpload`: single-image storage upload/replacement/removal is not interchangeable with a local multi-file attachment picker.
- `MenuButton`: current confirmation and optional domain actions exceed a bare dropdown primitive; split only if callers establish a reusable, permission-safe API.

## Scope limits

This document is an audit and proposal, not an implementation authorization. Runtime-only references, external consumers, feature-flagged routes, database behavior, browser-specific responsive issues, and product intent for Storybook-only primitives require manual verification. Preserve public component props, permissions, Supabase interactions, accessibility, and application behavior in any later approved changes.
