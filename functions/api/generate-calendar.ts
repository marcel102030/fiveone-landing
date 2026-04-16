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

  // Prompt ultra-compacto (lote de até 4 posts, ~80 tokens/post de saída).
  // O frontend envia lotes paralelos para respeitar o limite de 30s do Cloudflare.
  const themes = ['Apologética','Cultura x Bíblia','Os 5 Ministérios','Saúde Mental + Fé','Teologia Acessível'];
  const prompt = `Canal Five One (5 Ministérios Ef 4:11-12, jovens cristãos brasileiros, tom apologético).

Gere ${postingDates.length} post(s) para ${monthName}/${year}:
${postingDates.map((d, i) => `${i + 1}. ${d.date} (${d.dow})`).join('\n')}

Regras: segunda=reel/topo, quarta=carrossel/meio, sexta=reel|youtube|live alternando / topo|fundo alternando.
Temas disponíveis: ${themes.join(', ')}.

Retorne SOMENTE array JSON, sem texto extra:
[{"scheduled_date":"YYYY-MM-DD","format":"reel|carrossel|youtube|live","category":"tema","funnel_stage":"topo|meio|fundo","title":"título provocativo","hook":"gancho de 1 frase","script":"[ABERTURA] ideia • [DEV] pt1; pt2; pt3 • [CTA] ação","notes":"#tag1 #tag2","platform":"instagram|youtube|instagram,youtube"}]`;

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
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      let errMsg = `Anthropic HTTP ${res.status}`;
      try {
        const parsed = JSON.parse(errBody) as any;
        errMsg = parsed.error?.message ?? parsed.error?.type ?? errMsg;
      } catch {}
      // Sempre retorna JSON 200 para o browser conseguir ler a mensagem
      return json({ ok: false, error: errMsg });
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
