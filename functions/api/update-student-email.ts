// Atualiza o e-mail de um aluno simultaneamente no Supabase Auth e no banco de dados.
// Sem este endpoint, `updateUserEmail()` só alterava platform_user, deixando o Auth
// com o e-mail antigo — o aluno ficaria sem conseguir fazer login.
//
// Env vars necessárias:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { ADMIN_AUTH_CORS as CORS, assertAdmin, type AdminAuthEnv } from './_adminAuth';

type Env = AdminAuthEnv;

export const onRequest = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: CORS });

  // Alteração de e-mail é sensível (afeta o login do aluno) — exige admin.
  const authResult = await assertAdmin(request, env);
  if (!authResult.ok) return authResult.response;
  const { admin } = authResult;

  try {
    const body = (await request.json().catch(() => null)) as { oldEmail?: string; newEmail?: string } | null;
    const oldEmail = body?.oldEmail?.trim().toLowerCase();
    const newEmail = body?.newEmail?.trim().toLowerCase();

    if (!oldEmail || !newEmail) {
      return new Response(JSON.stringify({ ok: false, error: 'oldEmail e newEmail são obrigatórios' }), {
        status: 400, headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    // Nenhuma mudança — retorna sucesso sem fazer nada
    if (oldEmail === newEmail) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    // 1. Localizar o user_id pelo e-mail atual no Auth
    const { data: listData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const authUser = listData?.users?.find(u => u.email?.toLowerCase() === oldEmail);

    if (!authUser?.id) {
      return new Response(JSON.stringify({ ok: false, error: 'Usuário não encontrado no sistema de autenticação' }), {
        status: 404, headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    // 2. Verificar se novo e-mail já está em uso no Auth
    const emailTaken = listData.users.some(u => u.email?.toLowerCase() === newEmail);
    if (emailTaken) {
      return new Response(JSON.stringify({ ok: false, error: 'Novo e-mail já está em uso por outra conta' }), {
        status: 409, headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    // 3. Atualizar e-mail no Auth (Admin API)
    const { error: authError } = await admin.auth.admin.updateUserById(authUser.id, {
      email: newEmail,
      email_confirm: true,
    });

    if (authError) {
      return new Response(JSON.stringify({ ok: false, error: authError.message }), {
        status: 422, headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    // 4. Atualizar e-mail no banco de dados (platform_user + platform_enrollment)
    await Promise.all([
      admin.from('platform_user').update({ email: newEmail }).eq('email', oldEmail),
      admin.from('platform_enrollment').update({ user_email: newEmail }).eq('user_email', oldEmail),
    ]);

    return new Response(JSON.stringify({ ok: true, oldEmail, newEmail }), {
      status: 200, headers: { 'content-type': 'application/json', ...CORS },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), {
      status: 500, headers: { 'content-type': 'application/json', ...CORS },
    });
  }
};
