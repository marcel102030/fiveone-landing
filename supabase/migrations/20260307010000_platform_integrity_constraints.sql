-- Migration: Platform integrity constraints
--
-- Adds CHECK constraints for fields that currently accept any text value,
-- and performance indexes for common query patterns.
-- Note: PKs, and checks for reaction/comment status already exist in the DB.

-- ── platform_user.role ────────────────────────────────────────────────────────
ALTER TABLE public.platform_user
  ADD CONSTRAINT ck_user_role
    CHECK (role IN ('ADMIN', 'MEMBER', 'STUDENT'));

-- ── platform_lesson ───────────────────────────────────────────────────────────
ALTER TABLE public.platform_lesson
  ADD CONSTRAINT ck_lesson_status
    CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  ADD CONSTRAINT ck_lesson_content_type
    CHECK (content_type IN ('VIDEO', 'TEXT', 'ASSESSMENT', 'EXTERNAL')),
  ADD CONSTRAINT ck_lesson_source_type
    CHECK (source_type IN ('YOUTUBE', 'VIMEO', 'UPLOAD')),
  ADD CONSTRAINT ck_lesson_release_after_created
    CHECK (release_at IS NULL OR release_at >= created_at);

-- ── platform_module ───────────────────────────────────────────────────────────
ALTER TABLE public.platform_module
  ADD CONSTRAINT ck_module_status
    CHECK (status IN ('draft', 'published', 'archived'));

-- ── platform_lesson_comment (text not empty) ──────────────────────────────────
ALTER TABLE public.platform_lesson_comment
  ADD CONSTRAINT ck_comment_text_not_empty
    CHECK (length(trim(text)) > 0);

-- ── Performance indexes ───────────────────────────────────────────────────────

-- Comment moderation: filter by status + order by date
CREATE INDEX IF NOT EXISTS idx_comment_status_created
  ON public.platform_lesson_comment (status, created_at DESC);

-- Partial index for pending comments (most common moderation query)
CREATE INDEX IF NOT EXISTS idx_comment_pending
  ON public.platform_lesson_comment (created_at DESC)
  WHERE status = 'pendente';

-- Module search: ministry + status + order (adds status to existing ministry+order index)
CREATE INDEX IF NOT EXISTS idx_module_ministry_status_order
  ON public.platform_module (ministry_id, status, order_index);

-- Reaction aggregation: count likes/dislikes per lesson
CREATE INDEX IF NOT EXISTS idx_reaction_lesson_type
  ON public.platform_lesson_reaction (video_id, reaction);
