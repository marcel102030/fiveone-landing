// Cria um aluno na plataforma usando a Admin API do Supabase (service role).
// NUNCA usar supabase.auth.signUp() no front-end para isso — essa função existe
// justamente para fazer a criação server-side com privilégios de administrador.
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
  name?: string | null;
  formation?: string;
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
    return new Response(JSON.stringify({ ok: true, service: 'create-student' }), {
      status: 200,
      headers: { 'content-type': 'application/json', ...CORS },
    });
  }

  if (method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: CORS });
  }

  try {
    const body = (await request.json().catch(() => null)) as Partial<Payload> | null;

    if (!body?.email || !body?.password) {
      return new Response(
        JSON.stringify({ ok: false, error: 'email e password são obrigatórios' }),
        { status: 400, headers: { 'content-type': 'application/json', ...CORS } }
      );
    }

    const email = body.email.trim().toLowerCase();
    const password = body.password;
    const name = (body.name || '').trim() || null;
    // formation é campo legado — aceita qualquer string de curso ou null
    const safeFormation = (body.formation || '').toString().trim() || null;

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Configuração de servidor incompleta' }),
        { status: 500, headers: { 'content-type': 'application/json', ...CORS } }
      );
    }

    const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Verificar se o e-mail já existe na tabela platform_user
    const { count: existingCount } = await admin
      .from('platform_user')
      .select('email', { count: 'exact', head: true })
      .eq('email', email);

    if ((existingCount ?? 0) > 0) {
      return new Response(
        JSON.stringify({ ok: false, error: 'E-mail já cadastrado na plataforma' }),
        { status: 409, headers: { 'content-type': 'application/json', ...CORS } }
      );
    }

    // Criar usuário no Supabase Auth via Admin API (email já confirmado, sem e-mail de confirmação)
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // conta ativa imediatamente, sem e-mail de verificação
    });

    if (authError) {
      const alreadyInAuth = authError.message.toLowerCase().includes('already been registered')
        || authError.message.toLowerCase().includes('already exists');

      if (!alreadyInAuth) {
        return new Response(
          JSON.stringify({ ok: false, error: authError.message }),
          { status: 422, headers: { 'content-type': 'application/json', ...CORS } }
        );
      }

      // O e-mail já existe no Auth mas não em platform_user (caso raro de inconsistência).
      // Atualiza a senha no Auth para a senha informada, garantindo que o e-mail enviado
      // e as credenciais reais do Auth estejam em sincronia.
      const { data: listData } = await admin.auth.admin.listUsers({ perPage: 1000 });
      const existingAuthUser = listData?.users?.find(u => u.email?.toLowerCase() === email);
      if (existingAuthUser) {
        await admin.auth.admin.updateUserById(existingAuthUser.id, { password });
      }
    }

    // Inserir em platform_user
    const { error: dbError } = await admin.from('platform_user').insert({
      email,
      name,
      ...(safeFormation ? { formation: safeFormation } : {}),
      role: 'STUDENT',
      is_active: true,
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      // Rollback: remover o usuário do Auth se criamos agora e falhou no DB
      if (authData?.user?.id) {
        await admin.auth.admin.deleteUser(authData.user.id).catch(() => {});
      }
      return new Response(
        JSON.stringify({ ok: false, error: dbError.message }),
        { status: 500, headers: { 'content-type': 'application/json', ...CORS } }
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
