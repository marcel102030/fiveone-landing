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
import { destaqueCards as destaqueCardsData } from '../data/igrejaNasCasasHighlights';
import redeLogo from '../assets/image/logoRedeIgrejas/Post para Instagram Parabéns Aniversário Azul e Branco Divertido Moderno.png?url';

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
    linkMaps: 'https://www.google.com/maps/place/Igreja+Casas+Catolé/@-7.2371273,-35.9068963,17z',
    linkMapsEmbed: 'https://www.google.com/maps/d/embed?mid=1wd8qIMzPhFLIkd7rjLhV9dK6WZ7fwc4',
    bairro: 'Catolé',
    lider: 'Marcelo Junior',
    telefone: '+55 (83) 98718-1731',
  },
];

const heroGallery = [
  principal1,
  principal2,
  principal3,
  principal4,
  principal5,
  principal6,
  principal7,
  principal8,
  principal9,
];

const heroImageAlts: Record<string, string> = {
  [principal1]: 'Rede Five One — estudo bíblico em Campina Grande',
  [principal2]: 'Rede Five One — encontro com oração nas casas',
  [principal3]: 'Rede Five One — discipulado ao redor da mesa',
  [principal4]: 'Rede Five One — louvor e comunhão em família',
  [principal5]: 'Rede Five One — celebração missionária nas casas',
  [principal6]: 'Rede Five One — momento de intercessão e envio',
  [principal7]: 'Rede Five One — liderança reunida na casa',
  [principal8]: 'Rede Five One — comunhão intergeracional nas casas',
  [principal9]: 'Rede Five One — discipulado e alegria na rede',
};

const destaqueCards = destaqueCardsData;

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
      text: '“O novo movimento de igrejas precisa de menos púlpitos e mais mesas, menos plateias e mais comunidades.”',
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
      text: '“A igreja não está morrendo. Ela está se movendo. De volta às casas.”',
      author: 'Alan Hirsch',
    },
  },
];

