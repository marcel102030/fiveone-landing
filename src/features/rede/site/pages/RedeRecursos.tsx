import { Link } from 'react-router-dom';
import RedeLayout, { ArrowIcon } from '../RedeLayout';
import { PageHero, SectionHead, VisitCta } from '../RedeBlocks';
import { ARTIGOS, artigoPath } from '../artigosData';
import { CONFISSAO_PDF, INSTAGRAM_HANDLE, INSTAGRAM_URL, PHOTOS } from '../redeData';
import { redePath } from '../redeLinks';

// Páginas do Five One: sempre pelo domínio principal, mesmo quando o visitante
// está em redeigrejanascasas.com.
const FIVEONE = 'https://fiveonemovement.com';

const EXTERNOS = [
  {
    tipo: 'Teste',
    titulo: 'Descubra seu dom',
    texto: 'Um teste gratuito para descobrir qual dos cinco ministérios de Efésios 4 mais se expressa em você.',
    href: `${FIVEONE}/descubra-seu-dom`,
    acao: 'Fazer o teste',
  },
  {
    tipo: 'Cursos',
    titulo: 'Formação Five One',
    texto: 'Cursos para crescer no chamado, nos dons e na vida de igreja — do fundamento à prática.',
    href: `${FIVEONE}/cursos`,
    acao: 'Ver cursos',
  },
  {
    tipo: 'Leitura',
    titulo: 'Para Ler',
    texto: 'Artigos do Five One sobre discipulado, os cinco ministérios e a vida da igreja.',
    href: `${FIVEONE}/para-ler`,
    acao: 'Ler artigos',
  },
  {
    tipo: 'Instagram',
    titulo: INSTAGRAM_HANDLE,
    texto: 'Fotos dos encontros, avisos da agenda e o dia a dia das casas.',
    href: INSTAGRAM_URL,
    acao: 'Seguir',
  },
];

export default function RedeRecursos() {
  return (
    <RedeLayout title="Recursos">
      <PageHero
        eyebrow="Biblioteca da rede"
        title={
          <>
            Para ler, estudar e <em>caminhar</em>
          </>
        }
        lead="O que cremos, o que ensinamos e o que recomendamos — tudo num só lugar."
      />

      <section className="rs-section rs-section--light">
        <div className="rs-container">
          <SectionHead
            eyebrow="Comece aqui"
            title={
              <>
                A Confissão de <em>Fé</em>
              </>
            }
          />
          <div className="rs-feature rs-reveal">
            <div>
              <p className="rs-feature__kicker">Documento confessional · 13 doutrinas primárias · 12 secundárias</p>
              <p>
                O coração doutrinário da Rede de Igrejas nas Casas: o que cremos, como cremos e por que cremos. Um pacto
                de aliança para ler junto, em casa, com os irmãos.
              </p>
            </div>
            <div className="rs-actions">
              <Link to={redePath('confissao')} className="rs-btn rs-btn--primary">
                Ler no site <ArrowIcon />
              </Link>
              <a href={CONFISSAO_PDF} download className="rs-btn rs-btn--outline">
                Baixar PDF
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="rs-section rs-section--dark">
        <div className="rs-container">
          <SectionHead
            eyebrow="Artigos"
            title={
              <>
                Para entender a igreja <em>nas casas</em>
              </>
            }
          />
          <ul className="rs-articles">
            {ARTIGOS.map((a, i) => (
              <li key={a.slug} className="rs-reveal">
                <Link to={artigoPath(a.slug)} className="rs-article-card">
                  <span className="rs-article-card__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="rs-eyebrow">{a.categoria}</span>
                  <strong>
                    {a.titulo} <em>{a.destaque}</em>
                  </strong>
                  <span className="rs-article-card__lead">{a.resumo}</span>
                  <span className="rs-link">Ler artigo →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rs-section rs-section--light">
        <div className="rs-container">
          <SectionHead
            eyebrow="Recomendados"
            title={
              <>
                Para ir mais <em>fundo</em>
              </>
            }
          />
          <ul className="rs-resources">
            {EXTERNOS.map((r) => (
              <li key={r.titulo} className="rs-reveal">
                <a href={r.href} target="_blank" rel="noopener noreferrer" className="rs-resource">
                  <span className="rs-eyebrow">{r.tipo}</span>
                  <strong>{r.titulo}</strong>
                  <span>{r.texto}</span>
                  <span className="rs-link">{r.acao} ↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <VisitCta image={PHOTOS.palavra} />
    </RedeLayout>
  );
}
