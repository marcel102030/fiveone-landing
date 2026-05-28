-- ============================================================
-- Reações no blog (claps/insights/inspires) com contagem agregada.
-- 1. Colunas inteiras de contagem em platform_blog_post.
-- 2. RPC SECURITY DEFINER para anônimo incrementar (rate limit
--    leve via PostgreSQL não — anti-fraude é client-side localStorage).
-- ============================================================

alter table public.platform_blog_post
  add column if not exists reactions_clap     integer not null default 0,
  add column if not exists reactions_insight  integer not null default 0,
  add column if not exists reactions_inspire  integer not null default 0;

create or replace function public.increment_blog_reaction(
  p_post_id uuid,
  p_reaction text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_reaction = 'clap' then
    update platform_blog_post set reactions_clap = reactions_clap + 1
      where id = p_post_id and status = 'published';
  elsif p_reaction = 'insight' then
    update platform_blog_post set reactions_insight = reactions_insight + 1
      where id = p_post_id and status = 'published';
  elsif p_reaction = 'inspire' then
    update platform_blog_post set reactions_inspire = reactions_inspire + 1
      where id = p_post_id and status = 'published';
  end if;
end;
$$;

revoke all on function public.increment_blog_reaction(uuid, text) from public;
grant execute on function public.increment_blog_reaction(uuid, text) to anon, authenticated;

comment on function public.increment_blog_reaction(uuid, text) is
  'Incrementa contador de reação de um post publicado. Idempotência client-side via localStorage.';
