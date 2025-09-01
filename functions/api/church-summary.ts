import { createClient } from '@supabase/supabase-js';

type Query = {
  churchId?: string;
  churchSlug?: string;
  from?: string; // ISO date (yyyy-mm-dd)
  to?: string;   // ISO date (yyyy-mm-dd)
  tz?: string;   // IANA timezone (ex.: 'America/Sao_Paulo')
};

type SummaryRow = {
  total: number;
  apostolo: number;
  profeta: number;
  evangelista: number;
  pastor: number;
  mestre: number;
  ties: number;
};

type DayItem = { date: string; total: number };

export const onRequestGet = async (ctx: any) => {
  try {
    const url = new URL(ctx.request.url);
    const q: Query = {
      churchId: url.searchParams.get('churchId') ?? undefined,
      churchSlug: url.searchParams.get('churchSlug') ?? undefined,
      from: url.searchParams.get('from') ?? undefined,
      to: url.searchParams.get('to') ?? undefined,
      tz: url.searchParams.get('tz') ?? undefined,
    };

    if (!q.churchId && !q.churchSlug) {
      return new Response(JSON.stringify({ error: 'informe churchId ou churchSlug' }), { status: 400 });
    }

    const admin = createClient(
      ctx.env.SUPABASE_URL as string,
      ctx.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } }
    );

    // Resolve churchId via slug (e coleta nome/expected_members)
    let churchId = q.churchId as string | undefined;
    let churchName: string | undefined;
    let slug: string | undefined = q.churchSlug;
    let expected_members: number | null | undefined;
    if (!churchId && q.churchSlug) {
      const { data: found, error: findErr } = await admin
        .from('church')
        .select('id, name, expected_members, slug')
        .eq('slug', q.churchSlug)
        .maybeSingle();

      if (findErr) return new Response(JSON.stringify({ error: findErr.message }), { status: 500 });
      if (!found) return new Response(JSON.stringify({ error: 'igreja não encontrada (slug)' }), { status: 404 });
      churchId = found.id;
      churchName = found.name;
      expected_members = found.expected_members;
      slug = found.slug;
    }

    if (!churchName || expected_members === undefined) {
      const { data: info, error: infoErr } = await admin
        .from('church')
        .select('id, name, expected_members, slug')
        .eq('id', churchId!)
        .maybeSingle();
      if (infoErr) return new Response(JSON.stringify({ error: infoErr.message }), { status: 500 });
      if (info) {
        churchName = churchName || info.name;
        expected_members = expected_members ?? info.expected_members;
        slug = slug || info.slug;
      }
    }

    // Filtro de período
    const hasPeriod = Boolean(q.from || q.to);
    const fromIso = q.from ? `${q.from}T00:00:00.000Z` : undefined;
    const toIso = q.to ? `${q.to}T23:59:59.999Z` : undefined;

    // Busca respostas (com colunas necessárias) aplicando período quando houver
    let builder = admin
      .from('quiz_response')
      .select('top_dom, created_at, ties')
      .eq('church_id', churchId!);

    if (fromIso) builder = builder.gte('created_at', fromIso);
    if (toIso) builder = builder.lte('created_at', toIso);

    const { data: rows, error } = await builder;
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

    // Se for período, também buscar o total geral (para participação geral)
    let overallTotal = rows?.length ?? 0;
    if (hasPeriod) {
      const { count, error: cntErr } = await admin
        .from('quiz_response')
        .select('*', { count: 'exact', head: true })
        .eq('church_id', churchId!);
      if (cntErr) return new Response(JSON.stringify({ error: cntErr.message }), { status: 500 });
      overallTotal = count ?? 0;
    }

    // Agregação do período
    const summary: SummaryRow = {
      total: 0,
      apostolo: 0,
      profeta: 0,
      evangelista: 0,
      pastor: 0,
      mestre: 0,
      ties: 0,
    };

    const byDay = new Map<string, number>();
    const tz = q.tz || 'America/Sao_Paulo';

    function dayKey(iso: string): string {
      // Converte a data UTC para data local no timezone e devolve YYYY-MM-DD
      try {
        const d = new Date(iso);
        const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
        return parts; // en-CA => yyyy-mm-dd
      } catch {
        return (iso || '').slice(0, 10);
      }
    }

    for (const r of rows ?? []) {
      summary.total += 1;
      const key = String(r.top_dom || '').toLowerCase();
      if (key.includes('apost')) summary.apostolo += 1;
      else if (key.includes('profe')) summary.profeta += 1;
      else if (key.includes('evangel')) summary.evangelista += 1;
      else if (key.includes('past')) summary.pastor += 1;
      else if (key.includes('mestre')) summary.mestre += 1;

      const k = dayKey(String(r.created_at));
      byDay.set(k, (byDay.get(k) || 0) + 1);

      const ties = (r as any)?.ties;
      if (Array.isArray(ties) && ties.length > 0) summary.ties += 1;
    }

    const series: DayItem[] = Array.from(byDay.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, total]) => ({ date, total }));

    const members = Number(expected_members || 0);
    const overallPct = members > 0 ? Math.round((overallTotal / members) * 100) : 0;
    const periodPct = members > 0 ? Math.round((summary.total / members) * 100) : 0;

    return new Response(
      JSON.stringify({
        ok: true,
        churchId,
        churchName,
        slug,
        expected_members: members,
        period: { from: q.from || null, to: q.to || null, tz },
        summary,
        series,
        participation: { overallTotal, overallPct, periodTotal: summary.total, periodPct },
      }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};
