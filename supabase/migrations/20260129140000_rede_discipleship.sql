-- Discipleship pairs and sessions

create table if not exists public.rede_discipleship_pair (
  id uuid primary key default gen_random_uuid(),
  discipler_member_id uuid not null references public.rede_member(id) on delete cascade,
  disciple_member_id uuid not null references public.rede_member(id) on delete cascade,
  status text not null default 'ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (discipler_member_id, disciple_member_id)
);

create index if not exists rede_discipleship_pair_discipler_idx on public.rede_discipleship_pair (discipler_member_id);
create index if not exists rede_discipleship_pair_disciple_idx on public.rede_discipleship_pair (disciple_member_id);

drop trigger if exists set_rede_discipleship_pair_updated_at on public.rede_discipleship_pair;
create trigger set_rede_discipleship_pair_updated_at
before update on public.rede_discipleship_pair
for each row execute function public.set_updated_at();

create table if not exists public.rede_discipleship_session (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references public.rede_discipleship_pair(id) on delete cascade,
  session_date date not null default now(),
  topics text,
  tasks text,
  notes text,
  visibility text not null default 'disciple',
  created_by_member_id uuid references public.rede_member(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rede_discipleship_session_pair_idx on public.rede_discipleship_session (pair_id);
create index if not exists rede_discipleship_session_date_idx on public.rede_discipleship_session (session_date desc);

drop trigger if exists set_rede_discipleship_session_updated_at on public.rede_discipleship_session;
create trigger set_rede_discipleship_session_updated_at
before update on public.rede_discipleship_session
for each row execute function public.set_updated_at();

alter table public.rede_discipleship_pair enable row level security;
alter table public.rede_discipleship_session enable row level security;

drop policy if exists rede_discipleship_pair_rw on public.rede_discipleship_pair;
create policy rede_discipleship_pair_rw on public.rede_discipleship_pair
for all to anon, authenticated
using (true)
with check (true);

drop policy if exists rede_discipleship_session_rw on public.rede_discipleship_session;
create policy rede_discipleship_session_rw on public.rede_discipleship_session
for all to anon, authenticated
using (true)
with check (true);
