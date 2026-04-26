import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchUserProgress, upsertProgress, ProgressRow } from '../services/progress'
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
  userId: string,
  lessonLookup: (id: string) => LessonRef | null | undefined,
  remoteProgress: ProgressRow[],
): Promise<void> {
  const sessionKey = `fiveone_recovery_synced_${userId}`
  if (sessionStorage.getItem(sessionKey)) return

  const remoteMap = new Map(remoteProgress.map(r => [r.lesson_id, r.watched_seconds]))

  // Fonte 1: chaves fiveone_progress::{id}
  const progressKeys: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith('fiveone_progress::')) progressKeys.push(k)
    }
  } catch {}

  for (const key of progressKeys) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const local = JSON.parse(raw)
      const lessonId    = key.replace('fiveone_progress::', '')
      const localWatched = Math.round(Number(local.watchedSeconds || 0))
      if (localWatched <= 0) continue
      const remoteWatched = remoteMap.get(lessonId) ?? -1
      if (remoteWatched >= localWatched) continue
      const lesson = lessonLookup(lessonId)
      await upsertProgress({
        user_id:          userId,
        lesson_id:        lessonId,
        last_at:          local.lastAt ? new Date(local.lastAt).toISOString() : new Date().toISOString(),
        watched_seconds:  localWatched,
        duration_seconds: local.durationSeconds ? Math.round(Number(local.durationSeconds)) : null,
        title:            lesson?.title || lessonId,
        thumbnail:        lesson?.bannerContinue?.url || lesson?.bannerContinue?.dataUrl || lesson?.bannerMobile?.url || null,
      }).catch(() => {})
      remoteMap.set(lessonId, localWatched)
    } catch {}
  }

  // Fonte 2: array videos_assistidos (entradas sem chave individual)
  try {
    const raw = localStorage.getItem('videos_assistidos')
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) {
        const uploaded = new Set(progressKeys.map(k => k.replace('fiveone_progress::', '')))
        for (const item of arr) {
          const lessonId    = item.id || item.videoId || item.video_id
          if (!lessonId || uploaded.has(lessonId)) continue
          const localWatched = Math.round(Number(item.watchedSeconds || 0))
          if (localWatched <= 0) continue
          const remoteWatched = remoteMap.get(lessonId) ?? -1
          if (remoteWatched >= localWatched) continue
          const lesson = lessonLookup(lessonId)
          await upsertProgress({
            user_id:          userId,
            lesson_id:        lessonId,
            last_at:          item.lastAt ? new Date(item.lastAt).toISOString() : new Date().toISOString(),
            watched_seconds:  localWatched,
            duration_seconds: item.durationSeconds ? Math.round(Number(item.durationSeconds)) : null,
            title:            item.title || lesson?.title || lessonId,
            thumbnail:        item.thumbnail || lesson?.bannerContinue?.url || null,
          }).catch(() => {})
        }
      }
    }
  } catch {}

  try { sessionStorage.setItem(sessionKey, '1') } catch {}
}
