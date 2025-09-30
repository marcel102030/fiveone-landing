import { createClient } from '@supabase/supabase-js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function computeInitials(name: string | null | undefined, email: string): string {
  const base = name && name.trim() ? name : email;
  const clean = base.replace(/@.*/, '').trim();
  if (!clean) return email.slice(0, 2).toUpperCase();
  const parts = clean.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return clean.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const onRequest = async (ctx: any) => {
  const { request, env } = ctx;
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405, headers: { ...CORS, Allow: 'GET, OPTIONS' } });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '6', 10) || 6, 12);

  const supabaseUrl = env.SUPABASE_URL as string | undefined;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ ok: false, error: 'Supabase credentials not configured' }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...CORS },
    });
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    let query = admin
      .from('platform_user_profile')
      .select('user_email, display_name, first_name, last_name, avatar_url')
      .limit(limit);

    if (q) {
      const pattern = `%${q.replace(/%/g, '').replace(/_/g, '').trim()}%`;
      query = query.or(
        `display_name.ilike.${pattern},first_name.ilike.${pattern},last_name.ilike.${pattern},user_email.ilike.${pattern}`,
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    const results = (data || []).map((row) => {
      const name = row.display_name || [row.first_name, row.last_name].filter(Boolean).join(' ') || row.user_email;
      return {
        email: row.user_email,
        name,
        avatarUrl: row.avatar_url || null,
        initials: computeInitials(name, row.user_email),
      };
    });

    return new Response(JSON.stringify({ ok: true, results }), {
      status: 200,
      headers: { 'content-type': 'application/json', ...CORS },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ ok: false, error: error?.message || 'Unexpected error' }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...CORS },
    });
  }
};
