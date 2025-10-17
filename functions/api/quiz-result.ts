import { createClient } from '@supabase/supabase-js';

async function verifyToken(token: string, secret?: string, expectedSlug?: string) {
  if (!secret) return { ok: false, error: 'secret ausente' };
  try {
    const [p64, s64] = token.split('.');
    if (!p64 || !s64) return { ok: false, error: 'token malformado' };
    const payloadStr = atob(p64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadStr);
    if (payload.exp && Date.now() / 1000 > payload.exp) return { ok: false, error: 'token expirado' };
    if (expectedSlug && payload.slug && payload.slug !== expectedSlug) {
      return { ok: false, error: 'token não permite este slug' };
    }
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const data = enc.encode(JSON.stringify(payload));
    const sig = await crypto.subtle.sign('HMAC', key, data);
    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig as ArrayBuffer)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    if (sigB64 !== s64) return { ok: false, error: 'assinatura inválida' };
    return { ok: true, payload };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export const onRequestGet = async (ctx: any) => {
  try {
    const url = new URL(ctx.request.url);
    const id = url.searchParams.get('id');
    const churchSlug = url.searchParams.get('churchSlug') || undefined;
    const churchIdParam = url.searchParams.get('churchId') || undefined;
    const token = url.searchParams.get('token') || undefined;

    if (!id) {
      return new Response(JSON.stringify({ error: 'informe id' }), { status: 400 });
    }

    const admin = createClient(
      ctx.env.SUPABASE_URL as string,
      ctx.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } }
    );

    let churchId = churchIdParam || undefined;
    if (!churchId && churchSlug) {
      const { data, error } = await admin.from('church').select('id').eq('slug', churchSlug).maybeSingle();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      if (!data) return new Response(JSON.stringify({ error: 'igreja não encontrada (slug)' }), { status: 404 });
      churchId = data.id;
    }

    if (!churchId) {
      return new Response(JSON.stringify({ error: 'informe churchSlug ou churchId' }), { status: 400 });
    }

    if (token) {
      const allowed = await verifyToken(token, ctx.env.REPORT_SHARE_SECRET as string | undefined, churchSlug);
      if (!allowed.ok) {
        return new Response(JSON.stringify({ error: allowed.error || 'token inválido' }), { status: 403, headers: { 'content-type': 'application/json' } });
      }
    }

    const { data, error } = await admin
      .from('quiz_response')
      .select('id, church_id, person_name, person_email, person_phone, scores_json, top_dom, ties, created_at')
      .eq('id', id)
      .maybeSingle();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    if (!data) return new Response(JSON.stringify({ error: 'resposta não encontrada' }), { status: 404 });
    if (data.church_id !== churchId) {
      return new Response(JSON.stringify({ error: 'resposta não pertence à igreja informada' }), { status: 403 });
    }

    const participant = {
      id: data.id,
      name: data.person_name || '(Sem nome)',
      email: data.person_email ?? null,
      phone: data.person_phone ?? null,
      topDom: data.top_dom ?? null,
      ties: Array.isArray(data.ties) ? data.ties : [],
      date: data.created_at,
      scores: data.scores_json ?? {},
    };

    return new Response(JSON.stringify({ ok: true, participant }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};

