-- Migration: Fix broken reaction and comment RLS policies
--
-- platform_lesson_reaction issues:
--   1. "owner" policy allowed ALL anon users full access (USING: auth.role()='anon' OR user_id IS NULL)
--   2. "users can manage their reactions" compared auth.uid() (UUID) against user_id (email) — never matched
--   Both policies together meant reactions worked only via the anon bypass, not proper auth.
-- Fix: Replace with email-based policies matching how the frontend stores user_id.
--
-- platform_lesson_comment issues:
--   1. Duplicate SELECT policies ("comment_read_all" and "read-all")
--   2. "comment_update" allowed anyone (including anon) to UPDATE any comment
--   3. "comment_write" allowed anyone (including anon) to INSERT any comment
-- Fix: Single SELECT for authenticated; INSERT/UPDATE/DELETE scoped to own rows or admin.

-- ── platform_lesson_reaction ───────────────────────────────────────────────
DROP POLICY IF EXISTS "owner" ON public.platform_lesson_reaction;
DROP POLICY IF EXISTS "users can manage their reactions" ON public.platform_lesson_reaction;

-- Read: any authenticated user can see all reactions (to display counts)
CREATE POLICY "reaction_select_auth" ON public.platform_lesson_reaction
  FOR SELECT TO authenticated
  USING (true);

-- Insert: authenticated user can only insert reactions with their own email
CREATE POLICY "reaction_insert_own" ON public.platform_lesson_reaction
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT lower(auth.jwt() ->> 'email')) = lower(user_id));

-- Update: own reaction only
CREATE POLICY "reaction_update_own" ON public.platform_lesson_reaction
  FOR UPDATE TO authenticated
  USING  ((SELECT lower(auth.jwt() ->> 'email')) = lower(user_id))
  WITH CHECK ((SELECT lower(auth.jwt() ->> 'email')) = lower(user_id));

-- Delete: own reaction only
CREATE POLICY "reaction_delete_own" ON public.platform_lesson_reaction
  FOR DELETE TO authenticated
  USING ((SELECT lower(auth.jwt() ->> 'email')) = lower(user_id));

-- ── platform_lesson_comment ────────────────────────────────────────────────
DROP POLICY IF EXISTS "comment_read_all" ON public.platform_lesson_comment;
DROP POLICY IF EXISTS "read-all"         ON public.platform_lesson_comment;
DROP POLICY IF EXISTS "comment_update"   ON public.platform_lesson_comment;
DROP POLICY IF EXISTS "comment_write"    ON public.platform_lesson_comment;

-- Read: any authenticated user can read all comments
CREATE POLICY "comment_select_auth" ON public.platform_lesson_comment
  FOR SELECT TO authenticated
  USING (true);

-- Insert: authenticated user can only insert comments with their own email
CREATE POLICY "comment_insert_own" ON public.platform_lesson_comment
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT lower(auth.jwt() ->> 'email')) = lower(user_id));

-- Update: own comment or admin (e.g. moderation changes status to 'aprovado')
CREATE POLICY "comment_update_own_or_admin" ON public.platform_lesson_comment
  FOR UPDATE TO authenticated
  USING (
    (SELECT lower(auth.jwt() ->> 'email')) = lower(user_id)
    OR (SELECT public.is_platform_admin())
  );

-- Delete: own comment or admin
CREATE POLICY "comment_delete_own_or_admin" ON public.platform_lesson_comment
  FOR DELETE TO authenticated
  USING (
    (SELECT lower(auth.jwt() ->> 'email')) = lower(user_id)
    OR (SELECT public.is_platform_admin())
  );
