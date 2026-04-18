-- Tabela quiz_answer: armazena cada escolha individual do quiz
-- Permite análise por afirmação, tempo por questão e comparação histórica

CREATE TABLE IF NOT EXISTS quiz_answer (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_response_id UUID    NOT NULL REFERENCES quiz_response(id) ON DELETE CASCADE,
  step             INTEGER NOT NULL CHECK (step >= 1 AND step <= 50),
  statement_a_id   INTEGER NOT NULL,
  statement_b_id   INTEGER NOT NULL,
  -- 'a' = escolheu statement_a, 'b' = escolheu statement_b, 'both' = ambas, 'none' = nenhuma
  choice           TEXT    NOT NULL CHECK (choice IN ('a', 'b', 'both', 'none')),
  time_ms          INTEGER CHECK (time_ms IS NULL OR time_ms >= 0),
  created_at       TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT quiz_answer_unique_step UNIQUE (quiz_response_id, step)
);

CREATE INDEX IF NOT EXISTS idx_quiz_answer_response_id
  ON quiz_answer(quiz_response_id);

-- Índices para análise por afirmação (identificar questões problemáticas)
CREATE INDEX IF NOT EXISTS idx_quiz_answer_statement_a
  ON quiz_answer(statement_a_id);

CREATE INDEX IF NOT EXISTS idx_quiz_answer_statement_b
  ON quiz_answer(statement_b_id);

-- RLS
ALTER TABLE quiz_answer ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode inserir (junto com o quiz_response)
CREATE POLICY quiz_answer_insert_public ON quiz_answer
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Apenas admins podem ler
CREATE POLICY quiz_answer_select_admin ON quiz_answer
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_user pu
      WHERE lower(pu.email) = lower((auth.jwt() ->> 'email')::text)
        AND pu.role = 'ADMIN'
        AND pu.is_active = true
    )
  );
