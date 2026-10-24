# Storybook Setup and Component Coverage Report

## Summary

Citizen Action retains its Storybook 10.6.3 `@storybook/nextjs-vite` framework and existing addons. The `@/` Vite alias, application stylesheet and theme variables, and light/dark/space/vintage theme toolbar are configured. `@storybook/addon-mcp` is installed and the components manifest feature remains enabled.

The latest Storybook build indexed 105 stories and generated a clean manifest with 21 documented component entries and zero docgen errors. The strict browser/a11y suite passed all 105 tests. The three previously unrepresented UI integrations—BackButton, ImageUpload, and LinkManager—now have stories and use router or local Supabase mocks. No story calls production APIs or mutates production data.

## Inventory and Coverage

There are 272 non-story, non-mock JavaScript/JSX/TypeScript modules under `src/components/` in 23 groups. Current group counts:

| Group | Modules |
| --- | ---: |
| about | 1 |
| activity | 1 |
| admin | 11 |
| animation | 1 |
| application | 1 |
| attachment | 8 |
| auth | 3 |
| calendar | 1 |
| contribution | 4 |
| document | 1 |
| editor | 27 |
| feed | 4 |
| geography | 8 |
| governance | 31 |
| layout | 16 |
| link | 3 |
| post | 13 |
| skeletons | 15 |
| space | 22 |
| standards | 19 |
| system | 10 |
| ui | 62 |
| user | 10 |

All 62 modules in `src/components/ui/` are imported by the UI stories. Coverage includes button variants/sizes, cards, form controls, feedback and empty/loading/error states, navigation/layout primitives, overlays, and utilities. Important interaction stories cover buttons, checkboxes, dialogs, link management, and image upload.

Fifteen feature/shared modules have direct stories, prioritized across the requested areas:

- Geography: `LocationSearchInput`, `SelectedLocation`.
- Spaces: `MemberCard`, `SpaceCard`.
- Editor: `EditorDateTime`, `EditorWarning`.
- Governance: `GovernanceAvatarGroup`, `GovernanceDirectoryCard`, `GovernancePageHeader`, `GovernancePositionTimeline`.
- Shared layout: `Topbar`.
- Activity, Admin breadcrumb, Feed animation, and Post metadata.

The Storybook index contains 63 UI stories, 34 feature/shared stories, and 8 existing starter-example stories (105 total). Story groups excluded from MCP remain available in the Storybook sidebar and test suite.

### Modules without an individual story import

The following 195 modules are not yet directly imported by an individual story. This is a file-level inventory; it includes nonvisual helpers, provider/context modules, and utilities that do not themselves need stories.

