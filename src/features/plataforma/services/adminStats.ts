import { supabase } from "../../../shared/lib/supabaseClient";

export interface AdminDashboardStats {
  totalAlunos: number;
  novos30d: number;
  totalAulas: number;
  totalConclusoes: number;
  comentariosPendentes: number;
  totalCertificados: number;
}

export interface TopLesson {
  id: string;
  title: string;
  views_count: number;
  completion_count: number;
}

export interface RecentUser {
  email: string;
  name: string | null;
  formation: string | null;
  created_at: string;
}

export interface PendingComment {
  id: string;
  user_id: string;
  lesson_id: string;
  text: string;
  created_at: string;
  parent_id: string | null;
}

export async function fetchDashboardStats(): Promise<AdminDashboardStats> {
  const [
    { count: totalAlunos },
    { count: novos30d },
    { count: totalAulas },
    { count: totalConclusoes },
    { count: comentariosPendentes },
    { count: totalCertificados },
  ] = await Promise.all([
    supabase.from('platform_user').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('platform_user').select('*', { count: 'exact', head: true }).eq('is_active', true).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('platform_lesson').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('platform_lesson_completion').select('*', { count: 'exact', head: true }),
    supabase.from('platform_lesson_comment').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('platform_certificate').select('*', { count: 'exact', head: true }),
  ]);

  return {
    totalAlunos: totalAlunos ?? 0,
    novos30d: novos30d ?? 0,
    totalAulas: totalAulas ?? 0,
    totalConclusoes: totalConclusoes ?? 0,
    comentariosPendentes: comentariosPendentes ?? 0,
    totalCertificados: totalCertificados ?? 0,
  };
}

export async function fetchTopLessons(limit = 5): Promise<TopLesson[]> {
  const { data } = await supabase
    .from('platform_lesson')
    .select('id, title, views_count, completion_count')
    .eq('status', 'published')
    .order('views_count', { ascending: false })
    .limit(limit);
  return (data ?? []) as TopLesson[];
}

export async function fetchRecentUsers(limit = 5): Promise<RecentUser[]> {
  const { data } = await supabase
    .from('platform_user')
    .select('email, name, formation, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as RecentUser[];
}

export async function fetchPendingComments(): Promise<PendingComment[]> {
  const { data } = await supabase
    .from('platform_lesson_comment')
    .select('id, user_id, lesson_id, text, created_at, parent_id')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  return (data ?? []) as PendingComment[];
}

export async function approveComment(id: string): Promise<void> {
  await supabase.from('platform_lesson_comment').update({ status: 'approved' }).eq('id', id);
}

export async function rejectComment(id: string): Promise<void> {
  await supabase.from('platform_lesson_comment').update({ status: 'rejected' }).eq('id', id);
}

export async function issueCertificate(userId: string, ministryId: string): Promise<void> {
  const verifyCode = crypto.randomUUID();
  const { error } = await supabase.from('platform_certificate').insert({
    user_id: userId,
    ministry_id: ministryId,
    issued_at: new Date().toISOString(),
    verify_code: verifyCode,
  });
  if (error) throw error;
}

export async function fetchCertificates() {
  const { data } = await supabase
    .from('platform_certificate')
    .select('id, user_id, ministry_id, issued_at, verify_code')
    .order('issued_at', { ascending: false });
  return data ?? [];
}
