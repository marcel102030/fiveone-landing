import { assertAdmin, ADMIN_AUTH_CORS as CORS, type AdminAuthEnv } from './_adminAuth';

// Preflight CORS (o front admin envia o header Authorization)
export const onRequestOptions = async () =>
  new Response(null, { status: 204, headers: CORS });

// GET /api/quiz-admin-list  — SOMENTE administradores autenticados
// Parâmetros: page, limit, search, topDom, source, churchId, dateFrom, dateTo, sort, order
export const onRequestGet = async (ctx: any) => {
  try {
    // Exige sessão admin ANTES de tocar em qualquer PII de leads.
    const authResult = await assertAdmin(ctx.request, ctx.env as AdminAuthEnv);
    if (!authResult.ok) return authResult.response;
    const admin = authResult.admin;

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
      console.error('quiz-admin-list query error:', error.message);
      return new Response(JSON.stringify({ error: 'Erro ao carregar dados.' }), {
        status: 500, headers: { 'content-type': 'application/json', ...CORS }
      });
    }

    // Query única para todos os agregados (domDist, source, emails, trend, avgSeconds)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
    const startOfMonth = new Date();
    startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);

    const [{ data: aggData }, { count: thisMonth }, { data: churches }] = await Promise.all([
      admin.from('quiz_response')
        .select('top_dom, source, person_email, created_at, completion_seconds')
        .gte('created_at', twelveMonthsAgo.toISOString()),
      admin.from('quiz_response')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString()),
      admin.from('church').select('id, name, city').order('name'),
    ]);

    const domCount: Record<string, number> = {};
    const sourceBreakdown: Record<string, number> = {};
    const emailCounts: Record<string, number> = {};
    const recentDates: string[] = [];
    let completionSum = 0, completionCount = 0;

    for (const r of (aggData || []) as any[]) {
      if (r.top_dom) domCount[r.top_dom] = (domCount[r.top_dom] || 0) + 1;
      const s = r.source || 'direct';
      sourceBreakdown[s] = (sourceBreakdown[s] || 0) + 1;
      if (r.person_email) emailCounts[r.person_email] = (emailCounts[r.person_email] || 0) + 1;
      if (r.created_at) recentDates.push(r.created_at);
      if (typeof r.completion_seconds === 'number') { completionSum += r.completion_seconds; completionCount++; }
    }

    const avgSeconds = completionCount > 0 ? Math.round(completionSum / completionCount) : null;
    const duplicateEmails = Object.entries(emailCounts)
      .filter(([, c]) => c > 1)
      .map(([email, c]) => ({ email, count: c }));

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
          totalAll: aggData?.length ?? 0,
          uniqueLeads: Object.keys(emailCounts).length,
          churches: (churches ?? []).map((c: any) => ({ id: c.id, name: c.name, city: c.city })),
          sourceBreakdown,
          recentDates,
          duplicateEmails,
        },
      }),
      { headers: { 'content-type': 'application/json', ...CORS } }
    );
  } catch (e) {
    console.error('quiz-admin-list error:', e);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500, headers: { 'content-type': 'application/json', ...CORS }
    });
  }
};
