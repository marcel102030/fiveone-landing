-- Add audit fields for members and applications

alter table if exists public.rede_member
  add column if not exists created_by_member_id uuid references public.rede_member(id) on delete set null,
  add column if not exists updated_by_member_id uuid references public.rede_member(id) on delete set null;

alter table if exists public.rede_member_application
  add column if not exists created_by_member_id uuid references public.rede_member(id) on delete set null,
  add column if not exists updated_by_member_id uuid references public.rede_member(id) on delete set null;

create index if not exists rede_member_created_by_idx on public.rede_member (created_by_member_id);
create index if not exists rede_member_updated_by_idx on public.rede_member (updated_by_member_id);
create index if not exists rede_member_application_created_by_idx on public.rede_member_application (created_by_member_id);
create index if not exists rede_member_application_updated_by_idx on public.rede_member_application (updated_by_member_id);
