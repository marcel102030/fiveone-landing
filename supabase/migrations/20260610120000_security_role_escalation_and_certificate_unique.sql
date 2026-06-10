-- Bloco de segurança pré-lançamento (aplicado em 2026-06-10).
--
-- 1) Escalada de privilégio: a policy platform_user_update permitia o aluno
--    atualizar a própria linha sem proteger a coluna `role`/`is_active`, então
--    um aluno logado podia se tornar ADMIN via `update platform_user set
--    role='ADMIN'`. Este trigger bloqueia alteração de role/is_active por
--    usuários autenticados comuns; service_role (Functions admin) e admins
--    (is_platform_admin) continuam podendo.
create or replace function public.protect_platform_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') = 'authenticated' and not is_platform_admin() then
    if new.role is distinct from old.role then
      raise exception 'Alteracao de role nao autorizada';
    end if;
    if new.is_active is distinct from old.is_active then
      raise exception 'Alteracao de is_active nao autorizada';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_platform_user_role on public.platform_user;
create trigger trg_protect_platform_user_role
  before update on public.platform_user
  for each row execute function public.protect_platform_user_role();

-- 2) Certificados duplicados: faltava unicidade em (user_id, ministry_id),
--    permitindo 2+ certificados do mesmo curso por corrida entre disparos.
create unique index if not exists uq_certificate_user_ministry
  on public.platform_certificate (user_id, ministry_id);
