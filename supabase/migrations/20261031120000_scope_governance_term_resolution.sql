-- Scope canonical term matching to the governance institution owning the appointment.
-- A term label is only unique within its governance entity.

create or replace function public.sync_position_appointment_term_id()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  appointment_governance_id uuid;
  resolved_term_id uuid;
  resolved_term_name text;
  term_governance_id uuid;
begin
  select coalesce(new.organization_id, p.governance_id, p.appointing_organization_id)
    into appointment_governance_id
  from public.position p where p.id = new.position_id;

  if new.term_id is not null then
    select gt.name, gt.governance_id into resolved_term_name, term_governance_id
    from public.governance_term gt where gt.id = new.term_id;
    if term_governance_id is null then
      new.term_id := null;
    elsif appointment_governance_id is distinct from term_governance_id then
      raise exception 'Term governance does not match appointment governance';
    else
      new.term := resolved_term_name;
    end if;
  elsif nullif(btrim(new.term), '') is not null and appointment_governance_id is not null then
    select gt.id, gt.name into resolved_term_id, resolved_term_name
    from public.governance_term gt
    where gt.governance_id = appointment_governance_id
      and lower(gt.name) = lower(btrim(new.term))
    limit 1;
    if resolved_term_id is not null then
      new.term_id := resolved_term_id;
      new.term := resolved_term_name;
    end if;
  end if;
  return new;
end;
$$;

-- Reconcile only appointments whose organization/position matches the term owner.
update public.position_appointment pa
set term_id = gt.id
from public.governance_term gt, public.position p
where p.id = pa.position_id
  and pa.term_id is null
  and pa.term is not null
  and lower(btrim(pa.term)) = lower(gt.name)
  and gt.governance_id = coalesce(pa.organization_id, p.governance_id, p.appointing_organization_id);

update public.position_appointment pa
set term_id = null
from public.governance_term gt, public.position p
where p.id = pa.position_id
  and pa.term_id = gt.id
  and gt.governance_id is distinct from coalesce(pa.organization_id, p.governance_id, p.appointing_organization_id);

notify pgrst, 'reload schema';