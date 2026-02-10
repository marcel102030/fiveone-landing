-- Add birthdate and gender to member applications

alter table if exists public.rede_member_application
  add column if not exists birthdate date,
  add column if not exists gender text;
