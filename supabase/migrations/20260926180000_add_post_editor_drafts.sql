CREATE OR REPLACE FUNCTION public.create_post_draft(
  p_space_ids uuid[] DEFAULT '{}',
  p_title text DEFAULT NULL,
  p_content text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}',
  p_start_at timestamptz DEFAULT NULL,
  p_end_at timestamptz DEFAULT NULL,
  p_lat double precision DEFAULT NULL,
  p_lng double precision DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_governance_ids jsonb DEFAULT '[]',
  p_content_json jsonb DEFAULT NULL,
  p_content_format text DEFAULT 'text'
)
RETURNS public.post
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_catalog
AS $$
DECLARE
  v_post public.post;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_content_format NOT IN ('text', 'editorjs') THEN
    RAISE EXCEPTION 'Invalid content format: %', p_content_format;
  END IF;

  IF p_content_format = 'editorjs' AND p_content_json IS NULL THEN
    p_content_json := jsonb_build_object('time', extract(epoch from now()) * 1000, 'blocks', '[]'::jsonb);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM unnest(coalesce(p_space_ids, '{}')) AS s(space_id)
    WHERE NOT public.can_attach_post_to_space(s.space_id, auth.uid())
  ) THEN
    RAISE EXCEPTION 'You must be an active member of every Space attached to this post';
  END IF;

  INSERT INTO public.post (
    author_id, title, content, content_json, content_format, metadata,
    start_at, end_at, lat, lng, address, status
  )
  VALUES (
    auth.uid(), p_title, p_content, p_content_json, p_content_format,
    coalesce(p_metadata, '{}'), p_start_at, p_end_at, p_lat, p_lng, p_address, 'draft'
  )
  RETURNING * INTO v_post;

  INSERT INTO public.post_space (post_id, space_id)
  SELECT v_post.id, x
  FROM unnest(coalesce(p_space_ids, '{}')) AS t(x)
  WHERE x IS NOT NULL
  ON CONFLICT (post_id, space_id) DO NOTHING;

  IF p_governance_ids IS NOT NULL THEN
    INSERT INTO public.post_governance (post_id, governance_id)
    SELECT v_post.id, x::uuid
    FROM jsonb_array_elements_text(p_governance_ids) AS t(x)
    WHERE x IS NOT NULL AND x <> ''
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_post;
END;
$$;

CREATE OR REPLACE FUNCTION public.publish_post(p_post_id uuid)
RETURNS public.post
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_catalog
AS $$
DECLARE
  v_post public.post;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT public.can_manage_post(p_post_id, auth.uid()) THEN
    RAISE EXCEPTION 'You do not have permission to publish this post';
  END IF;

  UPDATE public.post
  SET status = 'published', updated_at = now()
  WHERE id = p_post_id
    AND coalesce(status, 'published') = 'draft'
  RETURNING * INTO v_post;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draft not found';
  END IF;

  RETURN v_post;
END;
$$;

REVOKE ALL ON FUNCTION public.create_post_draft(uuid[], text, text, jsonb, timestamptz, timestamptz, double precision, double precision, text, jsonb, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_post_draft(uuid[], text, text, jsonb, timestamptz, timestamptz, double precision, double precision, text, jsonb, jsonb, text) TO authenticated;

REVOKE ALL ON FUNCTION public.publish_post(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_post(uuid) TO authenticated;
