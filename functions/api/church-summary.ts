import { createClient } from '@supabase/supabase-js';

type Query = {
  churchId?: string;
  churchSlug?: string;
};

type SummaryRow = {
  total: number;
  apostolo: number;
  profeta: number;
  evangelista: number;
  pastor: number;
  mestre: number;
};

export const onRequestGet = async (ctx: any) => {
  try {
    const url = new URL(ctx.request.url);
    const q: Query = {
      churchId: url.searchParams.get('churchId') ?? undefined,
      churchSlug: url.searchParams.get('churchSlug') ?? undefined,
    };

    if (!q.churchId && !q.churchSlug) {
      return new Response(JSON.stringify({ error: 'informe churchId ou churchSlug' }), { status: 400 });
    }

    const admin = createClient(
      ctx.env.SUPABASE_URL as string,
      ctx.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } }
    );

    // Resolve churchId via slug (se necessário)
    let churchId = q.churchId as string | undefined;
    if (!churchId && q.churchSlug) {
      const { data: found, error: findErr } = await admin
        .from('church')
        .select('id')
        .eq('slug', q.churchSlug)
        .maybeSingle();

      if (findErr) return new Response(JSON.stringify({ error: findErr.message }), { status: 500 });
      if (!found) return new Response(JSON.stringify({ error: 'igreja não encontrada (slug)' }), { status: 404 });
      churchId = found.id;
    }

    // Busca respostas e agrega por top_dom
    const { data: rows, error } = await admin
      .from('quiz_response')
      .select('top_dom')
      .eq('church_id', churchId!);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const summary: SummaryRow = {
      total: 0,
      apostolo: 0,
      profeta: 0,
      evangelista: 0,
      pastor: 0,
      mestre: 0,
    };

    for (const r of rows ?? []) {
      summary.total += 1;
      const key = String(r.top_dom || '').toLowerCase();
      if (key.includes('apost')) summary.apostolo += 1;
      else if (key.includes('profe')) summary.profeta += 1;
      else if (key.includes('evangel')) summary.evangelista += 1;
      else if (key.includes('past')) summary.pastor += 1;
      else if (key.includes('mestre')) summary.mestre += 1;
    }

    return new Response(JSON.stringify({ ok: true, churchId, summary }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};