-- Campos novos no formulário de visitante
-- meeting_highlight: o que marcou o visitante no encontro
-- wants_to_return: intenção de voltar (sim | talvez | ainda_nao_sei)
ALTER TABLE public.rede_member_application
  ADD COLUMN IF NOT EXISTS meeting_highlight  TEXT,
  ADD COLUMN IF NOT EXISTS wants_to_return    TEXT;

-- URL do grupo de WhatsApp da Igreja na Casa (usado na tela de sucesso)
ALTER TABLE public.rede_house_church
  ADD COLUMN IF NOT EXISTS whatsapp_group_url TEXT;
