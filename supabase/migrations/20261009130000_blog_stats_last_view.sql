-- Adiciona "última leitura" (max created_at) aos agregados do blog.
-- Mudar o tipo de retorno exige recriar a função (drop + create).

drop function if exists public.get_blog_post_stats(int);

create function public.get_blog_post_stats(days int default 30)
returns table (
  post_id uuid,
  views bigint,
  avg_seconds numeric,
  avg_scroll numeric,
  pct_reached_end numeric,
  sources jsonb,
  last_view timestamptz
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
    coalesce(sa.sources, '{}'::jsonb) as sources,
    max(b.created_at) as last_view
  from base b
  left join src_agg sa on sa.post_id = b.post_id
  group by b.post_id, sa.sources;
$$;

grant execute on function public.get_blog_post_stats(int) to authenticated, anon;
