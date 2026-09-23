import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCityGateModal } from '../components/CityGate';
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  REDE_EMAIL,
  REDE_PHONE_DISPLAY,
  VISITOR_FORM_PATH,
  WHATSAPP,
  redeLogo,
} from './redeData';
import { redePath, type RedePageSlug } from './redeLinks';
import './redeSite.css';

// ── Contexto: WhatsApp passa pela confirmação de cidade ───────────────────────
type RedeSiteContextValue = { openWhatsApp: (url: string) => void };
const RedeSiteContext = createContext<RedeSiteContextValue>({
  openWhatsApp: (url) => window.open(url, '_blank', 'noopener,noreferrer'),
});
export const useRedeSite = () => useContext(RedeSiteContext);

/** Link de WhatsApp que pergunta a cidade antes de abrir a conversa. */
export function WhatsAppLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { openWhatsApp } = useRedeSite();
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.preventDefault();
        openWhatsApp(href);
      }}
    >
      {children}
    </a>
  );
}

// ── Menu ──────────────────────────────────────────────────────────────────────
type NavItem = { label: string; slug: RedePageSlug; hint?: string };
type NavGroup = { label: string; items: NavItem[] };

const NAV: (NavGroup | NavItem)[] = [
  {
    label: 'Sobre',
    items: [
      { label: 'Quem somos', slug: 'quem-somos', hint: 'Quem somos e no que acreditamos' },
      { label: 'Nossa história', slug: 'historia', hint: 'Como a rede começou' },
      { label: 'Nossos valores', slug: 'valores', hint: 'O que vivemos nos encontros' },
      { label: 'Estrutura', slug: 'estrutura', hint: 'Casas, presbíteros e os cinco ministérios' },
      { label: 'Confissão de Fé', slug: 'confissao', hint: 'O que cremos' },
    ],
  },
  { label: 'Casas', slug: 'casas' },
  { label: 'Agenda', slug: 'agenda' },
  { label: 'Recursos', slug: 'recursos' },
  { label: 'Contato', slug: 'contato' },
];

const isGroup = (item: NavGroup | NavItem): item is NavGroup => 'items' in item;

/** Marca: casas do logo + nome escrito ao lado. */
function Brand() {
  return (
    <Link to={redePath()} className="rs-brand" aria-label="Rede de Igrejas nas Casas — início">
      <span className="rs-brand__mark" style={{ backgroundImage: `url("${redeLogo}")` }} aria-hidden="true" />
      <span className="rs-brand__text">
        <strong>igrejas nas casas</strong>
        <small>Rede Five One</small>
      </span>
    </Link>
  );
}

