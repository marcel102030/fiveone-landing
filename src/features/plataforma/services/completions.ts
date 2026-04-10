import { supabase } from "../../../shared/lib/supabaseClient";

/**
 * Todas as operações usam RPCs SECURITY DEFINER — funcionam para qualquer
 * role (anon ou authenticated), sem depender de sessão Supabase Auth.
 * O RLS nas tabelas bloquearia acesso direto para usuários sem sessão Supabase.
 */

export async function upsertCompletion(userId: string, videoId: string): Promise<void> {
  const { error } = await supabase.rpc('upsert_completion_safe', {
    p_user_id: userId,
    p_lesson_id: videoId,
  });
  if (error) throw error;
}

export async function fetchCompletion(userId: string, videoId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('fetch_user_completions', {
    p_user_id: userId,
  });
  if (error) return false;
  return (data || []).some((r: any) => r.lesson_id === videoId);
}

export async function fetchCompletionsForUser(userId: string): Promise<string[]> {
  const { data, error } = await supabase.rpc('fetch_user_completions', {
    p_user_id: userId,
  });
  if (error) throw error;
  return (data || []).map((r: any) => r.lesson_id);
}

export async function deleteCompletion(userId: string, videoId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_completion_safe', {
    p_user_id: userId,
    p_lesson_id: videoId,
  });
  if (error) throw error;
}

export async function deleteAllCompletionsForUser(userId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_all_completions_safe', {
    p_user_id: userId,
  });
  if (error) throw error;
}
