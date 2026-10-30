-- Keep education distinct from qualification for person profiles.
alter table public.person
  add column if not exists education text;

comment on column public.person.education is
  'Educational background/details as reported by a reliable source; distinct from qualification.';
