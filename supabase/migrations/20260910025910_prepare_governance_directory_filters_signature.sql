-- Drop the legacy overload so its parameter defaults can be normalized
-- by the governance consolidation migration.
drop function if exists public.get_governance_directory(text, text, uuid, boolean, timestamptz);
