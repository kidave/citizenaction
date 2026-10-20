-- Normalize frequently queried contact and location fields across governance entities.
-- Keep legacy metadata values intact during rollout; application reads columns first,
-- then metadata as a compatibility fallback.

ALTER TABLE public."position"
  ADD COLUMN IF NOT EXISTS official_phone text,
  ADD COLUMN IF NOT EXISTS official_email text,
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision;

ALTER TABLE public.position_appointment
  ADD COLUMN IF NOT EXISTS official_phone text,
  ADD COLUMN IF NOT EXISTS official_email text;

-- Backfill first-class fields from legacy JSON metadata without overwriting
-- values that may already have been entered into the new columns.
UPDATE public."position"
SET official_phone = COALESCE(NULLIF(btrim(official_phone), ''), NULLIF(btrim(metadata->>'official_phone'), '')),
    official_email = COALESCE(NULLIF(btrim(official_email), ''), NULLIF(btrim(metadata->>'official_email'), '')),
    lat = COALESCE(lat, NULLIF(metadata->>'office_lat', '')::double precision),
    lng = COALESCE(lng, NULLIF(metadata->>'office_lng', '')::double precision)
WHERE official_phone IS NULL
   OR official_email IS NULL
   OR lat IS NULL
   OR lng IS NULL;

UPDATE public.position_appointment
SET official_phone = COALESCE(NULLIF(btrim(official_phone), ''), NULLIF(btrim(metadata->>'official_phone'), '')),
    official_email = COALESCE(NULLIF(btrim(official_email), ''), NULLIF(btrim(metadata->>'official_email'), '')),
    lat = COALESCE(lat, NULLIF(metadata->>'lat', '')::double precision, NULLIF(metadata->>'office_lat', '')::double precision),
    lng = COALESCE(lng, NULLIF(metadata->>'lng', '')::double precision, NULLIF(metadata->>'office_lng', '')::double precision)
WHERE official_phone IS NULL
   OR official_email IS NULL
   OR lat IS NULL
   OR lng IS NULL;

COMMENT ON COLUMN public."position".official_phone IS 'Official contact phone for this position; falls back to organization when unset.';
COMMENT ON COLUMN public."position".official_email IS 'Official contact email for this position; falls back to organization when unset.';
COMMENT ON COLUMN public."position".lat IS 'Latitude of the position office/posting address.';
COMMENT ON COLUMN public."position".lng IS 'Longitude of the position office/posting address.';
COMMENT ON COLUMN public.position_appointment.official_phone IS 'Appointment-specific official contact phone override.';
COMMENT ON COLUMN public.position_appointment.official_email IS 'Appointment-specific official contact email override.';
