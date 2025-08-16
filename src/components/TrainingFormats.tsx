import React from "react";

// Componente de Cards de Formatos para a página do Teste/Quiz
// Estilize via TrainingFormats.css (a ser criado separadamente)

type CardData = {
  badge: string;
  title: string;
  subtitle: string;
  desc: string;
  points: string[];
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
};

const cards: CardData[] = [
  {
    badge: "Individual",
    title: "Mentoria Individual",
    subtitle: "60–90 min · 1 pessoa",
    desc:
      "Sessão personalizada para discernir e desenvolver o seu dom ministerial com base bíblica e um plano de ação prático.",
    points: [
      "Diagnóstico do dom (teste + conversa guiada)",
      "Fundamentação bíblica aplicada ao perfil",
      "Plano prático de 30 dias",
    ],
    ctaLabel: "Agendar mentoria",
    ctaHref:
      "https://wa.me/5583987181731?text=Olá! Quero agendar Mentoria Individual sobre os 5 Ministérios.",
  },
  {
    badge: "Igreja toda",
    title: "Palestra Introdutória",
    subtitle: "1–2 h · Comunidade",
    desc:
      "Visão bíblica e prática dos 5 Ministérios para despertar toda a igreja e alinhar a compreensão do tema.",
    points: [
      "Ef 4:11–16 e propósito dos dons",
      "Sinais de cada dom no dia a dia",
      "Primeiros passos de aplicação",
    ],
    ctaLabel: "Levar para minha igreja",
    ctaHref:
      "https://wa.me/5583987181731?text=Olá! Quero levar a Palestra Introdutória dos 5 Ministérios para a igreja.",
  },
  {
    badge: "Presbíteros & líderes",
    title: "Treinamento para Liderança",
    subtitle: "1 dia · Equipe",
    desc:
      "Alinhamento teológico e planejamento de implementação por áreas e pessoas, com diagnóstico de dons da equipe.",
    points: [
      "Fundamentos bíblicos (Ef 4 + textos-chave)",
      "Diagnóstico da equipe por dons",
      "Mapa de funções e primeiros 90 dias",
    ],
    ctaLabel: "Agendar treinamento",
    ctaHref:
      "https://wa.me/5583987181731?text=Olá! Quero agendar o Treinamento para Liderança sobre os 5 Ministérios.",
  },
  {
    badge: "Acompanhamento",
    title: "Imersão Ministerial",
    subtitle: "1 semana a 3 meses · Igreja inteira",
    desc:
      "Diagnóstico, capacitação por dom, prática supervisionada e mentoria com indicadores de progresso.",
    points: [
      "Aplicação do Teste Five One (membros e líderes)",
      "Módulos por dom (apóstolo, profeta, evangelista, pastor, mestre)",
      "Reuniões de alinhamento e metas mensais",
    ],
    ctaLabel: "Solicitar proposta",
    ctaHref:
      "https://wa.me/5583987181731?text=Olá! Quero solicitar proposta de Imersão Ministerial (1–12 semanas).",
    featured: true,
  },
];

const TrainingFormats: React.FC = () => {
  return (
    <section
      id="formatos-treinamento"
      className="training-cards-section"
      aria-labelledby="formatos-heading"
    >
      <h2 id="formatos-heading">Leve os 5 Ministérios para sua igreja</h2>
      <p className="training-intro">
        Palestras, treinamentos e acompanhamento prático — formatos flexíveis para presbíteros, líderes e toda a igreja.
      </p>

      <div className="cards-wrapper">
        <div className="cards-grid">
          {cards.map((card) => (
            <article
              key={card.title}
              className={`card${card.featured ? " card-featured" : ""}`}
            >
              <header className="card-head">
                <span className="badge">{card.badge}</span>
                <h3>{card.title}</h3>
                <p className="card-sub">{card.subtitle}</p>
              </header>

              <p className="card-desc">{card.desc}</p>

              {card.points?.length > 0 && (
                <ul className="card-list">
                  {card.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}

              <footer className="card-footer">
                <a
                  className={`btn${card.featured ? " btn-outline" : ""}`}
                  href={card.ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${card.ctaLabel} – ${card.title}`}
                >
                  {card.ctaLabel}
                </a>
              </footer>
            </article>
          ))}
        </div>
      </div>

      <div className="compare">
        <h4>Não sabe qual opção é melhor para sua igreja?</h4>
        <a
          className="btn ghost"
          href="https://wa.me/5583987181731?text=Olá! Preciso de ajuda para escolher o melhor formato para nossa igreja."
          target="_blank"
          rel="noopener noreferrer"
        >
          Clique aqui e fale conosco
        </a>
      </div>
    </section>
  );
};

export default React.memo(TrainingFormats);
