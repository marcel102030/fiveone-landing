// ── Configuração de lançamento ──────────────────────────────────────────────
// Quando APOLOGETICA_LAUNCHED = false  → mostra contador + lista de espera
// Quando APOLOGETICA_LAUNCHED = true   → mostra botão de compra normal
// Troque para true no dia do lançamento.
export const APOLOGETICA_LAUNCHED = false;
// Apologética pausada por ora → "Em breve" (sem venda). Quando quiser reabrir a
// pré-venda, volte APOLOGETICA_PRESALE para true.
export const APOLOGETICA_PRESALE = false;
export const APOLOGETICA_LAUNCH_DATE = new Date("2026-11-20T09:00:00-03:00");

// ── Curso "Viva o seu Chamado" (Curso dos 5 Ministérios) ────────────────────
// Lançamento em turma pioneira (drip: aulas liberadas por semana).
// Enquanto VIVA_LAUNCHED e VIVA_PRESALE forem false → mostra lista de espera.
// Quando tiver preço + checkout Hotmart, preencha e ligue o presale.
export const VIVA_LAUNCHED = false;
export const VIVA_PRESALE = false;
export const VIVA_LAUNCH_DATE = new Date("2026-09-30T09:00:00-03:00"); // placeholder — ajuste no lançamento
export const VIVA_HOTMART_URL = ""; // preencher quando tiver o checkout
export const VIVA_PRICE = "R$ 97,00"; // placeholder — ajuste o preço da turma pioneira

// Fonte única de dados dos cursos.
// Importada pela Home (CourseShowcase) e pela página /cursos.
// Altere aqui — reflete automaticamente em todos os lugares.

import coverEntendes from "../assets/images/EntendesOqueler.png";
import coverFimDosTempos from "../assets/images/IntroducaoAoFimDostempos.png";
import coverApologetica from "../assets/images/capa_curso_apologetica.jpg";

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
    title: "Defenda a sua Fé",
    description:
      "Introdução à Apologética Cristã: aprenda a defender a sua fé com solidez bíblica e racional, com linguagem clara e exemplos do dia a dia.",
    category: "Apologética",
    coverUrl: coverApologetica,
  },
];
