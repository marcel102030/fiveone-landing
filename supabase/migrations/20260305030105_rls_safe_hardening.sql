
-- =====================================================================
-- RLS HARDENING - FASE SEGURA
-- =====================================================================

-- rede_member_application: INSERT público, leitura/edição só autenticado
DROP POLICY IF EXISTS "rede_member_application_select" ON public.rede_member_application;
DROP POLICY IF EXISTS "rede_member_application_insert" ON public.rede_member_application;
DROP POLICY IF EXISTS "rede_member_application_update" ON public.rede_member_application;
DROP POLICY IF EXISTS "rede_member_application_delete" ON public.rede_member_application;

CREATE POLICY "rede_member_application_insert_public" ON public.rede_member_application
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "rede_member_application_select_auth" ON public.rede_member_application
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "rede_member_application_update_auth" ON public.rede_member_application
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "rede_member_application_delete_auth" ON public.rede_member_application
  FOR DELETE TO authenticated USING (true);

-- rede_visitor_application: mesmo padrão
DROP POLICY IF EXISTS "rede_visitor_application_select" ON public.rede_visitor_application;
DROP POLICY IF EXISTS "rede_visitor_application_insert" ON public.rede_visitor_application;
DROP POLICY IF EXISTS "rede_visitor_application_update" ON public.rede_visitor_application;
DROP POLICY IF EXISTS "rede_visitor_application_delete" ON public.rede_visitor_application;

CREATE POLICY "rede_visitor_application_insert_public" ON public.rede_visitor_application
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "rede_visitor_application_select_auth" ON public.rede_visitor_application
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "rede_visitor_application_update_auth" ON public.rede_visitor_application
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "rede_visitor_application_delete_auth" ON public.rede_visitor_application
  FOR DELETE TO authenticated USING (true);

-- Habilitar RLS em church e service_request
ALTER TABLE public.church ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_request ENABLE ROW LEVEL SECURITY;

-- church: leitura pública, escrita autenticado
CREATE POLICY "church_select_public" ON public.church
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "church_write_auth" ON public.church
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "church_update_auth" ON public.church
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- service_request: INSERT público (formulário do site), leitura só autenticado
CREATE POLICY "service_request_insert_public" ON public.service_request
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "service_request_select_auth" ON public.service_request
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "service_request_update_auth" ON public.service_request
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
;
