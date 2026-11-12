-- Digital Sansad party records need a first-class governance type.
-- Person career history continues to use the existing position and position_appointment model.
ALTER TYPE public.governance_type ADD VALUE IF NOT EXISTS 'political_party';
