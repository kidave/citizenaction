begin;

alter policy jurisdiction_geography_public_read on public.geographies rename to geographies_public_read;
alter policy governance_boundary_public_read on public.governance_geography rename to governance_geography_public_read;

alter index if exists public.governance_boundary_pkey rename to governance_geography_pkey;
alter index if exists public.governance_boundary_unique_link rename to governance_geography_unique_link;
alter index if exists public.governance_boundary_governance_idx rename to governance_geography_governance_idx;
alter index if exists public.governance_boundary_geography_idx rename to governance_geography_geography_idx;
alter index if exists public.governance_boundary_primary_idx rename to governance_geography_primary_idx;

commit;
