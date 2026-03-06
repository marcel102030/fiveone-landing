
CREATE INDEX IF NOT EXISTS idx_lesson_comment_video
  ON platform_lesson_comment(video_id);

CREATE INDEX IF NOT EXISTS idx_lesson_reaction_video_user
  ON platform_lesson_reaction(video_id, user_id);

CREATE INDEX IF NOT EXISTS idx_lesson_completion_user
  ON platform_lesson_completion(user_id);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_last
  ON platform_user_progress(user_id, last_at DESC);
;
