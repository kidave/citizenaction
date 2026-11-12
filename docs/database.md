# Database

The database is a first-class part of Citizen Action architecture. Supabase migrations under `supabase/migrations/` are the GitHub source of truth for schema changes. The live Supabase project remains the runtime source of truth and should be checked when validating current grants, policies, functions, views, and extensions.

This document is intentionally a high-level map, not a replacement for migrations.

## Current schemas

### `public`

Core Citizen Action data currently includes:

- `profile`
- `space`, `space_application`, `space_member`, `space_member_application`, `space_records`
- `post`, `post_space`, `post_governance`, `contribution`, `action_support`, `attachment`, `link`
- `meeting`-related records where present in the active migrations
- `governance`, `governance_contribution`, `governance_timeline`
- normalized governance directory entities: `person`, `position`, `position_appointment`
- `geographies`
- `category` and classification/taxonomy tables
- `directory_contributions`
- `website_metadata`
- `user_capabilities`
- `audit_log`
- `delete_account_requests`

The live database also contains PostGIS's `spatial_ref_sys` table and extension metadata. Treat extension/system objects separately from application tables.

### `map`

The mapping schema currently contains transport/network and Mapillary data such as:

- `roads`, `roadways`, `ward`, `ward_roads`
- `junction`, `transportation`
- `bus_stop`, `bus_station`, `bus_depot`
- `railway_station`, `train_station`
- `mapillary_features`, `mapillary_feature_images`, `mapillary_images_raw`
- supporting map classification tables such as `layer` and `fclass`

These datasets are primarily infrastructure/geospatial data and should not be treated like user-owned application records.

## Current views

The live database currently exposes application/read-model views including:

- `feed_card_view`
- `governance_view`
- `space_view`
- `space_public_view`
- `space_member_view`
- `public_profile`
- `post_stats`
- classification views
- PostGIS metadata views

Views require the same authorization review as tables. In particular, the security posture of the current security-definer views must be reviewed before changing them to `security_invoker` or changing their grants.

## Canonical data models

### Feed/posts

`post` is the canonical post record. Relationships to spaces and governance are represented by dedicated join tables. Attachments and links are separate records/RPC-managed relationships. Read models such as `feed_card_view` are optimized for application display and should not become a second source of truth.

### Spaces

Spaces own the community/work context. Membership and applications are represented separately. Authorization for management actions belongs in RLS and database functions, not only in the UI.

### Governance

Governance is the canonical model for public authorities/entities. The normalized directory model uses:

- `governance` — entity/organization records and hierarchy.
- `person` — people.
- `position` — roles/positions.
- `position_appointment` — person-to-position appointments and reporting relationships.
- `governance_contribution` and `governance_timeline` — contribution/history data.
- `geographies` — canonical geographic entities/jurisdictions.

The recent governance migrations intentionally consolidated older overlapping models. New code should use the canonical model rather than recreating legacy scope/authority structures.

### Geography

`geographies` is the canonical application geography model. OSM-derived identifiers and geometry are stored with geography records where required. Mapping/import/cache tables should remain implementation-specific and should not become competing application geography sources of truth.

## Authorization model

Citizen Action uses multiple layers:

1. Postgres grants decide which roles can reach a table/view/function through the Data API.
2. RLS policies decide which rows those roles can access.
3. `SECURITY DEFINER` functions may intentionally bypass RLS and therefore require explicit authorization checks and tightly scoped execution grants.
4. Frontend visibility checks are UX only and are not an authorization boundary.

Privileged mutation RPCs should be callable only by the roles that need them. Anonymous execution of privileged mutation functions has been explicitly restricted in migration `20260913155036_restrict_privileged_rpc_anon_execute_v3`.

## Source of truth rules

- Schema changes: `supabase/migrations/`.
- Runtime schema/permissions: live Supabase project.
- Frontend data contracts: generated Supabase types when available.
- Authorization: database grants + RLS + function checks.
- Read models: views/RPCs, without duplicating business truth in the frontend.

## Database maintenance priorities

1. Keep migrations synchronized with production.
2. Generate and track Supabase types.
3. Review RLS policies and grants for every exposed application table.
4. Review `SECURITY DEFINER` functions individually; never remove `SECURITY DEFINER` merely to silence a linter.
5. Set an explicit `search_path` on privileged functions where required.
6. Review security-definer views and their intended public/authenticated access.
7. Add indexes based on real query plans and common feed/governance/geography/membership lookups.
8. Keep extension/system objects separate from application security decisions.

## Legacy documentation rule

Removed Club/scope models and routes must not be documented as current database architecture. Historical migrations may still mention older names because migration history is immutable; current application documentation should describe only the canonical active model.
