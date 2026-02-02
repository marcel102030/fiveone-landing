import { supabase } from "../lib/supabaseClient";

export type PlatformUser = {
  email: string;
  password: string; // plain for now; recommend Supabase Auth in production
  name?: string | null;
  formation?: FormationKey; // APOSTOLO | PROFETA | EVANGELISTA | PASTOR | MESTRE
  role?: PlatformUserRole;
  member_id?: string | null;
  created_at?: string;
};

export type FormationKey = 'APOSTOLO' | 'PROFETA' | 'EVANGELISTA' | 'PASTOR' | 'MESTRE';
export type PlatformUserRole = 'ADMIN' | 'MEMBER' | 'STUDENT';

export async function createUser(u: PlatformUser): Promise<void> {
  const { error } = await supabase.from('platform_user').insert({
    email: u.email.toLowerCase(),
    password: u.password,
    name: u.name || null,
    formation: u.formation || 'MESTRE',
    role: u.role || 'STUDENT',
    member_id: u.member_id || null,
  });
  if (error) throw error;
}

export async function verifyUser(email: string, password: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('platform_user')
    .select('email')
    .eq('email', email.toLowerCase())
    .eq('password', password)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export type PlatformUserListItem = {
  email: string;
  name: string | null;
  created_at: string | null;
  formation?: FormationKey;
  role?: PlatformUserRole | null;
  member_id?: string | null;
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
    .select('email,name,created_at,formation,role,member_id', { count: 'exact' })
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
  const { error } = await supabase
    .from('platform_user')
    .update({ password: newPassword })
    .eq('email', email.toLowerCase());
  if (error) throw error;
}

export async function deleteUser(email: string): Promise<void> {
  const { error } = await supabase
    .from('platform_user')
    .delete()
    .eq('email', email.toLowerCase());
  if (error) throw error;
}

// optional active flag helpers – will no-op if column doesn't exist
export async function setUserActive(email: string, active: boolean): Promise<void> {
  try {
    const { error } = await supabase
      .from('platform_user')
      .update({ active })
      .eq('email', email.toLowerCase());
    if (error) throw error;
  } catch { /* ignore if column doesn't exist */ }
}

// Bulk helpers
export async function setUsersActive(emails: string[], active: boolean): Promise<void> {
  if (!emails.length) return;
  const { error } = await supabase.from('platform_user').update({ active }).in('email', emails.map(e=>e.toLowerCase()));
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
  const { data, error } = await supabase.from('user_invite').insert({ email: email.toLowerCase(), formation, token, expires_at: expires }).select().single();
  if (error) throw error;
  return data as Invite;
}

function cryptoRandom(len: number): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i=0;i<len;i++) out += alphabet[Math.floor(Math.random()*alphabet.length)];
  return out;
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

// Comments API (video_comment)
export type UserComment = { id: string; video_id: string; text: string; likes: number | null; created_at: string; status?: 'pendente' | 'aprovado' };

export async function getUserComments(email: string): Promise<UserComment[]> {
  const { data, error } = await supabase
    .from('video_comment')
    .select('id,video_id,text,likes,created_at,status')
    .eq('user_id', email.toLowerCase())
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as UserComment[];
}

export async function deleteUserComment(id: string): Promise<void> {
  const { error } = await supabase.from('video_comment').delete().eq('id', id);
  if (error) throw error;
}

export async function setUserCommentStatus(id: string, status: 'pendente'|'aprovado'): Promise<void> {
  const { error } = await supabase.from('video_comment').update({ status }).eq('id', id);
  if (error) throw error;
}

export type FormationCounts = { APOSTOLO: number; PROFETA: number; EVANGELISTA: number; PASTOR: number; MESTRE: number };
export async function getFormationCounts(): Promise<FormationCounts> {
  const keys: FormationKey[] = ['APOSTOLO','PROFETA','EVANGELISTA','PASTOR','MESTRE'];
  const entries = await Promise.all(keys.map(async (k) => {
    const { count, error } = await supabase
      .from('platform_user')
      .select('email', { count: 'exact', head: true })
      .eq('formation', k);
    if (error) throw error;
    return [k, count || 0] as const;
  }));
  const out: any = { APOSTOLO:0, PROFETA:0, EVANGELISTA:0, PASTOR:0, MESTRE:0 };
  for (const [k,v] of entries) out[k] = v;
  return out as FormationCounts;
}
