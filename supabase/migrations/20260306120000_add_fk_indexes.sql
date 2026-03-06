-- Migration: Add missing indexes on foreign key columns
-- PostgreSQL does NOT auto-create indexes on FK columns.
-- Without these, DELETEs on the referenced table and JOINs cause full-table scans.

-- ── platform_lesson_comment ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_comment_parent_id
  ON public.platform_lesson_comment (parent_id);

CREATE INDEX IF NOT EXISTS idx_comment_user_id
  ON public.platform_lesson_comment (user_id);

-- ── rede_discipleship_session ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_discipleship_session_created_by
  ON public.rede_discipleship_session (created_by_member_id);

-- ── rede_event ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_event_created_by
  ON public.rede_event (created_by_member_id);

-- ── rede_house_attendance ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_attendance_checked_by
  ON public.rede_house_attendance (checked_by_member_id);

CREATE INDEX IF NOT EXISTS idx_attendance_house
  ON public.rede_house_attendance (house_id);

-- ── rede_house_meeting ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_meeting_host_member
  ON public.rede_house_meeting (host_member_id);

-- ── rede_house_service_schedule ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_service_schedule_member
  ON public.rede_house_service_schedule (member_id);

-- ── rede_member_application ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_application_approved_by
  ON public.rede_member_application (approved_member_id);

CREATE INDEX IF NOT EXISTS idx_application_followup_assigned
  ON public.rede_member_application (followup_assigned_member_id);

CREATE INDEX IF NOT EXISTS idx_application_invited_by
  ON public.rede_member_application (invited_by_member_id);

-- ── rede_member_followup_log ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_followup_log_created_by
  ON public.rede_member_followup_log (created_by_member_id);

-- ── rede_member_invite ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_member_invite_house
  ON public.rede_member_invite (house_id);

CREATE INDEX IF NOT EXISTS idx_member_invite_presbitero
  ON public.rede_member_invite (presbitero_id);

-- ── rede_notice ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notice_created_by
  ON public.rede_notice (created_by_member_id);

-- ── rede_visitor_application ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_visitor_application_house
  ON public.rede_visitor_application (house_id);

-- ── service_request ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_service_request_church
  ON public.service_request (church_id);
