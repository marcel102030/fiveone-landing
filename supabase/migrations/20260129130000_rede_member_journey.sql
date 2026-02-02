-- Member journey (Minha Jornada)

create table if not exists public.rede_member_journey (
  member_id uuid primary key references public.rede_member(id) on delete cascade,
  baptism_done boolean not null default false,
  baptism_date date,
  discipleship_status text,
  serve_area text,
  current_track text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_rede_member_journey_updated_at on public.rede_member_journey;
create trigger set_rede_member_journey_updated_at
before update on public.rede_member_journey
for each row execute function public.set_updated_at();
