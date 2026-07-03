# Database

This document uses only information available from the repository. The actual Supabase schema, constraints, RLS policies, triggers, indexes, generated types, and migrations are not present in this checkout.

## Tables referenced

The following table names are directly referenced through Supabase `.from()` calls and appear to be base tables based on usage. This classification is inferred from reads/writes in code and may need confirmation against Supabase.

| Table | Evidence from code usage |
| --- | --- |
| `action_contribute` | count/select, insert/delete contribution actions |
| `action_escalate` | insert/delete escalation/authority actions |
| `action_support` | count/select, insert/delete support actions |
| `club` | create, read, update, delete clubs/committees |
| `club_member` | inserts creator as club member |
| `delete_account_requests` | inserts account deletion request |
| `feed` | create, update, delete feed posts |
| `feed_governance_entities` | join table for feed posts and governance entities |
| `feed_space` | join table for feed posts and spaces |
| `geographic_scope` | scope lookup by type/code and post scope reads |
| `geographic_scope_hierarchy` | geographic scope hierarchy reads |
| `meeting_item` | meeting item create/update/delete/read |
| `profile` | user profile reads/updates and contact fallback |
| `space` | space reads/updates/deletes and ownership checks |
| `space_application` | space application create/read/update flows |
| `space_member` | user-space membership reads |

## Views referenced

These names are read through `.from()` and appear to be views because of naming and read-only style usage:

| View | Evidence from code usage |
| --- | --- |
| `club_view` | club display/settings reads |
| `feed_light_view` | feed and post detail reads |
| `governance_entity_view` | governance explorer/tree reads |
| `meeting_view` | meeting list reads |
| `public_profile` | public and self profile reads |
| `space_member_view` | space member display reads |

## RPC functions referenced

| RPC | Usage |
| --- | --- |
| `can_manage_feed` | checks whether a user can manage a feed item/context |
| `get_scope_chain` | returns geographic scope ancestry/chain |

## Storage buckets

| Bucket | Usage |
| --- | --- |
| `post-attachments` | post/feed attachment upload, public URL lookup, delete |
| `community-branding` | space logo/cover branding upload/delete/public URL usage |
| `committee-branding` | club/committee logo/cover branding upload/delete/public URL usage |

## Database relationships inferred from code

These relationships are inferred from query filters and inserted fields. They should be confirmed against the actual Supabase schema before relying on them for migrations or policy work.

### Space and club

- `space.slug` is used as a public identifier in routes.
- `space.id` is used as the foreign key value for `club.space_id`.
- `space.owner_user_id` is compared to `auth.user.id` when creating clubs.
- `club.created_by` is compared to `auth.user.id` for club ownership in settings APIs.
- `club.scope_type` and `club.scope_code` connect a club to a geographic scope.
- `club_view` exposes display/query fields including `space_slug`, `scope_type`, and `scope_code`.

### Geographic scope

- `geographic_scope.type` and `geographic_scope.code` identify a location scope.
- `geographic_scope_hierarchy` appears to model parent/child or hierarchy information.
- `get_scope_chain` returns a scope ancestry/chain from a scope input.

### Feed

- `feed` stores core post/action records.
- `feed_light_view` is the read model used for feed and post details.
- `feed_space` associates feed posts with spaces.
- `feed_governance_entities` associates feed posts with governance entities.
- `action_support`, `action_contribute`, and `action_escalate` store user interactions/engagements with feed posts or actions.
- `can_manage_feed` determines whether the current user may manage a feed entity.

### Meetings

- `meeting_item` stores meeting item records.
- `meeting_view` is the read model for meeting lists.
- Meeting items are associated with posts/feed records based on hook names and query usage, but exact foreign keys should be confirmed in the database.

### Profiles and users

- `profile.user_id` links a profile to a Supabase auth user.
- `public_profile` exposes profile fields for public/self reads.
- `delete_account_requests` stores user-initiated account deletion requests.

### Space membership

- `space_member` stores memberships between users and spaces.
- `space_member_view` exposes membership display data.

### Club membership

- `club_member.club_id` links to `club.id`.
- `club_member.user_id` links to an authenticated user.
- `club_member.role` is inserted with value `chair` for club creators.
- `club_member.is_active` is set to true when creator membership is inserted.

## Columns observed in code

This is not a complete schema. It lists only columns directly visible in repository code.

### `space`

Observed columns: `id`, `slug`, `owner_user_id`, `name`, `logo_url`, `cover_url`.

### `club`

Observed columns: `id`, `space_id`, `name`, `description`, `scope_type`, `scope_code`, `contact_email`, `contact_phone`, `is_active`, `created_by`, `logo_url`, `cover_url`.

### `club_member`

Observed columns: `club_id`, `user_id`, `role`, `is_active`.

### `geographic_scope`

Observed columns: `id`, `name`, `type`, `code`.

### `profile`

Observed columns: `name`, `email`, `mobile`, `phone`, `user_id`.

Additional columns exist in code across feed, meeting, application, and membership flows, but this document avoids asserting full schemas where the repository does not provide a schema source.

## Missing schema information outside this repository

The following information is not available in the repository and should be exported from Supabase or added as migrations/types before major backend changes:

- Complete table definitions and column types
- Primary keys and foreign keys
- Unique constraints
- Check constraints and enum types
- Row Level Security policies
- Storage bucket policies
- Database functions/RPC definitions
- Database triggers
- Indexes and query performance plans
- Seed data
- Generated Supabase TypeScript types
- Local Supabase configuration and migrations