| Group | Modules |
| --- | --- |
| about (1) | `About.jsx` |
| admin (10) | `AdminDashboard.jsx`, `AdminGeography.jsx`, `AdminGovernanceBranding.jsx`, `AdminGovernanceChangeReview.jsx`, `AdminGovernanceChanges.jsx`, `AdminPageHeader.jsx`, `AdminSpaceApplicationReview.jsx`, `AdminSpaceApplications.jsx`, `AdminUserList.jsx`, `GeographyEditor.jsx` |
| animation (1) | `DotLottieAnimation.jsx` |
| application (1) | `ApplicationTopbar.jsx` |
| attachment (8) | `AttachmentCard.jsx`, `AttachmentCarousel.jsx`, `AttachmentGrid.jsx`, `AttachmentPreview.jsx`, `AutoImageCarousel.jsx`, `DocumentPicker.jsx`, `EmblaCarousel.jsx`, `ImagePicker.jsx` |
| auth (3) | `AuthCard.jsx`, `GoogleOneTap.jsx`, `LoginModal.js` |
| calendar (1) | `ActionDatePicker.jsx` |
| contribution (4) | `ContributionCard.jsx`, `ContributionDrawer.jsx`, `ContributorAvatarGroup.js`, `PostContribution.jsx` |
| document (1) | `DocumentHeader.jsx` |
| editor (25) | `DocumentEditor.jsx`, `DocumentEditorLayout.jsx`, `DocumentPreview.jsx`, `EditorAddress.jsx`, `EditorAttachments.jsx`, `EditorBlock.jsx`, `EditorContextSuggestions.jsx`, `EditorEmbed.jsx`, `EditorFooter.jsx`, `EditorHeader.jsx`, `EditorImage.jsx`, `EditorList.jsx`, `EditorModal.jsx`, `EditorRenderer.jsx`, `EditorResourcePreview.jsx`, `EditorRichText.jsx`, `EditorTable.jsx`, `PlainTextEditor.jsx`, `PostEditor.jsx`, `PostEditorLayout.jsx`, `RichTextEditor.jsx`, `editorTools.js`, `editorUtils.js`, `resolveEditorImageUrls.js`, `typography.js` |
| feed (3) | `CreatePostTrigger.js`, `Feed.js`, `FeedFilters.jsx` |
| geography (6) | `AddGeographyDialog.jsx`, `GeographyFocusSelector.jsx`, `GeographyPicker.jsx`, `GeographySearch.jsx`, `LeafletMap.jsx`, `LocationMapPreview.jsx` |
| governance (27) | `EntityListSheet.jsx`, `GovernanceActionMenu.jsx`, `GovernanceAppointmentAddressSheet.jsx`, `GovernanceAppointmentDeleteButton.jsx`, `GovernanceAppointmentDialog.jsx`, `GovernanceCardActions.jsx`, `GovernanceDirectoryToolbar.jsx`, `GovernanceEditorResources.jsx`, `GovernanceEntityDetails.jsx`, `GovernanceEntityHeader.jsx`, `GovernanceEntityModal.jsx`, `GovernanceFamilyTree.jsx`, `GovernanceLeadershipDialog.jsx`, `GovernanceOrganizationDialog.jsx`, `GovernanceOrganizationOverview.jsx`, `GovernanceOrganizationResourceDialogs.jsx`, `GovernanceOrganizationSelector.jsx`, `GovernanceOrganizationSheet.jsx`, `GovernancePersonSheet.jsx`, `GovernancePositionSheet.jsx`, `GovernanceRelationDialog.jsx`, `GovernanceResourceDialogs.jsx`, `GovernanceResources.jsx`, `GovernanceSelector.jsx`, `OrganizationDirectory.jsx`, `PersonDirectory.jsx`, `PositionDirectory.jsx` |
| layout (15) | `AdminSettingsShell.jsx`, `AppShell.js`, `CenterColumn.js`, `FloatingMenu.js`, `FloatingMenuContext.js`, `Header.js`, `Layout.js`, `LeftSidebar.js`, `LogoSwitcher.js`, `MobileSidebar.js`, `Navigation.js`, `PageHeader.jsx`, `Profile.js`, `RightSidebar.js`, `primitives.js` |
| link (3) | `LinkManager.jsx`, `LinkManagerDialog.jsx`, `LinkRow.jsx` |
| post (12) | `LinkCard.jsx`, `PostActions.jsx`, `PostAttachments.jsx`, `PostCard.js`, `PostContent.jsx`, `PostFooter.jsx`, `PostHeader.jsx`, `PostLinks.jsx`, `PostMapDialog.jsx`, `PostModal.jsx`, `PostShareButton.jsx`, `PostTimeline.jsx` |
| skeletons (15) | `CarouselSkeleton.jsx`, `CreatePostSkeleton.jsx`, `CreatePostTriggerSkeleton.jsx`, `EditorModalSkeleton.jsx`, `MeetingSkeleton.jsx`, `MetaCardsSkeleton.jsx`, `PageHeaderSkeleton.jsx`, `PostCardSkeleton.jsx`, `PostSkeleton.jsx`, `SearchFiltersSkeleton.jsx`, `SettingsSkeleton.jsx`, `SpaceCardSkeleton.jsx`, `UserPostsSkeleton.jsx`, `UserProfileSkeleton.jsx`, `UserSpacesSkeleton.jsx` |
| space (20) | `ActivityTab.js`, `MembersTab.js`, `OverviewTab.js`, `SpaceActionMap.jsx`, `SpaceAvatarGroup.jsx`, `SpaceExplorer.jsx`, `SpaceGeneralSettings.js`, `SpaceMemberApplications.jsx`, `SpaceMembersSettings.js`, `SpaceSelectorDrawer.jsx`, `SpaceTimeline.jsx`, `SpaceTimelineEmpty.jsx`, `SpaceTopbar.jsx`, `TimelineControls.jsx`, `TimelineEvent.jsx`, `TimelineFilters.jsx`, `TimelineHorizontal.jsx`, `TimelineProgressRail.jsx`, `TimelineVertical.jsx`, `VisibilitySelector.jsx` |
| standards (19) | `ClassificationBreadcrumb.jsx`, `ClassificationCodeDialog.jsx`, `ClassificationDimensionSidebar.jsx`, `ClassificationSearch.jsx`, `ClassificationSkeleton.jsx`, `ClassificationSystemCard.jsx`, `ClassificationTree.jsx`, `CodeDetailsCard.jsx`, `DeleteCodeDialog.jsx`, `StandardsToolbar.jsx`, `StandardsTopbar.jsx`, `TreeNode.jsx`, `columns.js`, `data-table.jsx`, `index.js`, `pagination.jsx`, `row-actions.jsx`, `toolbar.jsx`, `view-options.jsx` |
| system (10) | `AppProviders.js`, `Appearance.jsx`, `ErrorBoundary.jsx`, `InstallAppButton.jsx`, `Logo.js`, `NetworkStatusBanner.js`, `Notification.jsx`, `PrivacyPolicy.jsx`, `RouteLoader.jsx`, `Support.jsx` |
| user (10) | `EditProfile.jsx`, `UserAvatarGroup.jsx`, `UserContributions.jsx`, `UserIdentity.js`, `UserPostCard.jsx`, `UserPosts.jsx`, `UserProfile.jsx`, `UserSpaceCard.jsx`, `UserSpaces.jsx`, `UserTopbar.jsx` |

