import { createClient } from '@supabase/supabase-js';

// GET /api/quiz-result-by-token?token=<uuid>
// Endpoint público — retorna o resultado pelo result_token (sem auth)
export const onRequestGet = async (ctx: any) => {
  try {
    const url = new URL(ctx.request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Parâmetro token é obrigatório' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    const admin = createClient(
      ctx.env.SUPABASE_URL as string,
      ctx.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } }
    );

    const { data, error } = await admin
      .from('quiz_response')
      .select('id, person_name, scores_json, top_dom, ties, created_at, completion_seconds')
      .eq('result_token', token)
      .maybeSingle();

    if (error) {
      console.error('quiz-result-by-token query error:', error.message);
      return new Response(JSON.stringify({ error: 'Erro ao carregar resultado.' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (!data) {
      return new Response(JSON.stringify({ error: 'Resultado não encontrado' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        result: {
          id: data.id,
          name: data.person_name || 'Anônimo',
          scores: data.scores_json ?? {},
          topDom: data.top_dom ?? null,
          ties: Array.isArray(data.ties) ? data.ties : [],
          date: data.created_at,
          completionSeconds: data.completion_seconds ?? null,
        },
      }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (e) {
    console.error('quiz-result-by-token error:', e);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
