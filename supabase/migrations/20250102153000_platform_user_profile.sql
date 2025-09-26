create table if not exists public.platform_user_profile (
  user_email text primary key references public.platform_user(email) on delete cascade,
  first_name text,
  last_name text,
  display_name text,
  bio text,
  cpf text,
  phone text,
  gender text,
  birthdate date,
  address text,
  city text,
  state text,
  country text,
  zip_code text,
  facebook text,
  instagram text,
  linkedin text,
  tiktok text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_user_profile_updated_at_idx
  on public.platform_user_profile (updated_at desc);

comment on table public.platform_user_profile is 'Informações complementares preenchidas pelo aluno dentro da plataforma.';

