// Conteúdo compartilhado pelas páginas do site da Rede de Igrejas nas Casas.
import principal1 from '../assets/image/principal/20250715_215515(0).jpeg';
import principal2 from '../assets/image/principal/AirBrush_20250625220548.jpeg';
import principal3 from '../assets/image/principal/AirBrush_20250703233528.jpeg';
import principal4 from '../assets/image/principal/AirBrush_20250703233640.jpeg';
import principal5 from '../assets/image/principal/img_0274.jpg';
import principal6 from '../assets/image/principal/img_0352.jpg';
import principal7 from '../assets/image/principal/img_0469.jpg';
import principal8 from '../assets/image/principal/img_9291.jpg';
import principal9 from '../assets/image/principal/img_9375.jpg';
import encontro1 from '../../../assets/images/encontro1.jpg';
import encontro2 from '../../../assets/images/encontro2.png';
import encontro4 from '../../../assets/images/encontro4.jpg';
import presbiterosFoto from '../assets/image/presbiteros/marcelo-suenia.jpg';
import redeLogo from '../assets/image/logoRedeIgrejas/Post para Instagram Parabéns Aniversário Azul e Branco Divertido Moderno.png?url';

export { redeLogo };

export const PHOTOS = {
  mesa: principal1,
  grupo: principal2,
  familia: principal3,
  louvor: principal4,
  missao: principal5,
  comunhao: principal6,
  palavra: principal7,
  rede: principal9,
};

const heroModules = import.meta.glob<{ default: string }>(
  '../assets/image/principal/Imagens_Header/converted/*.jpg',
  { eager: true },
);
export const HERO_IMAGES: string[] = Object.values(heroModules).map((m) => m.default);

// ── Contato ────────────────────────────────────────────────────
export const REDE_PHONE_DISPLAY = '+55 (83) 98718-1731';
export const REDE_EMAIL = 'redeigrejasfiveone@gmail.com';
export const INSTAGRAM_URL = 'https://www.instagram.com/redeigrejasfiveone';
export const INSTAGRAM_HANDLE = '@redeigrejasfiveone';
export const CONFISSAO_PDF = '/assets/pdfs/confissao-de-fe.pdf';

const wa = (text: string) => `https://wa.me/5583987181731?text=${encodeURIComponent(text)}`;

export const WHATSAPP = {
  geral: wa('Olá! Vim pelo site da Rede Five One e gostaria de saber mais sobre as igrejas nas casas.'),
  abrirCasa: wa('Olá! Vi no site da Rede Five One e tenho interesse em abrir minha casa para uma igreja nas casas. Como funciona?'),
  estudo: wa('Olá! Vi no site da Rede Five One e quero participar do estudo bíblico nas casas. Quando e onde será o próximo encontro?'),
  culto: wa('Olá! Vi no site da Rede Five One e quero confirmar presença no culto nas casas do sábado. Como funciona?'),
};

const PUBLIC_VISITOR_TOKEN = 'd8a7f3b2-1c0e-4a69-8b95-6f4e3d2c1b0a';
export const VISITOR_FORM_PATH = `/rede/cadastro?token=${PUBLIC_VISITOR_TOKEN}`;

// ── Valores ────────────────────────────────────────────────────
// `titulo` + `destaque` formam o nome; o destaque aparece em itálico.
export type Valor = { titulo: string; destaque: string; descricao: string; image: string };

