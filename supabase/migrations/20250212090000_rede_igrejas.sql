do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'fivefold_ministry'
      and n.nspname = 'public'
  ) then
    create type public.fivefold_ministry as enum (
      'apostolo',
      'profeta',
      'evangelista',
      'pastor',
      'mestre'
    );
  end if;
end $$;

create table if not exists public.rede_member (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique,
  phone text,
  birthdate date,
  gender text,
  city text,
  state text,
  address text,
  status text default 'ativo',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rede_member_full_name_idx on public.rede_member (full_name);
create index if not exists rede_member_city_idx on public.rede_member (city);

create table if not exists public.rede_presbitero (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.rede_member(id) on delete cascade,
  since_date date,
  status text default 'ativo',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id)
);

create index if not exists rede_presbitero_member_idx on public.rede_presbitero (member_id);

create table if not exists public.rede_ministry_leader (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.rede_member(id) on delete cascade,
  ministry public.fivefold_ministry not null,
  region text,
  status text default 'ativo',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, ministry)
);

create index if not exists rede_ministry_leader_member_idx on public.rede_ministry_leader (member_id);

create table if not exists public.rede_house_church (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  neighborhood text,
  address text,
  meeting_day text,
  meeting_time time,
  capacity integer,
  status text default 'ativa',
  presbitero_id uuid references public.rede_presbitero(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rede_house_church_presbitero_idx on public.rede_house_church (presbitero_id);
create index if not exists rede_house_church_city_idx on public.rede_house_church (city);

create table if not exists public.rede_house_member (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.rede_house_church(id) on delete cascade,
  member_id uuid not null references public.rede_member(id) on delete cascade,
  role text,
  is_primary boolean not null default true,
  joined_at date,
  created_at timestamptz not null default now(),
  unique (house_id, member_id)
);

create index if not exists rede_house_member_house_idx on public.rede_house_member (house_id);
create index if not exists rede_house_member_member_idx on public.rede_house_member (member_id);

create table if not exists public.rede_member_gift (
  member_id uuid not null references public.rede_member(id) on delete cascade,
  gift public.fivefold_ministry not null,
  source text default 'self',
  created_at timestamptz not null default now(),
  primary key (member_id, gift)
);

create table if not exists public.rede_member_questionnaire (
  member_id uuid primary key references public.rede_member(id) on delete cascade,
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
