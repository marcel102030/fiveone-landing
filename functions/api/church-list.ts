// functions/api/church-list.ts
import { createClient } from '@supabase/supabase-js';

type Church = {
  id: string;
  slug: string;
  name: string;
  leader_name: string | null;
  city: string | null;
  expected_members: number | null;
  created_at?: string;
};

export const onRequestGet = async (ctx: any) => {
  try {
    const site = (ctx.env.SITE_URL as string) || new URL(ctx.request.url).origin;
    const admin = createClient(
      ctx.env.SUPABASE_URL as string,
      ctx.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } }
    );

    // 1) pega todas as igrejas
    const { data: churches, error: errChurch } = await admin
      .from('church')
      .select('id, slug, name, leader_name, city, expected_members, created_at')
      .order('created_at', { ascending: false });

    if (errChurch) return new Response(JSON.stringify({ error: errChurch.message }), { status: 500 });

    // 2) pega todas as respostas e agrega no código (simples e funciona bem neste volume)
    const { data: responses, error: errResp } = await admin
      .from('quiz_response')
      .select('church_id, created_at');

    if (errResp) return new Response(JSON.stringify({ error: errResp.message }), { status: 500 });

    const counts = new Map<string, number>();
    const lastResponseMap = new Map<string, string>();
    (responses || []).forEach((r: { church_id: string; created_at: string }) => {
      counts.set(r.church_id, (counts.get(r.church_id) || 0) + 1);
      const current = lastResponseMap.get(r.church_id);
      if (!current || r.created_at > current) {
        lastResponseMap.set(r.church_id, r.created_at);
      }
    });

    const payload = (churches || []).map((c: Church) => {
      const total = counts.get(c.id) || 0;
      const participationPct =
        c.expected_members && c.expected_members > 0
          ? Math.round((total / c.expected_members) * 100)
          : null;
      return {
        ...c,
        total_responses: total,
        participation_pct: participationPct,
        last_response_at: lastResponseMap.get(c.id) ?? null,
        report_url: `${site}/#/relatorio/${c.slug}`,
        invite_url: `${site}/c/${c.slug}`,
        quiz_url: `${site}/#/c/${c.slug}`,
      };
    });

    return new Response(JSON.stringify({ ok: true, churches: payload }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};