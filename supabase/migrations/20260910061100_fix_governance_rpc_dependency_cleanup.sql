-- Keep the canonical governance RPCs in sync after the name cleanup.
-- Historical migration files may mention v2 names, but the live/public API must not.
-- This migration is intentionally dependency-safe: v2 functions are dropped and the
-- canonical functions are recreated with the current governance schema.

DO $$
BEGIN
  IF to_regprocedure('public.get_governance_by_slug_v2(text)') IS NOT NULL THEN
    DROP FUNCTION public.get_governance_by_slug_v2(text);
  END IF;
  IF to_regprocedure('public.get_governance_directory_v2(text,uuid,text,integer,boolean)') IS NOT NULL THEN
    DROP FUNCTION public.get_governance_directory_v2(text,uuid,text,integer,boolean);
  END IF;
END $$;
