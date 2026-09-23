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
    descricao: 'Abrimos a Bíblia juntos, conversamos sobre o que lemos e oramos uns pelos outros.',
    image: principal1,
  },
  {
    titulo: 'Louvor e',
    destaque: 'Comunhão',
    descricao: 'Louvor simples, em família. Cada um participa com o dom que tem.',
    image: principal4,
  },
  {
    titulo: 'Palavra e',
    destaque: 'Testemunho',
    descricao: 'Contamos o que Deus tem feito na nossa vida e aplicamos a Palavra ao dia a dia.',
    image: principal7,
  },
  {
    titulo: 'Discipulado em',
    destaque: 'Família',
    descricao: 'Crianças, jovens e adultos na mesma casa, aprendendo uns com os outros.',
    image: principal3,
  },
  {
    titulo: 'Missão na',
    destaque: 'Cidade',
    descricao: 'Cada casa é um ponto de partida para alcançar vizinhos, amigos e a cidade.',
    image: principal5,
  },
  {
    titulo: 'Sacerdócio de',
    destaque: 'Todos',
    descricao: 'Jesus é o cabeça da igreja. Não tem plateia: todo mundo participa e serve.',
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
    descricao: 'Uma noite para estudar a Bíblia juntos, conversar e orar uns pelos outros.',
    botao: 'Quero participar',
    link: WHATSAPP.estudo,
  },
  {
    titulo: 'Culto nas Casas',
    quando: 'Sábado · 19h',
    descricao: 'Louvor, Palavra e a Ceia ao redor da mesa, com a família reunida.',
    botao: 'Confirmar presença',
    link: WHATSAPP.culto,
  },
];

// ── Quem somos ─────────────────────────────────────────────────
export const MANIFESTO = [
  'Nós nos reunimos em casas, ao redor da mesa. Lemos a Bíblia, oramos, cantamos, comemos juntos e cuidamos uns dos outros durante a semana.',
  'Cada casa também é lugar de missão. Convidamos vizinhos, amigos e colegas de trabalho, e muita gente conhece Jesus ali, na sala de alguém.',
  'Queremos uma igreja simples, que qualquer pessoa consiga viver e levar para outra casa, outro bairro e outra cidade.',
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
    resumo: 'Começamos em uma casa, em Campina Grande, e seguimos simples de propósito.',
    itens: [
      'Comunhão ao redor da mesa',
      'Discipulado orgânico que acompanha histórias reais',
      'Missão encarnada no cotidiano',
    ],
  },
  {
    tag: 'Propósito',
    titulo: 'Para onde estamos indo',
    resumo: 'Queremos ver novas igrejas nas casas começando em outros bairros e cidades.',
    itens: [
      'Discípulos que fazem discípulos (2 Timóteo 2:2)',
      'Casas abertas para servir o bairro',
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
    texto: 'A casa continua sendo casa. A igreja são as pessoas que se reúnem ali.',
  },
  {
    titulo: 'Não é uma denominação.',
    texto: 'Nenhuma instituição é dona das casas. A relação entre nós é de família.',
  },
  {
    titulo: 'Não é uma reação contra outras igrejas.',
    texto: 'Queremos andar junto com as outras igrejas da cidade. Somos todos o mesmo Corpo de Cristo.',
  },
];

// ── Valores: práticas e vida da igreja ─────────────────────────
type Item = { titulo: string; descricao: string };

export const CINCO_MOTIVOS: Item[] = [
  { titulo: 'Adoração', descricao: 'Jesus no centro de cada encontro, na Palavra, na oração e no louvor.' },
  { titulo: 'Comunhão', descricao: 'Mesa aberta e vida compartilhada. Ninguém segue Jesus sozinho.' },
  { titulo: 'Discipulado', descricao: 'Aprender juntos a obedecer Jesus no dia a dia, ensinando uns aos outros.' },
  { titulo: 'Serviço', descricao: 'Cada um serve com o dom que recebeu, dentro e fora de casa.' },
  { titulo: 'Evangelismo', descricao: 'Falar de Jesus para quem ainda não conhece, começando pela vizinhança.' },
];

export const CINCO_MOTIVOS_DESTAQUE =
  'Numa igreja na casa, cada pessoa faz falta. Como somos poucos em cada casa, estar no encontro é prioridade.';

export const VIDA_DA_IGREJA: Item[] = [
  { titulo: 'Igreja na casa', descricao: 'Reunimo-nos prioritariamente em lares, recuperando o modelo neotestamentário e relacional dos primeiros discípulos.' },
  { titulo: 'Ceia ao redor da mesa', descricao: 'Celebramos a Ceia como uma refeição de verdade, em memória de Cristo e olhando para o banquete do Reino.' },
  { titulo: 'Batismo por imersão', descricao: 'Celebramos o batismo de quem professa fé consciente, como festa comunitária e entrada visível no Corpo.' },
  { titulo: 'Discipulado relacional', descricao: 'Cada cristão é discípulo e discipulador, formando outros no convívio diário, e não apenas pela transmissão de conteúdo.' },
  { titulo: 'Sacerdócio de todos', descricao: 'Rejeitamos o clericalismo: cada irmão e irmã tem dom, vocação e responsabilidade no Reino.' },
  { titulo: 'Mutualismo no Reino', descricao: 'Homens e mulheres, criados igualmente à imagem de Deus, podem servir em todas as funções da igreja, conforme os dons recebidos do Espírito.' },
];

