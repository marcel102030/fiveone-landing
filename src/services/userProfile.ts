import { supabase } from "../lib/supabaseClient";

export type UserProfileDetails = {
  user_email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  bio: string | null;
  cpf: string | null;
  phone: string | null;
  gender: string | null;
  birthdate: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zip_code: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  tiktok: string | null;
  avatar_url: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type MentionProfile = {
  email: string;
  name: string;
  avatarUrl: string | null;
  initials: string;
};

const TABLE = "platform_user_profile";
const AVATAR_BUCKET = "profile-logos";

let avatarBucketEnsured = false;

async function ensureAvatarBucket(): Promise<void> {
  if (avatarBucketEnsured) return;
  const { error } = await supabase.storage.from(AVATAR_BUCKET).list('', { limit: 1 });
  if (error) {
    if (error.message?.toLowerCase().includes('not found')) {
      throw new Error(
        `Bucket de storage "${AVATAR_BUCKET}" não encontrado. Crie-o no Supabase (público) ou atualize o nome no código.`,
      );
    }
    throw error;
  }
  avatarBucketEnsured = true;
}

async function uploadAvatarViaFunction(email: string, file: File): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const formData = new FormData();
  formData.set('email', normalized);
  formData.set('file', file, file.name || 'avatar.png');

  const response = await fetch('/api/profile-logo-upload', {
    method: 'POST',
    body: formData,
  });

  let data: any = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  }

  if (!response.ok || !data?.ok) {
    const detail = data?.error || response.statusText || 'Upload failed';
    throw new Error(`Erro ao enviar via API protegida: ${detail}`);
  }

  if (!data.url || typeof data.url !== 'string') {
    throw new Error('Resposta inválida ao enviar a logo.');
  }

  return data.url;
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export async function uploadUserAvatar(email: string, file: File): Promise<string> {
  const normalized = email.trim().toLowerCase();

  try {
    return await uploadAvatarViaFunction(normalized, file);
  } catch (apiError: any) {
    // Se a API protegida estiver indisponível (ex.: ambiente local sem Cloudflare Pages),
    // tentamos o caminho antigo direto no Supabase para manter compatibilidade.
    try {
      await ensureAvatarBucket();
      const extension = (() => {
        const fromName = file.name?.split('.').pop();
        if (fromName) return fromName.toLowerCase();
        const fromType = file.type?.split('/').pop();
        return fromType ? fromType.toLowerCase() : 'png';
      })();
      const safeBase = slugify(file.name.replace(/\.[^.]+$/, '')) || 'avatar';
      const path = `${normalized}/${safeBase}-${Date.now()}.${extension}`;
      const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/png',
      });
      if (error) throw error;
      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
      return data.publicUrl;
    } catch {
      throw apiError;
    }
  }
}

function sanitizePayload(payload: Partial<UserProfileDetails>) {
  const entries = Object.entries(payload).map(([key, value]) => {
    if (value === undefined) return [key, null];
    if (typeof value === "string") {
      const trimmed = value.trim();
      return [key, trimmed.length ? trimmed : null];
    }
    return [key, value];
  });
  return Object.fromEntries(entries);
}

export async function getUserProfileDetails(email: string): Promise<UserProfileDetails | null> {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_email", normalized)
    .maybeSingle();
  if (error) throw error;
  return (data as UserProfileDetails | null) || null;
}

export async function searchMentionProfiles(term: string, limit = 6): Promise<MentionProfile[]> {
  const params = new URLSearchParams();
  if (term) params.set('q', term);
  params.set('limit', String(limit));
  const res = await fetch(`/api/profile-mention-search?${params.toString()}`, { method: 'GET' });
  if (!res.ok) {
    throw new Error('Não foi possível buscar alunos para menção.');
  }
  const data = await res.json().catch(() => null);
  if (!data?.ok || !Array.isArray(data.results)) return [];
  return data.results as MentionProfile[];
}

export async function upsertUserProfileDetails(
  email: string,
  payload: Partial<UserProfileDetails>
): Promise<UserProfileDetails> {
  const normalized = email.trim().toLowerCase();
  const now = new Date().toISOString();
  const sanitized = sanitizePayload(payload);
  const request = {
    user_email: normalized,
    ...sanitized,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(request, { onConflict: "user_email" })
    .select("*")
    .single();

  if (error) throw error;
  return data as UserProfileDetails;
}
