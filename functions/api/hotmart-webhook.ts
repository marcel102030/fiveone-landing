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
import { buildWelcomeEmail } from './_welcomeEmail';

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
  checkout_phone?: string;
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
  transaction?: string;
  price?: { value?: number; currency_value?: string };
  payment?: { type?: string };
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
    // ── 1) Hottok — FAIL-CLOSED ────────────────────────────────────────────
    // Sem o segredo configurado no servidor, NÃO processa nada (antes era
    // fail-open: se a env var faltasse, qualquer um forjava compras).
    const hottok =
      request.headers.get('X-Hotmart-Hottok') ||
      request.headers.get('x-hotmart-hottok') ||
      new URL(request.url).searchParams.get('hottok');

    if (!env.HOTMART_HOTTOK) {
      return new Response(JSON.stringify({ ok: false, error: 'HOTMART_HOTTOK nao configurado no servidor' }), {
        status: 500, headers: { 'content-type': 'application/json', ...CORS },
      });
    }
    if (hottok !== env.HOTMART_HOTTOK) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        status: 401, headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    const payload = (await request.json().catch(() => null)) as HotmartPayload | null;
    if (!payload) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
        status: 400, headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    const event = String(payload.event || '').toUpperCase();
    const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Dados comuns
    const buyer = payload.data?.buyer;
    const email = (buyer?.email || '').trim().toLowerCase();
    const name = (buyer?.name || '').trim() || null;
    const phone = (buyer?.checkout_phone || '').trim() || null;
    const purchase = payload.data?.purchase;
    const transaction = (purchase?.transaction || '').trim() || null;
    const productId = String(payload.data?.product?.id || purchase?.product?.id || '');
    const amountCents =
      purchase?.price?.value != null ? Math.round(Number(purchase.price.value) * 100) : null;
    const paymentMethod = purchase?.payment?.type || null;

    // Resolve o curso a partir do produto Hotmart (platform_product.hotmart_product_id).
    // productUuid é a PK interna de platform_product — é ela que vai em
    // platform_purchase.product_id (FK), NÃO o productId da Hotmart.
    let courseId: string | null = null;
    let productUuid: string | null = null;
    if (productId) {
      const { data: product } = await admin
        .from('platform_product')
        .select('id, ministry_id')
        .eq('hotmart_product_id', productId)
        .eq('is_active', true)
        .maybeSingle();
      courseId = (product?.ministry_id as string | undefined) ?? null;
      productUuid = (product?.id as string | undefined) ?? null;
    }

    // ── 2) Eventos de REVOGAÇÃO (reembolso/chargeback/cancelamento) ─────────
    const REVOKE_EVENTS = [
      'PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'PURCHASE_PROTEST',
      'PURCHASE_CANCELED', 'PURCHASE_CANCELLATION', 'SUBSCRIPTION_CANCELLATION',
    ];
    if (REVOKE_EVENTS.includes(event)) {
      if (email && courseId) {
        await admin.from('platform_enrollment')
          .delete().eq('user_email', email).eq('course_id', courseId);
      }
      if (transaction) {
        // status precisa respeitar o CHECK da tabela (approved/refunded/chargeback/…)
        const revokeStatus =
          event === 'PURCHASE_CHARGEBACK' || event === 'PURCHASE_PROTEST' ? 'chargeback'
          : event === 'PURCHASE_REFUNDED' ? 'refunded'
          : 'canceled';
        await admin.from('platform_purchase')
          .update({ status: revokeStatus, hotmart_event: event, refunded_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('hotmart_transaction', transaction);
      }
      return new Response(JSON.stringify({ ok: true, revoked: true, event, course: courseId }), {
        status: 200, headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    // ── 3) Daqui pra frente, só compras aprovadas ──────────────────────────
    if (event !== 'PURCHASE_APPROVED' && event !== 'PURCHASE_COMPLETE') {
      return new Response(JSON.stringify({ ok: true, skipped: true, event }), {
        status: 200, headers: { 'content-type': 'application/json', ...CORS },
      });
    }
    if (!email) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing buyer email' }), {
        status: 400, headers: { 'content-type': 'application/json', ...CORS },
      });
    }
    if (!courseId) {
      return new Response(JSON.stringify({ ok: false, error: 'Produto Hotmart nao mapeado para um curso', productId }), {
        status: 422, headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    // ── 4) Idempotência: grava a compra. hotmart_transaction é UNIQUE → um
    //    webhook duplicado falha aqui; nesse caso garante a matrícula e sai.
    if (transaction) {
      const { error: purchaseErr } = await admin.from('platform_purchase').insert({
        user_email: email,
        product_id: productUuid,
        status: 'approved',
        hotmart_transaction: transaction,
        hotmart_event: event,
        payment_method: paymentMethod,
        amount_cents: amountCents,
        buyer_name: name,
        buyer_phone: phone,
        raw_payload: payload,
        approved_at: new Date().toISOString(),
      });
      if (purchaseErr) {
        const dup =
          (purchaseErr as { code?: string }).code === '23505' ||
          /duplicate|unique/i.test(purchaseErr.message);
        if (dup) {
          await admin.from('platform_enrollment')
            .upsert({ user_email: email, course_id: courseId }, { onConflict: 'user_email,course_id' });
          return new Response(JSON.stringify({ ok: true, alreadyProcessed: true, course: courseId }), {
            status: 200, headers: { 'content-type': 'application/json', ...CORS },
          });
        }
        // Outro erro ao gravar a compra: não bloqueia o acesso, segue.
      }
    }

    // ── 5) Garante a conta do aluno (cria se não existir) ──────────────────
    const { data: existing } = await admin
      .from('platform_user').select('email').eq('email', email).maybeSingle();

    let createdAccount = false;
    let password = '';
    if (!existing) {
      password = generatePassword();
      const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
      });
      if (authError && !authError.message.includes('already been registered')) {
        return new Response(JSON.stringify({ ok: false, error: 'Auth creation failed', detail: authError.message }), {
          status: 500, headers: { 'content-type': 'application/json', ...CORS },
        });
      }
      const { error: userError } = await admin.from('platform_user').insert({
        email, name, formation: resolveFormation(payload, env), is_active: true,
        created_at: new Date().toISOString(),
      });
      if (userError && !/duplicate|unique/i.test(userError.message)) {
        // Rollback do Auth para não deixar usuário órfão.
        if (authData?.user?.id) {
          await admin.auth.admin.deleteUser(authData.user.id).catch(() => {});
        }
        return new Response(JSON.stringify({ ok: false, error: 'platform_user insert failed', detail: userError.message }), {
          status: 500, headers: { 'content-type': 'application/json', ...CORS },
        });
      }
      createdAccount = true;
    }

    // ── 6) Matrícula no curso comprado (idempotente — cobre 2ª compra) ──────
    await admin.from('platform_enrollment')
      .upsert({ user_email: email, course_id: courseId }, { onConflict: 'user_email,course_id' });

    // ── 7) E-mail: só envia credenciais quando a conta foi criada agora ─────
    let emailSent = false;
    if (createdAccount && env.RESEND_API_KEY) {
      // Título legível do curso para o e-mail (fallback no nome padrão).
      let courseTitle = 'Defenda a sua Fé';
      const { data: ministry } = await admin
        .from('platform_ministry').select('title').eq('id', courseId).maybeSingle();
      if (ministry?.title) courseTitle = ministry.title as string;
      emailSent = await sendWelcomeEmail({ env, to: email, name, user: email, password, course: courseTitle });
    }

    return new Response(
      JSON.stringify({ ok: true, created: createdAccount, enrolled: courseId, emailSent }),
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
  // crypto.getRandomValues está disponível no runtime do Cloudflare Pages Functions.
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  let pass = '';
  for (let i = 0; i < bytes.length; i++) {
    pass += chars[bytes[i] % chars.length];
  }
  return pass;
}

async function sendWelcomeEmail(opts: {
  env: Env;
  to: string;
  name: string | null;
  user: string;
  password: string;
  course: string;
}): Promise<boolean> {
  const { env, to, name, user, password, course } = opts;
  try {
    // Mesmo template bonito usado no cadastro manual (admin) — _welcomeEmail.
    const from =
      env.RESEND_FROM_ALUNO?.trim() || 'Escola Five One <no-reply@fiveonemovement.com>';
    const reply_to =
      env.RESEND_REPLY_TO_ALUNO?.trim() || 'escolafiveone@gmail.com';

    const { subject, html, text } = buildWelcomeEmail({
      name, user, password, course, campaign: 'hotmart_purchase',
    });

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, reply_to, subject, html, text }),
    });

    return r.ok;
  } catch {
    return false;
  }
}
