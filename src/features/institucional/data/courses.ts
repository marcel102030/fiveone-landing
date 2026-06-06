// ── Configuração de lançamento ──────────────────────────────────────────────
// Quando APOLOGETICA_LAUNCHED = false  → mostra contador + lista de espera
// Quando APOLOGETICA_LAUNCHED = true   → mostra botão de compra normal
// Troque para true no dia do lançamento.
export const APOLOGETICA_LAUNCHED = false;
export const APOLOGETICA_LAUNCH_DATE = new Date("2026-07-06T09:00:00-03:00");

// Fonte única de dados dos cursos.
// Importada pela Home (CourseShowcase) e pela página /cursos.
// Altere aqui — reflete automaticamente em todos os lugares.

import coverEntendes from "../assets/images/EntendesOqueler.png";
import coverFimDosTempos from "../assets/images/IntroducaoAoFimDostempos.png";
import coverVivaChamado from "../assets/images/VivaOSeuChamado.png";

export type UpcomingCourse = {
  title: string;
  description: string;
  category: string;
  coverUrl?: string; // imagem de capa 1200×630px — quando disponível, aparece no topo do card
};

export const UPCOMING_COURSES: UpcomingCourse[] = [
  {
    title: "Entendes o que lês?",
    description:
      "Você lê a Bíblia, mas nem sempre sai com clareza do que leu? Neste curso você aprende a entender o texto bíblico do jeito certo — sem complicar.",
    category: "Estudo Bíblico",
    coverUrl: coverEntendes,
  },
  {
    title: "Introdução ao Fim dos Tempos",
    description:
      "O que a Bíblia realmente diz sobre os últimos dias? Um curso baseado nas Escrituras para entender a escatologia sem sensacionalismo e com fundamento sólido.",
    category: "Teologia",
    coverUrl: coverFimDosTempos,
  },
  {
    title: "Viva o seu Chamado",
    description:
      "Descubra como identificar, desenvolver e viver o seu dom ministerial no dia a dia — na sua família, na sua igreja e no mundo ao seu redor.",
    category: "Ministério",
    coverUrl: coverVivaChamado,
  },
];
