import { createClient } from '@supabase/supabase-js';
import { slugify } from '../../src/utils/slugify';

type ChurchCreateBody = {
  name: string;
  leader_name?: string;
  city?: string;
  expected_members?: number;
  notes?: string;
};

export const onRequestPost = async (ctx: any) => {
  try {
    const body = (await ctx.request.json().catch(() => ({}))) as Partial<ChurchCreateBody>;
    const { name, leader_name, city, expected_members, notes } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return new Response(JSON.stringify({ error: 'name é obrigatório' }), { status: 400 });
    }

    // client admin (server-side)
    const admin = createClient(
      ctx.env.SUPABASE_URL as string,
      ctx.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } }
    );

    // slug único
    const base = slugify(name);
    let slug = base;

    const { data: exists } = await admin
      .from('church')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (exists) {
      slug = `${base}-${Date.now().toString(36).slice(-4)}`;
    }

    const { data, error } = await admin
      .from('church')
      .insert([{ name, leader_name, city, expected_members, notes, slug }])
      .select('id, slug')
      .single();

    if (error) {
      return new Response(JSON.stringify({ error }), { status: 500 });
    }

    // defina o domínio do seu site nas variáveis do Cloudflare
    const site = (ctx.env.SITE_URL as string) || 'https://seusite.com';
    const inviteUrl = `${site}/c/${data.slug}`;
    const reportUrl = `${site}/#/relatorio/${data.slug}`;
    // Corrigido: link correto do teste com churchSlug
    const quizUrl = `${site}/#/teste-dons?churchSlug=${encodeURIComponent(data.slug)}`;

    return new Response(
      JSON.stringify({
        ok: true,
        church: { id: data.id, slug: data.slug, name },
        slug: data.slug,
        invite_url: inviteUrl,
        report_url: reportUrl,
        quiz_url: quizUrl,
        // compatibilidade antiga (camelCase)
        inviteUrl,
      }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};
