// POST /api/newsletter-notify
// Notifica todos os assinantes confirmados sobre uma nova leitura publicada.
// Requer autenticação de admin (Authorization: Bearer <ADMIN_SECRET>).

import { createClient } from "@supabase/supabase-js";
import { assertAdmin, type AdminAuthEnv } from "./_adminAuth";

type Env = AdminAuthEnv & {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_NEWSLETTER?: string; // endereço específico da newsletter
  RESEND_FROM?: string;            // fallback geral
};

type PostPayload = {
  title: string;
  excerpt?: string | null;
  slug: string;
  category?: string | null;
  cover_url?: string | null;
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const SITE = "https://fiveonemovement.com";

export const onRequest = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;

  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers: CORS });

  if (request.method !== "POST")
    return new Response("Method Not Allowed", { status: 405, headers: CORS });

  const authResult = await assertAdmin(request, env);
  if (!authResult.ok) return authResult.response;

  if (!env.RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ ok: false, error: "RESEND_API_KEY não configurado" }),
      { status: 500, headers: { "content-type": "application/json", ...CORS } },
    );
  }

  let post: PostPayload;
  try {
    post = (await request.json()) as PostPayload;
    if (!post.title || !post.slug) throw new Error("title e slug obrigatórios");
  } catch (e: unknown) {
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 400, headers: { "content-type": "application/json", ...CORS } },
    );
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  // Busca assinantes confirmados
  const { data: subs, error: dbErr } = await supabase
    .from("platform_newsletter_subscriber")
    .select("email, name")
    .eq("confirmed", true)
    .is("unsubscribed_at", null);

  if (dbErr || !subs?.length) {
    return new Response(
      JSON.stringify({ ok: true, sent: 0, message: "Nenhum assinante confirmado" }),
      { status: 200, headers: { "content-type": "application/json", ...CORS } },
    );
  }

  const from =
    env.RESEND_FROM_NEWSLETTER?.trim() ||
    env.RESEND_FROM?.trim() ||
    "Para Ler — Five One <paraler@fiveonemovement.com>";
  const postUrl = `${SITE}/insights/${post.slug}`;
  const coverImg = post.cover_url
    ? `<img src="${post.cover_url}" alt="${post.title}" style="width:100%;border-radius:10px;margin-bottom:24px;display:block">`
    : "";

  const buildHtml = (name: string | null) => {
    const greeting = name ? `Olá, ${name.split(" ")[0]}!` : "Olá!";
    const categoryTag = post.category
      ? `<p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#64ffda">${post.category}</p>`
      : "";
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a192f;font-family:'Segoe UI',Arial,sans-serif;color:#e6f1ff">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a192f;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#112240;border-radius:16px;overflow:hidden;border:1px solid rgba(148,163,184,0.12)">
        <tr><td style="padding:28px 40px 0;border-bottom:1px solid rgba(100,255,218,0.15)">
          <p style="margin:0 0 20px;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64ffda">FIVE ONE · PARA LER</p>
        </td></tr>
        <tr><td style="padding:32px 40px">
          ${coverImg}
          ${categoryTag}
          <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#e6f1ff;line-height:1.25">${post.title}</h1>
          ${post.excerpt ? `<p style="margin:0 0 28px;font-size:15px;line-height:1.65;color:#9fb3d1">${post.excerpt}</p>` : ""}
          <p style="margin:0 0 24px;font-size:14px;color:#9fb3d1">${greeting} Publicamos uma nova leitura no <strong style="color:#e6f1ff">Para Ler</strong>.</p>
          <a href="${postUrl}"
             style="display:inline-block;background:#64ffda;color:#0a192f;font-weight:700;font-size:15px;text-decoration:none;border-radius:10px;padding:14px 28px;margin-bottom:32px">
            Ver a leitura →
          </a>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(148,163,184,0.12)">
          <p style="margin:0;font-size:12px;color:#4a6fa5">
            Você recebe este e-mail por estar inscrito no Para Ler do Five One.<br>
            Para cancelar, responda com "cancelar".
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  };

  // Envia em batches de 50 (limite do Resend free tier para /batch)
  let sent = 0;
  const BATCH = 50;
  for (let i = 0; i < subs.length; i += BATCH) {
    const batch = subs.slice(i, i + BATCH);
    const emails = batch.map(({ email, name }) => ({
      from,
      to: email,
      subject: `Nova leitura: ${post.title}`,
      html: buildHtml(name),
      text: `${post.title}\n\n${post.excerpt || ""}\n\nLer: ${postUrl}`,
    }));

    try {
      await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emails),
      });
      sent += batch.length;
    } catch {
      console.error(`[newsletter-notify] batch ${i}–${i + BATCH} falhou`);
    }
  }

  return new Response(
    JSON.stringify({ ok: true, sent, total: subs.length }),
    { status: 200, headers: { "content-type": "application/json", ...CORS } },
  );
};
