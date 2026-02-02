-- Unify visitor applications into rede_member_application

alter table if exists public.rede_member_application
  add column if not exists visit_experience text[] not null default '{}',
  add column if not exists invited_by text,
  add column if not exists care_needs text[] not null default '{}',
  add column if not exists faith_journey text[] not null default '{}',
  add column if not exists doubts_interests text[] not null default '{}',
  add column if not exists contact_preferences text[] not null default '{}';

-- Update insert policy to require invite token type match
drop policy if exists rede_member_application_insert on public.rede_member_application;
create policy rede_member_application_insert on public.rede_member_application
for insert to anon, authenticated
with check (
  invite_token is not null
  and exists (
    select 1
    from public.rede_member_invite i
    where i.token = invite_token
      and i.status = 'ativo'
      and i.member_type = member_type
      and (i.expires_at is null or i.expires_at > now())
  )
);

-- Optional migration of existing visitor rows if table exists
insert into public.rede_member_application (
  invite_token,
  full_name,
  phone,
  city,
  house_id,
  visit_experience,
  invited_by,
  care_needs,
  faith_journey,
  doubts_interests,
  contact_preferences,
  notes,
  status,
  member_type,
  created_at,
  updated_at
)
select
  v.invite_token,
  v.full_name,
  v.phone,
  v.city,
  v.house_id,
  v.visit_experience,
  v.invited_by,
  v.care_needs,
  v.faith_journey,
  v.doubts_interests,
  v.contact_preferences,
  v.notes,
  v.status,
  'visitante',
  v.created_at,
  v.updated_at
from public.rede_visitor_application v
where not exists (
  select 1
  from public.rede_member_application m
  where m.invite_token = v.invite_token
    and m.full_name = v.full_name
    and m.phone = v.phone
);

-- If you want to drop the old table after migration, run manually:
-- drop table if exists public.rede_visitor_application;
