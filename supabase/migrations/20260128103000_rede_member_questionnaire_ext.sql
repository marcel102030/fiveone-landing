-- Extend member questionnaire and applications with pastoral fields

alter table if exists public.rede_member_questionnaire
  add column if not exists wants_serve_hospitality boolean not null default false,
  add column if not exists wants_serve_teaching boolean not null default false,
  add column if not exists wants_serve_pastoral_care boolean not null default false,
  add column if not exists wants_serve_practical_support boolean not null default false,
  add column if not exists routine_bible_reading boolean not null default false,
  add column if not exists routine_prayer boolean not null default false,
  add column if not exists routine_fasting boolean not null default false,
  add column if not exists routine_in_development boolean not null default false,
  add column if not exists discipleship_current boolean not null default false,
  add column if not exists discipleship_leads boolean not null default false;

alter table if exists public.rede_member_application
  add column if not exists wants_serve_hospitality boolean not null default false,
  add column if not exists wants_serve_teaching boolean not null default false,
  add column if not exists wants_serve_pastoral_care boolean not null default false,
  add column if not exists wants_serve_practical_support boolean not null default false,
  add column if not exists routine_bible_reading boolean not null default false,
  add column if not exists routine_prayer boolean not null default false,
  add column if not exists routine_fasting boolean not null default false,
  add column if not exists routine_in_development boolean not null default false,
  add column if not exists discipleship_current boolean not null default false,
  add column if not exists discipleship_leads boolean not null default false;
