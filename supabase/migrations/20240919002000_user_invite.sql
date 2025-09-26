-- Invitations table for onboarding via token

CREATE TABLE IF NOT EXISTS public.user_invite (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  formation text NOT NULL,
  token text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_invite_token ON public.user_invite (token);
CREATE INDEX IF NOT EXISTS idx_user_invite_email ON public.user_invite (LOWER(email));

