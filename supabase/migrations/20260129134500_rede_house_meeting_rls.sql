-- RLS policies for house meeting modules

alter table public.rede_house_meeting enable row level security;
alter table public.rede_house_attendance enable row level security;
alter table public.rede_house_service_schedule enable row level security;

drop policy if exists rede_house_meeting_rw on public.rede_house_meeting;
create policy rede_house_meeting_rw on public.rede_house_meeting
for all to anon, authenticated
using (true)
with check (true);

drop policy if exists rede_house_attendance_rw on public.rede_house_attendance;
create policy rede_house_attendance_rw on public.rede_house_attendance
for all to anon, authenticated
using (true)
with check (true);

drop policy if exists rede_house_service_schedule_rw on public.rede_house_service_schedule;
create policy rede_house_service_schedule_rw on public.rede_house_service_schedule
for all to anon, authenticated
using (true)
with check (true);
