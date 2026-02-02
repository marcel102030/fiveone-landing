-- Notices and events (calendar)

create table if not exists public.rede_notice (
  id uuid primary key default gen_random_uuid(),
  house_id uuid references public.rede_house_church(id) on delete set null,
  title text not null,
  content text not null,
  audience text not null default 'rede',
  created_by_member_id uuid references public.rede_member(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rede_notice_house_idx on public.rede_notice (house_id);
create index if not exists rede_notice_created_idx on public.rede_notice (created_at desc);

drop trigger if exists set_rede_notice_updated_at on public.rede_notice;
create trigger set_rede_notice_updated_at
before update on public.rede_notice
for each row execute function public.set_updated_at();

create table if not exists public.rede_event (
  id uuid primary key default gen_random_uuid(),
  house_id uuid references public.rede_house_church(id) on delete set null,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  audience text not null default 'rede',
  created_by_member_id uuid references public.rede_member(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rede_event_house_idx on public.rede_event (house_id);
create index if not exists rede_event_start_idx on public.rede_event (start_at);

drop trigger if exists set_rede_event_updated_at on public.rede_event;
create trigger set_rede_event_updated_at
before update on public.rede_event
for each row execute function public.set_updated_at();

alter table public.rede_notice enable row level security;
alter table public.rede_event enable row level security;

drop policy if exists rede_notice_rw on public.rede_notice;
create policy rede_notice_rw on public.rede_notice
for all to anon, authenticated
using (true)
with check (true);

drop policy if exists rede_event_rw on public.rede_event;
create policy rede_event_rw on public.rede_event
for all to anon, authenticated
using (true)
with check (true);
