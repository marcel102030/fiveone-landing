// Envia um e-mail de boas-vindas com usuário e senha quando um aluno é criado.
// Recebe a senha em texto plano — exige admin autenticado para evitar abuso/spam.

import { assertAdmin, type AdminAuthEnv } from './_adminAuth';

type Env = AdminAuthEnv & {
  RESEND_API_KEY: string;
  RESEND_FROM?: string;
  RESEND_REPLY_TO?: string;
  RESEND_FROM_ALUNO?: string;
  RESEND_REPLY_TO_ALUNO?: string;
  SITE_URL?: string;
};

type Payload = {
  to: string;
  name?: string | null;
  user: string;
  password: string;
  course?: string | null; // nome do curso matriculado
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const onRequest = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;
  const method = request.method.toUpperCase();

  if (method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  if (method === "GET") {
    const ok = !!env.RESEND_API_KEY && env.RESEND_API_KEY.startsWith("re_");
    return new Response(JSON.stringify({ ok, site: env.SITE_URL || null }), { status: 200, headers: { "content-type": "application/json", ...CORS } });
  }

  if (method !== "POST")
    return new Response("Method Not Allowed", { status: 405, headers: { ...CORS, Allow: "POST, GET, OPTIONS" } });

  // Exige admin autenticado — payload tem a senha do aluno em texto plano.
  const authResult = await assertAdmin(request, env);
  if (!authResult.ok) return authResult.response;

  try {
    const body = (await request.json()) as Payload;
    const to = String(body?.to || "").trim();
    const user = String(body?.user || "").trim();
    const password = String(body?.password || "").trim();
    const name = (body?.name || "").toString().trim();
    const course = (body?.course || "Defenda a sua Fé").toString().trim();

    if (!to || !user || !password) {
      return new Response(JSON.stringify({ ok: false, error: "Missing to, user or password" }), { status: 400, headers: { "content-type": "application/json", ...CORS } });
    }

    if (!env.RESEND_API_KEY) {
      return new Response(JSON.stringify({ ok: false, error: "Missing RESEND_API_KEY env" }), { status: 500, headers: { "content-type": "application/json", ...CORS } });
    }

    const loginUrl = withUtm(`https://escolafiveone.com/login-aluno`);

    const from = env.RESEND_FROM_ALUNO?.trim() || env.RESEND_FROM?.trim() || "Escola Five One <no-reply@fiveonemovement.com>";
    const reply_to = env.RESEND_REPLY_TO_ALUNO?.trim() || env.RESEND_REPLY_TO?.trim() || "escolafiveone@gmail.com";

    const firstName = name.split(" ")[0] || name;
    const subject = firstName
      ? `${firstName}, sua jornada em "${course}" começa agora — Escola Five One`
      : `Sua jornada em "${course}" começa agora — Escola Five One`;
    const html = renderHtml({ name, user, password, loginUrl, course });
    const text = renderText({ name, user, password, loginUrl, course });

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html, text, reply_to }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return new Response(JSON.stringify({ ok: false, error: "Resend failed", detail: data }), { status: 502, headers: { "content-type": "application/json", ...CORS } });
    }
    return new Response(JSON.stringify({ ok: true, id: data?.id }), { status: 200, headers: { "content-type": "application/json", ...CORS } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { "content-type": "application/json", ...CORS } });
  }
};

function renderHtml({ name, user, password, loginUrl, course }: { name?: string | null; user: string; password: string; loginUrl: string; course: string }) {
  const preheader = `Seu acesso à Escola Five One — ${course} está pronto!`;
  const firstName = (name || "").trim().split(" ")[0];
  const greeting = firstName ? escapeHtml(firstName) : "Aluno(a)";
  const NAVY = "#07101f";
  const NAVY2 = "#0d1f3c";
  const MINT = "#64ffda";
  const yr = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bem-vindo à Escola Five One</title></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Inter,system-ui,-apple-system,Arial,sans-serif;">

<!-- Preheader oculto -->
<div style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(preheader)}</div>

