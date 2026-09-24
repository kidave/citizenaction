-- The consolidated governance migration intentionally recreates this overload
-- without retaining its old defaults. PostgreSQL requires the existing overload
-- to be dropped before those defaults can be removed.
drop function if exists public.get_governance_directory(text, uuid, text, integer, boolean);
