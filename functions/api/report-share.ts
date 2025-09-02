// Mint signed public share links for church reports
export const onRequestPost = async (ctx: any) => {
  try {
    const { request, env } = ctx;
    const body = await request.json().catch(() => ({}));
    const slug = String(body?.slug || '').trim();
    const from = body?.from ? String(body.from) : '';
    const to = body?.to ? String(body.to) : '';
    const ttlDays = Math.max(1, Math.min(30, Number(body?.ttlDays || 7))); // default 7 dias

    if (!slug) return json({ error: 'slug é obrigatório' }, 400);

    const exp = Math.floor(Date.now() / 1000) + ttlDays * 24 * 3600;
    const payload = { slug, exp } as const;

    const secret = env.REPORT_SHARE_SECRET as string | undefined;
    if (!secret) return json({ error: 'REPORT_SHARE_SECRET não configurado' }, 500);

    const token = await sign(payload, secret);
    const site = (env.SITE_URL as string) || new URL(request.url).origin;
    const url = `${site}/#/r/${encodeURIComponent(slug)}${from||to ? `?${buildQuery({ from, to, token })}` : `?${buildQuery({ token })}`}`;
    return json({ ok: true, token, url });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
};

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
}

function buildQuery(q: Record<string, string>) {
  const usp = new URLSearchParams();
  Object.entries(q).forEach(([k,v]) => { if (v !== undefined && v !== null && String(v).length>0) usp.set(k, String(v)); });
  return usp.toString();
}

async function sign(payload: any, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const data = enc.encode(JSON.stringify(payload));
  const sig = await crypto.subtle.sign('HMAC', key, data);
  const token = `${b64url(data)}.${b64url(new Uint8Array(sig))}`;
  return token;
}

function b64url(data: ArrayBuffer | Uint8Array) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

