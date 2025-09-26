-- Adds `status` to video_comment for moderation.

ALTER TABLE IF EXISTS public.video_comment
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pendente';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'video_comment_status_chk'
  ) THEN
    ALTER TABLE public.video_comment
      ADD CONSTRAINT video_comment_status_chk CHECK (status IN ('pendente','aprovado'));
  END IF;
END $$;

