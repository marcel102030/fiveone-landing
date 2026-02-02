-- Link platform users to rede members and add role

alter table if exists public.platform_user
  add column if not exists role text not null default 'STUDENT',
  add column if not exists member_id uuid references public.rede_member(id) on delete set null;

create index if not exists platform_user_member_id_idx on public.platform_user (member_id);
-- Enforce 1:1 when member_id is set (multiple NULLs allowed)
create unique index if not exists platform_user_member_id_unique on public.platform_user (member_id);
