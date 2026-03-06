
-- Índices faltantes identificados na análise
CREATE INDEX IF NOT EXISTS idx_platform_user_formation ON public.platform_user(formation);
CREATE INDEX IF NOT EXISTS idx_platform_user_role ON public.platform_user(role);
CREATE INDEX IF NOT EXISTS idx_application_followup_status ON public.rede_member_application(followup_status);
CREATE INDEX IF NOT EXISTS idx_application_house_id ON public.rede_member_application(house_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_status ON public.rede_track_enrollment(status);
;