const programacao = [
  {
    titulo: 'Estudo Bíblico nas Casas',
    destaque: 'Terça-feira · 19h',
    descricao: 'Uma noite para mergulhar na Palavra, partilhar revelações e orar uns pelos outros.',
    botao: 'Quero participar',
    link: 'https://wa.me/5583987181731?text=Quero%20participar%20do%20estudo%20bíblico%20nas%20casas',
  },
  {
    titulo: 'Culto nas Casas',
    destaque: 'Sábado · 19h',
    descricao: 'Celebração com louvor, comunhão e envio missionário direto do coração da família Five One.',
    botao: 'Confirmar presença',
    link: 'https://wa.me/5583987181731?text=Quero%20confirmar%20presença%20no%20culto%20nas%20casas',
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

const confissaoPdf = '/assets/pdfs/confissao-de-fe.pdf';
const instagramUrl = 'https://www.instagram.com/redeigrejasfiveone';
const whatsappLink = 'https://wa.me/5583987181731?text=Olá%2C%20vim%20do%20site%20da%20Rede%20de%20Igrejas%20nas%20Casas%20Five%20One';
const whatsappHeroLink = `https://wa.me/5583987181731?text=${encodeURIComponent(
  'Olá! Quero visitar uma casa da Rede de Igrejas nas Casas Five One. Pode me orientar com os próximos passos?',
)}`;
const mapaDefaultEmbed = 'https://www.google.com/maps/d/embed?mid=1wd8qIMzPhFLIkd7rjLhV9dK6WZ7fwc4';

const PUBLIC_VISITOR_TOKEN = 'd8a7f3b2-1c0e-4a69-8b95-6f4e3d2c1b0a';
const visitorFormPath = `/rede/cadastro?token=${PUBLIC_VISITOR_TOKEN}`;

const pageLinks = [
  { id: 'manifesto', label: 'Quem somos' },
  { id: 'confissao', label: 'Confissão de Fé' },
  { id: 'mapa', label: 'Mapa da Rede' },
  { id: 'programacao', label: 'Programação' },
  { id: 'contato', label: 'Contato' },
];

const IgrejaNasCasas: React.FC = () => {
  const [estadoSelecionado, setEstadoSelecionado] = useState('');
  const [cidadeSelecionada, setCidadeSelecionada] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(pageLinks[0]?.id ?? 'manifesto');
  const [galeriaIndices, setGaleriaIndices] = useState<Record<string, number>>(
    () => Object.fromEntries(encontros.map((item) => [item.id, 0])) as Record<string, number>,
  );
  const [galeriaModal, setGaleriaModal] = useState<{ id: string; index: number } | null>(null);
  const heroGridRef = useRef<HTMLDivElement | null>(null);
  const [heroImagesActive, setHeroImagesActive] = useState<boolean>(typeof window === 'undefined');
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
    const source = liveHouses.length > 0 ? liveHouses : igrejas.map((ig) => ({
      id: ig.nome, name: ig.nome, city: ig.cidade, neighborhood: ig.bairro,
      address: ig.endereco, meeting_day: null, meeting_time: null,
      capacity: null, status: 'ativa', presbitero_id: null, presbitero_id_2: null,
      notes: null, whatsapp_group_url: null,
    } as RedeHouseChurch));
    const casasAtivas = source.length;
    const bairros = new Set(source.map((h) => h.neighborhood || h.city || '')).size;
    const cidades = new Set(source.map((h) => h.city || '')).size;
    return { casasAtivas, bairros, cidades };
  }, [liveHouses]);

  const heroHighlights = [
    { label: 'Casas ativas', value: dynamicStats.casasAtivas.toString() },
    { label: 'Bairros', value: dynamicStats.bairros.toString() },
    { label: 'Cidades', value: dynamicStats.cidades.toString() },
  ];

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Quick sanity check in dev to ensure gallery assets are loaded
      // eslint-disable-next-line no-console
      console.debug('[Rede Five One] heroGallery images', heroGallery.length);
    }
  }, []);

  const igrejasFiltradas = useMemo(() => {
    if (!estadoSelecionado || !cidadeSelecionada) return [] as IgrejaInfo[];
    return igrejas.filter(
      (igreja) => igreja.estado === estadoSelecionado && igreja.cidade === cidadeSelecionada,
    );
  }, [estadoSelecionado, cidadeSelecionada]);

  const cidadesDisponiveis = useMemo(
    () =>
      [...new Set(
        igrejas
          .filter((igreja) => !estadoSelecionado || igreja.estado === estadoSelecionado)
          .map((igreja) => igreja.cidade),
      )],
    [estadoSelecionado],
  );

  const igrejaSelecionada = igrejasFiltradas[0];

  const mapaLink = igrejaSelecionada?.linkMapsEmbed || mapaDefaultEmbed;
  const displayedGallery = useMemo(() => {
    if (heroGallery.length === 0) return [] as string[];
    const rotation = heroIndex % heroGallery.length;
    const rotated = [...heroGallery.slice(rotation), ...heroGallery.slice(0, rotation)];
    const tiles: string[] = [];
    const target = 24;
    let idx = 0;
    while (tiles.length < target) {
      tiles.push(rotated[idx % rotated.length]);
      idx += 1;
    }
    return tiles;
  }, [heroIndex]);

  useEffect(() => {
    if (heroGallery.length <= 1) return;
    const id = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroGallery.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const element = heroGridRef.current;
    if (!element) {
      setHeroImagesActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setHeroImagesActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -20% 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

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
    const handleResize = () => {
      if (window.innerWidth > 760) {
        setIsNavOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (galeriaModal) return;
    if (typeof document === 'undefined') return;
    const shouldLock = isNavOpen && window.innerWidth <= 760;
    document.body.style.overflow = shouldLock ? 'hidden' : '';
    return () => {
      if (!galeriaModal) {
        document.body.style.overflow = '';
      }
    };
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
        if (scrollPosition >= section.offsetTop) {
          currentId = id;
        }
      });
      setActiveSection((prev) => (prev === currentId ? prev : currentId));
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateActiveSection);
      }
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
      if (pageLinks[0]?.id) {
        setActiveSection(pageLinks[0].id);
      }
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
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    }

    if (typeof window === 'undefined') {
      scrollToSection(sectionId);
      return;
    }

    const isMobile = window.matchMedia('(max-width: 760px)').matches;
    if (isMobile) {
      window.setTimeout(() => {
        scrollToSection(sectionId);
      }, 220);
    } else {
      scrollToSection(sectionId);
    }
  };

  const openGaleriaModal = (itemId: string, startIndex = 0) => {
    setGaleriaModal({ id: itemId, index: startIndex });
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeGaleriaModal = () => {
    setGaleriaModal(null);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
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
      if (event.key === 'Escape') {
        closeGaleriaModal();
      } else if (event.key === 'ArrowLeft') {
        navigateGaleriaModal(-1);
      } else if (event.key === 'ArrowRight') {
        navigateGaleriaModal(1);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [galeriaModal]);

  return (
    <div className="casas-page" id="top">
      <div className="page-strip-wrapper">
        <div className="page-strip">
          <button
            type="button"
            className="page-strip__brand"
            onClick={() => handleNavigate('top')}
            aria-label="Voltar ao início"
          >
            <img src={redeLogo} alt="Rede de Igrejas nas Casas Five One" className="page-strip__logo" />
          </button>
          <nav id="page-strip-nav" className={`page-strip__nav ${isNavOpen ? 'is-open' : ''}`}>
            {pageLinks.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`page-strip__link ${activeSection === item.id ? 'page-strip__link--active' : ''}`}
                aria-current={activeSection === item.id ? 'page' : undefined}
                onClick={() => handleNavigate(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="page-strip__actions">
            <Link
              to={visitorFormPath}
              className="page-strip__cta"
            >
              FAÇA PARTE DA REDE
            </Link>
            <button
              type="button"
              className={`page-strip__toggle ${isNavOpen ? 'is-open' : ''}`}
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
          <div
            className={`page-strip__overlay ${isNavOpen ? 'is-visible' : ''}`}
            onClick={() => setIsNavOpen(false)}
          />
        </div>
      </div>

      <section className="hero">
        <div className="hero-stage" ref={heroGridRef}>
          <div key={heroIndex} className="hero-grid" aria-hidden>
            {heroImagesActive &&
              displayedGallery.map((foto, index) => (
                <div key={`${foto}-${index}`} className={`hero-grid__item ${index === 0 ? 'active' : ''}`}>
                  <img
                    src={foto}
                    alt={heroImageAlts[foto] || 'Encontro da Rede Five One nas casas'}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    sizes="(max-width: 760px) 70vw, 320px"
                  />
                </div>
              ))}
          </div>
          <div className="hero-stage__overlay" />
        </div>
        <div className="hero-content">
          <span className="hero-badge">Rede Five One</span>
          <h1>
            Rede de <span>Igrejas nas Casas</span>
          </h1>
          <p>
            Um movimento missionário que transforma lares em centros de comunhão, discipulado e envio. Buscamos viver a igreja
            do novo testamento, uma igreja para a cidade, ativando dons e construindo famílias espirituais que alcançam cada bairro.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to={visitorFormPath}>
              Quero Visitar Uma Casa
            </Link>
            <button className="btn ghost" type="button" onClick={() => scrollToSection('mapa')}>
              Encontrar uma casa perto de mim
            </button>
          </div>
          <div className="hero-stats">
            {heroHighlights.map((stat) => (
              <div key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="spotlight" aria-label="Principais caminhos">
        {destaqueCards.map((card) => (
          <article key={card.id} className="spotlight-card" style={{ backgroundImage: `url(${card.imagem})` }}>
            <div className="spotlight-card-overlay">
              <h3>{card.titulo}</h3>
              <p>{card.descricao}</p>
              <Link to={card.path} className="spotlight-link">
                {card.acao}
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="manifesto" id="manifesto">
        <div className="manifesto-text">
          <h2>Quem somos</h2>
          <p>
            Somos uma rede de discípulos que coloca a mesa no centro. Abrimos nossos lares para viver o Evangelho com
            simplicidade, participação e presença do Espírito Santo em cada encontro.
          </p>
          <p>
            Vemos a cidade como campo missionário e as casas como lugares onde Cristo é anunciado, dons são ativados e
            famílias espirituais florescem. Caminhamos próximos uns dos outros, cultivando discipulado que alcança a vida
            real.
          </p>
          <p>
            Somos várias igrejas conectadas por uma mesma visão bíblica: uma comunidade simples, perseverante e fiel, capaz
            de florescer em qualquer cultura até a volta de Cristo. Cada lar abriga uma expressão única dessa família que
            vive, serve e cresce em unidade.
          </p>
          <ul className="manifesto-text__list">
            <li>
              Presbitério e liderança distribuída: cada casa conta com presbíteros próximos e os cinco ministérios em
              movimento, edificando o Corpo em unidade.
            </li>
            <li>
              Descentralização do “lugar santo”: não dependemos de prédios nem de uma casta sacerdotal. Em Cristo, todos os
              santos participam da comunhão, do ensino, da oração e da missão.
            </li>
            <li>
              Comunidades diversas e locais: caminhamos como família espiritual em meio à diversidade de idades, histórias e
              culturas, aprendendo a amar para além das afinidades.
            </li>
          </ul>
          <p>
            A presença de Deus se manifesta onde Cristo é proclamado, a Palavra é honrada e o Espírito Santo conduz. É assim
            que permanecemos fiéis ao Evangelho, multiplicando vida em cada bairro.
          </p>
          <div className="manifesto-text__callout">
            <span>Rede de Igrejas nas Casas - Five One</span>
            <p>Menos púlpitos e mais mesas, para que cada bairro experimente a igreja viva dentro de casa.</p>
          </div>
        </div>
        <div className="pilares-grid">
          {manifestoCards.map((card) => (
            <article key={card.titulo} className="pilar-card">
              <header>
                <span>{card.tag}</span>
                <h3>{card.titulo}</h3>
              </header>
              <div className="pilar-card__body">
                <p>{card.resumo}</p>
                {card.detalhes?.map((texto) => (
                  <p key={texto}>{texto}</p>
                ))}
                {card.itens && (
                  <ul className="pilar-card__list">
                    {card.itens.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {card.quote && (
                  <div className="pilar-card__quote">
                    <p>{card.quote.text}</p>
                    <span>{card.quote.author}</span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="confissao" id="confissao">
        <div className="confissao-copy">
          <h2>Confissão de Fé Five One</h2>
          <p>
            Nossa rede caminha alicerçada nas Escrituras. Leia a Confissão de Fé Five One e conheça os fundamentos que
            guardam a nossa doutrina, a nossa prática ministerial e o compromisso com uma igreja que vive a verdade em
            amor.
          </p>
        </div>
        <div className="confissao-card">
          <div className="confissao-badge">Documento oficial</div>
          <h3>Baixe a nossa Confissão de Fé</h3>
          <p>
            Um guia em PDF para líderes, casas e membros estudarem juntos os fundamentos que sustentam a Rede de Igrejas
            nas Casas.
          </p>
          <a className="btn primary" href={confissaoPdf} download>
            Baixar Confissão de Fé
          </a>
        </div>
      </section>

      <section className="galeria" id="galeria">
        <div className="section-head">
          <h2>Como são nossos encontros</h2>
          <p>Momentos reais da Rede: mesa posta, louvor em família e histórias transformadas pelo Evangelho.</p>
        </div>
        <div className="galeria-grid">
          {encontros.map((encontro) => {
            const activeIndex = galeriaIndices[encontro.id] ?? 0;
            const activeImage = encontro.imagens[activeIndex];
            return (
              <button
                key={encontro.id}
                type="button"
                className="galeria-card"
                onClick={() => openGaleriaModal(encontro.id, activeIndex)}
              >
                <div className="galeria-card__media">
                  <img
                    src={activeImage}
                    alt={`${encontro.titulo} - encontro ${activeIndex + 1}`}
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 760px) 90vw, 300px"
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
      </section>

      <section className="programacao" id="programacao">
        <div className="section-head">
          <h2>Agenda Five One</h2>
          <p>Encontros que sustentam a vida da rede e formam discípulos missionais.</p>
        </div>
        <div className="programacao-grid">
          {programacao.map((item) => (
            <div key={item.titulo} className="programacao-card">
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
      </section>

      <section className="visita-cta" id="visita">
        <div className="visita-cta__inner">
          <div className="visita-cta__icon" aria-hidden>🏠</div>
          <h2>Você visitou uma de nossas casas?</h2>
          <p>
            Registre sua visita em menos de 2 minutos. Nossa liderança vai entrar em contato para caminhar com você.
          </p>
          <Link className="btn primary" to={visitorFormPath}>
            Fazer meu cadastro de visitante
          </Link>
          <p className="visita-cta__hint">
            Gratuito · Sem compromisso · Seu líder cuida de você 🙏
          </p>
        </div>
      </section>

      <section className="participe" id="participe">
        <div className="participe-content">
          <h2>Entre para a Rede de Igrejas nas Casas</h2>
          <p>
            Quer abrir a sua casa? Deseja encontrar uma família espiritual perto de você? Converse com o nosso time e
            descubra como podemos caminhar juntos.
          </p>
          <div className="participe-actions">
            <Link className="btn primary" to={visitorFormPath}>
              Registrar minha visita
            </Link>
            <a
              className="btn ghost"
              href="https://wa.me/5583987181731?text=Quero%20abrir%20minha%20casa%20para%20uma%20igreja"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir minha casa
            </a>
          </div>
        </div>
        <div className="participe-highlight">
          <strong>+ de 30 encontros</strong>
          <span>ao longo do ano, entre mesas, celebrações e missões.</span>
        </div>
      </section>

      <section className="mapa" id="mapa">
        <div className="section-head">
          <h2>Encontre uma Casa que faça parte da nossa rede</h2>
          <p>Use os filtros para localizar uma igreja nas casa mais próxima de você e entre em contato com os presbiteros local.</p>
        </div>
        <div className="mapa-filtros">
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
                <option key={cidade} value={cidade}>
                  {cidade}
                </option>
              ))}
            </select>
          </label>
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
                        <span>
                          {igreja.bairro} · {igreja.cidade} — {igreja.estado}
                        </span>
                      </div>
                      <div className="mapa-info__item-body">
                        <span>Presbítero: {igreja.lider}</span>
                        <a href={`tel:${telefoneLimpo}`}>
                          {igreja.telefone}
                        </a>
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
              <p>Selecione um estado e uma cidade para ver as casas disponíveis na rede.</p>
            </div>
          ) : (
            <div className="mapa-info mapa-info--placeholder">
              <h3>Filtre para encontrar uma casa</h3>
              <p>Escolha um estado e depois uma cidade para listar as casas e entrar em contato com os presbíteros locais.</p>
            </div>
          )}
        </div>
        <div className="mapa-frame">
          <iframe
            title="Mapa de Igrejas nas Casas"
            src={mapaLink}
            width="100%"
            height="460"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          />
        </div>
      </section>

      <section className="contato" id="contato">
        <div className="section-head">
          <h2>Fale com a Rede</h2>
          <p>Estamos prontos para caminhar junto com você, sua família e sua casa.</p>
        </div>
        <div className="contato-grid">
          <form
            className="contato-form"
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
          <div className="contato-info">
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
      </section>
      <FloatingContacts instagramUrl={instagramUrl} whatsappUrl={whatsappLink} />

      <footer className="footer-modern">
        <div className="footer-modern__grid">
          <div className="footer-modern__brand">
            <h3>Rede de Igrejas nas Casas Five One</h3>
            <p>
              Uma família apostólica que abre lares para viver a Palavra, discipular pessoas e servir a cidade com o amor
              de Cristo.
            </p>
          </div>
          <div className="footer-modern__column">
            <h4>Contato</h4>
            <ul>
              <li>
                <span>WhatsApp</span>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  +55 (83) 98718-1731
                </a>
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
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </div>
        </div>
        <div className="footer-modern__bottom">
          <span>© {currentYear} Rede Five One. Todos os direitos reservados.</span>
        </div>
      </footer>

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
            onClick={(event) => {
              if (event.target === event.currentTarget) closeGaleriaModal();
            }}
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
              sizes="(max-width: 760px) 90vw, 70vw"
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
              <span>
                {galeriaModal.index + 1} / {item.imagens.length}
              </span>
            </div>
            <div className="galeria-modal__thumbs" role="tablist" aria-label={`Outras fotos de ${item.titulo}`}>
              {item.imagens.map((thumb, idx) => (
                <button
                  key={`${item.id}-${idx}-${thumb}`}
                  type="button"
                  className={`galeria-modal__thumb ${idx === galeriaModal.index ? 'is-active' : ''}`}
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="floating-contacts" aria-live="polite">
      <div className={`floating-contacts__card ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
        <strong>WhatsApp</strong>
        <p>Olá 👋 Bem-vindo à Rede Five One. Podemos ajudar?</p>
        <a className="btn primary" href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)}>
          Abrir bate-papo
        </a>
      </div>
      <div className="floating-contacts__fab-group">
        <button
          type="button"
          className={`floating-contacts__fab floating-contacts__fab--whatsapp ${isOpen ? 'is-active' : ''}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Fechar card do WhatsApp' : 'Conversar no WhatsApp'}
          aria-expanded={isOpen}
        >
          <WhatsappIcon />
        </button>
        <a className="floating-contacts__fab floating-contacts__fab--instagram" href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Visitar Instagram">
          <InstagramIcon />
        </a>
      </div>
    </div>
  );
}

function WhatsappIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M12 2.25c-5.376 0-9.75 4.373-9.75 9.75 0 1.72.45 3.393 1.3 4.883L2.25 21.75l4.984-1.27A9.697 9.697 0 0 0 12 21.75c5.377 0 9.75-4.374 9.75-9.75S17.377 2.25 12 2.25Z"
        fill="white"
        opacity="0.2"
      />
      <path
        d="M12 4.5a7.5 7.5 0 0 0-6.557 11.245l-.928 3.12 3.165-.912A7.5 7.5 0 1 0 12 4.5Zm4.286 8.739c-.186.529-.961.968-1.314 1.02-.35.053-.8.076-1.296-.08-.3-.096-.686-.223-1.18-.438-2.073-.898-3.422-2.986-3.528-3.123-.105-.137-.842-1.12-.842-2.136 0-1.017.534-1.517.724-1.724.19-.207.418-.258.557-.258.138 0 .28 0 .404.007.129.007.305-.049.477.362.186.434.635 1.503.692 1.612.057.11.095.237.016.383-.076.137-.114.237-.228.365-.114.128-.24.286-.344.384-.114.114-.232.238-.1.466.131.228.585.963 1.257 1.558.865.771 1.595 1.01 1.823 1.123.228.114.362.1.495-.057.133-.155.569-.662.722-.889.152-.228.304-.19.51-.114.207.076 1.341.632 1.57.746.228.114.379.171.434.266.057.095.057.548-.13 1.077Z"
        fill="white"
      />
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
