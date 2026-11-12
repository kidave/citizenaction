-- Appointment-specific location overrides. Position and organization locations
-- remain defaults; these fields describe the individual appointment/posting.
alter table public.position_appointment
  add column if not exists geography_id uuid,
  add column if not exists address text,
  add column if not exists lat double precision,
  add column if not exists lng double precision;

alter table public.position_appointment
  drop constraint if exists position_appointment_geography_id_fkey;

alter table public.position_appointment
  add constraint position_appointment_geography_id_fkey
  foreign key (geography_id) references public.geographies(id) on delete set null;

create index if not exists position_appointment_geography_id_idx
  on public.position_appointment(geography_id);

notify pgrst, 'reload schema';
