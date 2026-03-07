-- Migration: RPCs da plataforma de ensino
--
-- Substitui múltiplas queries no frontend por chamadas únicas e atômicas:
--
--   get_reaction_state   → agrupa 3 queries de reactions em 1 (N+1 → 1)
--   mark_lesson_complete → UPSERT atômico de completion
--   get_lesson_with_progress → carrega player em 1 round-trip ao invés de 4+

-- ── RPC 1: get_reaction_state ─────────────────────────────────────────────────
-- Retorna contagens de likes/dislikes + reação do usuário autenticado.
-- Substitui: 2 × COUNT queries + 1 × SELECT em reactions.ts

CREATE OR REPLACE FUNCTION public.get_reaction_state(
  p_user_id   text,
  p_lesson_id text
)
RETURNS TABLE(
  like_count    bigint,
  dislike_count bigint,
  user_reaction text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    COUNT(*) FILTER (WHERE reaction = 'like')                          AS like_count,
    COUNT(*) FILTER (WHERE reaction = 'dislike')                       AS dislike_count,
    MAX(reaction) FILTER (WHERE user_id = lower(p_user_id))            AS user_reaction
  FROM public.platform_lesson_reaction
  WHERE lesson_id = p_lesson_id;
$$;

-- ── RPC 2: mark_lesson_complete ───────────────────────────────────────────────
-- UPSERT atômico que registra conclusão de lição.
-- Usa ON CONFLICT DO NOTHING para ser idempotente.

CREATE OR REPLACE FUNCTION public.mark_lesson_complete(
  p_user_email text,
  p_lesson_id  text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.platform_lesson_completion (user_id, lesson_id, completed_at)
  VALUES (lower(p_user_email), p_lesson_id, now())
  ON CONFLICT (user_id, lesson_id) DO NOTHING;
END;
$$;

-- ── RPC 3: get_lesson_with_progress ──────────────────────────────────────────
-- Carrega todos os dados do player em 1 única query (substitui 4+ round-trips):
--   - is_completed (se o usuário já concluiu)
--   - watched_seconds / duration_seconds / last_watched_at
--   - like_count / dislike_count / user_reaction

CREATE OR REPLACE FUNCTION public.get_lesson_with_progress(
  p_user_email text,
  p_lesson_id  text
)
RETURNS TABLE(
  is_completed     boolean,
  watched_seconds  integer,
  duration_seconds integer,
  last_watched_at  timestamptz,
  user_reaction    text,
  like_count       bigint,
  dislike_count    bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    (lc.user_id IS NOT NULL)::boolean                                          AS is_completed,
    COALESCE(up.watched_seconds,  0)::integer                                  AS watched_seconds,
    COALESCE(up.duration_seconds, 0)::integer                                  AS duration_seconds,
    up.last_at                                                                 AS last_watched_at,
    MAX(lr.reaction) FILTER (WHERE lr.user_id = lower(p_user_email))           AS user_reaction,
    COUNT(lr.lesson_id) FILTER (WHERE lr.reaction = 'like')                    AS like_count,
    COUNT(lr.lesson_id) FILTER (WHERE lr.reaction = 'dislike')                 AS dislike_count
  FROM public.platform_lesson l
  LEFT JOIN public.platform_user_progress    up
         ON l.id = up.lesson_id AND up.user_id = lower(p_user_email)
  LEFT JOIN public.platform_lesson_completion lc
         ON l.id = lc.lesson_id AND lc.user_id = lower(p_user_email)
  LEFT JOIN public.platform_lesson_reaction  lr
         ON l.id = lr.lesson_id
  WHERE l.id = p_lesson_id
  GROUP BY lc.user_id, up.watched_seconds, up.duration_seconds, up.last_at;
$$;
