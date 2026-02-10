-- Normalize rede_member.status as enum

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'rede_member_status'
      and n.nspname = 'public'
  ) then
    create type public.rede_member_status as enum ('ativo', 'inativo', 'em_acompanhamento');
  end if;
end $$;

update public.rede_member
set status = 'ativo'
where status is null;

update public.rede_member
set status = 'em_acompanhamento'
where status in ('visitante', 'em_acompanhamento');

update public.rede_member
set status = 'inativo'
where status in ('inativo', 'desligado');

update public.rede_member
set status = 'ativo'
where status not in ('ativo', 'inativo', 'em_acompanhamento');

alter table public.rede_member
  alter column status drop default;

alter table public.rede_member
  alter column status type public.rede_member_status
  using status::public.rede_member_status;

alter table public.rede_member
  alter column status set default 'ativo';
