import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import logoUrl from "../../../../assets/images/logo-fiveone-white.png";

type NavItem = { to: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { to: "/descubra-seu-dom", label: "Descubra seu Dom" },
  { to: "/insights",         label: "Para Ler" },
  { to: "/cursos",           label: "Cursos" },
  { to: "/treinamentos",     label: "Treinamentos" },
  { to: "/contato",          label: "Contato" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    const currentPath = location.pathname.replace("/fiveone-landing", "") || "/";
    return currentPath === path;
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 h-[72px] transition-all duration-500 ${
          isScrolled
            ? "bg-[#07101f]/98 backdrop-blur-xl shadow-[0_1px_0_rgba(100,255,218,0.12),0_8px_32px_rgba(0,0,0,0.5)]"
            : "bg-[#07101f]/80 backdrop-blur-md"
        }`}
      >
        {/* Linha degradê na borda inferior — sempre visível, mais intensa ao rolar */}
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, rgba(100,255,218,${isScrolled ? '0.3' : '0.12'}), transparent)`, transition: 'opacity 0.5s' }}
        />

        <div className="relative max-w-7xl mx-auto h-full px-5 lg:px-8 flex items-center">

          {/* Logo */}
          <Link
            to="/"
            className="shrink-0 flex items-center mr-8 xl:mr-12 group"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Ir para a home"
          >
            <img
              src={logoUrl}
              alt="Five One"
              className="h-10 sm:h-11 w-auto transition-all duration-300 drop-shadow-[0_0_6px_rgba(100,255,218,0.15)] group-hover:drop-shadow-[0_0_12px_rgba(100,255,218,0.45)]"
              draggable={false}
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "text-mint bg-mint/10"
                      : "text-slate/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span
                      className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-mint"
                      aria-hidden
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA — empurrado para direita */}
          <div className="hidden lg:flex items-center ml-auto">
            <Link
              to="/login-aluno"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-mint text-navy text-sm font-bold rounded-full shadow-[0_0_16px_rgba(100,255,218,0.2)] hover:shadow-[0_0_24px_rgba(100,255,218,0.4)] hover:scale-[1.04] active:scale-[0.97] transition-all duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
              Alunos Five One
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden ml-auto w-10 h-10 flex items-center justify-center rounded-lg hover:bg-mint/10 transition-colors"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
          >
            <span className="flex flex-col gap-[5px]">
              <span className={`block w-5 h-0.5 bg-mint transition-all duration-300 origin-center ${isMenuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`block w-5 h-0.5 bg-mint transition-opacity duration-300 ${isMenuOpen ? "opacity-0" : "opacity-100"}`} />
              <span className={`block w-5 h-0.5 bg-mint transition-all duration-300 origin-center ${isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-x-0 top-[72px] bottom-0 z-40 bg-navy/98 backdrop-blur-xl transition-all duration-300 ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Linha decorativa no topo do drawer */}
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(100,255,218,0.2), transparent)" }} />

        <div className="px-5 pt-6 pb-8 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl text-base font-semibold transition-all duration-200 ${
                  active
                    ? "bg-mint/10 text-mint border border-mint/20"
                    : "text-slate-light/80 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                {active && <span className="w-1.5 h-1.5 rounded-full bg-mint shrink-0" aria-hidden />}
                {item.label}
              </Link>
            );
          })}

          <div className="mt-5 pt-5 border-t border-white/8">
            <Link
              to="/login-aluno"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-4 bg-mint text-navy font-bold rounded-2xl shadow-[0_0_20px_rgba(100,255,218,0.25)] hover:shadow-[0_0_32px_rgba(100,255,218,0.4)] transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
              Alunos Five One
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
