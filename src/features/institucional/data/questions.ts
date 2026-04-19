import { Statement, CategoryEnum, CategoryMetadata } from "../types/quiz";

export const categoryMetadata: CategoryMetadata[] = [
  {
    id: CategoryEnum.APOSTOLO,
    name: "Apóstolo",
    icon: "/assets/icons/praying.png",
    description:
      "O dom de Apóstolo está ligado à visão estratégica para estabelecer e expandir a obra de Deus em novos territórios. Apóstolos têm uma forte capacidade de lançar fundamentos, mobilizar líderes e criar estruturas que multiplicam o Reino. Eles são movidos pelo desejo de avançar além do que já existe, abrir novos caminhos e enviar outros para cumprir sua missão.",
  },
  {
    id: CategoryEnum.PROFETA,
    name: "Profeta",
    icon: "assets/icons/priest.png",
    description:
      "O dom de Profeta está ligado a uma sensibilidade espiritual aguçada, à capacidade de discernir a vontade de Deus e comunicar Sua mensagem às pessoas. Os profetas são conhecidos por sua intimidade com Deus, coragem para falar a verdade, e o desejo de ver a justiça divina sendo estabelecida.",
  },
  {
    id: CategoryEnum.EVANGELISTA,
    name: "Evangelista",
    icon: "assets/icons/pulpit.png",
    description:
      "O dom de Evangelista está ligado à paixão por compartilhar o evangelho e trazer as pessoas para Cristo. Evangelistas têm um forte desejo de ver vidas transformadas pela salvação e são movidos por um profundo amor pelas almas. Eles frequentemente têm facilidade em comunicar a mensagem do evangelho de forma clara e convincente.",
  },
  {
    id: CategoryEnum.PASTOR,
    name: "Pastor",
    icon: "assets/icons/shepherd.png",
    description:
      "O dom pastoral envolve cuidar, guiar e nutrir espiritualmente o rebanho de Deus. Um pastor tem um coração de compaixão pelas pessoas, preocupa-se com seu bem-estar espiritual e emocional, e se dedica a discipular e ajudar os outros a crescerem em Cristo.",
  },
  {
    id: CategoryEnum.MESTRE,
    name: "Mestre",
    icon: "assets/icons/bible.png",
    description:
      "O dom de Mestre envolve a habilidade de ensinar e comunicar de forma clara as verdades bíblicas. Mestres têm paixão por estudar a Palavra de Deus, explicar conceitos complexos e ajudar os outros a crescerem em seu entendimento e aplicação das Escrituras.",
  },
];

