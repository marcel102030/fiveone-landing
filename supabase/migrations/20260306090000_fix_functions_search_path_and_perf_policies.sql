-- Migration: Fix function search_path vulnerabilities and optimize RLS auth() calls
--
-- Functions without SET search_path are vulnerable to search_path injection attacks.
-- RLS policies that call auth.jwt() / auth.uid() without a subquery re-evaluate
-- the function for every single row scanned — this causes unnecessary overhead.

-- ── Fix function search_path ────────────────────────────────────────────────

-- set_updated_at: trigger function — add SET search_path = public
CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = public
AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- inc_comment_like: RPC function — add SET search_path = public
CREATE OR REPLACE FUNCTION public.inc_comment_like(cid uuid)
  RETURNS void
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = public
AS $$
  UPDATE public.platform_lesson_comment
  SET likes = likes + 1
  WHERE id = cid;
$$;

-- ── Optimize RLS auth() per-row evaluation ──────────────────────────────────
-- Wrapping auth.jwt() in a subquery (SELECT auth.jwt() ->> 'email') causes
-- PostgreSQL to evaluate the expression once per query instead of once per row.

-- platform_lesson_completion
DROP POLICY IF EXISTS "users can manage own completions by email" ON public.platform_lesson_completion;
CREATE POLICY "completion_own" ON public.platform_lesson_completion
  FOR ALL TO authenticated
  USING (
    lower(COALESCE((SELECT auth.jwt() ->> 'email'), '')) = lower(user_id)
  )
  WITH CHECK (
    lower(COALESCE((SELECT auth.jwt() ->> 'email'), '')) = lower(user_id)
  );

-- platform_user_progress
DROP POLICY IF EXISTS "users can manage own progress by email" ON public.platform_user_progress;
CREATE POLICY "progress_own" ON public.platform_user_progress
  FOR ALL TO authenticated
  USING (
    lower(COALESCE((SELECT auth.jwt() ->> 'email'), '')) = lower(user_id)
  )
  WITH CHECK (
    lower(COALESCE((SELECT auth.jwt() ->> 'email'), '')) = lower(user_id)
  );