export const VALORES: Valor[] = [
  {
    titulo: 'Estudo Bíblico e',
    destaque: 'Partilha',
    descricao: 'Mesa aberta para mergulhar na Palavra, ouvir testemunhos e orar uns pelos outros.',
    image: principal1,
  },
  {
    titulo: 'Louvor e',
    destaque: 'Comunhão',
    descricao: 'Adoração simples, família reunida e dons em movimento em cada casa.',
    image: principal4,
  },
  {
    titulo: 'Palavra e',
    destaque: 'Testemunho',
    descricao: 'Compartilhamos experiências reais, aplicamos o Evangelho e celebramos milagres.',
    image: principal7,
  },
  {
    titulo: 'Discipulado em',
    destaque: 'Família',
    descricao: 'Casas acolhedoras onde cada geração encontra lugar e propósito no Reino.',
    image: principal3,
  },
  {
    titulo: 'Missão na',
    destaque: 'Cidade',
    descricao: 'Vemos a cidade como campo missionário e as casas como base de envio.',
    image: principal5,
  },
  {
    titulo: 'Sacerdócio de',
    destaque: 'Todos',
    descricao: 'Cristo como cabeça. Todos participam, todos servem, todos crescem.',
    image: principal2,
  },
];

// ── Casas ──────────────────────────────────────────────────────
// Lista de reserva, usada enquanto (ou se) as casas do Supabase não carregam.
export type Casa = {
  nome: string;
  bairro: string;
  cidade: string;
  estado: string;
  lider: string;
  telefone: string;
  linkMaps: string;
  encontros: string;
};

export const CASAS_FALLBACK: Casa[] = [
  {
    nome: 'Igreja Casas Catolé',
    bairro: 'Catolé',
    cidade: 'Campina Grande',
    estado: 'PB',
    lider: 'Marcelo Junior',
    telefone: REDE_PHONE_DISPLAY,
    linkMaps: 'https://www.google.com/maps/place/Igreja+Casas+Católé/@-7.2371273,-35.9068963,17z',
    encontros: 'Estudo Bíblico · sex 19h · Culto nas Casas · sáb 19h',
  },
];

// ── Agenda ─────────────────────────────────────────────────────
export const PROGRAMACAO = [
  {
    titulo: 'Estudo Bíblico nas Casas',
    quando: 'Sexta-feira · 19h',
    descricao: 'Uma noite para mergulhar na Palavra, partilhar revelações e orar uns pelos outros.',
    botao: 'Quero participar',
    link: WHATSAPP.estudo,
  },
  {
    titulo: 'Culto nas Casas',
    quando: 'Sábado · 19h',
    descricao: 'Celebração com louvor, comunhão e envio missionário direto do coração da família Five One.',
    botao: 'Confirmar presença',
    link: WHATSAPP.culto,
  },
];

// ── Quem somos ─────────────────────────────────────────────────
export const MANIFESTO = [
  'Somos uma rede de discípulos que abre lares para viver o Evangelho com simplicidade, participação e presença do Espírito Santo em cada encontro.',
  'Vemos cada casa como campo de missão — lugar onde Cristo é anunciado, dons são ativados e famílias espirituais florescem bairro a bairro.',
  'Caminhamos próximos uns dos outros, conectados por uma mesma visão bíblica: uma comunidade simples, perseverante e fiel, capaz de florescer em qualquer cultura até a volta de Cristo.',
];

export const PILARES = [
  {
    tag: 'Visão',
    titulo: 'O que acreditamos',
    resumo: 'Cremos que a igreja é gente reunida pelo Espírito para viver e manifestar o Reino no dia a dia.',
    itens: [
      'Cristo como o cabeça da Igreja (Colossenses 1:18)',
      'O sacerdócio de todos os santos (1 Pedro 2:9)',
      'Casas como lugares de comunhão, ensino e missão (Romanos 16:3-5)',
    ],
    quote: {
      text: 'O novo movimento de igrejas precisa de menos púlpitos e mais mesas, menos plateias e mais comunidades.',
      author: 'Wolfgang Simson',
    },
  },
  {
    tag: 'Missão',
    titulo: 'Onde estamos hoje',
    resumo: 'Começamos em uma casa, cultivando fé, comunhão, discipulado e missão com simplicidade intencional.',
    itens: [
      'Comunhão ao redor da mesa',
      'Discipulado orgânico que acompanha histórias reais',
      'Missão encarnada no cotidiano',
    ],
  },
  {
    tag: 'Propósito',
    titulo: 'Para onde estamos indo',
    resumo: 'Multiplicar comunidades simples, cheias do Espírito, que florescem em casas e abençoam bairros inteiros.',
    itens: [
      'Discípulos que fazem discípulos (2 Timóteo 2:2)',
      'Casas como centros de glória e serviço',
      'Cada cristão vivendo seu dom com ousadia (Efésios 4:7-16)',
    ],
    quote: {
      text: 'A igreja não está morrendo. Ela está se movendo. De volta às casas.',
      author: 'Alan Hirsch',
    },
  },
];

