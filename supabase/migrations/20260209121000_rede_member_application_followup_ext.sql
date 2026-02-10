-- Extend member applications with follow-up timing, consent, and inviter linkage

alter table if exists public.rede_member_application
  add column if not exists followup_started_at timestamptz,
  add column if not exists followup_closed_at timestamptz,
  add column if not exists last_contact_at timestamptz,
  add column if not exists next_contact_at timestamptz,
  add column if not exists contact_attempts integer not null default 0,
  add column if not exists invited_by_member_id uuid references public.rede_member(id) on delete set null,
  add column if not exists invited_by_name text,
  add column if not exists allow_contact boolean not null default true,
  add column if not exists preferred_contact_channel text;

-- Backfill invited_by_name from legacy invited_by, if present
update public.rede_member_application
set invited_by_name = invited_by
where invited_by_name is null and invited_by is not null;
