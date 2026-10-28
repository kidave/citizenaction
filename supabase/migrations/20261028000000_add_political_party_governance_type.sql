-- Digital Sansad party records need a first-class governance type.
-- Apply this migration before running the importer with --apply.
ALTER TYPE public.governance_type ADD VALUE IF NOT EXISTS 'political_party';
