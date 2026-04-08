// Envia e-mail de certificado emitido para o aluno
// Env vars necessárias:
//   RESEND_API_KEY
//   RESEND_FROM_ALUNO (opcional)
//   RESEND_REPLY_TO_ALUNO (opcional)
//   SITE_URL

type Env = {
  RESEND_API_KEY: string;
  RESEND_FROM_ALUNO?: string;
  RESEND_REPLY_TO_ALUNO?: string;
  SITE_URL?: string;
};

type Payload = {
  to: string;
  name?: string | null;
  formation: string;     // ex: "Apóstolo"
  verifyCode: string;    // UUID do certificado
  issuedAt?: string;     // ISO date string
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const onRequest = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  if (method === 'GET') {
    const ok = !!env.RESEND_API_KEY && env.RESEND_API_KEY.startsWith('re_');
    return new Response(JSON.stringify({ ok, service: 'certificate-email' }), {
      status: 200,
      headers: { 'content-type': 'application/json', ...CORS },
    });
  }

  if (method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: CORS });
  }

  try {
    const body = (await request.json()) as Partial<Payload>;
    const to = String(body?.to || '').trim();
    const name = (body?.name || '').toString().trim() || null;
    const formation = String(body?.formation || '').trim();
    const verifyCode = String(body?.verifyCode || '').trim();
    const issuedAt = body?.issuedAt ? new Date(body.issuedAt) : new Date();

    if (!to || !formation || !verifyCode) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing required fields: to, formation, verifyCode' }),
        { status: 400, headers: { 'content-type': 'application/json', ...CORS } }
      );
    }

    if (!env.RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing RESEND_API_KEY env' }),
        { status: 500, headers: { 'content-type': 'application/json', ...CORS } }
      );
    }

    const site = env.SITE_URL || `https://${new URL(request.url).host}`;
    const certUrl = `${site}/#/certificado/${verifyCode}`;
    const from =
      env.RESEND_FROM_ALUNO?.trim() || 'Five One <bemvindofiveone@fiveonemovement.com>';
    const reply_to =
      env.RESEND_REPLY_TO_ALUNO?.trim() || 'escolafiveone@gmail.com';

    const dateFormatted = issuedAt.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const greeting = name ? `Olá, ${escapeHtml(name)}!` : 'Olá!';

    const html = `
<div style="font-family: Inter, system-ui, Arial, sans-serif; max-width:640px; margin:0 auto; color:#0f172a;">
  <div style="background:#0b1220; padding:22px 18px; border-radius:14px; color:#e7f2f9; text-align:center;">
    <div style="font-size:48px; margin-bottom:8px;">🏆</div>
    <h1 style="margin:0 0 4px; font-size:22px;">Certificado emitido!</h1>
    <p style="margin:0; color:#a8c5db;">${greeting} Seu certificado de <strong>${escapeHtml(formation)}</strong> foi emitido com sucesso.</p>
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:14px; border-collapse:separate; border:1px solid #e2e8f0; border-radius:12px;">
    <tr>
      <td style="padding:20px;">
        <p style="margin:0 0 8px; color:#475569; font-size:14px;">Data de emissão: <strong>${dateFormatted}</strong></p>
        <p style="margin:0 0 16px; color:#475569; font-size:14px;">Código de verificação:</p>
        <div style="font-family: monospace; background:#f8fafc; padding:10px 14px; border-radius:8px; font-size:13px; color:#0f172a; word-break:break-all; margin-bottom:16px;">
          ${escapeHtml(verifyCode)}
        </div>
        <p style="margin:0 0 16px; color:#475569; font-size:14px;">
          Você pode acessar e compartilhar seu certificado através do link abaixo:
        </p>
        <a href="${certUrl}" style="background:#06b6d4; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:10px; font-size:15px; display:inline-block; font-weight:600;">
          Ver meu certificado →
        </a>
      </td>
    </tr>
  </table>

  <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:14px 16px; margin-top:14px;">
    <p style="margin:0; font-size:14px; color:#166534;">
      💡 <strong>Dica:</strong> Compartilhe o link do certificado em seu LinkedIn e redes sociais para destacar sua formação ministerial.
    </p>
  </div>

  <p style="font-size:12px; color:#94a3b8; text-align:center; margin-top:18px;">© 2025 Five One — Todos os direitos reservados</p>
</div>`;

    const text = [
      '🏆 Certificado emitido — Five One',
      '',
      greeting,
      `Seu certificado de ${formation} foi emitido em ${dateFormatted}.`,
      '',
      `Código de verificação: ${verifyCode}`,
      '',
      `Ver certificado: ${certUrl}`,
      '',
      'Compartilhe seu certificado no LinkedIn para destacar sua formação ministerial.',
    ].join('\n');

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        reply_to,
        subject: `🏆 Seu certificado de ${formation} foi emitido — Five One`,
        html,
        text,
      }),
    });

    const data = await r.json().catch(() => ({})) as any;
    if (!r.ok) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Resend failed', detail: data }),
        { status: 502, headers: { 'content-type': 'application/json', ...CORS } }
      );
    }

    return new Response(JSON.stringify({ ok: true, id: data?.id }), {
      status: 200,
      headers: { 'content-type': 'application/json', ...CORS },
    });
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
