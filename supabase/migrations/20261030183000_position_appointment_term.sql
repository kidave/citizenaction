-- Digital Sansad appointments store term and constituency relationally.
alter table public.position_appointment
  add column if not exists term text;

create index if not exists position_appointment_position_term_idx
  on public.position_appointment (position_id, term);

-- A person should not receive duplicate appointments for the same office and term.
-- Existing appointments without a term remain unaffected.
create unique index if not exists position_appointment_position_person_term_uidx
  on public.position_appointment (position_id, person_id, term)
  where person_id is not null and term is not null;
