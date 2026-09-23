import { Link } from 'react-router-dom';
import RedeLayout, { ArrowIcon } from '../RedeLayout';
import { Callout, NumberedGrid, PageHero, SectionHead, VerseBand, VisitCta } from '../RedeBlocks';
import { CINCO_MOTIVOS, CINCO_MOTIVOS_DESTAQUE, PHOTOS, VALORES, VIDA_DA_IGREJA } from '../redeData';
import { redePath } from '../redeLinks';

const valorId = (i: number) => `valor-${i + 1}`;

export default function RedeValores() {
  return (
    <RedeLayout title="Nossos valores">
      <PageHero
        eyebrow="O que vivemos"
        title={
          <>
            Nossos <em>Valores</em>
          </>
        }
        lead="Seis convicções que marcam o jeito como seguimos Jesus juntos, nas casas."
      >
        <nav className="rs-index" aria-label="Valores">
          {VALORES.map((v, i) => (
            <a key={v.destaque} href={`#${valorId(i)}`}>
              <span>{String(i + 1).padStart(2, '0')}</span> {v.destaque}
            </a>
          ))}
        </nav>
      </PageHero>

      <div className="rs-values">
        {VALORES.map((v, i) => (
          <section key={v.destaque} id={valorId(i)} className={`rs-value${i % 2 ? ' rs-value--flip' : ''}`}>
            <div className="rs-container rs-value__inner">
              <figure className="rs-value__media rs-reveal">
                <img src={v.image} alt="" loading="lazy" decoding="async" />
                <span>{String(i + 1).padStart(2, '0')}</span>
              </figure>
              <div className="rs-value__text rs-reveal">
                <span className="rs-eyebrow">{String(i + 1).padStart(2, '0')} · Um valor da rede</span>
                <h2 className="rs-title">
                  {v.titulo} <em>{v.destaque}</em>
                </h2>
                <p className="rs-dropcap">{v.descricao}</p>
              </div>
            </div>
          </section>
        ))}
      </div>

      <VerseBand image={PHOTOS.mesa} cite="Atos 2.42, 46">
        E perseveravam na doutrina dos apóstolos, e na comunhão, e no <em>partir do pão</em>, e nas orações… partindo
        o pão em casa, comiam juntos com alegria e singeleza de coração.
      </VerseBand>

      <section className="rs-section rs-section--dark">
        <div className="rs-container">
          <SectionHead
            eyebrow="Por que nos encontramos"
            title={
              <>
                Os cinco <em>motivos</em> do encontro
              </>
            }
            lead="São os motivos que fazem a gente se reunir toda semana."
          />
          <NumberedGrid items={CINCO_MOTIVOS} />
          <Callout>{CINCO_MOTIVOS_DESTAQUE}</Callout>
        </div>
      </section>

      <section className="rs-section rs-section--light">
        <div className="rs-container">
          <SectionHead
            eyebrow="Como vivemos"
            title={
              <>
                Casas, mesa, <em>dons</em> e discipulado
              </>
            }
            lead="A casa é o ambiente mais natural para a formação de discípulos. Em torno da mesa, ninguém é plateia."
          />
          <NumberedGrid items={VIDA_DA_IGREJA} />
        </div>
      </section>

      <section className="rs-section rs-section--mist-2">
        <div className="rs-container rs-center-block rs-reveal">
          <span className="rs-eyebrow">O que cremos</span>
          <h2 className="rs-title">
            A Confissão de <em>Fé</em>
          </h2>
          <p className="rs-lead">
            Tudo o que cremos está escrito na nossa Confissão de Fé. Quem quer ser membro lê junto com os presbíteros.
          </p>
          <div className="rs-actions">
            <Link to={redePath('confissao')} className="rs-btn rs-btn--primary">
              Ler a Confissão <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      <VisitCta image={PHOTOS.grupo} />
    </RedeLayout>
  );
}
