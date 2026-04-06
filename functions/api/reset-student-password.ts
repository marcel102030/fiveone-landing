// Redefine a senha de um aluno usando a Admin API do Supabase (service role).
// supabase.auth.updateUser() só funciona para o usuário LOGADO — esta função
// permite que o admin redefina a senha de QUALQUER aluno sem precisar estar logado como ele.
//
// Env vars necessárias:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js';

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

type Payload = {
  email: string;
  password: string;
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const onRequest = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  if (method === 'GET') {
    return new Response(JSON.stringify({ ok: true, service: 'reset-student-password' }), {
      status: 200,
      headers: { 'content-type': 'application/json', ...CORS },
    });
  }

  if (method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: CORS });
  }

  try {
    const body = (await request.json().catch(() => null)) as Partial<Payload> | null;

    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ ok: false, error: 'email e password são obrigatórios' }),
        { status: 400, headers: { 'content-type': 'application/json', ...CORS } }
      );
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Configuração de servidor incompleta' }),
        { status: 500, headers: { 'content-type': 'application/json', ...CORS } }
      );
    }

    const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Buscar o user_id pelo e-mail via Admin API
    const { data: listData, error: listError } = await admin.auth.admin.listUsers();
    if (listError) {
      return new Response(
        JSON.stringify({ ok: false, error: listError.message }),
        { status: 500, headers: { 'content-type': 'application/json', ...CORS } }
      );
    }

    const authUser = listData.users.find(
      u => u.email?.toLowerCase() === email
    );

    if (!authUser) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Usuário não encontrado no sistema de autenticação' }),
        { status: 404, headers: { 'content-type': 'application/json', ...CORS } }
      );
    }

    // Atualizar senha via Admin API (não precisa de sessão do usuário)
    const { error: updateError } = await admin.auth.admin.updateUserById(authUser.id, {
      password,
    });

    if (updateError) {
      return new Response(
        JSON.stringify({ ok: false, error: updateError.message }),
        { status: 422, headers: { 'content-type': 'application/json', ...CORS } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, email }),
      { status: 200, headers: { 'content-type': 'application/json', ...CORS } }
    );

  } catch (e: any) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e?.message || e) }),
      { status: 500, headers: { 'content-type': 'application/json', ...CORS } }
    );
  }
};
