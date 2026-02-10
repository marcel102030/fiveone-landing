-- Follow-up logs for member applications

create table if not exists public.rede_member_followup_log (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.rede_member_application(id) on delete cascade,
  contact_method text,
  contacted_at timestamptz,
  outcome text,
  notes text,
  created_by_member_id uuid references public.rede_member(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists rede_member_followup_log_application_idx on public.rede_member_followup_log (application_id);
create index if not exists rede_member_followup_log_contacted_idx on public.rede_member_followup_log (contacted_at desc);

alter table public.rede_member_followup_log enable row level security;

drop policy if exists rede_member_followup_log_rw on public.rede_member_followup_log;
create policy rede_member_followup_log_rw on public.rede_member_followup_log
for all to anon, authenticated
using (true)
with check (true);