// ── Estrutura ──────────────────────────────────────────────────
export const ESTRUTURA_VISAO = {
  paragrafos: [
    'O nome da igreja local não é "Five One". Cada igreja é, antes de tudo, uma igreja na casa. A Rede Five One é a rede dos cinco ministérios de Efésios 4 (apóstolos, profetas, evangelistas, pastores e mestres), que cuidam, acompanham e fortalecem essas casas.',
    'Nós somos a Igreja. Não somos uma denominação, e nenhuma instituição "possui" as casas. A natureza dos vínculos entre nós se parece mais com os de uma família do que com os de uma estrutura institucional: depende de amor, confiança, tempo e longevidade.',
  ],
  versiculo: {
    texto: 'Permaneçam firmes e apeguem-se às tradições que ensinamos a vocês, quer por palavra, quer por carta nossa.',
    referencia: '2 Tessalonicenses 2.15',
  },
  itens: [
    { titulo: 'Igreja é gente, não local', descricao: 'A casa não vira "templo" porque a igreja se reúne nela. Quem é Igreja é o povo de Deus reunido por Cristo.' },
    { titulo: 'Cinco ministérios juntos', descricao: 'Apóstolos, profetas, evangelistas, pastores e mestres servindo juntos. A igreja não depende de uma pessoa só.' },
    { titulo: 'Vínculos relacionais', descricao: 'Acompanhamento de família, não de organização: caminhar próximo, com amor e tempo.' },
    { titulo: 'Unidade com a Igreja', descricao: 'Lutamos contra o "nós contra eles" e pela unidade com outras igrejas locais e com o Corpo de Cristo na cidade.' },
  ],
  destaque: 'A Rede Five One é só uma das muitas expressões boas e fiéis da igreja de Jesus.',
};

/** Círculos de cuidado — da casa para a rede (Confissão de Fé, Parte II, d). */
export const CIRCULOS = [
  { titulo: 'Igreja na casa', subtitulo: 'onde a vida acontece', texto: 'Uma igreja pequena, com até umas vinte pessoas, que se reúne ao redor da mesa.' },
  { titulo: 'Casal de presbíteros', subtitulo: 'pastoreia a casa', texto: 'Cada igreja na casa é cuidada por um casal de presbíteros, que pastoreia a vida cotidiana da comunidade e forma novos líderes para a multiplicação.' },
  { titulo: 'Comunhão de presbíteros', subtitulo: 'caminham juntos', texto: 'A liderança é plural: os presbíteros das diversas casas caminham juntos no contexto da rede, em comunhão constante.' },
  { titulo: 'Cinco ministérios', subtitulo: 'cuidam da rede', texto: 'A rede como um todo é liderada pelos cinco ministérios de Efésios 4, em colaboração constante com os presbíteros das casas.' },
];

export const LIDERANCA = {
  paragrafos: [
    'O modelo neotestamentário não conhece o líder solitário no topo de uma estrutura piramidal. Conhece presbíteros, sempre no plural, que cuidam juntos do rebanho de Deus e são reconhecidos pelo caráter ao longo do tempo (At 14.23; Tt 1.5-9; 1Pe 5.1-4).',
    'Distinguimos cuidadosamente presbítero de pastor. Em Efésios 4.11, pastor é um dos cinco dons ministeriais que Cristo distribuiu à sua Igreja. Um presbítero pode ter o dom de pastor, mas também pode liderar pelo dom de mestre, profeta, evangelista ou apóstolo. Queremos resgatar a pluralidade dos cinco ministérios e abandonar o modelo de "ministério de um homem só".',
  ],
  ministerios: [
    { titulo: 'Apóstolos', descricao: 'Enviados que abrem caminhos, plantam comunidades e cuidam da fidelidade ao evangelho.' },
    { titulo: 'Profetas', descricao: 'Vozes que ouvem a Deus para o presente, exortando, consolando e chamando à conversão.' },
    { titulo: 'Evangelistas', descricao: 'Proclamadores das boas-novas, com paixão e clareza para alcançar os que ainda não creem.' },
    { titulo: 'Pastores', descricao: 'Cuidadores que conhecem cada ovelha pelo nome, alimentando, protegendo e curando.' },
    { titulo: 'Mestres', descricao: 'Guardiões da sã doutrina, que ensinam com fidelidade e profundidade as Escrituras.' },
  ],
  areas: 'Membros servem em finanças, mídia, louvor, Ceia, crianças e no cuidado de quem está passando necessidade.',
};

