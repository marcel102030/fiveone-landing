import { createClient } from '@supabase/supabase-js';

const AVATAR_BUCKET = 'profile-logos';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function normalizeEmail(value: string | null | undefined): string {
  return value ? value.trim().toLowerCase() : '';
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export const onRequest = async (ctx: any) => {
  const { request, env } = ctx;
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { ...CORS, Allow: 'POST, OPTIONS' },
    });
  }

  try {
    const formData = await request.formData();
    const email = normalizeEmail(formData.get('email')?.toString());
    const file = formData.get('file');

    if (!email) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing email' }), {
        status: 400,
        headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing file' }), {
        status: 400,
        headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    const supabaseUrl = env.SUPABASE_URL as string | undefined;
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ ok: false, error: 'Supabase credentials not configured' }), {
        status: 500,
        headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const extension = (() => {
      const nameExt = file.name?.split('.').pop();
      if (nameExt) return nameExt.toLowerCase();
      const typeExt = file.type?.split('/').pop();
      return typeExt ? typeExt.toLowerCase() : 'png';
    })();

    const safeBase = slugify(file.name?.replace(/\.[^.]+$/, '') || 'avatar');
    const objectPath = `${email}/${safeBase}-${Date.now()}.${extension}`;

    const { error: uploadError } = await adminClient.storage.from(AVATAR_BUCKET).upload(objectPath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/png',
    });

    if (uploadError) {
      return new Response(JSON.stringify({ ok: false, error: uploadError.message || 'Upload failed' }), {
        status: 500,
        headers: { 'content-type': 'application/json', ...CORS },
      });
    }

    const { data } = adminClient.storage.from(AVATAR_BUCKET).getPublicUrl(objectPath);

    return new Response(JSON.stringify({ ok: true, url: data.publicUrl, path: objectPath }), {
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
