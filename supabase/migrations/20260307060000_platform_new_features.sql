-- Migration: Novos recursos da plataforma de ensino
--
-- 6a. Tabela platform_favorite_lesson — favoritar aulas
-- 6b. Tabela platform_certificate     — certificados de conclusão de ministério
-- 6c. Full-text search                — coluna search_vector + índice GIN + RPC

-- ── 6a. Favoritos ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.platform_favorite_lesson (
  user_id    text        NOT NULL REFERENCES public.platform_user(email)  ON DELETE CASCADE,
  lesson_id  text        NOT NULL REFERENCES public.platform_lesson(id)   ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

ALTER TABLE public.platform_favorite_lesson ENABLE ROW LEVEL SECURITY;

-- Usuário só acessa seus próprios favoritos
CREATE POLICY "favorites_own" ON public.platform_favorite_lesson
  FOR ALL
  TO authenticated
  USING  (user_id = (SELECT auth.email()))
  WITH CHECK (user_id = (SELECT auth.email()));

CREATE INDEX idx_favorite_lesson_user
  ON public.platform_favorite_lesson (user_id, created_at DESC);

-- ── 6b. Certificados ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.platform_certificate (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      text        NOT NULL REFERENCES public.platform_user(email)    ON DELETE CASCADE,
  ministry_id  text        NOT NULL REFERENCES public.platform_ministry(id)   ON DELETE RESTRICT,
  issued_at    timestamptz NOT NULL DEFAULT now(),
  file_url     text,
  verify_code  text        UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex')
);

ALTER TABLE public.platform_certificate ENABLE ROW LEVEL SECURITY;

-- Aluno vê apenas os próprios; admin vê todos
CREATE POLICY "cert_select" ON public.platform_certificate
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.email())
    OR (SELECT public.is_platform_admin())
  );

-- Apenas admin emite certificados
CREATE POLICY "cert_insert_admin" ON public.platform_certificate
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_platform_admin()));

-- Apenas admin pode deletar/atualizar certificados
CREATE POLICY "cert_modify_admin" ON public.platform_certificate
  FOR ALL
  TO authenticated
  USING ((SELECT public.is_platform_admin()));

CREATE INDEX idx_certificate_user_ministry
  ON public.platform_certificate (user_id, ministry_id);

-- ── 6c. Full-text search ──────────────────────────────────────────────────────

-- Coluna gerada automaticamente — atualizada sempre que title/subtitle/etc mudam
ALTER TABLE public.platform_lesson
  ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector(
        'portuguese',
        coalesce(title,        '') || ' ' ||
        coalesce(subtitle,     '') || ' ' ||
        coalesce(description,  '') || ' ' ||
        coalesce(subject_name, '') || ' ' ||
        coalesce(instructor,   '')
      )
    ) STORED;

-- Índice GIN para buscas full-text eficientes
CREATE INDEX IF NOT EXISTS idx_lesson_fts
  ON public.platform_lesson USING gin(search_vector);

-- RPC: search_lessons — busca full-text com filtro opcional por ministério
CREATE OR REPLACE FUNCTION public.search_lessons(
  p_query       text,
  p_ministry_id text DEFAULT NULL
)
RETURNS SETOF public.platform_lesson
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT l.*
  FROM public.platform_lesson l
  JOIN public.platform_module m ON l.module_id = m.id
  WHERE l.status     = 'published'
    AND l.is_active  = true
    AND (p_ministry_id IS NULL OR m.ministry_id = p_ministry_id)
    AND (
      p_query IS NULL
      OR p_query = ''
      OR l.search_vector @@ websearch_to_tsquery('portuguese', p_query)
    )
  ORDER BY
    CASE
      WHEN p_query IS NULL OR p_query = '' THEN 0
      ELSE -ts_rank(l.search_vector, websearch_to_tsquery('portuguese', p_query))
    END,
    l.views_count DESC
  LIMIT 50;
$$;
