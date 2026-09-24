begin;

drop function if exists public.set_governance_geography(uuid, uuid, text, boolean, timestamptz, timestamptz, text);
drop function if exists public.delete_governance_geography(uuid);

drop table if exists public.governance_geography;

commit;
