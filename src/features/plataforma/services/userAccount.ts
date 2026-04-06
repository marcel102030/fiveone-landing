import { supabase } from "../../../shared/lib/supabaseClient";

export type PlatformUser = {
  email: string;
  name?: string | null;
  formation?: FormationKey; // APOSTOLO | PROFETA | EVANGELISTA | PASTOR | MESTRE
  role?: PlatformUserRole;
  member_id?: string | null;
  created_at?: string;
};

export type FormationKey = 'APOSTOLO' | 'PROFETA' | 'EVANGELISTA' | 'PASTOR' | 'MESTRE';

/** Ordered list of all formation keys — use this constant instead of repeating the array inline. */
export const FORMATION_KEYS: FormationKey[] = ['APOSTOLO', 'PROFETA', 'EVANGELISTA', 'PASTOR', 'MESTRE'];

/** Returns a human-readable Portuguese label for a FormationKey. */
export function toFormationLabel(key: FormationKey | string | null | undefined): string {
  switch (String(key || 'MESTRE').toUpperCase()) {
    case 'APOSTOLO':    return 'Apóstolo';
    case 'PROFETA':     return 'Profeta';
    case 'EVANGELISTA': return 'Evangelista';
    case 'PASTOR':      return 'Pastor';
    case 'MESTRE':      return 'Mestre';
    default:            return String(key || 'Mestre');
  }
}

/**
 * Normalises any ministry string to a FormationKey (uppercase).
 * Use this when bridging between platform_user.formation (UPPERCASE)
 * and the fivefold_ministry DB enum used in rede tables (lowercase).
 */
export function toFormationKey(s: string | null | undefined): FormationKey {
  const upper = String(s || 'MESTRE').toUpperCase() as FormationKey;
  return FORMATION_KEYS.includes(upper) ? upper : 'MESTRE';
}

export type PlatformUserRole = 'ADMIN' | 'MEMBER' | 'STUDENT';
export type PlatformUserCreateInput = PlatformUser & { password: string };

export async function createUser(u: PlatformUserCreateInput): Promise<void> {
  // Usa a Admin API via Cloudflare Function — jamais usar supabase.auth.signUp()
  // no painel admin, pois esse método é para auto-cadastro e falha com 422 para
  // e-mails já existentes no Auth (mesmo que seja o próprio admin tentando criar outro).
  const res = await fetch('/api/create-student', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: u.email.toLowerCase(),
      password: u.password,
      name: u.name || null,
      formation: u.formation || 'MESTRE',
    }),
  });
  const data = await res.json().catch(() => ({ ok: false, error: 'Resposta inválida do servidor' })) as { ok: boolean; error?: string };
  if (!data.ok) throw new Error(data.error || 'Erro ao criar aluno');
}

export async function verifyUser(email: string, password: string): Promise<boolean> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) return false;
  return true;
}

export type PlatformUserListItem = {
  email: string;
  name: string | null;
  created_at: string | null;
  formation?: FormationKey;
  role?: PlatformUserRole | null;
  member_id?: string | null;
  is_active?: boolean | null;
};