function Header({ overlay }: { overlay: boolean }) {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpenGroup(null);
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenGroup(null);
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openNow = (label: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenGroup(label);
  };
  const closeSoon = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenGroup(null), 160);
  };

  const solid = !overlay || scrolled || openGroup !== null || drawerOpen;

  return (
    <>
      <header className={`rs-header${solid ? ' is-solid' : ''}`}>
        <div className="rs-header__inner">
          <Brand />

          <nav className="rs-nav" aria-label="Principal">
            {NAV.map((item) =>
              isGroup(item) ? (
                <div
                  key={item.label}
                  className={`rs-nav__group${openGroup === item.label ? ' is-open' : ''}`}
                  onMouseEnter={() => openNow(item.label)}
                  onMouseLeave={closeSoon}
                >
                  <button
                    type="button"
                    className="rs-nav__link"
                    aria-expanded={openGroup === item.label}
                    onClick={() => setOpenGroup((g) => (g === item.label ? null : item.label))}
                  >
                    {item.label}
                    <span className="rs-nav__caret" aria-hidden="true" />
                  </button>
                  <div className="rs-nav__panel">
                    {item.items.map((sub) => (
                      <NavLink key={sub.slug} to={redePath(sub.slug)} className="rs-nav__panel-link">
                        <strong>{sub.label}</strong>
                        {sub.hint && <span>{sub.hint}</span>}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ) : (
                <NavLink key={item.slug} to={redePath(item.slug)} className="rs-nav__link">
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>

          <div className="rs-header__actions">
            <Link to={VISITOR_FORM_PATH} className="rs-btn rs-btn--primary rs-btn--sm">
              Visitar uma casa
            </Link>
            <button
              type="button"
              className={`rs-burger${drawerOpen ? ' is-open' : ''}`}
              aria-expanded={drawerOpen}
              aria-controls="rs-drawer"
              onClick={() => setDrawerOpen((v) => !v)}
            >
              <span />
              <span />
              <span className="sr-only">{drawerOpen ? 'Fechar menu' : 'Abrir menu'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Fora do <header>: o backdrop-filter do cabeçalho prenderia o menu
          (position: fixed) dentro dos 76px da barra, e as opções sumiriam. */}
      <div id="rs-drawer" className={`rs-drawer${drawerOpen ? ' is-open' : ''}`} hidden={!drawerOpen}>
        <nav aria-label="Menu">
          {NAV.map((item) =>
            isGroup(item) ? (
              <div key={item.label} className="rs-drawer__group">
                <span className="rs-drawer__label">{item.label}</span>
                {item.items.map((sub) => (
                  <Link key={sub.slug} to={redePath(sub.slug)} className="rs-drawer__link">
                    {sub.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link key={item.slug} to={redePath(item.slug)} className="rs-drawer__link rs-drawer__link--top">
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <Link to={VISITOR_FORM_PATH} className="rs-btn rs-btn--primary rs-drawer__cta">
          Visitar uma casa <ArrowIcon />
        </Link>
      </div>
    </>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="rs-footer">
      <div className="rs-footer__grid">
        <div className="rs-footer__brand">
          <Brand />
          <p>
            Uma família de igrejas simples, reunidas nas casas, fazendo discípulos e caminhando juntas com Jesus em
            Campina Grande - PB.
          </p>
        </div>
        <div className="rs-footer__col">
          <h4>Conheça</h4>
          <Link to={redePath('quem-somos')}>Quem somos</Link>
          <Link to={redePath('historia')}>Nossa história</Link>
          <Link to={redePath('valores')}>Valores</Link>
          <Link to={redePath('estrutura')}>Estrutura</Link>
          <Link to={redePath('confissao')}>Confissão de Fé</Link>
        </div>
        <div className="rs-footer__col">
          <h4>Participe</h4>
          <Link to={redePath('casas')}>Encontre uma casa</Link>
          <Link to={redePath('agenda')}>Agenda</Link>
          <Link to={redePath('recursos')}>Recursos</Link>
          <Link to={VISITOR_FORM_PATH}>Visitar uma casa</Link>
          <WhatsAppLink href={WHATSAPP.abrirCasa}>Abrir minha casa</WhatsAppLink>
        </div>
        <div className="rs-footer__col">
          <h4>Contato</h4>
          <Link to={redePath('contato')}>Fale com a rede</Link>
          <WhatsAppLink href={WHATSAPP.geral}>{REDE_PHONE_DISPLAY}</WhatsAppLink>
          <a href={`mailto:${REDE_EMAIL}`}>{REDE_EMAIL}</a>
        </div>
      </div>
      <div className="rs-footer__bottom">
        <span>© {year} Rede de Igrejas nas Casas — Five One</span>
        <span>Catolé · Campina Grande — PB</span>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
          Instagram {INSTAGRAM_HANDLE}
        </a>
      </div>
    </footer>
  );
}

function FloatingWhatsApp() {
  return (
    <WhatsAppLink href={WHATSAPP.geral} className="rs-fab">
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2.25A9.75 9.75 0 0 0 3.55 16.88L2.25 21.75l4.98-1.27A9.75 9.75 0 1 0 12 2.25Zm0 1.8a7.95 7.95 0 1 1-4.03 14.8l-.29-.17-2.96.75.78-2.88-.19-.3A7.95 7.95 0 0 1 12 4.05Zm-3.3 3.93c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.6c.13.18 1.75 2.78 4.33 3.8 2.14.84 2.58.67 3.04.63.47-.04 1.5-.61 1.71-1.2.21-.6.21-1.1.15-1.2-.06-.11-.23-.17-.48-.3-.25-.12-1.5-.74-1.73-.82-.23-.09-.4-.13-.57.12-.17.26-.65.83-.8 1-.15.17-.3.2-.55.07-.25-.13-1.06-.39-2.02-1.25-.75-.66-1.25-1.49-1.4-1.74-.15-.25-.02-.39.11-.51.11-.11.25-.3.38-.44.12-.15.16-.26.25-.43.08-.17.04-.32-.02-.45-.07-.12-.56-1.37-.78-1.87-.2-.49-.4-.42-.56-.43h-.48Z"
        />
      </svg>
      <span className="sr-only">Conversar no WhatsApp</span>
    </WhatsAppLink>
  );
}

export function ArrowIcon() {
  return (
    <span className="rs-btn__arrow" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 16 16">
        <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** Mostra os elementos `.rs-reveal` quando entram na tela. */
function useReveal() {
  const { pathname } = useLocation();
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('.rede-site .rs-reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);
}

/**
 * Casca de todas as páginas do site da rede: menu, rodapé, botão de WhatsApp e
 * confirmação de cidade. `overlayHeader` deixa o menu transparente sobre a
 * capa até a pessoa rolar a página.
 */
export default function RedeLayout({
  children,
  title,
  overlayHeader = true,
}: {
  children: React.ReactNode;
  /** Nome da página na aba do navegador. Sem título = página inicial. */
  title?: string;
  overlayHeader?: boolean;
}) {
  const { gate, modal } = useCityGateModal();
  useEffect(() => {
    document.title = title ? `${title} · Rede de Igrejas nas Casas` : 'Rede de Igrejas nas Casas | Five One';
  }, [title]);
  const openWhatsApp = (url: string) => gate(() => window.open(url, '_blank', 'noopener,noreferrer'));
  useReveal();

  return (
    <RedeSiteContext.Provider value={{ openWhatsApp }}>
      <div className="rede-site">
        <Header overlay={overlayHeader} />
        <main>{children}</main>
        <Footer />
        <FloatingWhatsApp />
        {modal}
      </div>
    </RedeSiteContext.Provider>
  );
}
