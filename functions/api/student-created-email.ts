// Envia um e-mail de boas-vindas com usuário e senha quando um aluno é criado

type Env = {
  RESEND_API_KEY: string;
  RESEND_FROM?: string;
  RESEND_REPLY_TO?: string;
  SITE_URL?: string;
};

type Payload = {
  to: string; // e-mail do aluno
  name?: string | null;
  user: string; // normalmente o próprio e-mail
  password: string; // senha inicial
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

  try {
    const body = (await request.json()) as Payload;
    const to = String(body?.to || "").trim();
    const user = String(body?.user || "").trim();
    const password = String(body?.password || "").trim();
    const name = (body?.name || "").toString().trim();

    if (!to || !user || !password) {
      return new Response(JSON.stringify({ ok: false, error: "Missing to, user or password" }), { status: 400, headers: { "content-type": "application/json", ...CORS } });
    }

    if (!env.RESEND_API_KEY) {
      return new Response(JSON.stringify({ ok: false, error: "Missing RESEND_API_KEY env" }), { status: 500, headers: { "content-type": "application/json", ...CORS } });
    }

    const site = env.SITE_URL || `https://${request.headers.get("host")}`;
    const loginUrl = withUtm(`${site}/#/login-aluno`);

    const from = env.RESEND_FROM?.trim() || "Five One <bemvindofiveone@fiveonemovement.com>";
    const reply_to = env.RESEND_REPLY_TO?.trim() || "escolafiveone@gmail.com";

    const subject = "Bem-vindo à plataforma Five One — suas credenciais";
    const html = renderHtml({ name, user, password, loginUrl, site });
    const text = renderText({ name, user, password, loginUrl });

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

function renderHtml({ name, user, password, loginUrl, site }: { name?: string | null; user: string; password: string; loginUrl: string; site: string }) {
  const preheader = "Seu acesso à plataforma Five One";
  const greeting = name && name.trim() ? `Olá, ${escapeHtml(name.trim())}!` : "Olá!";
  const logo = `${site.replace(/\/$/, "")}/favicon.svg`;
  return `
  <div style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, Helvetica, sans-serif; max-width:640px; margin:0 auto; color:#0f172a;">
    <div style="display:none; visibility:hidden; opacity:0; height:0; overflow:hidden; color:transparent; line-height:0; max-height:0;">${escapeHtml(preheader)}</div>
    <div style="text-align:center; padding:18px 0 6px;">
      <img src="${logo}" alt="Five One" style="height:48px; width:auto;" />
    </div>
    <div style="background:#0b1220; padding:22px 18px; border-radius:14px; color:#e7f2f9;">
      <h1 style="margin:0 0 4px; font-size:22px;">Bem-vindo à Five One</h1>
      <p style="margin:0; color:#a8c5db;">${greeting} Seu acesso foi criado com sucesso.</p>
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:14px; border-collapse:separate; border:1px solid #e2e8f0; border-radius:12px;">
      <tr>
        <td style="padding:14px 16px;">
          <div style="font-weight:700; margin-bottom:6px;">Suas credenciais</div>
          <div style="display:grid; gap:6px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
            <div><span style="color:#64748b">Usuário:</span> ${escapeHtml(user)}</div>
            <div><span style="color:#64748b">Senha:</span> ${escapeHtml(password)}</div>
          </div>
          <p style="margin-top:10px; color:#475569; font-size:14px;">Guarde estas informações com segurança. Você pode alterar a senha após o primeiro acesso.</p>
          <div style="margin-top:12px;">
            <a href="${loginUrl}" style="background:#06b6d4; color:#ffffff; text-decoration:none; padding:12px 16px; border-radius:10px; font-size:16px; display:inline-block; min-height:44px; line-height:20px;">Acessar a plataforma</a>
          </div>
        </td>
      </tr>
    </table>

    <div style="margin-top:16px;">
      <div style="font-weight:700; margin-bottom:6px;">Dicas</div>
      <ul style="margin:0; padding-left:18px; color:#475569; line-height:1.6;">
        <li>Depois de entrar, procure a opção de alterar a senha.</li>
        <li>Se não reconhece este e-mail, ignore esta mensagem.</li>
      </ul>
    </div>

    <p style="font-size:12px; color:#94a3b8; text-align:center; margin-top:18px;">© 2025 Five One — Todos os direitos reservados</p>
  </div>`;
}

function renderText({ name, user, password, loginUrl }: { name?: string | null; user: string; password: string; loginUrl: string }) {
  const head = "Bem-vindo à plataforma Five One — suas credenciais";
  const hello = name && name.trim() ? `Olá, ${name.trim()}!` : "Olá!";
  return [
    head,
    "",
    hello,
    "Seu acesso foi criado com sucesso.",
    "",
    `Usuário: ${user}`,
    `Senha: ${password}`,
    "",
    `Acessar: ${loginUrl}`,
    "",
    "Guarde estas informações e altere a senha após o primeiro login.",
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
