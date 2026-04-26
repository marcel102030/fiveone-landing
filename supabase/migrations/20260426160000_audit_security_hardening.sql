-- =============================================================================
-- Auditoria 2026-04-26 — endurecimento de segurança e correções de RLS
-- =============================================================================
-- Pré-requisitos: função public.is_platform_admin() já existe (SECURITY DEFINER).
--
-- Este arquivo agrupa apenas mudanças de banco que NÃO podem ser feitas só pelo
-- código TypeScript. Aplicar com revisão — algumas políticas podem alterar o
-- comportamento de usuários autenticados que hoje confiam no relaxamento atual.
-- =============================================================================

-- 1. platform_enrollment ------------------------------------------------------
-- Hoje só existe SELECT para o próprio aluno; INSERT/UPDATE/DELETE estão
-- bloqueados, fazendo o painel administrativo "salvar matrícula" silenciar
-- erros (ou explodir, dependendo da chamada).

DROP POLICY IF EXISTS "aluno lê suas matrículas" ON public.platform_enrollment;

CREATE POLICY enrollment_select_own_or_admin
  ON public.platform_enrollment
  FOR SELECT
  TO authenticated
  USING (
    user_email = (SELECT auth.email())
    OR (SELECT public.is_platform_admin())
  );

CREATE POLICY enrollment_admin_insert
  ON public.platform_enrollment
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_platform_admin()));

CREATE POLICY enrollment_admin_update
  ON public.platform_enrollment
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_platform_admin()))
  WITH CHECK ((SELECT public.is_platform_admin()));

CREATE POLICY enrollment_admin_delete
  ON public.platform_enrollment
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_platform_admin()));

