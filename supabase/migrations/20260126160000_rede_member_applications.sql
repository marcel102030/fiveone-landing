-- Member applications and invite links for self-registration

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'rede_member_type'
      and n.nspname = 'public'
  ) then
    create type public.rede_member_type as enum ('membro', 'visitante', 'outro');
  end if;
end $$;

alter table if exists public.rede_member
  add column if not exists member_type public.rede_member_type not null default 'membro';

create table if not exists public.rede_member_invite (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  status text not null default 'ativo',
  house_id uuid references public.rede_house_church(id) on delete set null,
  presbitero_id uuid references public.rede_presbitero(id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rede_member_invite_token_idx on public.rede_member_invite (token);

create table if not exists public.rede_member_application (
  id uuid primary key default gen_random_uuid(),
  invite_token text,
  full_name text not null,
  email text,
  phone text,
  city text,
  state text,
  address text,
  member_type public.rede_member_type not null default 'membro',
  house_id uuid references public.rede_house_church(id) on delete set null,
  gifts public.fivefold_ministry[] not null default '{}',
  wants_preach_house boolean not null default false,
  wants_preach_network boolean not null default false,
  wants_bible_study boolean not null default false,
  wants_open_house boolean not null default false,
  wants_be_presbitero boolean not null default false,
  wants_be_ministry_leader boolean not null default false,
  wants_discipleship boolean not null default false,
  wants_serve_worship boolean not null default false,
  wants_serve_intercession boolean not null default false,
  wants_serve_children boolean not null default false,
  wants_serve_media boolean not null default false,
  available_for_training boolean not null default false,
  available_for_missions boolean not null default false,
  notes text,
  status text not null default 'pendente',
  reviewed_at timestamptz,
  approved_member_id uuid references public.rede_member(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rede_member_application_status_idx on public.rede_member_application (status);
create index if not exists rede_member_application_created_idx on public.rede_member_application (created_at desc);
create index if not exists rede_member_application_invite_idx on public.rede_member_application (invite_token);

-- updated_at triggers

drop trigger if exists set_rede_member_invite_updated_at on public.rede_member_invite;
create trigger set_rede_member_invite_updated_at
before update on public.rede_member_invite
for each row execute function public.set_updated_at();

drop trigger if exists set_rede_member_application_updated_at on public.rede_member_application;
create trigger set_rede_member_application_updated_at
before update on public.rede_member_application
for each row execute function public.set_updated_at();

-- RLS

alter table public.rede_member_invite enable row level security;
alter table public.rede_member_application enable row level security;

drop policy if exists rede_member_invite_rw on public.rede_member_invite;
create policy rede_member_invite_rw on public.rede_member_invite
for all to anon, authenticated
using (true)
with check (true);

drop policy if exists rede_member_application_select on public.rede_member_application;
create policy rede_member_application_select on public.rede_member_application
for select to anon, authenticated
using (true);

drop policy if exists rede_member_application_insert on public.rede_member_application;
create policy rede_member_application_insert on public.rede_member_application
for insert to anon, authenticated
with check (
  invite_token is not null
  and exists (
    select 1
    from public.rede_member_invite i
    where i.token = invite_token
      and i.status = 'ativo'
      and (i.expires_at is null or i.expires_at > now())
  )
);

drop policy if exists rede_member_application_update on public.rede_member_application;
create policy rede_member_application_update on public.rede_member_application
for update to anon, authenticated
using (true)
with check (true);

drop policy if exists rede_member_application_delete on public.rede_member_application;
create policy rede_member_application_delete on public.rede_member_application
for delete to anon, authenticated
using (true);
