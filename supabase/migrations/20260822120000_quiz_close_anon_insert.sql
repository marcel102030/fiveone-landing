-- I11 — Fecha INSERT anônimo direto (PostgREST) nas tabelas do quiz.
--
-- Todas as escritas do app passam por Cloudflare Functions usando a
-- service_role key (que bypassa RLS). A policy de INSERT anônimo era, portanto,
-- superfície de ataque desnecessária: com a anon key (pública, no bundle),
-- um bot poderia inserir leads/linhas falsas direto via /rest/v1.
--
-- Removê-la NÃO quebra o app (o front nunca insere direto nessas tabelas — só
-- via /api). RLS permanece ativo; SELECT continua restrito a admin.

DROP POLICY IF EXISTS "quiz_insert_public"        ON public.quiz_response;
DROP POLICY IF EXISTS quiz_answer_insert_public   ON public.quiz_answer;
DROP POLICY IF EXISTS quiz_session_insert_public  ON public.quiz_session;

-- (Sem policy de INSERT para anon/authenticated, o RLS nega inserção direta.
--  A service_role usada pelas Cloudflare Functions ignora RLS e segue gravando.)
