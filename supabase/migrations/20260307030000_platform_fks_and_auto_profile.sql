-- Migration: FKs com CASCADE + trigger auto-criação de platform_user_profile
--
-- 1. Remove dados órfãos (lesson_id sem correspondente em platform_lesson)
--    que ficaram porque não havia FK antes. São dados de testes/lições deletadas.
--
-- 2. Adiciona FKs de lesson_id → platform_lesson.id com ON DELETE CASCADE
--    em todas as tabelas de tracking. Ao deletar uma lição, todos os dados
--    associados (progresso, conclusão, reações, comentários) são removidos.
--
-- 3. Cria trigger para auto-criar platform_user_profile quando um novo
--    platform_user é inserido (elimina passo manual/esquecido no frontend).
--
-- 4. Backfill: cria perfis para os usuários que já existem sem perfil.

-- ── 1. Limpar dados órfãos ────────────────────────────────────────────────────

DELETE FROM public.platform_user_progress
WHERE lesson_id NOT IN (SELECT id FROM public.platform_lesson);

DELETE FROM public.platform_lesson_completion
WHERE lesson_id NOT IN (SELECT id FROM public.platform_lesson);

DELETE FROM public.platform_lesson_reaction
WHERE lesson_id NOT IN (SELECT id FROM public.platform_lesson);

-- Comentários: remover filhos antes dos pais para não violar a FK self-ref
DELETE FROM public.platform_lesson_comment
WHERE parent_id IS NOT NULL
  AND lesson_id NOT IN (SELECT id FROM public.platform_lesson);

DELETE FROM public.platform_lesson_comment
WHERE lesson_id NOT IN (SELECT id FROM public.platform_lesson);

-- ── 2. FKs lesson_id → platform_lesson.id ────────────────────────────────────

ALTER TABLE public.platform_user_progress
  ADD CONSTRAINT fk_progress_lesson
    FOREIGN KEY (lesson_id) REFERENCES public.platform_lesson(id)
    ON DELETE CASCADE;

ALTER TABLE public.platform_lesson_completion
  ADD CONSTRAINT fk_completion_lesson
    FOREIGN KEY (lesson_id) REFERENCES public.platform_lesson(id)
    ON DELETE CASCADE;

ALTER TABLE public.platform_lesson_reaction
  ADD CONSTRAINT fk_reaction_lesson
    FOREIGN KEY (lesson_id) REFERENCES public.platform_lesson(id)
    ON DELETE CASCADE;

ALTER TABLE public.platform_lesson_comment
  ADD CONSTRAINT fk_comment_lesson
    FOREIGN KEY (lesson_id) REFERENCES public.platform_lesson(id)
    ON DELETE CASCADE;

-- ── 3. Trigger: auto-criar platform_user_profile ao inserir platform_user ────

CREATE OR REPLACE FUNCTION public.auto_create_user_profile()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = public
AS $$
BEGIN
  INSERT INTO public.platform_user_profile (user_email)
  VALUES (NEW.email)
  ON CONFLICT (user_email) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_create_user_profile
  AFTER INSERT ON public.platform_user
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_user_profile();

-- ── 4. Backfill: perfis para usuários sem perfil ──────────────────────────────

INSERT INTO public.platform_user_profile (user_email)
SELECT pu.email
FROM public.platform_user pu
WHERE NOT EXISTS (
  SELECT 1 FROM public.platform_user_profile pp
  WHERE pp.user_email = pu.email
);
