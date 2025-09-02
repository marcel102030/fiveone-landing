import { createClient } from '@supabase/supabase-js';

export const onRequestGet = async (ctx: any) => {
  try {
    const url = new URL(ctx.request.url);
    const churchSlug = url.searchParams.get('churchSlug') || undefined;
    const churchIdQ = url.searchParams.get('churchId') || undefined;
    const dom = (url.searchParams.get('dom') || '').toLowerCase(); // apostolo|profeta|...
    const includeTies = (url.searchParams.get('includeTies') || 'false').toLowerCase() === 'true';
    const includeContacts = (url.searchParams.get('includeContacts') || 'false').toLowerCase() === 'true';
    const from = url.searchParams.get('from') || undefined;
    const to = url.searchParams.get('to') || undefined;
    const tz = url.searchParams.get('tz') || 'America/Sao_Paulo';
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50', 10), 1), 200);
    const page = Math.max(parseInt(url.searchParams.get('page') || '0', 10), 0);

    if (!churchSlug && !churchIdQ) return new Response(JSON.stringify({ error: 'informe churchSlug ou churchId' }), { status: 400 });
    if (!dom) return new Response(JSON.stringify({ error: 'informe dom' }), { status: 400 });

    const admin = createClient(ctx.env.SUPABASE_URL as string, ctx.env.SUPABASE_SERVICE_ROLE_KEY as string, { auth: { persistSession: false } });

    // resolve churchId
    let churchId = churchIdQ as string | undefined;
    if (!churchId && churchSlug) {
      const { data, error } = await admin.from('church').select('id').eq('slug', churchSlug).maybeSingle();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      if (!data) return new Response(JSON.stringify({ error: 'igreja não encontrada (slug)' }), { status: 404 });
      churchId = data.id;
    }

    // busca base
    const sel = includeContacts ? 'id, person_name, person_email, person_phone, top_dom, ties, created_at' : 'id, person_name, top_dom, ties, created_at';
    let q = admin.from('quiz_response').select(sel).eq('church_id', churchId!);
    if (from) q = q.gte('created_at', `${from}T00:00:00.000Z`);
    if (to) q = q.lte('created_at', `${to}T23:59:59.999Z`);
    const { data: rows, error } = await q.order('created_at', { ascending: false });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

    // filtro por dom (incluindo empatados se solicitado)
    const norm = (s: string) => (s || '').toLowerCase();
    const needle = dom;
    const filtered = (rows || []).filter((r: any) => {
      const top = norm(r.top_dom || '');
      const inTop = top.includes(needle.slice(0, 5)); // apost|profe|evang|past|mestre
      if (inTop) return true;
      if (!includeTies) return false;
      const t = Array.isArray(r.ties) ? r.ties.join(' ').toLowerCase() : '';
      return t.includes(needle.slice(0, 5));
    });

    const dayKey = (iso: string) => {
      try { return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso)); } catch { return iso?.slice(0,10) || ''; }
    };

    const total = filtered.length;
    const start = page * limit;
    const end = Math.min(start + limit, total);
    const items = filtered.slice(start, end).map((r: any) => ({
      id: r.id,
      name: r.person_name || '(Sem nome)',
      email: includeContacts ? (r.person_email || null) : undefined,
      phone: includeContacts ? (r.person_phone || null) : undefined,
      date: r.created_at ? dayKey(r.created_at) : '',
    }));

    return new Response(JSON.stringify({ ok: true, total, page, limit, hasMore: end < total, items }), { headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};

