-- Add ministry discernment flag to applications and questionnaires

alter table if exists public.rede_member_questionnaire
  add column if not exists ministry_discernment boolean not null default false;

alter table if exists public.rede_member_application
  add column if not exists ministry_discernment boolean not null default false;
