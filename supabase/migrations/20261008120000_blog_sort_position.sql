-- Ordenação manual dos posts do blog (/para-ler e admin).
-- Adiciona sort_position; a lista ordena por sort_position (asc, nulls por último)
-- e, como desempate/fallback, por updated_at desc.

alter table public.platform_blog_post
  add column if not exists sort_position integer;

-- Backfill: dá posição inicial seguindo a ordem atual (updated_at desc),
-- só para quem ainda está sem posição.
with ordered as (
  select id, row_number() over (order by updated_at desc) as rn
  from public.platform_blog_post
)
update public.platform_blog_post p
set sort_position = o.rn
from ordered o
where o.id = p.id and p.sort_position is null;

create index if not exists idx_blog_post_sort_position
  on public.platform_blog_post (sort_position);
