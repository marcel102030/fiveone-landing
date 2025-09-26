-- Five One Platform — Migration
-- Adds `active` column and ensures unique emails for `platform_user`.

-- 1) Add `active` boolean with default TRUE
ALTER TABLE IF EXISTS public.platform_user
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT TRUE;

-- 2) Ensure email uniqueness (case-sensitive). The app already normaliza para lowercase.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'platform_user_email_unique'
  ) THEN
    ALTER TABLE public.platform_user
      ADD CONSTRAINT platform_user_email_unique UNIQUE (email);
  END IF;
END $$;

-- 3) Optional helper index for case-insensitive lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_platform_user_email_lower'
  ) THEN
    CREATE INDEX idx_platform_user_email_lower ON public.platform_user (LOWER(email));
  END IF;
END $$;

