-- Migration: Add missing updated_at auto-update triggers
-- platform_user_profile, platform_module and platform_lesson all have an
-- updated_at column but no trigger to keep it current on UPDATE.
-- The set_updated_at() trigger function already exists (created/patched in
-- migration 20260306090000_fix_functions_search_path_and_perf_policies.sql).

CREATE TRIGGER trg_platform_user_profile_updated_at
  BEFORE UPDATE ON public.platform_user_profile
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_platform_module_updated_at
  BEFORE UPDATE ON public.platform_module
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_platform_lesson_updated_at
  BEFORE UPDATE ON public.platform_lesson
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
