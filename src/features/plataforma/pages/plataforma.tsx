import Header from './Header'
import { Link, useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getCurrentUserId } from '../../../shared/utils/user'
import { fetchUserProgress, deleteProgressExceptForUser } from '../services/progress'
import { listLessons, LessonRef, subscribePlatformContent } from '../services/platformContent'
import {
  COMPLETED_EVENT,
  CompletedLessonInfo,
  mergeCompletedLessons,
  readCompletedLessons,
  clearCompletedLessons,
} from '../../../shared/utils/completedLessons'
import { fetchCompletionsForUser } from '../services/completions'
import { usePlatformUserProfile } from '../hooks/usePlatformUserProfile'
import { ConfirmModal, Modal } from '../../../shared/components/ui'

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

// ── Dados estáticos das formações ─────────────────────────────────────────────

const FORMACOES = [
  {
    id: 'APOSTOLO',
    label: 'Apóstolo',
    img: '/assets/images/apostolo.png',
    active: false,
    message: 'Esta é outra formação ministerial da plataforma. Você pode conhecer essa trilha e, em breve, também poderá acessar a opção para adquiri-la.',
  },
  {
    id: 'PROFETA',
    label: 'Profeta',
    img: '/assets/images/profeta.png',
    active: false,
    message: 'Esta é outra formação ministerial da plataforma. Você pode conhecer essa trilha e, em breve, também poderá acessar a opção para adquiri-la.',
  },
  {
    id: 'EVANGELISTA',
    label: 'Evangelista',
    img: '/assets/images/evangelista.png',
    active: false,
    message: 'Esta é outra formação ministerial da plataforma. Você pode conhecer essa trilha e, em breve, também poderá acessar a opção para adquiri-la.',
  },
  {
    id: 'PASTOR',
    label: 'Pastor',
    img: '/assets/images/pastor.png',
    active: false,
    message: 'Esta é outra formação ministerial da plataforma. Você pode conhecer essa trilha e, em breve, também poderá acessar a opção para adquiri-la.',
  },
  {
    id: 'MESTRE',
    label: 'Mestre',
    img: '/assets/images/mestre.png',
    active: true,
    route: '/modulos-mestre',
  },
]

// ── Componente principal ──────────────────────────────────────────────────────