export const statements: Record<CategoryEnum, Statement[]> = {
  [CategoryEnum.APOSTOLO]: [
    {
      id: 1,
      category: CategoryEnum.APOSTOLO,
      text: "Tenho facilidade em visualizar caminhos estratégicos para o avanço de projetos que envolvem pessoas e transformação.",
    },
    {
      id: 2,
      category: CategoryEnum.APOSTOLO,
      text: "Sinto-me motivado a iniciar coisas novas, especialmente em ambientes onde poucos estão dispostos a começar.",
    },
    {
      id: 3,
      category: CategoryEnum.APOSTOLO,
      text: "Fico inquieto quando percebo que um grupo, igreja ou projeto está estagnado e sem crescimento.",
    },
    {
      id: 4,
      category: CategoryEnum.APOSTOLO,
      text: "Tenho facilidade em liderar com visão de longo prazo, inspirando outros a se unirem em um propósito maior.",
    },
    {
      id: 5,
      category: CategoryEnum.APOSTOLO,
      text: "Sinto-me confortável ao trabalhar em contextos novos, incertos ou desafiadores, onde é preciso abrir caminho para outros.",
    },
    {
      id: 6,
      category: CategoryEnum.APOSTOLO,
      text: "Tenho prazer em estabelecer fundamentos estratégicos para que outros ministérios ou projetos possam edificar a partir deles.",
    },
    {
      id: 7,
      category: CategoryEnum.APOSTOLO,
      text: "Gosto de conectar pessoas com habilidades diferentes para formar redes colaborativas que impulsionem um objetivo comum.",
    },
    {
      id: 8,
      category: CategoryEnum.APOSTOLO,
      text: "Sinto alegria ao formar e capacitar líderes que possam continuar uma missão ou projeto com autonomia.",
    },
    {
      id: 9,
      category: CategoryEnum.APOSTOLO,
      text: "Tenho facilidade em planejar, organizar e estruturar iniciativas que envolvem crescimento e desenvolvimento coletivo.",
    },
    {
      id: 10,
      category: CategoryEnum.APOSTOLO,
      text: "Costumo perceber rapidamente os pontos que precisam ser ajustados para que um grupo ou projeto alcance seu potencial máximo.",
    },
    {
      id: 11,
      category: CategoryEnum.APOSTOLO,
      text: "Sinto satisfação em superar resistências e barreiras ao estabelecer algo novo em um território ainda não explorado.",
    },
    {
      id: 12,
      category: CategoryEnum.APOSTOLO,
      text: "Tenho facilidade em delegar responsabilidades estratégicas e confiar que outros executarão com excelência.",
    },
    {
      id: 13,
      category: CategoryEnum.APOSTOLO,
      text: "Me alegra construir pontes entre lideranças de diferentes contextos para unir esforços em um objetivo comum.",
    },
    {
      id: 14,
      category: CategoryEnum.APOSTOLO,
      text: "Sinto que fui feito para navegar em situações de alta pressão e ambiguidade, tomando decisões que impulsionam o avanço coletivo.",
    },
    {
      id: 15,
      category: CategoryEnum.APOSTOLO,
      text: "Tenho facilidade em enxergar como diferentes setores ou áreas podem trabalhar de forma alinhada.",
    },
    {
      id: 16,
      category: CategoryEnum.APOSTOLO,
      text: "Valorizo a construção de bases sólidas que possam ser multiplicadas de forma consistente por outras pessoas.",
    },
    {
      id: 17,
      category: CategoryEnum.APOSTOLO,
      text: "Me preocupo em garantir que as ações que estamos realizando hoje tenham impacto duradouro e sejam sustentáveis no futuro.",
    },
    {
      id: 18,
      category: CategoryEnum.APOSTOLO,
      text: "Tenho facilidade em antecipar cenários futuros e gosto de pensar estrategicamente para enfrentá-los.",
    },
    {
      id: 19,
      category: CategoryEnum.APOSTOLO,
      text: "Me sinto chamado a capacitar e enviar outras pessoas, ajudando-as a alcançar seu próprio propósito e missão.",
    },
    {
      id: 20,
      category: CategoryEnum.APOSTOLO,
      text: "Tenho facilidade em agir com coragem e assumir riscos calculados para abrir novos caminhos quando necessário.",
    },
  ],
  [CategoryEnum.PROFETA]: [
    {
      id: 21,
      category: CategoryEnum.PROFETA,
      text: "Tenho uma percepção rápida e quase instintiva quando algo está espiritualmente errado, mesmo sem fatos concretos.",
    },
    {
      id: 22,
      category: CategoryEnum.PROFETA,
      text: "Sinto-me incomodado quando vejo hipocrisia, superficialidade ou incoerência na vida espiritual das pessoas.",
    },
    {
      id: 23,
      category: CategoryEnum.PROFETA,
      text: "Sinto uma inquietude interior quando uma comunidade de fé está acomodada e perdendo sua chama espiritual.",
    },
    {
      id: 24,
      category: CategoryEnum.PROFETA,
      text: "Costumo perceber antes dos outros quando uma situação, projeto ou grupo está espiritualmente fora de direção.",
    },
    {
      id: 25,
      category: CategoryEnum.PROFETA,
      text: "Sinto necessidade de chamar as pessoas ao arrependimento ou a um recomeço mais autêntico em sua caminhada de fé.",
    },
    {
      id: 26,
      category: CategoryEnum.PROFETA,
      text: "Tenho um forte desejo de que a igreja viva de forma mais sensível à direção do Espírito Santo, e não apenas seguindo métodos humanos.",
    },
    {
      id: 27,
      category: CategoryEnum.PROFETA,
      text: "Tenho facilidade em identificar quando um ambiente espiritual está pesado, opressivo ou desequilibrado.",
    },
    {
      id: 28,
      category: CategoryEnum.PROFETA,
      text: "Sinto que meu papel é ser uma voz que confronta e chama à reflexão, mesmo quando isso me torna impopular.",
    },
    {
      id: 29,
      category: CategoryEnum.PROFETA,
      text: "Me sinto motivado a interceder por pessoas, comunidades ou nações quando percebo que estão em um momento de crise espiritual.",
    },
    {
      id: 30,
      category: CategoryEnum.PROFETA,
      text: "Tenho momentos de busca intensa por experiências sobrenaturais, como ouvir Deus de forma clara ou ter visões espirituais.",
    },
    {
      id: 31,
      category: CategoryEnum.PROFETA,
      text: "Sinto que carrego uma responsabilidade de alertar outros quando percebo riscos espirituais, mesmo que não saibam ainda.",
    },
    {
      id: 32,
      category: CategoryEnum.PROFETA,
      text: "Meu senso de justiça é tão forte que fico inquieto ao ver líderes ou estruturas agindo de forma injusta ou manipuladora.",
    },
    {
      id: 33,
      category: CategoryEnum.PROFETA,
      text: "Já senti um peso emocional profundo por perceber que Deus estava entristecido com atitudes de um grupo ou pessoa.",
    },
    {
      id: 34,
      category: CategoryEnum.PROFETA,
      text: "Tenho facilidade em discernir se uma mensagem ou direção espiritual é genuína ou apenas emocional.",
    },
    {
      id: 35,
      category: CategoryEnum.PROFETA,
      text: "Desejo profundamente que a igreja volte a viver com mais poder espiritual, autenticidade e temor de Deus.",
    },
    {
      id: 36,
      category: CategoryEnum.PROFETA,
      text: "Tenho facilidade em articular com clareza o que percebo espiritualmente em uma situação, mesmo quando os outros ainda não viram.",
    },
    {
      id: 37,
      category: CategoryEnum.PROFETA,
      text: "Sinto uma profunda carga pela autenticidade espiritual, desejando que as palavras e ações das pessoas estejam alinhadas.",
    },
    {
      id: 38,
      category: CategoryEnum.PROFETA,
      text: "Me sinto chamado a falar palavras de encorajamento que constroem, fortalecem e confirmam o chamado das pessoas.",
    },
    {
      id: 39,
      category: CategoryEnum.PROFETA,
      text: "Costumo perceber temas espirituais recorrentes nas situações que vivencio e sinto necessidade de comunicá-los.",
    },
    {
      id: 40,
      category: CategoryEnum.PROFETA,
      text: "Tenho facilidade em inspirar outros à oração e à busca de Deus de forma mais intencional e profunda.",
    },
  ],
  [CategoryEnum.EVANGELISTA]: [
    {
      id: 41,
      category: CategoryEnum.EVANGELISTA,
      text: "Tenho facilidade em criar conexões rápidas com pessoas desconhecidas e construir pontes de relacionamento.",
    },
    {
      id: 42,
      category: CategoryEnum.EVANGELISTA,
      text: "Me sinto energizado quando estou em ambientes fora da igreja, especialmente em contato com pessoas que ainda não conhecem a fé.",
    },
    {
      id: 43,
      category: CategoryEnum.EVANGELISTA,
      text: "Fico naturalmente atento a oportunidades de iniciar conversas que podem levar a temas espirituais.",
    },
    {
      id: 44,
      category: CategoryEnum.EVANGELISTA,
      text: "Tenho um senso de urgência interior para compartilhar esperança com quem está em crise emocional ou espiritual.",
    },
    {
      id: 45,
      category: CategoryEnum.EVANGELISTA,
      text: "Me alegro profundamente ao ver alguém tomando decisões de transformação pessoal, especialmente em relação à fé.",
    },
    {
      id: 46,
      category: CategoryEnum.EVANGELISTA,
      text: "Costumo adaptar minha linguagem para que diferentes tipos de pessoas entendam mensagens espirituais complexas de forma simples.",
    },
    {
      id: 47,
      category: CategoryEnum.EVANGELISTA,
      text: "Sinto um impulso interior de não apenas convidar pessoas para a igreja, mas de ir até onde elas estão.",
    },
    {
      id: 48,
      category: CategoryEnum.EVANGELISTA,
      text: "Quando vejo alguém sofrendo ou vivendo sem propósito, sinto que preciso me aproximar e oferecer uma palavra de esperança.",
    },
    {
      id: 49,
      category: CategoryEnum.EVANGELISTA,
      text: "Tenho facilidade em compartilhar histórias de transformação de vida para inspirar outras pessoas.",
    },
    {
      id: 50,
      category: CategoryEnum.EVANGELISTA,
      text: "Acredito que a mensagem de esperança e reconciliação deve ultrapassar barreiras culturais, sociais ou religiosas.",
    },
    {
      id: 51,
      category: CategoryEnum.EVANGELISTA,
      text: "Me sinto desconfortável quando vejo a igreja ficando fechada em si mesma, sem alcançar quem está fora.",
    },
    {
      id: 52,
      category: CategoryEnum.EVANGELISTA,
      text: "Tenho prazer em organizar ou participar de ações que levem cuidado, serviço e esperança a lugares carentes ou marginalizados.",
    },
    {
      id: 53,
      category: CategoryEnum.EVANGELISTA,
      text: "Costumo ser aquele que encoraja amigos e irmãos de fé a também se envolverem na missão de alcançar outros.",
    },
    {
      id: 54,
      category: CategoryEnum.EVANGELISTA,
      text: "Quando compartilho sobre fé, costumo fazer de forma natural, durante conversas simples do cotidiano.",
    },
    {
      id: 55,
      category: CategoryEnum.EVANGELISTA,
      text: "Meu coração se comove ao ouvir histórias de pessoas que vivem longe da fé ou em situações de desesperança.",
    },
    {
      id: 56,
      category: CategoryEnum.EVANGELISTA,
      text: "Tenho facilidade em mobilizar grupos inteiros para saírem de suas zonas de conforto e se envolverem na missão.",
    },
    {
      id: 57,
      category: CategoryEnum.EVANGELISTA,
      text: "Me alegra criar pontos de contato e eventos que aproximem pessoas ainda não engajadas com uma comunidade de fé.",
    },
    {
      id: 58,
      category: CategoryEnum.EVANGELISTA,
      text: "Costumo lembrar das histórias das pessoas que alcancei e acompanho seu crescimento com interesse genuíno.",
    },
    {
      id: 59,
      category: CategoryEnum.EVANGELISTA,
      text: "Sinto energia especial ao participar de projetos de ação social que combinam cuidado prático com esperança espiritual.",
    },
    {
      id: 60,
      category: CategoryEnum.EVANGELISTA,
      text: "Tenho facilidade em identificar as perguntas que alguém ainda não expressou sobre fé e abrir espaço para que as faça.",
    },
  ],
  [CategoryEnum.PASTOR]: [
    {
      id: 61,
      category: CategoryEnum.PASTOR,
      text: "Sinto uma responsabilidade interior de acompanhar pessoas em seu crescimento espiritual, caminhando ao lado delas com constância.",
    },
    {
      id: 62,
      category: CategoryEnum.PASTOR,
      text: "Tenho facilidade em perceber quando alguém está emocionalmente abatido ou espiritualmente desanimado, mesmo que a pessoa não diga nada.",
    },
    {
      id: 63,
      category: CategoryEnum.PASTOR,
      text: "Me preocupo em criar ambientes seguros e acolhedores, onde todos se sintam vistos, ouvidos e cuidados.",
    },
    {
      id: 64,
      category: CategoryEnum.PASTOR,
      text: "Quando vejo alguém se afastando da fé ou da comunidade, sinto vontade de me aproximar para resgatar essa pessoa.",
    },
    {
      id: 65,
      category: CategoryEnum.PASTOR,
      text: "Costumo manter contato e nutrir relacionamentos de longo prazo, mesmo quando as pessoas atravessam fases difíceis.",
    },
    {
      id: 66,
      category: CategoryEnum.PASTOR,
      text: "Tenho facilidade em ouvir com empatia, dando espaço para que as pessoas compartilhem suas dores e lutas.",
    },
    {
      id: 67,
      category: CategoryEnum.PASTOR,
      text: "Sinto que meu papel é ajudar as pessoas a restaurarem sua fé e esperança quando estão cansadas ou confusas.",
    },
    {
      id: 68,
      category: CategoryEnum.PASTOR,
      text: "Prefiro liderar de maneira relacional, buscando proximidade com cada pessoa do grupo.",
    },
    {
      id: 69,
      category: CategoryEnum.PASTOR,
      text: "Me sinto realizado quando percebo que alguém está crescendo e amadurecendo na fé por meio de acompanhamento próximo.",
    },
    {
      id: 70,
      category: CategoryEnum.PASTOR,
      text: "Tenho facilidade em identificar as necessidades espirituais ou emocionais das pessoas ao meu redor.",
    },
    {
      id: 71,
      category: CategoryEnum.PASTOR,
      text: "Em conflitos ou divisões, costumo assumir a responsabilidade de buscar reconciliação e restaurar a unidade.",
    },
    {
      id: 72,
      category: CategoryEnum.PASTOR,
      text: "Tenho prazer em discipular de forma pessoal, cuidando não apenas do aprendizado bíblico, mas também da vida emocional da pessoa.",
    },
    {
      id: 73,
      category: CategoryEnum.PASTOR,
      text: "Valorizo encontros pequenos, grupos caseiros ou momentos de acompanhamento individual como espaço de crescimento.",
    },
    {
      id: 74,
      category: CategoryEnum.PASTOR,
      text: "Sinto que minha maior contribuição para a comunidade é cuidar das pessoas, acompanhá-las e ajudá-las a permanecer firmes na fé.",
    },
    {
      id: 75,
      category: CategoryEnum.PASTOR,
      text: "Me preocupo com o equilíbrio emocional e espiritual das pessoas, desejando que elas se sintam nutridas e fortalecidas.",
    },
    {
      id: 76,
      category: CategoryEnum.PASTOR,
      text: “Me alegra criar tradições e rituais de cuidado em grupos, como visitas, celebrações e acompanhamentos periódicos.”,
    },
    {
      id: 77,
      category: CategoryEnum.PASTOR,
      text: “Tenho facilidade em restaurar vínculos quebrados entre pessoas, ajudando-as a reconstruírem a confiança mútua.”,
    },
    {
      id: 78,
      category: CategoryEnum.PASTOR,
      text: “Sinto que uma das minhas maiores forças é estar presente nas crises e tristezas das pessoas sem precisar resolver tudo imediatamente.”,
    },
    {
      id: 79,
      category: CategoryEnum.PASTOR,
      text: “Me importo em celebrar cada pequena vitória das pessoas que acompanho, reconhecendo sua trajetória de crescimento.”,
    },
    {
      id: 80,
      category: CategoryEnum.PASTOR,
      text: “Costumo perceber quando alguém precisa de acolhimento antes de receber qualquer ensinamento ou orientação.”,
    },
  ],
  [CategoryEnum.MESTRE]: [
    {
      id: 81,
      category: CategoryEnum.MESTRE,
      text: "Tenho prazer em estudar temas profundos da Bíblia e compartilhar descobertas com outras pessoas.",
    },
    {
      id: 82,
      category: CategoryEnum.MESTRE,
      text: "Sinto uma satisfação especial quando ajudo alguém a entender conceitos bíblicos que antes pareciam difíceis.",
    },
    {
      id: 83,
      category: CategoryEnum.MESTRE,
      text: "Gosto de estruturar ideias de forma lógica e clara antes de ensiná-las.",
    },
    {
      id: 84,
      category: CategoryEnum.MESTRE,
      text: "Costumo fazer conexões entre diferentes passagens da Bíblia para trazer um entendimento mais completo.",
    },
    {
      id: 85,
      category: CategoryEnum.MESTRE,
      text: "Sinto um desejo constante de aprender mais sobre as Escrituras, história da igreja ou teologia.",
    },
    {
      id: 86,
      category: CategoryEnum.MESTRE,
      text: "As pessoas geralmente me procuram quando têm dúvidas teológicas ou querem entender melhor um texto bíblico.",
    },
    {
      id: 87,
      category: CategoryEnum.MESTRE,
      text: "Me sinto chamado a ajudar a igreja a crescer em maturidade através de um ensino sólido e equilibrado.",
    },
    {
      id: 88,
      category: CategoryEnum.MESTRE,
      text: "Tenho facilidade em identificar erros doutrinários e sinto necessidade de alertar quando percebo distorções na interpretação da Bíblia.",
    },
    {
      id: 89,
      category: CategoryEnum.MESTRE,
      text: "Gosto de preparar estudos bíblicos, materiais didáticos ou séries de ensino para pequenos grupos ou igreja.",
    },
    {
      id: 90,
      category: CategoryEnum.MESTRE,
      text: "Costumo fazer perguntas profundas que incentivam outros a refletirem com mais seriedade sobre sua fé.",
    },
    {
      id: 91,
      category: CategoryEnum.MESTRE,
      text: "Acredito que o crescimento espiritual saudável precisa estar fundamentado num ensino fiel à Palavra de Deus.",
    },
    {
      id: 92,
      category: CategoryEnum.MESTRE,
      text: "Me preocupo com a clareza das mensagens que são ensinadas, buscando sempre contextualizar sem perder a fidelidade bíblica.",
    },
    {
      id: 93,
      category: CategoryEnum.MESTRE,
      text: "Sinto alegria ao ver pessoas sendo transformadas pelo conhecimento prático da Palavra, não apenas pela emoção do momento.",
    },
    {
      id: 94,
      category: CategoryEnum.MESTRE,
      text: "Gosto de analisar contextos históricos e culturais para entender melhor os significados das passagens bíblicas.",
    },
    {
      id: 95,
      category: CategoryEnum.MESTRE,
      text: "Tenho facilidade em organizar cronogramas de ensino, séries temáticas ou conteúdos de discipulado.",
    },
    {
      id: 96,
      category: CategoryEnum.MESTRE,
      text: "Tenho prazer em adaptar conteúdos bíblicos para diferentes faixas etárias, culturas ou níveis de maturidade espiritual.",
    },
    {
      id: 97,
      category: CategoryEnum.MESTRE,
      text: "Me alegra ver pessoas aplicando princípios bíblicos em suas decisões práticas do dia a dia.",
    },
    {
      id: 98,
      category: CategoryEnum.MESTRE,
      text: "Sinto um entusiasmo especial ao descobrir conexões entre o texto bíblico e situações contemporâneas relevantes.",
    },
    {
      id: 99,
      category: CategoryEnum.MESTRE,
      text: "Costumo investir tempo em preparar materiais de ensino que facilitem o aprendizado e a memorização das verdades bíblicas.",
    },
    {
      id: 100,
      category: CategoryEnum.MESTRE,
      text: "Me sinto realizado ao formar outros ensinadores, capacitando-os a comunicar a Palavra com clareza e profundidade.",
    },
  ],
};

