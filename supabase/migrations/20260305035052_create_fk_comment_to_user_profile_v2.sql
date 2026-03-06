
-- UNIQUE em user_email para permitir FK
ALTER TABLE platform_user_profile
  ADD CONSTRAINT uq_user_profile_email UNIQUE (user_email);

-- FK que habilita o join automático no PostgREST
ALTER TABLE platform_lesson_comment
  ADD CONSTRAINT fk_comment_to_user_profile
  FOREIGN KEY (user_id)
  REFERENCES platform_user_profile(user_email)
  ON DELETE SET NULL
  ON UPDATE CASCADE;
;
