import { supabase } from "../lib/supabaseClient";

export type VideoComment = {
  id: string;
  user_id: string;
  video_id: string;
  text: string;
  created_at: string;
  likes: number;
  parent_id?: string | null;
  profile?: {
    display_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
  } | null;
};

export async function fetchComments(videoId: string): Promise<VideoComment[]> {
  const { data, error } = await supabase
    .from('video_comment')
    .select('id,user_id,video_id,text,created_at,likes,parent_id,profile:platform_user_profile(display_name,first_name,last_name,avatar_url)')
    .eq('video_id', videoId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as any;
}

export async function addComment(userId: string, videoId: string, text: string, parentId?: string | null): Promise<void> {
  const payload: Record<string, any> = { user_id: userId, video_id: videoId, text, likes: 0 };
  if (parentId) payload.parent_id = parentId;
  const { error } = await supabase.from('video_comment').insert(payload);
  if (error) throw error;
}

export async function likeComment(id: string): Promise<void> {
  await supabase.rpc('inc_comment_like', { cid: id });
}
