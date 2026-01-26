-- Add congregado to member type and store type on invite links

do $$
begin
  if exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'rede_member_type'
      and n.nspname = 'public'
  ) then
    begin
      alter type public.rede_member_type add value if not exists 'congregado';
    exception
      when duplicate_object then null;
    end;
  end if;
end $$;

alter table if exists public.rede_member_invite
  add column if not exists member_type public.rede_member_type not null default 'membro';

update public.rede_member
  set member_type = 'congregado'
  where member_type = 'outro';

update public.rede_member_application
  set member_type = 'congregado'
  where member_type = 'outro';

update public.rede_member_invite
  set member_type = 'congregado'
  where member_type = 'outro';
