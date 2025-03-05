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
      text: "Você se sente chamado para iniciar novos projetos ou ministérios na igreja",
    },
    {
      id: 2,
      category: CategoryEnum.APOSTOLO,
      text: "Tem facilidade em ver o potencial de crescimento em diferentes áreas do ministério",
    },
    {
      id: 3,
      category: CategoryEnum.APOSTOLO,
      text: "Costuma ser o primeiro a se voluntariar para liderar novos empreendimentos ou iniciativas missionárias",
    },
    {
      id: 4,
      category: CategoryEnum.APOSTOLO,
      text: "Sente-se confortável em liderar equipes e delegar tarefas para alcançar um objetivo maior",
    },
    {
      id: 5,
      category: CategoryEnum.APOSTOLO,
      text: "Tem uma visão clara de como a igreja pode expandir seu impacto em outras regiões",
    },
    {
      id: 6,
      category: CategoryEnum.APOSTOLO,
      text: "Enxerga facilmente soluções para problemas complexos dentro da igreja ou no campo missionário",
    },
    {
      id: 7,
      category: CategoryEnum.APOSTOLO,
      text: "Prefere trabalhar em novos projetos do que em funções rotineiras ou já estabelecidas",
    },
    {
      id: 8,
      category: CategoryEnum.APOSTOLO,
      text: "Sente-se inspirado ao ver o evangelho alcançando novos lugares ou culturas",
    },
    {
      id: 9,
      category: CategoryEnum.APOSTOLO,
      text: "Você tem facilidade em identificar dons e habilidades em outras pessoas e capacitá-las a servir",
    },
    {
      id: 10,
      category: CategoryEnum.APOSTOLO,
      text: "Costuma ser visto como alguém com autoridade espiritual para tomar decisões estratégicas",
    },
    {
      id: 11,
      category: CategoryEnum.APOSTOLO,
      text: "Prefere mobilizar e treinar outros líderes ao invés de fazer o trabalho sozinho",
    },
    {
      id: 12,
      category: CategoryEnum.APOSTOLO,
      text: "Tem uma paixão por criar novas igrejas ou missões onde o evangelho ainda não chegou",
    },
    {
      id: 13,
      category: CategoryEnum.APOSTOLO,
      text: "Você sente que Deus o chamou para ser uma referência de liderança e direção espiritual",
    },
    {
      id: 14,
      category: CategoryEnum.APOSTOLO,
      text: "Gosta de viajar para outras cidades ou países com o propósito de expandir o Reino de Deus",
    },
    {
      id: 15,
      category: CategoryEnum.APOSTOLO,
      text: "Se sente à vontade em ambientes desafiadores onde é preciso estabelecer novas bases de ministério",
    },
    {
      id: 16,
      category: CategoryEnum.APOSTOLO,
      text: "As pessoas frequentemente buscam você para conselhos sobre o futuro da igreja ou sobre estratégias de crescimento",
    },
    {
      id: 17,
      category: CategoryEnum.APOSTOLO,
      text: "Gosta de trabalhar em equipe para estabelecer uma estrutura sólida e duradoura no ministério",
    },
    {
      id: 18,
      category: CategoryEnum.APOSTOLO,
      text: "Se sente realizado ao ver novos ministérios florescendo a partir do seu esforço inicial",
    },
    {
      id: 19,
      category: CategoryEnum.APOSTOLO,
      text: "Acredita que tem a habilidade de identificar novas oportunidades de crescimento para o Reino de Deus",
    },
    {
      id: 20,
      category: CategoryEnum.APOSTOLO,
      text: "Sente que Deus o chama para influenciar e treinar outras igrejas ou líderes em regiões distantes",
    },
  ],
  [CategoryEnum.PROFETA]: [
    {
      id: 21,
      category: CategoryEnum.PROFETA,
      text: "Você sente que Deus fala com você de forma clara e direta, revelando coisas sobre o presente ou o futuro",
    },
    {
      id: 22,
      category: CategoryEnum.PROFETA,
      text: "Tem facilidade em discernir o que está acontecendo no mundo espiritual em diferentes situações",
    },
    {
      id: 23,
      category: CategoryEnum.PROFETA,
      text: "Sente uma forte necessidade de trazer à luz a verdade, mesmo quando é desconfortável para os outros",
    },
    {
      id: 24,
      category: CategoryEnum.PROFETA,
      text: "Costuma ter sonhos ou visões que considera serem mensagens de Deus",
    },
    {
      id: 25,
      category: CategoryEnum.PROFETA,
      text: "Sente-se impulsionado a chamar a igreja ou as pessoas ao arrependimento e à santidade",
    },
    {
      id: 26,
      category: CategoryEnum.PROFETA,
      text: "Tem a impressão de que Deus lhe dá percepções ou revelações sobre situações específicas que precisam de correção",
    },
    {
      id: 27,
      category: CategoryEnum.PROFETA,
      text: "Sente um peso espiritual quando vê injustiça ou pecado e é motivado a confrontar isso",
    },
    {
      id: 28,
      category: CategoryEnum.PROFETA,
      text: "Costuma ser sensível à presença de Deus e ao mover do Espírito Santo em diferentes momentos",
    },
    {
      id: 29,
      category: CategoryEnum.PROFETA,
      text: "Tem a coragem de falar a verdade, mesmo quando vai contra a opinião da maioria",
    },
    {
      id: 30,
      category: CategoryEnum.PROFETA,
      text: "As pessoas frequentemente buscam você para discernimento espiritual ou para entender o que Deus está dizendo",
    },
    {
      id: 31,
      category: CategoryEnum.PROFETA,
      text: "Sente que Deus lhe dá palavras específicas para outras pessoas que ajudam a guiar suas vidas",
    },
    {
      id: 32,
      category: CategoryEnum.PROFETA,
      text: "Tem uma profunda paixão pela justiça de Deus e pelo cumprimento da Sua vontade",
    },
    {
      id: 33,
      category: CategoryEnum.PROFETA,
      text: "Costuma perceber com facilidade o que está errado em uma situação ou em uma pessoa e sente o desejo de corrigir",
    },
    {
      id: 34,
      category: CategoryEnum.PROFETA,
      text: "Se sente compelido a interceder em oração quando percebe algo fora da vontade de Deus",
    },
    {
      id: 35,
      category: CategoryEnum.PROFETA,
      text: "Tem facilidade em perceber quando uma palavra ou mensagem é inspirada por Deus ou não",
    },
    {
      id: 36,
      category: CategoryEnum.PROFETA,
      text: "Costuma experimentar uma forte convicção interior para falar ou agir quando sente que Deus está direcionando",
    },
    {
      id: 37,
      category: CategoryEnum.PROFETA,
      text: "Você se sente chamado para preparar o caminho para algo que Deus vai fazer, alertando e orientando a igreja",
    },
    {
      id: 38,
      category: CategoryEnum.PROFETA,
      text: "Tem facilidade em perceber engano ou falsidade no ambiente espiritual ao seu redor",
    },
    {
      id: 39,
      category: CategoryEnum.PROFETA,
      text: "Sente que tem uma responsabilidade especial de alertar as pessoas sobre o julgamento ou a bênção de Deus",
    },
    {
      id: 40,
      category: CategoryEnum.PROFETA,
      text: "É frequentemente movido por uma paixão intensa pela pureza e verdade na igreja e no mundo",
    },
  ],
  [CategoryEnum.EVANGELISTA]: [
    {
      id: 41,
      category: CategoryEnum.EVANGELISTA,
      text: "Você sente uma profunda urgência em compartilhar o evangelho com as pessoas ao seu redor",
    },
    {
      id: 42,
      category: CategoryEnum.EVANGELISTA,
      text: "Fica emocionado ao ver alguém aceitar a Cristo como Salvador e sente que isso é parte de sua missão",
    },
    {
      id: 43,
      category: CategoryEnum.EVANGELISTA,
      text: "Tem facilidade em iniciar conversas sobre fé e espiritualidade com pessoas que ainda não conhecem a Cristo",
    },
    {
      id: 44,
      category: CategoryEnum.EVANGELISTA,
      text: "Acredita que todo cristão deve se envolver na evangelização, e você sente o chamado para liderar isso",
    },
    {
      id: 45,
      category: CategoryEnum.EVANGELISTA,
      text: "Se sente impulsionado a alcançar aqueles que estão afastados de Deus e trazê-los de volta para Ele",
    },
    {
      id: 46,
      category: CategoryEnum.EVANGELISTA,
      text: "Você sente um peso no coração ao pensar nas pessoas que ainda não ouviram a mensagem de salvação",
    },
    {
      id: 47,
      category: CategoryEnum.EVANGELISTA,
      text: "As pessoas ao seu redor costumam ser impactadas por sua paixão ao falar sobre Jesus",
    },
    {
      id: 48,
      category: CategoryEnum.EVANGELISTA,
      text: "Gosta de participar ou organizar eventos evangelísticos para levar a mensagem de Cristo a mais pessoas",
    },
    {
      id: 49,
      category: CategoryEnum.EVANGELISTA,
      text: "Acredita que sua principal missão na vida é levar o maior número de pessoas possível a conhecer Jesus",
    },
    {
      id: 50,
      category: CategoryEnum.EVANGELISTA,
      text: "Sente uma grande alegria em ver a transformação espiritual na vida de alguém que aceita Cristo",
    },
    {
      id: 51,
      category: CategoryEnum.EVANGELISTA,
      text: "Costuma ser movido a orar especificamente por pessoas perdidas ou que ainda não conheceram a salvação",
    },
    {
      id: 52,
      category: CategoryEnum.EVANGELISTA,
      text: "Enxerga o evangelismo como um estilo de vida, não apenas uma atividade pontual",
    },
    {
      id: 53,
      category: CategoryEnum.EVANGELISTA,
      text: "Se sente incomodado quando a igreja não está focada em alcançar os perdidos",
    },
    {
      id: 54,
      category: CategoryEnum.EVANGELISTA,
      text: "Tem facilidade em compartilhar seu testemunho pessoal como uma forma de inspirar outros a seguirem Jesus",
    },
    {
      id: 55,
      category: CategoryEnum.EVANGELISTA,
      text: "Acredita que Deus lhe dá as palavras certas na hora de compartilhar o evangelho com alguém",
    },
    {
      id: 56,
      category: CategoryEnum.EVANGELISTA,
      text: "Sente-se à vontade em falar sobre sua fé em público, mesmo com pessoas desconhecidas",
    },
    {
      id: 57,
      category: CategoryEnum.EVANGELISTA,
      text: "Prefere passar tempo em ambientes onde pode alcançar pessoas que ainda não conhecem a Cristo",
    },
    {
      id: 58,
      category: CategoryEnum.EVANGELISTA,
      text: "Você sente que é responsável por ajudar outros cristãos a se envolverem mais na evangelização",
    },
    {
      id: 59,
      category: CategoryEnum.EVANGELISTA,
      text: "Gosta de treinar e encorajar outros para que se tornem evangelistas em seus próprios contextos",
    },
    {
      id: 60,
      category: CategoryEnum.EVANGELISTA,
      text: "Se sente chamado para alcançar pessoas em lugares onde o evangelho ainda não foi pregado ou é pouco conhecido",
    },
  ],
  [CategoryEnum.PASTOR]: [
    {
      id: 61,
      category: CategoryEnum.PASTOR,
      text: "Você se sente chamado a cuidar e orientar as pessoas no seu crescimento espiritual",
    },
    {
      id: 62,
      category: CategoryEnum.PASTOR,
      text: "Tem facilidade em perceber as necessidades emocionais e espirituais das pessoas ao seu redor",
    },
    {
      id: 63,
      category: CategoryEnum.PASTOR,
      text: "Sente uma grande compaixão pelos membros da igreja e deseja ajudá-los a superar suas dificuldades",
    },
    {
      id: 64,
      category: CategoryEnum.PASTOR,
      text: "Você se sente realizado quando pode aconselhar e confortar aqueles que estão enfrentando problemas",
    },
    {
      id: 65,
      category: CategoryEnum.PASTOR,
      text: "Prefere estar envolvido no discipulado individual ou em pequenos grupos, ajudando as pessoas a crescerem na fé",
    },
    {
      id: 66,
      category: CategoryEnum.PASTOR,
      text: "Tem facilidade em criar um ambiente acolhedor e seguro onde as pessoas possam compartilhar suas lutas",
    },
    {
      id: 67,
      category: CategoryEnum.PASTOR,
      text: "Se sente responsável por garantir que os membros da igreja estejam sendo bem cuidados e pastoreados",
    },
    {
      id: 68,
      category: CategoryEnum.PASTOR,
      text: "Acredita que uma parte importante do seu ministério é caminhar ao lado das pessoas, mesmo em momentos difíceis",
    },
    {
      id: 69,
      category: CategoryEnum.PASTOR,
      text: "Sente-se à vontade em ensinar e orientar os outros em princípios bíblicos de forma prática e aplicável",
    },
    {
      id: 70,
      category: CategoryEnum.PASTOR,
      text: "Você gosta de construir relacionamentos profundos e duradouros com as pessoas, ajudando-as a crescer em sua caminhada com Cristo",
    },
    {
      id: 71,
      category: CategoryEnum.PASTOR,
      text: "Sente uma profunda responsabilidade em proteger o rebanho de falsas doutrinas ou influências prejudiciais",
    },
    {
      id: 72,
      category: CategoryEnum.PASTOR,
      text: "Acredita que Deus o chamou para ser um cuidador espiritual, ajudando os outros a alcançar a maturidade cristã",
    },
    {
      id: 73,
      category: CategoryEnum.PASTOR,
      text: "Gosta de orar e interceder pelas pessoas, carregando seus fardos em oração diante de Deus",
    },
    {
      id: 74,
      category: CategoryEnum.PASTOR,
      text: "Tem facilidade em perceber quando alguém está espiritualmente fraco ou se afastando e se sente compelido a ir atrás dessa pessoa",
    },
    {
      id: 75,
      category: CategoryEnum.PASTOR,
      text: "Sente-se feliz em estar disponível para ajudar as pessoas, mesmo que isso exija tempo e esforço pessoal",
    },
    {
      id: 76,
      category: CategoryEnum.PASTOR,
      text: "Você se preocupa com o bem-estar emocional e espiritual da igreja e quer ver todos crescendo em unidade",
    },
    {
      id: 77,
      category: CategoryEnum.PASTOR,
      text: "Prefere servir àqueles que já estão na fé, ajudando-os a crescer, ao invés de evangelizar os não convertidos",
    },
    {
      id: 78,
      category: CategoryEnum.PASTOR,
      text: "As pessoas frequentemente vêm até você em busca de aconselhamento ou encorajamento espiritual",
    },
    {
      id: 79,
      category: CategoryEnum.PASTOR,
      text: "Se sente chamado a construir uma comunidade cristã saudável e unida, onde todos possam se sentir parte da família de Deus",
    },
    {
      id: 80,
      category: CategoryEnum.PASTOR,
      text: "Você acredita que seu papel é proteger e guiar espiritualmente as pessoas como um pastor cuida de seu rebanho",
    },
  ],
  [CategoryEnum.MESTRE]: [
    {
      id: 81,
      category: CategoryEnum.MESTRE,
      text: "Você sente uma paixão por estudar a Bíblia em profundidade e compartilhar o que aprendeu com os outros",
    },
    {
      id: 82,
      category: CategoryEnum.MESTRE,
      text: "Tem facilidade em explicar conceitos bíblicos de maneira clara e compreensível",
    },
    {
      id: 83,
      category: CategoryEnum.MESTRE,
      text: "Se sente motivado a ensinar as pessoas a aplicarem as Escrituras em suas vidas diárias",
    },
    {
      id: 84,
      category: CategoryEnum.MESTRE,
      text: "Prefere gastar tempo estudando a Palavra de Deus do que fazendo outras atividades no ministério",
    },
    {
      id: 85,
      category: CategoryEnum.MESTRE,
      text: "Você costuma ser procurado por outros para esclarecer dúvidas sobre a Bíblia e a fé cristã",
    },
    {
      id: 86,
      category: CategoryEnum.MESTRE,
      text: "Sente que Deus o chamou para ensinar e discipular outros através do ensino bíblico",
    },
    {
      id: 87,
      category: CategoryEnum.MESTRE,
      text: "Tem facilidade em organizar suas ideias e apresentá-las de forma estruturada, seja em uma aula, sermão ou estudo bíblico",
    },
    {
      id: 88,
      category: CategoryEnum.MESTRE,
      text: "Acredita que ensinar as verdades bíblicas é uma das formas mais importantes de fortalecer a igreja",
    },
    {
      id: 89,
      category: CategoryEnum.MESTRE,
      text: "Gosta de desenvolver materiais de estudo ou programas de ensino para ajudar as pessoas a aprenderem mais sobre a Bíblia",
    },
    {
      id: 90,
      category: CategoryEnum.MESTRE,
      text: "Se sente à vontade em falar em público e ensinar grupos pequenos ou grandes sobre temas espirituais",
    },
    {
      id: 91,
      category: CategoryEnum.MESTRE,
      text: "As pessoas frequentemente vêm até você em busca de orientação e clareza sobre doutrinas e temas teológicos",
    },
    {
      id: 92,
      category: CategoryEnum.MESTRE,
      text: "Se sente inspirado a ajudar os outros a crescerem em seu entendimento da Palavra e de como vivê-la na prática",
    },
    {
      id: 93,
      category: CategoryEnum.MESTRE,
      text: "Acha importante estudar a fundo o contexto histórico e cultural da Bíblia para interpretá-la corretamente",
    },
    {
      id: 94,
      category: CategoryEnum.MESTRE,
      text: "Prefere ensinar a aplicar as Escrituras à vida cotidiana do que focar em práticas ministeriais como evangelismo ou aconselhamento",
    },
    {
      id: 95,
      category: CategoryEnum.MESTRE,
      text: "Sente-se feliz quando vê que as pessoas estão entendendo e aplicando os ensinamentos bíblicos que você compartilhou",
    },
    {
      id: 96,
      category: CategoryEnum.MESTRE,
      text: "Costuma fazer muitas perguntas e incentivar os outros a refletirem profundamente sobre o que estão aprendendo",
    },
    {
      id: 97,
      category: CategoryEnum.MESTRE,
      text: "Gosta de discutir e debater sobre questões teológicas, sempre buscando a verdade bíblica",
    },
    {
      id: 98,
      category: CategoryEnum.MESTRE,
      text: "Você tem facilidade em transformar conceitos difíceis em lições práticas e aplicáveis para o dia a dia dos cristãos",
    },
    {
      id: 99,
      category: CategoryEnum.MESTRE,
      text: "Sente que o ensino bíblico correto é crucial para a maturidade espiritual da igreja",
    },
    {
      id: 100,
      category: CategoryEnum.MESTRE,
      text: "Acredita que Deus o chamou para ser uma fonte de conhecimento e sabedoria bíblica para os outros",
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
