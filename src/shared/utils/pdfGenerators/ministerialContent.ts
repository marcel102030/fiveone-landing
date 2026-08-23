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
  versiculo: { texto: string; ref: string };
  referencias: string[];
  // comparativo
  vocacao: string;
  foco: string;
  estilo: string;
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
      "Transmita a visão com clareza e ouça as perguntas de quem está ao redor.",
      "Recrute pessoas com mente apostólica/profética para ajudar a executar.",
      "Ande com pastores e mestres — equilibram o avanço com cuidado e profundidade.",
      "Desenvolva compromisso com detalhes e acompanhamento pós-implantação.",
    ],
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
      "Seja voz que traz vida: profecia edifica, exorta e consola — não amedronta.",
      "Compartilhe percepções com humildade; toda profecia é avaliada pela comunidade.",
      "Sustente a sensibilidade com oração, jejum e estudo bíblico consistente.",
      "Valorize a correção fraterna e o discipulado de outros dons.",
    ],
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
      "Mantenha a centralidade do Evangelho: amor de Deus e chamado ao arrependimento.",
      "Promova discipulado desde a conversão — não deixe quem alcançou pelo caminho.",
      "Equilibre paixão com verdade bíblica; firme a mensagem nas Escrituras.",
      "Desperte outros a testemunhar — evangelismo é cultura, não só evento.",
    ],
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
      "Cuide sem gerar dependência: forme pessoas maduras e autônomas na fé.",
      "Aprenda a confrontar com graça — cuidado verdadeiro também corrige.",
      "Estabeleça limites saudáveis entre vida pessoal e ministério.",
      "Ande com apóstolos e mestres para equilibrar cuidado com visão e profundidade.",
    ],
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
      "Conecte sempre a doutrina com a prática — ensino que muda a vida.",
      "Cuide da simplicidade: comunique para ser entendido, não para impressionar.",
      "Ande com evangelistas e pastores para unir profundidade a missão e cuidado.",
      "Forme novos mestres — multiplique o ensino, não o centralize.",
    ],
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

// Plano de 30 dias (o {DOM} é substituído pelo nome do dom principal)
export const PLANO_30: { semana: string; titulo: string; texto: string }[] = [
  { semana: "Semana 1", titulo: "Observar", texto: "Anote 3 momentos em que o seu dom de {DOM} apareceu naturalmente." },
  { semana: "Semana 2", titulo: "Fundamentar", texto: "Estude 2 textos-base do seu dom e uma referência do seu dom secundário." },
  { semana: "Semana 3", titulo: "Praticar", texto: "Coloque o dom em ação servindo uma pessoa ou grupo esta semana." },
  { semana: "Semana 4", titulo: "Multiplicar", texto: "Convide alguém para caminhar com você. Reveja o que amadureceu no mês." },
];
