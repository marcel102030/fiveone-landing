-- Service schedule for meetings

create table if not exists public.rede_house_service_schedule (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.rede_house_meeting(id) on delete cascade,
  house_id uuid not null references public.rede_house_church(id) on delete cascade,
  slot text not null,
  member_id uuid references public.rede_member(id) on delete set null,
  status text not null default 'pendente',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rede_house_service_schedule_meeting_idx on public.rede_house_service_schedule (meeting_id);
create index if not exists rede_house_service_schedule_house_idx on public.rede_house_service_schedule (house_id);

drop trigger if exists set_rede_house_service_schedule_updated_at on public.rede_house_service_schedule;
create trigger set_rede_house_service_schedule_updated_at
before update on public.rede_house_service_schedule
for each row execute function public.set_updated_at();
