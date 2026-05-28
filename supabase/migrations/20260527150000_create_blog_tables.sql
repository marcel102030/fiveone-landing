-- ============================================================
-- Etapa 3 — Blog/Insights dinâmico
-- Cria platform_blog_post + platform_blog_comment com RLS:
--   - Posts: publicados são públicos, admin tem CRUD total
--   - Comments: aprovados são públicos, anônimo pode inserir (status=pending),
--               admin modera (approve/reject)
-- ============================================================

create extension if not exists "pgcrypto";

-- ── Posts ────────────────────────────────────────────────────
create table if not exists public.platform_blog_post (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  subtitle          text,
  excerpt           text,
  cover_url         text,
  content_markdown  text not null,
  author_name       text not null default 'Five One',
  category          text not null,
  tags              text[] not null default '{}',
  takeaways         text[] not null default '{}',
  status            text not null default 'draft'
                      check (status in ('draft','published')),
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_blog_post_status_pub
  on public.platform_blog_post(status, published_at desc)
  where status = 'published';

create index if not exists idx_blog_post_category
  on public.platform_blog_post(category);

create index if not exists idx_blog_post_slug
  on public.platform_blog_post(slug);

-- ── Comments ─────────────────────────────────────────────────
create table if not exists public.platform_blog_comment (
  id            uuid primary key default gen_random_uuid(),
  post_id       uuid not null references public.platform_blog_post(id) on delete cascade,
  author_name   text not null,
  author_email  text,
  content       text not null,
  status        text not null default 'pending'
                  check (status in ('pending','approved','rejected')),
  ip_hash       text,
  user_agent    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_blog_comment_post on public.platform_blog_comment(post_id);
create index if not exists idx_blog_comment_status on public.platform_blog_comment(status);

-- ── Triggers updated_at (reusa função tg_set_updated_at) ─────
drop trigger if exists set_updated_at on public.platform_blog_post;
create trigger set_updated_at before update on public.platform_blog_post
  for each row execute function public.tg_set_updated_at();

drop trigger if exists set_updated_at on public.platform_blog_comment;
create trigger set_updated_at before update on public.platform_blog_comment
  for each row execute function public.tg_set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
alter table public.platform_blog_post    enable row level security;
alter table public.platform_blog_comment enable row level security;

-- Posts: leitura pública somente publicados
drop policy if exists "blog_post_select_public" on public.platform_blog_post;
create policy "blog_post_select_public" on public.platform_blog_post
  for select
  using (status = 'published');

-- Posts: admin tem CRUD total
drop policy if exists "blog_post_admin_all" on public.platform_blog_post;
create policy "blog_post_admin_all" on public.platform_blog_post
  for all
  using (
    exists (
      select 1
      from public.platform_user pu
      where lower(pu.email) = lower(((select auth.jwt()) ->> 'email'))
        and pu.role = 'ADMIN'
        and pu.is_active = true
    )
  )
  with check (
    exists (
      select 1
      from public.platform_user pu
      where lower(pu.email) = lower(((select auth.jwt()) ->> 'email'))
        and pu.role = 'ADMIN'
        and pu.is_active = true
    )
  );

-- Comments: leitura pública somente aprovados
drop policy if exists "blog_comment_select_approved" on public.platform_blog_comment;
create policy "blog_comment_select_approved" on public.platform_blog_comment
  for select
  using (status = 'approved');

-- Comments: anônimo pode inserir, sempre como pending
drop policy if exists "blog_comment_anon_insert" on public.platform_blog_comment;
create policy "blog_comment_anon_insert" on public.platform_blog_comment
  for insert
  with check (status = 'pending');

-- Comments: admin tem visão e ações totais (modera)
drop policy if exists "blog_comment_admin_all" on public.platform_blog_comment;
create policy "blog_comment_admin_all" on public.platform_blog_comment
  for all
  using (
    exists (
      select 1
      from public.platform_user pu
      where lower(pu.email) = lower(((select auth.jwt()) ->> 'email'))
        and pu.role = 'ADMIN'
        and pu.is_active = true
    )
  );

comment on table public.platform_blog_post
  is 'Posts do blog /insights. Editáveis pelo /admin/blog.';

comment on table public.platform_blog_comment
  is 'Comentários públicos com moderação. Status pending até admin aprovar.';
