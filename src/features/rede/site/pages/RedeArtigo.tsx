import { Link } from 'react-router-dom';
import RedeLayout from '../RedeLayout';
import { PageHero, VisitCta } from '../RedeBlocks';
import { ARTIGOS, artigoPath, type Artigo, type ArtigoBloco } from '../artigosData';
import { PHOTOS } from '../redeData';
import { redePath } from '../redeLinks';

function Bloco({ bloco }: { bloco: ArtigoBloco }) {
  if (typeof bloco === 'string') return <p>{bloco}</p>;
  if (bloco.tipo === 'destaque') return <blockquote className="rs-quote">{bloco.texto}</blockquote>;
  return (
    <ul>
      {bloco.itens.map((item) => (
        <li key={item.texto}>
          {item.titulo && <strong>{item.titulo} </strong>}
          {item.texto}
        </li>
      ))}
    </ul>
  );
}

export default function RedeArtigo({ slug }: { slug: Artigo['slug'] }) {
  const artigo = ARTIGOS.find((a) => a.slug === slug) ?? ARTIGOS[0];
  const outros = ARTIGOS.filter((a) => a.slug !== artigo.slug);

  return (
    <RedeLayout title={`${artigo.titulo} ${artigo.destaque}`}>
      <PageHero
        eyebrow={artigo.categoria}
        title={
          <>
            {artigo.titulo} <em>{artigo.destaque}</em>
          </>
        }
        lead={artigo.resumo}
      />

      <section className="rs-section rs-section--light rs-section--tight-top">
        <div className="rs-container">
          <Link to={redePath('recursos')} className="rs-link rs-article__back">
            ← Todos os recursos
          </Link>
          <article className="rs-article">
            {artigo.secoes.map((secao, i) => (
              <section key={secao.titulo ?? i}>
                {secao.titulo && <h2>{secao.titulo}</h2>}
                {secao.blocos.map((b, j) => (
                  <Bloco key={j} bloco={b} />
                ))}
              </section>
            ))}
          </article>
        </div>
      </section>

      <section className="rs-section rs-section--mist-2 rs-section--tight-top">
        <div className="rs-container">
          <span className="rs-eyebrow">Continue lendo</span>
          <ul className="rs-list">
            {outros.map((a, i) => (
              <li key={a.slug}>
                <Link to={artigoPath(a.slug)} className="rs-list__row">
                  <span className="rs-list__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="rs-list__name">
                    {a.titulo} {a.destaque}
                  </span>
                  <span className="rs-list__meta">{a.categoria}</span>
                  <span className="rs-list__arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <VisitCta image={PHOTOS.familia} />
    </RedeLayout>
  );
}
