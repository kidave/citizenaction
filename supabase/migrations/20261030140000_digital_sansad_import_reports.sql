-- Persist Digital Sansad diagnostic snapshots for the admin Geography page.
create table if not exists public.digital_sansad_import_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null default 'https://sansad.in/ls/members',
  mode text not null default 'dry-run' check (mode in ('dry-run','apply')),
  fetched_source_rows integer not null default 0,
  advertised_source_total integer,
  unresolved_assignment_count integer not null default 0,
  unresolved_unique_names integer not null default 0,
  ambiguous_assignment_count integer not null default 0,
  matched_former_count integer,
  matched_defunct_count integer,
  report jsonb not null default '{}'::jsonb,
  workflow_run_url text,
  status text not null default 'success' check (status in ('success','failed')),
  error_message text
);

create index if not exists idx_digital_sansad_import_reports_created_at
  on public.digital_sansad_import_reports (created_at desc);

alter table public.digital_sansad_import_reports enable row level security;

drop policy if exists "Authenticated users can read Digital Sansad reports"
  on public.digital_sansad_import_reports;
create policy "Authenticated users can read Digital Sansad reports"
  on public.digital_sansad_import_reports for select to authenticated using (true);

revoke insert, update, delete on public.digital_sansad_import_reports from anon, authenticated;
grant select on public.digital_sansad_import_reports to authenticated;
grant all on public.digital_sansad_import_reports to service_role;
