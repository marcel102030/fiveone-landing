import { supabase } from "../../../shared/lib/supabaseClient";

export type PlatformUser = {
  email: string;
  name?: string | null;
  formation?: FormationKey; // mantido para compatibilidade
  role?: PlatformUserRole;
  member_id?: string | null;
  created_at?: string;
};

/** Qualquer ID de curso/ministério (string genérica). Mantido por compatibilidade de importações. */
export type FormationKey = string;

/** ID genérico de curso */
export type CourseId = string;

/** @deprecated Use ministries from usePlatformContent() instead. Kept for legacy imports. */
export const FORMATION_KEYS: FormationKey[] = [];

// ── Matrículas ──────────────────────────────────────────────────────────────

/** Retorna os IDs dos cursos em que o aluno está matriculado. */
export async function getEnrollments(email: string): Promise<CourseId[]> {
  const { data, error } = await supabase
    .from('platform_enrollment')
    .select('course_id')
    .eq('user_email', email.toLowerCase());
  if (error) throw error;
  return (data || []).map((r: any) => r.course_id as CourseId);
}

/** Matricula um aluno em um curso. Idempotente (ON CONFLICT DO NOTHING via upsert). */
export async function enrollUser(email: string, courseId: CourseId): Promise<void> {
  const { error } = await supabase
    .from('platform_enrollment')
    .upsert({ user_email: email.toLowerCase(), course_id: courseId }, { onConflict: 'user_email,course_id' });
  if (error) throw error;
}

/** Remove a matrícula de um aluno em um curso. */
export async function unenrollUser(email: string, courseId: CourseId): Promise<void> {
  const { error } = await supabase
    .from('platform_enrollment')
    .delete()
    .eq('user_email', email.toLowerCase())
    .eq('course_id', courseId);
  if (error) throw error;
}

/** Substitui todas as matrículas de um aluno pela lista fornecida. */
export async function setEnrollments(email: string, courseIds: CourseId[]): Promise<void> {
  const lEmail = email.toLowerCase();
  const { error: delError } = await supabase
    .from('platform_enrollment')
    .delete()
    .eq('user_email', lEmail);
  if (delError) throw delError;
  if (!courseIds.length) return;
  const rows = courseIds.map(course_id => ({ user_email: lEmail, course_id }));
  const { error } = await supabase.from('platform_enrollment').insert(rows);
  if (error) throw error;
}

/** Retorna mapa email → courseIds[] para uma lista de emails (batch). */
export async function getEnrollmentsBatch(emails: string[]): Promise<Record<string, CourseId[]>> {
  if (!emails.length) return {};
  const { data, error } = await supabase
    .from('platform_enrollment')
    .select('user_email,course_id')
    .in('user_email', emails.map(e => e.toLowerCase()));
  if (error) throw error;
  const out: Record<string, CourseId[]> = {};
  for (const r of (data || []) as any[]) {
    if (!out[r.user_email]) out[r.user_email] = [];
    out[r.user_email].push(r.course_id);
  }
  return out;
}

/**
 * @deprecated Use ministries from usePlatformContent() to get course labels.
 * Returns the raw key as-is (falls back to empty string).
 */
export function toFormationLabel(key: FormationKey | string | null | undefined): string {
  return String(key || '');
}

/**
 * Normalises any course string to uppercase.
 * Returns empty string if null/undefined.
 */
export function toFormationKey(s: string | null | undefined): string {
  return String(s || '').toUpperCase();
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
      formation: u.formation || null,
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

  // When filtering by course, resolve via platform_enrollment first
  let allowedEmails: string[] | null = null;
  if (formation && formation !== 'ALL') {
    const { data: enrollData } = await supabase
      .from('platform_enrollment')
      .select('user_email')
      .eq('course_id', formation);
    allowedEmails = (enrollData || []).map((r: any) => r.user_email as string);
    if (!allowedEmails.length) return { rows: [], total: 0 };
  }

  let query = supabase
    .from('platform_user')
    .select('email,name,created_at,formation,role,member_id,is_active', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (q && q.trim()) query = query.ilike('email', `%${q.trim()}%`);
  if (allowedEmails !== null) query = query.in('email', allowedEmails);
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

// Admin management
export type AdminUser = { email: string; name: string | null; created_at: string | null };

export async function listAdmins(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('platform_user')
    .select('email,name,created_at')
    .eq('role', 'ADMIN')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as AdminUser[];
}

export async function createAdmin(email: string, password: string, name?: string | null): Promise<void> {
  const res = await fetch('/api/create-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.toLowerCase(), password, name: name || null }),
  });
  const data = await res.json().catch(() => ({ ok: false, error: 'Resposta inválida do servidor' })) as { ok: boolean; error?: string };
  if (!data.ok) throw new Error(data.error || 'Erro ao criar administrador');
}

export async function revokeAdmin(email: string): Promise<void> {
  const { error } = await supabase
    .from('platform_user')
    .update({ role: 'STUDENT' })
    .eq('email', email.toLowerCase());
  if (error) throw error;
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

export async function setUserCommentStatus(id: string, status: 'pendente'|'aprovado'|'rejeitado'): Promise<void> {
  const { error } = await supabase.from('platform_lesson_comment').update({ status }).eq('id', id);
  if (error) throw error;
}

/** Counts of active enrollments per course_id. */
export type CourseCounts = Record<string, number>;

/** Returns enrollment counts grouped by course_id from platform_enrollment. */
export async function getCourseCounts(): Promise<CourseCounts> {
  const { data, error } = await supabase
    .from('platform_enrollment')
    .select('course_id');
  if (error) throw error;
  const out: CourseCounts = {};
  for (const row of (data || []) as any[]) {
    const key = String(row.course_id || '');
    if (key) out[key] = (out[key] || 0) + 1;
  }
  return out;
}

/** @deprecated Use getCourseCounts() instead. */
export async function getFormationCounts(): Promise<CourseCounts> {
  return getCourseCounts();
}
