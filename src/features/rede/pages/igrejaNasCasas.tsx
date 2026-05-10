import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { listRedeHouseChurches, RedeHouseChurch } from '../services/redeIgrejas';
import encontro1 from '../../../assets/images/encontro1.jpg';
import encontro2 from '../../../assets/images/encontro2.png';
import encontro3 from '../../../assets/images/encontro1.jpg';
import encontro4 from '../../../assets/images/encontro4.jpg';
import principal1 from '../assets/image/principal/20250715_215515(0).jpeg';
import principal2 from '../assets/image/principal/AirBrush_20250625220548.jpeg';
import principal3 from '../assets/image/principal/AirBrush_20250703233528.jpeg';
import principal4 from '../assets/image/principal/AirBrush_20250703233640.jpeg';
import principal5 from '../assets/image/principal/img_0274.jpg';
import principal6 from '../assets/image/principal/img_0352.jpg';
import principal7 from '../assets/image/principal/img_0469.jpg';
import principal8 from '../assets/image/principal/img_9291.jpg';
import principal9 from '../assets/image/principal/img_9375.jpg';
import './igrejaNasCasas.css';
import redeLogo from '../assets/image/logoRedeIgrejas/Post para Instagram Parabéns Aniversário Azul e Branco Divertido Moderno.png?url';

// Hero slideshow — imagens convertidas para JPEG
const _heroMods = import.meta.glob<{ default: string }>(
  '../assets/image/principal/Imagens_Header/converted/*.jpg',
  { eager: true },
);
const HERO_IMAGES: string[] = Object.values(_heroMods).map((m) => m.default);

type IgrejaInfo = {
  cidade: string;
  estado: string;
  nome: string;
  endereco: string;
  linkMaps: string;
  linkMapsEmbed: string;
  bairro: string;
  lider: string;
  telefone: string;
};

const igrejas: IgrejaInfo[] = [
  {
    cidade: 'Campina Grande',
    estado: 'PB',
    nome: 'Igreja Casas Catolé',
    endereco: 'Catolé, Campina Grande - PB',
    linkMaps: 'https://www.google.com/maps/place/Igreja+Casas+Católé/@-7.2371273,-35.9068963,17z',
    linkMapsEmbed: 'https://www.google.com/maps/d/embed?mid=1wd8qIMzPhFLIkd7rjLhV9dK6WZ7fwc4',
    bairro: 'Catolé',
    lider: 'Marcelo Junior',
    telefone: '+55 (83) 98718-1731',
  },
];


const valores = [
  {
    icon: '📖',
    titulo: 'Estudo Bíblico e Partilha',
    descricao: 'Mesa aberta para mergulhar na Palavra, ouvir testemunhos e orar uns pelos outros.',
    image: principal1,
  },
  {
    icon: '🎵',
    titulo: 'Louvor e Comunhão',
    descricao: 'Adoração simples, família reunida e dons em movimento em cada casa.',
    image: principal4,
  },
  {
    icon: '✝️',
    titulo: 'Palavra e Testemunho',
    descricao: 'Compartilhamos experiências reais, aplicamos o Evangelho e celebramos milagres.',
    image: principal7,
  },
  {
    icon: '🏠',
    titulo: 'Discipulado em Família',
    descricao: 'Casas acolhedoras onde cada geração encontra lugar e propósito no Reino.',
    image: principal3,
  },
  {
    icon: '🌍',
    titulo: 'Missão na Cidade',
    descricao: 'Vemos a cidade como campo missionário e as casas como base de envio.',
    image: principal5,
  },
  {
    icon: '👑',
    titulo: 'Sacerdócio de Todos',
    descricao: 'Cristo como cabeça. Todos participam, todos servem, todos crescem.',
    image: principal2,
  },
];

const manifestoCards = [
  {
    tag: 'Visão',
    titulo: 'O que acreditamos',
    resumo: 'Cremos que a igreja é gente reunida pelo Espírito para viver e manifestar o Reino no dia a dia.',
    detalhes: [
      'Somos um corpo vivo de discípulos que compartilham comunhão, discipulado e missão em lares abertos.',
    ],
    itens: [
      'Cristo como o cabeça da Igreja (Colossenses 1:18)',
      'O sacerdócio de todos os santos (1 Pedro 2:9)',
      'Casas como lugares de comunhão, ensino e missão (Romanos 16:3-5)',
    ],
    quote: {
      text: '"O novo movimento de igrejas precisa de menos púlpitos e mais mesas, menos plateias e mais comunidades."',
      author: 'Wolfgang Simson',
    },
  },
  {
    tag: 'Missão',
    titulo: 'Onde estamos hoje',
    resumo: 'Começamos em uma casa, cultivando fé, comunhão, discipulado e missão com simplicidade intencional.',
    detalhes: [
      'Cada encontro abre espaço para partilha, intercessão e envio — Cristo no centro e todos participando.',
    ],
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
    detalhes: [
      'Cada casa é uma mesa de comunhão; cada discípulo, um sacerdote em movimento.',
    ],
    itens: [
      'Discípulos que fazem discípulos (2 Timóteo 2:2)',
      'Casas como centros de glória e serviço',
      'Cada cristão vivendo seu dom com ousadia (Efésios 4:7-16)',
    ],
    quote: {
      text: '"A igreja não está morrendo. Ela está se movendo. De volta às casas."',
      author: 'Alan Hirsch',
    },
  },
];

type EstruturaTab = {
  id: string;
  label: string;
  eyebrow: string;
  titulo: string;
  paragrafos: string[];
  versiculo?: { texto: string; referencia: string };
  itens?: { titulo: string; descricao: string }[];
  destaque?: string;
  imagem: string;
};