/** O que a igreja na casa não é — tirado da Confissão de Fé. */
export const NAO_E = [
  {
    titulo: 'Não é um templo.',
    texto: 'A casa não vira “lugar sagrado” porque a igreja se reúne nela. A casa continua sendo casa: quem é Igreja é o povo de Deus reunido por Cristo.',
  },
  {
    titulo: 'Não é uma denominação.',
    texto: 'Nenhuma instituição “possui” as casas. Os vínculos entre nós se parecem mais com os de uma família do que com os de uma estrutura institucional.',
  },
  {
    titulo: 'Não é uma reação contra outras igrejas.',
    texto: 'Lutamos contra o “nós contra eles” e pela unidade com as outras igrejas locais e com o Corpo de Cristo na cidade.',
  },
];

// ── Valores: práticas e vida da igreja ─────────────────────────
type Item = { titulo: string; descricao: string };

export const CINCO_MOTIVOS: Item[] = [
  { titulo: 'Adoração', descricao: 'Cristo no centro de cada encontro — em palavra, oração e canto, dirigida ao Pai, por meio do Filho, no Espírito.' },
  { titulo: 'Comunhão', descricao: 'Mesa aberta, vidas conectadas, presença real entre irmãos. Não há cristianismo solitário.' },
  { titulo: 'Discipulado', descricao: 'Aprender a obedecer a Jesus juntos, no cotidiano — ensinando uns aos outros tudo o que Ele ordenou.' },
  { titulo: 'Serviço', descricao: 'Cada um servindo com o dom que recebeu, dentro e fora da casa, em sacerdócio real.' },
  { titulo: 'Evangelismo', descricao: 'A casa como base de envio para o bairro, a cidade e os povos — porque Cristo é o único Mediador.' },
];

export const CINCO_MOTIVOS_DESTAQUE =
  'Em uma igreja na casa, cada membro faz muita falta. Como a proposta é sermos menos em número, a presença de cada um pesa muito — o nosso encontro é prioridade.';

export const VIDA_DA_IGREJA: Item[] = [
  { titulo: 'Igreja na casa', descricao: 'Reunimo-nos prioritariamente em lares, recuperando o modelo neotestamentário e relacional dos primeiros discípulos.' },
  { titulo: 'Ceia ao redor da mesa', descricao: 'Celebramos a Ceia como refeição comunitária autêntica, não como rito isolado — em memória de Cristo e antecipando o banquete do Reino.' },
  { titulo: 'Batismo por imersão', descricao: 'Celebramos o batismo de quem professa fé consciente, como festa comunitária e entrada visível no Corpo.' },
  { titulo: 'Discipulado relacional', descricao: 'Cada cristão é discípulo e discipulador, formando outros no convívio diário, e não apenas pela transmissão de conteúdo.' },
  { titulo: 'Sacerdócio de todos', descricao: 'Rejeitamos o clericalismo: cada irmão e irmã tem dom, vocação e responsabilidade no Reino.' },
  { titulo: 'Mutualismo no Reino', descricao: 'Homens e mulheres, criados igualmente à imagem de Deus, podem servir em todas as funções da igreja, conforme os dons recebidos do Espírito.' },
];

