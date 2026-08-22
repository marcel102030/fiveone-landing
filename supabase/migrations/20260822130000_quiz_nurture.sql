-- O1 — Régua de nutrição pós-resultado.
-- Campos de controle em quiz_response para uma sequência de e-mails automatizada
-- (dia 1, dia 3, dia 7) disparada por um cron externo chamando /api/quiz-nurture-run.

ALTER TABLE public.quiz_response
  -- Estágio já enviado: 0 = nenhum, 1 = boas-vindas (D+1), 2 = aprofundamento (D+3), 3 = convite curso (D+7)
  ADD COLUMN IF NOT EXISTS nurture_stage       SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nurture_last_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unsubscribed         BOOLEAN NOT NULL DEFAULT false,
  -- default volátil popula linhas existentes e novas com um token único
  ADD COLUMN IF NOT EXISTS unsubscribe_token    TEXT DEFAULT gen_random_uuid()::text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_response_unsubscribe_token
  ON public.quiz_response (unsubscribe_token)
  WHERE unsubscribe_token IS NOT NULL;

-- Índice para o cron encontrar quem está pendente em cada estágio
CREATE INDEX IF NOT EXISTS idx_quiz_response_nurture
  ON public.quiz_response (nurture_stage, created_at)
  WHERE unsubscribed = false;
