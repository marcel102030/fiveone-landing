import { supabase } from "../../../shared/lib/supabaseClient";

export type ProgressRow = {
  user_id: string;
  lesson_id: string;
  last_at: string; // ISO string
  watched_seconds: number;
  duration_seconds: number | null;
  title: string;
  thumbnail: string | null;
};

/**
 * Busca progresso via RPC SECURITY DEFINER — funciona para anon e authenticated.
 * Não depende de sessão Supabase Auth, apenas do user_id (email) customizado.
 */
export async function fetchUserProgress(userId: string, limit = 24): Promise<ProgressRow[]> {
  const { data, error } = await supabase.rpc('fetch_user_progress', {
    p_user_id: userId,
    p_limit: limit,
  });
  if (error) throw error;
  return (data || []) as ProgressRow[];
}

export async function upsertProgress(row: ProgressRow): Promise<void> {
  // Usa RPC com GREATEST para garantir que watched_seconds nunca regride
  // em caso de race condition (dois dispositivos enviando ao mesmo tempo).
  const { error } = await supabase.rpc('upsert_progress_safe', {
    p_user_id:          row.user_id,
    p_lesson_id:        row.lesson_id,
    p_last_at:          row.last_at,
    p_watched_seconds:  row.watched_seconds,
    p_duration_seconds: row.duration_seconds ?? null,
    p_title:            row.title,
    p_thumbnail:        row.thumbnail ?? null,
  });
  if (error) throw error;
}

export async function deleteAllProgressForUser(userId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_user_progress_except', {
    p_user_id: userId,
    p_keep_lesson_ids: null,
  });
  if (error) throw error;
}

export async function deleteProgressExceptForUser(userId: string, keepVideoIds: string[]): Promise<void> {
  const { error } = await supabase.rpc('delete_user_progress_except', {
    p_user_id: userId,
    p_keep_lesson_ids: keepVideoIds.length ? keepVideoIds : null,
  });
  if (error) throw error;
}

export async function deleteProgressForUserVideo(userId: string, videoId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_progress_for_video', {
    p_user_id: userId,
    p_lesson_id: videoId,
  });
  if (error) throw error;
}

export function toLocalRow(row: any): ProgressRow {
  return {
    user_id: row.user_id,
    lesson_id: row.lesson_id,
    last_at: row.last_at,
    watched_seconds: Number(row.watched_seconds || 0),
    duration_seconds: row.duration_seconds ? Number(row.duration_seconds) : null,
    title: row.title || "",
    thumbnail: row.thumbnail || null,
  };
}
