// Recebe webhook da Hotmart (PURCHASE_APPROVED) e cria conta automaticamente
// Env vars necessárias:
//   HOTMART_HOTTOK           — token secreto do webhook Hotmart
//   HOTMART_FORMATION_MAP    — JSON: {"<productId>":"APOSTOLO","<offerId>":"MESTRE",...}
//   HOTMART_DEFAULT_FORMATION — formação fallback se o mapa não encontrar (ex: "MESTRE")
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   RESEND_API_KEY
//   RESEND_FROM_ALUNO
//   RESEND_REPLY_TO_ALUNO
//   SITE_URL

import { createClient } from '@supabase/supabase-js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

type Env = {
  HOTMART_HOTTOK?: string;
  HOTMART_FORMATION_MAP?: string; // JSON stringified
  HOTMART_DEFAULT_FORMATION?: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_ALUNO?: string;
  RESEND_REPLY_TO_ALUNO?: string;
  SITE_URL?: string;
};

type HotmartBuyer = {
  email: string;
  name?: string;
};

type HotmartProduct = {
  id?: number | string;
  name?: string;
};

type HotmartOffer = {
  code?: string;
};

type HotmartPurchase = {
  offer?: HotmartOffer;
  product?: HotmartProduct;
  status?: string;
};

type HotmartPayload = {
  event?: string;
  data?: {
    buyer?: HotmartBuyer;
    product?: HotmartProduct;
    purchase?: HotmartPurchase;
  };
};

export const onRequest = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  if (method === 'GET') {
    return new Response(
      JSON.stringify({ ok: true, service: 'hotmart-webhook', timestamp: new Date().toISOString() }),
      { status: 200, headers: { 'content-type': 'application/json', ...CORS } }
    );
  }

  if (method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: CORS });
  }

  try {
    // Verificar token secreto do Hotmart
    const hottok =
      request.headers.get('X-Hotmart-Hottok') ||
      request.headers.get('x-hotmart-hottok') ||
      new URL(request.url).searchParams.get('hottok');

    if (env.HOTMART_HOTTOK && hottok !== env.HOTMART_HOTTOK) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    const payload = (await request.json().catch(() => null)) as HotmartPayload | null;

    if (!payload) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    // Só processar PURCHASE_APPROVED
    const event = String(payload.event || '').toUpperCase();
    if (event !== 'PURCHASE_APPROVED' && event !== 'PURCHASE_COMPLETE') {
      return new Response(JSON.stringify({ ok: true, skipped: true, event }), {
        status: 200,
        headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    const buyer = payload.data?.buyer;
    if (!buyer?.email) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing buyer email' }), {
        status: 400,
        headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    const email = buyer.email.trim().toLowerCase();
    const name = (buyer.name || '').trim() || null;

    // Resolver formação a partir do mapa de produtos
    const formationKey = resolveFormation(payload, env);

    // Gerar senha inicial segura
    const password = generatePassword();

    // Admin Supabase
    const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Verificar se o usuário já existe no platform_user
    const { data: existing } = await admin
      .from('platform_user')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      // Usuário já existe — apenas logar e retornar OK
      return new Response(
        JSON.stringify({ ok: true, created: false, message: 'User already exists', email }),
        { status: 200, headers: { 'content-type': 'application/json', ...CORS } }
      );
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError && !authError.message.includes('already been registered')) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Auth creation failed', detail: authError.message }),
        { status: 500, headers: { 'content-type': 'application/json', ...CORS } }
      );
    }

    // Criar platform_user
    const { error: userError } = await admin.from('platform_user').insert({
      email,
      name,
      formation: formationKey,
      is_active: true,
      created_at: new Date().toISOString(),
    });

    if (userError) {
      // Se foi por conflito (upsert race condition), não é erro crítico
      if (!userError.message.includes('duplicate') && !userError.message.includes('unique')) {
        return new Response(
          JSON.stringify({ ok: false, error: 'platform_user insert failed', detail: userError.message }),
          { status: 500, headers: { 'content-type': 'application/json', ...CORS } }
        );
      }
    }

    // Enviar email de boas-vindas
    let emailSent = false;
    if (env.RESEND_API_KEY) {
      const site = env.SITE_URL || `https://${new URL(request.url).host}`;
      const emailResult = await sendWelcomeEmail({
        env,
        to: email,
        name,
        user: email,
        password,
        site,
      });
      emailSent = emailResult;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        created: true,
        email,
        formation: formationKey,
        emailSent,
      }),
      { status: 200, headers: { 'content-type': 'application/json', ...CORS } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e?.message || e) }),
      { status: 500, headers: { 'content-type': 'application/json', ...CORS } }
    );
  }
};

