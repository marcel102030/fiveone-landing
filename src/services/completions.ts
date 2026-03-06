import { supabase } from "../lib/supabaseClient";

export async function upsertCompletion(userId: string, videoId: string): Promise<void> {
  await supabase.from('platform_lesson_completion').upsert({ user_id: userId, lesson_id: videoId, completed_at: new Date().toISOString() });
}

export async function fetchCompletion(userId: string, videoId: string): Promise<boolean> {
  const { data } = await supabase.from('platform_lesson_completion').select('user_id').eq('user_id', userId).eq('lesson_id', videoId).maybeSingle();
  return !!data;
}

export async function fetchCompletionsForUser(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('platform_lesson_completion')
    .select('lesson_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((r: any) => r.lesson_id);
}

export async function deleteCompletion(userId: string, videoId: string): Promise<void> {
  const { error } = await supabase
    .from('platform_lesson_completion')
    .delete()
    .eq('user_id', userId)
    .eq('lesson_id', videoId);
  if (error) throw error;
}

export async function deleteAllCompletionsForUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('platform_lesson_completion')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}
