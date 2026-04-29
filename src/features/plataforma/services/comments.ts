import { supabase } from "../../../shared/lib/supabaseClient";

export type CommentStatus = 'pendente' | 'aprovado' | 'reprovado';

export type VideoComment = {
  id: string;
  user_id: string;
  lesson_id: string;
  text: string;
  created_at: string;
  likes: number;
  parent_id?: string | null;
  status?: CommentStatus;
  profile?: {
    display_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
  } | null;
};

// Se o banco não tiver o relacionamento `platform_lesson_comment -> platform_user_profile`,
// a consulta com embed retorna 400. Cacheamos esse suporte para evitar flood no console/rede.
let supportsCommentProfileJoin: boolean | null = null;

/**
 * Busca comentários da aula:
 *   - Sempre traz os aprovados.
 *   - Traz também os pendentes do próprio aluno (`viewerId`), para que ele veja
 *     o comentário recém-postado com um badge "Em revisão" — antes ficava
 *     invisível e dava sensação de que o comentário sumia.
 */
export async function fetchComments(videoId: string, viewerId?: string | null): Promise<VideoComment[]> {
  const buildFilter = (q: any) => {
    const v = (viewerId || '').toLowerCase();
    if (v) {
      // status = 'aprovado' OR (status = 'pendente' AND user_id = v)
      return q.or(`status.eq.aprovado,and(status.eq.pendente,user_id.eq.${v})`);
    }
    return q.eq('status', 'aprovado');
  };

  const run = (fields: string) =>
    buildFilter(
      supabase
        .from('platform_lesson_comment')
        .select(fields)
        .eq('lesson_id', videoId),
    ).order('created_at', { ascending: true });

  if (supportsCommentProfileJoin === false) {
    const fallback = await run('id,user_id,lesson_id,text,created_at,likes,parent_id,status');
    if (fallback.error) throw fallback.error;
    return (fallback.data || []) as any;
  }

  // Tenta trazer o perfil junto (requer FK/relationship configurado no banco).
  const withProfile = await run(
    'id,user_id,lesson_id,text,created_at,likes,parent_id,status,profile:platform_user_profile(display_name,first_name,last_name,avatar_url)',
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
  const fallback = await run('id,user_id,lesson_id,text,created_at,likes,parent_id,status');
  if (fallback.error) throw fallback.error;
  return (fallback.data || []) as any;
}

export async function addComment(userId: string, videoId: string, text: string, parentId?: string | null): Promise<void> {
  const payload: Record<string, any> = { user_id: userId, lesson_id: videoId, text, likes: 0 };
  if (parentId) payload.parent_id = parentId;
  const { error } = await supabase.from('platform_lesson_comment').insert(payload);
  if (error) throw error;
}

export async function likeComment(id: string): Promise<void> {
  const { error } = await supabase.rpc("inc_comment_like", { cid: id });
  if (!error) return;

  // Fallback (não-atômico) caso a RPC não exista no banco.
  try {
    const { data, error: readError } = await supabase
      .from("platform_lesson_comment")
      .select("likes")
      .eq("id", id)
      .maybeSingle();
    if (readError || !data) return;
    const nextLikes = Number((data as any).likes || 0) + 1;
    await supabase.from("platform_lesson_comment").update({ likes: nextLikes }).eq("id", id);
  } catch {
    // mantém o incremento otimista na UI
  }
}
