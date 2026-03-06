
-- Criar perfis mínimos para os usuários que já comentaram mas não têm perfil
INSERT INTO platform_user_profile (user_email, created_at, updated_at)
VALUES
  ('escolafiveone@gmail.com', now(), now()),
  ('guhfariasd@gmail.com', now(), now())
ON CONFLICT DO NOTHING;
;
