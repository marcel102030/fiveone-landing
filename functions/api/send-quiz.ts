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

    // 7) Monta HTML
    const summary =
      (scores ?? []).map((s) => `${s.category}: ${s.score}`).join("<br>") || "Sem pontuações";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
        <h2 style="text-align:center; color:#4A148C; margin: 0 0 16px;">📊 Seu Resultado do Teste dos 5 Ministérios</h2>

        <p>Olá, <strong>${escapeHtml(name)}</strong>!</p>

        <p>
          Obrigado por realizar o <strong>Teste dos 5 Ministérios</strong>.
          Em anexo você encontrará o(s) PDF(s) detalhando seu resultado.
        </p>

        <h3 style="color:#4A148C; margin-top: 20px;">Resumo das suas pontuações:</h3>
        <div style="background:#f5f5f5; padding:12px; border-radius:8px; margin-bottom:20px;">
          ${summary}
        </div>

        <p style="margin-top:20px;">🙏 Que este resultado te ajude a crescer no seu chamado ministerial.</p>

        <hr style="margin:25px 0; border:none; border-top:1px solid #ddd;" />

        <div style="text-align:center; font-size:14px; color:#555;">
          <p>
            Siga a <strong>Five One</strong> para mais conteúdos sobre os 5 Ministérios:<br/>
            <a href="https://www.instagram.com/fiveone.oficial/" style="color:#4A148C; text-decoration:none;" target="_blank" rel="noopener noreferrer">
              📷 Instagram: @fiveone.oficial
            </a>
          </p>
          <p style="font-size:12px; color:#777;">
            Este é um e-mail automático. Por favor, não responda diretamente a ele.
          </p>
        </div>

        <div style="margin-top:20px; text-align:center; font-size:13px; color:#999;">
          © 2025 Five One — Todos os direitos reservados
        </div>
      </div>
    `;

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