export const MEMBRESIA = {
  paragrafos: [
    'A membresia formal em uma igreja local não é mera adesão administrativa, mas um pacto de aliança espiritual entre o crente e a comunidade da fé, comprometendo-os mutuamente diante de Deus e uns dos outros (Hb 10.24-25; At 2.42-47).',
    'Para se tornar membro de uma igreja na casa da Rede Five One, a pessoa precisa fazer o curso Bases, que passa pelos fundamentos da fé cristã e pela identidade da rede, e ler a Confissão de Fé junto com os presbíteros.',
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
    'Nosso desejo é multiplicar. Mas a multiplicação só ocorrerá quando identificarmos presbíteros preparados para conduzir uma nova casa. Entendemos pela Escritura que cabe ao ministério apostólico reconhecer presbíteros, e queremos ser fiéis ao texto.',
    'Cada nova casa permanece sob o acompanhamento da Rede e participa de uma reunião geral mensal com as demais igrejas da rede na mesma cidade. Seus presbíteros se reúnem com a liderança da rede em periodicidade aproximada de dois meses, para que a unidade seja preservada.',
  ],
  itens: [
    { titulo: 'Caráter bíblico', descricao: 'Amar a Cristo de todo o coração, com o caráter que a Escritura exige de presbíteros (1Tm 3; Tt 1).' },
    { titulo: 'Vida nos 5 motivos', descricao: 'Participação ativa, constante e colaborativa em adoração, comunhão, discipulado, serviço e evangelismo.' },
    { titulo: 'Confissão acolhida', descricao: 'Conhecer e viver a Confissão de Fé, alinhado com a doutrina e as convicções da rede.' },
    { titulo: 'Comunhão real', descricao: 'Amizade e relacionamento verdadeiro com os presbíteros atuais, para preservar a unidade.' },
    { titulo: 'Conexão entre as casas', descricao: 'Reunião mensal das casas da mesma cidade e contribuição financeira para que a obra continue avançando.' },
  ],
  destaque: 'Cada nova casa separa um valor mensal para a Rede Five One. Esse dinheiro ajuda a abrir novas casas, orfanatos e outros projetos que o Senhor colocar diante de nós.',
};

// ── Encontros (galeria da agenda) ──────────────────────────────
export const ENCONTROS = [
  {
    titulo: 'Estudo Bíblico e',
    destaque: 'Partilha',
    descricao: 'Abrimos a Bíblia juntos, conversamos sobre o que lemos e oramos uns pelos outros.',
    imagens: [encontro1, principal1, principal2, principal3],
  },
  {
    titulo: 'Louvor e',
    destaque: 'Comunhão',
    descricao: 'Louvor simples, em família. Cada um participa com o dom que tem.',
    imagens: [encontro2, principal4, principal5, principal6],
  },
  {
    titulo: 'Palavra e',
    destaque: 'Testemunho',
    descricao: 'Contamos o que Deus tem feito na nossa vida e aplicamos a Palavra ao dia a dia.',
    imagens: [principal7, principal9, principal8, principal1],
  },
  {
    titulo: 'Discipulado em',
    destaque: 'Família',
    descricao: 'Crianças, jovens e adultos na mesma casa, aprendendo uns com os outros.',
    imagens: [encontro4, principal2, principal5, principal8],
  },
];

// ── Presbíteros ────────────────────────────────────────────────
export const PRESBITEROS = {
  foto: presbiterosFoto,
  nomes: 'Marcelo Junior e Suenia Karcia',
  papel: 'Casal de presbíteros',
  texto: [
    'Marcelo e Suenia são casados e abriram a primeira casa da rede em 2025, em Campina Grande.',
    'Hoje cuidam dessa casa como presbíteros e estão formando novos líderes, para que outras casas possam começar.',
  ],
};

// ── Nossa história ─────────────────────────────────────────────
// Rótulos sem data ficam para marcos contínuos; só 2025 é data confirmada.
export const HISTORIA = [
  {
    quando: '2025',
    titulo: 'A primeira casa',
    texto: 'Abrimos a primeira casa em Campina Grande - PB, com um grupo de doze pessoas.',
  },
  {
    quando: '2025',
    titulo: 'O propósito',
    texto: 'Desde o começo, o propósito é espalhar a visão de igreja nas casas por todo o Brasil, multiplicando igrejas nas casas.',
  },
  {
    quando: 'Toda semana',
    titulo: 'Os encontros',
    texto: 'Estudo bíblico na sexta e culto no sábado, sempre às 19h. A Ceia é feita ao redor da mesa, como uma refeição.',
  },
  {
    quando: 'Liderança',
    titulo: 'Os presbíteros',
    texto: 'Marcelo Junior e Suenia Karcia cuidam da casa como presbíteros e estão formando novos líderes.',
  },
  {
    quando: 'O que cremos',
    titulo: 'A Confissão de Fé',
    texto: 'Colocamos por escrito o que cremos e como vivemos como igreja. Quem quer ser membro lê a Confissão junto com os presbíteros.',
  },
  {
    quando: 'Hoje',
    titulo: 'Campina Grande',
    texto: 'Seguimos nos reunindo nas casas de Campina Grande. Quem quiser visitar é bem-vindo.',
  },
  {
    quando: 'Adiante',
    titulo: 'Mais casas',
    texto: 'Nosso desejo é que cada casa, quando estiver madura, dê origem a outra, e que a rede chegue a outras cidades do Brasil.',
  },
];