<!-- Wrapper -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0">

  <!-- HEADER — bgcolor attribute garante cor em todos os clientes de email -->
  <tr><td bgcolor="${NAVY}" style="background:${NAVY};border-radius:16px 16px 0 0;padding:28px 40px 20px;text-align:center;">
    <img src="https://fiveonemovement.com/pwa-icon-192.png"
         alt="Five One" height="52" style="height:52px;width:52px;display:inline-block;border-radius:10px;" />
    <p style="margin:10px 0 0;color:#9ecfeb;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-weight:600;">Escola Five One</p>
  </td></tr>

  <!-- HERO — bgcolor sólido como fallback (gradiente não funciona em todos os clientes) -->
  <tr><td bgcolor="${NAVY2}" style="background:${NAVY2};padding:36px 32px 28px;text-align:center;">
    <!-- Badge -->
    <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
      <tr><td bgcolor="#0d2a3a" style="background:#0d2a3a;border:1px solid #1a5a6e;border-radius:100px;padding:6px 18px;">
        <span style="color:${MINT};font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">✓ Acesso criado com sucesso</span>
      </td></tr>
    </table>
    <!-- Título -->
    <h1 style="margin:0 0 8px;color:#ffffff;font-size:26px;font-weight:800;line-height:1.3;">
      Bem-vindo(a),
    </h1>
    <h1 style="margin:0 0 16px;color:${MINT};font-size:30px;font-weight:800;line-height:1.2;">
      ${greeting}!
    </h1>
    <p style="margin:0 0 20px;color:#b0cee0;font-size:14px;line-height:1.6;">
      Sua conta na Escola Five One foi criada<br/>e você já está matriculado(a) no curso:
    </p>
    <!-- Curso destaque — fundo sólido garantido -->
    <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr><td bgcolor="#0b2235" style="background:#0b2235;border:1px solid #1d4a60;border-radius:12px;padding:14px 28px;text-align:center;">
        <p style="margin:0 0 4px;color:#7ab8d4;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;">Seu curso</p>
        <p style="margin:0;color:${MINT};font-size:20px;font-weight:800;">${escapeHtml(course)}</p>
      </td></tr>
    </table>
  </td></tr>

  <!-- CREDENCIAIS — fundo branco com bgcolor -->
  <tr><td bgcolor="#ffffff" style="background:#ffffff;padding:28px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
    <p style="margin:0 0 16px;color:#111827;font-size:15px;font-weight:700;">Suas credenciais de acesso:</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td bgcolor="#f1f5f9" style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px 10px 0 0;padding:12px 18px;border-bottom:1px solid #e2e8f0;">
        <p style="margin:0 0 3px;color:#64748b;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Usuário</p>
        <p style="margin:0;color:#0f172a;font-size:14px;font-family:ui-monospace,Courier New,monospace;">${escapeHtml(user)}</p>
      </td></tr>
      <tr><td bgcolor="#f1f5f9" style="background:#f1f5f9;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 10px 10px;padding:12px 18px;">
        <p style="margin:0 0 3px;color:#64748b;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Senha inicial</p>
        <p style="margin:0;color:#0f172a;font-size:14px;font-family:ui-monospace,Courier New,monospace;font-weight:700;letter-spacing:0.05em;">${escapeHtml(password)}</p>
      </td></tr>
    </table>

    <p style="margin:14px 0 0;color:#6b7280;font-size:13px;line-height:1.5;">
      🔒 Guarde com segurança e altere sua senha após o primeiro acesso.
    </p>

    <!-- CTA -->
    <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:24px auto 0;">
      <tr><td bgcolor="${MINT}" style="background:${MINT};border-radius:100px;">
        <a href="${loginUrl}"
           style="display:inline-block;background:${MINT};color:${NAVY};text-decoration:none;padding:15px 36px;border-radius:100px;font-size:15px;font-weight:800;letter-spacing:0.02em;">
          Acessar a Escola Five One →
        </a>
      </td></tr>
    </table>
    <p style="margin:10px 0 0;color:#9ca3af;font-size:12px;text-align:center;">escolafiveone.com</p>
  </td></tr>

  <!-- PRÓXIMOS PASSOS -->
  <tr><td style="background:#f9fafb;padding:28px 40px;border:1px solid #e5e7eb;">
    <p style="margin:0 0 16px;color:#374151;font-size:14px;font-weight:700;">O que fazer agora:</p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:6px 0;color:#4b5563;font-size:13px;line-height:1.5;">
          <span style="color:${MINT};font-weight:700;margin-right:8px;">1.</span>Acesse <strong>escolafiveone.com</strong> e faça seu login
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#4b5563;font-size:13px;line-height:1.5;">
          <span style="color:${MINT};font-weight:700;margin-right:8px;">2.</span>Vá em <strong>Perfil</strong> e altere sua senha
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#4b5563;font-size:13px;line-height:1.5;">
          <span style="color:${MINT};font-weight:700;margin-right:8px;">3.</span>Acesse o curso <strong>${escapeHtml(course)}</strong> e comece sua jornada
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:${NAVY};border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
    <p style="margin:0 0 8px;color:rgba(255,255,255,0.4);font-size:12px;">Se não reconhece este e-mail, ignore esta mensagem.</p>
    <p style="margin:0;color:rgba(255,255,255,0.25);font-size:11px;">© ${yr} Five One — Todos os direitos reservados</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function renderText({ name, user, password, loginUrl, course }: { name?: string | null; user: string; password: string; loginUrl: string; course: string }) {
  const firstName = (name || "").trim().split(" ")[0] || "Aluno(a)";
  return [
    `Bem-vindo(a) à Escola Five One, ${firstName}!`,
    "",
    `Seu acesso ao curso "${course}" foi criado com sucesso.`,
    "",
    "SUAS CREDENCIAIS:",
    `Usuário: ${user}`,
    `Senha: ${password}`,
    "",
    `Acessar: ${loginUrl}`,
    "",
    "PRÓXIMOS PASSOS:",
    "1. Acesse escolafiveone.com e faça seu login",
    "2. Vá em Perfil e altere sua senha",
    `3. Acesse o curso "${course}" e comece sua jornada`,
    "",
    "Guarde suas credenciais com segurança.",
    "Se não reconhece este e-mail, ignore esta mensagem.",
    "",
    `© ${new Date().getFullYear()} Five One — Todos os direitos reservados`,
  ].join("\n");
}

function escapeHtml(str: string){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"','&quot;')
    .replaceAll("'","&#39;");
}

function withUtm(url: string){
  try {
    const u = new URL(url);
    u.searchParams.set('utm_source','email');
    u.searchParams.set('utm_medium','transactional');
    u.searchParams.set('utm_campaign','student_created');
    return u.toString();
  } catch { return url; }
}
