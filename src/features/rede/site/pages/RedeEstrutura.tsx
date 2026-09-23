import { Link } from 'react-router-dom';
import RedeLayout, { ArrowIcon } from '../RedeLayout';
import { Callout, NumberedGrid, PageHero, Presbiteros, SectionHead, VisitCta } from '../RedeBlocks';
import { CIRCULOS, ESTRUTURA_VISAO, LIDERANCA, MEMBRESIA, MULTIPLICACAO, PHOTOS } from '../redeData';
import { redePath } from '../redeLinks';

/** Círculos concêntricos: a casa no centro, a rede por fora. */
function Rings() {
  const labels = [...CIRCULOS].reverse();
  return (
    <div className="rs-rings" aria-hidden="true">
      {labels.map((c, i) => (
        <div key={c.titulo} className={`rs-rings__ring rs-rings__ring--${i + 1}`}>
          <span>
            <strong>{c.titulo}</strong>
            {c.subtitulo}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RedeEstrutura() {
  return (
    <RedeLayout title="Estrutura">
      <PageHero
        eyebrow="Como nos organizamos"
        title={
          <>
            Nossa <em>Estrutura</em>
          </>
        }
        lead="Uma rede de igrejas nas casas, cuidadas por presbíteros e pelos cinco ministérios. Família, não denominação."
      />

      <section className="rs-section rs-section--light">
        <div className="rs-container">
          <SectionHead
            eyebrow="A forma da família"
            title={
              <>
                Círculos de cuidado, <em>uma família</em>
              </>
            }
            lead="A vida acontece na casa. Tudo o que vem depois existe para servi-la, e não o contrário."
          />
          <div className="rs-rings-layout">
            <Rings />
            <ol className="rs-rows rs-rows--compact">
              {CIRCULOS.map((c, i) => (
                <li key={c.titulo} className="rs-reveal">
                  <span className="rs-rows__num">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{c.titulo}</h3>
                    <p>{c.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="rs-section rs-section--dark">
        <div className="rs-container rs-split">
          <div className="rs-reveal">
            <span className="rs-eyebrow">Rede de igrejas nas casas</span>
            <h2 className="rs-title">
              Cinco ministérios cuidando das <em>casas</em>
            </h2>
            <blockquote className="rs-quote">
              “{ESTRUTURA_VISAO.versiculo.texto}”<cite>{ESTRUTURA_VISAO.versiculo.referencia}</cite>
            </blockquote>
          </div>
          <div className="rs-prose rs-reveal">
            {ESTRUTURA_VISAO.paragrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        <div className="rs-container">
          <NumberedGrid items={ESTRUTURA_VISAO.itens} columns={2} />
          <Callout>{ESTRUTURA_VISAO.destaque}</Callout>
        </div>
      </section>

      <section className="rs-section rs-section--light">
        <div className="rs-container">
          <SectionHead
            eyebrow="Liderança plural sob o Sumo Pastor"
            title={
              <>
                Presbíteros e os cinco <em>dons</em>
              </>
            }
          />
          <div className="rs-prose rs-prose--wide rs-reveal">
            {LIDERANCA.paragrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <ul className="rs-gifts">
            {LIDERANCA.ministerios.map((m) => (
              <li key={m.titulo} className="rs-reveal">
                <h3>
                  <em>{m.titulo}</em>
                </h3>
                <p>{m.descricao}</p>
              </li>
            ))}
          </ul>
          <Callout label="Áreas que servem o corpo">{LIDERANCA.areas}</Callout>
        </div>
      </section>

      <Presbiteros dark />

      <section className="rs-section rs-section--light">
        <div className="rs-container">
          <SectionHead
            eyebrow="Pacto comunitário"
            title={
              <>
                Membresia é <em>aliança</em>, não cadastro
              </>
            }
          />
          <div className="rs-prose rs-prose--wide rs-reveal">
            {MEMBRESIA.paragrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <NumberedGrid items={MEMBRESIA.itens} />
        </div>
      </section>

      <section className="rs-section rs-section--dark">
        <div className="rs-container">
          <SectionHead
            eyebrow="Como uma nova casa nasce"
            title={
              <>
                Multiplicar quando estiver <em>maduro</em>
              </>
            }
          />
          <div className="rs-prose rs-prose--wide rs-reveal">
            {MULTIPLICACAO.paragrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <NumberedGrid items={MULTIPLICACAO.itens} />
          <Callout>{MULTIPLICACAO.destaque}</Callout>
          <div className="rs-actions rs-reveal">
            <Link to={redePath('confissao')} className="rs-btn rs-btn--primary">
              Ler a Confissão de Fé <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      <VisitCta image={PHOTOS.missao} />
    </RedeLayout>
  );
}
