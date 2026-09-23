import { Link } from 'react-router-dom';
import RedeLayout, { ArrowIcon } from '../RedeLayout';
import { PageHero, Presbiteros, SectionHead, VerseBand, VisitCta } from '../RedeBlocks';
import { HISTORIA, PHOTOS } from '../redeData';
import { redePath } from '../redeLinks';

export default function RedeHistoria() {
  return (
    <RedeLayout title="Nossa história">
      <PageHero
        image={PHOTOS.rede}
        eyebrow="De onde viemos"
        title={
          <>
            Nossa <em>história</em>
          </>
        }
        lead="Começamos em 2025, em Campina Grande, com uma casa e doze pessoas."
      />

      <section className="rs-section rs-section--light">
        <div className="rs-container rs-split">
          <div className="rs-reveal">
            <span className="rs-eyebrow">Como tudo começou</span>
            <h2 className="rs-title">
              Uma casa e doze <em>pessoas</em>
            </h2>
          </div>
          <div className="rs-prose rs-reveal">
            <p>
              Em 2025 abrimos a primeira casa, em Campina Grande. Éramos doze pessoas querendo viver a igreja como está
              no livro de Atos: reunidos nas casas, estudando a Palavra, comendo juntos e orando (At 2.42).
            </p>
          </div>
        </div>
      </section>

      <section className="rs-section rs-section--dark">
        <div className="rs-container">
          <SectionHead
            eyebrow="A linha do tempo"
            title={
              <>
                Nossa <em>caminhada</em> até aqui
              </>
            }
          />
          <ol className="rs-timeline">
            {HISTORIA.map((item) => (
              <li key={item.titulo} className="rs-reveal">
                <span className="rs-timeline__when">{item.quando}</span>
                <div>
                  <h3>{item.titulo}</h3>
                  <p>{item.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Presbiteros />

      <VerseBand image={PHOTOS.grupo} cite="2 Timóteo 2.2 (ARA)">
        E o que de minha parte ouviste através de muitas testemunhas, isso mesmo transmite a homens <em>fiéis</em> e
        também idôneos para instruir a outros.
      </VerseBand>

      <section className="rs-section rs-section--light">
        <div className="rs-container rs-center-block rs-reveal">
          <span className="rs-eyebrow">Para onde vamos</span>
          <h2 className="rs-title">
            Quer abrir uma <em>casa</em>?
          </h2>
          <p className="rs-lead">Veja como uma nova igreja na casa começa na rede.</p>
          <div className="rs-actions">
            <Link to={redePath('estrutura')} className="rs-btn rs-btn--primary">
              Como uma casa nasce <ArrowIcon />
            </Link>
            <Link to={redePath('casas')} className="rs-btn rs-btn--outline">
              Encontrar uma casa
            </Link>
          </div>
        </div>
      </section>

      <VisitCta image={PHOTOS.comunhao} />
    </RedeLayout>
  );
}