const PaginaInicial = () => {
  const navigate = useNavigate()
  const { profile } = usePlatformUserProfile()
  const carouselRef = useRef<HTMLDivElement>(null)

  // ── Estado de conteúdo ────────────────────────────────────────────────────
  const [mestreLessons, setMestreLessons] = useState<LessonRef[]>(() =>
    listLessons({ ministryId: 'MESTRE', onlyPublished: true, onlyActive: true })
  )
  const [lastWatchedArray, setLastWatchedArray] = useState<any[]>([])
  const [progressLoaded, setProgressLoaded] = useState(false)
  const [completedMap, setCompletedMap] = useState<Map<string, CompletedLessonInfo>>(() =>
    readCompletedLessons()
  )
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 640px)').matches)

  // ── Modal "em breve" ──────────────────────────────────────────────────────
  const [emBreveMessage, setEmBreveMessage] = useState<string | null>(null)

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

  // ── Subscribe a mudanças de conteúdo ─────────────────────────────────────
  useEffect(() => {
    setMestreLessons(listLessons({ ministryId: 'MESTRE', onlyPublished: true, onlyActive: true }))
    const unsubscribe = subscribePlatformContent(() => {
      setMestreLessons(listLessons({ ministryId: 'MESTRE', onlyPublished: true, onlyActive: true }))
    })
    return () => unsubscribe()
  }, [])

  // ── Sync de completions ───────────────────────────────────────────────────
  useEffect(() => {
    const sync = () => setCompletedMap(readCompletedLessons())
    sync()
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
  const lessonByVideoId = useMemo(() => {
    const map = new Map<string, LessonRef>()
    mestreLessons.forEach((lesson) => map.set(lesson.videoId, lesson))
    return map
  }, [mestreLessons])

  // ── Carregar progresso (localStorage + remoto) ────────────────────────────
  useEffect(() => {
    let active = true

    const getKey = (video: any): string | null => {
      if (!video) return null
      if (typeof video.id === 'string' && video.id) return video.id
      if (typeof video.videoId === 'string' && video.videoId) return video.videoId
      if (typeof video.video_id === 'string' && video.video_id) return video.video_id
      if (typeof video.url === 'string' && video.url) return video.url
      return null
    }

    const mergeByRecency = (items: any[]): any[] => {
      const byKey = new Map<string, any>()
      items.forEach((item) => {
        const key = getKey(item)
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

    let localEnriched: any[] = []
    try {
      const raw = localStorage.getItem('videos_assistidos')
      const parsed = raw ? JSON.parse(raw) : []
      const localArr = mergeByRecency(Array.isArray(parsed) ? parsed : [])
      if (localArr.length) {
        localEnriched = localArr.map((item: any) => {
          const lesson = lessonByVideoId.get(item.id || item.videoId || item.video_id || item.url)
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
      const uid = getCurrentUserId()
      if (!uid) { setProgressLoaded(true); return }
      try {
        const rows = await fetchUserProgress(uid, 24)
        if (!active) return
        if (rows && rows.length) {
          const remote = rows.map(r => {
            const localWatched = (() => {
              try {
                const raw = localStorage.getItem(`fiveone_progress::${r.lesson_id}`)
                if (!raw) return 0
                const parsed = JSON.parse(raw)
                return Number(parsed.watchedSeconds || parsed.watched || 0)
              } catch { return 0 }
            })()
            return {
              id: r.lesson_id, url: '', index: undefined,
              title: r.title, thumbnail: r.thumbnail,
              watchedSeconds: Math.max(r.watched_seconds, localWatched),
              durationSeconds: r.duration_seconds || undefined,
              lastAt: new Date(r.last_at).getTime(),
              subjectName: lessonByVideoId.get(r.lesson_id)?.subjectName,
              bannerContinue: lessonByVideoId.get(r.lesson_id)?.bannerContinue?.url || lessonByVideoId.get(r.lesson_id)?.bannerContinue?.dataUrl || null,
              bannerMobile: lessonByVideoId.get(r.lesson_id)?.bannerMobile?.url || lessonByVideoId.get(r.lesson_id)?.bannerMobile?.dataUrl || null,
            }
          })
          setLastWatchedArray(mergeByRecency([...localEnriched, ...remote]))
        }
        setProgressLoaded(true)

        const completions = await fetchCompletionsForUser(uid)
        if (!active) return
        clearCompletedLessons()
        if (completions && completions.length) {
          setCompletedMap(mergeCompletedLessons(completions))
        } else {
          setCompletedMap(new Map<string, CompletedLessonInfo>())
        }
      } catch {
        if (active) setProgressLoaded(true)
      }
    })()

    return () => { active = false }
  }, [lessonByVideoId])

  // ── Atualiza "Continuar assistindo" ao voltar para a página ───────────────
  // O efeito acima só roda quando lessonByVideoId muda. Quando o aluno volta
  // do streamer (browser back), o localStorage já foi atualizado pelo streamer,
  // mas o estado ainda está desatualizado. Resolvemos re-lendo o localStorage
  // sempre que a aba volta a ficar visível.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== 'visible') return
      try {
        const raw = localStorage.getItem('videos_assistidos')
        if (!raw) return
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed) || !parsed.length) return
        const sorted = [...parsed].sort((a, b) => Number(b.lastAt || 0) - Number(a.lastAt || 0))
        setLastWatchedArray(prev => {
          // só atualiza se o primeiro item mudou (evita re-renders desnecessários)
          const firstNew = sorted[0]?.id || sorted[0]?.videoId || sorted[0]?.video_id
          const firstOld = prev[0]?.id || prev[0]?.videoId || prev[0]?.video_id
          if (firstNew === firstOld && sorted.length === prev.length) return prev
          return sorted
        })
      } catch { /* ignore */ }
    }
    document.addEventListener('visibilitychange', refresh)
    return () => document.removeEventListener('visibilitychange', refresh)
  }, [])

  // ── IDs concluídos ────────────────────────────────────────────────────────
  const completedIds = useMemo(() => new Set(Array.from(completedMap.keys())), [completedMap])

  const getVideoKey = useCallback((video: any): string | null => {
    if (!video) return null
    if (typeof video.id === 'string' && video.id) return video.id
    if (typeof video.videoId === 'string' && video.videoId) return video.videoId
    if (typeof video.video_id === 'string' && video.video_id) return video.video_id
    if (typeof video.url === 'string' && video.url) return video.url
    return null
  }, [])

  const visibleLastWatched = useMemo(() => {
    if (!lastWatchedArray.length) return [] as any[]
    return lastWatchedArray.filter((item) => {
      const key = getVideoKey(item)
      if (!key) return true
      return !completedIds.has(key)
    })
  }, [lastWatchedArray, completedIds, getVideoKey])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalCompleted = completedIds.size
  const totalLessons = mestreLessons.length
  const progressPercent = totalLessons > 0 ? Math.min(100, Math.round((totalCompleted / totalLessons) * 100)) : 0

  // ── Navegar para aula ─────────────────────────────────────────────────────
  const goToLesson = useCallback((video: any) => {
    if (video.id) navigate(`/streamer-mestre?vid=${encodeURIComponent(video.id)}`)
    else if (typeof video.index === 'number') navigate(`/streamer-mestre?i=${video.index}`)
    else navigate(`/streamer-mestre?v=${encodeURIComponent(video.url)}`)
  }, [navigate])

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
      mestreLessons.forEach((lesson) => {
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

    const uid = getCurrentUserId()
    if (uid) await deleteProgressExceptForUser(uid, completedIdList)
    setLastWatchedArray([])
  }, [completedIds, mestreLessons])

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
  const formationLabel = profile?.formationLabel || null

  const orderedFormacoes = useMemo(() => {
    if (!formationLabel) return FORMACOES

    const normalize = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()

    const normalizedFormation = normalize(formationLabel)
    const currentFormation = FORMACOES.find((formacao) => normalize(formacao.label) === normalizedFormation)

    if (!currentFormation) return FORMACOES

    return [
      currentFormation,
      ...FORMACOES.filter((formacao) => formacao.id !== currentFormation.id),
    ]
  }, [formationLabel])

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
              {formationLabel && (
                <p className="text-sm text-slate">
                  Formação: <span className="text-mint font-medium">{formationLabel}</span>
                </p>
              )}
            </div>

            {/* Stats */}
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
                {/* Mini barra de progresso */}
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

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              {visibleLastWatched.length > 0 && (
                <button
                  onClick={() => goToLesson(visibleLastWatched[0])}
                  className="flex items-center gap-2 px-5 py-2.5 bg-mint text-navy font-semibold text-sm rounded-xl hover:bg-mint/90 active:scale-95 transition-all shadow-mint"
                >
                  <PlayIcon />
                  Retomar aula
                </button>
              )}
              <Link
                to="/modulos-mestre"
                className="flex items-center gap-2 px-5 py-2.5 bg-transparent border border-mint/40 text-mint font-medium text-sm rounded-xl hover:bg-mint/10 hover:border-mint/60 active:scale-95 transition-all"
              >
                Explorar módulos
              </Link>
            </div>
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
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
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
                    const desktopImg = video.thumbnail || video.bannerContinue || video.bannerMobile || '/assets/images/miniatura_fundamentos_mestre.png'
                    const mobileImg = video.bannerMobile || video.bannerContinue || video.thumbnail || desktopImg
                    const img = isMobile ? mobileImg : desktopImg
                    const watchedSec = Number(video.watchedSeconds || 0)
                    const durationSec = Number(video.durationSeconds || 0)
                    const effectiveDur = durationSec > 0 ? durationSec : Math.max(watchedSec, 1)
                    const pct = effectiveDur > 0 ? Math.min(100, Math.round((watchedSec / effectiveDur) * 100)) : 0

                    return (
                      <button
                        key={video.id || video.videoId || video.video_id || video.url || index}
                        onClick={() => goToLesson(video)}
                        className="flex-none w-40 sm:w-52 lg:w-64 group relative rounded-xl overflow-hidden bg-navy-lighter border border-slate/10 hover:border-mint/30 hover:-translate-y-0.5 hover:shadow-card-hover transition-all"
                        title={video.title}
                      >
                        {/* Imagem */}
                        <div className="relative h-28 sm:h-36 bg-navy-lighter">
                          {img && (
                            <img src={img} alt={video.title} className="w-full h-full object-cover" />
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
                          <p className="text-xs text-slate/60 mt-1 text-left">
                            {pct}% assistido
                          </p>
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

        {/* ── CTA "Comece agora" (sem histórico, com conteúdo) ─────────────── */}
        {!visibleLastWatched.length && progressLoaded && mestreLessons.length > 0 && (
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
                    Você ainda não assistiu nenhuma aula. Acesse o primeiro módulo e comece sua formação ministerial.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/modulos-mestre')}
                  className="flex-shrink-0 px-5 py-2.5 bg-mint text-navy font-semibold text-sm rounded-xl hover:bg-mint/90 active:scale-95 transition-all shadow-mint"
                >
                  Acessar Módulo 1 →
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── FORMAÇÃO MINISTERIAL ─────────────────────────────────────────── */}
        <section className="py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-8 sm:mb-10 text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center rounded-full border border-mint/20 bg-mint/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-mint">
                Five One
              </span>
              <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-white leading-tight">
                Sua Formação Ministerial
              </h2>
              <p className="text-sm sm:text-base text-slate mt-3 leading-relaxed">
                Acompanhe sua jornada de formação na plataforma.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 lg:gap-6 items-stretch">
              {orderedFormacoes.map((formacao) =>
                formacao.active ? (
                  <Link
                    key={formacao.id}
                    to={formacao.route!}
                    className="group relative min-h-[280px] sm:min-h-[340px] lg:min-h-[390px] rounded-[28px] overflow-hidden border border-mint/25 bg-navy-lighter hover:border-mint/60 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,229,255,0.16)] transition-all duration-300"
                    aria-label={`Acessar formação ${formacao.label}`}
                  >
                    <img
                      src={formacao.img}
                      alt={formacao.label}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-navy/10 via-navy/30 to-navy/95" />

                    <div className="absolute top-4 left-4 z-10 flex items-start">
                      <span className="inline-flex items-center rounded-full border border-mint/25 bg-navy/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-mint backdrop-blur-md">
                        Sua trilha disponível
                      </span>
                    </div>

                    <div className="absolute right-3 bottom-3 z-10">
                      <div className="inline-flex items-center gap-2 rounded-full border border-mint/20 bg-navy/55 px-3 py-2 text-[12px] font-semibold text-mint backdrop-blur-sm shadow-[0_8px_20px_rgba(2,8,23,0.18)] transition-all group-hover:border-mint/40 group-hover:bg-navy/72">
                        <span>Entrar</span>
                        <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <button
                    key={formacao.id}
                    onClick={() => setEmBreveMessage(formacao.message ?? null)}
                    className="group relative min-h-[320px] sm:min-h-[360px] lg:min-h-[390px] rounded-[28px] overflow-hidden border border-slate/15 bg-navy-lighter text-left hover:border-slate/35 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(2,8,23,0.42)] transition-all duration-300"
                    aria-label={`${formacao.label} — em breve`}
                  >
                    <img
                      src={formacao.img}
                      alt={`${formacao.label} - em breve`}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.02] transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-navy/5 via-navy/35 to-navy/95" />

                    <div className="absolute top-4 left-4 z-10 flex items-start">
                      <span className="inline-flex items-center rounded-full border border-slate/20 bg-navy/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-light backdrop-blur-md">
                        Outras trilhas
                      </span>
                    </div>

                    <div className="absolute right-3 bottom-3 z-10">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-navy/55 px-3 py-2 text-[12px] font-semibold text-slate-light backdrop-blur-sm shadow-[0_8px_20px_rgba(2,8,23,0.18)] transition-all group-hover:border-mint/25 group-hover:bg-navy/72 group-hover:text-mint">
                        <span>Detalhes</span>
                        <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                      </div>
                    </div>
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        {/* ── SKELETON (carregando progresso) ──────────────────────────────── */}
        {!progressLoaded && (
          <div className="sr-only" aria-live="polite" aria-label="Carregando progresso..." />
        )}
      </main>

      {/* ── MODAL "EM BREVE" ────────────────────────────────────────────────── */}
      <Modal
        open={!!emBreveMessage}
        onClose={() => setEmBreveMessage(null)}
        title="Outras formações ministeriais"
        size="sm"
      >
        <p className="text-sm text-slate-light leading-relaxed">{emBreveMessage}</p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setEmBreveMessage(null)}
            className="px-4 py-2 bg-mint text-navy text-sm font-semibold rounded-xl hover:bg-mint/90 transition-colors"
          >
            Entendido
          </button>
        </div>
      </Modal>

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
