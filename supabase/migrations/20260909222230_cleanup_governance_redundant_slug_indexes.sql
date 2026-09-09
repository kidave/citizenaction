-- Keep one canonical unique slug index. The other slug indexes are duplicate legacy indexes.
drop index if exists public.governance_entity_slug_uidx;
drop index if exists public.governance_entity_slug_unique;
