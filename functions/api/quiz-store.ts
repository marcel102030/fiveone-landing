import { createClient } from '@supabase/supabase-js';

interface Person {
  name?: string;
  email?: string;
  phone?: string;
}

interface QuizAnswer {
  step: number;
  statementAId: number;
  statementBId: number;
  choice: 'a' | 'b' | 'both' | 'none';
  timeMs?: number;
}

interface QuizStoreBody {
  churchId?: string;
  churchSlug?: string;
  person?: Person;
  scores: Record<string, number>;       // percentuais por dom
  rawScores?: Record<string, number>;   // pontuação bruta (antes de dividir pelo total)
  totalPoints?: number;                 // soma de todos os pontos brutos
  topDom: string;
  ties?: string[];
  startedAt?: string;                   // ISO timestamp de quando o quiz começou
  completionSeconds?: number;           // duração total em segundos
  source?: 'direct' | 'church_invite' | 'qr_code' | 'organic';
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  answers?: QuizAnswer[];               // respostas individuais (50 itens)
  sessionId?: string;                   // ID da quiz_session para marcar como concluída
}

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

export const onRequestPost = async (ctx: any) => {
  try {
    const body = (await ctx.request.json().catch(() => ({}))) as Partial<QuizStoreBody>;

    if (!body || !body.scores || typeof body.topDom !== 'string') {
      return new Response(
        JSON.stringify({ error: 'payload inválido: scores e topDom são obrigatórios' }),
        { status: 400 }
      );
    }

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
    // church_id é opcional: respostas standalone (sem igreja) são permitidas

    const user_agent = ctx.request.headers.get('user-agent') ?? null;
    const ip = ctx.request.headers.get('cf-connecting-ip') ?? '';
    const salt = ctx.env.IP_HASH_SALT as string | undefined;
    const ip_hash = salt && ip ? await sha256Hex(`${salt}|${ip}`) : null;

    // Detecta device no servidor se não foi enviado pelo cliente
    const deviceType = body.deviceType ?? (user_agent ? detectDeviceType(user_agent) : undefined);

    // Gera token único para URL pública do resultado
    const result_token = crypto.randomUUID();

    const insertPayload = {
      church_id:          churchId ?? null,
      person_name:        body.person?.name ?? null,
      person_email:       body.person?.email ?? null,
      person_phone:       body.person?.phone ?? null,
      scores_json:        body.scores as Record<string, number>,
      raw_scores_json:    body.rawScores ?? null,
      total_points:       body.totalPoints ?? null,
      top_dom:            body.topDom,
      ties:               body.ties ?? [],
      started_at:         body.startedAt ?? null,
      completion_seconds: body.completionSeconds ?? null,
      source:             body.source ?? null,
      device_type:        deviceType ?? null,
      user_agent,
      ip_hash,
      result_token,
    };

    const { data, error } = await admin
      .from('quiz_response')
      .insert(insertPayload)
      .select('id')
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const responseId = data.id as string;

    // Insere respostas individuais (quiz_answer) em lote
    if (body.answers && body.answers.length > 0) {
      const answerRows = body.answers.map((a) => ({
        quiz_response_id: responseId,
        step:             a.step,
        statement_a_id:   a.statementAId,
        statement_b_id:   a.statementBId,
        choice:           a.choice,
        time_ms:          a.timeMs ?? null,
      }));

      const { error: answersError } = await admin
        .from('quiz_answer')
        .insert(answerRows);

      if (answersError) {
        // Não bloqueia o fluxo principal; apenas loga
        console.error('quiz_answer insert error:', answersError.message);
      }
    }

    // Vincula e finaliza a sessão, se fornecida
    if (body.sessionId) {
      const { error: sessionError } = await admin
        .from('quiz_session')
        .update({
          quiz_response_id: responseId,
          completed:        true,
          last_step:        50,
          last_seen_at:     new Date().toISOString(),
        })
        .eq('id', body.sessionId);

      if (sessionError) {
        console.error('quiz_session update error:', sessionError.message);
      }
    }

    return new Response(
      JSON.stringify({ ok: true, id: responseId, result_token }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};
