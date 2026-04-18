-- Campos de configuração do quiz por igreja
ALTER TABLE church
  ADD COLUMN IF NOT EXISTS quiz_active              BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS quiz_custom_message      TEXT,
  ADD COLUMN IF NOT EXISTS quiz_notify_email        TEXT,
  ADD COLUMN IF NOT EXISTS quiz_notify_on_response  BOOLEAN NOT NULL DEFAULT false;
