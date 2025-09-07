// Sends a formatted email with the 3 key links after a church is created

type Env = {
  RESEND_API_KEY: string;
  RESEND_FROM?: string;
  RESEND_REPLY_TO?: string;
  SITE_URL?: string;
};

type Payload = {
  to: string;
  church: { name: string; slug: string };
  links?: { testUrl?: string; reportUrl?: string; whatsappUrl?: string };
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const onRequest = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;
  const method = request.method.toUpperCase();

  if (method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (method === "GET") {
    // Diagnóstico rápido para checar vars
    const hasKey = !!env.RESEND_API_KEY && env.RESEND_API_KEY.startsWith("re_");
    return new Response(JSON.stringify({ ok: true, resend_key: hasKey ? "present" : "missing", site: env.SITE_URL || null }), { status: 200, headers: { "content-type": "application/json", ...CORS } });
  }
  if (method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: { ...CORS, Allow: "POST, GET, OPTIONS" } });

  try {
    const body = (await request.json()) as Payload;
    const to = String(body?.to || "").trim();
    const church = body?.church || ({} as any);
    const slug = String(church?.slug || "").trim();
    const name = String(church?.name || "").trim();

    if (!to || !slug || !name) {
      return new Response(JSON.stringify({ ok: false, error: "Missing to, name or slug" }), { status: 400, headers: { "content-type": "application/json", ...CORS } });
    }

    const site = env.SITE_URL || `https://${request.headers.get("host")}`;
    const testUrl = body?.links?.testUrl || `${site}/#/teste-dons?churchSlug=${encodeURIComponent(slug)}`;
    const reportUrl = body?.links?.reportUrl || `${site}/#/relatorio/${encodeURIComponent(slug)}`;
    const whatsappUrl = body?.links?.whatsappUrl || `https://wa.me/5583989004764`;

    const from = env.RESEND_FROM?.trim() || "Five One <resultado5ministerios@fiveonemovement.com>";
    const reply_to = env.RESEND_REPLY_TO?.trim() || "escolafiveone@gmail.com";

    const html = renderHtml({ name, testUrl, reportUrl, whatsappUrl });

    if (!env.RESEND_API_KEY) {
      return new Response(JSON.stringify({ ok: false, error: "Missing RESEND_API_KEY env" }), { status: 500, headers: { "content-type": "application/json", ...CORS } });
    }

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject: `Bem-vindo(a)! Sua igreja foi cadastrada — ${name}`, html, reply_to }),
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

function renderHtml({ name, testUrl, reportUrl, whatsappUrl }: { name: string; testUrl: string; reportUrl: string; whatsappUrl: string }) {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 640px; margin:0 auto; color:#0f172a;">
    <div style="text-align:center; padding: 8px 0 0;">
      <h1 style="margin:0 0 8px; font-size:22px; color:#0f172a;">Igreja criada com sucesso</h1>
      <p style="margin:0 0 18px; color:#475569;">${escapeHtml(name)} foi cadastrada no sistema Five One.</p>
    </div>

    ${option("🎯", "Compartilhar link de teste", "Este é o link para que sua igreja faça o Teste dos 5 Ministérios.", testUrl, "Abrir link")}
    ${option("📊", "Abrir relatório", "Acompanhe o resultado geral da sua comunidade: porcentagem de dons, volume de respostas e mais.", reportUrl, "Abrir relatório")}
    ${option("💬", "Dúvidas", "Fale com a equipe Five One pelo WhatsApp para tirar dúvidas.", whatsappUrl, "Abrir WhatsApp")}

    <p style="font-size:12px; color:#64748b; text-align:center; margin-top:18px;">Se você não solicitou este cadastro, pode ignorar este e-mail.</p>
    <div style="text-align:center; margin-top:16px; font-size:12px; color:#94a3b8;">© 2025 Five One — Todos os direitos reservados</div>
  </div>`;
}

function option(emoji: string, title: string, desc: string, href: string, cta: string) {
  return `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 12px; border-collapse:separate; border:1px solid #e2e8f0; border-radius:12px;">
    <tr>
      <td style="padding:14px 16px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="font-size:20px;">${emoji}</div>
          <div style="flex:1;">
            <div style="font-weight:700;">${escapeHtml(title)}</div>
            <div style="color:#475569; font-size:14px;">${escapeHtml(desc)}</div>
          </div>
          <a href="${href}" style="background:#0b1220; color:#fff; text-decoration:none; padding:8px 12px; border-radius:8px; font-size:14px;">${escapeHtml(cta)}</a>
        </div>
      </td>
    </tr>
  </table>`;
}

function escapeHtml(str: string){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"','&quot;')
    .replaceAll("'","&#39;");
}
