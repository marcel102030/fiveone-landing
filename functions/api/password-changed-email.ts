// Envia o e-mail de "senha alterada" para o PRÓPRIO aluno autenticado.
// Segurança: o destinatário é SEMPRE o e-mail do JWT (auth.getUser) — o corpo
// não escolhe destinatário, então ninguém usa esta rota para spammar terceiros.
//
// Env vars necessárias:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   (para validar o JWT via auth.getUser)
//   RESEND_API_KEY
//   RESEND_FROM_ALUNO / RESEND_REPLY_TO_ALUNO (opcionais)

import { createClient } from '@supabase/supabase-js';
import { buildPasswordChangedEmail } from './_passwordChangedEmail';

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_ALUNO?: string;
  RESEND_REPLY_TO_ALUNO?: string;
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const onRequest = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: CORS });

  try {
    const auth = request.headers.get('authorization') || request.headers.get('Authorization');
    const token = auth?.toLowerCase().startsWith('bearer ') ? auth.slice('bearer '.length).trim() : null;
    if (!token) {
      return json({ ok: false, error: 'Sessão ausente.' }, 401);
    }
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return json({ ok: false, error: 'Configuração de servidor incompleta.' }, 500);
    }

    const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // O destinatário é SEMPRE o dono do token — nunca um e-mail do corpo.
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    const to = userData?.user?.email?.toLowerCase();
    if (userError || !to) {
      return json({ ok: false, error: 'Sessão inválida ou expirada.' }, 401);
    }

    if (!env.RESEND_API_KEY?.startsWith('re_')) {
      // Sem e-mail configurado não é erro fatal — a senha já foi trocada.
      return json({ ok: true, emailSent: false });
    }

    // Nome para a saudação (best-effort).
    const { data: row } = await admin
      .from('platform_user').select('name').eq('email', to).maybeSingle();
    const name = (row?.name as string | null) ?? null;

    const whenLabel = new Date().toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo',
    }).replace(',', ' às');

    const { subject, html, text } = buildPasswordChangedEmail({ name, whenLabel });
    const from = env.RESEND_FROM_ALUNO?.trim() || 'Escola Five One <no-reply@fiveonemovement.com>';
    const reply_to = env.RESEND_REPLY_TO_ALUNO?.trim() || 'escolafiveone@gmail.com';

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, reply_to, subject, html, text }),
    });

    return json({ ok: true, emailSent: r.ok });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
};

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...CORS },
  });
}
