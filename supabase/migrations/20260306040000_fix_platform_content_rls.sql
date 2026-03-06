-- Migration: Enable RLS on platform content tables
-- Problem: platform_ministry, platform_module, platform_lesson had no RLS,
--          exposing all course content to unauthenticated users.
-- Fix: Authenticated users can read content; only admins can write.

-- ── platform_ministry ──────────────────────────────────────────────────────
ALTER TABLE public.platform_ministry ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read ministries
CREATE POLICY "ministry_select_auth" ON public.platform_ministry
  FOR SELECT TO authenticated
  USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "ministry_admin_write" ON public.platform_ministry
  FOR ALL TO authenticated
  USING ((SELECT public.is_platform_admin()))
  WITH CHECK ((SELECT public.is_platform_admin()));

-- ── platform_module ────────────────────────────────────────────────────────
ALTER TABLE public.platform_module ENABLE ROW LEVEL SECURITY;

CREATE POLICY "module_select_auth" ON public.platform_module
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "module_admin_write" ON public.platform_module
  FOR ALL TO authenticated
  USING ((SELECT public.is_platform_admin()))
  WITH CHECK ((SELECT public.is_platform_admin()));

-- ── platform_lesson ────────────────────────────────────────────────────────
ALTER TABLE public.platform_lesson ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesson_select_auth" ON public.platform_lesson
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "lesson_admin_write" ON public.platform_lesson
  FOR ALL TO authenticated
  USING ((SELECT public.is_platform_admin()))
  WITH CHECK ((SELECT public.is_platform_admin()));
