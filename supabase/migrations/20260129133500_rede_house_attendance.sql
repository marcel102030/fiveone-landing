-- Attendance per meeting

create table if not exists public.rede_house_attendance (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.rede_house_meeting(id) on delete cascade,
  house_id uuid not null references public.rede_house_church(id) on delete cascade,
  member_id uuid not null references public.rede_member(id) on delete cascade,
  checked_at timestamptz not null default now(),
  checked_by_member_id uuid references public.rede_member(id) on delete set null,
  unique (meeting_id, member_id)
);

create index if not exists rede_house_attendance_meeting_idx on public.rede_house_attendance (meeting_id);
create index if not exists rede_house_attendance_member_idx on public.rede_house_attendance (member_id);
