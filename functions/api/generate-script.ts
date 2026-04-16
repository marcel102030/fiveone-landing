// Gera o roteiro completo de um único post do calendário.
// Chamado quando o usuário clica em "Expandir Roteiro" no modal do post.
// Usa claude-sonnet-4-6 para qualidade máxima (uma única chamada ≈ 15-25s).
//
// Env vars necessárias:
//   ANTHROPIC_API_KEY

type Env = {
  ANTHROPIC_API_KEY: string;
};

type RequestBody = {
  title: string;
  category: string;
  format: string;
  funnel_stage: string;
  hook: string;
  scheduled_date: string;
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
    return json({ ok: false, error: 'ANTHROPIC_API_KEY não configurada.' }, 500);
  }

  let body: RequestBody;
  try {
    body = await request.json() as RequestBody;
  } catch {
    return json({ ok: false, error: 'Corpo da requisição inválido.' }, 400);
  }

  const { title, category, format, funnel_stage, hook, scheduled_date } = body;
  if (!title) return json({ ok: false, error: 'Campo "title" obrigatório.' }, 400);

  const formatLabel: Record<string, string> = {
    reel: 'Reel do Instagram (60-90 segundos, ritmo rápido)',
    carrossel: 'Carrossel do Instagram (8-10 slides, texto escaneável)',
    youtube: 'Vídeo do YouTube (8-15 minutos, mais aprofundado)',
    live: 'Live do Instagram (conversa ao vivo, interativo)',
  };

  const funnelLabel: Record<string, string> = {
    topo: 'Topo de funil — alcance máximo, linguagem de quem nunca ouviu falar do canal',
    meio: 'Meio de funil — engajamento, salvar, compartilhar, seguidores já envolvidos',
    fundo: 'Fundo de funil — conversão, convite para formação ou comunidade',
  };

  const prompt = `Você é o roteirista do canal Five One — Escola dos 5 Ministérios.
O canal ensina os 5 Ministérios de Efésios 4:11-12 para cristãos brasileiros jovens (18-35 anos).
Tom: apologético, teológico, acessível, provocativo e sem ser superficial.

Escreva o roteiro COMPLETO do seguinte post:

Título: ${title}
Categoria: ${category}
Formato: ${formatLabel[format] ?? format}
Funil: ${funnelLabel[funnel_stage] ?? funnel_stage}
Data de postagem: ${scheduled_date}
Gancho inicial: ${hook}

Estrutura obrigatória do roteiro (mínimo 450 palavras):

[ABERTURA — primeiros 10 segundos / slide 1]
Adapte o gancho acima para prender atenção imediatamente.
Use uma pergunta, afirmação provocativa ou dado surpreendente.

[DESENVOLVIMENTO — corpo principal]
Aprofunde o tema em 3-4 blocos claros:
- Contexto bíblico e teológico (cite passagens)
- Argumento central
- Aplicação prática para o jovem cristão de hoje
- Desmistificação de objeções comuns

[CONCLUSÃO E CTA]
Resumo em 2 frases + chamada à ação clara:
- Para reel/live: "Salva esse vídeo", "Segue o canal", "Comenta aqui"
- Para carrossel: "Arrasta os slides", "Salva pra ler depois"
- Para youtube: "Se inscreve no canal", "Assiste o próximo vídeo sobre X"

Escreva em português brasileiro fluente. Sem marcações de HTML ou markdown no roteiro.
Retorne APENAS o texto do roteiro, sem título, sem comentários.`;

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
        max_tokens: 2048,
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
    const script: string = anthropicJson.content?.[0]?.text ?? '';

    if (!script) {
      return json({ ok: false, error: 'Resposta vazia da IA. Tente novamente.' }, 502);
    }

    return json({ ok: true, script: script.trim() });
  } catch (err: any) {
    return json({ ok: false, error: err.message ?? String(err) }, 500);
  }
};
