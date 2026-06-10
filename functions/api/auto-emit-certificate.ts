// Emite um certificado automaticamente quando o aluno conclui 100% do curso.
// Idempotente: se já existir um certificado para o par (userEmail, ministryId),
// retorna o verify_code existente sem inserir novamente.
// Também envia o e-mail de certificado se RESEND_API_KEY estiver configurado.
//
// Env vars necessárias:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   RESEND_API_KEY (opcional — email não é enviado se ausente)
//   RESEND_FROM_ALUNO (opcional)
//   SITE_URL (opcional — detectado do host se omitido)

import { createClient } from '@supabase/supabase-js';

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_ALUNO?: string;
  SITE_URL?: string;
};

type Payload = {
  userEmail: string;
  ministryId: string;
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const onRequest = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: CORS });

  try {
    const body = (await request.json().catch(() => null)) as Partial<Payload> | null;
    const userEmail = body?.userEmail?.trim().toLowerCase();
    const ministryId = body?.ministryId?.trim();

    if (!userEmail || !ministryId) {
      return new Response(
        JSON.stringify({ ok: false, error: 'userEmail e ministryId são obrigatórios' }),
        { status: 400, headers: { 'content-type': 'application/json', ...CORS } }
      );
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Configuração de servidor incompleta' }),
        { status: 500, headers: { 'content-type': 'application/json', ...CORS } }
      );
    }

    const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // ── Idempotência ──────────────────────────────────────────────────────────
    const { data: existing } = await admin
      .from('platform_certificate')
      .select('verify_code, issued_at')
      .eq('user_id', userEmail)
      .eq('ministry_id', ministryId)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ ok: true, verifyCode: existing.verify_code, isNew: false }),
        { status: 200, headers: { 'content-type': 'application/json', ...CORS } }
      );
    }

    // ── Validação de conclusão (segurança) ────────────────────────────────────
    // Esta rota usa service-role e é pública; sem esta checagem qualquer um
    // poderia forjar um certificado para qualquer e-mail. Só emite se o aluno
    // concluiu TODAS as aulas publicadas do curso.
    const { data: modules } = await admin
      .from('platform_module')
      .select('id')
      .eq('ministry_id', ministryId)
      .eq('status', 'published');
    const moduleIds = (modules ?? []).map((m) => m.id as string);

    let lessonIds: string[] = [];
    if (moduleIds.length > 0) {
      const { data: lessons } = await admin
        .from('platform_lesson')
        .select('id')
        .in('module_id', moduleIds)
        .eq('status', 'published')
        .eq('is_active', true);
      lessonIds = (lessons ?? []).map((l) => l.id as string);
    }

    if (lessonIds.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Curso sem aulas publicadas — certificado não pode ser emitido' }),
        { status: 400, headers: { 'content-type': 'application/json', ...CORS } }
      );
    }

    const { data: completions } = await admin
      .from('platform_lesson_completion')
      .select('lesson_id')
      .eq('user_id', userEmail)
      .in('lesson_id', lessonIds);
    const completedSet = new Set((completions ?? []).map((c) => c.lesson_id as string));
    const allDone = lessonIds.every((id) => completedSet.has(id));

    if (!allDone) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Curso ainda não concluído',
          concluidas: completedSet.size,
          total: lessonIds.length,
        }),
        { status: 403, headers: { 'content-type': 'application/json', ...CORS } }
      );
    }

    // ── Emitir certificado ────────────────────────────────────────────────────
    const verifyCode = crypto.randomUUID();
    const issuedAt = new Date().toISOString();

    const { error: insertError } = await admin.from('platform_certificate').insert({
      user_id: userEmail,
      ministry_id: ministryId,
      issued_at: issuedAt,
      verify_code: verifyCode,
    });

    if (insertError) {
      // Conflito do índice único uq_certificate_user_ministry (corrida entre
      // dois disparos) → busca o certificado existente e retorna como idempotente.
      const isConflict =
        (insertError as { code?: string }).code === '23505' ||
        /duplicate|unique/i.test(insertError.message);
      if (isConflict) {
        const { data: dup } = await admin
          .from('platform_certificate')
          .select('verify_code')
          .eq('user_id', userEmail)
          .eq('ministry_id', ministryId)
          .maybeSingle();
        if (dup?.verify_code) {
          return new Response(
            JSON.stringify({ ok: true, verifyCode: dup.verify_code, isNew: false }),
            { status: 200, headers: { 'content-type': 'application/json', ...CORS } }
          );
        }
      }
      return new Response(
        JSON.stringify({ ok: false, error: insertError.message }),
        { status: 500, headers: { 'content-type': 'application/json', ...CORS } }
      );
    }

    // ── Buscar nome do aluno e do curso para o e-mail ─────────────────────────
    const [userRes, courseRes] = await Promise.all([
      admin.from('platform_user').select('name').eq('email', userEmail).maybeSingle(),
      admin.from('platform_ministry').select('title').eq('id', ministryId).maybeSingle(),
    ]);

    const userName = (userRes.data?.name as string | null) ?? null;
    const courseName = (courseRes.data?.title as string | null) ?? ministryId;

    // ── Enviar e-mail (não bloqueia a resposta) ───────────────────────────────
    if (env.RESEND_API_KEY?.startsWith('re_')) {
      const site = env.SITE_URL || `https://${new URL(request.url).host}`;
      const certUrl = `${site}/certificado/${verifyCode}`;
      const from = env.RESEND_FROM_ALUNO?.trim() || 'Five One <bemvindofiveone@fiveonemovement.com>';
      const dateFormatted = new Date(issuedAt).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric',
      });
      const greeting = userName ? `Olá, ${escapeHtml(userName)}!` : 'Olá!';

      const html = `
<div style="font-family:Inter,system-ui,Arial,sans-serif;max-width:640px;margin:0 auto;color:#0f172a;">
  <div style="background:#0b1220;padding:22px 18px;border-radius:14px;color:#e7f2f9;text-align:center;">
    <div style="font-size:48px;margin-bottom:8px;">🏆</div>
    <h1 style="margin:0 0 4px;font-size:22px;">Certificado emitido!</h1>
    <p style="margin:0;color:#a8c5db;">${greeting} Você concluiu o curso de <strong>${escapeHtml(courseName)}</strong> e seu certificado foi gerado automaticamente.</p>
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:14px;border-collapse:separate;border:1px solid #e2e8f0;border-radius:12px;">
    <tr><td style="padding:20px;">
      <p style="margin:0 0 8px;color:#475569;font-size:14px;">Data de emissão: <strong>${dateFormatted}</strong></p>
      <p style="margin:0 0 16px;color:#475569;font-size:14px;">Código de verificação:</p>
      <div style="font-family:monospace;background:#f8fafc;padding:10px 14px;border-radius:8px;font-size:13px;color:#0f172a;word-break:break-all;margin-bottom:16px;">
        ${escapeHtml(verifyCode)}
      </div>
      <a href="${certUrl}" style="background:#06b6d4;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-size:15px;display:inline-block;font-weight:600;">
        Ver meu certificado →
      </a>
    </td></tr>
  </table>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px 16px;margin-top:14px;">
    <p style="margin:0;font-size:14px;color:#166534;">💡 <strong>Dica:</strong> Compartilhe o link do certificado no seu LinkedIn para destacar sua formação ministerial.</p>
  </div>
  <p style="font-size:12px;color:#94a3b8;text-align:center;margin-top:18px;">© ${new Date().getFullYear()} Five One — Todos os direitos reservados</p>
</div>`;

      // fire-and-forget
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: userEmail,
          subject: `🏆 Certificado de ${courseName} emitido — Five One`,
          html,
        }),
      }).catch(() => {});
    }

    return new Response(
      JSON.stringify({ ok: true, verifyCode, isNew: true }),
      { status: 200, headers: { 'content-type': 'application/json', ...CORS } }
    );

  } catch (e: any) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e?.message || e) }),
      { status: 500, headers: { 'content-type': 'application/json', ...CORS } }
    );
  }
};

function escapeHtml(str: string): string {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
