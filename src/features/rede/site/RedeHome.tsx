import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import RedeLayout, { ArrowIcon } from './RedeLayout';
import { PrimeiroPasso } from './RedeBlocks';
import { HERO_IMAGES, PHOTOS, VALORES } from './redeData';
import { useRedeCasas } from './useRedeCasas';
import { redePath } from './redeLinks';

function Hero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (HERO_IMAGES.length <= 1) return;
    const t = window.setInterval(() => setActive((i) => (i + 1) % HERO_IMAGES.length), 6000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <section className="rs-hero">
      <div className="rs-hero__slides" aria-hidden="true">
        {HERO_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={i === active ? 'is-active' : ''}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
      </div>
      <div className="rs-hero__shade" aria-hidden="true" />
      <div className="rs-hero__content rs-container">
        <div>
          <span className="rs-eyebrow rs-eyebrow--light">Rede Five One · Campina Grande - PB</span>
          <h1 className="rs-display">
            Uma <em>família</em> de igrejas <em>nas casas</em>
          </h1>
          <div className="rs-actions">
            <Link to={redePath('casas')} className="rs-btn rs-btn--primary">
              Encontrar uma casa <ArrowIcon />
            </Link>
            <Link to={redePath('valores')} className="rs-btn rs-btn--ghost-light">
              Conheça a rede
            </Link>
          </div>
        </div>
        <p className="rs-hero__tagline">
          Seguindo Jesus.
          <br />
          Fazendo discípulos.
          <br />
          Sendo igreja nas casas.
        </p>
      </div>
    </section>
  );
}

function Valores() {
  const trackRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('.rs-valor');
    const step = card ? card.offsetWidth + 20 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <section className="rs-section rs-section--dark rs-valores">
      <div className="rs-container rs-section__head rs-section__head--row rs-reveal">
        <div>
          <span className="rs-eyebrow">Quem somos</span>
          <h2 className="rs-title">
            Nossos <em>Valores</em>
          </h2>
          <p className="rs-lead">
            Seis coisas que a gente vive toda vez que se reúne numa casa.
          </p>
        </div>
        <div className="rs-carousel-nav">
          <button type="button" onClick={() => scroll(-1)} aria-label="Valor anterior">
            ←
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Próximo valor">
            →
          </button>
        </div>
      </div>
      <div className="rs-valores__track" ref={trackRef}>
        {VALORES.map((v, i) => (
          <Link key={v.destaque} to={redePath('valores')} className="rs-valor">
            <img src={v.image} alt="" loading="lazy" decoding="async" />
            <span className="rs-valor__num">{String(i + 1).padStart(2, '0')}</span>
            <span className="rs-valor__body">
              <strong>
                {v.titulo} <em>{v.destaque}</em>
              </strong>
              <span>{v.descricao}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Casas() {
  const { casas, cidades } = useRedeCasas();
  const stats = [
    { valor: cidades, rotulo: cidades === 1 ? 'Cidade' : 'Cidades' },
    { valor: casas.length, rotulo: casas.length === 1 ? 'Casa' : 'Casas' },
    { valor: 1, rotulo: 'Família' },
  ];

  return (
    <section className="rs-section rs-section--light">
      <div className="rs-container">
        <div className="rs-section__head rs-reveal">
          <span className="rs-eyebrow">Onde estamos</span>
          <h2 className="rs-title">
            Nossas <em>Casas</em>
          </h2>
        </div>

        <div className="rs-map rs-reveal" style={{ backgroundImage: `url(${PHOTOS.rede})` }}>
          <div className="rs-map__pin">
            <span className="rs-map__dot" aria-hidden="true" />
            <span>
              <strong>Campina Grande</strong> Paraíba
            </span>
          </div>
          <span className="rs-map__caption">Por toda a rede</span>
        </div>

        <dl className="rs-stats rs-reveal">
          {stats.map((s) => (
            <div key={s.rotulo}>
              <dt>{s.rotulo}</dt>
              <dd>{s.valor}</dd>
            </div>
          ))}
        </dl>

        <ol className="rs-list">
          {casas.map((c, i) => (
            <li key={c.nome}>
              <Link to={redePath('casas')} className="rs-list__row">
                <span className="rs-list__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="rs-list__name">{c.nome}</span>
                <span className="rs-list__meta">{c.local}</span>
                <span className="rs-list__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <p className="rs-note">
          Por enquanto estamos só em Campina Grande - PB.
        </p>

        <div className="rs-center">
          <Link to={redePath('casas')} className="rs-btn rs-btn--primary">
            Ver todas as casas <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Encontros() {
  return (
    <section className="rs-band" style={{ backgroundImage: `url(${PHOTOS.comunhao})` }}>
      <div className="rs-band__shade" aria-hidden="true" />
      <div className="rs-container rs-band__content rs-reveal">
        <span className="rs-eyebrow rs-eyebrow--light">Como nos encontramos</span>
        <h2 className="rs-title rs-title--light">
          Uma <em>mesa</em> posta toda semana
        </h2>
        <p className="rs-lead rs-lead--light">
          Sexta, às 19h, tem estudo bíblico. Sábado, às 19h, tem culto nas casas. Todo mundo participa.
        </p>
        <Link to={redePath('agenda')} className="rs-btn rs-btn--primary">
          Ver a agenda <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}

function Declaracao() {
  return (
    <section className="rs-statement">
      <div className="rs-container rs-reveal">
        <p>
          Seguindo Jesus.
          <br />
          <em>Fazendo discípulos.</em>
          <br />
          Sendo a igreja nas casas.
        </p>
      </div>
    </section>
  );
}

export default function RedeHome() {
  return (
    <RedeLayout>
      <Hero />
      <Valores />
      <Casas />
      <Encontros />
      <PrimeiroPasso />
      <Declaracao />
    </RedeLayout>
  );
}
