import { createClient } from '@supabase/supabase-js';

// O1 — Régua de nutrição pós-resultado.
// POST /api/quiz-nurture-run  (protegido por segredo — chamado por um cron externo)
// Header:  X-Nurture-Secret: <NURTURE_CRON_SECRET>
//
// A cada execução, envia o próximo e-mail devido de cada lead e avança o estágio.
// Cadência medida a partir de created_at:  D+1 (boas-vindas) → D+3 (aprofundar) → D+7 (convite).

const SITE = 'https://fiveonemovement.com';
const BATCH_LIMIT = 50; // e-mails por execução (folga p/ o volume atual)

const DOM_NAMES: Record<string, string> = {
  apostolo: 'Apóstolo',
  profeta: 'Profeta',
  evangelista: 'Evangelista',
  pastor: 'Pastor',
  mestre: 'Mestre',
};

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
  );
}

function firstName(name?: string | null) {
  const n = (name ?? '').trim().split(/\s+/)[0];
  return n || 'tudo bem';
}

// Envelope de e-mail com identidade Five One (navy/mint)
function wrap(bodyHtml: string, unsubscribeUrl: string) {
  return `
  <div style="background:#0d1b2a;padding:28px 16px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#0f2233;border:1px solid rgba(100,255,218,0.18);border-radius:16px;overflow:hidden;">
      <div style="padding:22px 28px;border-bottom:1px solid rgba(255,255,255,0.06);">
        <span style="color:#64ffda;font-weight:700;letter-spacing:0.5px;font-size:14px;">FIVE ONE</span>
      </div>
      <div style="padding:26px 28px;color:#cfd8dc;font-size:15px;line-height:1.65;">
        ${bodyHtml}
      </div>
      <div style="padding:18px 28px;border-top:1px solid rgba(255,255,255,0.06);color:#6b8291;font-size:12px;line-height:1.6;">
        Você recebe este e-mail porque fez o Teste dos 5 Ministérios do Five One.<br/>
        <a href="${unsubscribeUrl}" style="color:#6b8291;text-decoration:underline;">Não quero mais receber estes e-mails</a>
      </div>
    </div>
  </div>`;
}

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;margin-top:8px;padding:12px 22px;background:#64ffda;color:#052e16;font-weight:700;border-radius:10px;text-decoration:none;">${label}</a>`;

// Estágios da régua. Índice = nurture_stage atual do lead a ser enviado.
// afterDays = idade mínima (a partir de created_at) para disparar aquele estágio.
type Lead = { id: string; person_name: string | null; person_email: string; top_dom: string | null; result_token: string | null; unsubscribe_token: string | null };

const STAGES: Array<{
  afterDays: number;
  subject: (domLabel: string) => string;
  body: (lead: Lead, domLabel: string) => string;
}> = [
  {
    afterDays: 1,
    subject: (dom) => `Seu dom de ${dom} — e o próximo passo`,
    body: (lead, dom) => `
      <p>Oi, ${escapeHtml(firstName(lead.person_name))}!</p>
      <p>Há alguns dias você fez o Teste dos 5 Ministérios e descobriu que o seu dom em maior expressão é o de <strong style="color:#64ffda;">${escapeHtml(dom)}</strong>.</p>
      <p>Descobrir é só o começo — o que transforma é <strong>desenvolver</strong>. Guarde o seu resultado e comece a olhar com atenção para como esse dom já se manifesta na sua caminhada.</p>
      ${lead.result_token ? `<p>${btn(`${SITE}/resultado/${lead.result_token}`, 'Rever meu resultado')}</p>` : ''}
      <p style="margin-top:18px;">Nos vemos por aqui,<br/>Equipe Five One</p>`,
  },
  {
    afterDays: 3,
    subject: (dom) => `Como desenvolver o seu dom de ${dom}`,
    body: (lead, dom) => `
      <p>Oi, ${escapeHtml(firstName(lead.person_name))}!</p>
      <p>Todo dom cresce quando é alimentado. Separamos conteúdos gratuitos que ajudam você a entender melhor o seu chamado de <strong style="color:#64ffda;">${escapeHtml(dom)}</strong> e a colocá-lo em prática na igreja e no dia a dia.</p>
      <p>${btn(`${SITE}/para-ler`, 'Ler conteúdos do Five One')}</p>
      <p style="margin-top:18px;">Com você nessa jornada,<br/>Equipe Five One</p>`,
  },
  {
    afterDays: 7,
    subject: () => `O próximo passo do seu chamado`,
    body: (lead, dom) => `
      <p>Oi, ${escapeHtml(firstName(lead.person_name))}!</p>
      <p>Conhecer o seu dom de <strong style="color:#64ffda;">${escapeHtml(dom)}</strong> abre uma pergunta importante: como ser treinado e ativado de forma intencional?</p>
      <p>É exatamente isso que a Escola Five One existe para fazer — uma formação ministerial e teológica, 100% online, para você desenvolver e viver o seu chamado com profundidade.</p>
      <p>${btn(`${SITE}/cursos`, 'Conhecer os cursos')}</p>
      <p style="margin-top:18px;">Torcendo por você,<br/>Equipe Five One</p>`,
  },
];