const estruturaTabs: EstruturaTab[] = [
  {
    id: 'visao',
    label: 'Visão Geral',
    eyebrow: 'Rede de igrejas nas casas',
    titulo: 'Cinco ministérios cuidando das casas',
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
    imagem: principal3,
  },
  {
    id: 'lideranca',
    label: 'Liderança',
    eyebrow: 'Liderança plural sob o Sumo Pastor',
    titulo: 'Presbíteros e os cinco dons ministeriais',
    paragrafos: [
      'O modelo neotestamentário não conhece o líder solitário no topo de uma estrutura piramidal. Conhece, sim, presbíteros — sempre no plural — que cuidam juntos do rebanho de Deus, reconhecidos pelo caráter antes da capacidade, ao longo do tempo (At 14.23; Tt 1.5-9; 1Pe 5.1-4).',
      'Distinguimos cuidadosamente presbítero de pastor. Em Efésios 4.11, pastor é um dos cinco dons ministeriais que Cristo distribuiu à sua Igreja. Um presbítero pode ter o dom de pastor — mas também pode liderar pelo dom de mestre, profeta, evangelista ou apóstolo. Queremos resgatar a pluralidade dos cinco ministérios e abandonar o modelo de "ministério de um homem só".',
    ],
    itens: [
      { titulo: 'Apóstolos', descricao: 'Enviados que abrem caminhos, plantam comunidades e cuidam da fidelidade ao evangelho.' },
      { titulo: 'Profetas', descricao: 'Vozes que ouvem a Deus para o presente, exortando, consolando e chamando à conversão.' },
      { titulo: 'Evangelistas', descricao: 'Proclamadores das boas-novas, com paixão e clareza para alcançar os que ainda não creem.' },
      { titulo: 'Pastores', descricao: 'Cuidadores que conhecem cada ovelha pelo nome, alimentando, protegendo e curando.' },
      { titulo: 'Mestres', descricao: 'Guardiões da sã doutrina, que ensinam com fidelidade e profundidade as Escrituras.' },
      { titulo: 'Áreas que servem o corpo', descricao: 'Equipes de membros que servem em finanças, mídia, louvor, ceia, departamento infantil e prospecção de necessidades — para que cada casa funcione como família espiritual viva.' },
    ],
    destaque: 'Cada igreja na casa é liderada por uma equipe plural de presbíteros, e não por um único líder. Liderar é servir aqueles que compartilham o mesmo dom.',
    imagem: principal2,
  },
  {
    id: 'vida',
    label: 'Vida da Igreja',
    eyebrow: 'Como vivemos como igreja',
    titulo: 'Casas, mesa, dons e discipulado',
    paragrafos: [
      'A igreja nas casas não é uma estratégia de crescimento nem uma reação contra estruturas maiores. É uma convicção: a casa é o ambiente mais natural para a formação de discípulos. Em torno da mesa, ninguém é plateia. A Palavra é compartilhada, as crianças participam, os fardos são divididos, o pão e o vinho lembram o sacrifício de Cristo, e a hospitalidade se torna serviço de adoração.',
      'Cremos que os dons espirituais permanecem plenamente ativos hoje, distribuídos pelo Espírito Santo segundo sua vontade soberana. Damos espaço para o exercício dos dons em nossas reuniões, com ordem e edificação — rejeitando tanto o cessacionismo quanto o sensacionalismo (1Co 12; 14.40).',
    ],
    itens: [
      { titulo: 'Igreja na casa', descricao: 'Reunimo-nos prioritariamente em lares, recuperando o modelo neotestamentário e relacional dos primeiros discípulos.' },
      { titulo: 'Ceia ao redor da mesa', descricao: 'Celebramos a Ceia como refeição comunitária autêntica, não como rito isolado — em memória de Cristo e antecipando o banquete do Reino.' },
      { titulo: 'Batismo por imersão', descricao: 'Celebramos o batismo de quem professa fé consciente, como festa comunitária e entrada visível no Corpo.' },
      { titulo: 'Discipulado relacional', descricao: 'Cada cristão é discípulo e discipulador, formando outros no convívio diário, e não apenas pela transmissão de conteúdo.' },
      { titulo: 'Sacerdócio de todos', descricao: 'Rejeitamos o clericalismo: cada irmão e irmã tem dom, vocação e responsabilidade no Reino.' },
      { titulo: 'Mutualismo no Reino', descricao: 'Homens e mulheres, criados igualmente à imagem de Deus, podem servir em todas as funções da igreja, conforme os dons recebidos do Espírito.' },
    ],
    imagem: principal1,
  },
  {
    id: 'motivos',
    label: '5 Motivos',
    eyebrow: 'Por que nos encontramos',
    titulo: 'Os cinco motivos do encontro',
    paragrafos: [
      'Cada encontro existe para que permaneçamos firmes nos cinco motivos pelos quais a igreja se reúne — não como agenda, mas como vida compartilhada ao redor da mesa, na presença do Espírito Santo.',
    ],
    itens: [
      { titulo: 'Adoração', descricao: 'Cristo no centro de cada encontro — em palavra, oração e canto, dirigida ao Pai, por meio do Filho, no Espírito.' },
      { titulo: 'Comunhão', descricao: 'Mesa aberta, vidas conectadas, presença real entre irmãos. Não há cristianismo solitário.' },
      { titulo: 'Discipulado', descricao: 'Aprender a obedecer a Jesus juntos, no cotidiano — ensinando uns aos outros tudo o que Ele ordenou.' },
      { titulo: 'Serviço', descricao: 'Cada um servindo com o dom que recebeu, dentro e fora da casa, em sacerdócio real.' },
      { titulo: 'Evangelismo', descricao: 'A casa como base de envio para o bairro, a cidade e os povos — porque Cristo é o único Mediador.' },
    ],
    destaque: 'Em uma igreja na casa, cada membro faz muita falta. Como a proposta é sermos menos em número, a presença de cada um pesa muito — o nosso encontro é prioridade.',
    imagem: principal4,
  },
  {
    id: 'membresia',
    label: 'Membresia',
    eyebrow: 'Pacto comunitário',
    titulo: 'Membresia é aliança, não cadastro',
    paragrafos: [
      'A membresia formal em uma igreja local não é mera adesão administrativa, mas um pacto de aliança espiritual entre o crente e a comunidade da fé, comprometendo-os mutuamente diante de Deus e uns dos outros (Hb 10.24-25; At 2.42-47).',
      'Para se tornar membro de uma igreja na casa da Rede Five One, a pessoa precisa concluir o curso Bases — onde percorre os fundamentos da fé cristã e nossa identidade como rede — e ler esta Confissão de Fé junto com os presbíteros, acolhendo-a como sua.',
    ],
    itens: [
      { titulo: 'Submissão mútua', descricao: 'Viver em aliança fraterna com os demais irmãos (Ef 4.1-3; Hb 10.24-25).' },
      { titulo: 'Participação ativa', descricao: 'Estar nas reuniões, ministérios e expressões da comunidade (1Co 14.26; At 2.42).' },
      { titulo: 'Missão e discipulado', descricao: 'Assumir o chamado de fazer discípulos e servir com amor, dentro e fora da igreja (Mt 28.19-20).' },
      { titulo: 'Generosidade alegre', descricao: 'Sustentar a missão do Reino e cuidar dos necessitados com simplicidade e administração sábia (At 2.44-45; 2Co 9.7).' },
      { titulo: 'Cuidado pastoral', descricao: 'Receber o cuidado dos presbíteros e dos cinco ministérios, acolhendo correção amorosa quando necessário (Hb 13.17; 1Pe 5.1-5).' },
    ],
    imagem: principal7,
  },
  {
    id: 'multiplicacao',
    label: 'Multiplicação',
    eyebrow: 'Como uma nova casa nasce',
    titulo: 'Multiplicar quando estiver maduro',
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
    imagem: principal5,
  },
];