export async function listUsers(q?: string): Promise<PlatformUserListItem[]> {
  let query = supabase
    .from('platform_user')
    .select('email,name,created_at,formation,role,member_id')
    .order('created_at', { ascending: false });
  if (q && q.trim()) {
    query = query.ilike('email', `%${q.trim()}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as PlatformUserListItem[];
}

export type ListUsersPage = {
  rows: PlatformUserListItem[];
  total: number;
};

export async function listUsersPage(params: { q?: string; page: number; pageSize: number; formation?: FormationKey | 'ALL' }): Promise<ListUsersPage> {
  const { q, page, pageSize, formation } = params;
  const from = page * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from('platform_user')
    .select('email,name,created_at,formation,role,member_id,is_active', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (q && q.trim()) query = query.ilike('email', `%${q.trim()}%`);
  if (formation && formation !== 'ALL') query = query.eq('formation', formation);
  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: (data || []) as PlatformUserListItem[], total: count || 0 };
}

export async function emailExists(email: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('platform_user')
    .select('email', { count: 'exact', head: true })
    .eq('email', email.toLowerCase());
  if (error) throw error;
  return (count || 0) > 0;
}

export async function updateUserEmail(oldEmail: string, newEmail: string): Promise<void> {
  const { error } = await supabase
    .from('platform_user')
    .update({ email: newEmail.toLowerCase() })
    .eq('email', oldEmail.toLowerCase());
  if (error) throw error;
}

export async function updateUserRole(email: string, role: PlatformUserRole): Promise<void> {
  const { error } = await supabase
    .from('platform_user')
    .update({ role })
    .eq('email', email.toLowerCase());
  if (error) throw error;
}

export async function updateUserMemberLink(email: string, memberId: string | null): Promise<void> {
  const { error } = await supabase
    .from('platform_user')
    .update({ member_id: memberId })
    .eq('email', email.toLowerCase());
  if (error) throw error;
}

export async function updateUserName(email: string, name: string | null): Promise<void> {
  const { error } = await supabase
    .from('platform_user')
    .update({ name })
    .eq('email', email.toLowerCase());
  if (error) throw error;
}

export async function resetUserPassword(email: string, newPassword: string): Promise<void> {
  // Usa a Admin API via Cloudflare Function — supabase.auth.updateUser() só
  // alteraria a senha do usuário ATUALMENTE LOGADO, não do aluno alvo.
  const res = await fetch('/api/reset-student-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.toLowerCase(), password: newPassword }),
  });
  const data = await res.json().catch(() => ({ ok: false, error: 'Resposta inválida do servidor' })) as { ok: boolean; error?: string };
  if (!data.ok) throw new Error(data.error || 'Erro ao redefinir senha');
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function deleteUser(email: string): Promise<void> {
  const { error } = await supabase
    .from('platform_user')
    .delete()
    .eq('email', email.toLowerCase());
  if (error) throw error;
}

export async function setUserActive(email: string, active: boolean): Promise<void> {
  const { error } = await supabase
    .from('platform_user')
    .update({ is_active: active })
    .eq('email', email.toLowerCase());
  if (error) throw error;
}

export async function setUsersActive(emails: string[], active: boolean): Promise<void> {
  if (!emails.length) return;
  const { error } = await supabase.from('platform_user').update({ is_active: active }).in('email', emails.map(e => e.toLowerCase()));
  if (error) throw error;
}

export async function updateUsersFormation(emails: string[], formation: FormationKey): Promise<void> {
  if (!emails.length) return;
  const { error } = await supabase.from('platform_user').update({ formation }).in('email', emails.map(e=>e.toLowerCase()));
  if (error) throw error;
}

export async function resetUsersPasswords(emails: string[], newPassword: string): Promise<void> {
  if (!emails.length) return;
  const { error } = await supabase.from('platform_user').update({ password: newPassword }).in('email', emails.map(e=>e.toLowerCase()));
  if (error) throw error;
}

export async function deleteUsers(emails: string[]): Promise<void> {
  if (!emails.length) return;
  const { error } = await supabase.from('platform_user').delete().in('email', emails.map(e=>e.toLowerCase()));
  if (error) throw error;
}

// Invitations
export type Invite = { id: string; email: string; token: string; formation: FormationKey; expires_at: string; used_at: string | null; created_at: string };
export async function createInvite(email: string, formation: FormationKey, daysValid: number): Promise<Invite> {
  const token = cryptoRandom(32);
  const expires = new Date(Date.now() + daysValid*24*60*60*1000).toISOString();
  const { data, error } = await supabase.from('platform_user_invite').insert({ email: email.toLowerCase(), formation, token, expires_at: expires }).select().single();
  if (error) throw error;
  return data as Invite;
}

function cryptoRandom(len: number): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomValues = crypto.getRandomValues(new Uint32Array(len));
  return Array.from(randomValues, v => alphabet[v % alphabet.length]).join('');
}

export async function updateUserFormation(email: string, formation: FormationKey): Promise<void> {
  const { error } = await supabase
    .from('platform_user')
    .update({ formation })
    .eq('email', email.toLowerCase());
  if (error) throw error;
}

export async function getUserByEmail(email: string): Promise<PlatformUserListItem | null> {
  const { data, error } = await supabase
    .from('platform_user')
    .select('email,name,created_at,formation,role,member_id')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return (data as any) || null;
}

// Comments API (platform_lesson_comment)
export type UserComment = { id: string; lesson_id: string; text: string; likes: number | null; created_at: string; status?: 'pendente' | 'aprovado' };

export async function getUserComments(email: string): Promise<UserComment[]> {
  const { data, error } = await supabase
    .from('platform_lesson_comment')
    .select('id,lesson_id,text,likes,created_at,status')
    .eq('user_id', email.toLowerCase())
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as UserComment[];
}

export async function deleteUserComment(id: string): Promise<void> {
  const { error } = await supabase.from('platform_lesson_comment').delete().eq('id', id);
  if (error) throw error;
}

export async function setUserCommentStatus(id: string, status: 'pendente'|'aprovado'): Promise<void> {
  const { error } = await supabase.from('platform_lesson_comment').update({ status }).eq('id', id);
  if (error) throw error;
}

export type FormationCounts = { APOSTOLO: number; PROFETA: number; EVANGELISTA: number; PASTOR: number; MESTRE: number };

/** Single-query formation count via DB aggregation — replaces 5 parallel COUNT requests. */
export async function getFormationCounts(): Promise<FormationCounts> {
  const { data, error } = await supabase.rpc('get_formation_counts');
  if (error) throw error;
  const out = Object.fromEntries(FORMATION_KEYS.map(k => [k, 0])) as FormationCounts;
  for (const row of (data || [])) {
    const key = (row.formation as string | null)?.toUpperCase() as FormationKey | undefined;
    if (key && key in out) out[key] = Number(row.cnt);
  }
  return out;
}
