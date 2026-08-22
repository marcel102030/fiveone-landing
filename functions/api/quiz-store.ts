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
  scores: Record<string, number>;       // percentuais por dom (fallback do cliente)
  rawScores?: Record<string, number>;   // pontuação bruta (fallback do cliente)
  totalPoints?: number;                 // soma dos pontos brutos (fallback do cliente)
  topDom: string;
  ties?: string[];
  startedAt?: string;                   // ISO timestamp de quando o quiz começou
  completionSeconds?: number;           // duração total em segundos
  source?: 'direct' | 'church_invite' | 'qr_code' | 'organic';
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  answers?: QuizAnswer[];               // respostas individuais (até 50 itens)
  sessionId?: string;                   // ID da quiz_session para marcar como concluída
  instrumentVersion?: number;           // versão do instrumento (afirmações) usada
}

// ── Limites de validação (I9) ────────────────────────────────────────────────
const MAX_ANSWERS = 60;                 // esperado 50; folga para segurança
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Dom = 'apostolo' | 'profeta' | 'evangelista' | 'pastor' | 'mestre';
const DOMS: Dom[] = ['apostolo', 'profeta', 'evangelista', 'pastor', 'mestre'];

// Mapa afirmação→dom por faixa de id (1-20 apóstolo, 21-40 profeta, ...).
// Fonte da verdade no servidor — impede resultado manipulado pelo cliente (C6).
function categoryForStatementId(id: number): Dom | null {
  if (id >= 1 && id <= 20) return 'apostolo';
  if (id >= 21 && id <= 40) return 'profeta';
  if (id >= 41 && id <= 60) return 'evangelista';
  if (id >= 61 && id <= 80) return 'pastor';
  if (id >= 81 && id <= 100) return 'mestre';
  return null;
}

// Recalcula pontuação a partir das respostas individuais (autoridade do servidor).
function computeScoresFromAnswers(answers: QuizAnswer[]) {
  const raw: Record<Dom, number> = { apostolo: 0, profeta: 0, evangelista: 0, pastor: 0, mestre: 0 };
  for (const a of answers) {
    const ca = categoryForStatementId(a.statementAId);
    const cb = categoryForStatementId(a.statementBId);
    if (a.choice === 'a') { if (ca) raw[ca] += 1; }
    else if (a.choice === 'b') { if (cb) raw[cb] += 1; }
    else if (a.choice === 'both') { if (ca) raw[ca] += 1; if (cb) raw[cb] += 1; }
    // 'none' → não pontua
  }
  const total = DOMS.reduce((s, k) => s + raw[k], 0);
  const pct: Record<string, number> = {};
  for (const k of DOMS) pct[k] = total > 0 ? Math.round((raw[k] / total) * 100) : 0;
  const maxRaw = Math.max(0, ...DOMS.map((k) => raw[k]));
  const ties = maxRaw > 0 ? DOMS.filter((k) => raw[k] === maxRaw) : [];
  const topDom = ties[0] ?? '';
  return { raw: raw as Record<string, number>, pct, total, topDom, ties: ties as string[] };
}

