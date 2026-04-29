import Header from './Header'
import { Link, useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getCurrentUserId } from '../../../shared/utils/user'
import { deleteProgressExceptForUser } from '../services/progress'
import { listLessons, LessonRef, subscribePlatformContent, getMinistry, usePlatformContent } from '../services/platformContent'
import {
  COMPLETED_EVENT,
  readCompletedLessons,
  clearCompletedLessons,
} from '../../../shared/utils/completedLessons'
import { usePlatformUserProfile } from '../hooks/usePlatformUserProfile'
import { ConfirmModal } from '../../../shared/components/ui'
import { useAuth } from '../../../shared/contexts/AuthContext'
import { getEnrollments } from '../services/userAccount'
import { useStudentProgress, recoverLocalProgress } from '../hooks/useStudentProgress'

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
  useEffect(() => {
    if (!effectiveUid) return
    try {
      const storedUser = localStorage.getItem('fiveone_active_user')
      const wasLoggedOut = storedUser === '__logged_out__'
      const isDifferentActiveUser = storedUser && !wasLoggedOut && storedUser !== effectiveUid
      const lastEmail = localStorage.getItem('fiveone_last_active_email')
      const isNewUser = wasLoggedOut
        ? (lastEmail !== null ? lastEmail !== effectiveUid : true)
        : isDifferentActiveUser
      if (isNewUser) {
        try { localStorage.removeItem('videos_assistidos') } catch {}
        try { localStorage.removeItem('fiveone_last_lesson') } catch {}
        clearCompletedLessons()
        setSessionCompletions(new Set())
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
      try { localStorage.setItem('fiveone_active_user', effectiveUid) } catch {}
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUid])

  // ── Estado de conteúdo ────────────────────────────────────────────────────
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([])
  const [enrollmentsLoaded, setEnrollmentsLoaded] = useState(false)
  const [allLessons, setAllLessons] = useState<LessonRef[]>([])
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 640px)').matches)

  // ── Modal limpar histórico ────────────────────────────────────────────────
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearing, setClearing] = useState(false)

  // ── Completions in-session (optimistic updates do streamer) ───────────────
  const [sessionCompletions, setSessionCompletions] = useState<Set<string>>(new Set())

  // ── Dados do aluno — banco é a ÚNICA fonte de verdade ────────────────────
  const {
    progress,
    completedIds: dbCompletedIds,
    loading: progressLoading,
    refresh: refreshProgress,
  } = useStudentProgress(effectiveUid)

  // completedIds = DB + aulas concluídas nesta sessão (optimistic)
  const completedIds = useMemo(
    () => new Set([...dbCompletedIds, ...sessionCompletions]),
    [dbCompletedIds, sessionCompletions],
  )

  // ── Responsividade ────────────────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(mq.matches)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // ── Matrículas ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!effectiveUid) return
    getEnrollments(effectiveUid)
      .then(ids => { setEnrolledCourseIds(ids); setEnrollmentsLoaded(true) })
      .catch(() => { setEnrolledCourseIds([]); setEnrollmentsLoaded(true) })
  }, [effectiveUid])

  // ── Aulas dos cursos matriculados ─────────────────────────────────────────
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

  // ── Completions in-session: escuta streamer via COMPLETED_EVENT ───────────
  useEffect(() => {
    const handler = () => setSessionCompletions(new Set(readCompletedLessons().keys()))
    window.addEventListener(COMPLETED_EVENT, handler)
    return () => window.removeEventListener(COMPLETED_EVENT, handler)
  }, [])

  // ── Map lessonId → LessonRef ──────────────────────────────────────────────
  const lessonByVideoId = useMemo(() => {
    const map = new Map<string, LessonRef>()
    allLessons.forEach((lesson) => {
      map.set(lesson.videoId, lesson)
      if (lesson.id && lesson.id !== lesson.videoId) map.set(lesson.id, lesson)
    })
    return map
  }, [allLessons])
  lessonByVideoIdRef.current = lessonByVideoId

  // ── lastWatchedArray — derivado do banco, enriquecido com metadados ───────
  // Não usa localStorage como fonte de exibição.
  // O mesmo usuário vê os mesmos dados em qualquer navegador/dispositivo.
  const lastWatchedArray = useMemo((): any[] => {
    const lbv = lessonByVideoId
    return progress.map(r => ({
      id:              r.lesson_id,
      url:             '',
      title:           r.title,
      thumbnail:       r.thumbnail,
      watchedSeconds:  r.watched_seconds,
      durationSeconds: r.duration_seconds || undefined,
      lastAt:          new Date(r.last_at).getTime(),
      subjectName:     lbv.get(r.lesson_id)?.subjectName,
      bannerContinue:  lbv.get(r.lesson_id)?.bannerContinue?.url  || lbv.get(r.lesson_id)?.bannerContinue?.dataUrl  || null,
      bannerMobile:    lbv.get(r.lesson_id)?.bannerMobile?.url    || lbv.get(r.lesson_id)?.bannerMobile?.dataUrl    || null,
    }))
  }, [progress, lessonByVideoId])

  // progressLoaded para compatibilidade com lógica de UI existente
  const progressLoaded = !progressLoading

  // ── Popula localStorage como cache derivado (player seek + módulos) ───────
  // O banco é a fonte de verdade. Este efeito propaga dados do banco para o
  // localStorage para que: (a) o player saiba onde fazer seek, (b) páginas de
  // módulos que lêem videos_assistidos mostrem progresso correto.
  useEffect(() => {
    if (!progress.length) return
    const lbv = lessonByVideoId
    progress.forEach(r => {
      if (!r.lesson_id || r.watched_seconds <= 0) return
      try {
        const localKey = `fiveone_progress::${r.lesson_id}`
        const existing = localStorage.getItem(localKey)
        const localWatched = existing ? Number(JSON.parse(existing).watchedSeconds || 0) : 0
        if (r.watched_seconds >= localWatched) {
          localStorage.setItem(localKey, JSON.stringify({
            watchedSeconds:  r.watched_seconds,
            durationSeconds: r.duration_seconds || 0,
            lastAt:          new Date(r.last_at).getTime(),
          }))
        }
      } catch {}
    })
    try {
      const arr = progress.slice(0, 12).map(r => {
        const lesson = lbv.get(r.lesson_id)
        return {
          id:              r.lesson_id,
          title:           r.title,
          thumbnail:       r.thumbnail,
          watchedSeconds:  r.watched_seconds,
          durationSeconds: r.duration_seconds || undefined,
          lastAt:          new Date(r.last_at).getTime(),
          subjectName:     lesson?.subjectName,
          bannerContinue:  lesson?.bannerContinue?.url  || lesson?.bannerContinue?.dataUrl  || null,
          bannerMobile:    lesson?.bannerMobile?.url    || lesson?.bannerMobile?.dataUrl    || null,
        }
      })
      localStorage.setItem('videos_assistidos', JSON.stringify(arr))
      if (progress[0]?.lesson_id) {
        localStorage.setItem('fiveone_last_lesson', progress[0].lesson_id)
      }
    } catch {}
  }, [progress, lessonByVideoId])

  // ── Recovery sync: localStorage → banco (uma vez por sessão) ─────────────
  // Faz upload de progresso salvo localmente que nunca chegou ao banco.
  // Cobre o período em que a RPC falhava com HTTP 400 (bug float→int).
  // Após o upload, faz refresh para que o carousel reflita os novos dados.
  useEffect(() => {
    if (!effectiveUid) return
    recoverLocalProgress(
      effectiveUid,
      id => lessonByVideoIdRef.current.get(id),
      progress,
    ).then(() => refreshProgress()).catch(() => {})
  // Roda uma vez por sessão (flag sessionStorage interno ao hook)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUid])

  // ── IDs concluídos ────────────────────────────────────────────────────────
  // completedIds já declarado acima (merge DB + session)


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

  // "Retomar aula" — usa progress[0] do banco (mais recente assistida) como fonte de verdade.
  // O banco é cross-device, então funciona em qualquer navegador/perfil.
  const handleResumeLesson = useCallback(() => {
    if (progress.length > 0) {
      const latest = progress[0]
      const lesson = lessonByVideoId.get(latest.lesson_id)
      if (lesson && enrolledCourseIds.includes(lesson.ministryId)) {
        navigate(`/curso/${lesson.ministryId}/aula?vid=${encodeURIComponent(latest.lesson_id)}`)
        return
      }
    }
    if (visibleLastWatched.length > 0) goToLesson(visibleLastWatched[0])
    else if (primaryCourseId) navigate(`/curso/${primaryCourseId}/aula`)
  }, [navigate, progress, visibleLastWatched, goToLesson, lessonByVideoId, primaryCourseId, enrolledCourseIds])

  // ── Limpar histórico ──────────────────────────────────────────────────────
  const performClearHistory = useCallback(async () => {
    // Mantém no banco apenas as aulas concluídas; remove o restante
    const completedIdList = Array.from(completedIds).filter((id): id is string => typeof id === 'string' && id.length > 0)
    const uid = effectiveUid
    if (uid) await deleteProgressExceptForUser(uid, completedIdList)

    // Limpa cache local correspondente (player seek + módulos)
    try { localStorage.removeItem('videos_assistidos') } catch {}
    try { localStorage.removeItem('fiveone_last_lesson') } catch {}
    const progressKeys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('fiveone_progress::')) {
        const base = key.slice('fiveone_progress::'.length)
        if (!completedIds.has(base)) progressKeys.push(key)
      }
    }
    progressKeys.forEach(key => { try { localStorage.removeItem(key) } catch {} })
    try {
      const toRemove: string[] = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key?.startsWith('fiveone_progress_sync_')) toRemove.push(key)
      }
      toRemove.forEach(k => { try { sessionStorage.removeItem(k) } catch {} })
    } catch {}

    // Re-fetch: o carousel reflete o estado real do banco após a limpeza
    refreshProgress()
  }, [completedIds, effectiveUid, refreshProgress])

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
          {/* Foto de fundo — desktop e mobile diferentes via <picture>.
              Para trocar, substitua os arquivos em /public/assets/images/. */}
          <picture aria-hidden="true">
            <source media="(min-width: 768px)" srcSet="/assets/images/banner-login-fiveone.png" />
            <img
              src="/assets/images/BemVindo.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
              draggable={false}
              loading="eager"
            />
          </picture>

          {/* Overlay escurecedor para garantir legibilidade do texto */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-navy/85 via-navy/70 to-navy/95 sm:bg-gradient-to-r sm:from-navy/90 sm:via-navy/65 sm:to-navy/40"
          />

          {/* Decoração de fundo (manchas mint sutis) */}
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
                  // Prioriza URL pública (Storage). Aceita dataUrl apenas se for pequeno
                  // (<200 KB) — dataUrls gigantes bloqueiam o load e estouram a página.
                  const banner = ministry?.banner
                  const dataUrlSafe = banner?.dataUrl && banner.dataUrl.length < 200_000 ? banner.dataUrl : null
                  const bannerUrl = banner?.url || dataUrlSafe || null
                  // Iniciais do curso para o fallback (até 2 letras).
                  const initials = (label || id).replace(/[^A-Za-zÀ-ú0-9]+/g, ' ').trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('')
                  return (
                    <Link
                      key={id}
                      to={`/curso/${id}/modulos`}
                      className="group relative min-h-[280px] sm:min-h-[340px] lg:min-h-[390px] rounded-[28px] overflow-hidden border border-mint/25 bg-navy-lighter hover:border-mint/60 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,229,255,0.16)] transition-all duration-300"
                      aria-label={`Acessar ${label}`}
                    >
                      {bannerUrl ? (
                        <img src={bannerUrl} alt={label} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <>
                          <div className="absolute inset-0" style={{ background: gradient }} />
                          {/* Padrão decorativo no fallback — círculos mint translúcidos + iniciais grandes */}
                          <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-mint/15 blur-2xl" />
                            <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-mint/10 blur-3xl" />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-[120px] sm:text-[140px] font-black text-mint/15 leading-none select-none">
                              {initials || '★'}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-navy/10 via-navy/35 to-navy/95" />

                      <div className="absolute top-4 left-4 z-10">
                        <span className="inline-flex items-center rounded-full border border-mint/25 bg-navy/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-mint backdrop-blur-md">
                          Seu curso
                        </span>
                      </div>

                      <div className="absolute left-4 right-4 bottom-16 z-10 sm:bottom-20">
                        <p className="text-slate-white font-bold text-xl sm:text-2xl leading-tight drop-shadow-lg">{label}</p>
                        {ministry?.tagline && (
                          <p className="text-slate-light/80 text-xs sm:text-sm mt-1.5 line-clamp-2">{ministry.tagline}</p>
                        )}
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
