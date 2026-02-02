-- Follow-up fields for member applications (including visitors)

alter table if exists public.rede_member_application
  add column if not exists followup_status text not null default 'pendente',
  add column if not exists followup_assigned_member_id uuid references public.rede_member(id) on delete set null,
  add column if not exists followup_closed_reason text,
  add column if not exists followup_notes text;
