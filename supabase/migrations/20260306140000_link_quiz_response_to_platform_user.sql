-- Migration: Link quiz_response to platform_user
-- quiz_response already stores person_email (free text from the quiz form).
-- This migration adds a typed FK column platform_user_email that is populated
-- when a matching platform_user exists, enabling proper relational joins.

ALTER TABLE public.quiz_response
  ADD COLUMN IF NOT EXISTS platform_user_email text
    REFERENCES public.platform_user(email) ON DELETE SET NULL;

-- Backfill: link existing responses where person_email matches a platform_user
UPDATE public.quiz_response qr
SET platform_user_email = lower(qr.person_email)
FROM public.platform_user pu
WHERE lower(qr.person_email) = pu.email
  AND qr.platform_user_email IS NULL;

-- Index to support joins and lookups by platform user
CREATE INDEX IF NOT EXISTS idx_quiz_response_platform_user
  ON public.quiz_response (platform_user_email)
  WHERE platform_user_email IS NOT NULL;
