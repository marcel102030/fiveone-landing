-- Migration: Fix auth RLS init-plan re-evaluation (auth_rls_initplan warnings)
--
-- Root cause: Policies using auth.email() or auth.jwt() WITHOUT a (SELECT ...) wrapper
-- cause PostgreSQL to call the function once per scanned row rather than once per query.
--
-- Fix: Wrap auth calls in (SELECT ...) subqueries so they are evaluated as init-plans.
-- Since Supabase normalises emails to lowercase and we store them lowercase, we can use
-- the clean pattern: column = (SELECT auth.email())  — no lower() wrapping needed.
--
-- Also adds the missing FK index on rede_track_module_completion.module_id.

-- ── platform_user_profile ─────────────────────────────────────────────────────
-- Was: lower(auth.email()) = lower(user_email)  → re-evaluated per row
-- Fix: user_email = (SELECT auth.email())        → init-plan, evaluated once

DROP POLICY IF EXISTS "profile_select" ON public.platform_user_profile;
DROP POLICY IF EXISTS "profile_insert" ON public.platform_user_profile;
DROP POLICY IF EXISTS "profile_update" ON public.platform_user_profile;

CREATE POLICY "profile_select" ON public.platform_user_profile
  FOR SELECT TO authenticated
  USING (
    user_email = (SELECT auth.email())
    OR (SELECT public.is_platform_admin())
  );

CREATE POLICY "profile_insert" ON public.platform_user_profile
  FOR INSERT TO authenticated
  WITH CHECK (
    user_email = (SELECT auth.email())
    OR (SELECT public.is_platform_admin())
  );

CREATE POLICY "profile_update" ON public.platform_user_profile
  FOR UPDATE TO authenticated
  USING (
    user_email = (SELECT auth.email())
    OR (SELECT public.is_platform_admin())
  )
  WITH CHECK (
    user_email = (SELECT auth.email())
    OR (SELECT public.is_platform_admin())
  );

-- ── platform_user ─────────────────────────────────────────────────────────────
-- Was: lower(auth.email()) = lower(email)  → re-evaluated per row

DROP POLICY IF EXISTS "platform_user_insert" ON public.platform_user;
DROP POLICY IF EXISTS "platform_user_update" ON public.platform_user;

CREATE POLICY "platform_user_insert" ON public.platform_user
  FOR INSERT TO authenticated
  WITH CHECK (
    email = (SELECT auth.email())
    OR (SELECT public.is_platform_admin())
  );

CREATE POLICY "platform_user_update" ON public.platform_user
  FOR UPDATE TO authenticated
  USING (
    email = (SELECT auth.email())
    OR (SELECT public.is_platform_admin())
  )
  WITH CHECK (
    email = (SELECT auth.email())
    OR (SELECT public.is_platform_admin())
  );

-- ── platform_lesson_reaction ──────────────────────────────────────────────────
-- Was: (SELECT lower(auth.jwt() ->> 'email')) = lower(user_id)
-- Fix: user_id = (SELECT auth.email())

DROP POLICY IF EXISTS "reaction_insert_own" ON public.platform_lesson_reaction;
DROP POLICY IF EXISTS "reaction_update_own" ON public.platform_lesson_reaction;
DROP POLICY IF EXISTS "reaction_delete_own" ON public.platform_lesson_reaction;

CREATE POLICY "reaction_insert_own" ON public.platform_lesson_reaction
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.email()));

CREATE POLICY "reaction_update_own" ON public.platform_lesson_reaction
  FOR UPDATE TO authenticated
  USING  (user_id = (SELECT auth.email()))
  WITH CHECK (user_id = (SELECT auth.email()));

CREATE POLICY "reaction_delete_own" ON public.platform_lesson_reaction
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.email()));

-- ── platform_lesson_comment ───────────────────────────────────────────────────
-- Was: (SELECT lower(auth.jwt() ->> 'email')) = lower(user_id)
-- Fix: user_id = (SELECT auth.email())

DROP POLICY IF EXISTS "comment_insert_own" ON public.platform_lesson_comment;
DROP POLICY IF EXISTS "comment_update_own_or_admin" ON public.platform_lesson_comment;
DROP POLICY IF EXISTS "comment_delete_own_or_admin" ON public.platform_lesson_comment;

CREATE POLICY "comment_insert_own" ON public.platform_lesson_comment
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.email()));

CREATE POLICY "comment_update_own_or_admin" ON public.platform_lesson_comment
  FOR UPDATE TO authenticated
  USING (
    user_id = (SELECT auth.email())
    OR (SELECT public.is_platform_admin())
  );

CREATE POLICY "comment_delete_own_or_admin" ON public.platform_lesson_comment
  FOR DELETE TO authenticated
  USING (
    user_id = (SELECT auth.email())
    OR (SELECT public.is_platform_admin())
  );

-- ── platform_lesson_completion ────────────────────────────────────────────────
-- Was: lower(COALESCE((SELECT auth.jwt() ->> 'email'), '')) = lower(user_id)
-- Fix: user_id = (SELECT auth.email())

DROP POLICY IF EXISTS "completion_own" ON public.platform_lesson_completion;

CREATE POLICY "completion_own" ON public.platform_lesson_completion
  FOR ALL TO authenticated
  USING     (user_id = (SELECT auth.email()))
  WITH CHECK (user_id = (SELECT auth.email()));

-- ── platform_user_progress ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "progress_own" ON public.platform_user_progress;

CREATE POLICY "progress_own" ON public.platform_user_progress
  FOR ALL TO authenticated
  USING     (user_id = (SELECT auth.email()))
  WITH CHECK (user_id = (SELECT auth.email()));

-- ── Missing FK index: rede_track_module_completion.module_id ──────────────────
-- Missed in the previous FK indexes migration (20260306120000).
CREATE INDEX IF NOT EXISTS idx_track_completion_module
  ON public.rede_track_module_completion (module_id);
