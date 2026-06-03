import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { usePlatformUserProfile } from '../hooks/usePlatformUserProfile'
import { useAuth } from '../../../shared/contexts/AuthContext'

const logoSmall = '/assets/images/logo-fiveone-white-small.png'

// Lazy-load do SearchModal para não impactar bundle inicial
const SearchModal = lazy(() => import('../components/SearchModal'))

// ── Ícones inline (SVG) ───────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const AwardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
)

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
)

// ── Componente principal ──────────────────────────────────────────────────────

const Header = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [isSearchOpen, setSearchOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { profile } = usePlatformUserProfile()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fechar menu mobile ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prevenir scroll quando menu mobile está aberto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMenuOpen])

  function onLogoClick() {
    setMenuOpen(false)
    if (location.pathname === '/plataforma') {
      const el = document.getElementById('inicio')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      navigate('/plataforma')
      setTimeout(() => {
        const el = document.getElementById('inicio')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }

  async function handleSignOut() {
    setDropdownOpen(false)
    setMenuOpen(false)
    await signOut()
    navigate('/login-aluno', { replace: true })
  }

  const navLinks = [
    { to: '/plataforma', label: 'Início', internal: true },
    { to: 'https://discord.gg/aCNSSzpY', label: 'Comunidade Five One', internal: false },
    { to: 'https://fiveonemovement.com/descubra-seu-dom', label: 'Descobrir meu Dom', internal: false },
    { to: 'https://fiveonemovement.com/', label: 'Site Five One', internal: false },
  ]

  const initials = profile?.initials || 'F1'
  const displayName = profile?.displayName || 'Aluno Five One'
  const email = profile?.email || ''
  const formationLabel = profile?.formationLabel || null
  const avatarUrl = profile?.avatarUrl || null

  return (
    <>
      {/* safe-area-top: no iPhone PWA (standalone) a status bar sobrepõe o header.
          padding-top com env(safe-area-inset-top) empurra o conteúdo para baixo da notch. */}
      <header
        className="sticky top-0 z-50 bg-[#06101e]/95 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] relative"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {/* Linha mint na base */}
        <div
          className="absolute inset-x-0 bottom-0 h-[1.5px] pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(100,255,218,0.35) 30%, rgba(100,255,218,0.6) 50%, rgba(100,255,218,0.35) 70%, transparent 100%)" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[72px]">

          {/* ── Logo ── */}
          <div className="flex items-center gap-4">
            <button
              onClick={onLogoClick}
              className="flex-shrink-0 group"
              aria-label="Ir para o início"
            >
              <img
                src={logoSmall}
                alt="Logo Five One"
                className="h-9 w-auto transition-all duration-300 drop-shadow-[0_0_6px_rgba(100,255,218,0.15)] group-hover:drop-shadow-[0_0_14px_rgba(100,255,218,0.5)] group-hover:scale-105"
              />
            </button>

            {/* Divisor sutil */}
            <span className="hidden md:block h-5 w-px bg-white/10" aria-hidden />

            {/* ── Navegação desktop ── */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const isActive = link.internal && location.pathname === link.to
                const cls = `relative px-3.5 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 ${
                  isActive
                    ? "text-mint bg-mint/[0.12] shadow-[inset_0_0_0_1px_rgba(100,255,218,0.15)]"
                    : "text-slate-light/70 hover:text-white hover:bg-white/[0.06]"
                }`
                return link.internal ? (
                  <Link key={link.to} to={link.to} className={cls}>
                    {link.label}
                    {isActive && <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-5 h-px bg-mint rounded-full" aria-hidden />}
                  </Link>
                ) : (
                  <a key={link.to} href={link.to} target="_blank" rel="noopener noreferrer" className={cls}>
                    {link.label}
                  </a>
                )
              })}
            </nav>
          </div>

          {/* ── Ações direita ── */}
          <div className="flex items-center gap-1.5">

            {/* Botão busca */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 text-slate-light/60 hover:text-mint hover:bg-mint/10 rounded-lg transition-all duration-200"
              aria-label="Buscar aulas"
              title="Buscar aulas (Ctrl+K)"
            >
              <SearchIcon />
            </button>

            {/* Favoritos */}
            <Link
              to="/favoritos"
              className="hidden sm:flex p-2.5 text-slate-light/60 hover:text-mint hover:bg-mint/10 rounded-lg transition-all duration-200"
              aria-label="Minhas aulas favoritas"
              title="Favoritos"
            >
              <HeartIcon />
            </Link>

            {/* Divisor */}
            <span className="hidden sm:block h-5 w-px bg-white/10 mx-1" aria-hidden />

            {/* ── Dropdown de perfil ── */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.06] transition-all duration-200 group"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
                aria-label="Abrir menu do perfil"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-mint/20 border border-mint/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_rgba(100,255,218,0.2)] group-hover:border-mint/60 transition-all duration-200">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-mint">{initials}</span>
                  )}
                </div>
              </button>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-navy-light border border-slate/20 rounded-2xl shadow-card-hover animate-fade-in-up overflow-hidden z-50">

                  {/* Header do dropdown */}
                  <div className="flex items-center gap-3 p-4 border-b border-slate/10">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-mint/20 border border-mint/30 flex items-center justify-center flex-shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-mint">{initials}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-white truncate">{displayName}</p>
                      <p className="text-xs text-slate truncate">{email}</p>
                      {formationLabel && (
                        <span className="inline-block mt-1 text-2xs font-medium text-mint bg-mint/10 border border-mint/20 px-2 py-0.5 rounded-full">
                          {formationLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Links */}
                  <div className="p-1.5">
                    <Link
                      to="/perfil"
                      onClick={() => { setDropdownOpen(false); setMenuOpen(false) }}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-light hover:text-slate-white hover:bg-navy-lighter rounded-xl transition-colors"
                    >
                      <UserIcon />
                      Meu perfil
                    </Link>
                    <Link
                      to="/meu-progresso"
                      onClick={() => { setDropdownOpen(false); setMenuOpen(false) }}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-light hover:text-slate-white hover:bg-navy-lighter rounded-xl transition-colors"
                    >
                      <TrendingUpIcon />
                      Meu progresso
                    </Link>
                    <Link
                      to="/favoritos"
                      onClick={() => { setDropdownOpen(false); setMenuOpen(false) }}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-light hover:text-slate-white hover:bg-navy-lighter rounded-xl transition-colors"
                    >
                      <HeartIcon />
                      Aulas favoritas
                    </Link>
                    <Link
                      to="/certificados"
                      onClick={() => { setDropdownOpen(false); setMenuOpen(false) }}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-light hover:text-slate-white hover:bg-navy-lighter rounded-xl transition-colors"
                    >
                      <AwardIcon />
                      Meus certificados
                    </Link>
                    <div className="border-t border-slate/10 mt-1 pt-1">
                      <button
                        onClick={() => void handleSignOut()}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                      >
                        <LogOutIcon />
                        Sair da conta
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Hamburger mobile ── */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-mint/10 transition-colors"
              aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={isMenuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="flex flex-col gap-[5px]">
                <span className={`block w-5 h-0.5 bg-mint transition-all duration-300 origin-center ${isMenuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
                <span className={`block w-5 h-0.5 bg-mint transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                <span className={`block w-5 h-0.5 bg-mint transition-all duration-300 origin-center ${isMenuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Menu mobile (drawer) ── */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-navy/80 backdrop-blur-sm md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          {/* Drawer — top compensa header (h-16) + safe-area-inset-top do iPhone */}
          <div
            className="fixed left-0 right-0 z-40 bg-navy-light border-b border-slate/10 shadow-card-hover md:hidden animate-slide-in"
            style={{ top: 'calc(4rem + env(safe-area-inset-top))' }}
          >
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link) =>
                link.internal ? (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-3 text-sm text-slate-light hover:text-mint hover:bg-mint/5 rounded-xl transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.to}
                    href={link.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-3 text-sm text-slate-light hover:text-mint hover:bg-mint/5 rounded-xl transition-colors"
                  >
                    {link.label}
                  </a>
                )
              )}
              <div className="border-t border-slate/10 mt-2 pt-2">
                <Link
                  to="/meu-progresso"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-light hover:text-mint hover:bg-mint/5 rounded-xl transition-colors"
                >
                  <TrendingUpIcon />
                  Meu progresso
                </Link>
                <Link
                  to="/favoritos"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-light hover:text-mint hover:bg-mint/5 rounded-xl transition-colors"
                >
                  <HeartIcon />
                  Minhas aulas favoritas
                </Link>
                <Link
                  to="/certificados"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-light hover:text-mint hover:bg-mint/5 rounded-xl transition-colors"
                >
                  <AwardIcon />
                  Meus certificados
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}

      {/* ── Search Modal ── */}
      {isSearchOpen && (
        <Suspense fallback={null}>
          <SearchModal onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </>
  )
}

export default Header
