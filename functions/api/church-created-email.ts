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
  responsibleName?: string; // opcional, para saudação
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
    const baseTest = body?.links?.testUrl || `${site}/#/teste-dons?churchSlug=${encodeURIComponent(slug)}`;
    const baseReport = body?.links?.reportUrl || `${site}/#/relatorio/${encodeURIComponent(slug)}`;
    const whatsappUrl = body?.links?.whatsappUrl || `https://wa.me/5583989004764`;

    const testUrl = withUtm(baseTest);
    const reportUrl = withUtm(baseReport);
    const plain = renderText({ name, churchSlug: slug, testUrl, reportUrl, whatsappUrl, responsibleName: body?.responsibleName });

    const from = env.RESEND_FROM?.trim() || "Five One <bemvindofiveone@fiveonemovement.com>";
    const reply_to = env.RESEND_REPLY_TO?.trim() || "escolafiveone@gmail.com";

    const html = renderHtml({ name, testUrl, reportUrl, whatsappUrl, responsibleName: body?.responsibleName });

    if (!env.RESEND_API_KEY) {
      return new Response(JSON.stringify({ ok: false, error: "Missing RESEND_API_KEY env" }), { status: 500, headers: { "content-type": "application/json", ...CORS } });
    }

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        subject: "Igreja criada! Aqui está o link do Teste dos 5 Ministérios",
        html,
        text: plain,
        reply_to,
      }),
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

