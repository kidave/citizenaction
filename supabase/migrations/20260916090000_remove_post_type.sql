-- Remove the legacy post type once application code no longer sends or reads it.
ALTER TABLE public.post
DROP COLUMN IF EXISTS type;
