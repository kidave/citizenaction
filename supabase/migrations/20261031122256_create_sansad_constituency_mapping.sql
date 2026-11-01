begin;

create table if not exists public.sansad_constituency_mapping (
  id uuid not null default gen_random_uuid(),
  source_name text not null,
  source_state text null,
  canonical_name text null,
  geography_id uuid null references public.geographies(id) on delete set null,
  resolution_type text null,
  valid_from date null,
  valid_to date null,
  successor_geography_ids uuid[] not null default '{}'::uuid[],
  review_status text not null default 'pending'::text,
  source_reference text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  affected_member_records integer not null default 0,
  dry_run_issue text null,
  state_context_needed text null,
  notes text null,
  observed_election_years integer[] not null default '{}'::integer[],
  observed_lok_sabha_terms integer[] not null default '{}'::integer[],
  first_seen_term integer null,
  last_seen_term integer null,
  observed_states text[] not null default '{}'::text[],
  state_year_observations jsonb not null default '{}'::jsonb,
  timeline_match_type text null,
  timeline_source text null,
  timeline_coverage_note text null,
  candidate_name_suggestions jsonb not null default '[]'::jsonb,
  constraint sansad_constituency_mapping_pkey primary key (id),
  constraint sansad_constituency_mapping_review_status_check
    check (review_status = any (array['pending'::text,'in_review'::text,'approved'::text,'rejected'::text]))
);
create index if not exists sansad_constituency_mapping_source_name_idx
  on public.sansad_constituency_mapping using btree (lower(source_name));
create index if not exists sansad_constituency_mapping_source_state_idx
  on public.sansad_constituency_mapping using btree (source_state);
create index if not exists sansad_constituency_mapping_review_status_idx
  on public.sansad_constituency_mapping using btree (review_status);

alter table public.sansad_constituency_mapping enable row level security;
revoke all on public.sansad_constituency_mapping from anon, authenticated;
grant select on public.sansad_constituency_mapping to authenticated;
drop policy if exists sansad_constituency_mapping_admin_read on public.sansad_constituency_mapping;
create policy sansad_constituency_mapping_admin_read
  on public.sansad_constituency_mapping
  for select to authenticated
  using (exists (
    select 1 from public.profile p
    where p.user_id = (select auth.uid()) and p.role = 'admin'
  ));

commit;
notify pgrst, 'reload schema';
