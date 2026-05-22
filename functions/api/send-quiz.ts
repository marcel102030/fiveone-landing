// /functions/api/send-quiz.ts
// Cloudflare Pages Function — envia e-mail via Resend com anexo PDF (base64)
// Atualizações:
// - Handler unificado `onRequest` com suporte a OPTIONS/GET (CORS e verificação)
// - Suporte a anexos múltiplos (empate de dom): `pdfs: [{ filename, base64 }, ...]`
// - Validação robusta de PDF (JVBER + tamanho mínimo)

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface QuizPayload {
  name: string;
  email: string;
  phone: string;
  scores?: Array<{ category: string; score: number }>;
  pdf?: { filename: string; base64: string };
  pdfs?: Array<{ filename: string; base64: string }>;
}

type Env = {
  RESEND_API_KEY: string;
  RESEND_FROM?: string;
  RESEND_REPLY_TO?: string; // opcional
};

export const onRequest = async (
  context: { request: Request; env: Env }
): Promise<Response> => {
  const { request, env } = context;
  const method = request.method.toUpperCase();

  // 1) Pré-flight de CORS
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // 2) GET de diagnóstico (útil para verificar se a rota está viva)
  if (method === "GET") {
    return new Response(
      JSON.stringify({ ok: true, message: "Use POST to /api/send-quiz" }),
      { status: 200, headers: { "content-type": "application/json", ...CORS_HEADERS } }
    );
  }

  if (method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "POST, OPTIONS", ...CORS_HEADERS },
    });
  }

  try {
    // 3) Só aceita JSON
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return new Response(JSON.stringify({ error: "Content-Type must be application/json" }), {
        status: 415,
        headers: { "content-type": "application/json", ...CORS_HEADERS },
      });
    }

    // 4) Lê e tipa o body
    const body = (await request.json()) as unknown as QuizPayload;
    const { name, email, phone, scores, pdf, pdfs } = body;

    // 5) Validação mínima de campos
    if (!name || !email || !phone) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "content-type": "application/json", ...CORS_HEADERS },
      });
    }

    // 6) Normaliza e valida anexos (suporta 1 ou muitos)
    const items = Array.isArray(pdfs) && pdfs.length > 0 ? pdfs : (pdf ? [pdf] : []);
    if (items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing PDF attachment(s)" }),
        { status: 400, headers: { "content-type": "application/json", ...CORS_HEADERS } }
      );
    }

    for (const it of items) {
      const len = it?.base64 ? it.base64.length : 0;
      const looksPdf = typeof it?.base64 === "string" && it.base64.startsWith("JVBER");
      if (len < 2000 || !looksPdf) {
        return new Response(
          JSON.stringify({
            error: "Invalid PDF attachment",
            detail: {
              reason: !looksPdf ? "attachment does not look like a PDF (missing JVBER header)" : "attachment too small",
              filename: it?.filename,
              base64_length: len,
            },
          }),
          { status: 422, headers: { "content-type": "application/json", ...CORS_HEADERS } }
        );
      }
    }

    // 7) Monta HTML do email do cliente
    const html = buildCustomerEmailHtml({ name, scores: scores ?? [] });

    // 8) Remetente e reply-to
    const fromAddress = env.RESEND_FROM && env.RESEND_FROM.trim().length > 0
      ? env.RESEND_FROM
      : "Five One <resultado5ministerios@fiveonemovement.com>";
    const replyTo = env.RESEND_REPLY_TO && env.RESEND_REPLY_TO.trim().length > 0
      ? env.RESEND_REPLY_TO
      : "escolafiveone@gmail.com";

    // 9) Monta notificação interna para a Five One
    const topScore = (scores ?? []).reduce(
      (best, s) => (s.score > best.score ? s : best),
      { category: "—", score: 0 }
    );
    const scoresTable = (scores ?? [])
      .sort((a, b) => b.score - a.score)
      .map((s) => `<tr><td style="padding:4px 10px 4px 0">${escapeHtml(s.category)}</td><td style="padding:4px 0"><strong>${s.score}%</strong></td></tr>`)
      .join("");

    const notifyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
        <h2 style="color:#4A148C; margin:0 0 16px;">🔔 Nova resposta — Teste dos 5 Ministérios</h2>
        <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
          <tr><td style="padding:6px 12px 6px 0; color:#777; width:120px">Nome</td><td><strong>${escapeHtml(name)}</strong></td></tr>
          <tr><td style="padding:6px 12px 6px 0; color:#777">E-mail</td><td>${escapeHtml(email)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0; color:#777">Telefone</td><td>${escapeHtml(phone)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0; color:#777">Dom principal</td><td><strong style="color:#4A148C">${escapeHtml(topScore.category)} (${topScore.score}%)</strong></td></tr>
        </table>
        <h3 style="color:#4A148C; margin:0 0 8px;">Pontuações completas</h3>
        <table style="border-collapse:collapse">${scoresTable}</table>
        <hr style="margin:20px 0; border:none; border-top:1px solid #ddd;" />
        <p style="font-size:12px; color:#999;">Notificação automática — Five One</p>
      </div>
    `;

    // 10) Dispara os dois emails em paralelo
    const NOTIFY_TO = "escolafiveone@gmail.com";
    const [resendResp] = await Promise.all([
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromAddress,
          to: email,
          subject: "Seu Resultado – Teste dos 5 Ministérios | Five One",
          html,
          reply_to: replyTo,
          attachments: items.map((it) => ({ filename: it.filename, content: it.base64 })),
        }),
      }),
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromAddress,
          to: NOTIFY_TO,
          subject: `[Five One] Nova resposta: ${name} — ${topScore.category}`,
          html: notifyHtml,
        }),
      }),
    ]);

    const data = await resendResp.json();

    if (!resendResp.ok) {
      console.error("Resend error:", data);
      return new Response(JSON.stringify({ error: "Email send failed", detail: data }), {
        status: 502,
        headers: { "content-type": "application/json", ...CORS_HEADERS },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: data?.id }), {
      status: 200,
      headers: { "content-type": "application/json", ...CORS_HEADERS },
    });
  } catch (err) {
    console.error("send-quiz unhandled error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "content-type": "application/json", ...CORS_HEADERS },
    });
  }
};

// Util: escapar HTML básico
function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// ─── Template do email do cliente ──────────────────────────────────────────
type DomKey = "APOSTOLO" | "PROFETA" | "EVANGELISTA" | "PASTOR" | "MESTRE";

const DOM_ICONS: Record<DomKey, string> = {
  APOSTOLO: '<svg xmlns="http://www.w3.org/2000/svg" width="ICONSIZE" height="ICONSIZE" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>',
  PROFETA: '<svg xmlns="http://www.w3.org/2000/svg" width="ICONSIZE" height="ICONSIZE" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>',
  EVANGELISTA: '<svg xmlns="http://www.w3.org/2000/svg" width="ICONSIZE" height="ICONSIZE" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>',
  PASTOR: '<svg xmlns="http://www.w3.org/2000/svg" width="ICONSIZE" height="ICONSIZE" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
  MESTRE: '<svg xmlns="http://www.w3.org/2000/svg" width="ICONSIZE" height="ICONSIZE" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
};

const DOM_PHRASES: Record<DomKey, string> = {
  APOSTOLO: "Você tem visão estratégica e paixão por abrir novos caminhos.",
  PROFETA: "Você é sensível à voz de Deus e movido por autenticidade espiritual.",
  EVANGELISTA: "Você é movido pelo desejo de alcançar e transformar vidas.",
  PASTOR: "Você tem coração para cuidar e caminhar ao lado das pessoas.",
  MESTRE: "Você tem paixão pelo ensino da Palavra e pela formação de discípulos.",
};

const DOM_COLORS: Record<DomKey, { hex: string; rgba: string }> = {
  APOSTOLO: { hex: "#1b6ea5", rgba: "27,110,165" },
  PROFETA: { hex: "#a80d0d", rgba: "168,13,13" },
  EVANGELISTA: { hex: "#cfb012", rgba: "207,176,18" },
  PASTOR: { hex: "#9B59B6", rgba: "155,89,182" },
  MESTRE: { hex: "#2f994a", rgba: "47,153,74" },
};

const DOM_LABELS: Record<DomKey, string> = {
  APOSTOLO: "Apóstolo",
  PROFETA: "Profeta",
  EVANGELISTA: "Evangelista",
  PASTOR: "Pastor",
  MESTRE: "Mestre",
};

function normalizeDomKey(raw: string): DomKey | null {
  const k = raw.trim().toUpperCase().replace(/[ÓÔÒÕ]/g, "O").replace(/[ÉÊÈ]/g, "E");
  return (DOM_LABELS as Record<string, string>)[k] ? (k as DomKey) : null;
}

function joinNames(arr: string[]): string {
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return arr.join(" e ");
  return arr.slice(0, -1).join(", ") + " e " + arr[arr.length - 1];
}

function buildCustomerEmailHtml(payload: {
  name: string;
  scores: Array<{ category: string; score: number }>;
}): string {
  const { name, scores } = payload;

  // Normaliza categorias e detecta empate no topo
  const validScores = scores
    .map((s) => ({ key: normalizeDomKey(s.category), score: s.score }))
    .filter((s): s is { key: DomKey; score: number } => s.key !== null);

  const maxScore = validScores.reduce((max, s) => (s.score > max ? s.score : max), 0);
  const topDoms: DomKey[] = validScores.filter((s) => s.score === maxScore).map((s) => s.key);

  // Fallback caso scores estejam vazios
  if (topDoms.length === 0) {
    topDoms.push("EVANGELISTA");
  }

  const sortedBars = [...validScores]
    .sort((a, b) => b.score - a.score)
    .map((s) => ({
      key: s.key,
      pct: s.score,
      color: DOM_COLORS[s.key].hex,
      label: DOM_LABELS[s.key],
    }));
  const maxPct = sortedBars[0]?.pct || 1;

  const isTie = topDoms.length > 1;
  const iconSize = topDoms.length === 1 ? 72 : topDoms.length === 2 ? 64 : 56;
  const iconSvgSize = topDoms.length === 1 ? 34 : topDoms.length === 2 ? 30 : 26;
  const iconMarginTop = topDoms.length === 1 ? 19 : topDoms.length === 2 ? 17 : 15;
  const nameFontSize = topDoms.length === 1 ? 34 : topDoms.length === 2 ? 26 : 20;
  const labelsList = topDoms.map((d) => DOM_LABELS[d]);
  const topNamesStr = labelsList.join(" + ");
  const topPct = maxScore || 0;
  const pctLabel = isTie
    ? `${topPct}% cada — ${topDoms.length === 2 ? "Seus dons predominantes" : "Empate múltiplo"}`
    : `${topPct}% — Seu dom predominante`;
  const eyebrowLabel = isTie ? "Seus Dons Principais" : "Seu Dom Principal";
  const ctaDomLabel = joinNames(labelsList);

  const iconsHtml = topDoms
    .map((d) => {
      const svg = DOM_ICONS[d].replaceAll("ICONSIZE", String(iconSvgSize));
      return `
        <div style="display:inline-block; width:${iconSize}px; height:${iconSize}px; line-height:${iconSize}px; border-radius:50%; text-align:center; background:${DOM_COLORS[d].hex}; box-shadow:0 0 0 4px rgba(${DOM_COLORS[d].rgba},0.22); margin:0 ${isTie ? 8 : 0}px;">
          <span style="display:inline-block; vertical-align:middle; margin-top:${iconMarginTop}px;">${svg}</span>
        </div>`;
    })
    .join("");

  const phrasesHtml = topDoms
    .map((d) => {
      const tag = isTie
        ? `<strong style="color:${DOM_COLORS[d].hex}; font-style:normal; font-weight:700; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; display:block; margin-bottom:4px;">${DOM_LABELS[d]}</strong>`
        : "";
      return `<p style="margin:0 auto ${isTie ? "10px" : "0"}; color:#ccd6f6; font-size:15px; line-height:1.7; font-style:italic; max-width:420px;">${tag}"${DOM_PHRASES[d]}"</p>`;
    })
    .join("");

  const barsHtml = sortedBars
    .map(
      (b) => `
      <div style="margin-bottom:14px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="font-size:14px; font-weight:600; color:#0a192f; padding-bottom:6px;">${b.label}</td>
            <td style="font-size:14px; font-weight:700; color:${b.color}; text-align:right; padding-bottom:6px;">${b.pct}%</td>
          </tr>
          <tr>
            <td colspan="2" style="background:#eef1f6; border-radius:6px; height:10px; line-height:10px; padding:0;">
              <div style="background:${b.color}; width:${Math.round((b.pct / maxPct) * 100)}%; height:10px; border-radius:6px;">&nbsp;</div>
            </td>
          </tr>
        </table>
      </div>`
    )
    .join("");

  const ctaSubtext = isTie
    ? `focada nos seus dons de ${ctaDomLabel}`
    : `focada no seu dom de ${ctaDomLabel}`;

  return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0; background:#e9ecef; padding:24px 12px; font-family:'Inter','Segoe UI',system-ui,-apple-system,sans-serif;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="max-width:600px; width:100%; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 12px 40px rgba(10,25,47,0.12); margin:0 auto;">
  <tr><td style="background:linear-gradient(135deg, #0a192f 0%, #112240 100%); padding:40px 32px 36px; text-align:center;">
    <img src="https://fiveonemovement.com/assets/images/logo-fiveone-white-small.png" alt="Five One" width="146" height="80" style="display:inline-block; margin-bottom:18px; border:0; max-width:160px; height:auto;" />
    <p style="margin:0 0 6px; color:#64ffda; font-size:13px; font-weight:600; letter-spacing:2px; text-transform:uppercase;">Seu resultado chegou</p>
    <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:800; line-height:1.2; letter-spacing:-0.5px;">Seu Dom Ministerial<br/>Foi Revelado</h1>
  </td></tr>
  <tr><td style="padding:36px 32px 0; color:#0a192f;">
    <p style="margin:0 0 8px; font-size:18px; line-height:1.5;">Olá, <strong>${escapeHtml(name)}</strong>,</p>
    <p style="margin:0 0 16px; font-size:15px; line-height:1.65; color:#3d4f6f;">Que bom te ter por aqui. Obrigado por compartilhar essa jornada com a gente.</p>
    <p style="margin:0 0 28px; font-size:15px; line-height:1.65; color:#3d4f6f;">Você concluiu o <strong>Teste dos 5 Ministérios</strong> e aqui está o que descobrimos sobre o seu chamado. O PDF completo está em anexo para você guardar e refletir.</p>
  </td></tr>
  <tr><td style="padding:0 32px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:linear-gradient(135deg, #0a192f 0%, #1d3461 100%); border-radius:16px; overflow:hidden;">
      <tr><td style="padding:32px 28px; text-align:center; color:#ffffff;">
        <p style="margin:0 0 16px; font-size:11px; font-weight:700; letter-spacing:3px; color:#64ffda; text-transform:uppercase;">${eyebrowLabel}</p>
        <div style="margin-bottom:18px; line-height:1; font-size:0;">${iconsHtml}</div>
        <h2 style="margin:0 0 6px; color:#ffffff; font-size:${nameFontSize}px; font-weight:800; letter-spacing:-0.5px; line-height:1.15;">${topNamesStr}</h2>
        <p style="margin:0 0 22px; color:#64ffda; font-size:14px; font-weight:600;">${pctLabel}</p>
        ${phrasesHtml}
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:36px 32px 8px; color:#0a192f;">
    <div style="height:2px; width:32px; background:#64ffda; margin-bottom:14px;"></div>
    <h3 style="margin:0 0 4px; font-size:18px; font-weight:700; color:#0a192f;">Suas 5 pontuações</h3>
    <p style="margin:0 0 22px; font-size:13px; color:#6c7a93;">A distribuição completa dos seus dons ministeriais</p>
    ${barsHtml}
  </td></tr>
  <tr><td style="padding:32px 32px 0;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f5f8fc; border-left:4px solid #64ffda; border-radius:8px;">
      <tr><td style="padding:20px 22px;">
        <p style="margin:0 0 8px; font-size:11px; font-weight:700; letter-spacing:2px; color:#3d4f6f; text-transform:uppercase;">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3d4f6f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:6px;"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          Inspirado em Efésios 4:11-13
        </p>
        <p style="margin:0; color:#0a192f; font-size:14px; line-height:1.7; font-style:italic;">"E ele mesmo concedeu uns para apóstolos, outros para profetas, outros para evangelistas e outros para pastores e mestres, com vistas ao aperfeiçoamento dos santos para o desempenho do seu serviço, para a edificação do corpo de Cristo."</p>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:36px 32px 8px; color:#0a192f;">
    <div style="height:2px; width:32px; background:#64ffda; margin-bottom:14px;"></div>
    <h3 style="margin:0 0 4px; font-size:18px; font-weight:700;">Próximos passos</h3>
    <p style="margin:0 0 20px; font-size:13px; color:#6c7a93;">Aprofunde sua jornada com a Five One:</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:10px;"><tr><td style="background:#64ffda; border-radius:10px; text-align:center;"><a href="https://fiveonemovement.com/solucoes/mentoria-individual" style="display:block; padding:15px 24px; color:#0a192f; font-weight:700; font-size:15px; text-decoration:none;">Agende sua Mentoria Individual</a></td></tr></table>
    <p style="margin:-2px 0 14px; font-size:12px; color:#6c7a93; padding:0 4px;">Sessão personalizada online ou presencial, ${ctaSubtext}.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:10px;"><tr><td style="background:#ffffff; border:1.5px solid #0a192f; border-radius:10px; text-align:center;"><a href="https://fiveonemovement.com/cursos-plataforma" style="display:block; padding:14px 24px; color:#0a192f; font-weight:600; font-size:14px; text-decoration:none;">Veja os nossos Cursos</a></td></tr></table>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="background:#ffffff; border:1.5px solid #25D366; border-radius:10px; text-align:center;"><a href="https://wa.me/5583989004764?text=Acabei%20de%20fazer%20o%20Teste%20dos%205%20Minist%C3%A9rios%20e%20gostaria%20de%20conversar" style="display:block; padding:14px 24px; color:#25D366; font-weight:600; font-size:14px; text-decoration:none;"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px; margin-right:6px;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>Converse pelo WhatsApp</a></td></tr></table>
  </td></tr>
  <tr><td style="padding:30px 32px 0;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#fffaeb; border-radius:10px;"><tr><td style="padding:16px 20px; font-size:13px; color:#6b5b1a; line-height:1.6;">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#996515" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:6px;"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg>
      <strong>Lembre-se:</strong> esse resultado não te define — ele aponta para o seu chamado natural. Cada dom é uma peça do Corpo de Cristo e juntos edificamos a Igreja.
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:36px 32px 32px; text-align:center; border-top:1px solid #e7ecf2; margin-top:32px;">
    <p style="margin:30px 0 16px 0; font-size:14px; color:#3d4f6f; font-weight:600;">Siga a Five One para mais conteúdos</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 10px;">
      <tr>
        <td style="padding:0 14px; text-align:center;"><a href="https://www.instagram.com/fiveone.oficial/" aria-label="Instagram" style="text-decoration:none; display:inline-block; width:40px; height:40px; background:#0a192f; border-radius:50%; text-align:center;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64ffda" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top:11px;"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a></td>
        <td style="padding:0 14px; text-align:center;"><a href="https://wa.me/5583989004764" aria-label="WhatsApp" style="text-decoration:none; display:inline-block; width:40px; height:40px; background:#0a192f; border-radius:50%; text-align:center;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64ffda" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top:11px;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg></a></td>
        <td style="padding:0 14px; text-align:center;"><a href="https://fiveonemovement.com" aria-label="Site Five One" style="text-decoration:none; display:inline-block; width:40px; height:40px; background:#0a192f; border-radius:50%; text-align:center;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64ffda" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top:11px;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></a></td>
      </tr>
      <tr>
        <td style="padding:8px 14px 0; text-align:center; font-size:11px; color:#8892b0; font-weight:600;">Instagram</td>
        <td style="padding:8px 14px 0; text-align:center; font-size:11px; color:#8892b0; font-weight:600;">WhatsApp</td>
        <td style="padding:8px 14px 0; text-align:center; font-size:11px; color:#8892b0; font-weight:600;">Site</td>
      </tr>
    </table>
    <p style="margin:18px 0 6px; font-size:12px; color:#8892b0;">Este é um e-mail automático. Por favor, não responda diretamente a ele.</p>
    <p style="margin:0; font-size:11px; color:#8892b0;">© 2026 Five One — Todos os direitos reservados</p>
  </td></tr>
</table>
</body></html>`;
}