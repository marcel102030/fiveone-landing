import { createClient } from '@supabase/supabase-js';

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const SERVICE_TYPES: Record<string, { label: string }> = {
  mentoria: { label: 'Mentoria Individual' },
  palestra: { label: 'Palestra Introdutória' },
  treinamento: { label: 'Treinamento para Liderança' },
  imersao: { label: 'Imersão Ministerial' },
};

export const onRequest = async ({ request, env }: { request: Request; env: Env }) => {
  const method = request.method.toUpperCase();
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (method !== 'GET') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { ...CORS_HEADERS, Allow: 'GET, OPTIONS' },
    });
  }

  try {
    const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data, error } = await admin
      .from('service_request')
      .select(
        `id, created_at, service_type, status, contact_name, contact_email, contact_phone, city, payload, church:church_id ( id, name, slug, city, leader_name )`
      )
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      throw new Error(error.message);
    }

    const byType: Record<string, any[]> = {};
    const counts: Record<string, number> = {};

    (data || []).forEach((row) => {
      const type = row.service_type || 'outros';
      if (!byType[type]) byType[type] = [];
      if (!counts[type]) counts[type] = 0;
      counts[type] += 1;
      byType[type].push({
        id: row.id,
        created_at: row.created_at,
        service_type: row.service_type,
        status: row.status,
        contact_name: row.contact_name,
        contact_email: row.contact_email,
        contact_phone: row.contact_phone,
        city: row.city,
        payload: row.payload,
        church: row.church,
      });
    });

    // garante todas as chaves com array vazio
    Object.keys(SERVICE_TYPES).forEach((key) => {
      if (!byType[key]) byType[key] = [];
      if (!counts[key]) counts[key] = 0;
    });

    return json({ ok: true, requestsByType: byType, counts, labels: SERVICE_TYPES });
  } catch (err: any) {
    console.error('[service-request-list]', err);
    return json({ ok: false, error: String(err?.message || err) }, 500);
  }
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...CORS_HEADERS },
  });
}

