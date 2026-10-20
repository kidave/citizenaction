-- Appointment-specific address and geography overrides.
-- Null values inherit from the position and organization.
alter table public.position_appointment
  add column if not exists geography_id uuid references public.geographies(id) on delete set null,
  add column if not exists address text,
  add column if not exists lat double precision,
  add column if not exists lng double precision;

create index if not exists position_appointment_geography_id_idx
  on public.position_appointment (geography_id);

comment on column public.position_appointment.geography_id is 'Appointment-specific geographic boundary override; null inherits from the position or organization.';
comment on column public.position_appointment.address is 'Appointment-specific office or posting address override.';
comment on column public.position_appointment.lat is 'Latitude for the appointment-specific address marker.';
comment on column public.position_appointment.lng is 'Longitude for the appointment-specific address marker.';
