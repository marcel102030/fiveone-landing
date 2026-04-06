// Cria ou promove um usuário como ADMIN na plataforma.
// Usa a Admin API do Supabase (service role) para criar a conta no Auth
// e insere/atualiza o registro em platform_user com role = 'ADMIN'.
//
// Env vars necessárias:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   ADMIN_SECRET  ← chave secreta para proteger este endpoint

import { createClient } from '@supabase/supabase-js';

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ADMIN_SECRET?: string;
};

type Payload = {
  email: string;
  password: string;
  name?: string | null;
  secret?: string;
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

  const json = (body: object, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...CORS } });

  try {
    const body = (await request.json().catch(() => null)) as Partial<Payload> | null;

    if (!body?.email || !body?.password) {
      return json({ ok: false, error: 'email e password são obrigatórios' }, 400);
    }

    // Proteger o endpoint com um segredo configurável
    if (env.ADMIN_SECRET && body.secret !== env.ADMIN_SECRET) {
      return json({ ok: false, error: 'Não autorizado' }, 403);
    }

    const email = body.email.trim().toLowerCase();
    const password = body.password;
    const name = (body.name || '').trim() || null;

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return json({ ok: false, error: 'Configuração de servidor incompleta' }, 500);
    }

    const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Verificar se já existe como ADMIN
    const { data: existing } = await admin
      .from('platform_user')
      .select('email,role')
      .eq('email', email)
      .maybeSingle();

    if (existing?.role === 'ADMIN') {
      return json({ ok: false, error: 'Este e-mail já é administrador' }, 409);
    }

    // Criar ou atualizar usuário no Supabase Auth
    let authUserId: string | null = null;
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      const alreadyExists = authError.message.toLowerCase().includes('already been registered')
        || authError.message.toLowerCase().includes('already exists');
      if (!alreadyExists) {
        return json({ ok: false, error: authError.message }, 422);
      }
      // Já existe no Auth — atualizar senha
      const { data: listData } = await admin.auth.admin.listUsers({ perPage: 1000 });
      const existingAuth = listData?.users?.find(u => u.email?.toLowerCase() === email);
      if (existingAuth) {
        authUserId = existingAuth.id;
        await admin.auth.admin.updateUserById(existingAuth.id, { password });
      }
    } else {
      authUserId = authData?.user?.id ?? null;
    }

    if (existing) {
      // Já existe em platform_user — apenas promover para ADMIN
      const { error: upErr } = await admin
        .from('platform_user')
        .update({ role: 'ADMIN', ...(name ? { name } : {}) })
        .eq('email', email);
      if (upErr) return json({ ok: false, error: upErr.message }, 500);
    } else {
      // Inserir novo registro
      const { error: insErr } = await admin.from('platform_user').insert({
        email,
        name,
        role: 'ADMIN',
        formation: 'MESTRE',
        is_active: true,
        created_at: new Date().toISOString(),
      });
      if (insErr) {
        // Rollback Auth se acabamos de criar
        if (authData?.user?.id) {
          await admin.auth.admin.deleteUser(authData.user.id).catch(() => {});
        }
        return json({ ok: false, error: insErr.message }, 500);
      }
    }

    return json({ ok: true, email });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
};
