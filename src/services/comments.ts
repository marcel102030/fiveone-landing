import { supabase } from "../lib/supabaseClient";

export type VideoComment = {
  id: string;
  user_id: string;
  video_id: string;
  text: string;
  created_at: string;
  likes: number;
};

export async function fetchComments(videoId: string): Promise<VideoComment[]> {
  const { data, error } = await supabase
    .from('video_comment')
    .select('id,user_id,video_id,text,created_at,likes')
    .eq('video_id', videoId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as any;
}

export async function addComment(userId: string, videoId: string, text: string): Promise<void> {
  const { error } = await supabase.from('video_comment').insert({ user_id: userId, video_id: videoId, text, likes: 0 });
  if (error) throw error;
}

export async function likeComment(id: string): Promise<void> {
  await supabase.rpc('inc_comment_like', { cid: id });
}

