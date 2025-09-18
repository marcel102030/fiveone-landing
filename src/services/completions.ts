import { supabase } from "../lib/supabaseClient";

export async function upsertCompletion(userId: string, videoId: string): Promise<void> {
  await supabase.from('video_completion').upsert({ user_id: userId, video_id: videoId, completed_at: new Date().toISOString() });
}

export async function fetchCompletion(userId: string, videoId: string): Promise<boolean> {
  const { data } = await supabase.from('video_completion').select('user_id').eq('user_id', userId).eq('video_id', videoId).maybeSingle();
  return !!data;
}

export async function fetchCompletionsForUser(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('video_completion')
    .select('video_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((r: any) => r.video_id);
}
