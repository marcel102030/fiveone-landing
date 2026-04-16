// Gera o calendário de conteúdo mensal usando a API do Claude.
// Chamado pelo componente CalendarioConteudo via fetch('/api/generate-calendar').
// A chave fica segura no servidor Cloudflare — nunca exposta no bundle JS.
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

  const prompt = `Você é o assistente de criação de conteúdo do canal Five One — Escola dos 5 Ministérios.

O canal ensina os 5 Ministérios de Efésios 4:11-12 para cristãos brasileiros jovens.
Estilo: títulos provocativos, profundidade teológica, linguagem acessível.
Tom: apologético, fundamentado na Bíblia, sem ser superficial.

Gere um calendário de conteúdo para ${monthName} de ${year}.

Datas disponíveis para postagem (use EXATAMENTE estas, na ordem):
${postingDates.map((d, i) => `${i + 1}. ${d.date} (${d.dow})`).join('\n')}

Regras de formato por dia:
- Segunda: sempre "reel"
- Quarta: sempre "carrossel"
- Sexta: alternando entre "reel", "youtube" e "live"

Distribua os temas assim (total ${postingDates.length} posts):
- 3 posts: Apologética (evidências da fé, perguntas difíceis sobre Deus)
- 3 posts: Cultura x Bíblia (horóscopo, espiritismo, IA, psicologia, temas da atualidade)
- 2 posts: Os 5 Ministérios (Ef 4:11-12, chamado, discipulado, estrutura da igreja)
- 2 posts: Saúde Mental + Fé (ansiedade, depressão, propósito, burnout espiritual)
- 2 posts: Teologia Acessível ou Personagens Bíblicos

Para cada post, gere um objeto com EXATAMENTE estas chaves:
{
  "scheduled_date": "YYYY-MM-DD",
  "format": "reel" | "carrossel" | "youtube" | "live",
  "category": "nome da categoria",
  "funnel_stage": "topo" | "meio" | "fundo",
  "title": "título provocativo em português",
  "hook": "gancho de abertura (2-3 frases, máx 80 palavras)",
  "script": "roteiro completo em português (mínimo 500 palavras). Estrutura obrigatória:\\n\\n[ABERTURA]\\n...\\n\\n[DESENVOLVIMENTO]\\n...\\n\\n[CONCLUSÃO E CTA]\\n...",
  "notes": "notas de produção: dicas de edição, sugestões visuais, hashtags (#apologetica #5ministerios etc)",
  "platform": "instagram" | "youtube" | "instagram,youtube"
}

Regras para funnel_stage:
- Segundas (reel): sempre "topo" — máximo alcance
- Quartas (carrossel): "meio" — engajamento e salvamentos
- Sextas: "fundo" a cada 2 semanas, "topo" nas demais

Retorne SOMENTE um array JSON válido com ${postingDates.length} objetos. Nenhum texto antes ou depois. Nenhum markdown.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const anthropicJson = await res.json() as any;
    if (!res.ok) {
      throw new Error(anthropicJson.error?.message ?? `HTTP ${res.status}`);
    }

    const raw: string = anthropicJson.content?.[0]?.text ?? '';
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const posts = JSON.parse(clean);

    return json({ ok: true, posts });
  } catch (err: any) {
    return json({ ok: false, error: err.message ?? String(err) }, 500);
  }
};
