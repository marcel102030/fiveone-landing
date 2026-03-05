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

// Se o banco não tiver o relacionamento `video_comment -> platform_user_profile`,
// a consulta com embed retorna 400. Cacheamos esse suporte para evitar flood no console/rede.
let supportsCommentProfileJoin: boolean | null = null;

export async function fetchComments(videoId: string): Promise<VideoComment[]> {
  const run = (fields: string) =>
    supabase
      .from('video_comment')
      .select(fields)
      .eq('video_id', videoId)
      .order('created_at', { ascending: true });

  if (supportsCommentProfileJoin === false) {
    const fallback = await run('id,user_id,video_id,text,created_at,likes,parent_id');
    if (fallback.error) throw fallback.error;
    return (fallback.data || []) as any;
  }

  // Tenta trazer o perfil junto (requer FK/relationship configurado no banco).
  const withProfile = await run(
    'id,user_id,video_id,text,created_at,likes,parent_id,profile:platform_user_profile(display_name,first_name,last_name,avatar_url)',
  );

  if (!withProfile.error) {
    supportsCommentProfileJoin = true;
    return ((withProfile.data || []) as any) satisfies VideoComment[];
  }

  // Fallback: se não existir relacionamento/colunas, retorna comentários sem profile
  // (evita 400 e não quebra a tela do player).
  const message = String(withProfile.error.message || '');
  const looksLikeRelationshipError =
    message.toLowerCase().includes('relationship') ||
    message.toLowerCase().includes('could not find') ||
    message.toLowerCase().includes('failed to parse') ||
    message.toLowerCase().includes('column') ||
    withProfile.error.code === 'PGRST200';

  if (!looksLikeRelationshipError) throw withProfile.error;

  supportsCommentProfileJoin = false;
  console.warn('fetchComments: fallback sem profile por incompatibilidade no banco:', withProfile.error);
  const fallback = await run('id,user_id,video_id,text,created_at,likes,parent_id');
  if (fallback.error) throw fallback.error;
  return (fallback.data || []) as any;
}

export async function addComment(userId: string, videoId: string, text: string, parentId?: string | null): Promise<void> {
  const payload: Record<string, any> = { user_id: userId, video_id: videoId, text, likes: 0 };
  if (parentId) payload.parent_id = parentId;
  const { error } = await supabase.from('video_comment').insert(payload);
  if (error) throw error;
}

export async function likeComment(id: string): Promise<void> {
  const { error } = await supabase.rpc("inc_comment_like", { cid: id });
  if (!error) return;

  // Fallback (não-atômico) caso a RPC não exista no banco.
  try {
    const { data, error: readError } = await supabase
      .from("video_comment")
      .select("likes")
      .eq("id", id)
      .maybeSingle();
    if (readError || !data) return;
    const nextLikes = Number((data as any).likes || 0) + 1;
    await supabase.from("video_comment").update({ likes: nextLikes }).eq("id", id);
  } catch {
    // mantém o incremento otimista na UI
  }
}
