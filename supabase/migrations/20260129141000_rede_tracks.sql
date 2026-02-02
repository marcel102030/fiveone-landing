-- Tracks and member progress

create table if not exists public.rede_track (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null default 'maturidade',
  description text,
  created_at timestamptz not null default now()
);

create index if not exists rede_track_category_idx on public.rede_track (category);

create table if not exists public.rede_track_module (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.rede_track(id) on delete cascade,
  title text not null,
  description text,
  content_link text,
  module_order integer not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists rede_track_module_track_idx on public.rede_track_module (track_id);

create table if not exists public.rede_track_enrollment (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.rede_member(id) on delete cascade,
  track_id uuid not null references public.rede_track(id) on delete cascade,
  status text not null default 'ativo',
  progress integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, track_id)
);

create index if not exists rede_track_enrollment_member_idx on public.rede_track_enrollment (member_id);
create index if not exists rede_track_enrollment_track_idx on public.rede_track_enrollment (track_id);

drop trigger if exists set_rede_track_enrollment_updated_at on public.rede_track_enrollment;
create trigger set_rede_track_enrollment_updated_at
before update on public.rede_track_enrollment
for each row execute function public.set_updated_at();

create table if not exists public.rede_track_module_completion (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.rede_track_enrollment(id) on delete cascade,
  module_id uuid not null references public.rede_track_module(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (enrollment_id, module_id)
);

create index if not exists rede_track_completion_enrollment_idx on public.rede_track_module_completion (enrollment_id);

alter table public.rede_track enable row level security;
alter table public.rede_track_module enable row level security;
alter table public.rede_track_enrollment enable row level security;
alter table public.rede_track_module_completion enable row level security;

drop policy if exists rede_track_rw on public.rede_track;
create policy rede_track_rw on public.rede_track
for all to anon, authenticated
using (true)
with check (true);

drop policy if exists rede_track_module_rw on public.rede_track_module;
create policy rede_track_module_rw on public.rede_track_module
for all to anon, authenticated
using (true)
with check (true);

drop policy if exists rede_track_enrollment_rw on public.rede_track_enrollment;
create policy rede_track_enrollment_rw on public.rede_track_enrollment
for all to anon, authenticated
using (true)
with check (true);

drop policy if exists rede_track_completion_rw on public.rede_track_module_completion;
create policy rede_track_completion_rw on public.rede_track_module_completion
for all to anon, authenticated
using (true)
with check (true);
