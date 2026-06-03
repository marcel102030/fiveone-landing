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
// useEffectBlog/useStateBlog removidos: card Para Ler agora usa imagem fixa
import apologeticaCover from '../../institucional/assets/images/capa_curso_apologetica.jpg'
import imgParaLer from '../../institucional/assets/images/ParaLer.png'
import imgTeste from '../../institucional/assets/images/Teste5Ministerios.png'
import imgProximosCursos from '../../institucional/assets/images/ProximosCursos.png'
import imgLeveOs5 from '../../institucional/assets/images/LeveOs5ministerios.png'
// react-icons removidos: cards agora usam imagens de capa
import iconApostolo from '../../../assets/images/icons/apostolo.png'
import iconProfeta from '../../../assets/images/icons/profeta.png'
import iconEvangelista from '../../../assets/images/icons/evangelista.png'
import iconPastor from '../../../assets/images/icons/pastor.png'
import iconMestre from '../../../assets/images/icons/mestre.png'
// listPublishedPosts removido: card Para Ler agora usa imagem fixa sem fetch

// Capas locais por curso, usadas como fallback quando não há banner no banco.
// O banner do admin (Storage) sempre tem prioridade sobre estas.
const LOCAL_COURSE_COVERS: { match: RegExp; src: string }[] = [
  { match: /apolog/i, src: apologeticaCover },
]

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

  // enrolledCourses já calculado acima — courseStats removido (multi-curso futuro)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Header />

      <main id="inicio" className="min-h-screen bg-navy relative overflow-x-hidden">
        {/* ── FUNDO DECORATIVO GLOBAL ─────────────────────────────────────── */}
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">

          {/* Grid de pontos — padrão profissional */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: 'radial-gradient(circle, #64ffda 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }} />

          {/* Glows coloridos */}
          <div className="absolute top-[10%] -right-32 w-[700px] h-[700px] rounded-full bg-mint/[0.08] blur-[150px]" />
          <div className="absolute top-[50%] -left-32 w-[600px] h-[600px] rounded-full bg-mint/[0.06] blur-[130px]" />
          <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-indigo-500/[0.08] blur-[150px]" />

          {/* Ícones dos 5 Ministérios — decoração faded nos cantos */}
          <img src={iconApostolo}    alt="" className="absolute top-[8%]   left-[3%]   w-16 opacity-[0.06] grayscale" />
          <img src={iconProfeta}     alt="" className="absolute top-[8%]   right-[3%]  w-14 opacity-[0.06] grayscale" />
          <img src={iconEvangelista} alt="" className="absolute top-[38%]  left-[2%]   w-14 opacity-[0.06] grayscale" />
          <img src={iconPastor}      alt="" className="absolute top-[62%]  right-[2%]  w-16 opacity-[0.06] grayscale" />
          <img src={iconMestre}      alt="" className="absolute bottom-[8%] left-[3%]  w-14 opacity-[0.06] grayscale" />
        </div>

        {/* ── HERO REDESENHADO ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-slate/10">
          {/* Fundo decorativo do hero (sem foto — consistente com o resto) */}
          <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {/* Gradiente base */}
            <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-navy-light/60" />
            {/* Glow central mint */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-mint/[0.09] blur-[120px]" />
            {/* Glow azul canto direito */}
            <div className="absolute -top-20 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.10] blur-[120px]" />
            {/* Referência bíblica discreta */}
            <span className="absolute top-5 left-6 text-2xs font-medium text-mint/[0.18] tracking-[0.35em] uppercase select-none">
              Efésios 4:11–16
            </span>
          </div>

          {/* ── NOVO HERO: saudação + progresso + próxima aula ────────────── */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">

              {/* Esquerda: saudação + anel de progresso */}
              <div className="flex items-center gap-6 flex-shrink-0">
                {/* Anel SVG de progresso */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(100,255,218,0.12)" strokeWidth="6" />
                    <circle
                      cx="40" cy="40" r="34" fill="none"
                      stroke="#64ffda" strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPercent / 100)}`}
                      style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-extrabold text-mint leading-none">{progressPercent}%</span>
                    <span className="text-2xs text-slate leading-none mt-0.5">concluído</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-white">
                    Olá, {firstName}!
                  </h1>
                  <p className="text-sm text-slate mt-1">
                    {totalCompleted === 0
                      ? 'Sua jornada começa agora.'
                      : `${totalCompleted} de ${totalLessons} aulas concluídas.`}
                  </p>
                  {/* Nome do curso que está estudando */}
                  {enrolledCourses.length > 0 && (
                    <p className="text-2xs text-mint/70 mt-1.5 uppercase tracking-wider font-semibold">
                      {enrolledCourses[0].ministry?.name || 'Apologética'}
                    </p>
                  )}
                </div>
              </div>

              {/* Direita: CTA adaptativo ao estado do aluno */}
              {progressLoaded && primaryCourseId && (
                <div className="flex-1">
                  {progressPercent === 100 ? (
                    /* Curso 100% concluído → parabéns + ir para certificado */
                    <Link
                      to="/meus-certificados"
                      className="group w-full flex items-center gap-4 bg-mint/10 border border-mint/40 hover:border-mint/70 hover:bg-mint/15 rounded-2xl p-4 sm:p-5 transition-all text-left"
                    >
                      <div className="w-12 h-12 rounded-xl bg-mint flex items-center justify-center text-navy shadow-mint flex-shrink-0 text-xl">
                        🎓
                      </div>
                      <div className="flex-1">
                        <p className="text-2xs text-mint font-semibold uppercase tracking-wider mb-0.5">Parabéns, você concluiu!</p>
                        <p className="text-slate-white font-semibold text-sm sm:text-base">Ver meu certificado</p>
                      </div>
                      <span className="text-mint text-lg group-hover:translate-x-1 transition-transform flex-shrink-0">→</span>
                    </Link>
                  ) : visibleLastWatched.length > 0 ? (
                    /* Tem aula em andamento → botão grande de retomar */
                    <button
                      onClick={handleResumeLesson}
                      className="group w-full flex items-center gap-4 bg-navy-lighter/80 border border-mint/25 hover:border-mint/60 rounded-2xl p-4 sm:p-5 transition-all hover:shadow-mint text-left"
                    >
                      {/* Thumbnail da última aula */}
                      <div className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden bg-navy flex-shrink-0">
                        {visibleLastWatched[0]?.thumbnail
                          ? <img src={visibleLastWatched[0].thumbnail} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-navy-light" />
                        }
                        <div className="absolute inset-0 bg-navy/40 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center text-navy shadow-mint">
                            <PlayIcon />
                          </div>
                        </div>
                        {/* Barra de progresso na thumbnail */}
                        {(() => {
                          const v = visibleLastWatched[0]
                          const pct = v?.durationSeconds > 0 ? Math.min(100, Math.round((v.watchedSeconds / v.durationSeconds) * 100)) : 0
                          return pct > 0 ? (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-navy/60">
                              <div className="h-full bg-mint" style={{ width: `${pct}%` }} />
                            </div>
                          ) : null
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-2xs text-mint font-semibold uppercase tracking-wider mb-0.5">Continuar onde parou</p>
                        <p className="text-slate-white font-semibold text-sm sm:text-base line-clamp-2 leading-snug">
                          {visibleLastWatched[0]?.title}
                        </p>
                        {visibleLastWatched[0]?.subjectName && (
                          <p className="text-xs text-slate mt-0.5">{visibleLastWatched[0].subjectName}</p>
                        )}
                      </div>
                      <span className="text-mint text-lg group-hover:translate-x-1 transition-transform flex-shrink-0">→</span>
                    </button>
                  ) : (
                    /* Nunca assistiu → CTA para começar */
                    <button
                      onClick={() => navigate(`/curso/${primaryCourseId}/modulos`)}
                      className="group w-full flex items-center gap-4 bg-mint/10 border border-mint/30 hover:border-mint/60 hover:bg-mint/15 rounded-2xl p-4 sm:p-5 transition-all text-left"
                    >
                      <div className="w-12 h-12 rounded-xl bg-mint/20 border border-mint/30 flex items-center justify-center text-mint flex-shrink-0">
                        <PlayIcon />
                      </div>
                      <div className="flex-1">
                        <p className="text-2xs text-mint font-semibold uppercase tracking-wider mb-0.5">Pronto para começar?</p>
                        <p className="text-slate-white font-semibold text-sm sm:text-base">Acessar a primeira aula do curso</p>
                      </div>
                      <span className="text-mint text-lg group-hover:translate-x-1 transition-transform flex-shrink-0">→</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── JORNADA — steps de progresso ────────────────────────────────── */}
        {primaryCourseId && progressLoaded && allLessons.length > 0 && (() => { // eslint-disable-line
          const subjects = new Map<string, { name: string; lessons: LessonRef[] }>()
          allLessons.filter(l => l.ministryId === primaryCourseId).forEach(l => {
            const key = l.subjectName || l.subjectId || 'Módulo'
            if (!subjects.has(key)) subjects.set(key, { name: l.subjectName || l.subjectId || key, lessons: [] })
            subjects.get(key)!.lessons.push(l)
          })
          const modules = Array.from(subjects.values())
          if (modules.length < 2) return null

          // Calcula progresso por módulo
          const mods = modules.map((mod, idx) => {
            const done = mod.lessons.filter(l => completedIds.has(l.videoId) || completedIds.has(l.id)).length
            const total = mod.lessons.length
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            const isComplete = pct === 100
            const isCurrent = done > 0 && pct < 100
            const isNext = !isComplete && !isCurrent && idx === modules.findIndex((_, i) => {
              const d2 = modules[i].lessons.filter(l => completedIds.has(l.videoId) || completedIds.has(l.id)).length
              return d2 === 0
            })
            return { ...mod, done, total, pct, isComplete, isCurrent, isNext }
          })

          return (
            <section className="relative z-10 py-8 sm:py-12 border-b border-slate/10 bg-navy-light/50 overflow-hidden">
              <style>{`
                @keyframes pulse-ring {
                  0%, 100% { box-shadow: 0 0 0 0 rgba(100,255,218,0.4); }
                  50% { box-shadow: 0 0 0 8px rgba(100,255,218,0); }
                }
                .step-pulse { animation: pulse-ring 2s ease-in-out infinite; }
              `}</style>
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden select-none">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[900px] h-[220px] rounded-full bg-mint/[0.08] blur-[80px]" />
                <span className="absolute top-4 right-8 text-2xs font-medium text-mint/[0.18] tracking-[0.35em] uppercase select-none">Ef 4:11–16</span>
              </div>

              <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-base font-bold text-slate-white">Sua jornada no curso</h2>
                  <span className="text-2xs text-slate tabular-nums">
                    {mods.filter(m => m.isComplete).length}/{mods.length} módulos concluídos
                  </span>
                </div>

                {/* Steps — horizontalmente scrollável em mobile */}
                <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none' }}>
                  <div className="flex items-start" style={{ minWidth: `${mods.length * 160}px` }}>
                    {mods.map((mod, idx) => {
                      const isLast = idx === mods.length - 1
                      const lineFilledPct = mod.isComplete ? 100 : mod.isCurrent ? mod.pct : 0

                      return (
                        <div key={idx} className="flex items-start flex-1 min-w-0">
                          {/* Step + label */}
                          <div
                            className="flex flex-col items-center flex-shrink-0 cursor-pointer group/step"
                            style={{ width: 100 }}
                            onClick={() => primaryCourseId && navigate(`/curso/${primaryCourseId}/modulos`)}
                            title={mod.name}
                          >
                            {/* Círculo */}
                            <div className="relative mb-3">
                              {/* Anel externo animado (só no atual) */}
                              {mod.isCurrent && (
                                <div className="absolute -inset-1.5 rounded-full border-2 border-mint/40 step-pulse" />
                              )}
                              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                mod.isComplete
                                  ? 'bg-mint text-navy shadow-[0_0_16px_rgba(100,255,218,0.4)]'
                                  : mod.isCurrent
                                  ? 'bg-navy border-2 border-mint text-mint shadow-[0_0_12px_rgba(100,255,218,0.25)]'
                                  : mod.isNext
                                  ? 'bg-navy-lighter border-2 border-slate/40 text-slate-light'
                                  : 'bg-navy-lighter border border-slate/20 text-slate/60'
                              }`}>
                                {mod.isComplete ? (
                                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                  </svg>
                                ) : (
                                  <span>{idx + 1}</span>
                                )}
                              </div>

                              {/* Mini progresso no círculo (arco SVG) se em andamento */}
                              {mod.isCurrent && mod.pct > 0 && (
                                <svg className="absolute inset-0 w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                                  <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(100,255,218,0.15)" strokeWidth="3"/>
                                  <circle
                                    cx="20" cy="20" r="17" fill="none"
                                    stroke="#64ffda" strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 17}`}
                                    strokeDashoffset={`${2 * Math.PI * 17 * (1 - mod.pct / 100)}`}
                                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                  />
                                </svg>
                              )}
                            </div>

                            {/* Nome do módulo */}
                            <p className={`text-center text-2xs leading-tight px-1 line-clamp-2 transition-colors ${
                              mod.isComplete ? 'text-mint/80 font-semibold'
                              : mod.isCurrent ? 'text-slate-white font-semibold'
                              : 'text-slate/70'
                            }`} style={{ maxWidth: 100 }}>
                              {mod.name}
                            </p>

                            {/* Aulas */}
                            <span className={`text-2xs tabular-nums mt-1 ${mod.isComplete ? 'text-mint/60' : 'text-slate/50'}`}>
                              {mod.done}/{mod.total}
                            </span>
                          </div>

                          {/* Linha conectora (entre steps) */}
                          {!isLast && (
                            <div className="flex-1 relative mt-5 mx-1" style={{ height: 2 }}>
                              {/* Trilha base */}
                              <div className="absolute inset-0 bg-slate/15 rounded-full" />
                              {/* Preenchimento de progresso */}
                              <div
                                className="absolute inset-y-0 left-0 bg-mint rounded-full transition-all duration-700"
                                style={{ width: `${lineFilledPct}%` }}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </section>
          )
        })()}

        {/* ── CONTINUAR ASSISTINDO ─────────────────────────────────────────── */}
        {visibleLastWatched.length > 0 && (
          <section className="relative z-10 py-8 sm:py-10 border-b border-slate/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-slate-white">
                    {visibleLastWatched.length === 1 ? 'Em andamento' : 'Continuar Assistindo'}
                  </h2>

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
              <div className="relative">
                <button onClick={() => scrollCarousel(-1)} className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-navy-light border border-slate/20 rounded-full flex items-center justify-center text-slate hover:text-mint hover:border-mint/30 transition-colors shadow-card hidden sm:flex" aria-label="Anterior"><ChevronLeftIcon /></button>
                <div ref={carouselRef} className="flex gap-4 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                  {visibleLastWatched.map((video: any, index: number) => {
                    const img = isMobile ? (video.bannerMobile || video.bannerContinue || video.thumbnail) : (video.thumbnail || video.bannerContinue || video.bannerMobile)
                    const watchedSec = Number(video.watchedSeconds || 0)
                    const durationSec = Number(video.durationSeconds || 0)
                    const hasDuration = durationSec > 0
                    const pct = hasDuration ? Math.min(100, Math.round((watchedSec / durationSec) * 100)) : 0
                    const remainingMin = hasDuration ? Math.max(1, Math.ceil((durationSec - watchedSec) / 60)) : 0
                    return (
                      <button key={video.id || video.videoId || video.video_id || video.url || index} onClick={() => goToLesson(video)} className="flex-none w-40 sm:w-52 lg:w-64 group relative rounded-xl overflow-hidden bg-navy-lighter border border-slate/10 hover:border-mint/30 hover:-translate-y-0.5 hover:shadow-card-hover transition-all" title={video.title}>
                        <div className="relative h-28 sm:h-36 bg-navy-lighter">
                          {img ? <img src={img} alt={video.title} className="w-full h-full object-cover" /> : <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-navy-lighter to-navy-light flex items-end p-3"><p className="text-xs font-semibold text-slate-white/90 line-clamp-3 leading-tight">{video.title}</p></div>}
                          <div className="absolute inset-0 bg-navy/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><div className="w-10 h-10 rounded-full bg-mint/90 flex items-center justify-center text-navy shadow-mint"><PlayIcon /></div></div>
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-medium text-slate-white line-clamp-2 text-left">{video.title}</p>
                          {video.subjectName && <p className="text-xs text-mint/80 mt-1 truncate text-left">{video.subjectName}</p>}
                          <div className="mt-2 h-1 bg-navy rounded-full overflow-hidden"><div className="h-full bg-mint rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-slate/60 text-left">{hasDuration ? pct >= 90 ? 'Quase concluída' : `${remainingMin} min restantes` : 'Em andamento'}</p>
                            {hasDuration && pct < 90 && <p className="text-xs text-slate/40 tabular-nums">{pct}%</p>}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <button onClick={() => scrollCarousel(1)} className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-navy-light border border-slate/20 rounded-full flex items-center justify-center text-slate hover:text-mint hover:border-mint/30 transition-colors shadow-card hidden sm:flex" aria-label="Próximo"><ChevronRightIcon /></button>
              </div>
            </div>
          </section>
        )}

        {/* ── EXPLORE TAMBÉM (cursos + leituras) ───────────────────────────── */}
        <section className="relative z-10 py-10 sm:py-14 border-t border-slate/10 bg-navy-light/40">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-mint/[0.10] blur-[100px]" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-8">
              <p className="text-2xs text-mint font-semibold uppercase tracking-widest mb-1">Explore também</p>
              <h2 className="text-lg font-bold text-slate-white">Seus Cursos</h2>
              <p className="text-sm text-slate mt-0.5">Todos os cursos disponíveis para você.</p>
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
                  const localCover = LOCAL_COURSE_COVERS.find((c) => c.match.test(label) || c.match.test(id))?.src || null
                  const bannerUrl = banner?.url || dataUrlSafe || localCover
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
                            <span className="text-[120px] sm:text-[72px] font-black text-mint/15 leading-none select-none">
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

        {/* ── DESCUBRA MAIS NO FIVE ONE ────────────────────────────────────── */}
        <section className="relative z-10 py-10 sm:py-14 border-t border-slate/10 overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden select-none">
            <div className="absolute top-0 left-0 w-[500px] h-[300px] rounded-full bg-indigo-500/[0.10] blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full bg-mint/[0.10] blur-[100px]" />
            {/* Ícones dos 5 ministérios — fileira discreta no topo */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-10 opacity-[0.06] grayscale">
              <img src={iconApostolo}    alt="" className="w-9" />
              <img src={iconProfeta}     alt="" className="w-9" />
              <img src={iconEvangelista} alt="" className="w-9" />
              <img src={iconPastor}      alt="" className="w-9" />
              <img src={iconMestre}      alt="" className="w-9" />
            </div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-6 sm:mb-8">
              <p className="text-2xs text-mint font-semibold uppercase tracking-widest mb-1">Five One</p>
              <h2 className="text-lg font-bold text-slate-white">Descubra mais</h2>
              <p className="text-sm text-slate mt-0.5">Tudo o que o Five One oferece para o seu crescimento.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Para Ler */}
              <a href="https://fiveonemovement.com/insights" target="_blank" rel="noopener noreferrer"
                className="group relative rounded-2xl overflow-hidden aspect-video border border-slate/10 hover:border-mint/30 hover:-translate-y-0.5 transition-all hover:shadow-mint">
                <img src={imgParaLer} alt="Para Ler" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute bottom-4 left-4 text-sm text-mint font-semibold drop-shadow">Ver leituras →</span>
              </a>

              {/* Teste dos 5 Ministérios */}
              <a href="https://fiveonemovement.com/descubra-seu-dom" target="_blank" rel="noopener noreferrer"
                className="group relative rounded-2xl overflow-hidden aspect-video border border-slate/10 hover:border-mint/30 hover:-translate-y-0.5 transition-all hover:shadow-mint">
                <img src={imgTeste} alt="Teste dos 5 Ministérios" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute bottom-4 left-4 text-sm text-mint font-semibold drop-shadow">Fazer o teste →</span>
              </a>

              {/* Próximos Cursos */}
              <a href="https://fiveonemovement.com/cursos" target="_blank" rel="noopener noreferrer"
                className="group relative rounded-2xl overflow-hidden aspect-video border border-slate/10 hover:border-mint/30 hover:-translate-y-0.5 transition-all hover:shadow-mint">
                <img src={imgProximosCursos} alt="Próximos Cursos" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute bottom-4 left-4 text-sm text-mint font-semibold drop-shadow">Ver catálogo →</span>
              </a>

              {/* Leve os 5 Ministérios */}
              <a href="https://fiveonemovement.com/treinamentos" target="_blank" rel="noopener noreferrer"
                className="group relative rounded-2xl overflow-hidden aspect-video border border-slate/10 hover:border-mint/30 hover:-translate-y-0.5 transition-all hover:shadow-mint">
                <img src={imgLeveOs5} alt="Leve os 5 Ministérios" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute bottom-4 left-4 text-sm text-mint font-semibold drop-shadow">Saiba mais →</span>
              </a>

            </div>
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
