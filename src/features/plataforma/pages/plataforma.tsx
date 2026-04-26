import Header from './Header'
import { Link, useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getCurrentUserId } from '../../../shared/utils/user'
import { fetchUserProgress, deleteProgressExceptForUser } from '../services/progress'
import { listLessons, LessonRef, subscribePlatformContent, getMinistry, usePlatformContent } from '../services/platformContent'
import {
  COMPLETED_EVENT,
  CompletedLessonInfo,
  readCompletedLessons,
  clearCompletedLessons,
} from '../../../shared/utils/completedLessons'
import { fetchCompletionsForUser } from '../services/completions'
import { usePlatformUserProfile } from '../hooks/usePlatformUserProfile'
import { ConfirmModal } from '../../../shared/components/ui'
import { useAuth } from '../../../shared/contexts/AuthContext'
import { getEnrollments } from '../services/userAccount'

// ── Ícones ────────────────────────────────────────────────────────────────────

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const LayersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
)

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)

// ── Helpers de progresso (fora do componente para reúso) ─────────────────────

function getProgressKey(video: any): string | null {
  if (!video) return null
  if (typeof video.id === 'string' && video.id) return video.id
  if (typeof video.videoId === 'string' && video.videoId) return video.videoId
  if (typeof video.video_id === 'string' && video.video_id) return video.video_id
  if (typeof video.url === 'string' && video.url) return video.url
  return null
}

function mergeByRecency(items: any[]): any[] {
  const byKey = new Map<string, any>()
  items.forEach((item) => {
    const key = getProgressKey(item)
    if (!key) return
    const prev = byKey.get(key)
    if (!prev) { byKey.set(key, item); return }
    const prevAt = Number(prev.lastAt || 0)
    const nextAt = Number(item.lastAt || 0)
    const primary = nextAt >= prevAt ? item : prev
    const secondary = nextAt >= prevAt ? prev : item
    byKey.set(key, {
      ...secondary, ...primary,
      watchedSeconds: Math.max(Number(prev.watchedSeconds || 0), Number(item.watchedSeconds || 0)),
      durationSeconds: Number(primary.durationSeconds || 0) || Number(secondary.durationSeconds || 0) || undefined,
      lastAt: Math.max(prevAt, nextAt),
    })
  })
  return Array.from(byKey.values()).sort((a, b) => Number(b.lastAt || 0) - Number(a.lastAt || 0))
}

// ── Componente principal ──────────────────────────────────────────────────────

