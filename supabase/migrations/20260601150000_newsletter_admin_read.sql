-- Permite que usuários autenticados (admins) leiam a lista de assinantes.
-- A tabela já bloqueia leitura pública; esta policy é só para o painel admin.
create policy "newsletter_authenticated_read"
  on public.platform_newsletter_subscriber for select
  to authenticated
  using (true);
