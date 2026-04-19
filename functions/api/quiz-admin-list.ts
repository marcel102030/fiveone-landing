import { createClient } from '@supabase/supabase-js';

// GET /api/quiz-admin-list
// Parâmetros: page, limit, search, topDom, source, churchId, dateFrom, dateTo, sort, order
export const onRequestGet = async (ctx: any) => {
  try {
    const url = new URL(ctx.request.url);
    const p = url.searchParams;

    const page     = Math.max(1, parseInt(p.get('page')  || '1'));
    const limit    = Math.min(100, Math.max(1, parseInt(p.get('limit') || '50')));
    const search   = (p.get('search') || '').trim();
    const topDom   = p.get('topDom') || '';
    const source   = p.get('source') || '';
    const churchId = p.get('churchId') || '';
    const dateFrom = p.get('dateFrom') || '';
    const dateTo   = p.get('dateTo') || '';
    const sort     = p.get('sort') || 'created_at';
    const order    = p.get('order') === 'asc' ? true : false;

    const allowedSort = ['created_at', 'person_name', 'top_dom', 'completion_seconds'];
    const sortCol = allowedSort.includes(sort) ? sort : 'created_at';

    const admin = createClient(
      ctx.env.SUPABASE_URL as string,
      ctx.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } }
    );

    let query = admin
      .from('quiz_response')
      .select(`
        id,
        person_name,
        person_email,
        person_phone,
        scores_json,
        top_dom,
        ties,
        source,
        device_type,
        completion_seconds,
        result_token,
        church_id,
        created_at,
        church:church_id ( name, city, slug )
      `, { count: 'exact' });

    if (search) {
      query = query.or(`person_name.ilike.%${search}%,person_email.ilike.%${search}%`);
    }
    if (topDom) query = query.eq('top_dom', topDom);
    if (source) query = query.eq('source', source);
    if (churchId === '__none__') {
      query = query.is('church_id', null);
    } else if (churchId) {
      query = query.eq('church_id', churchId);
    }
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo)   query = query.lte('created_at', dateTo + 'T23:59:59Z');

    query = query
      .order(sortCol, { ascending: order })
      .range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { 'content-type': 'application/json' }
      });
    }

    // Buscar distribuição de doms (para os cards de sumário)
    const { data: domDist } = await admin
      .from('quiz_response')
      .select('top_dom')
      .not('top_dom', 'is', null);

    const domCount: Record<string, number> = {};
    (domDist || []).forEach((r: any) => {
      domCount[r.top_dom] = (domCount[r.top_dom] || 0) + 1;
    });

    // Respostas este mês
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { count: thisMonth } = await admin
      .from('quiz_response')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // Média de tempo
    const { data: avgData } = await admin
      .from('quiz_response')
      .select('completion_seconds')
      .not('completion_seconds', 'is', null);
    const avgSeconds = avgData && avgData.length > 0
      ? Math.round(avgData.reduce((s: number, r: any) => s + r.completion_seconds, 0) / avgData.length)
      : null;

    // Lista de igrejas para o filtro
    const { data: churches } = await admin
      .from('church')
      .select('id, name, city')
      .order('name');

    return new Response(
      JSON.stringify({
        ok: true,
        total: count ?? 0,
        page,
        limit,
        results: data ?? [],
        summary: {
          domDistribution: domCount,
          thisMonth: thisMonth ?? 0,
          avgSeconds,
          totalAll: domDist?.length ?? 0,
          churches: (churches ?? []).map((c: any) => ({ id: c.id, name: c.name, city: c.city })),
        },
      }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { 'content-type': 'application/json' }
    });
  }
};
