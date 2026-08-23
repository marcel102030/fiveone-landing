// Conteúdo estruturado do PDF ministerial (Five One).
// Fonte: conteúdo próprio dos geradores por dom, reorganizado para o novo layout.

export type DomKey = "apostolo" | "profeta" | "evangelista" | "pastor" | "mestre";

export const DOM_ORDER: DomKey[] = ["apostolo", "profeta", "evangelista", "pastor", "mestre"];

export interface DomContent {
  nome: string;
  glyph: string;               // letra do badge
  cor: [number, number, number]; // RGB do dom
  frase: string;               // uma linha (hero)
  essencia: string;            // parágrafo de abertura
  caracteristicas: string[];
  funcoes: string[];
  pontosCegos: string[];
  comoDesenvolver: string[];
  palavras: string[];          // palavras-chave (chips)
  naPratica: string[];         // como se manifesta no dia a dia
  imaturo: string;             // quando o dom opera imaturo
  maduro: string;              // quando o dom opera maduro
  resumoOutro: string;         // pág "outras capacidades": explica o dom + fala da pessoa
  contribuicao: string;        // o que este dom traz ao corpo (frase curta)
  versiculo: { texto: string; ref: string };
  referencias: string[];
  // comparativo
  vocacao: string;
  foco: string;
  estilo: string;
  perguntaChave: string;       // a pergunta que este dom faz (curta)
  contribuicaoCurta: string;   // contribuição em 1 palavra (tabela)
  seFalta: string;             // "estagna", "perde rumo", etc.
}