function resolveFormation(payload: HotmartPayload, env: Env): string {
  const defaultFormation = (env.HOTMART_DEFAULT_FORMATION || 'MESTRE').toUpperCase();

  let formationMap: Record<string, string> = {};
  if (env.HOTMART_FORMATION_MAP) {
    try {
      formationMap = JSON.parse(env.HOTMART_FORMATION_MAP);
    } catch {
      // mapa inválido — usar default
    }
  }

  // Tentar por offerCode, productId, productName em ordem de prioridade
  const offerCode = payload.data?.purchase?.offer?.code || '';
  const productId = String(payload.data?.product?.id || payload.data?.purchase?.product?.id || '');
  const productName = (payload.data?.product?.name || payload.data?.purchase?.product?.name || '').toUpperCase();

  if (offerCode && formationMap[offerCode]) return formationMap[offerCode].toUpperCase();
  if (productId && formationMap[productId]) return formationMap[productId].toUpperCase();

  // Tentar inferir do nome do produto
  const formations = ['APOSTOLO', 'PROFETA', 'EVANGELISTA', 'PASTOR', 'MESTRE'];
  for (const f of formations) {
    const aliases: Record<string, string[]> = {
      APOSTOLO: ['APOSTOLO', 'APÓSTOLO', 'APOSTOL'],
      PROFETA: ['PROFETA', 'PROPHET'],
      EVANGELISTA: ['EVANGELISTA', 'EVANGELIS'],
      PASTOR: ['PASTOR'],
      MESTRE: ['MESTRE', 'MASTER'],
    };
    for (const alias of aliases[f] || [f]) {
      if (productName.includes(alias)) return f;
    }
  }

  return defaultFormation;
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  let pass = '';
  // Simples — sem crypto.getRandomValues (pode não estar disponível em todos os Workers)
  for (let i = 0; i < 10; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

async function sendWelcomeEmail(opts: {
  env: Env;
  to: string;
  name: string | null;
  user: string;
  password: string;
  site: string;
}): Promise<boolean> {
  const { env, to, name, user, password, site } = opts;
  try {
    const from =
      env.RESEND_FROM_ALUNO?.trim() || 'Five One <bemvindofiveone@fiveonemovement.com>';
    const reply_to =
      env.RESEND_REPLY_TO_ALUNO?.trim() || 'escolafiveone@gmail.com';

    const loginUrl = `${site}/#/login-aluno?utm_source=email&utm_medium=transactional&utm_campaign=hotmart_purchase`;
    const greeting = name ? `Olá, ${escapeHtml(name)}!` : 'Olá!';

    const html = `
<div style="font-family: Inter, system-ui, Arial, sans-serif; max-width:640px; margin:0 auto; color:#0f172a;">
  <div style="background:#0b1220; padding:22px 18px; border-radius:14px; color:#e7f2f9;">
    <h1 style="margin:0 0 4px; font-size:22px;">Bem-vindo à Five One 🎉</h1>
    <p style="margin:0; color:#a8c5db;">${greeting} Sua compra foi confirmada e seu acesso foi criado.</p>
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:14px; border-collapse:separate; border:1px solid #e2e8f0; border-radius:12px;">
    <tr>
      <td style="padding:14px 16px;">
        <div style="font-weight:700; margin-bottom:6px;">Suas credenciais de acesso</div>
        <div style="font-family: monospace; background:#f8fafc; padding:12px; border-radius:8px; margin-bottom:12px;">
          <div><span style="color:#64748b">Usuário:</span> ${escapeHtml(user)}</div>
          <div style="margin-top:4px;"><span style="color:#64748b">Senha:</span> ${escapeHtml(password)}</div>
        </div>
        <p style="color:#475569; font-size:14px; margin:0 0 12px;">Guarde estas informações. Você pode alterar a senha após o primeiro acesso.</p>
        <a href="${loginUrl}" style="background:#06b6d4; color:#ffffff; text-decoration:none; padding:12px 16px; border-radius:10px; font-size:16px; display:inline-block;">
          Acessar a plataforma →
        </a>
      </td>
    </tr>
  </table>
  <p style="font-size:12px; color:#94a3b8; text-align:center; margin-top:18px;">© 2025 Five One — Todos os direitos reservados</p>
</div>`;

    const text = [
      'Bem-vindo à Five One!',
      '',
      greeting,
      'Sua compra foi confirmada e seu acesso foi criado.',
      '',
      `Usuário: ${user}`,
      `Senha: ${password}`,
      '',
      `Acessar: ${loginUrl}`,
      '',
      'Guarde estas informações e altere a senha após o primeiro login.',
    ].join('\n');

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        reply_to,
        subject: 'Bem-vindo à plataforma Five One — suas credenciais',
        html,
        text,
      }),
    });

    return r.ok;
  } catch {
    return false;
  }
}

function escapeHtml(str: string): string {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
