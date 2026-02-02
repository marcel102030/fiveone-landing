-- Weekly goals per member

create table if not exists public.rede_member_weekly_goal (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.rede_member(id) on delete cascade,
  week_start date not null,
  word boolean not null default false,
  prayer boolean not null default false,
  fellowship boolean not null default false,
  service boolean not null default false,
  mission boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, week_start)
);

create index if not exists rede_member_weekly_goal_member_idx on public.rede_member_weekly_goal (member_id);
create index if not exists rede_member_weekly_goal_week_idx on public.rede_member_weekly_goal (week_start);

drop trigger if exists set_rede_member_weekly_goal_updated_at on public.rede_member_weekly_goal;
create trigger set_rede_member_weekly_goal_updated_at
before update on public.rede_member_weekly_goal
for each row execute function public.set_updated_at();
