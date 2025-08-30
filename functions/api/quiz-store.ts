import { createClient } from '@supabase/supabase-js';

// Tipagens do payload recebido
interface Person {
  name?: string;
  email?: string;
  phone?: string;
}

interface QuizStoreBody {
  churchId?: string;        // Preferencial: enviar o id direto
  churchSlug?: string;      // Alternativa: enviar o slug (resolveremos para id)
  person?: Person;          // dados do participante (opcional)
  scores: Record<string, number>; // percentuais por dom (ex.: apostolico, profeta, ...)
  topDom: string;           // "Apostólico", "Profeta", etc.
  ties?: string[];          // quando houver empate
}

// Util: hash simples de IP (opcional) — se IP_HASH_SALT estiver definido
async function sha256Hex(text: string) {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const onRequestPost = async (ctx: any) => {
  try {
    const body = (await ctx.request.json().catch(() => ({}))) as Partial<QuizStoreBody>;

    if (!body || !body.scores || typeof body.topDom !== 'string') {
      return new Response(JSON.stringify({ error: 'payload inválido: scores e topDom são obrigatórios' }), { status: 400 });
    }

    // Admin client (server-side)
    const admin = createClient(
      ctx.env.SUPABASE_URL as string,
      ctx.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } }
    );

    // Resolve churchId a partir de slug, se necessário
    let churchId = body.churchId as string | undefined;
    if (!churchId && body.churchSlug) {
      const { data: found, error: findErr } = await admin
        .from('church')
        .select('id')
        .eq('slug', body.churchSlug)
        .maybeSingle();

      if (findErr) return new Response(JSON.stringify({ error: findErr.message }), { status: 500 });
      if (!found) return new Response(JSON.stringify({ error: 'igreja não encontrada (slug)' }), { status: 404 });
      churchId = found.id;
    }

    if (!churchId) {
      return new Response(JSON.stringify({ error: 'informe churchId ou churchSlug' }), { status: 400 });
    }

    // Metadados úteis
    const user_agent = ctx.request.headers.get('user-agent') ?? null;
    const ip = ctx.request.headers.get('cf-connecting-ip') ?? '';
    const salt = ctx.env.IP_HASH_SALT as string | undefined;
    const ip_hash = salt && ip ? await sha256Hex(`${salt}|${ip}`) : null;

    // Monta objeto de inserção
    const insertPayload = {
      church_id: churchId,
      person_name: body.person?.name ?? null,
      person_email: body.person?.email ?? null,
      person_phone: body.person?.phone ?? null,
      scores_json: body.scores as Record<string, number>,
      top_dom: body.topDom,
      ties: body.ties ?? [],
      user_agent,
      ip_hash,
    } as const;

    const { data, error } = await admin
      .from('quiz_response')
      .insert(insertPayload)
      .select('id')
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};
