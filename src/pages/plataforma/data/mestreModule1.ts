export type MestreVideo = {
  id: string; // mantém compatibilidade: mestre-01..mestre-17
  url: string;
  title: string;
  thumbnail?: string;
  pdfUrl?: string;
  module: 1;
  subjectId: 'biblia' | 'fundamentos' | 'ministerios' | 'historia';
  subjectName: string;
  subjectTeacher: string;
  subjectType: 'Formação T' | 'Formação M';
};

// Para demonstração, usamos os mesmos vídeos/miniaturas onde necessário.
const defaultThumb = '/assets/images/miniatura_fundamentos_mestre.png';

export const mestreModulo1Videos: MestreVideo[] = [
  // Semana 1 (1 vídeo por matéria)
  {
    id: 'mestre-01',
    url: 'https://player.vimeo.com/video/1100734000',
    title: 'A Palavra de Deus',
    thumbnail: '/assets/images/Introducao_historia_igreja.png',
    pdfUrl: '/assets/pdfs/aula01.pdf',
    module: 1,
    subjectId: 'biblia',
    subjectName: 'Conheça a Sua Bíblia',
    subjectTeacher: 'Rodolfo',
    subjectType: 'Formação T',
  },
  {
    id: 'mestre-02',
    url: 'https://www.youtube.com/embed/XQEGw923yD0',
    title: 'Mestres no Antigo Testamento',
    thumbnail: defaultThumb,
    module: 1,
    subjectId: 'fundamentos',
    subjectName: 'Fundamentos do Ministério de Mestre',
    subjectTeacher: 'Guh',
    subjectType: 'Formação M',
  },
  {
    id: 'mestre-03',
    url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
    title: 'Somos todos sacerdotes e os 5 Ministérios',
    thumbnail: defaultThumb,
    module: 1,
    subjectId: 'ministerios',
    subjectName: 'Introdução aos 5 Ministérios',
    subjectTeacher: 'Marcelo',
    subjectType: 'Formação M',
  },
  {
    id: 'mestre-04',
    url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
    title: 'Introdução à História da Igreja',
    thumbnail: defaultThumb,
    module: 1,
    subjectId: 'historia',
    subjectName: 'História da Igreja I',
    subjectTeacher: 'Suenia',
    subjectType: 'Formação T',
  },

  // Semana 2
  {
    id: 'mestre-05',
    url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
    title: 'A formação da Bíblia',
    thumbnail: defaultThumb,
    module: 1,
    subjectId: 'biblia',
    subjectName: 'Conheça a Sua Bíblia',
    subjectTeacher: 'Rodolfo',
    subjectType: 'Formação T',
  },
  {
    id: 'mestre-06',
    url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
    title: 'Jesus, o Mestre dos Mestres',
    thumbnail: defaultThumb,
    module: 1,
    subjectId: 'fundamentos',
    subjectName: 'Fundamentos do Ministério de Mestre',
    subjectTeacher: 'Guh',
    subjectType: 'Formação M',
  },
  {
    id: 'mestre-07',
    url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
    title: 'Entendendo os Dons segundo a Bíblia',
    thumbnail: defaultThumb,
    module: 1,
    subjectId: 'ministerios',
    subjectName: 'Introdução aos 5 Ministérios',
    subjectTeacher: 'Marcelo',
    subjectType: 'Formação M',
  },
  {
    id: 'mestre-08',
    url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
    title: 'A Igreja nos 3 Primeiros Séculos',
    thumbnail: defaultThumb,
    module: 1,
    subjectId: 'historia',
    subjectName: 'História da Igreja I',
    subjectTeacher: 'Suenia',
    subjectType: 'Formação T',
  },

  // Semana 3
  {
    id: 'mestre-09',
    url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
    title: 'As 4 características da Bíblia',
    thumbnail: defaultThumb,
    module: 1,
    subjectId: 'biblia',
    subjectName: 'Conheça a Sua Bíblia',
    subjectTeacher: 'Rodolfo',
    subjectType: 'Formação T',
  },
  {
    id: 'mestre-10',
    url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
    title: 'O Ministério de Ensino nos Evangelhos',
    thumbnail: defaultThumb,
    module: 1,
    subjectId: 'fundamentos',
    subjectName: 'Fundamentos do Ministério de Mestre',
    subjectTeacher: 'Guh',
    subjectType: 'Formação M',
  },
  {
    id: 'mestre-11',
    url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
    title: 'Visão Profética sobre os 5 Ministérios',
    thumbnail: defaultThumb,
    module: 1,
    subjectId: 'ministerios',
    subjectName: 'Introdução aos 5 Ministérios',
    subjectTeacher: 'Marcelo',
    subjectType: 'Formação M',
  },
  {
    id: 'mestre-12',
    url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
    title: 'A Igreja e as Heresias combatidas',
    thumbnail: defaultThumb,
    module: 1,
    subjectId: 'historia',
    subjectName: 'História da Igreja I',
    subjectTeacher: 'Suenia',
    subjectType: 'Formação T',
  },

  // Semana 4
  {
    id: 'mestre-13',
    url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
    title: 'Estrutura da Bíblia',
    thumbnail: defaultThumb,
    module: 1,
    subjectId: 'biblia',
    subjectName: 'Conheça a Sua Bíblia',
    subjectTeacher: 'Rodolfo',
    subjectType: 'Formação T',
  },
  {
    id: 'mestre-14',
    url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
    title: 'Mestres na Igreja Primitiva',
    thumbnail: defaultThumb,
    module: 1,
    subjectId: 'fundamentos',
    subjectName: 'Fundamentos do Ministério de Mestre',
    subjectTeacher: 'Guh',
    subjectType: 'Formação M',
  },
  {
    id: 'mestre-15',
    url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
    title: 'Liderança na Igreja Local',
    thumbnail: defaultThumb,
    module: 1,
    subjectId: 'ministerios',
    subjectName: 'Introdução aos 5 Ministérios',
    subjectTeacher: 'Marcelo',
    subjectType: 'Formação M',
  },
  {
    id: 'mestre-16',
    url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
    title: 'Os Pais da Igreja e a Teologia Patrística',
    thumbnail: defaultThumb,
    module: 1,
    subjectId: 'historia',
    subjectName: 'História da Igreja I',
    subjectTeacher: 'Suenia',
    subjectType: 'Formação T',
  },

  // Extra para completar 17
  {
    id: 'mestre-17',
    url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
    title: 'Os Concílios',
    thumbnail: defaultThumb,
    module: 1,
    subjectId: 'historia',
    subjectName: 'História da Igreja I',
    subjectTeacher: 'Suenia',
    subjectType: 'Formação T',
  },
];

