import { supabase } from "../lib/supabaseClient";

export type ProgressRow = {
  user_id: string;
  video_id: string;
  last_at: string; // ISO string
  watched_seconds: number;
  duration_seconds: number | null;
  title: string;
  thumbnail: string | null;
};

export async function fetchUserProgress(userId: string, limit = 20): Promise<ProgressRow[]> {
  const { data, error } = await supabase
    .from("user_progress")
    .select("user_id, video_id, last_at, watched_seconds, duration_seconds, title, thumbnail")
    .eq("user_id", userId)
    .order("last_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function upsertProgress(row: ProgressRow): Promise<void> {
  const { error } = await supabase
    .from("user_progress")
    .upsert(row, { onConflict: "user_id,video_id" });
  if (error) throw error;
}

export async function deleteAllProgressForUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_progress')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deleteProgressExceptForUser(userId: string, keepVideoIds: string[]): Promise<void> {
  let query = supabase
    .from('user_progress')
    .delete()
    .eq('user_id', userId);

  if (keepVideoIds.length) {
    const formatted = `(${keepVideoIds.map((id) => `"${id.replace(/"/g, '\\"')}"`).join(',')})`;
    query = query.not('video_id', 'in', formatted);
  }

  const { error } = await query;
  if (error) throw error;
}

export async function deleteProgressForUserVideo(userId: string, videoId: string): Promise<void> {
  const { error } = await supabase
    .from('user_progress')
    .delete()
    .eq('user_id', userId)
    .eq('video_id', videoId);
  if (error) throw error;
}

export function toLocalRow(row: any): ProgressRow {
  return {
    user_id: row.user_id,
    video_id: row.video_id,
    last_at: row.last_at,
    watched_seconds: Number(row.watched_seconds || 0),
    duration_seconds: row.duration_seconds ? Number(row.duration_seconds) : null,
    title: row.title || "",
    thumbnail: row.thumbnail || null,
  };
}
