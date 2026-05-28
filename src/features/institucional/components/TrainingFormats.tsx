import React from "react";
import { Link } from "react-router-dom";

type CardData = {
  badge: string;
  title: string;
  subtitle: string;
  desc: string;
  points: string[];
  ctaLabel: string;
  ctaTo: string;
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
    ctaTo: "/solucoes/mentoria-individual",
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
    ctaTo: "/solucoes/palestra-introdutoria",
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
    ctaTo: "/solucoes/treinamento-lideranca",
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
    ctaTo: "/solucoes/imersao-ministerial",
    featured: true,
  },
];

const CheckIcon = () => (
  <svg
    className="w-4 h-4 text-mint shrink-0 mt-0.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const WhatsappIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.539 5.265L4.5 19.8l3.154-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
  </svg>
);

const TrainingFormats: React.FC = () => {
  return (
    <section
      id="formatos-treinamento"
      className="relative bg-navy-light/40 py-20 lg:py-28 overflow-hidden scroll-mt-20"
      aria-labelledby="formatos-heading"
    >
      {/* Background sutil */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-mint/[0.04] blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="max-w-2xl mx-auto text-center mb-12 lg:mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-4">
            Para sua igreja
          </span>
          <h2
            id="formatos-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-white tracking-tight"
          >
            Leve os 5 Ministérios para <span className="text-mint">sua igreja</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate">
            Palestras, treinamentos e acompanhamento prático — formatos
            flexíveis para presbíteros, líderes e toda a comunidade.
          </p>
        </div>

        {/* Grid de cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {cards.map((card) => (
            <article
              key={card.title}
              className={`relative flex flex-col p-6 lg:p-7 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${
                card.featured
                  ? "bg-gradient-to-br from-mint/10 via-navy-light to-navy-light border-mint/40 shadow-mint"
                  : "bg-navy-light/60 border-slate/10 hover:border-mint/30"
              }`}
            >
              {card.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-mint text-navy text-2xs font-bold uppercase tracking-wider shadow-mint-strong">
                  Mais completo
                </div>
              )}

              <div className="mb-4">
                <span className="inline-block px-2.5 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-2xs font-semibold uppercase tracking-wider">
                  {card.badge}
                </span>
              </div>

              <h3 className="text-lg lg:text-xl font-bold text-slate-white mb-1">
                {card.title}
              </h3>
              <p className="text-2xs lg:text-xs text-slate uppercase tracking-wider mb-4">
                {card.subtitle}
              </p>

              <p className="text-sm text-slate-light leading-relaxed mb-5">
                {card.desc}
              </p>

              {card.points && card.points.length > 0 && (
                <ul className="space-y-2 mb-6 grow">
                  {card.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-xs lg:text-sm text-slate">
                      <CheckIcon />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-auto pt-2">
                <Link
                  to={card.ctaTo}
                  aria-label={`${card.ctaLabel} – ${card.title}`}
                  className={`group inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    card.featured
                      ? "bg-mint text-navy hover:shadow-mint-strong"
                      : "border border-slate/20 text-slate-light hover:border-mint hover:text-mint"
                  }`}
                >
                  {card.ctaLabel}
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Ajuda para escolher */}
        <div className="mt-12 lg:mt-14 max-w-2xl mx-auto text-center">
          <p className="text-slate text-sm mb-4">
            Não sabe qual opção é melhor para sua igreja?
          </p>
          <a
            href="https://wa.me/5583987181731?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20para%20escolher%20o%20melhor%20formato%20para%20nossa%20igreja."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            <WhatsappIcon />
            Fale conosco no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

export default React.memo(TrainingFormats);
