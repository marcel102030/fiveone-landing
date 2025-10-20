import { createClient } from '@supabase/supabase-js';
import { slugify } from '../../src/utils/slugify';

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SITE_URL?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  RESEND_REPLY_TO?: string;
};

type Contact = {
  name: string;
  email: string;
  phone: string;
};

type ChurchInfo = {
  name: string;
  leaderName?: string | null;
  city?: string | null;
  expectedMembers?: number | string | null;
  notes?: string | null;
};

type RequestBody = {
  serviceType: string;
  serviceLabel?: string;
  contact: Contact;
  church: ChurchInfo;
  answers?: Record<string, any>;
  context?: Record<string, any>;
};

const SERVICE_TYPES: Record<string, { label: string }> = {
  mentoria: { label: 'Mentoria Individual' },
  palestra: { label: 'Palestra Introdutória' },
  treinamento: { label: 'Treinamento para Liderança' },
  imersao: { label: 'Imersão Ministerial' },
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequest = async ({ request, env }: { request: Request; env: Env }) => {
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { ...CORS_HEADERS, Allow: 'POST, OPTIONS' },
    });
  }

  try {
    const body = (await request.json()) as RequestBody;
    const { serviceType, serviceLabel, contact, church, answers, context } = body || {};

    const meta = SERVICE_TYPES[serviceType];
    const resolvedLabel = serviceLabel?.trim() || meta?.label;
    if (!meta || !resolvedLabel) {
      return json({ ok: false, error: 'Tipo de serviço inválido.' }, 400);
    }

    const trimmedContact: Contact = {
      name: (contact?.name || '').trim(),
      email: (contact?.email || '').trim(),
      phone: (contact?.phone || '').trim(),
    };

    if (!trimmedContact.name || !trimmedContact.email || !trimmedContact.phone) {
      return json({ ok: false, error: 'Nome, e-mail e telefone do responsável são obrigatórios.' }, 400);
    }

    const churchName = (church?.name || '').trim();
    if (!churchName) {
      return json({ ok: false, error: 'Informe o nome da igreja.' }, 400);
    }

    const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const baseSlug = slugify(churchName);
    let slug = baseSlug;
    if (!slug) {
      slug = `igreja-${Date.now().toString(36)}`;
    }

    // garante slug único
    const { data: existing } = await admin.from('church').select('id').eq('slug', slug).maybeSingle();
    if (existing) {
      slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
    }

    const expectedMembers = normalizeNumber(church?.expectedMembers);
    const noteParts = [
      `Solicitação via site: ${resolvedLabel}`,
      trimmedContact.email ? `Contato: ${trimmedContact.email}` : null,
      trimmedContact.phone ? `Telefone: ${trimmedContact.phone}` : null,
      church?.notes?.trim() ? `Observação: ${church?.notes.trim()}` : null,
    ].filter(Boolean);

    const insertPayload = {
      name: churchName,
      leader_name: church?.leaderName?.trim() || trimmedContact.name,
      city: church?.city?.trim() || null,
      expected_members: expectedMembers,
      notes: noteParts.join(' | ') || null,
      slug,
    };

    const { data: insertedChurch, error: insertError } = await admin
      .from('church')
      .insert([insertPayload])
      .select('id, slug, name')
      .single();

    if (insertError || !insertedChurch) {
      throw new Error(insertError?.message || 'Não foi possível criar a igreja.');
    }

    const payload = {
      form: answers || {},
      context: {
        ...(context || {}),
        serviceType,
        serviceLabel: resolvedLabel,
      },
    };

    const { data: requestInsert, error: requestError } = await admin
      .from('service_request')
      .insert([
        {
          service_type: serviceType,
          status: 'pending',
          church_id: insertedChurch.id,
          contact_name: trimmedContact.name,
          contact_email: trimmedContact.email,
          contact_phone: trimmedContact.phone,
          city: church?.city?.trim() || null,
          payload,
          source: 'web_form',
        },
      ])
      .select('id')
      .single();

    if (requestError || !requestInsert) {
      throw new Error(requestError?.message || 'Não foi possível registrar a solicitação.');
    }

    const originSite = env.SITE_URL || new URL(request.url).origin;
    const quizUrl = `${originSite}/#/teste-dons?churchSlug=${encodeURIComponent(insertedChurch.slug)}`;
    const reportUrl = `${originSite}/#/relatorio/${encodeURIComponent(insertedChurch.slug)}`;

    await sendContactEmail({
      request,
      env,
      church: insertedChurch,
      contact: trimmedContact,
      quizUrl,
      reportUrl,
    });

    await sendInternalEmail({
      env,
      serviceType,
      serviceLabel: resolvedLabel,
      church: insertedChurch,
      contact: trimmedContact,
      quizUrl,
      reportUrl,
      payload,
    });

    return json({
      ok: true,
      church: {
        id: insertedChurch.id,
        slug: insertedChurch.slug,
        name: insertedChurch.name,
        quiz_url: quizUrl,
        report_url: reportUrl,
      },
      request: { id: requestInsert.id, service_type: serviceType, label: resolvedLabel },
    });
  } catch (error: any) {
    console.error('[service-request] error', error);
    return json({ ok: false, error: String(error?.message || error) }, 500);
  }
};