const programacao = [
  {
    titulo: 'Estudo Bíblico nas Casas',
    destaque: 'Sexta-feira · 19h',
    descricao: 'Uma noite para mergulhar na Palavra, partilhar revelações e orar uns pelos outros.',
    botao: 'Quero participar',
    link: 'https://wa.me/5583987181731?text=Olá!%20Vi%20no%20site%20da%20Rede%20Five%20One%20e%20quero%20participar%20do%20estudo%20bíblico%20nas%20casas.%20Quando%20e%20onde%20será%20o%20próximo%20encontro%3F',
  },
  {
    titulo: 'Culto nas Casas',
    destaque: 'Sábado · 19h',
    descricao: 'Celebração com louvor, comunhão e envio missionário direto do coração da família Five One.',
    botao: 'Confirmar presença',
    link: 'https://wa.me/5583987181731?text=Olá!%20Vi%20no%20site%20da%20Rede%20Five%20One%20e%20quero%20confirmar%20presença%20no%20culto%20nas%20casas%20do%20sábado.%20Como%20funciona%3F',
  },
];

const encontros = [
  {
    id: 'estudo',
    titulo: 'Estudo Bíblico e Partilha',
    descricao: 'Mesa aberta para mergulhar na Palavra, ouvir testemunhos e orar uns pelos outros.',
    imagens: [encontro1, principal1, principal2, principal3],
  },
  {
    id: 'louvor',
    titulo: 'Louvor e Comunhão',
    descricao: 'Adoração simples, família reunida e dons em movimento em cada casa.',
    imagens: [encontro2, principal4, principal5, principal6],
  },
  {
    id: 'palavra',
    titulo: 'Palavra e Testemunho',
    descricao: 'Compartilhamos experiências reais, aplicamos o Evangelho e celebramos milagres.',
    imagens: [encontro3, principal7, principal8, principal9],
  },
  {
    id: 'familia',
    titulo: 'Discipulado em Família',
    descricao: 'Casas acolhedoras onde cada geração encontra lugar e propósito no Reino.',
    imagens: [encontro4, principal2, principal5, principal8],
  },
];

const STATIC_STATS = { casasAtivas: 1, bairros: 1, cidades: 1 };

const confissaoPdf = '/assets/pdfs/confissao-de-fe.pdf';
const instagramUrl = 'https://www.instagram.com/redeigrejasfiveone';
const whatsappLink = 'https://wa.me/5583987181731?text=Olá!%20Vim%20pelo%20site%20da%20Rede%20Five%20One%20e%20gostaria%20de%20saber%20mais%20sobre%20as%20igrejas%20nas%20casas.';
const mapaDefaultEmbed = 'https://www.google.com/maps/d/embed?mid=1wd8qIMzPhFLIkd7rjLhV9dK6WZ7fwc4';

const PUBLIC_VISITOR_TOKEN = 'd8a7f3b2-1c0e-4a69-8b95-6f4e3d2c1b0a';
const visitorFormPath = `/rede/cadastro?token=${PUBLIC_VISITOR_TOKEN}`;

const pageLinks = [
  { id: 'manifesto', label: 'Quem somos' },
  { id: 'estrutura', label: 'Estrutura' },
  { id: 'confissao', label: 'Confissão de Fé' },
  { id: 'mapa', label: 'Mapa da Rede' },
  { id: 'programacao', label: 'Programação' },
  { id: 'contato', label: 'Contato' },
];

function CountUp({ end, started, suffix = '' }: { end: number; started: boolean; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started || end === 0) {
      setVal(end);
      return;
    }
    let startTime: number | null = null;
    const duration = 1400;
    const tick = (ts: number) => {
      if (!startTime) startTime = ts;
      const prog = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      setVal(Math.round(eased * end));
      if (prog < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, end]);
  return <>{val}{suffix}</>;
}