export const onRequestPost = async (ctx: any) => {
  try {
    const secret = ctx.request.headers.get('x-nurture-secret') || '';
    const expected = ctx.env.NURTURE_CRON_SECRET as string | undefined;
    if (!expected || secret !== expected) {
      return new Response(JSON.stringify({ error: 'não autorizado' }), { status: 401 });
    }

    const admin = createClient(
      ctx.env.SUPABASE_URL as string,
      ctx.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } }
    );

    const fromAddress =
      ctx.env.RESEND_FROM && String(ctx.env.RESEND_FROM).trim().length > 0
        ? ctx.env.RESEND_FROM
        : 'Five One <resultado5ministerios@fiveonemovement.com>';
    const replyTo =
      ctx.env.RESEND_REPLY_TO && String(ctx.env.RESEND_REPLY_TO).trim().length > 0
        ? ctx.env.RESEND_REPLY_TO
        : 'escolafiveone@gmail.com';

    const now = Date.now();
    let sent = 0;
    let failed = 0;
    const perStage: Record<number, number> = {};

    for (let stage = 0; stage < STAGES.length; stage++) {
      const remaining = BATCH_LIMIT - sent;
      if (remaining <= 0) break;

      const cutoffIso = new Date(now - STAGES[stage].afterDays * 86400000).toISOString();

      const { data: leads, error } = await admin
        .from('quiz_response')
        .select('id, person_name, person_email, top_dom, result_token, unsubscribe_token')
        .eq('nurture_stage', stage)
        .eq('unsubscribed', false)
        .not('person_email', 'is', null)
        .lte('created_at', cutoffIso)
        .order('created_at', { ascending: true })
        .limit(remaining);

      if (error) {
        console.error('quiz-nurture-run query error:', error.message);
        continue;
      }

      for (const lead of (leads ?? []) as Lead[]) {
        const domKey = (lead.top_dom ?? '').toLowerCase();
        const domLabel = DOM_NAMES[domKey] ?? 'ministério';
        const unsubUrl = `${SITE}/api/quiz-unsubscribe?token=${encodeURIComponent(lead.unsubscribe_token ?? '')}`;

        try {
          const resp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${ctx.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: fromAddress,
              to: lead.person_email,
              reply_to: replyTo,
              subject: STAGES[stage].subject(domLabel),
              html: wrap(STAGES[stage].body(lead, domLabel), unsubUrl),
            }),
          });

          if (!resp.ok) {
            failed++;
            console.error('nurture send failed', lead.id, await resp.text());
            continue; // não avança o estágio; tenta de novo na próxima execução
          }

          await admin
            .from('quiz_response')
            .update({ nurture_stage: stage + 1, nurture_last_sent_at: new Date().toISOString() })
            .eq('id', lead.id);

          sent++;
          perStage[stage] = (perStage[stage] ?? 0) + 1;
        } catch (e) {
          failed++;
          console.error('nurture send exception', lead.id, e);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, sent, failed, perStage }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    console.error('quiz-nurture-run error:', e);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), { status: 500 });
  }
};
