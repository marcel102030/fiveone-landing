import { createClient } from '@supabase/supabase-js';

async function sha256Hex(text: string) {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function detectDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|kindle|playbook|(android(?!.*mobile))/.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|windows phone|iemobile/.test(ua)) return 'mobile';
  return 'desktop';
}

// POST /api/quiz-session — cria nova sessão ao iniciar o quiz
export const onRequestPost = async (ctx: any) => {
  try {
    const body = (await ctx.request.json().catch(() => ({}))) as {
      churchId?: string;
      churchSlug?: string;
      source?: string;
      deviceType?: string;
    };

    const admin = createClient(
      ctx.env.SUPABASE_URL as string,
      ctx.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } }
    );

    // Resolve churchId a partir de slug, se necessário
    let churchId = body.churchId as string | undefined;
    if (!churchId && body.churchSlug) {
      const { data: found } = await admin
        .from('church')
        .select('id')
        .eq('slug', body.churchSlug)
        .maybeSingle();
      if (found) churchId = found.id;
    }

    const user_agent = ctx.request.headers.get('user-agent') ?? null;
    const ip = ctx.request.headers.get('cf-connecting-ip') ?? '';
    const salt = ctx.env.IP_HASH_SALT as string | undefined;
    const ip_hash = salt && ip ? await sha256Hex(`${salt}|${ip}`) : null;
    const deviceType = body.deviceType ?? (user_agent ? detectDeviceType(user_agent) : null);

    const { data, error } = await admin
      .from('quiz_session')
      .insert({
        church_id:   churchId ?? null,
        source:      body.source ?? null,
        device_type: deviceType ?? null,
        ip_hash,
        user_agent,
      })
      .select('id')
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(
      JSON.stringify({ ok: true, sessionId: data.id }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};

// PATCH /api/quiz-session — atualiza progresso (chamado a cada 10 questões)
export const onRequestPatch = async (ctx: any) => {
  try {
    const body = (await ctx.request.json().catch(() => ({}))) as {
      sessionId: string;
      lastStep: number;
    };

    if (!body.sessionId || typeof body.lastStep !== 'number') {
      return new Response(
        JSON.stringify({ error: 'sessionId e lastStep são obrigatórios' }),
        { status: 400 }
      );
    }

    const admin = createClient(
      ctx.env.SUPABASE_URL as string,
      ctx.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } }
    );

    const { error } = await admin
      .from('quiz_session')
      .update({
        last_step:    body.lastStep,
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', body.sessionId);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};
