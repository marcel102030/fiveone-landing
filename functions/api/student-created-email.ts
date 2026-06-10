// Envia um e-mail de boas-vindas com usuário e senha quando um aluno é criado.
// Recebe a senha em texto plano — exige admin autenticado para evitar abuso/spam.
// O template do e-mail vive em ./_welcomeEmail e é compartilhado com o webhook
// da Hotmart, garantindo o mesmo e-mail em qualquer origem de cadastro.

import { assertAdmin, type AdminAuthEnv } from './_adminAuth';
import { buildWelcomeEmail } from './_welcomeEmail';

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

    const from = env.RESEND_FROM_ALUNO?.trim() || env.RESEND_FROM?.trim() || "Escola Five One <no-reply@fiveonemovement.com>";
    const reply_to = env.RESEND_REPLY_TO_ALUNO?.trim() || env.RESEND_REPLY_TO?.trim() || "escolafiveone@gmail.com";

    const { subject, html, text } = buildWelcomeEmail({ name, user, password, course, campaign: 'student_created' });

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
