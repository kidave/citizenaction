-- Normalize education, profession, and service catalogues and their person/profile relationships.
-- Services belong to public directory people only; registered profiles do not have service links.

create table public.education (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  institution_type text,
  geography_id uuid references public.geographies(id) on delete set null,
  website text,
  source text not null default 'citizenaction',
  source_id text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint education_name_chk check (length(btrim(name)) > 0),
  constraint education_source_chk check (length(btrim(source)) > 0)
);

create unique index education_source_identity_uidx
  on public.education (source, source_id)
  where source_id is not null;
create index education_geography_id_idx on public.education (geography_id);
create index education_name_search_idx on public.education using gin (to_tsvector('simple', name));

create table public.profession (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  parent_id uuid references public.profession(id) on delete set null,
  source text not null default 'citizenaction',
  source_id text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profession_name_chk check (length(btrim(name)) > 0),
  constraint profession_source_chk check (length(btrim(source)) > 0)
);

create unique index profession_source_identity_uidx
  on public.profession (source, source_id)
  where source_id is not null;
create index profession_parent_id_idx on public.profession (parent_id);
create index profession_name_search_idx on public.profession using gin (to_tsvector('simple', name));

create table public.service (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  abbreviation text,
  description text,
  category text,
  source text not null default 'citizenaction',
  source_id text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_name_chk check (length(btrim(name)) > 0),
  constraint service_source_chk check (length(btrim(source)) > 0)
);

create unique index service_source_identity_uidx
  on public.service (source, source_id)
  where source_id is not null;
create index service_name_search_idx on public.service using gin (to_tsvector('simple', name));

-- Public directory person relationships.
create table public.person_education (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.person(id) on delete cascade,
  education_id uuid not null references public.education(id) on delete restrict,
  is_primary boolean not null default false,
  visibility text not null default 'public',
  verification_status text not null default 'unverified',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint person_education_visibility_chk check (visibility in ('public', 'private')),
  constraint person_education_verification_chk check (verification_status in ('unverified', 'self_declared', 'source_matched', 'document_verified', 'officially_verified')),
  constraint person_education_unique unique (person_id, education_id)
);
create unique index person_education_one_primary_uidx on public.person_education(person_id) where is_primary;
create index person_education_education_id_idx on public.person_education(education_id);

create table public.person_profession (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.person(id) on delete cascade,
  profession_id uuid not null references public.profession(id) on delete restrict,
  is_primary boolean not null default false,
  visibility text not null default 'public',
  verification_status text not null default 'unverified',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint person_profession_visibility_chk check (visibility in ('public', 'private')),
  constraint person_profession_verification_chk check (verification_status in ('unverified', 'self_declared', 'source_matched', 'document_verified', 'officially_verified')),
  constraint person_profession_unique unique (person_id, profession_id)
);
create unique index person_profession_one_primary_uidx on public.person_profession(person_id) where is_primary;
create index person_profession_profession_id_idx on public.person_profession(profession_id);

create table public.person_service (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.person(id) on delete cascade,
  service_id uuid not null references public.service(id) on delete restrict,
  is_primary boolean not null default false,
  visibility text not null default 'public',
  verification_status text not null default 'unverified',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint person_service_visibility_chk check (visibility in ('public', 'private')),
  constraint person_service_verification_chk check (verification_status in ('unverified', 'self_declared', 'source_matched', 'document_verified', 'officially_verified')),
  constraint person_service_unique unique (person_id, service_id)
);
create unique index person_service_one_primary_uidx on public.person_service(person_id) where is_primary;
create index person_service_service_id_idx on public.person_service(service_id);

-- Registered profile relationships. No profile_service table by design.
create table public.profile_education (
  id uuid primary key default gen_random_uuid(),
  profile_user_id uuid not null references public.profile(user_id) on delete cascade,
  education_id uuid not null references public.education(id) on delete restrict,
  is_primary boolean not null default false,
  visibility text not null default 'public',
  verification_status text not null default 'unverified',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_education_visibility_chk check (visibility in ('public', 'private')),
  constraint profile_education_verification_chk check (verification_status in ('unverified', 'self_declared', 'source_matched', 'document_verified', 'officially_verified')),
  constraint profile_education_unique unique (profile_user_id, education_id)
);
create unique index profile_education_one_primary_uidx on public.profile_education(profile_user_id) where is_primary;
create index profile_education_education_id_idx on public.profile_education(education_id);

