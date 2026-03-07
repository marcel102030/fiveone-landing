/**
 * Serviço de Favoritos — platform_favorite_lesson
 *
 * Tabela: { user_id text PK, lesson_id text PK, created_at timestamptz }
 * RLS: authenticated user vê apenas os próprios (user_id = auth.email())
 */
import { supabase } from '../../../shared/lib/supabaseClient'
import { LessonRef, listLessons } from './platformContent'

// ── Adicionar favorito ────────────────────────────────────────────────────────

export async function addFavorite(userId: string, lessonId: string): Promise<void> {
  const { error } = await supabase
    .from('platform_favorite_lesson')
    .insert({ user_id: userId, lesson_id: lessonId })

  if (error && error.code !== '23505') {
    // 23505 = unique_violation (já favoritado), ignorar silenciosamente
    throw new Error(`Falha ao adicionar favorito: ${error.message}`)
  }
}

// ── Remover favorito ──────────────────────────────────────────────────────────

export async function removeFavorite(userId: string, lessonId: string): Promise<void> {
  const { error } = await supabase
    .from('platform_favorite_lesson')
    .delete()
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)

  if (error) {
    throw new Error(`Falha ao remover favorito: ${error.message}`)
  }
}

// ── Toggle favorito (adiciona ou remove) ─────────────────────────────────────

export async function toggleFavorite(
  userId: string,
  lessonId: string,
  currentlyFavorited: boolean,
): Promise<void> {
  if (currentlyFavorited) {
    await removeFavorite(userId, lessonId)
  } else {
    await addFavorite(userId, lessonId)
  }
}

// ── Buscar IDs das aulas favoritadas ─────────────────────────────────────────

export async function fetchFavoriteIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('platform_favorite_lesson')
    .select('lesson_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar favoritos:', error.message)
    return []
  }

  return (data ?? []).map((row) => row.lesson_id as string)
}

// ── Verificar se uma aula específica é favorita ───────────────────────────────

export async function isFavorite(userId: string, lessonId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('platform_favorite_lesson')
    .select('lesson_id')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle()

  if (error) return false
  return data !== null
}

// ── Buscar aulas favoritas completas (cruza com cache de conteúdo) ────────────

export async function fetchFavoriteLessons(userId: string): Promise<LessonRef[]> {
  const favoriteIds = await fetchFavoriteIds(userId)
  if (!favoriteIds.length) return []

  // listLessons() já está em memória (singleton cache)
  const allLessons = listLessons({ onlyPublished: true, onlyActive: true })
  const idSet = new Set(favoriteIds)

  const matched = allLessons.filter((lesson) => idSet.has(lesson.id))

  // Preservar ordem de favoritos (mais recente primeiro)
  const orderMap = new Map(favoriteIds.map((id, idx) => [id, idx]))
  matched.sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999))

  return matched
}

// ── Hook de estado para favoritar com update otimista ────────────────────────
// Retorna o conjunto de IDs favoritados e a função de toggle

export async function loadFavoriteSet(userId: string): Promise<Set<string>> {
  const ids = await fetchFavoriteIds(userId)
  return new Set(ids)
}
