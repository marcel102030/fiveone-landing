// ── Configuração de lançamento ──────────────────────────────────────────────
// Quando APOLOGETICA_LAUNCHED = false  → mostra contador + lista de espera
// Quando APOLOGETICA_LAUNCHED = true   → mostra botão de compra normal
// Troque para true no dia do lançamento.
export const APOLOGETICA_LAUNCHED = false;
export const APOLOGETICA_LAUNCH_DATE = new Date("2026-07-06T09:00:00-03:00");

// Fonte única de dados dos cursos.
// Importada pela Home (CourseShowcase) e pela página /cursos.
// Altere aqui — reflete automaticamente em todos os lugares.

export type UpcomingCourse = {
  title: string;
  description: string;
  category: string;
};

export const UPCOMING_COURSES: UpcomingCourse[] = [
  {
    title: "Entendes o que lês?",
    description:
      "Você lê a Bíblia, mas nem sempre sai com clareza do que leu? Neste curso você aprende a entender o texto bíblico do jeito certo — sem complicar.",
    category: "Estudo Bíblico",
  },
  {
    title: "Cristologia",
    description:
      "Quem é Jesus, de verdade? Muito além do que você aprendeu no ensino fundamental — um curso que transforma a forma como você lê a Bíblia e vive a fé.",
    category: "Teologia",
  },
  {
    title: "Vida Devocional",
    description:
      "Você sente que sua vida de oração é seca ou mecânica? Aqui você aprende a cultivar uma relação viva com Deus — simples, consistente e transformadora.",
    category: "Espiritualidade",
  },
];
