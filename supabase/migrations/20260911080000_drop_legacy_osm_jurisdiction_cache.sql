begin;

-- The application now reads from the canonical geographies table.
-- These cache tables are no longer part of the application data model.
drop table if exists public.osm_jurisdiction_cache_scope;
drop table if exists public.osm_jurisdiction_cache;

commit;