export const DOMS: Record<DomKey, DomContent> = {
  apostolo: {
    nome: "Apóstolo",
    glyph: "A",
    cor: [74, 144, 217],
    frase: "Você tem visão estratégica e paixão por abrir novos caminhos.",
    essencia:
      "O dom apostólico é marcado por uma visão clara e ampla sobre o propósito da igreja. Quem o carrega é pioneiro, estratégico e movido por uma paixão pela missão — enxerga além, lança fundamentos e cria caminhos onde ainda não existem. É guardião e disseminador do DNA da igreja, com mentalidade de expansão, plantação e multiplicação.",
    caracteristicas: [
      "Pensamento visionário e estratégico",
      "Iniciar coisas novas energiza",
      "Confortável cruzando fronteiras e culturas",
      "Inquieto com o status atual",
      "Enxerga o todo de forma integrada",
      "Decisor em momentos estratégicos",
      "Mantém relações profundas mesmo à distância",
      "Assume riscos calculados para avançar",
    ],
    funcoes: [
      "Semear o DNA da igreja por meio de missões e obras",
      "Manter o compromisso de envio e expansão missionária",
      "Plantar novas comunidades e desenvolver líderes pioneiros",
      "Conectar líderes, recursos e igrejas em torno da missão",
      "Garantir agilidade, inovação e adaptação organizacional",
      "Proteger a essência da visão e da cultura da igreja",
    ],
    pontosCegos: [
      "Autoritarismo ou vontade de controlar demais",
      "Falta de empatia e cuidado com sentimentos",
      "Impaciência com processos e pessoas mais lentas",
      "Foco em resultados, esquecendo as pessoas",
      "Começar muitas frentes sem concluir",
      "Isolamento e independência excessiva",
      "Negligência com detalhes e execução prática",
      "Desgaste por assumir além do limite",
    ],
    comoDesenvolver: [
      "Transmita a visão com clareza e paciência — as pessoas precisam enxergar o 'porquê' antes de te seguirem no 'como'.",
      "Cerque-se de quem executa e cuida: recrute mentes proféticas para alinhar e pastores para não perder ninguém no caminho.",
      "Comprometa-se com o acompanhamento — o que você inicia só floresce se alguém sustentar depois da largada.",
      "Ande com mestres e pastores: eles equilibram o seu avanço com profundidade e cuidado com as pessoas.",
    ],
    palavras: ["Visionário", "Pioneiro", "Estratégico", "Multiplicador", "Fundador"],
    naPratica: [
      "Você enxerga onde a igreja pode chegar antes dos outros — e já começa a rascunhar o caminho para lá.",
      "O que está parado te incomoda: você sente um impulso interno de iniciar, destravar e fazer acontecer.",
      "Naturalmente conecta pessoas, recursos e ideias em torno de um propósito maior do que você.",
      "Você pensa além do hoje: não basta crescer, é preciso multiplicar, enviar e estabelecer o que nasce.",
    ],
    imaturo:
      "Atropela pessoas e processos pela pressa de avançar, começa muitas frentes sem concluir e controla em vez de confiar.",
    maduro:
      "Abre caminho com visão e leva as pessoas junto — forma e envia outros para sustentar o que nasce.",
    resumoOutro:
      "O apóstolo é pioneiro: enxerga onde a igreja pode chegar e abre caminho. Em você, mesmo em menor intensidade, isso aparece como inquietação com o que está parado e vontade de começar algo novo. Cultive dando um passo concreto naquilo que você sente que precisa nascer.",
    contribuicao: "visão de expansão e capacidade de multiplicar",
    versiculo: {
      texto:
        "Como sábio construtor, lancei o fundamento, e outro edifica sobre ele. Cada um veja como edifica.",
      ref: "1 Coríntios 3:10",
    },
    referencias: [
      "Lucas 10:1-3",
      "Atos 1:21-26",
      "1 Coríntios 3:5-11",
      "1 Coríntios 4:9",
      "Gálatas 2:9",
      "Efésios 2:20",
      "Efésios 4:11-13",
      "Apocalipse 2:2",
    ],
    vocacao: "Pioneiro",
    foco: "Expandir",
    estilo: "Estratégico",
    perguntaChave: "Aonde ir?",
    contribuicaoCurta: "Expansão",
    seFalta: "estagna",
  },

  profeta: {
    nome: "Profeta",
    glyph: "P",
    cor: [224, 101, 92],
    frase: "Você é sensível à voz de Deus e movido por autenticidade espiritual.",
    essencia:
      "O dom profético carrega profunda sensibilidade espiritual e a capacidade de perceber o que Deus está falando em cada tempo. É guardião da aliança: levanta-se para corrigir desvios, despertar ao arrependimento e chamar a igreja de volta ao coração de Deus. Enxerga além do visível, discerne motivações e traz verdades que libertam — ainda que desconfortáveis.",
    caracteristicas: [
      "Sensibilidade espiritual aguçada",
      "Percepção rápida de enganos espirituais",
      "Coragem para confrontar o pecado com amor",
      "Compromisso inegociável com a verdade bíblica",
      "Facilidade em discernir tempos e estações",
      "Alto senso de missão profética",
      "Disposição para ser voz contracultural",
      "Paixão por ver a igreja alinhada a Deus",
    ],
    funcoes: [
      "Chamar a igreja ao arrependimento e à santidade",
      "Discernir tempos e alertar sobre desvios ou direções",
      "Trazer clareza profética em momentos de crise",
      "Inspirar fé e esperança nas promessas de Deus",
      "Confrontar falsas doutrinas e promover alinhamento bíblico",
      "Ser voz de correção, edificação e consolo",
    ],
    pontosCegos: [
      "Dureza nas palavras e julgamento precipitado",
      "Isolamento e desconfiança da liderança",
      "Falar fora do tempo ou emocionalmente desequilibrado",
      "Rigidez com o processo de crescimento das pessoas",
      "Achar que toda percepção é revelação inquestionável",
      "Obsessão por erros, perdendo a esperança e o consolo",
      "Exagero na busca por experiências, negligenciando a Palavra",
      "Resistência à correção de outros líderes",
    ],
    comoDesenvolver: [
      "Fale para edificar: a profecia madura exorta e consola — nunca amedronta, humilha ou expõe.",
      "Submeta suas percepções à comunidade: toda palavra é avaliada, e a humildade te protege do engano.",
      "Sustente a sensibilidade com oração, jejum e Palavra — sem base bíblica, impressão vira só opinião.",
      "Deixe-se pastorear e ensinar: a correção fraterna amadurece o seu dom e evita o isolamento.",
    ],
    palavras: ["Sensível", "Verdadeiro", "Discernidor", "Corajoso", "Vigilante"],
    naPratica: [
      "Você percebe rápido quando algo está fora de lugar, mesmo sem conseguir explicar de imediato o porquê.",
      "Sente o peso de falar a verdade, ainda que seja desconfortável — e fica inquieto quando se cala.",
      "Busca a presença de Deus e, a partir dela, discerne tempos, motivações e direções.",
      "Se incomoda com aparências e religiosidade vazia: você anseia por autenticidade na igreja.",
    ],
    imaturo:
      "Fala fora do tempo e sem amor, confunde opinião com revelação e foca nos erros, perdendo a esperança e o consolo.",
    maduro:
      "Traz verdade que edifica, exorta e consola — corrige com mansidão e submete suas percepções à comunidade.",
    resumoOutro:
      "O profeta é sensível à voz de Deus e zela pela verdade. Em você, mesmo em segundo plano, isso funciona como um radar interno para o que é autêntico — e uma inquietação saudável quando algo foge do lugar. Cultive reservando tempo de oração e escuta antes de decidir.",
    contribuicao: "sensibilidade espiritual e compromisso com a verdade",
    versiculo: {
      texto:
        "Certamente o Senhor Deus não faz coisa alguma sem revelar o seu segredo aos seus servos, os profetas.",
      ref: "Amós 3:7",
    },
    referencias: [
      "Amós 3:7-8",
      "Jeremias 1:4-10",
      "Ezequiel 3:17-21",
      "1 Coríntios 14:1-5",
      "1 Coríntios 14:29-33",
      "Efésios 4:11-13",
      "Atos 11:27-30",
      "Apocalipse 19:10",
    ],
    vocacao: "Guardião",
    foco: "Alinhar",
    estilo: "Confrontador",
    perguntaChave: "É verdade?",
    contribuicaoCurta: "Direção",
    seFalta: "perde rumo",
  },

  evangelista: {
    nome: "Evangelista",
    glyph: "E",
    cor: [230, 200, 74],
    frase: "Você é movido pelo desejo de alcançar e transformar vidas.",
    essencia:
      "O dom evangelístico é marcado por uma paixão profunda em compartilhar as boas novas de Cristo. Movido por compaixão e por um senso de urgência pelos perdidos, o evangelista comunica o Evangelho com clareza e naturalidade, cria pontes entre a igreja e o mundo e mantém o coração da comunidade voltado para fora das quatro paredes.",
    caracteristicas: [
      "Comunica o Evangelho de forma simples e clara",
      "Percebe oportunidades de compartilhar a fé",
      "Coragem para abordar pessoas de contextos diferentes",
      "Entusiasmo contagiante ao falar de Jesus",
      "Amor profundo pelos perdidos",
      "Energia missionária que inspira outros",
      "Conecta a igreja com o mundo ao redor",
      "Persistência diante de rejeições ou indiferença",
    ],
    funcoes: [
      "Anunciar o Evangelho com clareza e sensibilidade ao Espírito",
      "Mobilizar a igreja a viver com intencionalidade missionária",
      "Estabelecer pontes entre a igreja e a sociedade",
      "Treinar e capacitar outros para o testemunho pessoal",
      "Integrar novos convertidos e iniciar o discipulado",
      "Lembrar a igreja de que a missão é alcançar os que não ouviram",
    ],
    pontosCegos: [
      "Superficialidade, focando em decisões rápidas sem discipulado",
      "Reduzir a mensagem à persuasão emocional ou estratégia humana",
      "Foco excessivo em números e resultados visíveis",
      "Frustração com a igreja quando ela não segue seu ritmo",
      "Falta de enraizamento doutrinário",
      "Pressa em pregar sem ouvir a história das pessoas",
      "Isolamento ministerial (agir como 'lobo solitário')",
      "Diluir a cruz numa mensagem de bem-estar",
    ],
    comoDesenvolver: [
      "Mantenha a cruz no centro: alcance com o Evangelho inteiro, não só com uma mensagem de bem-estar.",
      "Discipule quem você alcança — evangelismo sem acompanhamento deixa pessoas pelo caminho.",
      "Firme a mensagem na Bíblia: paixão sem verdade empolga, mas não sustenta a fé de ninguém.",
      "Multiplique a cultura missionária: treine outros a testemunhar, não carregue a missão sozinho.",
    ],
    palavras: ["Relacional", "Comunicador", "Missionário", "Adaptável", "Compassivo"],
    naPratica: [
      "Você puxa conversa e, sem forçar, o assunto naturalmente caminha para o que realmente importa.",
      "Fica atento a quem está sofrendo ou distante e sente um impulso genuíno de se aproximar.",
      "Traduz temas espirituais complexos em linguagem simples, próxima da vida real das pessoas.",
      "Se anima de verdade quando vê alguém dando um passo de fé — isso te move mais que números.",
    ],
    imaturo:
      "Pressiona por decisões rápidas, mede tudo por números e abandona quem alcançou sem discipular.",
    maduro:
      "Alcança com paciência, caminha junto no discipulado e celebra o processo, não só o momento da decisão.",
    resumoOutro:
      "O evangelista vive para alcançar quem ainda não conhece a Cristo. Em você, mesmo em menor intensidade, isso aparece como facilidade de se conectar e vontade de falar de fé de forma simples. Cultive convidando uma pessoa para uma conversa real esta semana.",
    contribuicao: "paixão por alcançar e comunicar esperança",
    versiculo: {
      texto: "Faça o trabalho de um evangelista, cumpra plenamente o seu ministério.",
      ref: "2 Timóteo 4:5",
    },
    referencias: [
      "Mateus 28:18-20",
      "Marcos 16:15",
      "Atos 1:8",
      "Romanos 10:13-15",
      "2 Timóteo 4:5",
      "1 Coríntios 9:19-23",
      "João 3:16-17",
      "Lucas 19:10",
    ],
    vocacao: "Alcançador",
    foco: "Converter",
    estilo: "Persuasivo",
    perguntaChave: "Quem falta?",
    contribuicaoCurta: "Alcance",
    seFalta: "se fecha",
  },

  pastor: {
    nome: "Pastor",
    glyph: "P",
    cor: [176, 123, 212],
    frase: "Você tem coração para cuidar e caminhar ao lado das pessoas.",
    essencia:
      "O dom pastoral é marcado por um profundo senso de cuidado, proteção e amor pelas pessoas. Movido por compaixão, o pastor caminha ao lado, escuta com atenção e acompanha os discípulos em suas jornadas de fé — oferecendo direção, consolo e correção. Seu ministério é relacional: promove unidade, cura emocional e maturidade, refletindo o cuidado de Cristo, o Bom Pastor.",
    caracteristicas: [
      "Amor genuíno e cuidado pelas pessoas",
      "Capacidade de ouvir, aconselhar e apoiar",
      "Sensibilidade às necessidades emocionais e espirituais",
      "Habilidade de promover unidade e reconciliação",
      "Compromisso com o crescimento dos discípulos",
      "Liderança servidora, com mansidão e responsabilidade",
      "Presença nos momentos difíceis e nas celebrações",
      "Cria ambientes acolhedores e inclusivos",
    ],
    funcoes: [
      "Zelar pelo bem-estar espiritual e emocional da comunidade",
      "Aconselhar, confortar e orientar em suas jornadas de fé",
      "Promover unidade, reconciliação e cura na igreja",
      "Liderar com mansidão, responsabilidade e exemplo",
      "Criar ambientes que favoreçam comunhão e discipulado",
      "Treinar e capacitar líderes para o cuidado pastoral",
    ],
    pontosCegos: [
      "Superproteger, limitando a autonomia dos membros",
      "Dificuldade em delegar e assumir sobrecarga",
      "Sensibilidade excessiva a críticas",
      "Evitar confrontar problemas e conflitos",
      "Priorizar o emocional em detrimento da disciplina espiritual",
      "Criar dependência emocional na comunidade",
      "Resistência a mudanças necessárias ao crescimento",
      "Descuidar da própria formação e limites saudáveis",
    ],
    comoDesenvolver: [
      "Cuide sem gerar dependência: seu papel é formar pessoas maduras, não mantê-las presas a você.",
      "Aprenda a confrontar com graça — evitar o conflito necessário não é cuidado, é omissão.",
      "Estabeleça limites saudáveis: você cuida melhor dos outros quando também cuida de si mesmo.",
      "Ande com apóstolos e mestres para somar visão e profundidade ao seu cuidado.",
    ],
    palavras: ["Acolhedor", "Cuidadoso", "Presente", "Conciliador", "Fiel"],
    naPratica: [
      "Você percebe quando alguém não está bem, mesmo que a pessoa não diga uma palavra sobre isso.",
      "As pessoas te procuram para desabafar — sentem em você um espaço seguro para serem ouvidas.",
      "Você se importa em manter a unidade e sofre quando vê alguém se afastando ou magoado.",
      "Sente alegria profunda em acompanhar alguém crescendo, passo a passo, ao longo do tempo.",
    ],
    imaturo:
      "Superprotege e gera dependência, evita o conflito necessário e se sobrecarrega por não delegar.",
    maduro:
      "Cuida formando pessoas maduras e autônomas, confronta com graça quando é preciso e mantém limites saudáveis.",
    resumoOutro:
      "O pastor cuida, protege e caminha ao lado das pessoas. Em você, mesmo em segundo plano, isso aparece como empatia para perceber quem não está bem e disposição para acolher. Cultive procurando alguém que precisa e simplesmente estando presente.",
    contribuicao: "cuidado com as pessoas e senso de comunidade",
    versiculo: {
      texto: "Eu sou o bom pastor. O bom pastor dá a sua vida pelas ovelhas.",
      ref: "João 10:11",
    },
    referencias: [
      "1 Pedro 5:2-4",
      "Efésios 4:11-12",
      "Jeremias 3:15",
      "Atos 20:28",
      "João 10:11-16",
      "Hebreus 13:17",
      "1 Timóteo 3:1-7",
      "Salmo 23:1-6",
    ],
    vocacao: "Cuidador",
    foco: "Nutrir",
    estilo: "Relacional",
    perguntaChave: "Quem precisa?",
    contribuicaoCurta: "Cuidado",
    seFalta: "esfria",
  },

  mestre: {
    nome: "Mestre",
    glyph: "M",
    cor: [75, 191, 107],
    frase: "Você tem paixão pelo ensino da Palavra e pela formação de discípulos.",
    essencia:
      "O dom de mestre é marcado por um amor profundo pela Palavra e pelo desejo de ensinar com fidelidade, clareza e profundidade. Movido pelo compromisso com a verdade, o mestre organiza o conteúdo bíblico de forma acessível, protege a igreja de heresias e promove maturidade. Não apenas transmite conhecimento: modela uma vida enraizada na Palavra.",
    caracteristicas: [
      "Paixão por estudar e ensinar as Escrituras",
      "Organiza o conteúdo bíblico de forma didática",
      "Amor pela sã doutrina e proteção contra heresias",
      "Responde perguntas difíceis com base na Bíblia",
      "Contextualiza verdades bíblicas para a realidade atual",
      "Disciplina pessoal de estudo e pesquisa",
      "Paciência para ensinar e explicar quantas vezes for preciso",
      "Busca coerência entre vida e ensino",
    ],
    funcoes: [
      "Ensinar as Escrituras com clareza e aplicação prática",
      "Proteger a igreja de heresias com equilíbrio doutrinário",
      "Desenvolver estudos e recursos que fortaleçam a fé",
      "Trazer ensino corretivo com graça e firmeza",
      "Treinar e capacitar novos mestres e líderes",
      "Conectar a doutrina com a prática cristã do dia a dia",
    ],
    pontosCegos: [
      "Intelectualismo, focando no conhecimento e não na vida",
      "Rigidez teológica e pouca abertura a novas perspectivas",
      "Frieza diante das necessidades emocionais das pessoas",
      "Pouca ação missionária e engajamento com os de fora",
      "Linguagem técnica que dificulta o entendimento",
      "Debates desnecessários sobre assuntos secundários",
      "Orgulho intelectual com quem sabe menos",
      "Idolatrar o conhecimento acima da comunhão com Deus",
    ],
    comoDesenvolver: [
      "Ensine para transformar, não só para informar: conecte sempre a doutrina com a vida real.",
      "Cuide da simplicidade — comunique para ser entendido, não para impressionar quem ouve.",
      "Evite brigas por assuntos secundários: firmeza no essencial, graça no que é debatível.",
      "Ande com evangelistas e pastores para unir profundidade a missão e cuidado com pessoas.",
    ],
    palavras: ["Estudioso", "Didático", "Fiel", "Profundo", "Coerente"],
    naPratica: [
      "Você gosta de entender as coisas a fundo antes de ensinar, opinar ou tomar uma posição.",
      "As pessoas te procuram com perguntas difíceis sobre a Bíblia, a fé e a vida cristã.",
      "Se incomoda quando algo é ensinado de forma rasa, descontextualizada ou incorreta.",
      "Busca coerência entre aquilo que você crê, aquilo que ensina e aquilo que vive.",
    ],
    imaturo:
      "Prioriza o conhecimento acima da vida, usa linguagem técnica que afasta e se perde em debates secundários.",
    maduro:
      "Ensina para transformar, comunica com simplicidade e conecta a doutrina com a prática do dia a dia.",
    resumoOutro:
      "O mestre ama a Palavra e ensina com fidelidade e clareza. Em você, mesmo em menor intensidade, isso aparece como sede de entender a fundo e cuidado com a verdade. Cultive estudando um tema que te intriga e compartilhando o que aprendeu com alguém.",
    contribuicao: "profundidade na Palavra e clareza para ensinar",
    versiculo: {
      texto:
        "Procura apresentar-te a Deus aprovado, como obreiro que maneja bem a palavra da verdade.",
      ref: "2 Timóteo 2:15",
    },
    referencias: [
      "2 Timóteo 2:1-2",
      "2 Timóteo 3:16-17",
      "Tiago 3:1",
      "Efésios 4:11-13",
      "Atos 18:24-28",
      "Colossenses 1:28",
      "Tito 1:9",
      "Hebreus 5:12-14",
    ],
    vocacao: "Formador",
    foco: "Ensinar",
    estilo: "Analítico",
    perguntaChave: "O que diz a Palavra?",
    contribuicaoCurta: "Solidez",
    seFalta: "fica rasa",
  },
};

