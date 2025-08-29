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
      <div style="font-family: Arial, sans-serif; line-height:1.5;">
        <h2>Seu resultado do Teste dos 5 Ministérios</h2>
        <p>Olá, ${escapeHtml(name)}!</p>
        <p>Segue em anexo o seu PDF com o resultado.</p>
        <p><strong>Resumo:</strong><br>${summary}</p>
        <p><em>Telefone informado:</em> ${escapeHtml(phone)}</p>
        <p>Deus abençoe!<br/>Equipe Five One</p>
      </div>
    `;

    // 8) Remetente e reply-to
    const fromAddress = env.RESEND_FROM && env.RESEND_FROM.trim().length > 0
      ? env.RESEND_FROM
      : "Five One <resultado5ministerios@fiveonemovement.com>";
    const replyTo = env.RESEND_REPLY_TO && env.RESEND_REPLY_TO.trim().length > 0
      ? env.RESEND_REPLY_TO
      : "escolafiveone@gmail.com";

    // 9) Envio via Resend
    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: email,
        subject: "Seu Resultado – Teste dos 5 Ministérios | Five One",
        html,
        reply_to: replyTo,
        attachments: items.map((it) => ({ filename: it.filename, content: it.base64 })),
      }),
    });

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