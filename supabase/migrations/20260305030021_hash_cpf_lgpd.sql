
-- Habilitar extensão pgcrypto para hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Adicionar coluna de hash ao lado da coluna original
ALTER TABLE public.platform_user_profile 
  ADD COLUMN IF NOT EXISTS cpf_hash text;

-- Converter CPFs existentes para hash SHA-256
UPDATE public.platform_user_profile
SET cpf_hash = encode(digest(regexp_replace(cpf, '[^0-9]', '', 'g'), 'sha256'), 'hex')
WHERE cpf IS NOT NULL AND cpf != '';

-- Apagar CPF em texto plano
UPDATE public.platform_user_profile
SET cpf = NULL
WHERE cpf IS NOT NULL;

-- Adicionar comentário documentando a decisão
COMMENT ON COLUMN public.platform_user_profile.cpf IS 'Deprecated - removido por LGPD. Use cpf_hash.';
COMMENT ON COLUMN public.platform_user_profile.cpf_hash IS 'SHA-256 do CPF sem formatação (apenas dígitos). LGPD compliant.';
;
