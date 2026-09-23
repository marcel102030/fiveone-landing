// Blocos visuais reaproveitados pelas páginas do site da rede.
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowIcon, WhatsAppLink } from './RedeLayout';
import { PRESBITEROS, VISITOR_FORM_PATH, WHATSAPP } from './redeData';
import { redePath } from './redeLinks';

/** Capa de página interna: com foto (faixa alta) ou só azul-marinho. */
export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <section className={`rs-page-hero${image ? ' rs-page-hero--image' : ''}`}>
      {image && (
        <>
          <img className="rs-page-hero__img" src={image} alt="" decoding="async" />
          <div className="rs-page-hero__shade" aria-hidden="true" />
        </>
      )}
      <div className="rs-container rs-page-hero__content">
        <span className={`rs-eyebrow${image ? ' rs-eyebrow--light' : ''}`}>{eyebrow}</span>
        <h1 className="rs-display rs-display--page">{title}</h1>
        {lead && <p className="rs-lead rs-lead--hero">{lead}</p>}
        {children}
      </div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lead,
  center = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`rs-section__head rs-reveal${center ? ' rs-section__head--center' : ''}`}>
      {eyebrow && <span className="rs-eyebrow">{eyebrow}</span>}
      <h2 className="rs-title">{title}</h2>
      {lead && <p className="rs-lead">{lead}</p>}
    </div>
  );
}

/** Lista numerada em colunas (práticas, critérios, compromissos). */
export function NumberedGrid({
  items,
  columns = 3,
}: {
  items: { titulo: string; descricao: string }[];
  columns?: 2 | 3;
}) {
  return (
    <ol className={`rs-numbered rs-numbered--${columns}`}>
      {items.map((item, i) => (
        <li key={item.titulo} className="rs-reveal">
          <span className="rs-numbered__num">{String(i + 1).padStart(2, '0')}</span>
          <h3>{item.titulo}</h3>
          <p>{item.descricao}</p>
        </li>
      ))}
    </ol>
  );
}

/** Frase em destaque com barra lateral. */
export function Callout({ label = 'Em destaque', children }: { label?: string; children: ReactNode }) {
  return (
    <aside className="rs-callout rs-reveal">
      <span>{label}</span>
      <p>{children}</p>
    </aside>
  );
}

/** Faixa escura com versículo ou citação centralizada. */
export function VerseBand({ children, cite, image }: { children: ReactNode; cite: string; image?: string }) {
  return (
    <section className="rs-verse" style={image ? { backgroundImage: `url(${image})` } : undefined}>
      {image && <div className="rs-verse__shade" aria-hidden="true" />}
      <figure className="rs-container rs-verse__inner rs-reveal">
        <blockquote>{children}</blockquote>
        <figcaption>{cite}</figcaption>
      </figure>
    </section>
  );
}

/** Faixa com foto de fundo e chamada para ação. */
export function CtaBand({
  image,
  eyebrow,
  title,
  lead,
  children,
}: {
  image: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rs-band" style={{ backgroundImage: `url(${image})` }}>
      <div className="rs-band__shade" aria-hidden="true" />
      <div className="rs-container rs-band__content rs-reveal">
        {eyebrow && <span className="rs-eyebrow rs-eyebrow--light">{eyebrow}</span>}
        <h2 className="rs-title rs-title--light">{title}</h2>
        {lead && <p className="rs-lead rs-lead--light">{lead}</p>}
        <div className="rs-actions">{children}</div>
      </div>
    </section>
  );
}

/** Chamada final para visitar uma casa ou abrir a própria casa. */
export function VisitCta({ image }: { image: string }) {
  return (
    <CtaBand
      image={image}
      eyebrow="Participe"
      title={
        <>
          Venha para uma <em>casa</em>
        </>
      }
      lead="Quer visitar uma casa ou abrir a sua? A gente adoraria conversar com você."
    >
      <Link to={VISITOR_FORM_PATH} className="rs-btn rs-btn--primary">
        Visitar uma casa <ArrowIcon />
      </Link>
      <WhatsAppLink href={WHATSAPP.abrirCasa} className="rs-btn rs-btn--ghost-light">
        Abrir minha casa
      </WhatsAppLink>
    </CtaBand>
  );
}

export function PrimeiroPasso() {
  return (
    <section className="rs-section rs-section--light rs-section--tight-top">
      <div className="rs-container">
        <SectionHead
          eyebrow="Comece aqui"
          title={
            <>
              Como dar o <em>primeiro passo</em>
            </>
          }
        />
        <ol className="rs-steps">
          <li className="rs-reveal">
            <span className="rs-steps__num">01</span>
            <h3>Conheça a rede</h3>
            <p>Entenda o que é a igreja nas casas e o que vivemos quando nos encontramos.</p>
            <Link to={redePath('valores')} className="rs-link">
              Nossos valores →
            </Link>
          </li>
          <li className="rs-reveal">
            <span className="rs-steps__num">02</span>
            <h3>Visite uma casa</h3>
            <p>Registre sua visita e um presbítero entra em contato com você.</p>
            <Link to={VISITOR_FORM_PATH} className="rs-link">
              Registrar minha visita →
            </Link>
          </li>
          <li className="rs-reveal">
            <span className="rs-steps__num">03</span>
            <h3>Caminhe conosco</h3>
            <p>Participe dos encontros de sexta e sábado e entre no nosso grupo no WhatsApp.</p>
            <WhatsAppLink href={WHATSAPP.geral} className="rs-link">
              Falar no WhatsApp →
            </WhatsAppLink>
          </li>
        </ol>
      </div>
    </section>
  );
}

/** Apresentação do casal de presbíteros, com foto. */
export function Presbiteros({ dark = false }: { dark?: boolean }) {
  return (
    <section className={`rs-section ${dark ? 'rs-section--dark' : 'rs-section--light'}`}>
      <div className="rs-container rs-elders">
        <figure className="rs-elders__photo rs-reveal">
          <img src={PRESBITEROS.foto} alt={PRESBITEROS.nomes} loading="lazy" decoding="async" />
        </figure>
        <div className="rs-elders__text rs-reveal">
          <span className="rs-eyebrow">Quem cuida da família</span>
          <h2 className="rs-title">
            Nossos <em>presbíteros</em>
          </h2>
          <p className="rs-elders__role">{PRESBITEROS.papel}</p>
          <h3>{PRESBITEROS.nomes}</h3>
          <div className="rs-prose">
            {PRESBITEROS.texto.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
