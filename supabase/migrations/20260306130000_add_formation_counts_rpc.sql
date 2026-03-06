-- Migration: Add get_formation_counts() RPC
-- Replaces 5 parallel COUNT queries (one per formation) with a single GROUP BY.
-- The TypeScript getFormationCounts() function calls this via supabase.rpc().

CREATE OR REPLACE FUNCTION public.get_formation_counts()
  RETURNS TABLE(formation text, cnt bigint)
  LANGUAGE sql
  SECURITY DEFINER
  STABLE
  SET search_path = public
AS $$
  SELECT formation::text, COUNT(*)::bigint AS cnt
  FROM public.platform_user
  WHERE formation IS NOT NULL
  GROUP BY formation;
$$;
