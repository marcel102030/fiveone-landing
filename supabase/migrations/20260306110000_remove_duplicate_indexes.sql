-- Migration: Remove duplicate indexes
-- All removed items are exact duplicates of existing PRIMARY KEY or UNIQUE constraints,
-- or composite-index prefixes that fully cover the simpler index.

-- ── 1. platform_lesson_comment ───────────────────────────────────────────────
-- idx_lesson_comment_video ≡ idx_platform_lesson_comment_video (same btree on video_id)
DROP INDEX IF EXISTS public.idx_lesson_comment_video;

-- ── 2. platform_user ─────────────────────────────────────────────────────────
-- platform_user_email_unique (UNIQUE CONSTRAINT) ≡ platform_user_pkey (both: email)
ALTER TABLE public.platform_user DROP CONSTRAINT IF EXISTS platform_user_email_unique;

-- platform_user_member_id_idx (plain) covered by platform_user_member_id_unique (UNIQUE)
DROP INDEX IF EXISTS public.platform_user_member_id_idx;

-- ── 3. platform_user_profile ─────────────────────────────────────────────────
-- uq_user_profile_email (UNIQUE CONSTRAINT) ≡ platform_user_profile_pkey (both: user_email)
ALTER TABLE public.platform_user_profile DROP CONSTRAINT IF EXISTS uq_user_profile_email;

-- ── 4. platform_user_progress ────────────────────────────────────────────────
-- platform_user_progress_last_at_idx ≡ idx_user_progress_user_last (same: user_id, last_at DESC)
DROP INDEX IF EXISTS public.platform_user_progress_last_at_idx;

-- idx_platform_user_progress_user (user_id) covered by idx_user_progress_user_last (user_id, last_at)
DROP INDEX IF EXISTS public.idx_platform_user_progress_user;

-- ── 5. church ────────────────────────────────────────────────────────────────
-- church_slug_idx (plain) covered by church_slug_key UNIQUE CONSTRAINT
DROP INDEX IF EXISTS public.church_slug_idx;

-- ── 6. rede_member_invite ────────────────────────────────────────────────────
-- rede_member_invite_token_idx (plain) covered by rede_member_invite_token_key UNIQUE CONSTRAINT
DROP INDEX IF EXISTS public.rede_member_invite_token_idx;

-- ── 7. rede_presbitero ───────────────────────────────────────────────────────
-- rede_presbitero_member_idx (plain) covered by rede_presbitero_member_id_key UNIQUE CONSTRAINT
DROP INDEX IF EXISTS public.rede_presbitero_member_idx;

-- ── 8. platform_lesson_reaction ──────────────────────────────────────────────
-- idx_platform_lesson_reaction_video (video_id) covered by idx_lesson_reaction_video_user (video_id, user_id)
DROP INDEX IF EXISTS public.idx_platform_lesson_reaction_video;