// Retry simples para escritas transitórias (I7).
async function withRetry<T extends { error: any }>(fn: () => PromiseLike<T>, tries = 3): Promise<T> {
  let last!: T;
  for (let i = 0; i < tries; i++) {
    last = await fn();
    if (!last.error) return last;
    await new Promise((r) => setTimeout(r, 150 * (i + 1)));
  }
  return last;
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

    // ── Validação de entrada (I9) ───────────────────────────────────────────
    if (!body || !body.scores || typeof body.topDom !== 'string') {
      return new Response(
        JSON.stringify({ error: 'payload inválido: scores e topDom são obrigatórios' }),
        { status: 400 }
      );
    }

    const email = body.person?.email?.trim();
    if (!email || !EMAIL_RE.test(email)) {
      return new Response(JSON.stringify({ error: 'e-mail inválido' }), { status: 400 });
    }

    const phoneDigits = (body.person?.phone ?? '').replace(/\D/g, '');
    if (phoneDigits && (phoneDigits.length < 10 || phoneDigits.length > 13)) {
      return new Response(JSON.stringify({ error: 'telefone inválido' }), { status: 400 });
    }

    if (body.answers && !Array.isArray(body.answers)) {
      return new Response(JSON.stringify({ error: 'answers inválido' }), { status: 400 });
    }
    if (body.answers && body.answers.length > MAX_ANSWERS) {
      return new Response(JSON.stringify({ error: 'answers excede o limite' }), { status: 400 });
    }

    const admin = createClient(
      ctx.env.SUPABASE_URL as string,
      ctx.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } }
    );

    // ── Idempotência (I6): se a sessão já tem resposta, devolve a existente ──
    // Evita duplicatas por duplo-clique/refresh. Refazer o teste (nova sessão)
    // continua gerando um novo registro — política "sempre novo".
    if (body.sessionId) {
      const { data: sess } = await admin
        .from('quiz_session')
        .select('quiz_response_id')
        .eq('id', body.sessionId)
        .maybeSingle();
      if (sess?.quiz_response_id) {
        const { data: existing } = await admin
          .from('quiz_response')
          .select('id, result_token')
          .eq('id', sess.quiz_response_id)
          .maybeSingle();
        if (existing?.result_token) {
          return new Response(
            JSON.stringify({ ok: true, id: existing.id, result_token: existing.result_token, deduped: true }),
            { headers: { 'content-type': 'application/json' } }
          );
        }
      }
    }

    // Resolve churchId a partir de slug, se necessário
    let churchId = body.churchId as string | undefined;
    if (!churchId && body.churchSlug) {
      const { data: found, error: findErr } = await admin
        .from('church')
        .select('id')
        .eq('slug', body.churchSlug)
        .maybeSingle();

      if (findErr) {
        console.error('quiz-store church lookup error:', findErr.message);
        return new Response(JSON.stringify({ error: 'Erro ao processar.' }), { status: 500 });
      }
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

    // ── Score recalculado no servidor a partir das respostas (C6) ───────────
    // Se houver answers, o servidor é a autoridade; os scores do cliente viram
    // apenas fallback (quando, por algum motivo, answers não vier).
    const hasAnswers = Array.isArray(body.answers) && body.answers.length > 0;
    const computed = hasAnswers ? computeScoresFromAnswers(body.answers as QuizAnswer[]) : null;

    const scoresJson = computed ? computed.pct : (body.scores as Record<string, number>);
    const rawScoresJson = computed ? computed.raw : (body.rawScores ?? null);
    const totalPoints = computed ? computed.total : (body.totalPoints ?? null);
    const topDom = computed ? computed.topDom : body.topDom;
    const ties = computed ? computed.ties : (body.ties ?? []);

    // Gera token único para URL pública do resultado
    const result_token = crypto.randomUUID();

    const insertPayload = {
      church_id:          churchId ?? null,
      person_name:        body.person?.name ?? null,
      person_email:       email,
      person_phone:       body.person?.phone ?? null,
      scores_json:        scoresJson,
      raw_scores_json:    rawScoresJson,
      total_points:       totalPoints,
      top_dom:            topDom,
      ties,
      started_at:         body.startedAt ?? null,
      completion_seconds: body.completionSeconds ?? null,
      source:             body.source ?? null,
      device_type:        deviceType ?? null,
      user_agent,
      ip_hash,
      result_token,
      instrument_version: body.instrumentVersion ?? null,
    };

    const { data, error } = await withRetry(() =>
      admin.from('quiz_response').insert(insertPayload).select('id').single()
    );

    if (error || !data) {
      console.error('quiz-store insert error:', error?.message);
      return new Response(JSON.stringify({ error: 'Erro ao salvar resposta.' }), { status: 500 });
    }

    const responseId = data.id as string;

    // Insere respostas individuais (quiz_answer) em lote, com retry
    if (hasAnswers) {
      const answerRows = (body.answers as QuizAnswer[]).map((a) => ({
        quiz_response_id: responseId,
        step:             a.step,
        statement_a_id:   a.statementAId,
        statement_b_id:   a.statementBId,
        choice:           a.choice,
        time_ms:          a.timeMs ?? null,
      }));

      const { error: answersError } = await withRetry(() =>
        admin.from('quiz_answer').insert(answerRows)
      );

      if (answersError) {
        // Não bloqueia o fluxo principal; apenas loga (após retries)
        console.error('quiz_answer insert error:', answersError.message);
      }
    }

    // Vincula e finaliza a sessão, se fornecida
    if (body.sessionId) {
      const { error: sessionError } = await withRetry(() =>
        admin
          .from('quiz_session')
          .update({
            quiz_response_id: responseId,
            completed:        true,
            last_step:        50,
            last_seen_at:     new Date().toISOString(),
          })
          .eq('id', body.sessionId)
      );

      if (sessionError) {
        console.error('quiz_session update error:', sessionError.message);
      }
    }

    return new Response(
      JSON.stringify({ ok: true, id: responseId, result_token }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (e) {
    console.error('quiz-store error:', e);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), { status: 500 });
  }
};
