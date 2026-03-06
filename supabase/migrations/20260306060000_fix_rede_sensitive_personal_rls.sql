-- Migration: Enable RLS on sensitive personal rede tables
-- Problem: rede_member_prayer_request, rede_member_journey, rede_member_weekly_goal
--          had NO RLS — deeply personal spiritual data was fully public.
-- Fix: Only the member themselves (via linked platform_user.member_id) or an
--      admin can access these rows.

-- ── rede_member_prayer_request ─────────────────────────────────────────────
ALTER TABLE public.rede_member_prayer_request ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prayer_request_own_or_admin" ON public.rede_member_prayer_request
  FOR ALL TO authenticated
  USING (
    member_id = (SELECT public.get_current_member_id())
    OR (SELECT public.is_platform_admin())
  )
  WITH CHECK (
    member_id = (SELECT public.get_current_member_id())
    OR (SELECT public.is_platform_admin())
  );

-- ── rede_member_journey ────────────────────────────────────────────────────
ALTER TABLE public.rede_member_journey ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_journey_own_or_admin" ON public.rede_member_journey
  FOR ALL TO authenticated
  USING (
    member_id = (SELECT public.get_current_member_id())
    OR (SELECT public.is_platform_admin())
  )
  WITH CHECK (
    member_id = (SELECT public.get_current_member_id())
    OR (SELECT public.is_platform_admin())
  );

-- ── rede_member_weekly_goal ────────────────────────────────────────────────
ALTER TABLE public.rede_member_weekly_goal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_weekly_goal_own_or_admin" ON public.rede_member_weekly_goal
  FOR ALL TO authenticated
  USING (
    member_id = (SELECT public.get_current_member_id())
    OR (SELECT public.is_platform_admin())
  )
  WITH CHECK (
    member_id = (SELECT public.get_current_member_id())
    OR (SELECT public.is_platform_admin())
  );
