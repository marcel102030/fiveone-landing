import { createClient } from '@supabase/supabase-js';

// GET /api/quiz-statements
// Retorna as afirmações ativas do teste + a versão do instrumento.
// Servido com service_role; o front usa como fonte (com fallback pro hardcoded).
export const onRequestGet = async (ctx: any) => {
  try {
    const admin = createClient(
      ctx.env.SUPABASE_URL as string,
      ctx.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } },
    );

    const { data, error } = await admin
      .from('quiz_statement')
      .select('id, category, text, instrument_version')
      .eq('is_active', true)
      .order('id', { ascending: true });

    if (error || !data) {
      console.error('quiz-statements query error:', error?.message);
      return new Response(JSON.stringify({ error: 'Erro ao carregar afirmações.' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    const instrumentVersion = (data[0] as any)?.instrument_version ?? 2;
    const statements = data.map((r: any) => ({ id: r.id, category: r.category, text: r.text }));

    return new Response(
      JSON.stringify({ ok: true, instrumentVersion, statements }),
      { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' } },
    );
  } catch (e) {
    console.error('quiz-statements error:', e);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), { status: 500 });
  }
};
