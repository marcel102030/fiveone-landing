// POST /api/newsletter-subscribe
// Salva o e-mail no Supabase e envia e-mail de boas-vindas via Resend.

import { createClient } from "@supabase/supabase-js";

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_NEWSLETTER?: string; // endereço específico da newsletter (ex: newsletter@fiveonemovement.com)
  RESEND_FROM?: string;            // fallback geral
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const onRequest = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;

  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers: CORS });

  if (request.method !== "POST")
    return new Response("Method Not Allowed", { status: 405, headers: CORS });

  let email = "";
  let name = "";
  let source = "blog";

  try {
    const body = (await request.json()) as { email?: string; name?: string; source?: string };
    email = (body.email || "").trim().toLowerCase();
    name = (body.name || "").trim();
    source = (body.source || "blog").trim();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "JSON inválido" }), {
      status: 400,
      headers: { "content-type": "application/json", ...CORS },
    });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ ok: false, error: "E-mail inválido" }), {
      status: 400,
      headers: { "content-type": "application/json", ...CORS },
    });
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  // Upsert: já existente → apenas confirma sem erro
  const { error: dbError } = await supabase
    .from("platform_newsletter_subscriber")
    .upsert(
      { email, name: name || null, source, confirmed: true },
      { onConflict: "email", ignoreDuplicates: false },
    );

  if (dbError) {
    console.error("[newsletter-subscribe] db error", dbError);
    return new Response(JSON.stringify({ ok: false, error: "Erro ao salvar" }), {
      status: 500,
      headers: { "content-type": "application/json", ...CORS },
    });
  }

  // E-mail de boas-vindas via Resend (silencioso se não configurado)
  if (env.RESEND_API_KEY) {
    const isWaitlist = source.startsWith("waitlist");
    const from =
      env.RESEND_FROM_NEWSLETTER?.trim() ||
      env.RESEND_FROM?.trim() ||
      "Para Ler — Five One <paraler@fiveonemovement.com>";
    const greeting = name ? `Olá, ${name.split(" ")[0]}!` : "Olá!";
    const subjectLine = isWaitlist
      ? "Você está na lista de espera — Curso de Apologética Five One 🎉"
      : "Você assinou o Para Ler — Five One ✅";
    const bodyContent = isWaitlist
      ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#9fb3d1">
          Você está na lista de espera do <strong style="color:#e6f1ff">Curso de Apologética</strong> do Five One!
         </p>
         <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#9fb3d1">
          Assim que o curso abrir, você será um dos primeiros a saber — diretamente no seu e-mail. Fique atento!
         </p>
         <a href="https://fiveonemovement.com/cursos/apologetica"
            style="display:inline-block;background:#64ffda;color:#0a192f;font-weight:700;font-size:15px;text-decoration:none;border-radius:10px;padding:14px 28px">
           Ver detalhes do curso →
         </a>`
      : `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#9fb3d1">
          A partir de agora você vai receber as novas leituras do <strong style="color:#e6f1ff">Para Ler</strong> diretamente no seu e-mail — reflexões teológicas, ministeriais e práticas para crescer no seu chamado.
         </p>
         <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#9fb3d1">
          Enquanto isso, explore as leituras que já publicamos:
         </p>
         <a href="https://fiveonemovement.com/para-ler"
            style="display:inline-block;background:#64ffda;color:#0a192f;font-weight:700;font-size:15px;text-decoration:none;border-radius:10px;padding:14px 28px">
           Ver as leituras →
         </a>`;
    const headingText = isWaitlist
      ? `${greeting}<br>Você está na lista! 🎉`
      : `${greeting}<br>Você está dentro 🙌`;

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a192f;font-family:'Segoe UI',Arial,sans-serif;color:#e6f1ff">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a192f;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#112240;border-radius:16px;overflow:hidden;border:1px solid rgba(148,163,184,0.12)">
        <tr><td style="background:linear-gradient(135deg,#112240,#0a192f);padding:40px 40px 32px;border-bottom:1px solid rgba(100,255,218,0.15)">
          <p style="margin:0 0 24px;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64ffda">FIVE ONE · ${isWaitlist ? "APOLOGÉTICA" : "PARA LER"}</p>
          <h1 style="margin:0;font-size:28px;font-weight:800;color:#e6f1ff;line-height:1.25">${headingText}</h1>
        </td></tr>
        <tr><td style="padding:32px 40px">
          ${bodyContent}
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid rgba(148,163,184,0.12)">
          <p style="margin:0;font-size:12px;color:#4a6fa5;line-height:1.6">
            Você recebeu este e-mail porque se cadastrou no site do Five One.<br>
            Para cancelar a inscrição, basta responder com "cancelar".
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: email,
        subject: subjectLine,
        html,
        text: isWaitlist
          ? `${greeting}\n\nVocê está na lista de espera do Curso de Apologética Five One!\n\nAvisaremos quando abrir: https://fiveonemovement.com/cursos/apologetica`
          : `${greeting}\n\nVocê está inscrito no Para Ler do Five One!\n\nAcesse as leituras em: https://fiveonemovement.com/para-ler`,
      }),
    }).catch(() => {/* silencioso */});
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json", ...CORS },
  });
};
