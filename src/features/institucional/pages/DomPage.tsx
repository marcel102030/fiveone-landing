import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  DOMS,
  DOM_ORDER,
  DomKey,
} from "../../../shared/utils/pdfGenerators/ministerialContent";
import "./DomPage.css";

const IG_URL = "https://www.instagram.com/marcelojunior.fiveone/";

const rgb = (c: [number, number, number]) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
const rgba = (c: [number, number, number], a: number) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

export default function DomPage() {
  const { slug } = useParams<{ slug: string }>();
  const key = (slug || "").toLowerCase() as DomKey;
  const dom = DOM_ORDER.includes(key) ? DOMS[key] : null;

  useEffect(() => {
    if (!dom) return;
    const prevTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute("content") || "";
    document.title = `Dom de ${dom.nome} — forças, pontos cegos e chamado (Efésios 4) | Five One`;
    const desc = `O dom de ${dom.nome} nos 5 ministérios de Efésios 4: o que é, forças, pontos cegos, como se manifesta e como desenvolver. Descubra se é o seu dom no Teste dos 5 Ministérios.`;
    metaDesc?.setAttribute("content", desc);
    window.scrollTo(0, 0);
    return () => {
      document.title = prevTitle;
      metaDesc?.setAttribute("content", prevDesc);
    };
  }, [dom]);

  if (!dom) return <Navigate to="/descubra-seu-dom" replace />;

  const accent = rgb(dom.cor);
  const others = DOM_ORDER.filter((k) => k !== key);

  return (
    <article className="dom-page" style={{ ["--dom-accent" as string]: accent, ["--dom-accent-soft" as string]: rgba(dom.cor, 0.12) }}>
      <header className="dom-hero">
        <p className="dom-eyebrow">Efésios 4:11 · Os 5 Ministérios</p>
        <h1>
          Dom de <span className="dom-accent-text">{dom.nome}</span>
        </h1>
        <p className="dom-lead">{dom.frase}</p>
        <Link to="/descubra-seu-dom" className="dom-cta-btn">
          Descobrir o meu dom →
        </Link>
      </header>

      <div className="dom-body">
        <section>
          <h2>O que é o dom de {dom.nome}?</h2>
          <p>{dom.essencia}</p>
        </section>

        <section>
          <h2>Como o dom de {dom.nome} se manifesta no dia a dia</h2>
          <ul className="dom-flow">
            {dom.naPratica.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="dom-two-col">
          <div>
            <h3 className="dom-h-accent">Forças</h3>
            <ul className="dom-bullets">
              {dom.caracteristicas.slice(0, 6).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="dom-h-warn">Pontos cegos</h3>
            <ul className="dom-bullets dom-bullets-warn">
              {dom.pontosCegos.slice(0, 6).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2>Imaturo × Maduro</h2>
          <div className="dom-mat">
            <div className="dom-mat-card dom-mat-dn">
              <span>Quando imaturo</span>
              <p>{dom.imaturo}</p>
            </div>
            <div className="dom-mat-card dom-mat-up">
              <span>Quando maduro</span>
              <p>{dom.maduro}</p>
            </div>
          </div>
        </section>

        <section>
          <h2>Funções do {dom.nome} no Corpo de Cristo</h2>
          <ul className="dom-bullets">
            {dom.funcoes.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Como desenvolver o dom de {dom.nome}</h2>
          <ul className="dom-flow">
            {dom.comoDesenvolver.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <blockquote className="dom-verse">
          <p>“{dom.versiculo.texto}”</p>
          <cite>{dom.versiculo.ref}</cite>
        </blockquote>

        <section className="dom-refs">
          <h3>Referências bíblicas</h3>
          <div className="dom-refs-list">
            {dom.referencias.map((r) => (
              <span key={r}>{r}</span>
            ))}
          </div>
        </section>

        <section className="dom-cta-final">
          <h2>Esse é o seu dom?</h2>
          <p>
            Faça o <strong>Teste dos 5 Ministérios</strong> — grátis, ~10 minutos — e descubra o seu
            dom principal e secundário, com um PDF completo do seu perfil.
          </p>
          <Link to="/descubra-seu-dom" className="dom-cta-btn">
            Fazer o teste agora
          </Link>
        </section>

        <nav className="dom-others" aria-label="Os outros dons">
          <h3>Conheça os outros dons</h3>
          <div className="dom-others-grid">
            {others.map((k) => (
              <Link key={k} to={`/dom/${k}`} className="dom-other-link">
                <span className="dom-other-dot" style={{ background: rgb(DOMS[k].cor) }} />
                {DOMS[k].nome}
              </Link>
            ))}
          </div>
        </nav>

        <footer className="dom-page-footer">
          <p>
            Conteúdo por <strong>Marcelo Junior</strong> · Five One —{" "}
            <a href={IG_URL} target="_blank" rel="noopener noreferrer">
              @marcelojunior.fiveone
            </a>
          </p>
        </footer>
      </div>
    </article>
  );
}
