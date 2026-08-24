-- Lista de espera de produtos (curso, livro) capturada no fim do Teste dos 5 Ministérios.
-- A pessoa já deu o e-mail no teste; o botão "Quero ser avisado" registra o interesse aqui.

CREATE TABLE IF NOT EXISTS public.quiz_waitlist (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL,
  product    text NOT NULL CHECK (product IN ('curso', 'livro')),
  name       text,
  source     text DEFAULT 'quiz',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, product)
);

-- RLS ligado, SEM policies → anon/authenticated bloqueados; só o service role (endpoint) escreve/lê.
ALTER TABLE public.quiz_waitlist ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_quiz_waitlist_product
  ON public.quiz_waitlist (product, created_at);
