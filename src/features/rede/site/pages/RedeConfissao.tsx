import { useEffect, useState } from 'react';
import RedeLayout, { ArrowIcon } from '../RedeLayout';
import { PageHero, VisitCta } from '../RedeBlocks';
import { CONFISSAO, type Bloco, type Doutrina } from '../confissaoData';
import { CONFISSAO_PDF, PHOTOS } from '../redeData';

function Blocos({ blocos }: { blocos: Bloco[] }) {
  return (
    <>
      {blocos.map((b, i) => {
        if (typeof b === 'string') return <p key={i}>{b}</p>;
        if (b.tipo === 'subtitulo') return <h4 key={i}>{b.texto}</h4>;
        if (b.tipo === 'citacao')
          return (
            <blockquote key={i} className="rs-quote">
              “{b.texto}”<cite>{b.ref}</cite>
            </blockquote>
          );
        const Tag = b.ordenada ? 'ol' : 'ul';
        return (
          <Tag key={i}>
            {b.itens.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </Tag>
        );
      })}
    </>
  );
}

function DoutrinaArtigo({ d }: { d: Doutrina }) {
  return (
    <article id={d.id} className="rs-doctrine">
      <h3>
        <span>{d.letra})</span> {d.titulo}
      </h3>
      <p className="rs-doctrine__cremos">{d.cremos}</p>
      <Blocos blocos={d.blocos} />
      {d.aplicacao.length > 0 && (
        <aside className="rs-doctrine__apply">
          <span>{d.aplicacaoTitulo}</span>
          <ul>
            {d.aplicacao.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  );
}

const SECOES = [
  { id: 'prefacio', label: 'Prefácio' },
  { id: 'credo', label: 'Credo Niceno' },
  { id: 'introducao', label: 'Introdução' },
  { id: 'parte-1', label: 'Parte I · Doutrinas Primárias', itens: CONFISSAO.primarias },
  { id: 'parte-2', label: 'Parte II · Doutrinas Secundárias', itens: CONFISSAO.secundarias },
  { id: 'conclusao', label: 'Conclusão' },
];

/** Marca no índice a seção que está na tela. */
function useActiveSection() {
  const [active, setActive] = useState<string>('prefacio');
  useEffect(() => {
    const ids = [
      ...SECOES.map((s) => s.id),
      ...CONFISSAO.primarias.map((d) => d.id),
      ...CONFISSAO.secundarias.map((d) => d.id),
    ];
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-90px 0px -70% 0px' },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return active;
}

export default function RedeConfissao() {
  const active = useActiveSection();
  // No celular o índice começa fechado para não empurrar o texto para baixo.
  const [indexOpen] = useState(() => window.matchMedia('(min-width: 961px)').matches);

  return (
    <RedeLayout title="Confissão de Fé">
      <PageHero
        eyebrow="O que cremos"
        title={
          <>
            Confissão de <em>Fé</em>
          </>
        }
        lead="Documento confessional e aliança comunitária da Rede de Igrejas nas Casas: o que cremos, como cremos e por que cremos."
      >
        <div className="rs-actions">
          <a className="rs-btn rs-btn--primary" href={CONFISSAO_PDF} download>
            Baixar em PDF <ArrowIcon />
          </a>
        </div>
      </PageHero>

      <section className="rs-section rs-section--light rs-section--tight-top">
        <div className="rs-container rs-doc">
          <aside className="rs-doc__index">
            <details open={indexOpen}>
              <summary>Índice</summary>
              <nav aria-label="Índice da Confissão">
                {SECOES.map((s) => (
                  <div key={s.id}>
                    <a href={`#${s.id}`} className={active === s.id ? 'is-active' : ''}>
                      {s.label}
                    </a>
                    {s.itens && (
                      <ul>
                        {s.itens.map((d) => (
                          <li key={d.id}>
                            <a href={`#${d.id}`} className={active === d.id ? 'is-active' : ''}>
                              {d.letra}) {d.titulo}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </nav>
            </details>
          </aside>

          <div className="rs-doc__body">
            <blockquote className="rs-doc__epigraph">
              “Portanto, irmãos, tendo em mente todas essas coisas, permaneçam firmes e apeguem-se às tradições que lhes
              transmitimos, seja pessoalmente, seja por carta.”
              <cite>2 Tessalonicenses 2.15 (NVT)</cite>
            </blockquote>

            <section id="prefacio">
              <h2>Prefácio</h2>
              {CONFISSAO.prefacio.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p className="rs-doc__sign">{CONFISSAO.prefacioAssinatura}</p>
            </section>

            <section id="credo">
              <h2>Credo Niceno-Constantinopolitano</h2>
              <p className="rs-doc__meta">{CONFISSAO.credo.origem}</p>
              <p>{CONFISSAO.credo.intro}</p>
              <div className="rs-doc__creed">
                {CONFISSAO.credo.linhas.map((l, i) => (
                  <span key={i}>{l}</span>
                ))}
              </div>
            </section>

            <section id="introducao">
              <h2>Introdução</h2>
              <Blocos blocos={CONFISSAO.introducao} />
            </section>

            <section id="parte-1">
              <h2>
                Parte I · <em>Doutrinas Primárias</em>
              </h2>
              <p className="rs-doc__meta">Essenciais ao evangelho</p>
              {CONFISSAO.primarias.map((d) => (
                <DoutrinaArtigo key={d.id} d={d} />
              ))}
            </section>

            <section id="parte-2">
              <h2>
                Parte II · <em>Doutrinas Secundárias</em>
              </h2>
              <p className="rs-doc__meta">Urgentes para a saúde da igreja</p>
              {CONFISSAO.secundarias.map((d) => (
                <DoutrinaArtigo key={d.id} d={d} />
              ))}
            </section>

            <section id="conclusao">
              <h2>Conclusão</h2>
              <Blocos blocos={CONFISSAO.conclusao} />
              <p className="rs-doc__sign">
                <em>Soli Deo Gloria</em> — a glória somente a Deus
              </p>
            </section>
          </div>
        </div>
      </section>

      <VisitCta image={PHOTOS.palavra} />
    </RedeLayout>
  );
}
