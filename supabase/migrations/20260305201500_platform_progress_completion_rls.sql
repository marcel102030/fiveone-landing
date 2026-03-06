-- Hardening RLS for platform progress and lesson completion tables.
-- Current app model stores `user_id` as e-mail, so policies compare against auth JWT e-mail.

alter table if exists public.platform_user_progress enable row level security;
alter table if exists public.platform_lesson_completion enable row level security;
-- Remove permissive/legacy policies if they exist.
drop policy if exists "owner" on public.platform_lesson_completion;
drop policy if exists "users can manage their completions" on public.platform_lesson_completion;
drop policy if exists "users can manage own completions by email" on public.platform_lesson_completion;
drop policy if exists "owner" on public.platform_user_progress;
drop policy if exists "users can manage their progress" on public.platform_user_progress;
drop policy if exists "users can manage own progress by email" on public.platform_user_progress;
-- Completion: authenticated users can only manage their own rows.
create policy "users can manage own completions by email"
on public.platform_lesson_completion
for all
to authenticated
using (lower(coalesce(auth.jwt()->>'email', '')) = lower(user_id))
with check (lower(coalesce(auth.jwt()->>'email', '')) = lower(user_id));
-- Progress: authenticated users can only manage their own rows.
create policy "users can manage own progress by email"
on public.platform_user_progress
for all
to authenticated
using (lower(coalesce(auth.jwt()->>'email', '')) = lower(user_id))
with check (lower(coalesce(auth.jwt()->>'email', '')) = lower(user_id));
