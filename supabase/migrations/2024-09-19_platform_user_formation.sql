-- Five One Platform — Migration
-- Adds `formation` field to platform_user with default 'MESTRE'.

ALTER TABLE IF EXISTS public.platform_user
  ADD COLUMN IF NOT EXISTS formation text NOT NULL DEFAULT 'MESTRE';

-- Optional: constrain to known values (keep flexible; comment out if needed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'platform_user_formation_chk'
  ) THEN
    ALTER TABLE public.platform_user
      ADD CONSTRAINT platform_user_formation_chk
      CHECK (formation IN ('APOSTOLO','PROFETA','EVANGELISTA','PASTOR','MESTRE'));
  END IF;
END $$;

