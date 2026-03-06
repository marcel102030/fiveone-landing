
CREATE OR REPLACE FUNCTION inc_comment_like(cid uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE platform_lesson_comment
  SET likes = likes + 1
  WHERE id = cid;
$$;
;