const PaginaInicial = () => {
  const navigate = useNavigate()
  const { profile } = usePlatformUserProfile()
  // useAuth lê a sessão Supabase via cookie — persiste mesmo quando
  // sessionStorage é limpo (browser fechado). É o identificador confiável.
  const { email: authEmail } = useAuth()
  // Refs sempre atualizados — evitam closure stale em handlers registrados via addEventListener.
  const authEmailRef = useRef<string | null>(null)
  authEmailRef.current = authEmail
  const lessonByVideoIdRef = useRef<Map<string, LessonRef>>(new Map())
  const carouselRef = useRef<HTMLDivElement>(null)

  // Identificador efetivo: custom storage (sincrono) ou Supabase auth (cookie).
  // Normaliza lowercase para evitar mismatch com dados gravados no DB.
  // Nunca usa '' como fallback — null significa "ainda não identificado".
  const effectiveUid = getCurrentUserId() || (authEmail ? authEmail.toLowerCase() : null)

  // ── Isolamento entre usuários ─────────────────────────────────────────────
  // Apaga cache local APENAS quando um usuário DIFERENTE faz login.
  // Se o MESMO usuário volta (após logout), o cache é preservado — evita que
  // o "Continuar Assistindo" suma porque o progresso estava só no localStorage.
  useEffect(() => {
    if (!effectiveUid) return // Ainda não identificado — não toca no cache
    try {
      const storedUser = localStorage.getItem('fiveone_active_user')
      const wasLoggedOut = storedUser === '__logged_out__'
      const isDifferentActiveUser = storedUser && !wasLoggedOut && storedUser !== effectiveUid

      // Determina se é um usuário diferente do que estava antes
      const lastEmail = localStorage.getItem('fiveone_last_active_email')
      const isNewUser = wasLoggedOut
        ? (lastEmail !== null ? lastEmail !== effectiveUid : true) // sem lastEmail → limpa por segurança (device antigo)
        : isDifferentActiveUser                                     // troca direta sem logout

      if (isNewUser) {
        // Usuário DIFERENTE — apaga cache do anterior
        try { localStorage.removeItem('videos_assistidos') } catch {}
        try { localStorage.removeItem('fiveone_last_lesson') } catch {}
        // CRÍTICO: limpa completions do localStorage E reseta o estado React.
        // Sem isso, o completedMap inicializa com completions do usuário anterior
        // e filtra aulas em andamento do novo usuário como "concluídas".
        clearCompletedLessons()
        setCompletedMap(new Map<string, CompletedLessonInfo>())
        const progressKeys: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)
          if (k && k.startsWith('fiveone_progress::')) progressKeys.push(k)
        }
        progressKeys.forEach(k => { try { localStorage.removeItem(k) } catch {} })
        try {
          const syncKeys: string[] = []
          for (let i = 0; i < sessionStorage.length; i++) {
            const k = sessionStorage.key(i)
            if (k && k.startsWith('fiveone_progress_sync_')) syncKeys.push(k)
          }
          syncKeys.forEach(k => { try { sessionStorage.removeItem(k) } catch {} })
        } catch {}
      }
      // Se wasLoggedOut mas mesmo usuário → NÃO limpa o cache → "Continuar Assistindo" persiste
      try { localStorage.setItem('fiveone_active_user', effectiveUid) } catch {}
    } catch {}
  // effectiveUid muda quando authEmail resolve (auth async) — re-verificar nesse momento
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUid])

  // ── Estado de conteúdo ────────────────────────────────────────────────────
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([])
  const [enrollmentsLoaded, setEnrollmentsLoaded] = useState(false)
  const [allLessons, setAllLessons] = useState<LessonRef[]>([])
  const [lastWatchedArray, setLastWatchedArray] = useState<any[]>([])
  const [progressLoaded, setProgressLoaded] = useState(false)
  const [completedMap, setCompletedMap] = useState<Map<string, CompletedLessonInfo>>(() => {
    // Não lê localStorage se o usuário acabou de sair — evita dados stale do usuário anterior
    try {
      const activeUser = localStorage.getItem('fiveone_active_user')
      if (!activeUser || activeUser === '__logged_out__') return new Map()
      const currentId = getCurrentUserId()
      if (currentId && currentId === activeUser) return readCompletedLessons()
    } catch {}
    return new Map()
  })
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 640px)').matches)

  // ── Modal limpar histórico ────────────────────────────────────────────────
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearing, setClearing] = useState(false)

  // ── Responsividade ────────────────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(mq.matches)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // ── Carrega matrículas quando o usuário é identificado ───────────────────
  useEffect(() => {
    if (!effectiveUid) return
    getEnrollments(effectiveUid)
      .then(ids => { setEnrolledCourseIds(ids); setEnrollmentsLoaded(true) })
      .catch(() => { setEnrolledCourseIds([]); setEnrollmentsLoaded(true) })
  }, [effectiveUid])

  // ── Agrega aulas de todos os cursos matriculados ───────────────────────
  useEffect(() => {
    const sync = () => {
      if (!enrolledCourseIds.length) return
      const lessons = enrolledCourseIds.flatMap(id =>
        listLessons({ ministryId: id, onlyPublished: true, onlyActive: true })
      )
      setAllLessons(lessons)
    }
    sync()
    const unsubscribe = subscribePlatformContent(() => sync())
    return () => unsubscribe()
  }, [enrolledCourseIds])

  // ── Sync de completions ───────────────────────────────────────────────────
  // NÃO chama sync() no mount — o estado correto vem da busca remota no efeito de progresso.
  // sync() no mount causaria sobrescrever completions corretas do servidor com cache stale.
  useEffect(() => {
    const sync = () => setCompletedMap(readCompletedLessons())
    const handler = () => sync()
    window.addEventListener(COMPLETED_EVENT, handler)
    const storageHandler = (event: StorageEvent) => {
      if (event.key === 'fiveone_completed_lessons_v1') sync()
    }
    window.addEventListener('storage', storageHandler)
    return () => {
      window.removeEventListener(COMPLETED_EVENT, handler)
      window.removeEventListener('storage', storageHandler)
    }
  }, [])

  // ── Map de lessonId → LessonRef ───────────────────────────────────────────
  // Indexado por videoId E por id para tolerar progresso salvo com qualquer das chaves.
  const lessonByVideoId = useMemo(() => {
    const map = new Map<string, LessonRef>()
    allLessons.forEach((lesson) => {
      map.set(lesson.videoId, lesson)
      if (lesson.id && lesson.id !== lesson.videoId) map.set(lesson.id, lesson)
    })
    return map
  }, [allLessons])
  // Ref síncrono — permite que closures com deps=[] acessem o Map sempre atualizado
  lessonByVideoIdRef.current = lessonByVideoId

  // ── Carregar progresso (localStorage + remoto) ────────────────────────────
  // Depende de effectiveUid para re-disparar quando o Supabase auth resolve
  // (cenário: login sem "lembrar-me", browser reaberto, sessionStorage vazio,
  //  mas cookie do Supabase ainda válido → authEmail chega após o primeiro render)
  useEffect(() => {
    let active = true

    let localEnriched: any[] = []
    try {
      const raw = localStorage.getItem('videos_assistidos')
      const parsed = raw ? JSON.parse(raw) : []
      const localArr = mergeByRecency(Array.isArray(parsed) ? parsed : [])
      if (localArr.length) {
        // Usa ref para enriquecer — pode estar vazio no primeiro render (ok, será re-enriquecido depois)
        const lbv = lessonByVideoIdRef.current
        localEnriched = localArr.map((item: any) => {
          const lesson = lbv.get(item.id || item.videoId || item.video_id || item.url)
          return {
            ...item,
            subjectName: item.subjectName || lesson?.subjectName,
            bannerContinue: item.bannerContinue || lesson?.bannerContinue?.url || lesson?.bannerContinue?.dataUrl || null,
            bannerMobile: item.bannerMobile || lesson?.bannerMobile?.url || lesson?.bannerMobile?.dataUrl || null,
            thumbnail: item.thumbnail || lesson?.bannerContinue?.url || lesson?.bannerContinue?.dataUrl || lesson?.bannerMobile?.url || lesson?.bannerMobile?.dataUrl || lesson?.thumbnailUrl || item.bannerContinue,
          }
        })
        setLastWatchedArray(localEnriched)
      }
    } catch {}

    ;(async () => {
      // effectiveUid = custom storage OU cookie do Supabase — nunca null se logado.
      // Quando é null, o auth ainda está resolvendo. O efeito re-roda automaticamente
      // quando effectiveUid muda de null → email (pois está nas dependências).
      const uid = effectiveUid
      if (!uid) return
      try {
        // ── Busca progresso E completions em paralelo ─────────────────────────
        // CRÍTICO: buscar juntos e processar completions ANTES de setar
        // lastWatchedArray garante que visibleLastWatched (que filtra por completedIds)
        // já tem o estado correto do usuário atual quando o carousel é renderizado.
        // Fetches sequenciais causavam race condition: completedIds desatualizado
        // filtrava aulas válidas como "concluídas" durante a janela entre os dois awaits.
        const [rows, completions] = await Promise.all([
          fetchUserProgress(uid, 24),
          fetchCompletionsForUser(uid),
        ])
        if (!active) return

        // 1. Seta completions PRIMEIRO — antes de tocar em lastWatchedArray.
        //    Assim visibleLastWatched já nasce com o filtro correto.
        //    Seta diretamente sem clearCompletedLessons() para evitar que
        //    o evento COMPLETED_EVENT dispare um re-render intermediário desnecessário.
        const newCompletedMap = new Map<string, CompletedLessonInfo>()
        if (completions && completions.length) {
          completions.forEach(id => {
            newCompletedMap.set(id, { completedAt: Date.now(), previousWatched: null, previousDuration: null })
          })
        }
        try {
          localStorage.setItem('fiveone_completed_lessons_v1',
            JSON.stringify(Object.fromEntries(Array.from(newCompletedMap.entries()))))
        } catch {}
        setCompletedMap(newCompletedMap)

        // 2. Agora processa e seta o progresso
        if (rows && rows.length) {
          const remote = rows.map(r => {
            const localKey = `fiveone_progress::${r.lesson_id}`
            let localWatched = 0
            try {
              const raw = localStorage.getItem(localKey)
              if (raw) {
                const parsed = JSON.parse(raw)
                localWatched = Number(parsed.watchedSeconds || parsed.watched || 0)
              }
            } catch {}

            // Escreve progresso remoto no localStorage para que o streamer
            // retome no tempo certo ao abrir neste dispositivo
            if (r.watched_seconds > localWatched) {
              try {
                localStorage.setItem(localKey, JSON.stringify({
                  watchedSeconds: r.watched_seconds,
                  durationSeconds: r.duration_seconds || 0,
                  lastAt: new Date(r.last_at).getTime(),
                }))
              } catch {}
              localWatched = r.watched_seconds
            }

            const lbv = lessonByVideoIdRef.current
            return {
              id: r.lesson_id, url: '', index: undefined,
              title: r.title, thumbnail: r.thumbnail,
              watchedSeconds: Math.max(r.watched_seconds, localWatched),
              durationSeconds: r.duration_seconds || undefined,
              lastAt: new Date(r.last_at).getTime(),
              subjectName: lbv.get(r.lesson_id)?.subjectName,
              bannerContinue: lbv.get(r.lesson_id)?.bannerContinue?.url || lbv.get(r.lesson_id)?.bannerContinue?.dataUrl || null,
              bannerMobile: lbv.get(r.lesson_id)?.bannerMobile?.url || lbv.get(r.lesson_id)?.bannerMobile?.dataUrl || null,
            }
          })

          const sortedRemote = [...remote].sort((a, b) => Number(b.lastAt) - Number(a.lastAt))
          if (sortedRemote[0]?.id) {
            try { localStorage.setItem('fiveone_last_lesson', sortedRemote[0].id) } catch {}
          }

          const finalMerged = mergeByRecency([...localEnriched, ...remote])
          try { localStorage.setItem('videos_assistidos', JSON.stringify(finalMerged.slice(0, 12))) } catch {}
          setLastWatchedArray(finalMerged)
        }

        setProgressLoaded(true)
      } catch {
        if (active) setProgressLoaded(true)
      }
    })()

    return () => { active = false }
  // effectiveUid muda de null → email quando o auth do Supabase resolve.
  // lessonByVideoId é acessado via ref — não precisa estar nas deps (evita double-fetch).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUid])

  // ── Re-enriquece itens existentes quando as aulas carregam ────────────────
  // O efeito principal de progresso roda antes de lessonByVideoId ser populado
  // (enrollments são async). Esse efeito preenche subjectName/banners sem re-buscar
  // dados do servidor.
  useEffect(() => {
    if (!allLessons.length) return
    setLastWatchedArray(prev => {
      if (!prev.length) return prev
      let changed = false
      const next = prev.map(item => {
        const lessonId = item.id || item.videoId
        if (!lessonId) return item
        const lesson = lessonByVideoId.get(lessonId)
        if (!lesson) return item
        const sub = lesson.subjectName || null
        const bc = lesson.bannerContinue?.url || lesson.bannerContinue?.dataUrl || null
        const bm = lesson.bannerMobile?.url || lesson.bannerMobile?.dataUrl || null
        const th = lesson.bannerContinue?.url || lesson.bannerContinue?.dataUrl || lesson.thumbnailUrl || null
        if (item.subjectName === sub && item.bannerContinue === bc && item.bannerMobile === bm) return item
        changed = true
        return {
          ...item,
          subjectName: item.subjectName || sub,
          bannerContinue: item.bannerContinue || bc,
          bannerMobile: item.bannerMobile || bm,
          thumbnail: item.thumbnail || th,
        }
      })
      return changed ? next : prev
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonByVideoId])

  // ── Sincroniza "Continuar Assistindo" cross-device ───────────────────────
  // O localStorage é por dispositivo. Para sincronizar entre celular e PC
  // consultamos o Supabase sempre que a janela recebe foco. Isso garante que
  // ao abrir no celular após assistir no PC (ou vice-versa), o carousel reflita
  // o progresso real do servidor.
  useEffect(() => {
    let lastFetch = 0
    const DEBOUNCE_MS = 3000 // não busca mais de 1x a cada 3s

    const syncFromSupabase = async () => {
      const now = Date.now()
      if (now - lastFetch < DEBOUNCE_MS) return
      lastFetch = now

      // Usa cookie do Supabase como fallback (persiste após fechar browser).
      // authEmailRef.current é sempre o valor mais recente — evita closure stale.
      const uid = getCurrentUserId() || authEmailRef.current || null
      if (!uid) {
        // sem conta identificada: só relê localStorage local
        try {
          const raw = localStorage.getItem('videos_assistidos')
          if (!raw) return
          const parsed = JSON.parse(raw)
          if (!Array.isArray(parsed) || !parsed.length) return
          const sorted = [...parsed].sort((a: any, b: any) => Number(b.lastAt || 0) - Number(a.lastAt || 0))
          setLastWatchedArray(prev => {
            const firstNew = sorted[0]?.id || sorted[0]?.url
            const firstOld = prev[0]?.id || prev[0]?.url
            if (firstNew === firstOld && sorted.length === prev.length) return prev
            return sorted
          })
        } catch {}
        return
      }

      try {
        const rows = await fetchUserProgress(uid, 24)
        if (!rows?.length) return
        const lbv = lessonByVideoIdRef.current
        const remote = rows.map(r => ({
          id: r.lesson_id,
          url: '',
          title: r.title,
          thumbnail: r.thumbnail,
          watchedSeconds: r.watched_seconds,
          durationSeconds: r.duration_seconds || undefined,
          lastAt: new Date(r.last_at).getTime(),
          subjectName: lbv.get(r.lesson_id)?.subjectName,
          bannerContinue: lbv.get(r.lesson_id)?.bannerContinue?.url || lbv.get(r.lesson_id)?.bannerContinue?.dataUrl || null,
          bannerMobile: lbv.get(r.lesson_id)?.bannerMobile?.url || lbv.get(r.lesson_id)?.bannerMobile?.dataUrl || null,
        }))

        // Lê local também para o merge
        let localArr: any[] = []
        try {
          const raw = localStorage.getItem('videos_assistidos')
          if (raw) {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) localArr = parsed
          }
        } catch {}

        const merged = mergeByRecency([...localArr, ...remote])
        setLastWatchedArray(prev => {
          const firstNew = merged[0]?.id || merged[0]?.url
          const firstOld = prev[0]?.id || prev[0]?.url
          if (firstNew === firstOld && merged.length === prev.length) return prev
          return merged
        })

        // ── CRÍTICO: escreve progresso remoto no localStorage local ───────
        // O streamerMestre lê fiveone_progress::{id} para saber onde retomar.
        // Se o aluno assistiu em outro dispositivo, esse dado só existe no
        // Supabase. Precisamos populá-lo aqui para o streamer resumir no tempo certo.
        rows.forEach(r => {
          if (!r.lesson_id || r.watched_seconds <= 0) return
          try {
            const localKey = `fiveone_progress::${r.lesson_id}`
            const existing = localStorage.getItem(localKey)
            const localData = existing ? JSON.parse(existing) : null
            const localWatched = Number(localData?.watchedSeconds || 0)
            // só sobrescreve se o remoto tem mais progresso ou dado local inexistente
            if (r.watched_seconds >= localWatched) {
              localStorage.setItem(localKey, JSON.stringify({
                watchedSeconds: r.watched_seconds,
                durationSeconds: r.duration_seconds || localData?.durationSeconds || 0,
                lastAt: new Date(r.last_at).getTime(),
              }))
            }
          } catch {}
        })

        // Atualiza fiveone_last_lesson com o ID mais recente do servidor
        if (merged[0]?.id) {
          try { localStorage.setItem('fiveone_last_lesson', merged[0].id) } catch {}
        }
        // Persiste lista mesclada para carregamento instantâneo na próxima visita
        try { localStorage.setItem('videos_assistidos', JSON.stringify(merged.slice(0, 12))) } catch {}
      } catch { /* rede indisponível — mantém estado atual */ }
    }

    // 'storage': outra aba/janela mudou o localStorage (mesma sessão, outro dispositivo não dispara isso)
    const storageHandler = () => {
      try {
        const raw = localStorage.getItem('videos_assistidos')
        if (!raw) return
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return
        const sorted = [...parsed].sort((a: any, b: any) => Number(b.lastAt || 0) - Number(a.lastAt || 0))
        setLastWatchedArray(prev => {
          const firstNew = sorted[0]?.id || sorted[0]?.url
          const firstOld = prev[0]?.id || prev[0]?.url
          if (firstNew === firstOld && sorted.length === prev.length) return prev
          return sorted
        })
      } catch {}
    }

    // visibilitychange: cobre o cenário de voltar ao app no mobile/PWA
    // e também quando o usuário retorna de outra aba no desktop.
    const visibilityHandler = () => {
      if (document.visibilityState === 'visible') syncFromSupabase()
    }

    // 'focus': ao voltar para a aba/app (funciona no PWA e mobile)
    // 'visibilitychange': complementa o focus para cenários mobile e PWA
    window.addEventListener('focus', syncFromSupabase)
    window.addEventListener('storage', storageHandler)
    document.addEventListener('visibilitychange', visibilityHandler)

    // Dispara sync imediatamente no mount caso a aba já esteja visível
    // (cobre o cenário de login → redirect → página já em foco)
    if (document.visibilityState === 'visible') {
      syncFromSupabase()
    }

    return () => {
      window.removeEventListener('focus', syncFromSupabase)
      window.removeEventListener('storage', storageHandler)
      document.removeEventListener('visibilitychange', visibilityHandler)
    }
  // Usa lessonByVideoIdRef.current e authEmailRef.current — sem deps evita re-registrar
  // listeners a cada vez que as aulas carregam (causaria race condition).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── IDs concluídos ────────────────────────────────────────────────────────
  const completedIds = useMemo(() => new Set(Array.from(completedMap.keys())), [completedMap])


  const visibleLastWatched = useMemo(() => {
    if (!lastWatchedArray.length) return [] as any[]
    return lastWatchedArray.filter((item) => {
      // Testa todas as chaves possíveis — dados históricos podem usar id, videoId ou video_id
      const keys = [item.id, item.videoId, item.video_id].filter(Boolean) as string[]
      if (!keys.length) return true
      return !keys.some(k => completedIds.has(k))
    })
  }, [lastWatchedArray, completedIds])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalCompleted = completedIds.size
  const totalLessons = allLessons.length
  const progressPercent = totalLessons > 0 ? Math.min(100, Math.round((totalCompleted / totalLessons) * 100)) : 0

  // Curso padrão para navegação (primeiro matriculado)
  const primaryCourseId = enrolledCourseIds[0] || null

  // ── Navegar para aula ─────────────────────────────────────────────────────
  const goToLesson = useCallback((video: any) => {
    const lessonId = video.id || video.videoId || video.video_id
    const lesson = lessonId ? lessonByVideoId.get(lessonId) : null
    const courseId = lesson?.ministryId || primaryCourseId
    if (!courseId) return
    if (lesson && lessonId) navigate(`/curso/${courseId}/aula?vid=${encodeURIComponent(lessonId)}`)
    else if (typeof video.index === 'number') navigate(`/curso/${courseId}/aula?i=${video.index}`)
    else if (video.url) navigate(`/curso/${courseId}/aula?v=${encodeURIComponent(video.url)}`)
    else navigate(`/curso/${courseId}/aula`)
  }, [navigate, lessonByVideoId, primaryCourseId])

  // "Retomar aula" — usa fiveone_last_lesson como fonte da verdade quando disponível.
  // Verifica que a aula pertence a um curso do usuário atual (evita retomar aula de outro usuário).
  const handleResumeLesson = useCallback(() => {
    try {
      const lastId = localStorage.getItem('fiveone_last_lesson')
      if (lastId) {
        const lesson = lessonByVideoId.get(lastId)
        if (lesson && enrolledCourseIds.includes(lesson.ministryId)) {
          navigate(`/curso/${lesson.ministryId}/aula?vid=${encodeURIComponent(lastId)}`)
          return
        }
      }
    } catch {}
    if (visibleLastWatched.length > 0) goToLesson(visibleLastWatched[0])
    else if (primaryCourseId) navigate(`/curso/${primaryCourseId}/aula`)
  }, [navigate, visibleLastWatched, goToLesson, lessonByVideoId, primaryCourseId, enrolledCourseIds])

  // ── Limpar histórico ──────────────────────────────────────────────────────
  const performClearHistory = useCallback(async () => {
    const completedIdList = Array.from(completedIds.values()).filter((id): id is string => typeof id === 'string' && id.length > 0)
    const keepBases = new Set<string>()
    let storedWatched: Array<{ id?: string; videoId?: string; url?: string }> = []
    try {
      const watchedRaw = localStorage.getItem('videos_assistidos')
      if (watchedRaw) {
        const parsed = JSON.parse(watchedRaw)
        if (Array.isArray(parsed)) storedWatched = parsed
      }
    } catch {}

    if (completedIdList.length) {
      allLessons.forEach((lesson) => {
        if (!lesson.videoId || !completedIds.has(lesson.videoId)) return
        keepBases.add(lesson.videoId)
        if (lesson.videoUrl) keepBases.add(lesson.videoUrl)
      })
      storedWatched.forEach((item) => {
        const candidateId = item?.id || item?.videoId
        if (candidateId && completedIds.has(candidateId)) {
          keepBases.add(candidateId)
          if (typeof item?.url === 'string' && item.url) keepBases.add(item.url)
        }
      })
    }

    localStorage.removeItem('videos_assistidos')
    const progressPrefix = 'fiveone_progress::'
    const progressKeys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(progressPrefix)) {
        const base = key.slice(progressPrefix.length)
        if (!keepBases.has(base)) progressKeys.push(key)
      }
    }
    progressKeys.forEach((key) => { try { localStorage.removeItem(key) } catch {} })

    try {
      const syncPrefix = 'fiveone_progress_sync_'
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith(syncPrefix)) {
          try { sessionStorage.removeItem(key) } catch {}
        }
      }
    } catch {}

    const uid = effectiveUid
    if (uid) await deleteProgressExceptForUser(uid, completedIdList)
    setLastWatchedArray([])
  }, [completedIds, allLessons, effectiveUid])

  const handleClearHistory = useCallback(async () => {
    setClearing(true)
    try {
      await performClearHistory()
    } finally {
      setClearing(false)
      setShowClearConfirm(false)
    }
  }, [performClearHistory])

  // ── Scroll do carrossel ───────────────────────────────────────────────────
  const scrollCarousel = (direction: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: direction * 300, behavior: 'smooth' })
    }
  }

  // ── Saudação ──────────────────────────────────────────────────────────────
  const firstName = profile?.displayName?.split(' ')[0] || profile?.name?.split(' ')[0] || 'Aluno'

  // Cursos matriculados com metadados do ministry — depende do conteúdo carregado
  const platformContent = usePlatformContent()
  const enrolledCourses = useMemo(() =>
    enrolledCourseIds.map(id => ({
      id,
      ministry: platformContent.ministries.find(m => m.id === id) || getMinistry(id),
    })),
  [enrolledCourseIds, platformContent.ministries])

  // Stats por curso — para o hero adaptativo multi-curso
  const courseStats = useMemo(() =>
    enrolledCourses.map(({ id, ministry }) => {
      const courseLessons = allLessons.filter(l => l.ministryId === id)
      const total = courseLessons.length
      const completed = courseLessons.filter(
        l => completedIds.has(l.videoId) || completedIds.has(l.id)
      ).length
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0
      const lastItem = lastWatchedArray.find(item => {
        const key = item.id || item.videoId || item.video_id
        const lesson = key ? lessonByVideoId.get(key) : null
        return lesson?.ministryId === id
      })
      const hasProgress = completed > 0 || !!lastItem
      return { id, name: ministry?.name || id, total, completed, pct, hasProgress, lastItem }
    }),
  [enrolledCourses, allLessons, completedIds, lastWatchedArray, lessonByVideoId])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Header />

      <main id="inicio" className="min-h-screen bg-navy">

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-navy to-navy-light border-b border-slate/10">
          {/* Decoração de fundo */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-mint/5 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-mint/5 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            {/* Saudação */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-white mb-1">
                Olá, {firstName} 👋
              </h1>
            </div>

            {/* Stats / Cards — adaptativo por nº de cursos */}
            {enrolledCourseIds.length > 1 ? (
              <>
                {/* ── Multi-curso: card por curso ─────────────────────────── */}
                <div className="space-y-3 mb-8 max-w-xl">
                  {courseStats.map(course => (
                    <div
                      key={course.id}
                      className="bg-navy-lighter/60 border border-slate/10 rounded-xl p-4 flex items-center gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-white truncate">{course.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1.5 bg-navy rounded-full overflow-hidden">
                            <div
                              className="h-1.5 bg-mint rounded-full transition-all duration-700"
                              style={{ width: `${course.pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-mint font-semibold tabular-nums flex-shrink-0 w-8 text-right">
                            {course.pct}%
                          </span>
                        </div>
                        <p className="text-xs text-slate mt-1">
                          {course.completed} de {course.total} aula{course.total !== 1 ? 's' : ''} concluída{course.completed !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (course.lastItem) goToLesson(course.lastItem)
                          else navigate(`/curso/${course.id}/modulos`)
                        }}
                        className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] bg-mint text-navy text-xs font-bold rounded-xl hover:bg-mint/90 active:scale-95 transition-all shadow-mint"
                      >
                        {course.hasProgress ? 'Continuar' : 'Começar'} →
                      </button>
                    </div>
                  ))}
                </div>
                {/* Atalho para retomar a última aula assistida (qualquer curso) */}
                {visibleLastWatched.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleResumeLesson}
                      className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-transparent border border-mint/40 text-mint font-medium text-sm rounded-xl hover:bg-mint/10 hover:border-mint/60 active:scale-95 transition-all"
                    >
                      <PlayIcon />
                      Retomar última aula
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* ── Curso único: stats + CTAs originais ─────────────────── */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 max-w-lg">
                  <div className="bg-navy-lighter/60 border border-slate/10 rounded-xl p-3 sm:p-4 text-center">
                    <div className="flex items-center justify-center mb-1 text-mint">
                      <CheckCircleIcon />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-slate-white">{totalCompleted}</p>
                    <p className="text-xs text-slate mt-0.5">
                      {totalCompleted === 1 ? 'Aula concluída' : 'Aulas concluídas'}
                    </p>
                  </div>
                  <div className="bg-navy-lighter/60 border border-slate/10 rounded-xl p-3 sm:p-4 text-center">
                    <div className="flex items-center justify-center mb-1 text-mint">
                      <LayersIcon />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-slate-white">{totalLessons}</p>
                    <p className="text-xs text-slate mt-0.5">
                      {totalLessons === 1 ? 'Aula disponível' : 'Aulas disponíveis'}
                    </p>
                  </div>
                  <div className="bg-navy-lighter/60 border border-slate/10 rounded-xl p-3 sm:p-4 text-center">
                    <div className="flex items-center justify-center mb-1 text-mint">
                      <BookOpenIcon />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-slate-white">{progressPercent}%</p>
                    <p className="text-xs text-slate mt-0.5">Concluído</p>
                    {totalLessons > 0 && (
                      <div className="mt-2 h-1 bg-navy-lighter rounded-full overflow-hidden">
                        <div
                          className="h-full bg-mint rounded-full transition-all duration-700"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {visibleLastWatched.length > 0 && (
                    <button
                      onClick={handleResumeLesson}
                      className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-mint text-navy font-semibold text-sm rounded-xl hover:bg-mint/90 active:scale-95 transition-all shadow-mint"
                    >
                      <PlayIcon />
                      Retomar aula
                    </button>
                  )}
                  {primaryCourseId && (
                    <Link
                      to={`/curso/${primaryCourseId}/modulos`}
                      className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-transparent border border-mint/40 text-mint font-medium text-sm rounded-xl hover:bg-mint/10 hover:border-mint/60 active:scale-95 transition-all"
                    >
                      Explorar módulos
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── CONTINUAR ASSISTINDO ─────────────────────────────────────────── */}
        {visibleLastWatched.length > 0 && (
          <section className="py-8 sm:py-10 border-b border-slate/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-white">Continuar Assistindo</h2>
                  <p className="text-sm text-slate mt-0.5">{visibleLastWatched.length} aula{visibleLastWatched.length !== 1 ? 's' : ''} em andamento</p>
                </div>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] text-xs text-slate hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                >
                  <TrashIcon />
                  Limpar histórico
                </button>
              </div>

              {/* Carrossel */}
              <div className="relative">
                <button
                  onClick={() => scrollCarousel(-1)}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-navy-light border border-slate/20 rounded-full flex items-center justify-center text-slate hover:text-mint hover:border-mint/30 transition-colors shadow-card hidden sm:flex"
                  aria-label="Anterior"
                >
                  <ChevronLeftIcon />
                </button>

                <div
                  ref={carouselRef}
                  className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {visibleLastWatched.map((video: any, index: number) => {
                    const desktopImg = video.thumbnail || video.bannerContinue || video.bannerMobile || null
                    const mobileImg = video.bannerMobile || video.bannerContinue || video.thumbnail || null
                    const img = isMobile ? mobileImg : desktopImg
                    const watchedSec = Number(video.watchedSeconds || 0)
                    const durationSec = Number(video.durationSeconds || 0)
                    const hasDuration = durationSec > 0
                    const pct = hasDuration ? Math.min(100, Math.round((watchedSec / durationSec) * 100)) : 0
                    const remainingMin = hasDuration ? Math.max(1, Math.ceil((durationSec - watchedSec) / 60)) : 0

                    return (
                      <button
                        key={video.id || video.videoId || video.video_id || video.url || index}
                        onClick={() => goToLesson(video)}
                        className="flex-none w-40 sm:w-52 lg:w-64 group relative rounded-xl overflow-hidden bg-navy-lighter border border-slate/10 hover:border-mint/30 hover:-translate-y-0.5 hover:shadow-card-hover transition-all"
                        title={video.title}
                      >
                        {/* Imagem */}
                        <div className="relative h-28 sm:h-36 bg-navy-lighter">
                          {img ? (
                            <img src={img} alt={video.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-navy-lighter to-navy-light flex items-end p-3">
                              <p className="text-xs font-semibold text-slate-white/90 line-clamp-3 leading-tight">{video.title}</p>
                            </div>
                          )}
                          {/* Overlay play */}
                          <div className="absolute inset-0 bg-navy/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-mint/90 flex items-center justify-center text-navy shadow-mint">
                              <PlayIcon />
                            </div>
                          </div>
                        </div>
                        {/* Info */}
                        <div className="p-3">
                          <p className="text-xs font-medium text-slate-white line-clamp-2 text-left">{video.title}</p>
                          {video.subjectName && (
                            <p className="text-xs text-mint/80 mt-1 truncate text-left">{video.subjectName}</p>
                          )}
                          {/* Barra de progresso */}
                          <div className="mt-2 h-1 bg-navy rounded-full overflow-hidden">
                            <div
                              className="h-full bg-mint rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-slate/60 text-left">
                              {hasDuration
                                ? pct >= 90
                                  ? 'Quase concluída'
                                  : `${remainingMin} min restantes`
                                : 'Em andamento'}
                            </p>
                            {hasDuration && pct < 90 && (
                              <p className="text-xs text-slate/40 tabular-nums">{pct}%</p>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => scrollCarousel(1)}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-navy-light border border-slate/20 rounded-full flex items-center justify-center text-slate hover:text-mint hover:border-mint/30 transition-colors shadow-card hidden sm:flex"
                  aria-label="Próximo"
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── CTA "Comece agora" — nunca assistiu nenhuma aula ─────────────── */}
        {!visibleLastWatched.length && progressLoaded && allLessons.length > 0 && totalCompleted === 0 && (
          <section className="py-8 sm:py-10 border-b border-slate/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="bg-gradient-to-r from-navy-lighter to-navy-light border border-mint/20 rounded-2xl p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                <div className="w-14 h-14 rounded-2xl bg-mint/10 border border-mint/20 flex items-center justify-center flex-shrink-0">
                  <div className="text-mint">
                    <PlayIcon />
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-slate-white">Sua jornada começa agora</h3>
                  <p className="text-sm text-slate mt-1">
                    Você ainda não assistiu nenhuma aula. Acesse o primeiro módulo e comece agora.
                  </p>
                </div>
                <button
                  onClick={() => primaryCourseId && navigate(`/curso/${primaryCourseId}/modulos`)}
                  className="flex-shrink-0 px-5 py-2.5 bg-mint text-navy font-semibold text-sm rounded-xl hover:bg-mint/90 active:scale-95 transition-all shadow-mint"
                >
                  Começar o curso →
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── CTA "Sem histórico" — tem aulas concluídas mas histórico foi limpo ── */}
        {!visibleLastWatched.length && progressLoaded && allLessons.length > 0 && totalCompleted > 0 && (
          <section className="py-8 sm:py-10 border-b border-slate/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="bg-gradient-to-r from-navy-lighter to-navy-light border border-slate/10 rounded-2xl p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                <div className="w-14 h-14 rounded-2xl bg-slate/10 border border-slate/20 flex items-center justify-center flex-shrink-0">
                  <div className="text-slate">
                    <BookOpenIcon />
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-slate-white">Nenhuma aula em andamento</h3>
                  <p className="text-sm text-slate mt-1">
                    Seu histórico de reprodução está vazio. Continue aprendendo acessando os módulos disponíveis.
                  </p>
                </div>
                <button
                  onClick={() => primaryCourseId && navigate(`/curso/${primaryCourseId}/modulos`)}
                  className="flex-shrink-0 px-5 py-2.5 bg-transparent border border-slate/30 text-slate-white font-medium text-sm rounded-xl hover:bg-slate/10 hover:border-slate/50 active:scale-95 transition-all"
                >
                  Explorar módulos →
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── SEUS CURSOS ──────────────────────────────────────────────────── */}
        <section className="py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-8 sm:mb-10 text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center rounded-full border border-mint/20 bg-mint/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-mint">
                Five One
              </span>
              <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-white leading-tight">
                Seus Cursos
              </h2>
              <p className="text-sm sm:text-base text-slate mt-3 leading-relaxed">
                Acesse seus cursos e continue aprendendo.
              </p>
            </div>

            {!enrollmentsLoaded ? (
              <p className="text-center text-slate text-sm py-8">Carregando seus cursos…</p>
            ) : enrolledCourses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate text-sm">Você ainda não está matriculado em nenhum curso.</p>
                <p className="text-slate/60 text-xs mt-1">Entre em contato com o administrador para solicitar acesso.</p>
              </div>
            ) : (
              <div className={`grid gap-5 lg:gap-6 items-stretch ${
                enrolledCourses.length === 1
                  ? 'grid-cols-1 max-w-sm mx-auto'
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              }`}>
                {enrolledCourses.map(({ id, ministry }) => {
                  const label = ministry?.name || id
                  const gradient = ministry?.gradient || 'linear-gradient(135deg, #0f172a, #0369a1)'
                  const bannerUrl = ministry?.banner?.url || ministry?.banner?.dataUrl || null
                  return (
                    <Link
                      key={id}
                      to={`/curso/${id}/modulos`}
                      className="group relative min-h-[280px] sm:min-h-[340px] lg:min-h-[390px] rounded-[28px] overflow-hidden border border-mint/25 bg-navy-lighter hover:border-mint/60 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,229,255,0.16)] transition-all duration-300"
                      aria-label={`Acessar ${label}`}
                    >
                      {bannerUrl ? (
                        <img src={bannerUrl} alt={label} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0" style={{ background: gradient, opacity: 0.7 }} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-navy/10 via-navy/30 to-navy/95" />

                      <div className="absolute top-4 left-4 z-10">
                        <span className="inline-flex items-center rounded-full border border-mint/25 bg-navy/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-mint backdrop-blur-md">
                          Seu curso
                        </span>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center px-6">
                        <p className="text-slate-white font-bold text-xl text-center leading-tight drop-shadow-lg">{label}</p>
                      </div>

                      <div className="absolute right-3 bottom-3 z-10">
                        <div className="inline-flex items-center gap-2 rounded-full border border-mint/20 bg-navy/55 px-3 py-2 text-[12px] font-semibold text-mint backdrop-blur-sm shadow-[0_8px_20px_rgba(2,8,23,0.18)] transition-all group-hover:border-mint/40 group-hover:bg-navy/72">
                          <span>Entrar</span>
                          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── SKELETON (carregando progresso) ──────────────────────────────── */}
        {!progressLoaded && (
          <div className="sr-only" aria-live="polite" aria-label="Carregando progresso..." />
        )}
      </main>

      {/* ── MODAL LIMPAR HISTÓRICO ───────────────────────────────────────────── */}
      <ConfirmModal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => { void handleClearHistory() }}
        title="Limpar histórico"
        description="Ao limpar o histórico, todas as aulas que não foram concluídas terão o progresso reiniciado. As aulas já concluídas continuarão marcadas como concluídas. Deseja continuar?"
        confirmLabel="Limpar histórico"
        loading={clearing}
        danger
      />
    </>
  )
}

const AppRouter = () => <PaginaInicial />

export default AppRouter