-- FK de course_id → ministry id (evita órfãos quando um curso é apagado).
ALTER TABLE public.platform_enrollment
  ADD CONSTRAINT platform_enrollment_course_id_fkey
  FOREIGN KEY (course_id) REFERENCES public.platform_ministry(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_enrollment_course
  ON public.platform_enrollment (course_id);

-- 2. platform_user_invite -----------------------------------------------------
-- A política atual permite que QUALQUER anon liste os e-mails de convites
-- ainda válidos. O fluxo de aceite usa o token único; portanto a busca deve
-- ser por token, não por listagem aberta.

DROP POLICY IF EXISTS invite_select_active ON public.platform_user_invite;

-- Aluno autenticado pode validar SEU convite (e-mail bate com auth.email()).
CREATE POLICY invite_select_for_owner
  ON public.platform_user_invite
  FOR SELECT
  TO authenticated
  USING (
    used_at IS NULL
    AND (expires_at IS NULL OR expires_at > now())
    AND lower(email) = lower((SELECT auth.email()))
  );

-- Para validar convite a partir do token (via fluxo público), use uma RPC
-- SECURITY DEFINER dedicada — nunca exponha a tabela.
CREATE OR REPLACE FUNCTION public.fetch_invite_by_token(p_token text)
  RETURNS TABLE(id uuid, email text, formation text, expires_at timestamptz, used_at timestamptz)
  LANGUAGE sql
  SECURITY DEFINER
  STABLE
  SET search_path = public
AS $$
  SELECT id, email, formation, expires_at, used_at
  FROM public.platform_user_invite
  WHERE token = p_token
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.fetch_invite_by_token(text) TO anon, authenticated;

-- E-mail único por convite ativo (evita convites duplicados sem controle).
CREATE UNIQUE INDEX IF NOT EXISTS uq_platform_user_invite_email_active
  ON public.platform_user_invite (lower(email))
  WHERE used_at IS NULL;

-- 3. platform_user ------------------------------------------------------------
-- Hoje qualquer aluno autenticado pode listar todos os e-mails da base.
-- Restringe o SELECT ao próprio registro ou ao admin.

DROP POLICY IF EXISTS platform_user_select ON public.platform_user;

CREATE POLICY platform_user_select_own_or_admin
  ON public.platform_user
  FOR SELECT
  TO authenticated
  USING (
    email = (SELECT auth.email())
    OR (SELECT public.is_platform_admin())
  );

-- 4. platform_lesson — exigir matrícula para ver o conteúdo --------------------
-- Atualmente qualquer authenticated lê toda aula publicada de qualquer curso.
-- Para uma plataforma comercial, a matrícula deve gatilhar o acesso.

DROP POLICY IF EXISTS lesson_select_auth ON public.platform_lesson;

CREATE POLICY lesson_select_enrolled_or_admin
  ON public.platform_lesson
  FOR SELECT
  TO authenticated
  USING (
    (SELECT public.is_platform_admin())
    OR EXISTS (
      SELECT 1
      FROM public.platform_module m
      JOIN public.platform_enrollment e
        ON e.course_id = m.ministry_id
       AND e.user_email = (SELECT auth.email())
      WHERE m.id = platform_lesson.module_id
    )
  );

-- Espelho na tabela de módulos (do contrário um aluno sem matrícula ainda lê
-- a estrutura dos módulos do curso premium).
DROP POLICY IF EXISTS module_select_auth ON public.platform_module;

CREATE POLICY module_select_enrolled_or_admin
  ON public.platform_module
  FOR SELECT
  TO authenticated
  USING (
    (SELECT public.is_platform_admin())
    OR EXISTS (
      SELECT 1
      FROM public.platform_enrollment e
      WHERE e.course_id = platform_module.ministry_id
        AND e.user_email = (SELECT auth.email())
    )
  );

-- platform_ministry: mantém o SELECT aberto (cursos vitrine). Se quiser
-- esconder cursos não matriculados, descomente abaixo.
-- DROP POLICY IF EXISTS ministry_select_auth ON public.platform_ministry;
-- CREATE POLICY ministry_select_enrolled_or_admin
--   ON public.platform_ministry
--   FOR SELECT
--   TO authenticated
--   USING (
--     (SELECT public.is_platform_admin())
--     OR EXISTS (
--       SELECT 1 FROM public.platform_enrollment e
--       WHERE e.course_id = platform_ministry.id
--         AND e.user_email = (SELECT auth.email())
--     )
--   );

-- 5. platform_certificate — verificação pública por verify_code ----------------
-- A página /certificado/:verifyCode hoje quebra porque o RLS exige user_id =
-- auth.email(). Criamos uma RPC pública que devolve apenas o necessário para
-- exibição (sem expor o e-mail completo do aluno).

CREATE OR REPLACE FUNCTION public.fetch_certificate_by_code(p_code text)
  RETURNS TABLE(
    id uuid,
    issued_at timestamptz,
    ministry_id text,
    ministry_title text,
    user_display_name text
  )
  LANGUAGE sql
  SECURITY DEFINER
  STABLE
  SET search_path = public
AS $$
  SELECT
    c.id,
    c.issued_at,
    c.ministry_id,
    m.title AS ministry_title,
    coalesce(p.display_name, u.name, '') AS user_display_name
  FROM public.platform_certificate c
  LEFT JOIN public.platform_ministry m       ON m.id = c.ministry_id
  LEFT JOIN public.platform_user u           ON u.email = c.user_id
  LEFT JOIN public.platform_user_profile p   ON p.user_email = c.user_id
  WHERE c.verify_code = p_code
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.fetch_certificate_by_code(text) TO anon, authenticated;

-- 6. platform_lesson_completion — FK para platform_user -----------------------
-- Hoje a completion não tem FK em user_id; deletando o aluno restam órfãos.

ALTER TABLE public.platform_lesson_completion
  ADD CONSTRAINT platform_lesson_completion_user_fkey
  FOREIGN KEY (user_id) REFERENCES public.platform_user(email) ON DELETE CASCADE;

-- 7. Índice faltando para FK de certificado (advisor de performance) ----------
CREATE INDEX IF NOT EXISTS idx_certificate_ministry
  ON public.platform_certificate (ministry_id);