## Story Files Added

UI stories:

- `src/components/ui/back-button.stories.jsx`
- `src/components/ui/button.stories.jsx`
- `src/components/ui/button.Button.stories.jsx`
- `src/components/ui/card.stories.jsx`
- `src/components/ui/component-examples.stories.jsx`
- `src/components/ui/feedback.stories.jsx`
- `src/components/ui/forms.stories.jsx`
- `src/components/ui/image-upload.stories.jsx`
- `src/components/ui/layout.stories.jsx`
- `src/components/ui/link-manager.stories.jsx`
- `src/components/ui/overlays.stories.jsx`

Feature/shared stories:

- `src/components/activity/ActivityPreviewCard.stories.jsx`
- `src/components/admin/AdminBreadcrumb.stories.jsx`
- `src/components/editor/EditorDateTime.stories.jsx`
- `src/components/editor/EditorWarning.stories.jsx`
- `src/components/feed/CreatePostWaveAnimation.stories.jsx`
- `src/components/geography/LocationSearchInput.stories.jsx`
- `src/components/geography/SelectedLocation.stories.jsx`
- `src/components/governance/GovernanceAvatarGroup.stories.jsx`
- `src/components/governance/GovernanceDirectoryCard.stories.jsx`
- `src/components/governance/GovernancePageHeader.stories.jsx`
- `src/components/governance/GovernancePositionTimeline.stories.jsx`
- `src/components/layout/Topbar.stories.jsx`
- `src/components/post/PostMetadata.stories.jsx`
- `src/components/space/MemberCard.stories.jsx`
- `src/components/space/SpaceCard.stories.jsx`

The existing `src/stories/` examples remain available. Showcase-only grouped stories and starter examples carry the supported `!manifest` tag so they are testable but do not appear as false component definitions in MCP.

## Verification

### MCP manifest and Storybook build

`npm run build-storybook` succeeded. The generated `storybook-static/manifests/components.json` contains 21 component entries and zero docgen errors. Storybook’s React docgen resolver now finds the existing `@/*` mapping through the root `tsconfig.json`, which extends the existing `jsconfig.json`. Grouped story files without a component API are excluded from the manifest rather than represented as components.

Non-blocking build warnings remain:

- Lightning CSS does not recognize Tailwind `@custom-variant` and `@theme` directives.
- Next.js 15.5.11 reports detected `@next/swc` 15.5.7.
- Storybook reports a large Vite chunk-size warning.
- Node reports the existing ESM/CommonJS configuration warning for `.storybook/main.js`.

### Browser and accessibility tests

`npx vitest run --project storybook` passed: 29 test files and 105 tests. This includes accessibility checks in `error` mode and interaction tests for isolated uploads, link lookup, buttons, forms, and overlays. The original 19 accessibility failures have been corrected without suppressing checks.

### Production build

`npx next build` initially found two unescaped quotes in the existing Storybook starter page at `src/stories/Page.jsx`; they were safely escaped as `&quot;`. The rerun completed successfully: Next compiled in 116 seconds and generated all 34 static pages. Existing non-blocking lint warnings remain across application files.