// 20 textos curados de combinação (principal → secundário)
export const COMBINATIONS: Record<string, string> = {
  "apostolo-profeta": "Você abre caminhos novos com sensibilidade à direção de Deus — pioneiro que não avança sem alinhamento espiritual.",
  "apostolo-evangelista": "Você expande o Reino alcançando pessoas — pioneiro e missionário, planta onde ainda não há.",
  "apostolo-pastor": "Você inicia o novo sem perder o cuidado — abre caminhos e ainda zela por quem vem junto.",
  "apostolo-mestre": "Você estabelece fundamentos com solidez doutrinária — pioneiro que constrói sobre a Palavra.",
  "profeta-apostolo": "Sua sensibilidade espiritual ganha visão de expansão — enxerga o que Deus quer e mobiliza para realizar.",
  "profeta-evangelista": "Você discerne e proclama — voz que alinha a igreja e alcança os que estão de fora.",
  "profeta-pastor": "Você fala a verdade com cuidado — confronta e, ao mesmo tempo, restaura.",
  "profeta-mestre": "Você une discernimento e doutrina — sensível à voz de Deus e firme na Palavra.",
  "evangelista-apostolo": "Você alcança e multiplica — não quer só converter, quer estabelecer e enviar.",
  "evangelista-profeta": "Você comunica a esperança com sensibilidade espiritual — alcança e chama à autenticidade.",
  "evangelista-pastor": "Você alcança e cuida — não deixa quem ganhou ficar pelo caminho.",
  "evangelista-mestre": "Você comunica com paixão e fundamento — alcança e ensina a permanecer.",
  "pastor-apostolo": "Você cuida com visão de expansão — pastoreia e ainda pensa em multiplicar.",
  "pastor-profeta": "Você acolhe com discernimento — cuida das pessoas e as alinha à verdade.",
  "pastor-evangelista": "Você cuida e alcança — pastoreia o rebanho e busca os que estão fora.",
  "pastor-mestre": "Você cuida com profundidade — acolhe e ensina a caminhar.",
  "mestre-apostolo": "Você ensina com visão de expansão — fundamenta e ainda impulsiona o novo.",
  "mestre-profeta": "Você ensina com sensibilidade espiritual — doutrina firme e sensível à voz de Deus.",
  "mestre-evangelista": "Você ensina e alcança — profundidade na Palavra a serviço da missão.",
  "mestre-pastor": "Você ensina com coração pastoral — fundamenta e cuida de quem aprende.",
};

