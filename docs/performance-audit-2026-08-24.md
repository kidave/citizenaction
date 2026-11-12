# Citizen Action Performance Audit — 2026-08-24

## Findings

- Removed obsolete root-level `move-to-src.js` migration helper.
- `package.json` contains overlapping libraries that should be reviewed before removal: `framer-motion` + `motion`, `dayjs` + `date-fns`, `classnames` + `clsx`, `react-icons` + `lucide-react` + `@tabler/icons-react`, and both `@supabase/auth-helpers-nextjs` + `@supabase/ssr`.
- Feed loading currently uses `feed_card_view` plus separate `get_post_stats`, `get_post_contributors`, and `get_post_governance` RPC calls.
- Timeline loading uses `space_timeline_view`, which aggregates attachments, links, governance, actors, and multiple event sources.
- `AutoImageCarousel` is instantiated repeatedly on activity/timeline cards and runs its own interval when multiple images exist.
- Supabase performance advisors currently report unindexed foreign keys, RLS auth-initplan warnings, multiple permissive RLS policies, unused indexes, and duplicate indexes.
- Vercel production currently has runtime errors in `/api/osm-reverse` (XML response parsed as JSON) and `/post/[slug]` (`c.space_id` reference does not exist).

## Safe cleanup already applied

- Deleted obsolete `move-to-src.js` from the repository.

## Deferred changes

No dependency removals, database DDL/index changes, RLS changes, query consolidation, or runtime-error changes are included in this audit branch yet. These require targeted verification and should be implemented in separate, testable changes.
