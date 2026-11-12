-- The application now reads governance directly. The legacy governance_unit name
-- is no longer needed, so remove the compatibility view and finish the consolidation.
drop view if exists public.governance_unit;
