import { supabase } from "../lib/supabaseClient";

export type ReactionType = 'like' | 'dislike';

export type ReactionState = {
  selected: ReactionType | null;
  counts: { like: number; dislike: number };
};

export async function fetchReactionState(userId: string | null, videoId: string): Promise<ReactionState> {
  const counts = { like: 0, dislike: 0 };
  try {
    const [likeRes, dislikeRes] = await Promise.all([
      supabase
        .from("video_reaction")
        .select("reaction", { count: "exact", head: true })
        .eq("video_id", videoId)
        .eq("reaction", "like"),
      supabase
        .from("video_reaction")
        .select("reaction", { count: "exact", head: true })
        .eq("video_id", videoId)
        .eq("reaction", "dislike"),
    ]);
    if (!likeRes.error && typeof likeRes.count === "number") counts.like = likeRes.count;
    if (!dislikeRes.error && typeof dislikeRes.count === "number") counts.dislike = dislikeRes.count;
  } catch {
    // mantém contadores em 0 para evitar travar UI
  }

  let selected: ReactionType | null = null;
  if (userId) {
    const { data: me, error: errMe } = await supabase
      .from('video_reaction')
      .select('reaction')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .maybeSingle();
    if (!errMe && me) {
      const key = (me as any).reaction as ReactionType;
      if (key === 'like' || key === 'dislike') selected = key;
    }
  }

  return { selected, counts };
}

export async function setReaction(userId: string, videoId: string, reaction: ReactionType | null): Promise<void> {
  if (!userId) return;
  if (reaction === null) {
    await supabase
      .from('video_reaction')
      .delete()
      .eq('user_id', userId)
      .eq('video_id', videoId);
    return;
  }
  await supabase
    .from("video_reaction")
    .upsert({ user_id: userId, video_id: videoId, reaction }, { onConflict: "user_id,video_id" });
}
