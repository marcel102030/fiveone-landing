-- Migration: Fix platform_user RLS policies
-- Problem: Single "self-manage" policy with USING(true) for anon+authenticated
--          allowed ANYONE (including unauthenticated) to read/write/delete any user.
-- Fix: Replace with properly scoped policies.

-- Drop the dangerously permissive policy
DROP POLICY IF EXISTS "self-manage" ON public.platform_user;

-- SELECT: all authenticated users can read (needed for admin panel, profile lookups)
CREATE POLICY "platform_user_select" ON public.platform_user
  FOR SELECT TO authenticated
  USING (true);

-- INSERT: user can create their own record (during signup they are authenticated)
--         or admin can create records for others
CREATE POLICY "platform_user_insert" ON public.platform_user
  FOR INSERT TO authenticated
  WITH CHECK (
    lower(auth.email()) = lower(email)
    OR (SELECT public.is_platform_admin())
  );

-- UPDATE: own record or admin
CREATE POLICY "platform_user_update" ON public.platform_user
  FOR UPDATE TO authenticated
  USING (
    lower(auth.email()) = lower(email)
    OR (SELECT public.is_platform_admin())
  )
  WITH CHECK (
    lower(auth.email()) = lower(email)
    OR (SELECT public.is_platform_admin())
  );

-- DELETE: admin only (irreversible — only admins may delete user accounts)
CREATE POLICY "platform_user_delete" ON public.platform_user
  FOR DELETE TO authenticated
  USING ((SELECT public.is_platform_admin()));
