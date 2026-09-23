import { Link } from 'react-router-dom';
import { buildOutOfCityWhatsApp } from '../../components/CityGate';
import RedeLayout, { ArrowIcon, WhatsAppLink } from '../RedeLayout';
import { PageHero, SectionHead, VisitCta } from '../RedeBlocks';
import { PHOTOS, VISITOR_FORM_PATH, WHATSAPP } from '../redeData';
import { useRedeCasas } from '../useRedeCasas';

const MAPA_EMBED = 'https://www.google.com/maps/d/embed?mid=1wd8qIMzPhFLIkd7rjLhV9dK6WZ7fwc4';

export default function RedeCasas() {
  const { casas, cidades } = useRedeCasas();
  const stats = [
    { valor: cidades, rotulo: cidades === 1 ? 'Cidade' : 'Cidades' },
    { valor: casas.length, rotulo: casas.length === 1 ? 'Casa' : 'Casas' },
    { valor: 1, rotulo: 'Família' },
  ];

  return (
    <RedeLayout title="Encontre uma casa">
      <PageHero
        image={PHOTOS.mesa}
        eyebrow="Onde estamos"
        title={
          <>
            Encontre uma <em>casa</em>
          </>
        }
        lead="Por enquanto estamos só em Campina Grande - PB. Escolha uma casa, registre sua visita e um presbítero vai falar com você."
      />

      <section className="rs-section rs-section--light">
        <div className="rs-container">
          <dl className="rs-stats rs-stats--top rs-reveal">
            {stats.map((s) => (
              <div key={s.rotulo}>
                <dt>{s.rotulo}</dt>
                <dd>{s.valor}</dd>
              </div>
            ))}
          </dl>

          <SectionHead
            eyebrow="Nossas casas"
            title={
              <>
                Casas <em>abertas</em> agora
              </>
            }
          />

          <ul className="rs-houses">
            {casas.map((c) => (
              <li key={c.nome} className="rs-house">
                <span className="rs-house__badge">Casa ativa</span>
                <h3>{c.nome}</h3>
                <p className="rs-house__local">{c.local}</p>
                <dl>
                  {c.encontro && (
                    <div>
                      <dt>Encontros</dt>
                      <dd>{c.encontro}</dd>
                    </div>
                  )}
                  {c.presbitero && (
                    <div>
                      <dt>Presbítero</dt>
                      <dd>{c.presbitero}</dd>
                    </div>
                  )}
                </dl>
                <div className="rs-actions">
                  <Link to={VISITOR_FORM_PATH} className="rs-btn rs-btn--primary">
                    Quero visitar esta casa <ArrowIcon />
                  </Link>
                  {c.linkMaps && (
                    <a href={c.linkMaps} target="_blank" rel="noopener noreferrer" className="rs-btn rs-btn--outline">
                      Ver rota no Maps
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="rs-mapframe rs-reveal">
            <iframe title="Mapa das Igrejas nas Casas" src={MAPA_EMBED} loading="lazy" allowFullScreen />
          </div>
        </div>
      </section>

      <section className="rs-section rs-section--dark">
        <div className="rs-container rs-split">
          <div className="rs-reveal">
            <span className="rs-eyebrow">Fora de Campina Grande?</span>
            <h2 className="rs-title">
              Mora em outra <em>cidade</em>?
            </h2>
          </div>
          <div className="rs-prose rs-reveal">
            <p>
              Ainda não temos casas em outras cidades. Manda uma mensagem pra gente: avisamos quando a rede chegar na
              sua região e podemos conversar sobre começar uma igreja na casa aí.
            </p>
            <div className="rs-actions">
              {/* Sem a pergunta de cidade: este botão já é para quem é de fora. */}
              <a
                href={buildOutOfCityWhatsApp('')}
                target="_blank"
                rel="noopener noreferrer"
                className="rs-btn rs-btn--primary"
              >
                Quero ser avisado <ArrowIcon />
              </a>
              <WhatsAppLink href={WHATSAPP.abrirCasa} className="rs-btn rs-btn--ghost-light">
                Abrir minha casa
              </WhatsAppLink>
            </div>
          </div>
        </div>
      </section>

      <VisitCta image={PHOTOS.rede} />
    </RedeLayout>
  );
}