function renderHtml({ name, testUrl, reportUrl, whatsappUrl, responsibleName }: { name: string; testUrl: string; reportUrl: string; whatsappUrl: string; responsibleName?: string }) {
  const displayName = responsibleName?.trim() || name;
  const preheader = "Copie e compartilhe com sua igreja. Veja também o relatório em tempo real.";
  const visibleTest = shortUrl(testUrl);
  const visibleReport = shortUrl(reportUrl);
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 640px; margin:0 auto; color:#0f172a;">
    <div style="display:none; visibility:hidden; opacity:0; height:0; overflow:hidden; color:transparent; line-height:0; max-height:0;">${escapeHtml(preheader)}</div>
    <div style="text-align:center; padding: 8px 0 0;">
      <h1 style="margin:0 0 8px; font-size:22px; color:#0f172a;">Igreja criada com sucesso</h1>
      <p style="margin:0 0 4px; color:#475569;">${escapeHtml(name)} foi cadastrada no sistema Five One.</p>
      <p style="margin:0 0 16px; color:#334155;">Olá, ${escapeHtml(displayName)}!</p>
      <p style="margin:0 18px 22px; color:#475569;">Seu cadastro foi concluído. Abaixo estão os links para divulgar o teste e acompanhar os resultados.</p>
    </div>

    ${optionPrimary({
      emoji: '🎯',
      label: 'Compartilhar link de teste',
      desc: 'Este é o link para que sua igreja faça o Teste dos 5 Ministérios. O link abre o teste sem login.',
      href: testUrl,
      cta: 'Abrir link',
      linkCopy: visibleTest,
      copyHref: withUtm(`${originOf(testUrl)}/#/copiar?u=${encodeURIComponent(testUrl)}`),
    })}
    ${optionSecondary({
      emoji: '📊',
      label: 'Abrir relatório',
      desc: 'Acompanhe o resultado geral da sua comunidade: porcentagem de dons, volume de respostas e mais.',
      href: reportUrl,
      cta: 'Abrir relatório',
      linkCopy: visibleReport,
    })}
    ${optionSecondary({
      emoji: '💬',
      label: 'Dúvidas',
      desc: 'Fale com a equipe Five One pelo WhatsApp para tirar dúvidas.',
      href: whatsappUrl,
      cta: 'Abrir WhatsApp',
    })}

    <div style="margin:18px 0 6px;">
      <div style="font-weight:700; margin:0 0 8px 0;">Próximos passos</div>
      <ol style="margin:0; padding-left: 18px; color:#475569; line-height:1.6;">
        <li>Copie o link do teste e compartilhe com sua igreja.</li>
        <li>Defina um prazo (ex.: 7 dias) para todos responderem.</li>
        <li>Monitore o relatório e, caso ainda não tenha marcado, procure nossa equipe para planejar um treinamento ou palestra com sua igreja.</li>
      </ol>
    </div>

    <p style="font-size:14px; color:#475569; margin-top:16px;">Precisa de ajuda? Responda este e-mail ou fale pelo WhatsApp.</p>
    <p style="font-size:12px; color:#64748b; text-align:center; margin-top:18px;">Se você não solicitou este cadastro, pode ignorar este e-mail.</p>
    <div style="text-align:center; margin-top:16px; font-size:12px; color:#94a3b8;">© 2025 Five One — Todos os direitos reservados</div>
  </div>`;
}

function optionPrimary({ emoji, label, desc, href, cta, linkCopy, copyHref }: { emoji: string; label: string; desc: string; href: string; cta: string; linkCopy?: string; copyHref?: string }) {
  return baseOption({ emoji, label, desc, href, cta, linkCopy, copyHref, primary: true });
}

function optionSecondary({ emoji, label, desc, href, cta, linkCopy }: { emoji: string; label: string; desc: string; href: string; cta: string; linkCopy?: string }) {
  return baseOption({ emoji, label, desc, href, cta, linkCopy, primary: false });
}

function baseOption({ emoji, label, desc, href, cta, primary, linkCopy, copyHref }: { emoji: string; label: string; desc: string; href: string; cta: string; primary: boolean; linkCopy?: string; copyHref?: string }) {
  const btnBg = primary ? '#16a34a' : '#0b1220';
  const btnColor = '#ffffff';
  const btnStyle = `background:${btnBg}; color:${btnColor}; text-decoration:none; padding:12px 16px; border-radius:10px; font-size:16px; display:inline-block; min-height:44px; line-height:20px;`;
  const boxStyle = 'margin:0 0 12px; border-collapse:separate; border:1px solid #e2e8f0; border-radius:12px;';
  const emojiSpan = `<span role="img" aria-label="">${emoji}</span>`;
  const linkText = linkCopy ? `<div style="margin-top:8px; font-size:13px;"><a href="${href}" style="color:#0b1220; text-decoration:underline;">${escapeHtml(linkCopy)}</a></div>` : '';
  const copyBtn = copyHref ? `<a href="${copyHref}" style="background:#0b1220; color:#fff; text-decoration:none; padding:12px 16px; border-radius:10px; font-size:16px; display:inline-block; min-height:44px; line-height:20px; margin-left:8px;">Copiar link</a>` : '';
  return `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="${boxStyle}">
    <tr>
      <td style="padding:14px 16px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="font-size:20px;">${emojiSpan}</div>
          <div style="flex:1;">
            <div style="font-weight:700;">${escapeHtml(label)}</div>
            <div style="color:#475569; font-size:14px;">${escapeHtml(desc)}</div>
          </div>
          <div>
            <a href="${href}" style="${btnStyle}">${escapeHtml(cta)}</a>
            ${copyBtn}
          </div>
        </div>
        ${linkText}
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

function withUtm(url: string){
  try {
    const u = new URL(url);
    u.searchParams.set('utm_source','email');
    u.searchParams.set('utm_medium','transactional');
    u.searchParams.set('utm_campaign','church_created');
    return u.toString();
  } catch { return url; }
}

function shortUrl(url: string){
  try {
    const u = new URL(url);
    const path = `${u.hostname}${u.pathname}${u.search ? '' : ''}`;
    return (u.protocol === 'https:' ? 'https://' : 'http://') + path + (u.search ? '' : '');
  } catch { return url; }
}

function originOf(url: string){
  try { const u = new URL(url); return `${u.protocol}//${u.host}`; } catch { return ''; }
}

function renderText({ name, churchSlug, testUrl, reportUrl, whatsappUrl, responsibleName }: { name: string; churchSlug: string; testUrl: string; reportUrl: string; whatsappUrl: string; responsibleName?: string; }) {
  const greeting = responsibleName?.trim() || name;
  return [
    'Igreja criada! Aqui está o link do Teste dos 5 Ministérios',
    '',
    `Olá, ${greeting}!`,
    '',
    'Seu cadastro foi concluído. Abaixo estão os links para divulgar o teste e acompanhar os resultados.',
    '',
    '1) Compartilhar link do teste (principal)',
    `Abrir: ${testUrl}`,
    'Dica: o teste é rápido e não precisa de login.',
    '',
    '2) Acompanhar relatório',
    `Abrir: ${reportUrl}`,
    '',
    'Próximos passos:',
    ' - Copie o link do teste e compartilhe com sua igreja.',
    ' - Defina um prazo (ex.: 7 dias) para todos responderem.',
    ' - Monitore o relatório e planeje os próximos encontros.',
    '',
    `Dúvidas: ${whatsappUrl}`,
    '',
    'Se você não solicitou este cadastro, pode ignorar este e-mail.',
    '© 2025 Five One — Todos os direitos reservados',
  ].join('\n');
}
