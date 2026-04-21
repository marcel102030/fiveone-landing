// Remove um aluno do Supabase Auth e do banco de dados (platform_user + platform_enrollment).
// NUNCA usar o cliente supabase diretamente no front-end para deletar de Auth —
// isso exige privilégios de service role que nunca devem chegar ao browser.
//
// Env vars necessárias:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js';

type Env = { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const onRequest = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: CORS });

  try {
    const body = (await request.json().catch(() => null)) as { email?: string } | null;
    const email = body?.email?.trim().toLowerCase();

    if (!email) {
      return new Response(JSON.stringify({ ok: false, error: 'email é obrigatório' }), {
        status: 400, headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ ok: false, error: 'Configuração de servidor incompleta' }), {
        status: 500, headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // 1. Localizar o user_id no Supabase Auth pelo e-mail
    const { data: listData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const authUser = listData?.users?.find(u => u.email?.toLowerCase() === email);

    // 2. Deletar do Auth (se existir)
    if (authUser?.id) {
      const { error: authDeleteError } = await admin.auth.admin.deleteUser(authUser.id);
      if (authDeleteError) {
        return new Response(JSON.stringify({ ok: false, error: `Auth delete falhou: ${authDeleteError.message}` }), {
          status: 500, headers: { 'content-type': 'application/json', ...CORS },
        });
      }
    }

    // 3. Deletar do banco de dados (platform_user cascades progress/completion via FK,
    //    mas platform_enrollment usa user_email como FK — deletar explicitamente)
    await Promise.all([
      admin.from('platform_enrollment').delete().eq('user_email', email),
      admin.from('platform_user').delete().eq('email', email),
    ]);

    return new Response(JSON.stringify({ ok: true, email }), {
      status: 200, headers: { 'content-type': 'application/json', ...CORS },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), {
      status: 500, headers: { 'content-type': 'application/json', ...CORS },
    });
  }
};
