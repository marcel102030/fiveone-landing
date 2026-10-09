-- Métricas de leitura do blog (/para-ler).
-- Registra uma linha por "sessão de leitura" (page view), com tempo na página,
-- rolagem máxima, se chegou ao fim, origem do tráfego e tipo de dispositivo.
-- Sem dados pessoais: sessão anônima.

create table if not exists public.blog_post_view (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.platform_blog_post(id) on delete cascade,
  session_id text,
  duration_seconds integer,
  max_scroll_pct smallint,
  reached_end boolean default false,
  source text,        -- instagram | google | whatsapp | facebook | direct | other
  device_type text,   -- mobile | tablet | desktop
  created_at timestamptz not null default now()
);

create index if not exists idx_blog_post_view_post
  on public.blog_post_view (post_id, created_at);

-- Só o service role (Function /api/blog-track) grava; leitura é via RPC abaixo.
alter table public.blog_post_view enable row level security;

-- Agregados por post, nos últimos N dias. SECURITY DEFINER para o admin ler
-- sem expor as linhas cruas.
create or replace function public.get_blog_post_stats(days int default 30)
returns table (
  post_id uuid,
  views bigint,
  avg_seconds numeric,
  avg_scroll numeric,
  pct_reached_end numeric,
  sources jsonb
)
language sql
security definer
set search_path = public
as $$
  with base as (
    select *
    from public.blog_post_view
    where created_at >= now() - make_interval(days => days)
  ),
  src as (
    select post_id, coalesce(source, 'other') as source, count(*) as c
    from base
    group by post_id, coalesce(source, 'other')
  ),
  src_agg as (
    select post_id, jsonb_object_agg(source, c) as sources
    from src
    group by post_id
  )
  select
    b.post_id,
    count(*)::bigint as views,
    round(avg(b.duration_seconds))::numeric as avg_seconds,
    round(avg(b.max_scroll_pct))::numeric as avg_scroll,
    round(100.0 * avg((b.reached_end)::int))::numeric as pct_reached_end,
    coalesce(sa.sources, '{}'::jsonb) as sources
  from base b
  left join src_agg sa on sa.post_id = b.post_id
  group by b.post_id, sa.sources;
$$;

grant execute on function public.get_blog_post_stats(int) to authenticated, anon;
