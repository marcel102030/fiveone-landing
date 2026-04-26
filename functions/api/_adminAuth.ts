// Helper para verificar que a chamada vem de um administrador autenticado.
// Cada handler administrativo deve chamar `assertAdmin(request, env)` antes
// de usar a service role — caso contrário qualquer usuário com a URL pública
// poderia disparar a operação privilegiada.
//
// Como funciona:
//   1. Recebe o JWT do Supabase pelo header `Authorization: Bearer <jwt>`.
//   2. Usa a anon key para validar o token e obter o e-mail do usuário.
//   3. Confirma na tabela `platform_user` que o e-mail tem role = 'ADMIN'
//      e is_active = true (consulta feita com service role).
//
// Em caso de falha retorna uma `Response` 401/403 pronta — o caller deve
// devolver essa Response imediatamente.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type AdminAuthEnv = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...CORS },
  });
}

export type AssertAdminResult =
  | { ok: true; admin: SupabaseClient; callerEmail: string }
  | { ok: false; response: Response };

export async function assertAdmin(request: Request, env: AdminAuthEnv): Promise<AssertAdminResult> {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  const token = auth?.toLowerCase().startsWith('bearer ')
    ? auth.slice('bearer '.length).trim()
    : null;

  if (!token) {
    return { ok: false, response: jsonResponse({ ok: false, error: 'Sessão administrativa ausente.' }, 401) };
  }

  const anonKey = env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY;
  if (!env.SUPABASE_URL || !anonKey || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, response: jsonResponse({ ok: false, error: 'Configuração de servidor incompleta.' }, 500) };
  }

  const userClient = createClient(env.SUPABASE_URL, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData?.user?.email) {
    return { ok: false, response: jsonResponse({ ok: false, error: 'Sessão inválida ou expirada.' }, 401) };
  }

  const callerEmail = userData.user.email.toLowerCase();

  const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data: row } = await admin
    .from('platform_user')
    .select('role, is_active')
    .eq('email', callerEmail)
    .maybeSingle();

  if (!row || row.role !== 'ADMIN' || row.is_active === false) {
    return { ok: false, response: jsonResponse({ ok: false, error: 'Acesso negado: apenas administradores.' }, 403) };
  }

  return { ok: true, admin, callerEmail };
}

export const ADMIN_AUTH_CORS = CORS;
