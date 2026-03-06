-- Migration: Colunas desnormalizadas + triggers de contadores
--
-- Adiciona colunas de analytics em platform_lesson e platform_user para
-- permitir dashboards rápidos sem N+1 queries ao banco.
--
-- Os triggers mantêm os contadores sincronizados automaticamente.
-- O backfill inicial calcula os valores corretos a partir dos dados existentes.

-- ── 1. Colunas de analytics em platform_lesson ────────────────────────────────

ALTER TABLE public.platform_lesson
  ADD COLUMN IF NOT EXISTS views_count      integer      NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completion_count integer      NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_viewed_at   timestamptz;

-- ── 2. Colunas de analytics em platform_user ──────────────────────────────────

ALTER TABLE public.platform_user
  ADD COLUMN IF NOT EXISTS total_lessons_completed integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_login_at           timestamptz;

-- ── 3. Backfill: calcular valores iniciais a partir de dados existentes ────────

UPDATE public.platform_lesson l
SET
  views_count = (
    SELECT COUNT(*) FROM public.platform_user_progress up
    WHERE up.lesson_id = l.id
  ),
  completion_count = (
    SELECT COUNT(*) FROM public.platform_lesson_completion lc
    WHERE lc.lesson_id = l.id
  ),
  last_viewed_at = (
    SELECT MAX(up.last_at) FROM public.platform_user_progress up
    WHERE up.lesson_id = l.id
  );

UPDATE public.platform_user u
SET total_lessons_completed = (
  SELECT COUNT(*) FROM public.platform_lesson_completion lc
  WHERE lc.user_id = u.email
);

-- ── 4. Trigger: incrementar views_count + atualizar last_viewed_at ────────────

CREATE OR REPLACE FUNCTION public.trg_fn_update_lesson_views()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = public
AS $$
BEGIN
  UPDATE public.platform_lesson
  SET
    views_count    = views_count + 1,
    last_viewed_at = NEW.last_at
  WHERE id = NEW.lesson_id;
  RETURN NEW;
END;
$$;

-- Dispara apenas em INSERT (novo progresso = nova visualização)
CREATE TRIGGER trg_lesson_views_count
  AFTER INSERT ON public.platform_user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_update_lesson_views();

-- ── 5. Trigger: incrementar completion_count + total_lessons_completed ─────────

CREATE OR REPLACE FUNCTION public.trg_fn_update_lesson_completions()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = public
AS $$
BEGIN
  UPDATE public.platform_lesson
  SET completion_count = completion_count + 1
  WHERE id = NEW.lesson_id;

  UPDATE public.platform_user
  SET total_lessons_completed = total_lessons_completed + 1
  WHERE email = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Dispara apenas em INSERT (conclusão é evento único por ON CONFLICT DO NOTHING)
CREATE TRIGGER trg_lesson_completion_count
  AFTER INSERT ON public.platform_lesson_completion
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_update_lesson_completions();
