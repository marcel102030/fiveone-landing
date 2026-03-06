-- Migration: Fix platform_user_profile RLS
-- Problem: RLS was disabled, existing policies had no effect.
--          Policies also didn't allow admins to manage other users' profiles.
-- Fix: Recreate policies with admin exceptions, then enable RLS.

-- Drop the existing (ineffective) policies
DROP POLICY IF EXISTS "Perfil pode atualizar seu registro" ON public.platform_user_profile;
DROP POLICY IF EXISTS "Perfil pode ver seu registro" ON public.platform_user_profile;

-- SELECT: own profile or admin
CREATE POLICY "profile_select" ON public.platform_user_profile
  FOR SELECT TO authenticated
  USING (
    lower(auth.email()) = lower(user_email)
    OR (SELECT public.is_platform_admin())
  );

-- INSERT: own profile or admin (triggered during user onboarding)
CREATE POLICY "profile_insert" ON public.platform_user_profile
  FOR INSERT TO authenticated
  WITH CHECK (
    lower(auth.email()) = lower(user_email)
    OR (SELECT public.is_platform_admin())
  );

-- UPDATE: own profile or admin
CREATE POLICY "profile_update" ON public.platform_user_profile
  FOR UPDATE TO authenticated
  USING (
    lower(auth.email()) = lower(user_email)
    OR (SELECT public.is_platform_admin())
  );

-- DELETE: admin only (users cannot self-delete profile record directly)
CREATE POLICY "profile_delete" ON public.platform_user_profile
  FOR DELETE TO authenticated
  USING ((SELECT public.is_platform_admin()));

-- Enable RLS (was disabled even though policies existed)
ALTER TABLE public.platform_user_profile ENABLE ROW LEVEL SECURITY;
