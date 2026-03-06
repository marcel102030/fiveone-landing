-- Migration: Remove anonymous access from rede_* tables
-- Problem: 20 rede_ tables had policies granting anon (unauthenticated) users
--          full read/write access to sensitive member and church data.
-- Fix: Recreate each policy restricted to authenticated users only.
--      Application forms (rede_member_application, rede_visitor_application)
--      retain anon INSERT so the public sign-up flow still works.

-- ── rede_member ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "rede_member_rw" ON public.rede_member;
CREATE POLICY "rede_member_auth" ON public.rede_member
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── rede_presbitero ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "rede_presbitero_rw" ON public.rede_presbitero;
CREATE POLICY "rede_presbitero_auth" ON public.rede_presbitero
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── rede_ministry_leader ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "rede_ministry_leader_rw" ON public.rede_ministry_leader;
CREATE POLICY "rede_ministry_leader_auth" ON public.rede_ministry_leader
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── rede_house_church ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "rede_house_church_rw" ON public.rede_house_church;
CREATE POLICY "rede_house_church_auth" ON public.rede_house_church
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── rede_house_member ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "rede_house_member_rw" ON public.rede_house_member;
CREATE POLICY "rede_house_member_auth" ON public.rede_house_member
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── rede_house_meeting ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "rede_house_meeting_rw" ON public.rede_house_meeting;
CREATE POLICY "rede_house_meeting_auth" ON public.rede_house_meeting
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── rede_house_attendance ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "rede_house_attendance_rw" ON public.rede_house_attendance;
CREATE POLICY "rede_house_attendance_auth" ON public.rede_house_attendance
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── rede_house_service_schedule ────────────────────────────────────────────
DROP POLICY IF EXISTS "rede_house_service_schedule_rw" ON public.rede_house_service_schedule;
CREATE POLICY "rede_house_service_schedule_auth" ON public.rede_house_service_schedule
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── rede_discipleship_pair ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "rede_discipleship_pair_rw" ON public.rede_discipleship_pair;
CREATE POLICY "rede_discipleship_pair_auth" ON public.rede_discipleship_pair
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── rede_discipleship_session ──────────────────────────────────────────────
DROP POLICY IF EXISTS "rede_discipleship_session_rw" ON public.rede_discipleship_session;
CREATE POLICY "rede_discipleship_session_auth" ON public.rede_discipleship_session
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── rede_member_gift ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "rede_member_gift_rw" ON public.rede_member_gift;
CREATE POLICY "rede_member_gift_auth" ON public.rede_member_gift
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── rede_member_questionnaire ──────────────────────────────────────────────
DROP POLICY IF EXISTS "rede_member_questionnaire_rw" ON public.rede_member_questionnaire;
CREATE POLICY "rede_member_questionnaire_auth" ON public.rede_member_questionnaire
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── rede_member_invite ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "rede_member_invite_rw" ON public.rede_member_invite;
CREATE POLICY "rede_member_invite_auth" ON public.rede_member_invite
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── rede_member_followup_log ───────────────────────────────────────────────
DROP POLICY IF EXISTS "rede_member_followup_log_rw" ON public.rede_member_followup_log;
CREATE POLICY "rede_member_followup_log_auth" ON public.rede_member_followup_log
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── rede_notice ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "rede_notice_rw" ON public.rede_notice;
CREATE POLICY "rede_notice_auth" ON public.rede_notice
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── rede_event ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "rede_event_rw" ON public.rede_event;
CREATE POLICY "rede_event_auth" ON public.rede_event
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── rede_track ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "rede_track_rw" ON public.rede_track;
CREATE POLICY "rede_track_auth" ON public.rede_track
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── rede_track_module ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "rede_track_module_rw" ON public.rede_track_module;
CREATE POLICY "rede_track_module_auth" ON public.rede_track_module
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── rede_track_enrollment ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "rede_track_enrollment_rw" ON public.rede_track_enrollment;
CREATE POLICY "rede_track_enrollment_auth" ON public.rede_track_enrollment
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── rede_track_module_completion ───────────────────────────────────────────
DROP POLICY IF EXISTS "rede_track_completion_rw" ON public.rede_track_module_completion;
CREATE POLICY "rede_track_completion_auth" ON public.rede_track_module_completion
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
