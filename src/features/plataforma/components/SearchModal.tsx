/**
 * SearchModal — Busca global de aulas
 *
 * Usa RPC search_lessons(p_query, p_ministry_id?) com Full-Text Search em português.
 * Debounce de 350ms para não spammar queries.
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { supabase } from '../../../shared/lib/supabaseClient'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface SearchResult {
  id: string
  title: string
  subtitle: string | null
  subject_name: string | null
  instructor: string | null
  thumbnail_url: string | null
  duration_minutes: number | null
  module_id: string | null
}

// ── Ícones inline ─────────────────────────────────────────────────────────────

const SearchIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
    fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(minutes: number | null): string | null {
  if (!minutes || minutes <= 0) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return `${h}h${m > 0 ? ` ${m}min` : ''}`
  return `${m}min`
}

// ── Hook de debounce ──────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// ── Componente principal ──────────────────────────────────────────────────────

interface SearchModalProps {
  onClose: () => void
}

const SearchModal = ({ onClose }: SearchModalProps) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const debouncedQuery = useDebounce(query.trim(), 350)

  // Auto-focus ao abrir
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  // Fechar com ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Busca com debounce
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([])
      setSearched(false)
      return
    }

    let cancelled = false
    setLoading(true)

    ;(async () => {
      try {
        const { data, error } = await supabase.rpc('search_lessons', {
          p_query: debouncedQuery,
          p_ministry_id: null,
        })

        if (cancelled) return

        if (error) {
          console.error('Erro na busca:', error.message)
          setResults([])
        } else {
          setResults((data as SearchResult[]) ?? [])
        }
        setSearched(true)
      } catch {
        if (!cancelled) {
          setResults([])
          setSearched(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [debouncedQuery])

  const handleSelect = useCallback(
    (lesson: SearchResult) => {
      onClose()
      navigate(`/streamer-mestre?vid=${encodeURIComponent(lesson.id)}`)
    },
    [navigate, onClose],
  )

  const showEmpty = searched && !loading && results.length === 0 && debouncedQuery.length >= 2
  const showResults = results.length > 0

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4 sm:pt-24"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-navy/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-navy-light border border-slate/20 rounded-2xl shadow-card-hover overflow-hidden animate-fade-in-up">

        {/* Barra de busca */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate/10">
          <SearchIcon className="w-5 h-5 text-slate flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar aulas, módulos, temas..."
            className="flex-1 bg-transparent text-slate-white placeholder-slate text-base outline-none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-mint/30 border-t-mint rounded-full animate-spin flex-shrink-0" />
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate hover:text-slate-white transition-colors flex-shrink-0"
            aria-label="Fechar busca"
          >
            <XIcon />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="max-h-[60vh] overflow-y-auto">

          {/* Estado inicial */}
          {!query && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-mint/10 flex items-center justify-center mb-4">
                <SearchIcon className="w-6 h-6 text-mint" />
              </div>
              <p className="text-sm text-slate">Digite para buscar aulas na plataforma</p>
              <p className="text-xs text-slate/60 mt-1">Use palavras-chave como título, tema ou instrutor</p>
            </div>
          )}

          {/* Sem resultados */}
          {showEmpty && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <p className="text-sm text-slate-light">Nenhuma aula encontrada para</p>
              <p className="text-sm font-medium text-mint mt-1">"{debouncedQuery}"</p>
              <p className="text-xs text-slate mt-3">Tente palavras diferentes ou verifique a ortografia</p>
            </div>
          )}

          {/* Resultados */}
          {showResults && (
            <ul className="p-2">
              {results.map((lesson) => (
                <li key={lesson.id}>
                  <button
                    onClick={() => handleSelect(lesson)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-navy-lighter transition-colors group text-left"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-10 rounded-lg overflow-hidden bg-navy-lighter flex-shrink-0 relative">
                      {lesson.thumbnail_url ? (
                        <img
                          src={lesson.thumbnail_url}
                          alt={lesson.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-mint/10">
                          <PlayIcon />
                        </div>
                      )}
                      {/* Overlay play */}
                      <div className="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-mint">
                          <PlayIcon />
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-white truncate group-hover:text-mint transition-colors">
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {lesson.subject_name && (
                          <span className="text-xs text-mint/80">{lesson.subject_name}</span>
                        )}
                        {lesson.instructor && (
                          <span className="text-xs text-slate/60">• {lesson.instructor}</span>
                        )}
                        {lesson.duration_minutes && (
                          <span className="flex items-center gap-1 text-xs text-slate/60">
                            <ClockIcon />
                            {formatDuration(lesson.duration_minutes)}
                          </span>
                        )}
                      </div>
                      {lesson.subtitle && (
                        <p className="text-xs text-slate mt-0.5 truncate">{lesson.subtitle}</p>
                      )}
                    </div>

                    {/* Seta */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate/40 group-hover:text-mint transition-colors flex-shrink-0"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Dica de atalho */}
          {showResults && (
            <div className="border-t border-slate/10 px-4 py-2 flex items-center gap-4">
              <span className="text-xs text-slate/50">{results.length} resultado{results.length !== 1 ? 's' : ''}</span>
              <span className="ml-auto text-xs text-slate/40 hidden sm:block">ESC para fechar</span>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default SearchModal
