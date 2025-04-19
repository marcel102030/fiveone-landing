import { Statement, CategoryEnum, CategoryMetadata } from "../types/quiz";

export const categoryMetadata: CategoryMetadata[] = [
  {
    id: CategoryEnum.APOSTOLO,
    name: "Apóstolo",
    icon: "/assets/icons/praying.png",
    description:
      "O dom de Apóstolo está ligado à paixão por compartilhar o evangelho e trazer as pessoas para Cristo. Apóstolos têm um forte desejo de ver vidas transformadas pela salvação e são movidos por um profundo amor pelas almas. Eles frequentemente têm facilidade em comunicar a mensagem do evangelho de forma clara e convincente.",
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
      text: "Gosto de começar algo novo do zero, especialmente em lugares ou contextos onde a fé cristã ainda não chegou.",
    },
    {
      id: 2,
      category: CategoryEnum.APOSTOLO,
      text: "Me sinto mais vivo quando estou envolvido em iniciativas desafiadoras, pioneiras e com impacto missionário.",
    },
    {
      id: 3,
      category: CategoryEnum.APOSTOLO,
      text: "Consigo enxergar o todo — vejo a igreja como um sistema que precisa estar conectado e saudável.",
    },
    {
      id: 4,
      category: CategoryEnum.APOSTOLO,
      text: "Tenho um forte desejo de ver o evangelho se expandindo para além das fronteiras atuais da igreja.",
    },
    {
      id: 5,
      category: CategoryEnum.APOSTOLO,
      text: "Me sinto chamado a lançar fundamentos espirituais e estratégicos sobre os quais outros irão construir.",
    },
    {
      id: 6,
      category: CategoryEnum.APOSTOLO,
      text: "Fico inquieto quando a igreja está estagnada — quero ver movimento, renovação e expansão.",
    },
    {
      id: 7,
      category: CategoryEnum.APOSTOLO,
      text: "Gosto de planejar, organizar e estruturar o crescimento da igreja com foco em missão e propósito.",
    },
    {
      id: 8,
      category: CategoryEnum.APOSTOLO,
      text: "Valorizo a transmissão dos valores centrais do evangelho (DNA do Reino) para novos contextos e gerações.",
    },
    {
      id: 9,
      category: CategoryEnum.APOSTOLO,
      text: "Tenho facilidade em liderar com visão clara de futuro e gosto de inspirar outros a seguirem com propósito.",
    },
    {
      id: 10,
      category: CategoryEnum.APOSTOLO,
      text: "Me sinto confortável em me deslocar ou mudar de lugar quando necessário para cumprir meu chamado missionário.",
    },
    {
      id: 11,
      category: CategoryEnum.APOSTOLO,
      text: "Me preocupo em manter a consistência entre o que a igreja crê, ensina e vive — local e globalmente.",
    },
    {
      id: 12,
      category: CategoryEnum.APOSTOLO,
      text: "Gosto de identificar e formar novos líderes, enviando-os para cumprir seu propósito no Reino.",
    },
    {
      id: 13,
      category: CategoryEnum.APOSTOLO,
      text: "Acredito que a igreja precisa ser flexível, adaptável e capaz de se multiplicar sem perder sua essência.",
    },
    {
      id: 14,
      category: CategoryEnum.APOSTOLO,
      text: "Tenho facilidade em pensar no futuro da fé cristã e em como garantir sua expansão com fidelidade.",
    },
    {
      id: 15,
      category: CategoryEnum.APOSTOLO,
      text: "Me alegro em conectar pessoas, igrejas e culturas diferentes para fortalecer a missão de Deus.",
    },
    {
      id: 16,
      category: CategoryEnum.APOSTOLO,
      text: "Gosto de encontrar soluções estratégicas para problemas estruturais na igreja ou na missão.",
    },
    {
      id: 17,
      category: CategoryEnum.APOSTOLO,
      text: "Sinto um senso de urgência em ver o evangelho alcançar os que ainda não ouviram.",
    },
    {
      id: 18,
      category: CategoryEnum.APOSTOLO,
      text: "Acredito que discipular alguém que discipula outros é o caminho mais eficaz para multiplicar o Reino.",
    },
    {
      id: 19,
      category: CategoryEnum.APOSTOLO,
      text: "Desejo ver a igreja crescer com saúde, mantendo Jesus Cristo como base de tudo.",
    },
    {
      id: 20,
      category: CategoryEnum.APOSTOLO,
      text: "Quando penso no Reino de Deus, vejo uma igreja viva, em movimento e transformando culturas ao redor do mundo.",
    },
  ],
  [CategoryEnum.PROFETA]: [
    {
      id: 21,
      category: CategoryEnum.PROFETA,
      text: "Percebo com nitidez quando Deus está falando, mesmo que outros ainda não compreendam ou reconheçam.",
    },
    {
      id: 22,
      category: CategoryEnum.PROFETA,
      text: "Sinto-me impulsionado a confrontar estruturas injustas e chamar as pessoas de volta à fidelidade a Deus.",
    },
    {
      id: 23,
      category: CategoryEnum.PROFETA,
      text: "Encontro prazer em momentos de oração, jejum e adoração profunda, como parte da minha consagração.",
    },
    {
      id: 24,
      category: CategoryEnum.PROFETA,
      text: "Sinto o peso da Palavra de Deus queimando dentro de mim, mesmo quando gostaria de me calar.",
    },
    {
      id: 25,
      category: CategoryEnum.PROFETA,
      text: "Tenho uma percepção intensa da santidade de Deus e da necessidade urgente de arrependimento.",
    },
    {
      id: 26,
      category: CategoryEnum.PROFETA,
      text: "Desejo preparar corações para a ação de Deus, chamando ao arrependimento com sinceridade e verdade.",
    },
    {
      id: 27,
      category: CategoryEnum.PROFETA,
      text: "Me vejo como alguém que guarda os valores do Reino e chama a Igreja a permanecer firme neles.",
    },
    {
      id: 28,
      category: CategoryEnum.PROFETA,
      text: "Discerno com facilidade quando algo parece espiritual, mas está desalinhado com o Espírito Santo.",
    },
    {
      id: 29,
      category: CategoryEnum.PROFETA,
      text: "Acredito que Deus pode me dar mensagens específicas para tempos, lugares ou pessoas.",
    },
    {
      id: 30,
      category: CategoryEnum.PROFETA,
      text: "Mantenho minhas convicções mesmo quando estou em ambientes que resistem à verdade de Deus.",
    },
    {
      id: 31,
      category: CategoryEnum.PROFETA,
      text: "Quando questiono, permaneço atento para ouvir o que o Senhor tem a dizer com clareza.",
    },
    {
      id: 32,
      category: CategoryEnum.PROFETA,
      text: "Fico incomodado com mensagens que suavizam verdades que Deus deseja que sejam ditas com fidelidade.",
    },
    {
      id: 33,
      category: CategoryEnum.PROFETA,
      text: "Amo profundamente a verdade de Deus, mesmo quando isso me torna impopular ou isolado.",
    },
    {
      id: 34,
      category: CategoryEnum.PROFETA,
      text: "Às vezes percebo que fui colocado em certas situações apenas para ser sinal ou alerta profético.",
    },
    {
      id: 35,
      category: CategoryEnum.PROFETA,
      text: "Sou movido a interceder por pessoas, líderes e situações críticas com lágrimas e clamor.",
    },
    {
      id: 36,
      category: CategoryEnum.PROFETA,
      text: "Me sinto à vontade em ambientes onde há liberdade para manifestações espirituais como profecia e línguas.",
    },
    {
      id: 37,
      category: CategoryEnum.PROFETA,
      text: "Mesmo diante de oposição, continuo falando com ousadia o que creio ser a direção de Deus.",
    },
    {
      id: 38,
      category: CategoryEnum.PROFETA,
      text: "Me preocupo mais com a fidelidade da Igreja a Cristo do que com sua aceitação pelo mundo.",
    },
    {
      id: 39,
      category: CategoryEnum.PROFETA,
      text: "Sinto que fui chamado a expor enganos espirituais, não por julgamento, mas para restaurar.",
    },
    {
      id: 40,
      category: CategoryEnum.PROFETA,
      text: "Acredito que a profecia existe para edificar, consolar e encorajar o povo de Deus com verdade e amor.",
    },
  ],
  [CategoryEnum.EVANGELISTA]: [
    {
      id: 41,
      category: CategoryEnum.EVANGELISTA,
      text: "Tenho uma urgência interior em compartilhar a mensagem de salvação com aqueles que ainda não conhecem Jesus.",
    },
    {
      id: 42,
      category: CategoryEnum.EVANGELISTA,
      text: "Me sinto mais vivo quando estou falando do amor de Cristo a pessoas fora da fé.",
    },
    {
      id: 43,
      category: CategoryEnum.EVANGELISTA,
      text: "Costumo ver oportunidades de evangelismo em conversas cotidianas e ambientes comuns.",
    },
    {
      id: 44,
      category: CategoryEnum.EVANGELISTA,
      text: "Tenho facilidade em tornar a mensagem do evangelho simples e acessível para qualquer pessoa.",
    },
    {
      id: 45,
      category: CategoryEnum.EVANGELISTA,
      text: "Meu coração se alegra profundamente quando alguém entrega sua vida a Jesus.",
    },
    {
      id: 46,
      category: CategoryEnum.EVANGELISTA,
      text: "Tenho facilidade em quebrar barreiras religiosas para me conectar com quem se afastou ou nunca ouviu o evangelho.",
    },
    {
      id: 47,
      category: CategoryEnum.EVANGELISTA,
      text: "Sinto que minha oração é evangelística — oro com expectativa de ver frutos de salvação.",
    },
    {
      id: 48,
      category: CategoryEnum.EVANGELISTA,
      text: "Tenho alegria em compartilhar meu testemunho como uma forma de mostrar o poder transformador do evangelho.",
    },
    {
      id: 49,
      category: CategoryEnum.EVANGELISTA,
      text: "Sinto-me mais confortável fora das quatro paredes da igreja, em contato direto com pessoas que precisam de Deus.",
    },
    {
      id: 50,
      category: CategoryEnum.EVANGELISTA,
      text: "Me incomoda quando a igreja se torna um clube fechado, esquecendo que existe para alcançar os perdidos.",
    },
    {
      id: 51,
      category: CategoryEnum.EVANGELISTA,
      text: "Gosto de ver a igreja engajada na cidade, com ações que mostrem o evangelho na prática.",
    },
    {
      id: 52,
      category: CategoryEnum.EVANGELISTA,
      text: "Creio que todo cristão pode ser um evangelista e gosto de encorajar outros a viverem isso.",
    },
    {
      id: 53,
      category: CategoryEnum.EVANGELISTA,
      text: "Tenho facilidade em me conectar com pessoas de diferentes culturas, realidades e histórias.",
    },
    {
      id: 54,
      category: CategoryEnum.EVANGELISTA,
      text: "Fico profundamente comovido ao pensar em pessoas que vivem sem esperança e sem conhecer Jesus.",
    },
    {
      id: 55,
      category: CategoryEnum.EVANGELISTA,
      text: "Sinto que faço parte do chamado de Deus para multiplicar os salvos, não apenas edificar os já convertidos.",
    },
    {
      id: 56,
      category: CategoryEnum.EVANGELISTA,
      text: "Tenho facilidade em usar diferentes meios — como redes sociais, conversas, eventos — para anunciar Cristo.",
    },
    {
      id: 57,
      category: CategoryEnum.EVANGELISTA,
      text: "Me sinto chamado a ir onde a igreja ainda não chegou e levar o evangelho a novos contextos.",
    },
    {
      id: 58,
      category: CategoryEnum.EVANGELISTA,
      text: "Vejo sentido em liderar iniciativas evangelísticas e formar pessoas para esse propósito.",
    },
    {
      id: 59,
      category: CategoryEnum.EVANGELISTA,
      text: "Acredito que a salvação é o maior milagre que alguém pode experimentar, e quero ver isso acontecendo diariamente.",
    },
    {
      id: 60,
      category: CategoryEnum.EVANGELISTA,
      text: "Sonho em ver multidões conhecendo Jesus, mas também me alegro quando uma única vida é alcançada.",
    },
  ],
  [CategoryEnum.PASTOR]: [
    {
      id: 61,
      category: CategoryEnum.PASTOR,
      text: "Tenho um desejo sincero de cuidar espiritualmente das pessoas e caminhar ao lado delas em amor.",
    },
    {
      id: 62,
      category: CategoryEnum.PASTOR,
      text: "Sinto que meu papel é guiar, proteger e alimentar espiritualmente como um pastor faz com seu rebanho.",
    },
    {
      id: 63,
      category: CategoryEnum.PASTOR,
      text: "Costumo perceber quando alguém está ferido, confuso ou enfraquecido na fé, e me aproximo com compaixão.",
    },
    {
      id: 64,
      category: CategoryEnum.PASTOR,
      text: "Me preocupo mais com o crescimento saudável das pessoas do que com programas ou eventos da igreja.",
    },
    {
      id: 65,
      category: CategoryEnum.PASTOR,
      text: "Valorizo relacionamentos profundos e duradouros, nos quais posso discipular e acompanhar com proximidade.",
    },
    {
      id: 66,
      category: CategoryEnum.PASTOR,
      text: "Me sinto chamado a interceder em oração pelas necessidades emocionais e espirituais das pessoas.",
    },
    {
      id: 67,
      category: CategoryEnum.PASTOR,
      text: "Gosto de ensinar com paciência, ajudando os outros a entender e aplicar a verdade de Deus na prática.",
    },
    {
      id: 68,
      category: CategoryEnum.PASTOR,
      text: "Prefiro liderar de forma relacional e acessível, construindo confiança ao longo do tempo.",
    },
    {
      id: 69,
      category: CategoryEnum.PASTOR,
      text: "Tenho facilidade em criar ambientes acolhedores, seguros e familiares, onde as pessoas se sintam vistas.",
    },
    {
      id: 70,
      category: CategoryEnum.PASTOR,
      text: "Fico incomodado quando vejo alguém se afastando da fé ou isolado do corpo de Cristo.",
    },
    {
      id: 71,
      category: CategoryEnum.PASTOR,
      text: "Tenho um senso de responsabilidade espiritual pelas pessoas sob meu cuidado.",
    },
    {
      id: 72,
      category: CategoryEnum.PASTOR,
      text: "Acredito que minha missão é proteger o rebanho contra ensinos errados ou influências prejudiciais.",
    },
    {
      id: 73,
      category: CategoryEnum.PASTOR,
      text: "Me sinto realizado quando vejo alguém crescendo espiritualmente por meio do cuidado e acompanhamento pessoal.",
    },
    {
      id: 74,
      category: CategoryEnum.PASTOR,
      text: "Tenho prazer em discipular em pequenos grupos ou em encontros pessoais, com atenção individual.",
    },
    {
      id: 75,
      category: CategoryEnum.PASTOR,
      text: "Procuro estar disponível quando alguém precisa de escuta, consolo ou conselho espiritual.",
    },
    {
      id: 76,
      category: CategoryEnum.PASTOR,
      text: "Enxergo a igreja como uma família onde todos devem ser cuidados, não apenas ensinados.",
    },
    {
      id: 77,
      category: CategoryEnum.PASTOR,
      text: "Sinto que meu chamado é ajudar a restaurar os cansados, quebrados e desanimados em Cristo.",
    },
    {
      id: 78,
      category: CategoryEnum.PASTOR,
      text: "Gosto de acompanhar pessoas ao longo do tempo, mesmo nas fases mais difíceis ou lentas de progresso.",
    },
    {
      id: 79,
      category: CategoryEnum.PASTOR,
      text: "Acredito que liderar espiritualmente é servir com humildade e presença constante.",
    },
    {
      id: 80,
      category: CategoryEnum.PASTOR,
      text: "Tenho um coração voltado para unidade e comunhão — quero ver a igreja caminhando como um só corpo.",
    },
  ],
  [CategoryEnum.MESTRE]: [
    {
      id: 81,
      category: CategoryEnum.MESTRE,
      text: "Tenho paixão por estudar a Palavra de Deus em profundidade e ajudar outros a compreendê-la melhor.",
    },
    {
      id: 82,
      category: CategoryEnum.MESTRE,
      text: "Gosto de transformar conceitos bíblicos complexos em lições claras e aplicáveis para o dia a dia.",
    },
    {
      id: 83,
      category: CategoryEnum.MESTRE,
      text: "Me sinto realizado ao ver alguém crescer espiritualmente por meio do ensino e da reflexão bíblica.",
    },
    {
      id: 84,
      category: CategoryEnum.MESTRE,
      text: "Tenho facilidade em organizar ideias e ensinar com clareza, seja em grupos pequenos ou grandes.",
    },
    {
      id: 85,
      category: CategoryEnum.MESTRE,
      text: "As pessoas frequentemente me procuram para tirar dúvidas ou buscar clareza sobre a Bíblia.",
    },
    {
      id: 86,
      category: CategoryEnum.MESTRE,
      text: "Me interesso por temas como contexto histórico, original das palavras, doutrinas e interpretações bíblicas.",
    },
    {
      id: 87,
      category: CategoryEnum.MESTRE,
      text: "Tenho prazer em preparar estudos, séries de ensino ou materiais que ajudem outros a aprenderem a Bíblia.",
    },
    {
      id: 88,
      category: CategoryEnum.MESTRE,
      text: "Acredito que o ensino fiel das Escrituras é essencial para a maturidade da igreja.",
    },
    {
      id: 89,
      category: CategoryEnum.MESTRE,
      text: "Costumo fazer perguntas profundas que incentivam outros a refletirem sobre sua fé e prática.",
    },
    {
      id: 90,
      category: CategoryEnum.MESTRE,
      text: "Tenho facilidade em explicar a Bíblia para pessoas de diferentes níveis de conhecimento.",
    },
    {
      id: 91,
      category: CategoryEnum.MESTRE,
      text: "Gosto de estudar por horas, buscando entender melhor cada parte da Escritura.",
    },
    {
      id: 92,
      category: CategoryEnum.MESTRE,
      text: "Acredito que a verdade deve ser ensinada com amor, clareza e fidelidade ao texto bíblico.",
    },
    {
      id: 93,
      category: CategoryEnum.MESTRE,
      text: "Me sinto chamado a discipular por meio do ensino, levando pessoas à obediência prática da Palavra.",
    },
    {
      id: 94,
      category: CategoryEnum.MESTRE,
      text: "Gosto de discutir ideias e debater teologia respeitosamente, buscando sempre a verdade bíblica.",
    },
    {
      id: 95,
      category: CategoryEnum.MESTRE,
      text: "Tenho atenção aos detalhes do texto bíblico e zelo pela interpretação correta.",
    },
    {
      id: 96,
      category: CategoryEnum.MESTRE,
      text: "Me alegra ver quando alguém tem um 'insight espiritual' ao aprender algo novo na Bíblia.",
    },
    {
      id: 97,
      category: CategoryEnum.MESTRE,
      text: "Enxergo o ensino como uma forma de proteger a igreja contra o erro e a confusão doutrinária.",
    },
    {
      id: 98,
      category: CategoryEnum.MESTRE,
      text: "Tenho convicção de que Deus usa mestres para edificar o corpo com sabedoria e entendimento.",
    },
    {
      id: 99,
      category: CategoryEnum.MESTRE,
      text: "Costumo relacionar passagens da Bíblia entre si para ensinar com mais profundidade e contexto.",
    },
    {
      id: 100,
      category: CategoryEnum.MESTRE,
      text: "Sinto prazer em ver outros se tornando mestres e multiplicando o conhecimento bíblico com fidelidade.",
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
