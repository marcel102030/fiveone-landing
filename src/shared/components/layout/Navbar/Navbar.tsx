import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import logoUrl from "../../../../assets/images/logo-fiveone-white.png";

type NavItem = { to: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { to: "/cursos", label: "Cursos" },
  { to: "/descubra-seu-dom", label: "Descubra seu dom" },
  { to: "/solucoes", label: "Para sua igreja" },
  { to: "/insights", label: "Insights" },
  { to: "/contato", label: "Contato" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    const currentPath = location.pathname.replace("/fiveone-landing", "") || "/";
    return currentPath === path;
  };

  // Adiciona sombra/blur mais forte ao rolar
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha menu mobile ao mudar de rota
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Bloqueia scroll do body quando drawer aberto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 h-20 transition-all duration-300 ${
        isScrolled
          ? "bg-navy/90 backdrop-blur-md border-b border-slate/10 shadow-card"
          : "bg-navy/70 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="relative max-w-7xl mx-auto h-full px-5 lg:px-8 flex items-center gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="shrink-0 flex items-center mr-6 xl:mr-10"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Ir para a home"
        >
          <img
            src={logoUrl}
            alt="Five One"
            className="h-9 sm:h-10 w-auto"
            draggable={false}
          />
        </Link>

        {/* Desktop: nav items + CTA juntos */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group relative px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
                  active ? "text-mint" : "text-slate hover:text-slate-white"
                }`}
              >
                {item.label}
                {/* Underline animado */}
                <span
                  className={`absolute left-3 right-3 bottom-1 h-px bg-mint transition-transform duration-300 origin-left ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                  aria-hidden
                />
              </Link>
            );
          })}

          {/* Divisor sutil entre nav items e CTA */}
          <span className="mx-2 xl:mx-3 h-5 w-px bg-slate/20" aria-hidden />

          {/* CTA Aluno */}
          <Link
            to="/login-aluno"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-mint text-navy text-xs font-bold uppercase tracking-wider rounded-lg hover:shadow-mint-strong hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
          >
            Alunos Five One
          </Link>
        </div>

        {/* Mobile menu trigger (empurrado pra direita) */}
        <button
          className="lg:hidden relative w-11 h-11 ml-auto flex items-center justify-center rounded-lg hover:bg-mint/10 transition-colors"
          onClick={() => setIsMenuOpen((v) => !v)}
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
        >
          <span className="flex flex-col gap-1.5">
            <span
              className={`block w-6 h-0.5 bg-mint transition-all duration-300 origin-center ${
                isMenuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-mint transition-opacity duration-300 ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-mint transition-all duration-300 origin-center ${
                isMenuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-x-0 top-20 bottom-0 bg-navy/95 backdrop-blur-md transition-all duration-300 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="h-full overflow-y-auto px-6 py-8 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3.5 rounded-xl text-base font-semibold transition-colors ${
                  active
                    ? "bg-mint/10 text-mint"
                    : "text-slate-light hover:bg-mint/5 hover:text-mint"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="mt-4 pt-4 border-t border-slate/10">
            <Link
              to="/login-aluno"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-center px-4 py-3.5 bg-mint text-navy font-bold uppercase tracking-wider rounded-xl shadow-mint hover:shadow-mint-strong transition-all"
            >
              Alunos Five One
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
