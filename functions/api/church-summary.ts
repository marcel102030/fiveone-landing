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
    const includePeople = (url.searchParams.get('includePeople') || '').toLowerCase() === 'true';
    const includeTies = (url.searchParams.get('includeTies') || '').toLowerCase() === 'true';
    const includeContacts = (url.searchParams.get('includeContacts') || '').toLowerCase() === 'true';

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

    // Validação de token público (se presente)
    const token = url.searchParams.get('token') || undefined;
    if (token) {
      const allowed = await verifyToken(token, ctx.env.REPORT_SHARE_SECRET as string | undefined);
      if (!allowed.ok) return new Response(JSON.stringify({ error: allowed.error || 'token inválido' }), { status: 403, headers: { 'content-type': 'application/json' } });
      if (q.churchSlug && (allowed.payload as any)?.slug && (allowed.payload as any).slug !== q.churchSlug) {
        return new Response(JSON.stringify({ error: 'token não permite este slug' }), { status: 403, headers: { 'content-type': 'application/json' } });
      }
    }

    // Busca respostas (com colunas necessárias) aplicando período quando houver
    let builder = admin
      .from('quiz_response')
      .select(includePeople
        ? (includeContacts
            ? 'id, top_dom, created_at, ties, person_name, person_email, person_phone'
            : 'id, top_dom, created_at, ties, person_name')
        : 'top_dom, created_at, ties')
      .eq('church_id', churchId!);

    if (fromIso) builder = builder.gte('created_at', fromIso);
    if (toIso) builder = builder.lte('created_at', toIso);

    const { data: rows, error } = await builder;
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    const rowsFiltered = rows || [];
    const tsField = 'created_at' as const;

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

    // Número de membros previstos (usado em várias métricas)
    const members = Number(expected_members || 0);

    // Extras: última resposta, dias ativos, pico
    let lastTimestamp: string | null = null;
    let activeDays = 0;
    let peak: { date: string; total: number } | null = null;
    if (rowsFiltered && rowsFiltered.length > 0) {
      const ts = rowsFiltered
        .map((r: any) => (tsField && r[tsField]) ? Date.parse(String(r[tsField])) : undefined)
        .filter((n: any) => typeof n === 'number' && !isNaN(n)) as number[];
      if (ts.length > 0) {
        const max = Math.max(...ts);
        lastTimestamp = new Date(max).toISOString();
      }
    }
    activeDays = series.filter(s => (s.total || 0) > 0).length;
    if (series.length > 0) {
      peak = series.reduce((p, c) => (c.total > p.total ? c : p), { date: series[0].date, total: series[0].total });
    }

    // Comparação com período anterior (se from/to informados)
    let previous: any = null;
    if (fromIso && toIso) {
      const fromMs = Date.parse(fromIso);
      const toMs = Date.parse(toIso);
      const days = Math.max(1, Math.ceil((toMs - fromMs) / (24 * 3600 * 1000)) + 1);
      const prevTo = new Date(fromMs - 1);
      const prevFrom = new Date(prevTo.getTime() - (days - 1) * 24 * 3600 * 1000);
      const prevFromIso = prevFrom.toISOString();
      const prevToIso = prevTo.toISOString();

      // tenta server-side, fallback em memória
      let prevRows: any[] | null = null;
      try {
        let b = admin
          .from('quiz_response')
          .select('top_dom, created_at, ties')
          .eq('church_id', churchId!);
        b = b.gte('created_at', prevFromIso).lte('created_at', prevToIso);
        const r = await b;
        if (!r.error) prevRows = r.data as any[];
      } catch {}
      if (!prevRows) {
        prevRows = rows as any[]; // melhor do que nada; filtra local
      }
      const prevFiltered = (prevRows || []).filter((r: any) => {
        if (!tsField || !r[tsField]) return false;
        const ms = Date.parse(String(r[tsField]));
        return ms >= Date.parse(prevFromIso) && ms <= Date.parse(prevToIso);
      });

      const prevSummary: SummaryRow = { total: 0, apostolo: 0, profeta: 0, evangelista: 0, pastor: 0, mestre: 0, ties: 0 };
      for (const r of prevFiltered) {
        prevSummary.total += 1;
        const key = String(r.top_dom || '').toLowerCase();
        if (key.includes('apost')) prevSummary.apostolo += 1;
        else if (key.includes('profe')) prevSummary.profeta += 1;
        else if (key.includes('evangel')) prevSummary.evangelista += 1;
        else if (key.includes('past')) prevSummary.pastor += 1;
        else if (key.includes('mestre')) prevSummary.mestre += 1;
        const ties = (r as any)?.ties; if (Array.isArray(ties) && ties.length > 0) prevSummary.ties += 1;
      }
      const prevPct = members > 0 ? Math.round((prevSummary.total / members) * 100) : 0;
      previous = { summary: prevSummary, participationPct: prevPct, from: prevFromIso.slice(0,10), to: prevToIso.slice(0,10) };
    }

    const overallPct = members > 0 ? Math.round((overallTotal / members) * 100) : 0;
    const periodPct = members > 0 ? Math.round((summary.total / members) * 100) : 0;

    // Opcional: lista de pessoas por dom (até 200 por dom)
    let peopleByDom: Record<string, { id?: string; name: string; date: string; email?: string; phone?: string }[]> | undefined;
    if (includePeople) {
      const buckets: Record<string, { id?: string; name: string; date: string; email?: string; phone?: string }[]> = {
        apostolo: [], profeta: [], evangelista: [], pastor: [], mestre: [],
      };
      for (const r of rowsFiltered) {
        const key = String((r as any).top_dom || '').toLowerCase();
        let k: keyof typeof buckets | null = null;
        if (key.includes('apost')) k = 'apostolo';
        else if (key.includes('profe')) k = 'profeta';
        else if (key.includes('evangel')) k = 'evangelista';
        else if (key.includes('past')) k = 'pastor';
        else if (key.includes('mestre')) k = 'mestre';
        // incluir empatados (ties) se solicitado
        if (!k && includeTies) {
          const ties = (r as any)?.ties;
          const t = Array.isArray(ties) ? ties.join(' ').toLowerCase() : '';
          if (t.includes('apost')) k = 'apostolo';
          else if (t.includes('profe')) k = 'profeta';
          else if (t.includes('evangel')) k = 'evangelista';
          else if (t.includes('past')) k = 'pastor';
          else if (t.includes('mestre')) k = 'mestre';
        }
        if (!k) continue;
        const nm = (r as any).person_name ? String((r as any).person_name) : '(Sem nome)';
        const dtIso = (r as any)[tsField] ? String((r as any)[tsField]) : '';
        const dt = dtIso ? dayKey(dtIso) : '';
        const item: any = { id: (r as any).id, name: nm, date: dt };
        if (includeContacts) { item.email = (r as any).person_email ?? undefined; item.phone = (r as any).person_phone ?? undefined; }
        if (buckets[k].length < 200) buckets[k].push(item);
      }
      for (const arr of Object.values(buckets)) arr.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      peopleByDom = buckets;
    }

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
        extra: { lastTimestamp, activeDays, peak },
        previous,
        peopleByDom,
      }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};


async function verifyToken(token: string, secret?: string) {
  try {
    if (!secret) return { ok: false, error: 'secret ausente' };
    const [p64, s64] = token.split('.');
    if (!p64 || !s64) return { ok: false, error: 'token malformado' };
    const payloadStr = atob(p64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadStr);
    if (payload.exp && Date.now()/1000 > payload.exp) return { ok: false, error: 'token expirado' };
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'] );
    const data = enc.encode(JSON.stringify(payload));
    const sig = await crypto.subtle.sign('HMAC', key, data);
    const sigB64 = btoa(String.fromCharCode(*new Uint8Array(sig))).replace('+','-').replace('/','_').replace('=','');
    if (sigB64 != s64) return { ok: false, error: 'assinatura inválida' };
    return { ok: true, payload };
  } catch (e) { return { ok: false, error: String(e) }; }
}
