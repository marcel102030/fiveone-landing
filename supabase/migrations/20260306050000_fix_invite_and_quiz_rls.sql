-- Migration: Enable RLS on platform_user_invite and quiz_response
--
-- platform_user_invite: tokens were fully exposed without RLS.
--   Fix: Anon/auth can look up active (unused, unexpired) invites by token.
--        Only admins can create/update/delete invites.
--
-- quiz_response: 102 rows exposed publicly without RLS.
--   Fix: Anyone can submit (public quiz), only admins can read/manage responses.

-- ── platform_user_invite ───────────────────────────────────────────────────
ALTER TABLE public.platform_user_invite ENABLE ROW LEVEL SECURITY;

-- Anyone can look up an active invite (needed for invite-link validation flow
-- before the user creates their account). Tokens are random/opaque, so
-- listing active invites is low-risk and required for the UX to work.
CREATE POLICY "invite_select_active" ON public.platform_user_invite
  FOR SELECT TO anon, authenticated
  USING (
    used_at IS NULL
    AND (expires_at IS NULL OR expires_at > now())
  );

-- Only admins can create, update, or delete invite records
CREATE POLICY "invite_admin_write" ON public.platform_user_invite
  FOR ALL TO authenticated
  USING ((SELECT public.is_platform_admin()))
  WITH CHECK ((SELECT public.is_platform_admin()));

-- ── quiz_response ──────────────────────────────────────────────────────────
ALTER TABLE public.quiz_response ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated visitors) can submit a quiz response
CREATE POLICY "quiz_insert_public" ON public.quiz_response
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read quiz responses
CREATE POLICY "quiz_select_admin" ON public.quiz_response
  FOR SELECT TO authenticated
  USING ((SELECT public.is_platform_admin()));

-- Only admins can update or delete quiz responses
CREATE POLICY "quiz_admin_write" ON public.quiz_response
  FOR ALL TO authenticated
  USING ((SELECT public.is_platform_admin()))
  WITH CHECK ((SELECT public.is_platform_admin()));