const IgrejaNasCasas: React.FC = () => {
  const [estadoSelecionado, setEstadoSelecionado] = useState('');
  const [cidadeSelecionada, setCidadeSelecionada] = useState('');
  const [estruturaTab, setEstruturaTab] = useState<string>(estruturaTabs[0]?.id ?? 'visao');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(pageLinks[0]?.id ?? 'manifesto');
  const [galeriaIndices, setGaleriaIndices] = useState<Record<string, number>>(
    () => Object.fromEntries(encontros.map((item) => [item.id, 0])) as Record<string, number>,
  );
  const [galeriaModal, setGaleriaModal] = useState<{ id: string; index: number } | null>(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [activeHero, setActiveHero] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();
  const [liveHouses, setLiveHouses] = useState<RedeHouseChurch[]>([]);

  useEffect(() => {
    listRedeHouseChurches()
      .then((data) => {
        setLiveHouses(data.filter((h) => !h.status || h.status === 'ativa'));
      })
      .catch(() => {
        // fallback to hardcoded data on error
      });
  }, []);

  const dynamicStats = useMemo(() => {
    if (liveHouses.length > 3) {
      const casasAtivas = liveHouses.length;
      const bairros = new Set(liveHouses.map((h) => h.neighborhood || h.city || '')).size;
      const cidades = new Set(liveHouses.map((h) => h.city || '')).size;
      return { casasAtivas, bairros, cidades };
    }
    return STATIC_STATS;
  }, [liveHouses]);

  useEffect(() => {
    if (HERO_IMAGES.length <= 1) return;
    const t = window.setInterval(() => {
      setActiveHero((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5500);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) { setStatsVisible(true); obs.disconnect(); } },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); }
      }),
      { threshold: 0.07 },
    );
    const targets = document.querySelectorAll<HTMLElement>('.casas-page .reveal');
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const igrejasFiltradas = useMemo(() => {
    if (!estadoSelecionado || !cidadeSelecionada) return [] as IgrejaInfo[];
    return igrejas.filter(
      (igreja) => igreja.estado === estadoSelecionado && igreja.cidade === cidadeSelecionada,
    );
  }, [estadoSelecionado, cidadeSelecionada]);

  const cidadesDisponiveis = useMemo(
    () => [...new Set(
      igrejas
        .filter((igreja) => !estadoSelecionado || igreja.estado === estadoSelecionado)
        .map((igreja) => igreja.cidade),
    )],
    [estadoSelecionado],
  );

  const igrejaSelecionada = igrejasFiltradas[0];
  const mapaLink = igrejaSelecionada?.linkMapsEmbed || mapaDefaultEmbed;

  useEffect(() => {
    if (galeriaModal) return;
    const interval = window.setInterval(() => {
      setGaleriaIndices((prev) => {
        const next = { ...prev };
        encontros.forEach((item) => {
          if (item.imagens.length > 0) {
            const current = prev[item.id] ?? 0;
            next[item.id] = (current + 1) % item.imagens.length;
          }
        });
        return next;
      });
    }, 4500);
    return () => window.clearInterval(interval);
  }, [galeriaModal]);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth > 760) setIsNavOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (galeriaModal) return;
    if (typeof document === 'undefined') return;
    const shouldLock = isNavOpen && window.innerWidth <= 760;
    document.body.style.overflow = shouldLock ? 'hidden' : '';
    return () => { if (!galeriaModal) document.body.style.overflow = ''; };
  }, [isNavOpen, galeriaModal]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const sectionIds = pageLinks.map((item) => item.id);
    let ticking = false;
    const updateActiveSection = () => {
      ticking = false;
      const header = document.querySelector<HTMLElement>('.page-strip-wrapper');
      const headerOffset = header?.getBoundingClientRect().height ?? 0;
      const scrollPosition = window.scrollY + headerOffset + 40;
      let currentId = sectionIds[0];
      sectionIds.forEach((id) => {
        const section = document.getElementById(id);
        if (!section) return;
        if (scrollPosition >= section.offsetTop) currentId = id;
      });
      setActiveSection((prev) => (prev === currentId ? prev : currentId));
    };
    const handleScroll = () => {
      if (!ticking) { ticking = true; window.requestAnimationFrame(updateActiveSection); }
    };
    updateActiveSection();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const header = document.querySelector<HTMLElement>('.page-strip-wrapper');
    const isMobile = window.matchMedia('(max-width: 760px)').matches;
    const headerOffset = !isMobile ? header?.getBoundingClientRect().height ?? 0 : 0;
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (pageLinks[0]?.id) setActiveSection(pageLinks[0].id);
      return;
    }
    const el = document.getElementById(sectionId);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offset = window.pageYOffset + rect.top - headerOffset - (isMobile ? 6 : 12);
    window.scrollTo({ top: Math.max(offset, 0), behavior: 'smooth' });
    setActiveSection(sectionId);
  };

  const handleNavigate = (sectionId: string) => {
    if (isNavOpen) {
      setIsNavOpen(false);
      if (typeof document !== 'undefined') document.body.style.overflow = '';
    }
    if (typeof window === 'undefined') { scrollToSection(sectionId); return; }
    const isMobile = window.matchMedia('(max-width: 760px)').matches;
    if (isMobile) { window.setTimeout(() => scrollToSection(sectionId), 220); }
    else { scrollToSection(sectionId); }
  };

  const openGaleriaModal = (itemId: string, startIndex = 0) => {
    setGaleriaModal({ id: itemId, index: startIndex });
    if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
  };

  const closeGaleriaModal = () => {
    setGaleriaModal(null);
    if (typeof document !== 'undefined') document.body.style.overflow = '';
  };

  const navigateGaleriaModal = (direction: 1 | -1) => {
    setGaleriaModal((prev) => {
      if (!prev) return prev;
      const item = encontros.find((enc) => enc.id === prev.id);
      if (!item) return prev;
      const total = item.imagens.length;
      const nextIndex = (prev.index + direction + total) % total;
      return { id: prev.id, index: nextIndex };
    });
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!galeriaModal) return;
      if (event.key === 'Escape') closeGaleriaModal();
      else if (event.key === 'ArrowLeft') navigateGaleriaModal(-1);
      else if (event.key === 'ArrowRight') navigateGaleriaModal(1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [galeriaModal]);

  return (
    <div className="casas-page" id="top">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className={`page-strip-wrapper${headerScrolled ? ' is-scrolled' : ''}`}>
        <div className="page-strip">
          <button
            type="button"
            className="page-strip__brand"
            onClick={() => handleNavigate('top')}
            aria-label="Voltar ao início"
          >
            <img src={redeLogo} alt="Rede de Igrejas nas Casas Five One" className="page-strip__logo" />
          </button>
          <nav id="page-strip-nav" className={`page-strip__nav${isNavOpen ? ' is-open' : ''}`}>
            {pageLinks.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`page-strip__link${activeSection === item.id ? ' page-strip__link--active' : ''}`}
                aria-current={activeSection === item.id ? 'page' : undefined}
                onClick={() => handleNavigate(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="page-strip__actions">
            <Link to={visitorFormPath} className="page-strip__cta">
              Faça Parte da Rede
            </Link>
            <button
              type="button"
              className={`page-strip__toggle${isNavOpen ? ' is-open' : ''}`}
              onClick={() => setIsNavOpen((prev) => !prev)}
              aria-expanded={isNavOpen}
              aria-controls="page-strip-nav"
            >
              <span className="page-strip__toggle-line" />
              <span className="page-strip__toggle-line" />
              <span className="page-strip__toggle-line" />
              <span className="sr-only">{isNavOpen ? 'Fechar menu' : 'Abrir menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-slides" aria-hidden="true">
          {HERO_IMAGES.map((src, i) => (
            <div key={src} className={`hero-slide${i === activeHero ? ' is-active' : ''}`}>
              <img src={src} alt="" loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
            </div>
          ))}
        </div>
        <div className="hero-stage__overlay" />
        <div className="hero-content">
          <span className="hero-badge">Rede Five One</span>
          <h1>
            Rede de <span>Igrejas nas Casas</span>
          </h1>
          <p>
            Um movimento que transforma lares em centros de comunhão, discipulado e missão — bairro a bairro.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to={visitorFormPath}>
              Quero Visitar Uma Casa
            </Link>
            <button className="btn ghost" type="button" onClick={() => scrollToSection('mapa')}>
              Ver mapa da rede →
            </button>
          </div>
        </div>
        {dynamicStats.casasAtivas > 1 ? (
          <div className="hero-stats-bar" ref={statsRef}>
            <div>
              <strong><CountUp end={dynamicStats.casasAtivas} started={statsVisible} /></strong>
              <span>Casas ativas</span>
            </div>
            <div>
              <strong><CountUp end={dynamicStats.bairros} started={statsVisible} /></strong>
              <span>Bairros</span>
            </div>
            <div>
              <strong><CountUp end={dynamicStats.cidades} started={statsVisible} /></strong>
              <span>Cidades</span>
            </div>
          </div>
        ) : (
          <div className="hero-facts-bar" ref={statsRef}>
            <div>
              <strong>2025</strong>
              <span>Fundada</span>
            </div>
            <div>
              <strong>Campina Grande — PB</strong>
              <span>Cidade ativa</span>
            </div>
            <div>
              <strong>Igreja nas Casas</strong>
              <span>Modelo</span>
            </div>
          </div>
        )}
      </section>

      {/* ── Valores ────────────────────────────────────────── */}
      <section className="valores">
        <div className="valores-inner">
          <div className="section-head reveal">
            <span className="section-label">Nossos Valores</span>
            <h2>O que fazemos quando nos encontramos?</h2>
            <p>Os princípios que guiam cada encontro, cada mesa e cada discipulado na Rede Five One.</p>
          </div>
          <div className="valores-grid">
            {valores.map((v, i) => (
              <div
                key={v.titulo}
                className={`valor-card reveal reveal-d${Math.min(i + 1, 6)}`}
              >
                <h3>{v.titulo}</h3>
                <p>{v.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quem Somos ─────────────────────────────────────── */}
      <section className="manifesto" id="manifesto">
        <div className="manifesto-layout">
          <div className="manifesto-text reveal">
            <h2>Quem somos</h2>
            <p>
              Somos uma rede de discípulos que abre lares para viver o Evangelho com simplicidade, participação e
              presença do Espírito Santo em cada encontro.
            </p>
            <p>
              Vemos cada casa como campo de missão — lugar onde Cristo é anunciado, dons são ativados e famílias
              espirituais florescem bairro a bairro.
            </p>
            <p>
              Caminhamos próximos uns dos outros, conectados por uma mesma visão bíblica: uma comunidade simples,
              perseverante e fiel, capaz de florescer em qualquer cultura até a volta de Cristo.
            </p>
          </div>
          <div className="manifesto-photo reveal reveal-d2">
            <img src={principal3} alt="Rede de Igrejas nas Casas Five One — comunidade" loading="lazy" decoding="async" />
          </div>
        </div>
        <div className="pilares-row">
          {manifestoCards.map((card, i) => (
            <article key={card.titulo} className={`pilar-card reveal reveal-d${Math.min(i + 1, 3)}`}>
              <header>
                <span>{card.tag}</span>
                <h3>{card.titulo}</h3>
              </header>
              <div className="pilar-card__body">
                <p>{card.resumo}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Estrutura (Identidade) ─────────────────────────── */}
      <section className="estrutura" id="estrutura">
        <div className="estrutura-inner">
          <div className="section-head reveal">
            <span className="section-label">Identidade e estrutura</span>
            <h2>Como funciona a Rede Five One</h2>
            <p>
              Em todo relacionamento sério, é preciso ser claro sobre intenções, caminhos e expectativas. Aqui está,
              em resumo, o que significa fazer parte da Rede Five One — bairro a bairro, casa a casa.
            </p>
          </div>

          <div className="estrutura-tabs reveal" role="tablist" aria-label="Estrutura da Rede Five One">
            {estruturaTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={estruturaTab === tab.id}
                aria-controls={`estrutura-panel-${tab.id}`}
                id={`estrutura-tab-${tab.id}`}
                className={`estrutura-tab${estruturaTab === tab.id ? ' is-active' : ''}`}
                onClick={() => setEstruturaTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {estruturaTabs.map((tab) => {
            const isActive = estruturaTab === tab.id;
            return (
              <div
                key={tab.id}
                id={`estrutura-panel-${tab.id}`}
                role="tabpanel"
                aria-labelledby={`estrutura-tab-${tab.id}`}
                hidden={!isActive}
                className="estrutura-panel"
              >
                <div className="estrutura-panel__hero">
                  <img src={tab.imagem} alt="" loading="lazy" decoding="async" />
                  <div className="estrutura-panel__hero-shade" />
                  <div className="estrutura-panel__hero-content">
                    <span className="estrutura-panel__eyebrow">{tab.eyebrow}</span>
                    <h3>{tab.titulo}</h3>
                  </div>
                </div>

                <div className="estrutura-panel__body">
                  <div className="estrutura-panel__lead">
                    {tab.paragrafos.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                    {tab.versiculo && (
                      <blockquote className="estrutura-panel__verse">
                        <p>“{tab.versiculo.texto}”</p>
                        <cite>— {tab.versiculo.referencia}</cite>
                      </blockquote>
                    )}
                  </div>

                  {tab.itens && tab.itens.length > 0 && (
                    <ul className="estrutura-panel__items">
                      {tab.itens.map((item) => (
                        <li key={item.titulo}>
                          <strong>{item.titulo}</strong>
                          <span>{item.descricao}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {tab.destaque && (
                    <div className="estrutura-panel__callout">
                      <span>Em destaque</span>
                      <p>{tab.destaque}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Quote Highlight ────────────────────────────────── */}
      <section className="quote-highlight">
        <div className="quote-highlight-inner">
          <span className="quote-highlight-label reveal">Rede de Igrejas nas Casas — Five One</span>
          <blockquote className="reveal">
            Menos púlpitos e mais mesas, para que cada bairro experimente a igreja viva dentro de casa.
          </blockquote>
          <div className="quote-highlight-secondary reveal">
            <p>"A igreja não está morrendo. Ela está se movendo. De volta às casas."</p>
            <cite>Alan Hirsch</cite>
          </div>
        </div>
      </section>

      {/* ── Confissão de Fé ────────────────────────────────── */}
      <section className="confissao" id="confissao">
        <div className="confissao-inner">
          <div className="confissao-copy reveal">
            <h2>Confissão de Fé Five One</h2>
            <p>
              Nossa rede caminha alicerçada nas Escrituras. Leia a Confissão de Fé Five One e conheça os fundamentos
              que guardam a nossa doutrina, a nossa prática ministerial e o compromisso com uma igreja que vive a verdade
              em amor.
            </p>
          </div>
          <div className="confissao-card reveal reveal-d2">
            <div className="confissao-badge">Documento oficial</div>
            <h3>Baixe a nossa Confissão de Fé</h3>
            <p>
              Um guia em PDF para líderes, casas e membros estudarem juntos os fundamentos que sustentam a Rede de
              Igrejas nas Casas.
            </p>
            <a className="btn primary" href={confissaoPdf} download>
              Baixar Confissão de Fé
            </a>
          </div>
        </div>
      </section>

      {/* ── Galeria ────────────────────────────────────────── */}
      <section className="galeria" id="galeria">
        <div className="galeria-inner">
          <div className="section-head reveal">
            <h2>Como são nossos encontros</h2>
            <p>Momentos reais da Rede: mesa posta, louvor em família e histórias transformadas pelo Evangelho.</p>
          </div>
          <div className="galeria-grid">
            {encontros.map((encontro, i) => {
              const activeIndex = galeriaIndices[encontro.id] ?? 0;
              const activeImage = encontro.imagens[activeIndex];
              return (
                <button
                  key={encontro.id}
                  type="button"
                  className={`galeria-card reveal reveal-d${Math.min(i + 1, 4)}`}
                  onClick={() => openGaleriaModal(encontro.id, activeIndex)}
                >
                  <div className="galeria-card__media">
                    <img
                      src={activeImage}
                      alt={`${encontro.titulo} - encontro ${activeIndex + 1}`}
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 760px) 48vw, 300px"
                    />
                    <div className="galeria-card__shade" />
                  </div>
                  <div className="galeria-card__content">
                    <h3>{encontro.titulo}</h3>
                    <p>{encontro.descricao}</p>
                    <div className="galeria-card__dots" aria-hidden>
                      {encontro.imagens.map((_, idx) => (
                        <span key={idx} className={idx === activeIndex ? 'active' : ''} />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Programação ────────────────────────────────────── */}
      <section className="programacao" id="programacao">
        <div className="programacao-inner">
          <div className="section-head reveal">
            <h2>Agenda Five One</h2>
            <p>Encontros que sustentam a vida da rede e formam discípulos missionais.</p>
          </div>
          <div className="programacao-grid">
            {programacao.map((item, i) => (
              <div key={item.titulo} className={`programacao-card reveal reveal-d${i + 1}`}>
                <div className="card-top">
                  <h3>{item.titulo}</h3>
                  <span>{item.destaque}</span>
                </div>
                <p>{item.descricao}</p>
                <a className="btn outline" href={item.link} target="_blank" rel="noopener noreferrer">
                  {item.botao}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Participe ──────────────────────────────────────── */}
      <section className="participe" id="participe" style={{ backgroundImage: `url(${principal9})` }}>
        <div className="participe-overlay" />
        <div className="participe-inner">
          <div className="participe-content reveal">
            <h2>Entre para a Rede de Igrejas nas Casas</h2>
            <p>
              Quer abrir a sua casa? Deseja encontrar uma família espiritual perto de você? Converse com o nosso time
              e descubra como podemos caminhar juntos.
            </p>
            <div className="participe-actions">
              <Link className="btn primary" to={visitorFormPath}>
                Registrar minha visita
              </Link>
              <a
                className="btn ghost"
                href="https://wa.me/5583987181731?text=Olá!%20Vi%20no%20site%20da%20Rede%20Five%20One%20e%20tenho%20interesse%20em%20abrir%20minha%20casa%20para%20uma%20igreja%20nas%20casas.%20Como%20funciona%3F"
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir minha casa
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mapa ───────────────────────────────────────────── */}
      <section className="mapa" id="mapa">
        <div className="mapa-inner">
          <div className="section-head reveal">
            <h2>Encontre uma Casa</h2>
            <p>
              Use os filtros para localizar uma igreja nas casas próxima de você e entrar em contato com os presbíteros
              locais.
            </p>
          </div>
          <div className="mapa-filtros reveal">
            <label>
              <span>Estado</span>
              <select
                value={estadoSelecionado}
                onChange={(event) => {
                  setEstadoSelecionado(event.target.value);
                  setCidadeSelecionada('');
                }}
              >
                <option value="">Selecione</option>
                <option value="PB">Paraíba</option>
              </select>
            </label>
            <label>
              <span>Cidade</span>
              <select
                value={cidadeSelecionada}
                onChange={(event) => setCidadeSelecionada(event.target.value)}
                disabled={cidadesDisponiveis.length === 0}
              >
                <option value="">Selecione</option>
                {cidadesDisponiveis.map((cidade) => (
                  <option key={cidade} value={cidade}>{cidade}</option>
                ))}
              </select>
            </label>
          </div>
          {estadoSelecionado && cidadeSelecionada && igrejasFiltradas.length > 0 ? (
            <div className="mapa-info">
              <h3>Essas são as casas nesta cidade</h3>
              <ul className="mapa-info__list">
                {igrejasFiltradas.map((igreja) => {
                  const telefoneLimpo = igreja.telefone.replace(/[^+\d]/g, '');
                  return (
                    <li key={igreja.nome} className="mapa-info__item">
                      <div className="mapa-info__item-head">
                        <strong>{igreja.nome}</strong>
                        <span>{igreja.bairro} · {igreja.cidade} — {igreja.estado}</span>
                      </div>
                      <div className="mapa-info__item-body">
                        <span>Presbítero: {igreja.lider}</span>
                        <a href={`tel:${telefoneLimpo}`}>{igreja.telefone}</a>
                        <a href={igreja.linkMaps} target="_blank" rel="noopener noreferrer">
                          Ver rota no Google Maps
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : estadoSelecionado && cidadeSelecionada ? (
            <div className="mapa-info mapa-info--empty">
              <p>Nenhuma casa encontrada nesta cidade. Tente outra localidade.</p>
            </div>
          ) : (
            <div className="mapa-info mapa-info--placeholder">
              <h3>Filtre para encontrar uma casa</h3>
              <p>Escolha um estado e depois uma cidade para listar as casas e entrar em contato com os presbíteros locais.</p>
            </div>
          )}
          <div className="mapa-frame reveal">
            <iframe
              title="Mapa de Igrejas nas Casas"
              src={mapaLink}
              width="100%"
              height="480"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ── Contato ────────────────────────────────────────── */}
      <section className="contato" id="contato">
        <div className="contato-inner">
          <div className="section-head reveal">
            <h2>Fale com a Rede</h2>
            <p>Estamos prontos para caminhar junto com você, sua família e sua casa.</p>
          </div>
          <div className="contato-grid">
            <form
              className="contato-form reveal"
              onSubmit={(event) => {
                event.preventDefault();
                const formEl = event.currentTarget;
                const nome = (formEl.elements.namedItem('nome') as HTMLInputElement)?.value || '';
                const mensagem = (formEl.elements.namedItem('mensagem') as HTMLTextAreaElement)?.value || '';
                const texto = `Olá! Vim do site da Rede Five One.\n\nNome: ${nome}\nMensagem: ${mensagem}`;
                window.open(
                  `https://wa.me/5583987181731?text=${encodeURIComponent(texto)}`,
                  '_blank',
                  'noopener,noreferrer',
                );
              }}
            >
              <label>
                Nome
                <input name="nome" type="text" placeholder="Como podemos te chamar?" required />
              </label>
              <label>
                E-mail
                <input name="email" type="email" placeholder="seuemail@exemplo.com" />
              </label>
              <label>
                Telefone / WhatsApp
                <input name="telefone" type="tel" placeholder="+55 (83) 98718-1731" />
              </label>
              <label>
                Mensagem
                <textarea name="mensagem" rows={4} placeholder="Compartilhe como podemos ajudar." required />
              </label>
              <button type="submit" className="btn primary">
                Enviar pelo WhatsApp
              </button>
            </form>
            <div className="contato-info reveal reveal-d2">
              <div className="info-card">
                <h3>Conexões Rede de Igreja nas Casas</h3>
                <p>
                  Catolé · Campina Grande — PB
                  <br />
                  Rede de Igrejas nas Casas Five One
                </p>
              </div>
              <div className="info-card">
                <span>WhatsApp</span>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  +55 (83) 98718-1731
                </a>
              </div>
              <div className="info-card">
                <span>E-mail</span>
                <a href="mailto:redeigrejasfiveone@gmail.com">redeigrejasfiveone@gmail.com</a>
              </div>
              <div className="info-card">
                <span>Social</span>
                <div className="social-links">
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                    Instagram · @redeigrejasfiveone
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FloatingContacts instagramUrl={instagramUrl} whatsappUrl={whatsappLink} />

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="footer-modern">
        <div className="footer-modern__grid">
          <div className="footer-modern__brand">
            <img src={redeLogo} alt="Rede de Igrejas nas Casas Five One" className="footer-modern__logo" />
            <p>Igrejas simples que abre lares para viver a Palavra, discipular pessoas e servir a cidade com o amor de Cristo.</p>
          </div>
          <div className="footer-modern__column">
            <h4>Contato</h4>
            <ul>
              <li>
                <span>WhatsApp</span>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">+55 (83) 98718-1731</a>
              </li>
              <li>
                <span>E-mail</span>
                <a href="mailto:redeigrejasfiveone@gmail.com">redeigrejasfiveone@gmail.com</a>
              </li>
              <li>
                <span>Endereço</span>
                Catolé · Campina Grande — PB
              </li>
            </ul>
          </div>
          <div className="footer-modern__column">
            <h4>Explore</h4>
            <nav>
              {pageLinks.map((link) => (
                <button
                  key={`footer-${link.id}`}
                  type="button"
                  className="footer-modern__nav-button"
                  onClick={() => handleNavigate(link.id)}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="footer-modern__column">
            <h4>Conecte-se</h4>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
              Instagram · @redeigrejasfiveone
            </a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={{ marginTop: 10 }}>
              WhatsApp
            </a>
          </div>
        </div>
        <div className="footer-modern__bottom">
          <span>© {currentYear} Rede de Igrejas nas Casas — Five One. Todos os direitos reservados.</span>
        </div>
      </footer>

      {/* ── Gallery Modal ───────────────────────────────────── */}
      {galeriaModal && (() => {
        const item = encontros.find((enc) => enc.id === galeriaModal.id);
        if (!item) return null;
        const activeImage = item.imagens[galeriaModal.index];
        return (
          <div
            className="galeria-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Fotos de ${item.titulo}`}
            onClick={(event) => { if (event.target === event.currentTarget) closeGaleriaModal(); }}
          >
            <button type="button" className="galeria-modal__close" onClick={closeGaleriaModal} aria-label="Fechar galeria">
              &times;
            </button>
            <button
              type="button"
              className="galeria-modal__nav galeria-modal__nav--prev"
              onClick={() => navigateGaleriaModal(-1)}
              aria-label="Foto anterior"
            >
              <span>&lsaquo;</span>
            </button>
            <img
              src={activeImage}
              alt={`${item.titulo} — foto ${galeriaModal.index + 1}`}
              className="galeria-modal__image"
              loading="eager"
              decoding="async"
            />
            <button
              type="button"
              className="galeria-modal__nav galeria-modal__nav--next"
              onClick={() => navigateGaleriaModal(1)}
              aria-label="Próxima foto"
            >
              <span>&rsaquo;</span>
            </button>
            <div className="galeria-modal__caption">
              <div className="galeria-modal__caption-text">
                <strong>{item.titulo}</strong>
                <p>{item.descricao}</p>
              </div>
              <span>{galeriaModal.index + 1} / {item.imagens.length}</span>
            </div>
            <div className="galeria-modal__thumbs" role="tablist" aria-label={`Outras fotos de ${item.titulo}`}>
              {item.imagens.map((thumb, idx) => (
                <button
                  key={`${item.id}-${idx}-${thumb}`}
                  type="button"
                  className={`galeria-modal__thumb${idx === galeriaModal.index ? ' is-active' : ''}`}
                  onClick={() => setGaleriaModal({ id: item.id, index: idx })}
                  aria-label={`${item.titulo} foto ${idx + 1}`}
                  aria-selected={idx === galeriaModal.index}
                  role="tab"
                >
                  <img src={thumb} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default IgrejaNasCasas;

function FloatingContacts({ instagramUrl, whatsappUrl }: { instagramUrl: string; whatsappUrl: string }) {
  return (
    <div className="floating-contacts">
      <div className="floating-contacts__fab-group">
        <a
          className="floating-contacts__fab floating-contacts__fab--whatsapp"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Conversar no WhatsApp"
        >
          <WhatsappIcon />
        </a>
        <a
          className="floating-contacts__fab floating-contacts__fab--instagram"
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visitar Instagram"
        >
          <InstagramIcon />
        </a>
      </div>
    </div>
  );
}

function WhatsappIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 2.25c-5.376 0-9.75 4.373-9.75 9.75 0 1.72.45 3.393 1.3 4.883L2.25 21.75l4.984-1.27A9.697 9.697 0 0 0 12 21.75c5.377 0 9.75-4.374 9.75-9.75S17.377 2.25 12 2.25Z" fill="white" opacity="0.2" />
      <path d="M12 4.5a7.5 7.5 0 0 0-6.557 11.245l-.928 3.12 3.165-.912A7.5 7.5 0 1 0 12 4.5Zm4.286 8.739c-.186.529-.961.968-1.314 1.02-.35.053-.8.076-1.296-.08-.3-.096-.686-.223-1.18-.438-2.073-.898-3.422-2.986-3.528-3.123-.105-.137-.842-1.12-.842-2.136 0-1.017.534-1.517.724-1.724.19-.207.418-.258.557-.258.138 0 .28 0 .404.007.129.007.305-.049.477.362.186.434.635 1.503.692 1.612.057.11.095.237.016.383-.076.137-.114.237-.228.365-.114.128-.24.286-.344.384-.114.114-.232.238-.1.466.131.228.585.963 1.257 1.558.865.771 1.595 1.01 1.823 1.123.228.114.362.1.495-.057.133-.155.569-.662.722-.889.152-.228.304-.19.51-.114.207.076 1.341.632 1.57.746.228.114.379.171.434.266.057.095.057.548-.13 1.077Z" fill="white" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4.5" stroke="white" strokeWidth="1.8" opacity="0.8" />
      <circle cx="12" cy="12" r="3.3" stroke="white" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="white" />
    </svg>
  );
}
