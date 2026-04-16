// Gera o calendário de conteúdo mensal usando a API do Claude.
// Usa um modelo rápido (Haiku) para gerar título + gancho + esqueleto do roteiro
// em menos de 30s (limite do Cloudflare Pages Functions).
// O roteiro completo é gerado por demanda via /api/generate-script.
//
// Env vars necessárias (Cloudflare Pages → Settings → Environment variables):
//   ANTHROPIC_API_KEY  ← chave secreta da Anthropic

type Env = {
  ANTHROPIC_API_KEY: string;
};

type PostingDate = { date: string; dow: string };

type RequestBody = {
  year: number;
  month: number;
  monthName: string;
  postingDates: PostingDate[];
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...CORS },
  });

export const onRequest = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (method !== 'POST') return json({ ok: false, error: 'Method Not Allowed' }, 405);

  if (!env.ANTHROPIC_API_KEY) {
    return json({ ok: false, error: 'ANTHROPIC_API_KEY não configurada no ambiente Cloudflare.' }, 500);
  }

  let body: RequestBody;
  try {
    body = await request.json() as RequestBody;
  } catch {
    return json({ ok: false, error: 'Corpo da requisição inválido.' }, 400);
  }

  const { year, month, monthName, postingDates } = body;
  if (!postingDates?.length) {
    return json({ ok: false, error: 'Nenhuma data de postagem fornecida.' }, 400);
  }

  // Prompt compacto: gera só a estrutura do calendário (sem roteiro longo).
  // O roteiro completo é expandido por demanda via /api/generate-script.
  const prompt = `Você é o assistente de criação de conteúdo do canal Five One — Escola dos 5 Ministérios.
O canal ensina os 5 Ministérios de Efésios 4:11-12 para cristãos brasileiros jovens.
Tom: apologético, teológico, acessível e provocativo.

Gere o plano de conteúdo para ${monthName} de ${year}.

Datas de postagem:
${postingDates.map((d, i) => `${i + 1}. ${d.date} (${d.dow})`).join('\n')}

Regras de formato:
- Segunda → "reel"
- Quarta → "carrossel"
- Sexta → alterna "reel" / "youtube" / "live"

Distribuição de temas (${postingDates.length} posts total):
- 3× Apologética
- 3× Cultura x Bíblia
- 2× Os 5 Ministérios
- 2× Saúde Mental + Fé
- 2× Teologia Acessível

Para cada post retorne um objeto JSON com EXATAMENTE estas chaves:
{
  "scheduled_date": "YYYY-MM-DD",
  "format": "reel"|"carrossel"|"youtube"|"live",
  "category": "categoria",
  "funnel_stage": "topo"|"meio"|"fundo",
  "title": "título provocativo (máx 12 palavras)",
  "hook": "gancho de abertura — 2 frases impactantes",
  "script": "Esqueleto do roteiro:\\n[ABERTURA] ideia central\\n[DESENVOLVIMENTO] 3 pontos-chave\\n[CTA] chamada à ação",
  "notes": "#hashtag1 #hashtag2 #hashtag3 — dica visual rápida",
  "platform": "instagram"|"youtube"|"instagram,youtube"
}

funnel_stage: Segundas=topo, Quartas=meio, Sextas alternam fundo/topo.

Retorne SOMENTE o array JSON com ${postingDates.length} objetos. Sem texto, sem markdown.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      let errMsg = `HTTP ${res.status}`;
      try { errMsg = (JSON.parse(errBody) as any).error?.message ?? errMsg; } catch {}
      return json({ ok: false, error: errMsg }, 502);
    }

    const anthropicJson = await res.json() as any;
    const raw: string = anthropicJson.content?.[0]?.text ?? '';

    if (!raw) {
      return json({ ok: false, error: 'Resposta vazia da IA. Tente novamente.' }, 502);
    }

    // Remove possíveis blocos markdown ```json ... ```
    const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

    let posts: any[];
    try {
      posts = JSON.parse(clean);
    } catch (parseErr: any) {
      return json({
        ok: false,
        error: `Resposta da IA não é JSON válido: ${parseErr.message}`,
        raw_preview: raw.slice(0, 500),
      }, 502);
    }

    if (!Array.isArray(posts)) {
      return json({ ok: false, error: 'A IA não retornou um array de posts.' }, 502);
    }

    return json({ ok: true, posts });
  } catch (err: any) {
    return json({ ok: false, error: err.message ?? String(err) }, 500);
  }
};
