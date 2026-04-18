-- Tabela quiz_session: rastreia início, progresso e abandono do quiz
-- Permite análise de funil: quantos começam vs. terminam e em qual etapa abandonam

CREATE TABLE IF NOT EXISTS quiz_session (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id        UUID    REFERENCES church(id) ON DELETE SET NULL,
  quiz_response_id UUID    REFERENCES quiz_response(id) ON DELETE SET NULL,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at     TIMESTAMPTZ,
  last_step        INTEGER CHECK (last_step IS NULL OR (last_step >= 1 AND last_step <= 50)),
  completed        BOOLEAN NOT NULL DEFAULT false,
  device_type      TEXT    CHECK (device_type IS NULL OR device_type IN ('mobile', 'tablet', 'desktop')),
  source           TEXT    CHECK (source IS NULL OR source IN ('direct', 'church_invite', 'qr_code', 'organic')),
  ip_hash          TEXT,
  user_agent       TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- Índices para relatórios de funil
CREATE INDEX IF NOT EXISTS idx_quiz_session_church_id
  ON quiz_session(church_id)
  WHERE church_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_quiz_session_started_at
  ON quiz_session(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_quiz_session_completed
  ON quiz_session(completed, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_quiz_session_response_id
  ON quiz_session(quiz_response_id)
  WHERE quiz_response_id IS NOT NULL;

-- RLS
ALTER TABLE quiz_session ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode criar uma sessão
CREATE POLICY quiz_session_insert_public ON quiz_session
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Backend atualiza via service role (sem política necessária para update anon)
-- Apenas admins leem
CREATE POLICY quiz_session_select_admin ON quiz_session
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_user pu
      WHERE lower(pu.email) = lower((auth.jwt() ->> 'email')::text)
        AND pu.role = 'ADMIN'
        AND pu.is_active = true
    )
  );
