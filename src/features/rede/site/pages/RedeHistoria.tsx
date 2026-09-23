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
        lead="Começou numa sala de estar em Campina Grande, com uma casa, doze pessoas e um sonho do tamanho do Brasil."
      />

      <section className="rs-section rs-section--light">
        <div className="rs-container rs-split">
          <div className="rs-reveal">
            <span className="rs-eyebrow">Como tudo começou</span>
            <h2 className="rs-title">
              Uma mesa, e não um <em>palco</em>
            </h2>
          </div>
          <div className="rs-prose rs-reveal">
            <p>
              Em 2025, um pequeno grupo decidiu viver a igreja do jeito que o Novo Testamento descreve: reunida nas casas,
              perseverando na doutrina dos apóstolos, na comunhão, no partir do pão e nas orações (At 2.42).
            </p>
            <p>
              Eram doze pessoas ao redor de uma mesa. Não havia púlpito nem plateia — havia a Palavra aberta, o pão
              partido e cada irmão trazendo o seu dom. Dali nasceu a Rede de Igrejas nas Casas, com um propósito que
              desde o primeiro dia foi maior do que aquela sala: espalhar a visão de igreja nas casas por todo o Brasil.
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
                Uma família de casas, <em>crescendo</em>
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
            A próxima casa pode ser a <em>sua</em>
          </h2>
          <p className="rs-lead">
            Cada casa madura pode dar à luz outra casa. Veja como uma nova igreja na casa nasce e o que caminha junto com
            ela.
          </p>
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