export function combinationText(primary: DomKey, secondary: DomKey): string {
  return (
    COMBINATIONS[`${primary}-${secondary}`] ??
    `Você lidera como ${DOMS[primary].nome} com forte presença de ${DOMS[secondary].nome}.`
  );
}

// Texto simétrico para empate de 2 (co-principais)
export function tieText(a: DomKey, b: DomKey): string {
  return `Empate técnico entre ${DOMS[a].nome} e ${DOMS[b].nome} — dois dons em forte expressão. ${COMBINATIONS[`${a}-${b}`] ?? COMBINATIONS[`${b}-${a}`] ?? ""}`.trim();
}

// Combinação em parágrafo mais completo (pág. resultado)
export function combinationRich(primary: DomKey, secondary: DomKey): string {
  const p = DOMS[primary];
  const s = DOMS[secondary];
  return `${combinationText(primary, secondary)} Como ${p.nome}, seu foco natural é ${p.foco.toLowerCase()}; com ${s.nome} em segundo plano, você soma ${s.contribuicao}. Na prática, isso te posiciona para unir ${p.foco.toLowerCase()} e ${s.foco.toLowerCase()} no seu chamado.`;
}

// Bullets "o que isso significa" (pág. resultado)
export function comboSignificados(primary: DomKey, secondary?: DomKey): string[] {
  const out = [
    `Seu dom principal (${DOMS[primary].nome}) mostra por onde você mais naturalmente serve e floresce.`,
  ];
  if (secondary) {
    out.push(`Seu dom secundário (${DOMS[secondary].nome}) tempera o principal e amplia o seu alcance.`);
  }
  out.push("O ranking importa mais que os números: é a ordem que revela o seu jeito de servir.");
  return out;
}

