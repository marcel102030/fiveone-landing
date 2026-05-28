-- ============================================================
-- Post em destaque na página de Insights (/insights).
-- Antes: destaque = post publicado mais recente (implícito).
-- Agora: o admin marca manualmente UM post como destaque.
-- ============================================================

alter table public.platform_blog_post
  add column if not exists is_featured boolean not null default false;

-- Garante no máximo UM post em destaque por vez. O serviço (TS) limpa o
-- destaque anterior antes de marcar o novo; este índice é a rede de segurança
-- contra estados inconsistentes (ex.: edição manual no banco).
create unique index if not exists platform_blog_post_one_featured
  on public.platform_blog_post (is_featured)
  where is_featured;

comment on column public.platform_blog_post.is_featured is
  'Quando true, este post ocupa o card de destaque em /insights. No máximo um por vez.';
