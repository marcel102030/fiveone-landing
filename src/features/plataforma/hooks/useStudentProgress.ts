import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchUserProgress, ProgressRow } from '../services/progress'
import { fetchCompletionsForUser } from '../services/completions'
import type { LessonRef } from '../services/platformContent'

export type { ProgressRow }

export interface StudentProgressState {
  /** Aulas em andamento, ordenadas por last_at DESC (banco é a fonte de verdade). */
  progress: ProgressRow[]
  /** IDs das aulas concluídas (banco é a fonte de verdade). */
  completedIds: Set<string>
  /** true enquanto o primeiro fetch não completou. */
  loading: boolean
  /** Força re-fetch imediato (ignora debounce). */
  refresh: () => void
}

const DEBOUNCE_MS = 3000

export function useStudentProgress(userId: string | null): StudentProgressState {
  const [progress, setProgress]     = useState<ProgressRow[]>([])
  const [completedIds, setCompleted] = useState<Set<string>>(new Set())
  const [loading, setLoading]        = useState(true)
  const lastFetchRef                 = useRef(0)
  const mountedRef                   = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const refresh = useCallback(async (force = false) => {
    if (!userId) {
      if (mountedRef.current) setLoading(false)
      return
    }
    const now = Date.now()
    if (!force && now - lastFetchRef.current < DEBOUNCE_MS) return
    lastFetchRef.current = now

    try {
      const [p, c] = await Promise.all([
        fetchUserProgress(userId, 24),
        fetchCompletionsForUser(userId),
      ])
      if (!mountedRef.current) return
      setProgress(p || [])
      setCompleted(new Set(c || []))
    } catch {
      // rede indisponível — mantém estado atual
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [userId])

  // Re-fetch quando userId muda (cobre auth assíncrona: null → email)
  useEffect(() => {
    if (mountedRef.current) setLoading(true)
    lastFetchRef.current = 0
    refresh(true)
  }, [refresh])

  // Re-sync ao ganhar foco ou voltar para a aba
  useEffect(() => {
    const onFocus   = () => refresh()
    const onVisible = () => { if (document.visibilityState === 'visible') refresh() }
    window.addEventListener('focus',           onFocus)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus',           onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh])

  return { progress, completedIds, loading, refresh }
}

/**
 * Faz upload de todo progresso salvo no localStorage que ainda não chegou ao banco.
 * Roda uma vez por sessão por usuário.
 */
export async function recoverLocalProgress(
  _userId: string,
  _lessonLookup: (id: string) => LessonRef | null | undefined,
  _remoteProgress: ProgressRow[],
): Promise<void> {
  // ⛔️ Recovery APOSENTADO (jun/2026). Antes re-enviava o progresso salvo no
  // localStorage para o banco, para cobrir o antigo bug float→int (já corrigido).
  // Passou a ressuscitar progresso velho ("aulas fantasma") após recriação de
  // conteúdo. O banco é a fonte de verdade e os saves do player (>=10s) vão
  // direto para lá — então este recovery virou no-op. A assinatura é mantida
  // para não quebrar a chamada na Plataforma.
}
