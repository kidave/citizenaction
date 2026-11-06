-- Add organisation types used by the domain-aware organisation taxonomy.
-- Keep enum additions isolated so later migrations can safely use the new values.
alter type public.governance_type add value if not exists 'parliament';
alter type public.governance_type add value if not exists 'bureau';
alter type public.governance_type add value if not exists 'local_government';
alter type public.governance_type add value if not exists 'enterprise';