// ── Estrutura ──────────────────────────────────────────────────
export const ESTRUTURA_VISAO = {
  paragrafos: [
    'O nome da igreja local não é "Five One". Cada igreja é, antes de tudo, uma igreja na casa. A Rede Five One é a rede dos cinco ministérios de Efésios 4 — apóstolos, profetas, evangelistas, pastores e mestres — que cuidam, acompanham e fortalecem essas casas, para que o Corpo de Cristo seja edificado de forma saudável e fiel à Escritura.',
    'Nós somos a Igreja. Não somos uma denominação, e nenhuma instituição "possui" as casas. A natureza dos vínculos entre nós se parece mais com os de uma família do que com os de uma estrutura institucional: depende de amor, confiança, tempo e longevidade.',
  ],
  versiculo: {
    texto: 'Permaneçam firmes e apeguem-se às tradições que ensinamos a vocês, quer por palavra, quer por carta nossa.',
    referencia: '2 Tessalonicenses 2.15',
  },
  itens: [
    { titulo: 'Igreja é gente, não local', descricao: 'A casa não vira "templo" porque a igreja se reúne nela. Quem é Igreja é o povo de Deus reunido por Cristo.' },
    { titulo: 'Cinco ministérios juntos', descricao: 'Apóstolos, profetas, evangelistas, pastores e mestres servindo o Corpo — sem o "ministério de um homem só".' },
    { titulo: 'Vínculos relacionais', descricao: 'Acompanhamento de família, não de organização: caminhar próximo, com amor e tempo.' },
    { titulo: 'Unidade com a Igreja', descricao: 'Lutamos contra o "nós contra eles" e pela unidade com outras igrejas locais e com o Corpo de Cristo na cidade.' },
  ],
  destaque: 'A Rede Five One é apenas uma expressão da igreja entre tantas outras boas e fiéis. Não somos uma marca; somos um lar.',
};

/** Círculos de cuidado — da casa para a rede (Confissão de Fé, Parte II, d). */
export const CIRCULOS = [
  { titulo: 'Igreja na casa', subtitulo: 'onde a vida acontece', texto: 'Uma igreja pequena por natureza, com cerca de até vinte pessoas, reunida ao redor da mesa. Tudo o mais nesta estrutura existe para servi-la.' },
  { titulo: 'Casal de presbíteros', subtitulo: 'pastoreia a casa', texto: 'Cada igreja na casa é cuidada por um casal de presbíteros, que pastoreia a vida cotidiana da comunidade e forma novos líderes para a multiplicação.' },
  { titulo: 'Comunhão de presbíteros', subtitulo: 'caminham juntos', texto: 'A liderança é plural: os presbíteros das diversas casas caminham juntos no contexto da rede, em comunhão constante.' },
  { titulo: 'Cinco ministérios', subtitulo: 'cuidam da rede', texto: 'A rede como um todo é liderada pelos cinco ministérios de Efésios 4, em colaboração constante com os presbíteros das casas.' },
];

export const LIDERANCA = {
  paragrafos: [
    'O modelo neotestamentário não conhece o líder solitário no topo de uma estrutura piramidal. Conhece, sim, presbíteros — sempre no plural — que cuidam juntos do rebanho de Deus, reconhecidos pelo caráter antes da capacidade, ao longo do tempo (At 14.23; Tt 1.5-9; 1Pe 5.1-4).',
    'Distinguimos cuidadosamente presbítero de pastor. Em Efésios 4.11, pastor é um dos cinco dons ministeriais que Cristo distribuiu à sua Igreja. Um presbítero pode ter o dom de pastor — mas também pode liderar pelo dom de mestre, profeta, evangelista ou apóstolo. Queremos resgatar a pluralidade dos cinco ministérios e abandonar o modelo de "ministério de um homem só".',
  ],
  ministerios: [
    { titulo: 'Apóstolos', descricao: 'Enviados que abrem caminhos, plantam comunidades e cuidam da fidelidade ao evangelho.' },
    { titulo: 'Profetas', descricao: 'Vozes que ouvem a Deus para o presente, exortando, consolando e chamando à conversão.' },
    { titulo: 'Evangelistas', descricao: 'Proclamadores das boas-novas, com paixão e clareza para alcançar os que ainda não creem.' },
    { titulo: 'Pastores', descricao: 'Cuidadores que conhecem cada ovelha pelo nome, alimentando, protegendo e curando.' },
    { titulo: 'Mestres', descricao: 'Guardiões da sã doutrina, que ensinam com fidelidade e profundidade as Escrituras.' },
  ],
  areas: 'Equipes de membros servem em finanças, mídia, louvor, ceia, departamento infantil e prospecção de necessidades — para que cada casa funcione como família espiritual viva.',
};