// Helper function to get two random statements from different categories
export const getRandomComparisonPair = (
  usedStatementIds: Set<number> = new Set()
): { statement1: Statement; statement2: Statement } | null => {
  // Get available statements per category
  const availableByCategory = Object.values(CategoryEnum).reduce(
    (acc, category) => {
      acc[category] = statements[category].filter(
        (s) => !usedStatementIds.has(s.id)
      );
      return acc;
    },
    {} as Record<CategoryEnum, Statement[]>
  );

  // Count available statements per category
  const countByCategory = Object.entries(availableByCategory).reduce(
    (acc, [category, statements]) => {
      acc[category as CategoryEnum] = statements.length;
      return acc;
    },
    {} as Record<CategoryEnum, number>
  );

  // Find categories with most and least available statements
  const sortedCategories = Object.entries(countByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([category]) => category as CategoryEnum);

  // If we have less than 2 categories with available statements, return null
  if (sortedCategories.filter((cat) => countByCategory[cat] > 0).length < 2) {
    return null;
  }

  // Always pick from the category with most remaining statements to ensure even distribution
  const category1 = sortedCategories[0];
  const statement1 =
    availableByCategory[category1][
    Math.floor(Math.random() * availableByCategory[category1].length)
    ];

  // Find a valid second category (one that has statements and isn't the same as category1)
  const validCategory2s = sortedCategories.filter(
    (cat) => cat !== category1 && countByCategory[cat] > 0
  );

  // If no valid second category exists (shouldn't happen due to earlier check), return null
  if (validCategory2s.length === 0) {
    return null;
  }

  // Prefer categories with more remaining statements
  const category2 = validCategory2s[0];
  const statement2 =
    availableByCategory[category2][
    Math.floor(Math.random() * availableByCategory[category2].length)
    ];

  return { statement1, statement2 };
};

// Helper function to get all statements
export const getAllStatements = (): Statement[] => {
  return Object.values(statements).flat();
};

// Helper to get statements by category
export const getStatementsByCategory = (
  category: CategoryEnum
): Statement[] => {
  return statements[category];
};
