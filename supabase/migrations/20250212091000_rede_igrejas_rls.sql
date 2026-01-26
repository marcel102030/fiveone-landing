create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_rede_member_updated_at on public.rede_member;
create trigger set_rede_member_updated_at
before update on public.rede_member
for each row execute function public.set_updated_at();

drop trigger if exists set_rede_presbitero_updated_at on public.rede_presbitero;
create trigger set_rede_presbitero_updated_at
before update on public.rede_presbitero
for each row execute function public.set_updated_at();

drop trigger if exists set_rede_ministry_leader_updated_at on public.rede_ministry_leader;
create trigger set_rede_ministry_leader_updated_at
before update on public.rede_ministry_leader
for each row execute function public.set_updated_at();

drop trigger if exists set_rede_house_church_updated_at on public.rede_house_church;
create trigger set_rede_house_church_updated_at
before update on public.rede_house_church
for each row execute function public.set_updated_at();

drop trigger if exists set_rede_member_questionnaire_updated_at on public.rede_member_questionnaire;
create trigger set_rede_member_questionnaire_updated_at
before update on public.rede_member_questionnaire
for each row execute function public.set_updated_at();

alter table public.rede_member enable row level security;
alter table public.rede_presbitero enable row level security;
alter table public.rede_ministry_leader enable row level security;
alter table public.rede_house_church enable row level security;
alter table public.rede_house_member enable row level security;
alter table public.rede_member_gift enable row level security;
alter table public.rede_member_questionnaire enable row level security;

drop policy if exists rede_member_rw on public.rede_member;
create policy rede_member_rw on public.rede_member
for all to anon, authenticated
using (true)
with check (true);

drop policy if exists rede_presbitero_rw on public.rede_presbitero;
create policy rede_presbitero_rw on public.rede_presbitero
for all to anon, authenticated
using (true)
with check (true);

drop policy if exists rede_ministry_leader_rw on public.rede_ministry_leader;
create policy rede_ministry_leader_rw on public.rede_ministry_leader
for all to anon, authenticated
using (true)
with check (true);

drop policy if exists rede_house_church_rw on public.rede_house_church;
create policy rede_house_church_rw on public.rede_house_church
for all to anon, authenticated
using (true)
with check (true);

drop policy if exists rede_house_member_rw on public.rede_house_member;
create policy rede_house_member_rw on public.rede_house_member
for all to anon, authenticated
using (true)
with check (true);

drop policy if exists rede_member_gift_rw on public.rede_member_gift;
create policy rede_member_gift_rw on public.rede_member_gift
for all to anon, authenticated
using (true)
with check (true);

drop policy if exists rede_member_questionnaire_rw on public.rede_member_questionnaire;
create policy rede_member_questionnaire_rw on public.rede_member_questionnaire
for all to anon, authenticated
using (true)
with check (true);
