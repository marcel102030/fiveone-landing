import { Link } from 'react-router-dom';
import RedeLayout, { ArrowIcon } from '../RedeLayout';
import { PageHero, SectionHead, VerseBand, VisitCta } from '../RedeBlocks';
import { MANIFESTO, NAO_E, PHOTOS, PILARES } from '../redeData';
import { redePath } from '../redeLinks';

export default function RedeQuemSomos() {
  return (
    <RedeLayout title="Quem somos">
      <PageHero
        image={PHOTOS.familia}
        eyebrow="Quem somos"
        title={
          <>
            Igreja é <em>gente</em>, não lugar
          </>
        }
        lead="Somos igrejas pequenas que se reúnem em casas, em Campina Grande - PB."
      />

      <section className="rs-section rs-section--light">
        <div className="rs-container rs-split">
          <div className="rs-reveal">
            <span className="rs-eyebrow">Nossa identidade</span>
            <h2 className="rs-title">
              Uma família de <em>casas</em>
            </h2>
          </div>
          <div className="rs-prose rs-reveal">
            {MANIFESTO.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="rs-section rs-section--dark">
        <div className="rs-container">
          <SectionHead
            eyebrow="No que acreditamos"
            title={
              <>
                Por que <em>existimos</em>
              </>
            }
          />
          <div className="rs-pillars">
            {PILARES.map((p, i) => (
              <article key={p.tag} className="rs-pillar rs-reveal">
                <span className="rs-pillar__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="rs-eyebrow">{p.tag}</span>
                <h3>{p.titulo}</h3>
                <p>{p.resumo}</p>
                <ul>
                  {p.itens.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {p.quote && (
                  <blockquote>
                    “{p.quote.text}”<cite>{p.quote.author}</cite>
                  </blockquote>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <VerseBand image={PHOTOS.comunhao} cite="Rede de Igrejas nas Casas">
        Menos púlpitos e mais <em>mesas</em>, para que cada bairro experimente a igreja viva dentro de casa.
      </VerseBand>

      <section className="rs-section rs-section--light">
        <div className="rs-container">
          <SectionHead
            eyebrow="Para deixar claro"
            title={
              <>
                O que a igreja na casa <em>não</em> é
              </>
            }
          />
          <ol className="rs-rows">
            {NAO_E.map((item, i) => (
              <li key={item.titulo} className="rs-reveal">
                <span className="rs-rows__num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{item.titulo}</h3>
                  <p>{item.texto}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="rs-actions rs-reveal">
            <Link to={redePath('estrutura')} className="rs-btn rs-btn--primary">
              Como a rede se organiza <ArrowIcon />
            </Link>
            <Link to={redePath('confissao')} className="rs-btn rs-btn--outline">
              Ler a Confissão de Fé
            </Link>
          </div>
        </div>
      </section>

      <VisitCta image={PHOTOS.rede} />
    </RedeLayout>
  );
}
