-- House meetings and liturgy template

create table if not exists public.rede_house_meeting (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.rede_house_church(id) on delete cascade,
  meeting_date date not null,
  meeting_time time,
  host_member_id uuid references public.rede_member(id) on delete set null,
  liturgy_text text,
  discussion_questions text,
  content_link text,
  status text not null default 'planejado',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (house_id, meeting_date)
);

create index if not exists rede_house_meeting_house_idx on public.rede_house_meeting (house_id);
create index if not exists rede_house_meeting_date_idx on public.rede_house_meeting (meeting_date desc);

drop trigger if exists set_rede_house_meeting_updated_at on public.rede_house_meeting;
create trigger set_rede_house_meeting_updated_at
before update on public.rede_house_meeting
for each row execute function public.set_updated_at();
