-- The application uses the 4-argument tree function and the dedicated v2 function.
-- The two older 5-argument overloads overlap the 4-argument signature because
-- they expose defaults, making direct PostgreSQL calls ambiguous.
-- Remove them now that governance is consolidated.
drop function if exists public.get_governance_directory(text, uuid, text, integer, boolean);
drop function if exists public.get_governance_directory(text, text, uuid, boolean, timestamptz);