async function sendContactEmail({
  request,
  env,
  church,
  contact,
  quizUrl,
  reportUrl,
}: {
  request: Request;
  env: Env;
  church: { id: string; slug: string; name: string };
  contact: Contact;
  quizUrl: string;
  reportUrl: string;
}) {
  try {
    const endpoint = new URL('/api/church-created-email', request.url);
    await fetch(endpoint.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        to: contact.email,
        church: { name: church.name, slug: church.slug },
        links: { testUrl: quizUrl, reportUrl },
        responsibleName: contact.name,
      }),
    });
  } catch (err) {
    console.warn('[service-request] falha ao enviar e-mail para contato', err);
  }
}

async function sendInternalEmail({
  env,
  serviceType,
  serviceLabel,
  church,
  contact,
  quizUrl,
  reportUrl,
  payload,
}: {
  env: Env;
  serviceType: string;
  serviceLabel: string;
  church: { id: string; slug: string; name: string };
  contact: Contact;
  quizUrl: string;
  reportUrl: string;
  payload: Record<string, any>;
}) {
  if (!env.RESEND_API_KEY) {
    console.warn('[service-request] RESEND_API_KEY ausente – não foi possível notificar equipe interna.');
    return;
  }

  const html = renderInternalHtml({ serviceLabel, church, contact, quizUrl, reportUrl, payload });
  const text = renderInternalText({ serviceLabel, church, contact, quizUrl, reportUrl, payload });

  const from = env.RESEND_FROM?.trim() || 'Five One <resultado5ministerios@fiveonemovement.com>';
  const replyTo = contact.email || env.RESEND_REPLY_TO || 'escolafiveone@gmail.com';

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: 'escolafiveone@gmail.com',
        subject: `[Five One] Nova solicitação – ${serviceLabel}`,
        html,
        text,
        reply_to: replyTo,
      }),
    });
  } catch (err) {
    console.warn('[service-request] falha ao enviar e-mail interno', err);
  }
}

function renderInternalText({
  serviceLabel,
  church,
  contact,
  quizUrl,
  reportUrl,
  payload,
}: {
  serviceLabel: string;
  church: { slug: string; name: string };
  contact: Contact;
  quizUrl: string;
  reportUrl: string;
  payload: Record<string, any>;
}) {
  const lines = [
    `Nova solicitação recebida: ${serviceLabel}`,
    `Igreja: ${church.name} (slug: ${church.slug})`,
    `Responsável: ${contact.name}`,
    `E-mail: ${contact.email}`,
    `Telefone: ${contact.phone}`,
    `Teste: ${quizUrl}`,
    `Relatório: ${reportUrl}`,
    '',
    'Respostas do formulário:',
  ];

  const answers = payload?.form || {};
  Object.entries(answers).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    lines.push(`- ${key}: ${String(value)}`);
  });

  return lines.join('\n');
}

function renderInternalHtml({
  serviceLabel,
  church,
  contact,
  quizUrl,
  reportUrl,
  payload,
}: {
  serviceLabel: string;
  church: { slug: string; name: string };
  contact: Contact;
  quizUrl: string;
  reportUrl: string;
  payload: Record<string, any>;
}) {
  const answers = payload?.form || {};
  const rows = Object.entries(answers)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(
      ([key, value]) => `
        <tr>
          <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;text-transform:capitalize;color:#1e293b;">${escapeHtml(
            key.replace(/_/g, ' ')
          )}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;color:#0f172a;">${escapeHtml(String(value))}</td>
        </tr>`
    )
    .join('');

  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;color:#0f172a;">
      <h2 style="margin:0 0 12px;font-size:22px;">Nova solicitação – ${escapeHtml(serviceLabel)}</h2>
      <p style="margin:0 0 6px;">Igreja: <strong>${escapeHtml(church.name)}</strong> (slug: ${escapeHtml(church.slug)})</p>
      <p style="margin:0 0 6px;">Responsável: <strong>${escapeHtml(contact.name)}</strong> | ${escapeHtml(contact.email)} | ${escapeHtml(contact.phone)}</p>
      <p style="margin:0 0 10px;">Links rápidos: <a href="${quizUrl}">Teste</a> • <a href="${reportUrl}">Relatório</a></p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#f8fafc;">
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function normalizeNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  const parsed = Number(String(value).replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function escapeHtml(input: string) {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...CORS_HEADERS },
  });
}

