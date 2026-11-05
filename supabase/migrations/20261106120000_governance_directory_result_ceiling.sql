-- Raise the directory RPC ceiling so the UI can paginate the full result set.
do $$
declare v_definition text;
begin
  select pg_get_functiondef('public.get_governance_directory(text,text,text,uuid,uuid,uuid,integer)'::regprocedure)
  into v_definition;
  if position('least(coalesce(p_limit,100),500)' in v_definition) = 0 then
    raise exception 'Expected governance directory limit expression was not found; inspect the RPC before applying.';
  end if;
  v_definition := replace(v_definition, 'least(coalesce(p_limit,100),500)', 'least(coalesce(p_limit,100),50000)');
  execute v_definition;
end;
$$;
