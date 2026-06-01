-- ============================================================
-- Assinantes da newsletter "Para Ler" (blog Five One).
-- ============================================================

create table if not exists public.platform_newsletter_subscriber (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  name          text,
  source        text not null default 'blog', -- 'blog' | 'home' | 'landing'
  confirmed     boolean not null default false,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  constraint uq_newsletter_email unique (email)
);

-- RLS: leitura somente por admins (service_role); inserção pública via Pages Function
alter table public.platform_newsletter_subscriber enable row level security;

-- Anônimo NÃO pode ler nem escrever diretamente (tudo passa pela Pages Function)
create policy "newsletter_no_public_read"
  on public.platform_newsletter_subscriber for select
  using (false);

create policy "newsletter_no_public_insert"
  on public.platform_newsletter_subscriber for insert
  with check (false);

-- Índice pra busca de e-mails confirmados ao enviar notificações
create index if not exists platform_newsletter_subscriber_confirmed_idx
  on public.platform_newsletter_subscriber (confirmed)
  where confirmed = true;

comment on table public.platform_newsletter_subscriber is
  'Assinantes da newsletter Para Ler. Inserção via Pages Function /api/newsletter-subscribe.';
