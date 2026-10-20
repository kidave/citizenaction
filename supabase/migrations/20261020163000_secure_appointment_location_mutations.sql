-- Restrict appointment location mutations to application administrators,
-- matching the existing update_governance_location authorization model.
create or replace function public.set_position_appointment_geography(
  p_appointment_id uuid,
  p_geography_id uuid
) returns public.position_appointment
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_row public.position_appointment;
begin
  perform public.require_governance_admin();
  if p_appointment_id is null then raise exception 'Appointment is required'; end if;
  update public.position_appointment
    set geography_id = p_geography_id
    where id = p_appointment_id
    returning * into v_row;
  if not found then raise exception 'Appointment not found'; end if;
  return v_row;
end;
$function$;

create or replace function public.update_position_appointment_location(
  p_appointment_id uuid,
  p_address text default null,
  p_lat double precision default null,
  p_lng double precision default null
) returns public.position_appointment
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_row public.position_appointment;
begin
  perform public.require_governance_admin();
  if p_appointment_id is null then raise exception 'Appointment is required'; end if;
  update public.position_appointment
    set address = nullif(btrim(p_address), ''),
        lat = p_lat,
        lng = p_lng
    where id = p_appointment_id
    returning * into v_row;
  if not found then raise exception 'Appointment not found'; end if;
  return v_row;
end;
$function$;

grant execute on function public.set_position_appointment_geography(uuid, uuid) to authenticated;
grant execute on function public.update_position_appointment_location(uuid, text, double precision, double precision) to authenticated;
notify pgrst, 'reload schema';