export const MEMBRESIA = {
  paragrafos: [
    'A membresia formal em uma igreja local não é mera adesão administrativa, mas um pacto de aliança espiritual entre o crente e a comunidade da fé, comprometendo-os mutuamente diante de Deus e uns dos outros (Hb 10.24-25; At 2.42-47).',
    'Para se tornar membro de uma igreja na casa da Rede Five One, a pessoa precisa concluir o curso Bases — onde percorre os fundamentos da fé cristã e nossa identidade como rede — e ler a Confissão de Fé junto com os presbíteros, acolhendo-a como sua.',
  ],
  itens: [
    { titulo: 'Submissão mútua', descricao: 'Viver em aliança fraterna com os demais irmãos (Ef 4.1-3; Hb 10.24-25).' },
    { titulo: 'Participação ativa', descricao: 'Estar nas reuniões, ministérios e expressões da comunidade (1Co 14.26; At 2.42).' },
    { titulo: 'Missão e discipulado', descricao: 'Assumir o chamado de fazer discípulos e servir com amor, dentro e fora da igreja (Mt 28.19-20).' },
    { titulo: 'Generosidade alegre', descricao: 'Sustentar a missão do Reino e cuidar dos necessitados com simplicidade e administração sábia (At 2.44-45; 2Co 9.7).' },
    { titulo: 'Cuidado pastoral', descricao: 'Receber o cuidado dos presbíteros e dos cinco ministérios, acolhendo correção amorosa quando necessário (Hb 13.17; 1Pe 5.1-5).' },
  ],
};

export const MULTIPLICACAO = {
  paragrafos: [
    'Nosso desejo é multiplicar. Mas a multiplicação só ocorrerá quando identificarmos presbíteros preparados para conduzir uma nova casa. Entendemos pela Escritura que cabe ao ministério apostólico reconhecer presbíteros — queremos ser o mais fiéis possível ao texto.',
    'Cada nova casa permanece sob o acompanhamento da Rede e participa de uma reunião geral mensal com as demais igrejas da rede na mesma cidade. Seus presbíteros se reúnem com a liderança da rede em periodicidade aproximada de dois meses, para que a unidade seja preservada.',
  ],
  itens: [
    { titulo: 'Caráter bíblico', descricao: 'Amar a Cristo de todo o coração, com o caráter que a Escritura exige de presbíteros (1Tm 3; Tt 1).' },
    { titulo: 'Vida nos 5 motivos', descricao: 'Participação ativa, constante e colaborativa em adoração, comunhão, discipulado, serviço e evangelismo.' },
    { titulo: 'Confissão acolhida', descricao: 'Conhecer e viver a Confissão de Fé, alinhado com a doutrina e as convicções da rede.' },
    { titulo: 'Comunhão real', descricao: 'Amizade e relacionamento verdadeiro com os presbíteros atuais, para preservar a unidade.' },
    { titulo: 'Conexão entre as casas', descricao: 'Reunião mensal das casas da mesma cidade e contribuição financeira para que a obra continue avançando.' },
  ],
  destaque: 'Cada casa que surgir separa um valor mensal para a Rede Five One — para multiplicar novas casas, abrir orfanatos e cumprir outros chamados que o Senhor venha a colocar diante de nós.',
};

