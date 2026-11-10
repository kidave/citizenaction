-- Assembly constituencies are direct children of their state.
-- Parliamentary constituencies and assembly constituencies are sibling
-- political geography levels under a state.
update public.geographies as assembly
set parent_id = state.id
from public.geographies as parliament
join public.geographies as state
  on state.id = parliament.parent_id
 and state.geography_type = 'state'
where assembly.parent_id = parliament.id
  and assembly.geography_type = 'assembly_constituency'
  and assembly.boundary_category = 'political'
  and parliament.geography_type = 'parliamentary_constituency'
  and parliament.boundary_category = 'political';

do $$
declare
  remaining_children bigint;
begin
  select count(*)
    into remaining_children
  from public.geographies assembly
  join public.geographies parliament on parliament.id = assembly.parent_id
  where assembly.geography_type = 'assembly_constituency'
    and parliament.geography_type = 'parliamentary_constituency';

  if remaining_children > 0 then
    raise exception 'Assembly hierarchy migration incomplete: % assembly constituencies still have parliamentary parents', remaining_children;
  end if;
end $$;
