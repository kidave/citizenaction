-- Political parties are governance entities so appointments can reference them consistently.
alter type public.governance_type
  add value if not exists 'political_party';
