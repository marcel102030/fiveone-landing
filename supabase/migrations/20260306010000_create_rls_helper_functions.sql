-- Migration: Create RLS helper functions
-- Purpose: Provide reusable, SECURITY DEFINER functions for RLS policies
-- These run with elevated privileges to avoid infinite recursion when
-- policies on platform_user call back into platform_user.

-- Check if the currently authenticated user is a platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin()
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  STABLE
  SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_user
    WHERE lower(email) = lower(coalesce((SELECT auth.jwt() ->> 'email'), ''))
      AND role = 'ADMIN'
      AND active = true
  );
$$;

-- Get the rede_member.id linked to the currently authenticated user
-- Returns NULL if user has no linked member record
CREATE OR REPLACE FUNCTION public.get_current_member_id()
  RETURNS uuid
  LANGUAGE sql
  SECURITY DEFINER
  STABLE
  SET search_path = public
AS $$
  SELECT member_id
  FROM public.platform_user
  WHERE lower(email) = lower(coalesce((SELECT auth.jwt() ->> 'email'), ''))
  LIMIT 1;
$$;
