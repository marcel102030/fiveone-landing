-- Prayer requests from members

create table if not exists public.rede_member_prayer_request (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.rede_member(id) on delete cascade,
  house_id uuid references public.rede_house_church(id) on delete set null,
  title text,
  content text not null,
  is_private boolean not null default false,
  status text not null default 'aberto',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rede_member_prayer_request_member_idx on public.rede_member_prayer_request (member_id);
create index if not exists rede_member_prayer_request_house_idx on public.rede_member_prayer_request (house_id);
create index if not exists rede_member_prayer_request_created_idx on public.rede_member_prayer_request (created_at desc);

drop trigger if exists set_rede_member_prayer_request_updated_at on public.rede_member_prayer_request;
create trigger set_rede_member_prayer_request_updated_at
before update on public.rede_member_prayer_request
for each row execute function public.set_updated_at();
