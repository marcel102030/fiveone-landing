import { createClient } from '@supabase/supabase-js';

// GET /api/quiz-unsubscribe?token=<unsubscribe_token>
// Descadastra o lead da régua de nutrição (LGPD: revogação simples, sem login).
export const onRequestGet = async (ctx: any) => {
  const page = (title: string, msg: string) =>
    new Response(
      `<!doctype html><html lang="pt-br"><head><meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <title>${title} | Five One</title></head>
      <body style="margin:0;background:#0d1b2a;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:520px;margin:0 auto;padding:80px 24px;text-align:center;color:#cfd8dc;">
          <div style="color:#64ffda;font-weight:700;letter-spacing:0.5px;margin-bottom:24px;">FIVE ONE</div>
          <h1 style="color:#fff;font-size:1.4rem;">${title}</h1>
          <p style="line-height:1.6;">${msg}</p>
          <a href="https://fiveonemovement.com" style="color:#64ffda;display:inline-block;margin-top:16px;">Voltar ao site</a>
        </div>
      </body></html>`,
      { headers: { 'content-type': 'text/html; charset=utf-8' } }
    );

  try {
    const url = new URL(ctx.request.url);
    const token = url.searchParams.get('token');
    if (!token) return page('Link inválido', 'Este link de descadastro não é válido.');

    const admin = createClient(
      ctx.env.SUPABASE_URL as string,
      ctx.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } }
    );

    const { data, error } = await admin
      .from('quiz_response')
      .update({ unsubscribed: true })
      .eq('unsubscribe_token', token)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('quiz-unsubscribe error:', error.message);
      return page('Não foi possível processar', 'Tente novamente mais tarde.');
    }
    if (!data) return page('Link inválido', 'Este link de descadastro não é válido ou já expirou.');

    return page('Descadastro confirmado', 'Você não receberá mais os e-mails de acompanhamento do teste. Sentiremos sua falta!');
  } catch (e) {
    console.error('quiz-unsubscribe exception:', e);
    return page('Não foi possível processar', 'Tente novamente mais tarde.');
  }
};
