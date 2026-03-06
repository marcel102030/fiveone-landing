
-- Renomear tabelas para padrão platform_
ALTER TABLE public.user_progress    RENAME TO platform_user_progress;
ALTER TABLE public.user_invite      RENAME TO platform_user_invite;
ALTER TABLE public.video_reaction   RENAME TO platform_lesson_reaction;
ALTER TABLE public.video_completion RENAME TO platform_lesson_completion;
ALTER TABLE public.video_comment    RENAME TO platform_lesson_comment;

-- Renomear índices para manter consistência
ALTER INDEX IF EXISTS idx_user_progress_user    RENAME TO idx_platform_user_progress_user;
ALTER INDEX IF EXISTS idx_user_progress_video   RENAME TO idx_platform_user_progress_video;
ALTER INDEX IF EXISTS user_progress_user_last_at_idx RENAME TO platform_user_progress_last_at_idx;

ALTER INDEX IF EXISTS idx_user_invite_email     RENAME TO idx_platform_user_invite_email;
ALTER INDEX IF EXISTS idx_user_invite_token     RENAME TO idx_platform_user_invite_token;

ALTER INDEX IF EXISTS idx_video_reaction_video  RENAME TO idx_platform_lesson_reaction_video;
ALTER INDEX IF EXISTS idx_video_completion_video RENAME TO idx_platform_lesson_completion_video;
ALTER INDEX IF EXISTS idx_video_comment_video   RENAME TO idx_platform_lesson_comment_video;

-- Renomear sequences se existirem
-- (tabelas uuid não têm sequences, mas garantindo)
;
