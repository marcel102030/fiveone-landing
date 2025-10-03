import encontro1 from '../assets/images/encontro1.jpg';
import encontro2 from '../assets/images/encontro2.png';
import encontro4 from '../assets/images/encontro4.jpg';

export type DestaqueCard = {
  id: string;
  titulo: string;
  descricao: string;
  acao: string;
  path: string;
  imagem: string;
};

export const destaqueCards: DestaqueCard[] = [
  {
    id: 'como-funciona',
    titulo: 'Como funcionam as Igrejas nas Casas?',
    descricao: 'Reuniões simples nos lares, com comunhão à mesa, oração, ensino bíblico e discipulado para todas as idades.',
    acao: 'Saiba Mais',
    path: '/rede-igrejas/como-funciona',
    imagem: encontro1,
  },
  {
    id: 'rede-five-one',
    titulo: 'Rede de Igrejas nas Casas - Five One',
    descricao: 'Conexão entre as igrejas nas casas, com acompanhamento dos 5 Ministérios e mentoria para fortalecer cada comunidade local.',
    acao: 'Saiba Mais',
    path: '/rede-igrejas/rede-five-one',
    imagem: encontro2,
  },
  {
    id: 'o-que-e-five-one',
    titulo: 'O que é o Five One',
    descricao: 'Um movimento que ajuda a Igreja a compreender melhor a Bíblia e a viver sua fé de forma prática, tendo como base os cinco ministérios de Efésios 4.',
    acao: 'Saiba Mais',
    path: '/rede-igrejas/o-que-e-five-one',
    imagem: encontro4,
  },
];
