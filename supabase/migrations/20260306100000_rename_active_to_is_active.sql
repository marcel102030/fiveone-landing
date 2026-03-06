-- Migration: Rename platform_user.active → is_active
-- Reason: Standardize boolean column names to use the is_ prefix,
--         consistent with platform_lesson.is_active already in the schema.

ALTER TABLE public.platform_user RENAME COLUMN active TO is_active;

-- Update the is_platform_admin() helper (references the old column name)
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
      AND is_active = true
  );
$$;