// ── Encontros (galeria da agenda) ──────────────────────────────
export const ENCONTROS = [
  {
    titulo: 'Estudo Bíblico e',
    destaque: 'Partilha',
    descricao: 'Mesa aberta para mergulhar na Palavra, ouvir testemunhos e orar uns pelos outros.',
    imagens: [encontro1, principal1, principal2, principal3],
  },
  {
    titulo: 'Louvor e',
    destaque: 'Comunhão',
    descricao: 'Adoração simples, família reunida e dons em movimento em cada casa.',
    imagens: [encontro2, principal4, principal5, principal6],
  },
  {
    titulo: 'Palavra e',
    destaque: 'Testemunho',
    descricao: 'Compartilhamos experiências reais, aplicamos o Evangelho e celebramos milagres.',
    imagens: [principal7, principal9, principal8, principal1],
  },
  {
    titulo: 'Discipulado em',
    destaque: 'Família',
    descricao: 'Casas acolhedoras onde cada geração encontra lugar e propósito no Reino.',
    imagens: [encontro4, principal2, principal5, principal8],
  },
];

// ── Presbíteros ────────────────────────────────────────────────
export const PRESBITEROS = {
  foto: presbiterosFoto,
  nomes: 'Marcelo Junior e Suenia Karcia',
  papel: 'Casal de presbíteros',
  texto: [
    'Marcelo e Suenia abriram a primeira casa da rede em 2025. Como casal de presbíteros, pastoreiam a vida cotidiana da comunidade — a Palavra, a mesa, a oração e o cuidado de cada pessoa pelo nome.',
    'Mais do que conduzir encontros, a vocação deles é formar novos presbíteros, para que cada casa madura possa dar à luz outra casa.',
  ],
};

// ── Nossa história ─────────────────────────────────────────────
// Rótulos sem data ficam para marcos contínuos; só 2025 é data confirmada.
export const HISTORIA = [
  {
    quando: '2025',
    titulo: 'Uma casa, doze pessoas',
    texto: 'Em 2025, em Campina Grande - PB, abrimos a primeira casa. Doze pessoas ao redor de uma mesa, com a Bíblia aberta, pão partido e a certeza de que não precisávamos de um templo para ser igreja — só de Jesus no centro e uns dos outros por perto.',
  },
  {
    quando: '2025',
    titulo: 'Um propósito maior que a sala',
    texto: 'Desde o primeiro encontro, o chamado foi claro: espalhar a visão de igreja nas casas por todo o Brasil, multiplicando igrejas nas casas — bairro a bairro, cidade a cidade.',
  },
  {
    quando: 'Toda semana',
    titulo: 'A mesa posta',
    texto: 'Às sextas, o Estudo Bíblico; aos sábados, o Culto nas Casas. Palavra, louvor, oração e a Ceia partilhada como refeição — cada um trazendo o seu dom, ninguém como plateia.',
  },
  {
    quando: 'Cuidado de família',
    titulo: 'Presbíteros, no plural',
    texto: 'Marcelo Junior e Suenia Karcia servem como casal de presbíteros, cuidando da casa e formando novos líderes, sob o cuidado dos cinco ministérios de Efésios 4.',
  },
  {
    quando: 'O que cremos',
    titulo: 'A fé, por escrito',
    texto: 'Escrevemos a nossa Confissão de Fé: as doutrinas que nos unem à Igreja de todos os tempos e as convicções que dão rosto à nossa rede. Não um manual de regras, mas um pacto de aliança.',
  },
  {
    quando: 'Hoje',
    titulo: 'Uma família em Campina Grande',
    texto: 'Seguimos reunidos nas casas de Campina Grande, com encontros semanais, discipulado de perto e portas abertas para quem quiser se sentar à mesa.',
  },
  {
    quando: 'Adiante',
    titulo: 'Casas por todo o Brasil',
    texto: 'Oramos para que cada casa madura gere outra casa, e que presbíteros sejam levantados em outros bairros e cidades — até que a igreja nas casas seja uma realidade por todo o Brasil.',
  },
];
