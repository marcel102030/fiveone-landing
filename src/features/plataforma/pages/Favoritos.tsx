/**
 * Favoritos — Página de aulas favoritas do aluno
 *
 * Busca os IDs de platform_favorite_lesson, cruza com o cache de listLessons()
 * e exibe em grid com opção de remover (update otimista).
 */
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './Header'
import { useAuth } from '../../../shared/contexts/AuthContext'
import { getCurrentUserId } from '../../../shared/utils/user'
import {
  fetchFavoriteLessons,
  removeFavorite,
} from '../services/favorites'
import { LessonRef, subscribePlatformContent } from '../services/platformContent'
import { SkeletonCard } from '../../../shared/components/ui'

// ── Ícones ────────────────────────────────────────────────────────────────────

const HeartFilledIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"
    fill="currentColor" stroke="currentColor" strokeWidth="1">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const HeartEmptyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
)

// ── Componente principal ──────────────────────────────────────────────────────

const Favoritos = () => {
  const navigate = useNavigate()
  const { email: authEmail } = useAuth()
  const userId = authEmail || getCurrentUserId() || ''

  const [favorites, setFavorites] = useState<LessonRef[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<Set<string>>(new Set())

  // ── Carregar favoritos ────────────────────────────────────────────────────
  const loadFavorites = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    try {
      const lessons = await fetchFavoriteLessons(userId)
      setFavorites(lessons)
    } catch (err) {
      console.error('Erro ao carregar favoritos:', err)
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadFavorites()
    // Recarregar se conteúdo da plataforma mudar (novo cache)
    const unsubscribe = subscribePlatformContent(() => { loadFavorites() })
    return () => unsubscribe()
  }, [loadFavorites])

  // ── Remover favorito (update otimista) ────────────────────────────────────
  const handleRemove = useCallback(
    async (lessonId: string) => {
      // Otimista: remove da lista imediatamente
      setFavorites((prev) => prev.filter((l) => l.id !== lessonId))
      setRemoving((prev) => new Set(prev).add(lessonId))

      try {
        await removeFavorite(userId, lessonId)
      } catch (err) {
        console.error('Erro ao remover favorito:', err)
        // Reverter: recarregar lista
        await loadFavorites()
      } finally {
        setRemoving((prev) => {
          const next = new Set(prev)
          next.delete(lessonId)
          return next
        })
      }
    },
    [userId, loadFavorites],
  )

  // ── Navegar para aula ─────────────────────────────────────────────────────
  const goToLesson = useCallback(
    (lesson: LessonRef) => {
      navigate(`/streamer-mestre?vid=${encodeURIComponent(lesson.id)}`)
    },
    [navigate],
  )

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Header />

      <main className="min-h-screen bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

          {/* Cabeçalho da página */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-slate hover:text-mint hover:bg-mint/10 rounded-lg transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeftIcon />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-mint">
                  <HeartFilledIcon />
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-white">
                  Minhas Aulas Favoritas
                </h1>
              </div>
              {!loading && (
                <p className="text-sm text-slate mt-0.5">
                  {favorites.length === 0
                    ? 'Nenhuma aula favoritada ainda'
                    : `${favorites.length} aula${favorites.length !== 1 ? 's' : ''} favoritada${favorites.length !== 1 ? 's' : ''}`}
                </p>
              )}
            </div>
          </div>

          {/* ── Estado de loading ── */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* ── Estado vazio ── */}
          {!loading && favorites.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-navy-lighter border border-slate/20 flex items-center justify-center mb-6">
                <span className="text-slate/40">
                  <HeartEmptyIcon />
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-white mb-2">
                Nenhuma aula favoritada
              </h3>
              <p className="text-sm text-slate max-w-xs leading-relaxed mb-6">
                Favorite aulas durante o player para acessá-las rapidamente aqui.
              </p>
              <button
                onClick={() => navigate('/modulos-mestre')}
                className="px-5 py-2.5 bg-mint text-navy font-semibold text-sm rounded-xl hover:bg-mint/90 active:scale-95 transition-all shadow-mint"
              >
                Explorar módulos
              </button>
            </div>
          )}

          {/* ── Grid de favoritos ── */}
          {!loading && favorites.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {favorites.map((lesson) => {
                const thumbnail =
                  lesson.bannerContinue?.url ||
                  lesson.bannerContinue?.dataUrl ||
                  lesson.thumbnailUrl ||
                  null
                const isBeingRemoved = removing.has(lesson.id)

                return (
                  <div
                    key={lesson.id}
                    className={`group relative bg-navy-lighter border border-slate/10 rounded-2xl overflow-hidden hover:border-mint/30 hover:-translate-y-0.5 hover:shadow-card-hover transition-all ${isBeingRemoved ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {/* Thumbnail */}
                    <button
                      onClick={() => goToLesson(lesson)}
                      className="block w-full relative"
                      aria-label={`Assistir: ${lesson.title}`}
                    >
                      <div className="relative h-40 bg-navy overflow-hidden">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={lesson.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-mint/5">
                            <span className="text-slate/30">
                              <PlayIcon />
                            </span>
                          </div>
                        )}
                        {/* Overlay play */}
                        <div className="absolute inset-0 bg-navy/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-mint/90 flex items-center justify-center text-navy shadow-mint">
                            <PlayIcon />
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Info */}
                    <div className="p-4">
                      <button
                        onClick={() => goToLesson(lesson)}
                        className="text-left w-full"
                        aria-label={`Assistir: ${lesson.title}`}
                      >
                        <h3 className="text-sm font-semibold text-slate-white line-clamp-2 group-hover:text-mint transition-colors">
                          {lesson.title}
                        </h3>
                        {lesson.subjectName && (
                          <p className="text-xs text-mint/80 mt-1 truncate">{lesson.subjectName}</p>
                        )}
                      </button>

                      {/* Ações */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate/10">
                        <button
                          onClick={() => goToLesson(lesson)}
                          className="flex items-center gap-1.5 text-xs text-slate hover:text-mint transition-colors"
                        >
                          <PlayIcon />
                          Assistir
                        </button>
                        <button
                          onClick={() => handleRemove(lesson.id)}
                          disabled={isBeingRemoved}
                          className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-50"
                          aria-label="Remover dos favoritos"
                          title="Remover dos favoritos"
                        >
                          <HeartFilledIcon />
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default Favoritos
