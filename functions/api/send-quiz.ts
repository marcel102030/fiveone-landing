// /functions/api/send-quiz.ts
// Cloudflare Pages Function — envia e-mail via Resend com anexo PDF (base64)
// Atualizações:
// - Handler unificado `onRequest` com suporte a OPTIONS/GET (CORS e verificação)
// - Correção TS: evita `req.json<T>()` e faz casting após `await req.json()`

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
  pdf: { filename: string; base64: string };
}

type Env = {
  RESEND_API_KEY: string;
  RESEND_FROM?: string;
  RESEND_REPLY_TO?: string; // novo campo opcional
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

    // 4) Lê e tipa o body (sem usar generic no req.json para evitar TS2347)
    const body = (await request.json()) as unknown as QuizPayload;
    const { name, email, phone, scores, pdf } = body;

    // Debug/validação do anexo
    const base64Len = pdf?.base64 ? pdf.base64.length : 0;
    const isLikelyPdf = typeof pdf?.base64 === "string" && pdf.base64.startsWith("JVBER"); // assinatura típica de PDF em base64
    if (base64Len < 2000 || !isLikelyPdf) {
      // Tamanho muito pequeno ou não parece um PDF; evita enviar lixo para o Resend
      return new Response(
        JSON.stringify({
          error: "Invalid PDF attachment",
          detail: {
            reason: !isLikelyPdf ? "attachment does not look like a PDF (missing JVBER header)" : "attachment too small",
            filename: pdf?.filename,
            base64_length: base64Len,
          },
        }),
        { status: 422, headers: { "content-type": "application/json", ...CORS_HEADERS } }
      );
    }

    // 5) Validação mínima
    if (!name || !email || !phone || !pdf?.filename || !pdf?.base64) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "content-type": "application/json", ...CORS_HEADERS },
      });
    }

    // 6) Monta HTML
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

    // 7) Remetente (usa variável de ambiente se existir; caso contrário, usa o domínio verificado)
    const fromAddress = env.RESEND_FROM && env.RESEND_FROM.trim().length > 0
      ? env.RESEND_FROM
      : "Five One <resultado5ministerios@fiveonemovement.com>";
    // 7.1) Reply-To (opcional): permite que o destinatário responda para outro endereço
    const replyTo = env.RESEND_REPLY_TO && env.RESEND_REPLY_TO.trim().length > 0
      ? env.RESEND_REPLY_TO
      : "escolafiveone@gmail.com";

    // 8) Envio via Resend
    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress, // ex.: "Five One <resultados@fiveone.com.br>"
        to: email,
        subject: "Seu Resultado – Teste dos 5 Ministérios | Five One",
        html,
        reply_to: replyTo,
        attachments: [
          {
            filename: pdf.filename,
            content: pdf.base64, // base64 cru
          },
        ],
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