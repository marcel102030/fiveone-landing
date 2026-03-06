-- Migration: Fix multiple_permissive_policies warnings
--
-- Problem: xxx_admin_write FOR ALL creates a permissive SELECT policy for
-- authenticated users that overlaps with the dedicated xxx_select_auth FOR SELECT.
-- PostgreSQL ORs all permissive policies per (role, command), so both must be
-- evaluated on every SELECT — suboptimal at scale.
--
-- Fix: Replace each FOR ALL admin-write policy with three explicit policies
-- (INSERT, UPDATE, DELETE) so it no longer participates in SELECT evaluation.
-- The separate SELECT policy remains as the sole gatekeeper for reads.

-- ── platform_lesson ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "lesson_admin_write" ON public.platform_lesson;

CREATE POLICY "lesson_admin_insert" ON public.platform_lesson
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_platform_admin()));

CREATE POLICY "lesson_admin_update" ON public.platform_lesson
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_platform_admin()))
  WITH CHECK ((SELECT public.is_platform_admin()));

CREATE POLICY "lesson_admin_delete" ON public.platform_lesson
  FOR DELETE TO authenticated
  USING ((SELECT public.is_platform_admin()));

-- ── platform_ministry ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "ministry_admin_write" ON public.platform_ministry;

CREATE POLICY "ministry_admin_insert" ON public.platform_ministry
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_platform_admin()));

CREATE POLICY "ministry_admin_update" ON public.platform_ministry
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_platform_admin()))
  WITH CHECK ((SELECT public.is_platform_admin()));

CREATE POLICY "ministry_admin_delete" ON public.platform_ministry
  FOR DELETE TO authenticated
  USING ((SELECT public.is_platform_admin()));

-- ── platform_module ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "module_admin_write" ON public.platform_module;

CREATE POLICY "module_admin_insert" ON public.platform_module
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_platform_admin()));

CREATE POLICY "module_admin_update" ON public.platform_module
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_platform_admin()))
  WITH CHECK ((SELECT public.is_platform_admin()));

CREATE POLICY "module_admin_delete" ON public.platform_module
  FOR DELETE TO authenticated
  USING ((SELECT public.is_platform_admin()));

-- ── platform_user_invite ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "invite_admin_write" ON public.platform_user_invite;

CREATE POLICY "invite_admin_insert" ON public.platform_user_invite
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_platform_admin()));

CREATE POLICY "invite_admin_update" ON public.platform_user_invite
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_platform_admin()))
  WITH CHECK ((SELECT public.is_platform_admin()));

CREATE POLICY "invite_admin_delete" ON public.platform_user_invite
  FOR DELETE TO authenticated
  USING ((SELECT public.is_platform_admin()));

-- ── quiz_response ─────────────────────────────────────────────────────────────
-- quiz_insert_public already handles INSERT (anon + auth).
-- quiz_select_admin already handles SELECT (admin only).
-- Only UPDATE and DELETE remain for the admin write policy.
DROP POLICY IF EXISTS "quiz_admin_write" ON public.quiz_response;

CREATE POLICY "quiz_admin_update" ON public.quiz_response
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_platform_admin()))
  WITH CHECK ((SELECT public.is_platform_admin()));

CREATE POLICY "quiz_admin_delete" ON public.quiz_response
  FOR DELETE TO authenticated
  USING ((SELECT public.is_platform_admin()));
