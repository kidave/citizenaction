create or replace function public.update_position_appointment_dates(
  p_appointment_id uuid,
  p_started_at timestamptz,
  p_ended_at timestamptz default null
)
returns public.position_appointment
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_row public.position_appointment;
begin
  perform public.require_governance_admin();

  if p_appointment_id is null then
    raise exception 'Appointment is required';
  end if;
  if p_started_at is null then
    raise exception 'Start date is required';
  end if;
  if p_ended_at is not null and p_ended_at < p_started_at then
    raise exception 'End date cannot be earlier than start date';
  end if;

  update public.position_appointment
    set started_at = p_started_at,
        ended_at = p_ended_at,
        updated_at = now(),
        updated_by = auth.uid()
    where id = p_appointment_id
    returning * into v_row;

  if not found then
    raise exception 'Appointment not found';
  end if;

  return v_row;
end;
$function$;

revoke all on function public.update_position_appointment_dates(uuid, timestamptz, timestamptz) from public, anon;
grant execute on function public.update_position_appointment_dates(uuid, timestamptz, timestamptz) to authenticated;