create table public.profile_profession (
  id uuid primary key default gen_random_uuid(),
  profile_user_id uuid not null references public.profile(user_id) on delete cascade,
  profession_id uuid not null references public.profession(id) on delete restrict,
  is_primary boolean not null default false,
  visibility text not null default 'public',
  verification_status text not null default 'unverified',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_profession_visibility_chk check (visibility in ('public', 'private')),
  constraint profile_profession_verification_chk check (verification_status in ('unverified', 'self_declared', 'source_matched', 'document_verified', 'officially_verified')),
  constraint profile_profession_unique unique (profile_user_id, profession_id)
);
create unique index profile_profession_one_primary_uidx on public.profile_profession(profile_user_id) where is_primary;
create index profile_profession_profession_id_idx on public.profile_profession(profession_id);

-- All six relationship tables and the three catalogues are exposed with RLS.
alter table public.education enable row level security;
alter table public.profession enable row level security;
alter table public.service enable row level security;
alter table public.person_education enable row level security;
alter table public.person_profession enable row level security;
alter table public.person_service enable row level security;
alter table public.profile_education enable row level security;
alter table public.profile_profession enable row level security;

grant select on public.education, public.profession, public.service to anon, authenticated;
grant insert, update, delete on public.education, public.profession, public.service to authenticated;
grant select on public.person_education, public.person_profession, public.person_service,
  public.profile_education, public.profile_profession to anon, authenticated;
grant insert, update, delete on public.person_education, public.person_profession, public.person_service,
  public.profile_education, public.profile_profession to authenticated;

-- Catalogues are publicly readable; only platform admins can maintain them.
create policy education_public_read on public.education for select to anon, authenticated using (true);
create policy education_admin_write on public.education for all to authenticated
  using (exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'))
  with check (exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'));

create policy profession_public_read on public.profession for select to anon, authenticated using (true);
create policy profession_admin_write on public.profession for all to authenticated
  using (exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'))
  with check (exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'));

create policy service_public_read on public.service for select to anon, authenticated using (true);
create policy service_admin_write on public.service for all to authenticated
  using (exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'))
  with check (exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'));

-- Public person records follow the existing person directory model: public read, admin-managed writes.
create policy person_education_public_read on public.person_education for select to anon, authenticated
  using (visibility = 'public' or exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'));
create policy person_education_admin_write on public.person_education for all to authenticated
  using (exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'))
  with check (exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'));

create policy person_profession_public_read on public.person_profession for select to anon, authenticated
  using (visibility = 'public' or exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'));
create policy person_profession_admin_write on public.person_profession for all to authenticated
  using (exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'))
  with check (exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'));

create policy person_service_public_read on public.person_service for select to anon, authenticated
  using (visibility = 'public' or exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'));
create policy person_service_admin_write on public.person_service for all to authenticated
  using (exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'))
  with check (exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'));

-- Profile records are public by default, but owners can keep individual links private.
create policy profile_education_read on public.profile_education for select to anon, authenticated
  using (visibility = 'public' or profile_user_id = (select auth.uid())
    or exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'));
create policy profile_education_owner_write on public.profile_education for all to authenticated
  using (profile_user_id = (select auth.uid())
    or exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'))
  with check (profile_user_id = (select auth.uid())
    or exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'));

create policy profile_profession_read on public.profile_profession for select to anon, authenticated
  using (visibility = 'public' or profile_user_id = (select auth.uid())
    or exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'));
create policy profile_profession_owner_write on public.profile_profession for all to authenticated
  using (profile_user_id = (select auth.uid())
    or exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'))
  with check (profile_user_id = (select auth.uid())
    or exists (select 1 from public.profile p where p.user_id = (select auth.uid()) and p.role = 'admin'));

comment on table public.education is 'Education institutions catalogue. geography_id links the institution to its canonical Citizen Action geography, normally its district.';
comment on table public.profession is 'Profession and occupation catalogue. NCO identifiers are stored as source=nco and source_id=<NCO code>. parent_id preserves catalogue hierarchy.';
comment on table public.service is 'Government and other formal service catalogue. Service affiliations are recorded for public directory people only.';
comment on table public.person_education is 'Many-to-many links between public directory people and education institutions.';
comment on table public.person_profession is 'Many-to-many links between public directory people and professions.';
comment on table public.person_service is 'Many-to-many links between public directory people and services.';
comment on table public.profile_education is 'Many-to-many links between registered profiles and education institutions; public by default.';
comment on table public.profile_profession is 'Many-to-many links between registered profiles and professions; public by default.';
