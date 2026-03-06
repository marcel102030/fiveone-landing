-- Migration: Rename video_id → lesson_id in tracking tables
--
-- The tracking tables (progress, completion, reaction, comment) all have a
-- `video_id` column that references platform_lesson.id — a poor name because
-- lessons can be TEXT or ASSESSMENT types too. Renaming to `lesson_id` makes
-- the schema self-documenting.
--
-- NOTE: platform_lesson.video_id (the external YouTube/Vimeo ID) is NOT renamed.
--
-- PostgreSQL automatically updates index/constraint definitions when a column
-- is renamed, so we only need to rename the indexes whose names contain "video".

-- ── Rename columns ────────────────────────────────────────────────────────────

ALTER TABLE public.platform_user_progress
  RENAME COLUMN video_id TO lesson_id;

ALTER TABLE public.platform_lesson_completion
  RENAME COLUMN video_id TO lesson_id;

ALTER TABLE public.platform_lesson_reaction
  RENAME COLUMN video_id TO lesson_id;

ALTER TABLE public.platform_lesson_comment
  RENAME COLUMN video_id TO lesson_id;

-- ── Rename indexes whose names still say "video" ──────────────────────────────

ALTER INDEX public.idx_platform_lesson_comment_video
  RENAME TO idx_platform_lesson_comment_lesson;

ALTER INDEX public.idx_platform_lesson_completion_video
  RENAME TO idx_platform_lesson_completion_lesson;

ALTER INDEX public.idx_platform_user_progress_video
  RENAME TO idx_platform_user_progress_lesson;

ALTER INDEX public.idx_lesson_reaction_video_user
  RENAME TO idx_lesson_reaction_lesson_user;