// Plano de 30 dias (o {DOM} é substituído pelo nome do dom principal)
export const PLANO_30: { semana: string; titulo: string; texto: string; passo: string }[] = [
  {
    semana: "Semana 1",
    titulo: "Observar & reconhecer",
    texto:
      "Preste atenção em você durante a semana. Anote 3 situações concretas em que você usou {DOM} de forma natural — o que fez, como se sentiu e qual foi o fruto.",
    passo: "Passo prático: no fim da semana, releia as anotações e circule o momento em que você se sentiu mais vivo.",
  },
  {
    semana: "Semana 2",
    titulo: "Fundamentar na Palavra",
    texto:
      "Um dom sem raiz bíblica vira só temperamento. Estude os textos-base do seu perfil — dom principal e secundário — anotando o que cada um ensina sobre o seu chamado.",
    passo: "Passo prático: escolha 1 versículo para memorizar e carregar como lema do mês.",
  },
  {
    semana: "Semana 3",
    titulo: "Praticar servindo",
    texto:
      "Dom se desenvolve na prática, não na teoria. Coloque {DOM} a serviço de uma pessoa ou grupo específico esta semana — de forma intencional, não aleatória.",
    passo: "Passo prático: defina hoje QUEM você vai servir e QUANDO. Marque na sua agenda.",
  },
  {
    semana: "Semana 4",
    titulo: "Multiplicar & revisar",
    texto:
      "Chamado maduro não se guarda, se compartilha. Convide alguém para caminhar com você e revise o mês: o que amadureceu, o que Deus destacou e qual é o próximo passo.",
    passo: "Passo prático: escreva em uma frase o próximo passo do seu chamado para os próximos 90 dias.",
  },
];
