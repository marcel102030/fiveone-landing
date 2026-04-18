-- Novos campos em quiz_response para rastreamento completo
-- Inclui: pontuação bruta, tempo, origem, dispositivo, token de resultado

ALTER TABLE quiz_response
  ADD COLUMN IF NOT EXISTS raw_scores_json  JSONB,
  ADD COLUMN IF NOT EXISTS total_points     INTEGER CHECK (total_points IS NULL OR total_points >= 0),
  ADD COLUMN IF NOT EXISTS started_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completion_seconds INTEGER CHECK (completion_seconds IS NULL OR completion_seconds >= 0),
  ADD COLUMN IF NOT EXISTS source           TEXT,
  ADD COLUMN IF NOT EXISTS device_type      TEXT,
  ADD COLUMN IF NOT EXISTS result_token     TEXT UNIQUE;

ALTER TABLE quiz_response
  ADD CONSTRAINT quiz_response_source_check
    CHECK (source IS NULL OR source IN ('direct', 'church_invite', 'qr_code', 'organic'));

ALTER TABLE quiz_response
  ADD CONSTRAINT quiz_response_device_type_check
    CHECK (device_type IS NULL OR device_type IN ('mobile', 'tablet', 'desktop'));

-- Índice para lookup de resultado por token público
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_response_result_token
  ON quiz_response(result_token)
  WHERE result_token IS NOT NULL;

-- church_id já é nullable; garante que respostas standalone (sem igreja) sejam permitidas
ALTER TABLE quiz_response
  ALTER COLUMN church_id DROP NOT NULL;
