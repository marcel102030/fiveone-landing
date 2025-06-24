// Declaração de módulo para corrigir erro de TypeScript sobre lastAutoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function aplicarFundo(doc: jsPDF) {
  doc.setFillColor(240, 255, 250); // Cor verde água claro
  doc.rect(0, 0, 210, 297, 'F');
}
// Helper para verificar espaço disponível na página
function checkPageSpace(doc: jsPDF, currentHeight: number, alturaNecessaria: number): number {
  if (currentHeight + alturaNecessaria >= 280) {
    doc.addPage();
    aplicarFundo(doc);
    return 20;
  }
  return currentHeight;
}
import introducao from '../assets/images/Introducao4.png';
import headerApostolico from '../assets/images/APOSTOLICO PARA FUNDO CLARO.png';
import headerProfetico from '../assets/images/PROFETA PARA FUNDO CLARO.png';
import headerMestre from '../assets/images/MESTRE FUNDO CLARO.png';
import gmailIcon from '../assets/images/icons/gmail.png';
import logo from '../assets/images/LOGO MAIOR.png';
import instagramIcon from '../assets/images/icons/instagram.png';
import youtubeIcon from '../assets/images/icons/youtube.png';
import meuPerfilMinisterial from '../assets/images/PerfilMinisterial3.png';
import qrcodeListaEspera from '../assets/images/qrcodeListaEspera.jpeg';
// Migração dos tipos e dados de perfis ministeriais

type DomMinisterial = 'Apostólico' | 'Profético' | 'Evangelístico' | 'Pastoral' | 'Mestre';

const perfisMinisteriais: Record<DomMinisterial, string[]> = {
  Apostólico: [
    'VISÃO GERAL DO DOM APOSTÓLICO: Um indivíduo apostólico provavelmente expressaria todas as funções listadas abaixo, mas uma expressão madura do apostólico incorporará muitas de maneira exemplar. No poder do Espírito Santo, a pessoa apostólica é imbuída de um senso inato do propósito geral da organização. Em sua forma de liderança madura e idealizada, o apóstolo (enviado) é a pessoa mais responsável pelo vigor geral, bem como pela extensão do cristianismo como um todo, principalmente por meio da missão direta e da plantação de igrejas. Não é de surpreender que os tipos apostólicos tendem a favorecer o lado empreendedor da igreja e tenham uma capacidade natural para a aventura; eles tendem a ser menos avessos ao risco do que aqueles que se enquadram em outras formas de ministério e liderança. Seguindo esse instinto pioneiro, eles são os mais propensos a se engajar nas bordas da organização, inovar e estender a fé a novos territórios. Eles, portanto, fornecem a liderança empreendedora catalítica, adaptativa, translocal, pioneira e necessária para desencadear, mobilizar e sustentar movimentos. Os apóstolos têm um propósito insubstituível em manter as capacidades missionais contínuas, gerando novas formas de ecclesia e trabalhando para a renovação contínua da igreja/organização. O apóstolo maduro tenderá a ter um senso mais desenvolvido da igreja/organização como um sistema vivo composto de partes essenciais, ou subsistemas. Isso envolve ser o desenvolvedor e guardião das meta-ideias (DNA) que determinam a saúde do sistema. Por isso, eles podem desempenhar um papel vital no design, na liderança e na saúde das organizações.',
    'FUNÇÕES PRINCIPAIS: Semeador do DNA da Igreja; Plantador de igrejas e comunidades; Mobilizador de líderes; Conector translocal; Provedor de inovação ministerial; Garantidor da fidelidade à visão e missão.',
    'PONTOS CEGOS E DESAFIOS: Autocracia e domínio excessivo; Falta de empatia; Impaciência; Falta de compromisso com detalhes; Desgaste e esgotamento.',
    'IMPACTO NA IGREJA: Extensão do Reino; Fortalecimento da missão; Inovação ministerial; Manutenção do DNA do Reino; Criação de redes ministeriais.',
  ],
  Profético: [
    'VISÃO GERAL DO DOM PROFÉTICO: Aqueles com dom ministerial profético são profundamente sensíveis à voz e direção de Deus. Possuem discernimento aguçado para identificar a vontade do Senhor em situações, pessoas e ambientes. São chamados a trazer alinhamento, correção e encorajamento ao Corpo de Cristo, frequentemente sendo usados para revelar o coração de Deus e direcionar a igreja para o cumprimento do Seu propósito. O profético maduro manifesta coragem para confrontar desvios, zelo pela santidade e paixão por ver a igreja caminhando em integridade e fidelidade.',
    'FUNÇÕES PRINCIPAIS: Proclamação da vontade de Deus; Discernimento espiritual; Direcionamento e alinhamento; Encorajamento e exortação; Intercessão estratégica; Confronto de injustiças e desvios.',
    'REFERÊNCIAS BÍBLICAS: Atos 11:27-28; Atos 13:1; Atos 21:10-11; 1 Coríntios 14:1,3.',
    'PONTOS CEGOS E DESAFIOS: Dureza ou insensibilidade; Isolamento; Orgulho espiritual; Impaciência com processos; Falta de graça ao corrigir.',
    'IMPACTO NA IGREJA: Sensibilidade à voz de Deus; Alinhamento à Palavra; Correção de rumos; Estímulo à oração e intercessão; Ambientes de transparência e santidade.',
    'CONCLUSÃO: O dom Profético é indispensável para manter a igreja sensível ao mover do Espírito, ajustada à Palavra e pronta para responder ao chamado de Deus com obediência, coragem e fé.'
  ],
  Evangelístico: [
    'VISÃO GERAL DO DOM EVANGELÍSTICO: O evangelista é impulsionado por um desejo ardente de compartilhar o evangelho e ver pessoas sendo reconciliadas com Deus. Tem facilidade em se conectar com não-cristãos, comunicar a mensagem de salvação de maneira clara e relevante, e mobilizar outros para a missão. O evangelístico maduro é motivador, criativo e adaptável, sempre buscando oportunidades para alcançar os perdidos e equipar a igreja para o testemunho.',
    'FUNÇÕES PRINCIPAIS: Proclamação do evangelho; Discipulado de novos convertidos; Mobilização para a missão; Criação de estratégias de alcance; Treinamento em evangelismo; Construção de pontes com a sociedade.',
    'REFERÊNCIAS BÍBLICAS: Atos 8:5-8,26-40; 21:8; Efésios 4:11.',
    'PONTOS CEGOS E DESAFIOS: Superficialidade nos relacionamentos; Foco excessivo em resultados; Impaciência com processos de maturidade; Negligência do cuidado pastoral.',
    'IMPACTO NA IGREJA: Crescimento do Corpo; Cultura de evangelismo; Expansão do Reino; Integração de novos convertidos; Testemunho relevante na sociedade.',
    'CONCLUSÃO: O dom Evangelístico é essencial para manter a igreja em movimento, expandindo suas fronteiras e cumprindo o chamado de fazer discípulos em todas as nações.'
  ],
  Pastoral: [
    'VISÃO GERAL DO DOM PASTORAL: O pastoral é marcado pelo cuidado, compaixão e compromisso em nutrir e proteger o rebanho de Deus. Pessoas com esse dom têm sensibilidade para as necessidades emocionais, espirituais e práticas dos outros, promovendo unidade, restauração e crescimento saudável. O pastoral maduro é um construtor de relacionamentos profundos, facilitador da comunhão e defensor da saúde integral do Corpo de Cristo.',
    'FUNÇÕES PRINCIPAIS: Cuidado e acompanhamento; Aconselhamento e discipulado; Promoção da unidade; Intervenção em crises; Mediação de conflitos; Desenvolvimento de líderes cuidadores.',
    'REFERÊNCIAS BÍBLICAS: João 10:11-16; Atos 20:28; 1 Pedro 5:1-4.',
    'PONTOS CEGOS E DESAFIOS: Excesso de proteção; Dificuldade em confrontar; Sobrecarga emocional; Resistência à mudança; Foco excessivo no grupo interno.',
    'IMPACTO NA IGREJA: Ambientes saudáveis e acolhedores; Maturidade relacional; Retenção e restauração de pessoas; Unidade e harmonia; Suporte em tempos de crise.',
    'CONCLUSÃO: O dom Pastoral é indispensável para o cuidado, proteção e crescimento equilibrado da igreja, promovendo saúde e unidade no Corpo de Cristo.'
  ],
  Mestre: [
    'VISÃO GERAL DO DOM DE ENSINO (MESTRE): O mestre é apaixonado pela verdade, pelo estudo das Escrituras e pela comunicação clara do conhecimento bíblico. Tem habilidade para tornar conceitos complexos acessíveis, promovendo compreensão, discernimento e aplicação prática da Palavra. O mestre maduro incentiva o questionamento saudável, fundamenta a fé e equipa a igreja para viver de acordo com os princípios do Reino.',
    'FUNÇÕES PRINCIPAIS: Ensino bíblico; Formação de discípulos; Elaboração de materiais e recursos; Defesa da fé; Mentoria intelectual e espiritual; Promoção do pensamento crítico.',
    'REFERÊNCIAS BÍBLICAS: Atos 18:24-28; 20:20; 1 Coríntios 12:28; Tiago 3:1.',
    'PONTOS CEGOS E DESAFIOS: Intelectualismo excessivo; Desconexão com a prática; Impaciência com aprendizes lentos; Tendência ao debate; Orgulho do conhecimento.',
    'IMPACTO NA IGREJA: Maturidade doutrinária; Crescimento no entendimento bíblico; Proteção contra heresias; Estímulo à busca pelo conhecimento; Igreja fundamentada na verdade.',
    'CONCLUSÃO: O dom de Ensino é vital para o crescimento, maturidade e proteção da igreja, formando discípulos sólidos e preparados para toda boa obra.'
  ]
};

export const generatePDF = ({
  name,
  date,
  domPrincipal,
  percentuais,
}: {
  name: string;
  date: string;
  domPrincipal: DomMinisterial;
  percentuais: { dom: string; valor: number }[];
}) => {
  const doc = new jsPDF();

  // Fundo verde água extremamente claro em toda a página 1
  doc.setFillColor(240, 255, 250); // Cor #F0FFF9 (um verde água extremamente claro)
  doc.rect(0, 0, 210, 297, 'F');

  // Borda da página (A4 padrão = 210mm x 297mm)
  doc.setLineWidth(0.5);
  doc.rect(5, 5, 200, 287);

  // Cabeçalho com fundo
  doc.setFillColor(4, 91, 98); // Cor azul escuro #045b62
  doc.rect(0, 0, 210, 50, 'F'); // Aumenta a altura do cabeçalho de 40 para 50

  // Adicionar logo na posição e tamanho originais (Y=5, 40x40)
  const img = new Image();
  img.src = logo;
  doc.addImage(img, 'PNG', 10, 5, 40, 40);

  // Texto "FIVE ONE MOVEMENT" alinhado horizontalmente melhor
  doc.setTextColor(255, 255, 255); // branco
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('FIVE ONE MOVEMENT', 60, 20);

  // Dados abaixo do texto, alinhados verticalmente e à direita da logo
  doc.setFontSize(10);
  const textoX = 70;
  let textoY = 28;

  doc.setFont('helvetica', 'bold');
  doc.text('Data da Avaliação:', textoX, textoY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${date}`, textoX + 35, textoY);

  textoY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Nome da Pessoa:', textoX, textoY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${name}`, textoX + 35, textoY);

  textoY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Dom Ministerial:', textoX, textoY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${domPrincipal}`, textoX + 35, textoY);

  // Adicionar imagem 'meuperfilministerial' na primeira página (ajuste de tamanho e centralização)
  const perfilImg = new Image();
  perfilImg.src = meuPerfilMinisterial;
  doc.addImage(perfilImg, 'PNG', 20, 55, 170, 210);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 38, 50);
  doc.text('Meu Perfil Ministerial', 105, 80, { align: 'center' });

  // Linha abaixo do texto
  doc.setDrawColor(15, 38, 50);
  doc.setLineWidth(0.8);
  doc.line(50, 84, 160, 84);

  doc.addPage();
  aplicarFundo(doc);

  // Fundo verde água extremamente claro em toda a página 2
  doc.setFillColor(240, 255, 250); // Cor #F0FFF9 (um verde água extremamente claro)
  doc.rect(0, 0, 210, 297, 'F');

  // Cabeçalho da segunda página usando a imagem introducao.png (centralizada e altura fixa)
  const introImg = new Image();
  introImg.src = introducao;

  const introWidth = 80;
  const introHeight = 15; // altura fixa para evitar erro (ajustado de 20 para 15)
  const introX = (210 - introWidth) / 2;

  doc.addImage(introImg, 'PNG', introX, 10, introWidth, introHeight);

  // Título "INTRODUÇÃO" centralizado e sublinhado
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 38, 50);
  doc.text('INTRODUÇÃO', 105, 43, { align: 'center' });

  doc.setDrawColor(15, 38, 50);
  doc.setLineWidth(0.8);
  doc.line(50, 47, 160, 47);

  // Ajuste altura do texto da introdução após o título e linha horizontal
  let currentHeight = 55;

  // Antes de renderizar o texto da introdução, ajuste o tamanho da fonte
  doc.setFontSize(11.2);
  doc.setTextColor(0, 0, 0);

  const textoIntro = `A sua jornada ministerial começa aqui. Este documento é fruto de uma avaliação fundamentada nas Escrituras, especialmente em Efésios 4:7-13, onde o apóstolo Paulo revela que, ao subir aos céus, Cristo concedeu dons ministeriais ao Seu Corpo — a Igreja. Esses dons não são simples talentos ou habilidades naturais, mas expressões da própria natureza de Jesus, distribuídas de forma intencional e estratégica para que a Igreja cumpra sua missão na Terra.

Deus estabeleceu cinco dons ministeriais: Apostólico, Profético, Evangelístico, Pastoral e de Ensino (Mestre). Cada um desses dons reflete uma dimensão do caráter e da missão de Cristo. Eles são, ao mesmo tempo, um chamado divino, uma vocação espiritual e uma função vital para a edificação, crescimento, maturidade e expansão do Reino de Deus. A operação plena desses dons é essencial para que a Igreja se torne um organismo saudável, relevante e capaz de expressar a plenitude de Cristo em todas as esferas da sociedade.

Quando esses dons operam juntos, a Igreja cresce de forma equilibrada e missional. No entanto, quando um ou mais desses dons não são reconhecidos, ativados ou desenvolvidos, a comunidade cristã se torna desequilibrada, disfuncional, centrada em si mesma e, muitas vezes, desconectada da missão que lhe foi confiada.

Esta avaliação não é apenas uma análise de perfil. Ela é uma ferramenta que tem o objetivo de te ajudar a compreender melhor o propósito específico que Deus colocou sobre sua vida, te guiando na descoberta, desenvolvimento e ativação do seu Dom Ministerial. Saber quem você é no Corpo de Cristo muda a forma como você vive, serve e impacta pessoas, tanto dentro quanto fora da igreja.

Ao entender profundamente como o seu dom opera — suas características, funções, pontos fortes e desafios — você estará mais alinhado à missão que Deus te confiou. Isso não apenas trará mais clareza e direção pessoal, mas também contribuirá para a construção de uma Igreja mais forte, madura e alinhada ao Reino.

Portanto, este relatório é muito mais do que informação. Ele é um convite para que você viva sua vocação com intencionalidade, paixão e comprometimento, entendendo que o seu dom é indispensável para que a Igreja revele Cristo ao mundo.`;

  const textoDividido = doc.splitTextToSize(textoIntro, 180);
  // Garante padrão de fonte e cor antes de renderizar o texto de introdução
  doc.setFont('helvetica', 'normal');
  // Mantém fontSize 11.5 já setado acima
  doc.setTextColor(0, 0, 0);
  currentHeight = checkPageSpace(doc, currentHeight, textoDividido.length * 7);
  doc.text(textoDividido, 25, currentHeight);
  currentHeight += textoDividido.length * 7;

  // Se for Profético, renderiza função específica e retorna!
  if (domPrincipal === 'Profético') {
    renderProfetico(doc, name, percentuais);
    return;
  }
  // Se for Apostólico, renderiza função específica e retorna!
  if (domPrincipal === 'Apostólico') {
    renderApostolico(doc, name, percentuais);
    return;
  }
  // Se for Mestre, renderiza função específica e retorna!
  if (domPrincipal === 'Mestre') {
    renderMestre(doc, name, percentuais);
    return;
  }
};

// Função para renderizar o PDF do Profético
function renderProfetico(
  doc: jsPDF,
  name: string,
  percentuais: { dom: string; valor: number }[]
) {
  // Cabeçalho Profético na página 3
  doc.addPage();
  aplicarFundo(doc);
  doc.setFillColor(240, 255, 250);
  doc.rect(0, 0, 210, 297, 'F');
  const headerImg = new Image();
  headerImg.src = headerProfetico;
  doc.addImage(headerImg, 'PNG', 20, 5, 170, 30);
  doc.setDrawColor(15, 38, 50);
  doc.setLineWidth(0.8);
  doc.line(0, 32, 210, 32);

  // currentHeight local para Profético
  let currentHeight = 35;

  // Usar uma cópia do array do perfil, nunca alterar global!
  const perfilContent = [...perfisMinisteriais['Profético']];

  // Renderização da Visão Geral e Características
  const visaoGeral = perfilContent.find(p => p.startsWith('VISÃO GERAL'));
  perfilContent.splice(perfilContent.findIndex(p => p.startsWith('VISÃO GERAL')), 1);
  if (visaoGeral) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 38, 50);
    currentHeight = checkPageSpace(doc, currentHeight, 8);
    currentHeight += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    let splitText: string[] = [];
    splitText = doc.splitTextToSize(
      'O dom profético é marcado por pessoas altamente sensíveis à voz, à presença e à direção de Deus. São homens e mulheres com discernimento espiritual apurado, que percebem com clareza a vontade do Senhor sobre pessoas, situações, ambientes e estações. Aqueles que possuem este dom carregam um senso profundo de alinhamento com o céu, movidos por um desejo intenso de ver a vontade de Deus manifesta na Terra.\n\n' +
      'Pessoas com o dom profético são chamadas por Deus para trazer alinhamento, correção, exortação, encorajamento e também consolo ao Corpo de Cristo. São frequentemente levantadas pelo Espírito para revelar o coração de Deus, comunicar Seus intentos e direcionar a igreja ao cumprimento de Seu propósito eterno.\n\n' +
      'O profético maduro é aquele que manifesta coragem para confrontar desvios, zelo pela santidade e paixão inabalável por ver a igreja caminhando em integridade, fidelidade e alinhamento com a Palavra. Carregam uma inquietação santa diante de tudo aquilo que fere a vontade de Deus. Suas vidas são pautadas pela busca incessante pela verdade, pela retidão e pela pureza espiritual.\n\n' +
      'Além disso, a atuação profética vai muito além de previsões ou palavras de conhecimento. Ela envolve intercessão estratégica, proclamação da vontade soberana de Deus, denúncia do pecado, estímulo constante à oração e liberação de direção espiritual. O ministério profético é indispensável para manter a igreja sensível ao mover do Espírito, ajustada à Palavra e pronta para responder com obediência, coragem e fé ao chamado divino.',
      180
    );
    currentHeight = checkPageSpace(doc, currentHeight, splitText.length * 7);
    doc.text(splitText, 14, currentHeight);
    currentHeight += splitText.length * 7;

    // Características Profético
    currentHeight = checkPageSpace(doc, currentHeight, 50);
    const caracteristicasColuna1 = [
      'Sensibilidade à voz e direção do Espírito',
      'Discernimento espiritual apurado',
      'Coragem para confrontar desvios e injustiças',
      'Busca constante por integridade e santidade',
      'Paixão pela verdade e alinhamento à Palavra',
      'Facilidade para ouvir e transmitir mensagens de Deus'
    ];
    const caracteristicasColuna2 = [
      'Intercessor estratégico',
      'Tendência a encorajar e exortar outros',
      'Zelo pelo cumprimento do propósito de Deus',
      'Capacidade de identificar ambientes espirituais',
      'Desejo de ver a igreja caminhando em fidelidade',
      'Inquietação diante de estruturas rígidas e religiosas'
    ];
    currentHeight -= 28;
    const maxWidth = 85;
    let maxAlturaCol1 = 0;
    let maxAlturaCol2 = 0;
    caracteristicasColuna1.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidth);
      maxAlturaCol1 += split.length * 5;
    });
    caracteristicasColuna2.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidth);
      maxAlturaCol2 += split.length * 5;
    });
    const alturaCaracteristicas = 8 + Math.max(maxAlturaCol1, maxAlturaCol2) + 8;
    doc.setFillColor(4, 91, 98);
    doc.roundedRect(15, currentHeight - 10, 180, alturaCaracteristicas - 5, 4, 4, 'F');
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15.8, currentHeight - 9.2, 178.4, alturaCaracteristicas - 6.6, 3.2, 3.2, 'F');
    doc.setFillColor(4, 91, 98);
    doc.rect(15, currentHeight - 10, 180, 6, 'F');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('CARACTERÍSTICAS:', 18, currentHeight - 5);
    let caracteristicasY = currentHeight + 4;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    let offsetCol1 = 0, offsetCol2 = 0;
    caracteristicasColuna1.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidth);
      doc.text(split, 18, caracteristicasY + offsetCol1);
      offsetCol1 += split.length * 5;
    });
    caracteristicasColuna2.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidth);
      doc.text(split, 105, caracteristicasY + offsetCol2);
      offsetCol2 += split.length * 5;
    });
    currentHeight += alturaCaracteristicas + 2;
    // Funções Profético
    const funcoesColuna1 = [
      'Proclamação da vontade soberana de Deus — denunciar injustiças, alertar contra o pecado e declarar os propósitos de Deus',
      'Discernimento espiritual aguçado — capacidade de perceber realidades espirituais, intenções ocultas e direções divinas',
      'Alinhamento da igreja ao coração de Deus — convocar à pureza, arrependimento e fidelidade às Escrituras',
      'Intercessão estratégica e batalha espiritual — assumir brechas em oração profética por igrejas, famílias e nações'
    ];
    const funcoesColuna2 = [
      'Ativação e edificação do Corpo de Cristo — liberar palavras que encorajam, fortalecem e trazem direção',
      'Confronto de desvios, estruturas corrompidas e injustiças espirituais e sociais',
      'Revelação e ensino dos tempos e estações de Deus — ajudar a igreja a compreender ciclos e se posicionar no Reino'
    ];
    currentHeight = checkPageSpace(doc, currentHeight, 50);
    const maxWidthFuncoes = 85;
    let maxAlturaFuncoesCol1 = 0;
    let maxAlturaFuncoesCol2 = 0;
    funcoesColuna1.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidthFuncoes);
      maxAlturaFuncoesCol1 += split.length * 5;
    });
    funcoesColuna2.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidthFuncoes);
      maxAlturaFuncoesCol2 += split.length * 5;
    });
    const alturaFuncoes = 8 + Math.max(maxAlturaFuncoesCol1, maxAlturaFuncoesCol2) + 8;
    doc.setFillColor(4, 91, 98);
    doc.roundedRect(15, currentHeight - 10, 180, alturaFuncoes - 5, 4, 4, 'F');
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15.8, currentHeight - 9.2, 178.4, alturaFuncoes - 6.6, 3.2, 3.2, 'F');
    doc.setFillColor(4, 91, 98);
    doc.rect(15, currentHeight - 10, 180, 6, 'F');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('FUNÇÕES PRINCIPAIS:', 18, currentHeight - 5);
    let funcoesY = currentHeight + 4;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    let offsetFuncoesCol1 = 0, offsetFuncoesCol2 = 0;
    funcoesColuna1.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidthFuncoes);
      doc.text(split, 18, funcoesY + offsetFuncoesCol1);
      offsetFuncoesCol1 += split.length * 5;
    });
    funcoesColuna2.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidthFuncoes);
      doc.text(split, 105, funcoesY + offsetFuncoesCol2);
      offsetFuncoesCol2 += split.length * 5;
    });
    currentHeight += alturaFuncoes + 2;
  }

  // Pontos Cegos Profético
  let paragraph = perfilContent.find(p => p.startsWith('PONTOS CEGOS E DESAFIOS'));
  if (paragraph) {
    let pontosColuna1: string[] = [
      'Dureza ou insensibilidade ao confrontar ou corrigir',
      'Isolamento e tendência à solidão, por não se sentirem compreendidos',
      'Orgulho espiritual, sensação de superioridade ou “voz única de Deus”',
      'Impaciência com processos lentos e com estruturas',
      'Falta de graça ao lidar com erros e falhas dos outros',
      'Dificuldade em se submeter a lideranças, estruturas e processos da igreja local',
    ];
    let pontosColuna2: string[] = [
      'Tendência a julgar, criticar ou rotular sem ouvir ou compreender',
      'Desconexão de relacionamentos saudáveis, priorizando apenas o mundo espiritual',
      'Inclinação ao misticismo exagerado: confundir revelações pessoais com absolutismos, misturar crenças ou práticas extra-bíblicas, exagero em sinais, números, símbolos ou visões desconectadas da Palavra',
      'Superespiritualização: enxergar demônios ou batalhas espirituais em tudo, negligenciando aspectos práticos, relacionais e bíblicos do Reino',
      'Profecias sem responsabilidade: falar em nome de Deus sem filtros, sem teste bíblico, gerando feridas, confusão ou manipulação espiritual',
    ];
    currentHeight = checkPageSpace(doc, currentHeight, 50);
    const maxWidthPontos = 85;
    let maxAlturaPontosCol1 = 0;
    let maxAlturaPontosCol2 = 0;
    pontosColuna1.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
      maxAlturaPontosCol1 += split.length * 5;
    });
    pontosColuna2.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
      maxAlturaPontosCol2 += split.length * 5;
    });
    const alturaPontos = 6 + 7 + 2 + Math.max(maxAlturaPontosCol1, maxAlturaPontosCol2) + 4;
    doc.setFillColor(4, 91, 98);
    doc.roundedRect(15, currentHeight - 10, 180, alturaPontos - 4, 4, 4, 'F');
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15.8, currentHeight - 9.2, 178.4, alturaPontos - 5.6, 3.2, 3.2, 'F');
    doc.setFillColor(4, 91, 98);
    doc.rect(15, currentHeight - 10, 180, 6, 'F');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('PONTOS CEGOS:', 18, currentHeight - 5);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(4, 91, 98);
    doc.text('(Cuidado com essas expressões de imaturidade)', 18, currentHeight + 2);
    let pontosY = currentHeight + 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    let offsetPontosCol1 = 0, offsetPontosCol2 = 0;
    pontosColuna1.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
      doc.text(split, 18, pontosY + offsetPontosCol1);
      offsetPontosCol1 += split.length * 5;
    });
    pontosColuna2.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
      doc.text(split, 105, pontosY + offsetPontosCol2);
      offsetPontosCol2 += split.length * 5;
    });
    currentHeight += alturaPontos + 2;
  }

  // Impacto Profético
  paragraph = perfilContent.find(p => p.startsWith('IMPACTO NA IGREJA'));
  if (paragraph) {
    const impactoProfetico = [
      'IMPACTO NA IGREJA: Sensibilidade à voz de Deus; Alinhamento à Palavra; Correção de rumos; Estímulo à oração e intercessão; Ambientes de transparência e santidade; Ativação da intercessão e discernimento espiritual na comunidade.',
      '',
      '• Transmita a vontade de Deus com clareza, ousadia e amor, mesmo quando for desafiador. Sua sensibilidade espiritual permite perceber com precisão situações que demandam correção, alinhamento ou consolo. Sua atuação traz luz para caminhos tortuosos e conduz a igreja a um ambiente de maior fidelidade, verdade e pureza.',
      '',
      '• Sua atuação profética vai além de palavras de conhecimento. Inclui intercessão estratégica, proclamação da vontade soberana de Deus, denúncia de estruturas espirituais desalinhadas e discernimento aguçado sobre ambientes e circunstâncias. Você carrega a responsabilidade de manter a igreja sensível ao Espírito, alinhada e protegida dos desvios.',
      '',
      '• Permaneça sensível à voz de Deus, mas vigilante contra o perigo do isolamento. Conecte-se de forma intencional com a comunidade de fé, pois sua voz profética é essencial para alinhar, fortalecer e proteger a igreja. Um profeta maduro não se isola, mas serve como um sinal visível da direção do Espírito para o Corpo de Cristo.'
    ];
    let totalLines = 0;
    impactoProfetico.forEach(paragrafo => {
      const split = doc.splitTextToSize(paragrafo, 180);
      totalLines += split.length;
    });
    const lineHeight = 5.5;
    currentHeight = checkPageSpace(doc, currentHeight, totalLines * lineHeight);
    impactoProfetico.forEach(paragrafo => {
      const split = doc.splitTextToSize(paragrafo, 180);
      doc.text(split, 20, currentHeight);
      currentHeight += split.length * lineHeight;
    });
  }

  // Referências Bíblicas Profético
  paragraph = perfilContent.find(p => p.startsWith('REFERÊNCIAS BÍBLICAS'));
  if (paragraph) {
    currentHeight = checkPageSpace(doc, currentHeight, 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 38, 50);
    doc.text('REFERÊNCIAS BÍBLICAS:', 20, currentHeight);
    currentHeight += 8;
    // Conteúdo das referências (do array do perfil ministerial)
    const referenciasProfetico = [
      'Atos 11:27-28',
      'Atos 13:1',
      'Atos 21:10-11',
      '1 Coríntios 14:1,3'
    ];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    referenciasProfetico.forEach((ref) => {
      doc.text(ref, 20, currentHeight);
      currentHeight += 7;
    });
    doc.setFont('helvetica', 'normal');
    const textoRef = '“Segui o amor e procurai com zelo os dons espirituais, mas principalmente o de profetizar. [...] Mas o que profetiza fala aos homens para edificação, exortação e consolação.” (1 Coríntios 14:1,3)';
    const splitRef = doc.splitTextToSize(textoRef, 180);
    doc.text(splitRef, 20, currentHeight);
    currentHeight += splitRef.length * 7 + 8;
  }

  // ESCOLA FIVE ONE
  doc.addPage();
  doc.setFillColor(4, 91, 98); // #045b62
  doc.rect(0, 0, 210, 297, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(173, 216, 230); // Azul claro para título
  doc.text('ESCOLA FIVE ONE', 105, 32, { align: 'center' });
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1);
  doc.line(55, 37, 155, 37);
  doc.setFontSize(14);
  doc.setTextColor(173, 216, 230);
  doc.text('Próximo passo na sua jornada ministerial!', 105, 50, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  const escolaParagrafo1 = 'Agora que você descobriu mais sobre o seu Dom Ministerial, é hora de se aprofundar, ser treinado e ativado de forma intencional.';
  const escolaParagrafo2 = 'Na Escola Five One, você terá acesso a uma formação completa, bíblica e prática, baseada nos cinco dons ministeriais de Efésios 4.';
  const escolaTextWidth = 160;
  let escolaY = 62;
  const splitEscola1 = doc.splitTextToSize(escolaParagrafo1, escolaTextWidth);
  splitEscola1.forEach((line: string, i: number) => {
    doc.text(line, 105, escolaY + i * 7, { align: 'center' });
  });
  escolaY += splitEscola1.length * 7 + 3;
  const splitEscola2 = doc.splitTextToSize(escolaParagrafo2, escolaTextWidth);
  splitEscola2.forEach((line: string, i: number) => {
    doc.text(line, 105, escolaY + i * 7, { align: 'center' });
  });
  escolaY += splitEscola2.length * 7 + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(173, 216, 230);
  const chamada2 = 'Venha desenvolver seu chamado, ativar seu dom e se posicionar no propósito que Deus preparou para você.';
  const splitChamada2 = doc.splitTextToSize(chamada2, escolaTextWidth);
  splitChamada2.forEach((line: string, i: number) => {
    doc.text(line, 105, escolaY + i * 7, { align: 'center' });
  });
  escolaY += splitChamada2.length * 7 + 10;
  doc.setFontSize(12);
  doc.setTextColor(173, 216, 230);
  const final = 'Faça parte da Escola Five One e viva o seu chamado ministerial!';
  const splitFinal = doc.splitTextToSize(final, escolaTextWidth);
  splitFinal.forEach((line: string, i: number) => {
    doc.text(line, 105, escolaY + i * 7, { align: 'center' });
  });
  escolaY += splitFinal.length * 7 + 3;
  const pageWidth = doc.internal.pageSize.getWidth();
  const buttonWidth = 150;
  const buttonHeight = 10;
  const buttonX = (pageWidth - buttonWidth) / 2;
  const buttonY = escolaY + 5;
  doc.setFillColor(0, 123, 255); // azul #007BFF
  doc.roundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 3, 3, 'F');
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Clique Aqui para Entender sobre a Formação Ministerial', pageWidth / 2, buttonY + 7, { align: 'center' });
  doc.link(buttonX, buttonY, buttonWidth, buttonHeight, { url: 'https://fiveonemovement.com/#/formacao-ministerial' });
  escolaY = buttonY + buttonHeight + 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('Escaneie o QR Code e entre para o nosso grupo de lista de espera!', 105, escolaY, { align: 'center' });
  const imgWidth = 80;
  const imgHeight = 80;
  const x = (pageWidth - imgWidth) / 2;
  doc.addImage(qrcodeListaEspera, 'PNG', x, escolaY + 8, imgWidth, imgHeight);

  // Página final: Resumo dos Seus Dons
  doc.addPage();
  aplicarFundo(doc);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 102, 204);
  doc.text('Resumo dos Seus Dons', 14, 20);

  const tableData = percentuais.map(p => [p.dom, `${p.valor.toFixed(1)}%`]);

  autoTable(doc, {
    head: [['Dom', 'Percentual']],
    body: tableData,
    startY: 30,
    theme: 'grid',
    styles: { halign: 'center' },
    headStyles: { fillColor: [49, 75, 86] },
    didDrawPage: () => {
      aplicarFundo(doc);
    }
  });

  // Nova página para o texto do APEST
  doc.addPage();
  aplicarFundo(doc);

  // Bloco de texto: Como é a Igreja sem o APEST completo?
  let yPosition = 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 38, 50);
  doc.text('Como fica uma Igreja sem os Cinco Ministérios em funcionamento?', 14, yPosition);

  yPosition += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const textoAPEST = `
Igreja Disfuncional — Quando falta equilíbrio nos Ministérios

De acordo com Efésios 4, Deus deu à Igreja cinco tipos de dons ministeriais: Apostólico, Profético, Evangelístico, Pastoral e de Ensino (Mestre). Cada um deles reflete um aspecto do ministério de Cristo e é fundamental para o crescimento saudável da Igreja.

Quando um ou mais desses dons não estão ativos ou funcionando corretamente, a Igreja se torna desequilibrada e disfuncional. Veja como isso acontece na prática:

Quando falta o Apostólico (Fica só Proféta, Evangelista, Pastor e Mestre)
Se a liderança apostólica não estiver presente, a igreja tende a ser fechada, presa ao status quo, sem visão de avanço, expansão ou inovação. Ela perde sua capacidade de romper barreiras, plantar igrejas, começar novos movimentos e se torna estagnada, com medo de mudanças. Sem o dom apostólico, a igreja fica sem direcionamento para multiplicação.

Quando falta o Profético (Fica só Apóstolo, Evangelista, Pastor e Mestre)
Sem a influência do dom profético, a igreja perde a sensibilidade à voz de Deus, à correção e ao alinhamento espiritual. Ela se torna muito institucional, mecânica e desconectada da vontade de Deus. É uma igreja sem discernimento, vulnerável ao erro e sem clareza sobre o que Deus quer para aquele tempo e lugar.

Quando falta o Evangelístico (Fica só Apóstolo, Proféta, Pastor e Mestre)
Quando não há operação do dom evangelístico, a igreja se torna voltada apenas para dentro, esquecendo o mundo à sua volta. Ela perde o senso de missão e deixa de ser relevante na sociedade. Sem o evangelístico, poucas pessoas se convertem, o crescimento da igreja para e ela deixa de cumprir seu papel no avanço do Reino.

Quando falta o Pastoral (Fica só Apóstolo, Proféta, Evangelista e Mestre)
Se a função pastoral não está presente, a igreja se torna fria, sem cuidado, sem acolhimento, sem comunhão e sem restauração. As pessoas se sentem sozinhas, sem acompanhamento e acabam se afastando. É uma igreja que até pode crescer numericamente, mas não cuida dos seus membros, gerando feridos e abandonados.

Quando falta o Mestre (Ensino) (Fica só Apóstolo, Proféta, Evangelista e Pastor)
Sem o dom de ensino, a igreja se torna superficial, sem profundidade na Palavra. As pessoas não crescem em conhecimento bíblico, ficam vulneráveis a heresias e acabam vivendo uma fé rasa, baseada apenas em experiências e emoções. É uma igreja que não amadurece espiritualmente.
`;

  const textoDivididoAPEST = doc.splitTextToSize(textoAPEST, 180);
  doc.text(textoDivididoAPEST, 14, yPosition + 6);

  // === Adiciona Resumo dos Seus Dons na página 7 (antes do rodapé) ===
  // Garante que a inserção será feita na página correta (antes do rodapé)
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 102, 204);
  doc.text('Resumo dos Seus Dons', 14, pageHeight - 100);

  const resumoTableData = percentuais.map(p => [p.dom, `${p.valor.toFixed(1)}%`]);

  autoTable(doc, {
    head: [['Dom', 'Percentual']],
    body: resumoTableData,
    startY: pageHeight - 90,
    theme: 'grid',
    styles: { halign: 'center' },
    headStyles: { fillColor: [49, 75, 86] },
  });

  // Rodapé com barra colorida
  doc.setFillColor(4, 91, 98);
  doc.rect(0, pageHeight - 20, 210, 20, 'F');

  // Adicionar logo no rodapé (lado esquerdo)
  const img = new Image();
  img.src = logo;
  doc.addImage(img, 'PNG', 10, pageHeight - 18, 20, 20);

  // Adicionar ícone do Instagram
  const instagram = new Image();
  instagram.src = instagramIcon;
  doc.addImage(instagram, 'PNG', 60, pageHeight - 11, 4, 4);

  // Texto do Instagram ao lado do ícone
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('@fiveone.oficial', 66, pageHeight - 8);

  // Adicionar ícone do YouTube
  const youtube = new Image();
  youtube.src = youtubeIcon;
  doc.addImage(youtube, 'PNG', 100, pageHeight - 11, 4, 4);

  // Texto do YouTube ao lado do ícone
  doc.text('@Five_One_Movement', 106, pageHeight - 8);

  // Adicionar ícone do Gmail
  const gmail = new Image();
  gmail.src = gmailIcon;
  doc.addImage(gmail, 'PNG', 150, pageHeight - 11, 4, 4);

  // Texto do email ao lado do ícone
  doc.text('escolafiveone@gmail.com', 156, pageHeight - 8);

  // Remove diretamente a penúltima página (página 6)
  const totalPages = doc.getNumberOfPages();
  if (totalPages >= 6) {
    doc.deletePage(6);
  }

  doc.save(`Resultado-${name}.pdf`);
}
// Função para renderizar o PDF do Apostólico
function renderApostolico(
  doc: jsPDF,
  name: string,
  percentuais: { dom: string; valor: number }[]
) {
  // Cabeçalho Apostólico na página 3
  doc.addPage();
  aplicarFundo(doc);
  doc.setFillColor(240, 255, 250);
  doc.rect(0, 0, 210, 297, 'F');
  const headerImg = new Image();
  headerImg.src = headerApostolico;
  doc.addImage(headerImg, 'PNG', 20, 5, 170, 30);
  doc.setDrawColor(15, 38, 50);
  doc.setLineWidth(0.8);
  doc.line(0, 32, 210, 32);

  let currentHeight = 43;
  // === Inserção do texto descritivo antes das Características ===
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const textoDescricaoApostolico = `O dom apostólico é marcado por pessoas com forte senso de missão, visão ampliada do Reino e grande capacidade de liderar, inovar e mobilizar outros para a expansão da fé. Apóstolos são aqueles que rompem fronteiras, plantam novas obras, geram movimentos e sustentam o DNA do Reino em diferentes contextos. São pioneiros, empreendedores espirituais e catalisadores de transformação.

Além disso, carregam uma profunda consciência de que a Igreja não é um fim em si mesma, mas um meio para que o Reino de Deus avance. Eles possuem uma mentalidade translocal, que enxerga além das limitações geográficas, culturais e institucionais, conectando igrejas, ministérios, líderes e recursos em prol de uma missão global. O apóstolo é alguém que constantemente provoca a Igreja a sair do comodismo, do status quo e a abraçar o movimento, a multiplicação e o cumprimento da Grande Comissão.

O apóstolo maduro enxerga a igreja como um sistema vivo, composto por partes essenciais e interdependentes. Ele é guardião das ideias centrais (DNA) que mantêm a saúde do organismo e garante a fidelidade à visão e missão recebidas de Cristo. Costuma ser inquieto diante da estagnação, impulsionando a igreja a inovar, criar, expandir, fortalecer redes, levantar líderes e alcançar novos territórios.

Além disso, apóstolos são desenvolvedores de líderes, mobilizadores de recursos, conectores de redes ministeriais e responsáveis por manter a igreja em constante renovação e alinhamento à missão de Deus. Sua atuação é fundamental para que a igreja não se torne um fim em si mesma, mas continue avançando, crescendo e cumprindo seu papel no mundo. Onde o apóstolo atua, existe avanço, quebra de paradigmas, alinhamento espiritual e ativação do Corpo de Cristo para que viva plenamente sua vocação missional.`;

  const splitTextoDescricao = doc.splitTextToSize(textoDescricaoApostolico, 180);
  currentHeight = checkPageSpace(doc, currentHeight, splitTextoDescricao.length * 7);
  doc.text(splitTextoDescricao, 14, currentHeight);
  currentHeight += splitTextoDescricao.length * 7;

  // Usar uma cópia do array do perfil, nunca alterar global!
  const perfilContent = [...perfisMinisteriais['Apostólico']];

  // Renderização da Visão Geral (mantida apenas se necessário para outros campos)
  const visaoGeral = perfilContent.find(p => p.startsWith('VISÃO GERAL'));
  perfilContent.splice(perfilContent.findIndex(p => p.startsWith('VISÃO GERAL')), 1);
  if (visaoGeral) {
    // Características Apostólico
    currentHeight = checkPageSpace(doc, currentHeight, 50);
    const caracteristicasColuna1 = [
      'Visão global e sistêmica da igreja e do Reino',
      'Senso de missão e propósito inabalável',
      'Capacidade de liderar e inspirar grandes grupos',
      'Abertura ao novo, inovação e criatividade',
      'Coragem para assumir riscos e romper limites',
      'Facilidade para iniciar projetos e plantar igrejas'
    ];
    const caracteristicasColuna2 = [
      'Mobilizador de pessoas e recursos',
      'Conector entre diferentes ministérios e regiões',
      'Guardião do DNA e dos valores do Reino',
      'Capacidade de enxergar oportunidades estratégicas',
      'Aptidão para desenvolver e treinar líderes',
      'Inquietação diante do comodismo e da estagnação'
    ];
    currentHeight -= 40;
    const maxWidth = 85;
    let maxAlturaCol1 = 0;
    let maxAlturaCol2 = 0;
    caracteristicasColuna1.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidth);
      maxAlturaCol1 += split.length * 5;
    });
    caracteristicasColuna2.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidth);
      maxAlturaCol2 += split.length * 5;
    });
    const alturaCaracteristicas = 8 + Math.max(maxAlturaCol1, maxAlturaCol2) + 8;
    doc.setFillColor(4, 91, 98);
    doc.roundedRect(15, currentHeight - 10, 180, alturaCaracteristicas - 5, 4, 4, 'F');
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15.8, currentHeight - 9.2, 178.4, alturaCaracteristicas - 6.6, 3.2, 3.2, 'F');
    doc.setFillColor(4, 91, 98);
    doc.rect(15, currentHeight - 10, 180, 6, 'F');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('CARACTERÍSTICAS:', 18, currentHeight - 5);
    let caracteristicasY = currentHeight + 4;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    let offsetCol1 = 0, offsetCol2 = 0;
    caracteristicasColuna1.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidth);
      doc.text(split, 18, caracteristicasY + offsetCol1);
      offsetCol1 += split.length * 5;
    });
    caracteristicasColuna2.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidth);
      doc.text(split, 105, caracteristicasY + offsetCol2);
      offsetCol2 += split.length * 5;
    });
    currentHeight += alturaCaracteristicas + 2;
    // Funções Apostólico
    const funcoesColuna1 = [
      'Semeador do DNA da Igreja — transmite os valores e princípios fundamentais do Reino',
      'Plantador de igrejas e comunidades — inicia novas frentes de trabalho e fé',
      'Mobilizador de líderes — identifica, treina e envia pessoas para a missão'
    ];
    const funcoesColuna2 = [
      'Conector translocal — estabelece redes e parcerias entre igrejas e ministérios',
      'Provedor de inovação ministerial — introduz novas estratégias e metodologias',
      'Garantidor da fidelidade à visão e missão — mantém o foco no propósito original'
    ];
    currentHeight = checkPageSpace(doc, currentHeight, 50);
    const maxWidthFuncoes = 85;
    let maxAlturaFuncoesCol1 = 0;
    let maxAlturaFuncoesCol2 = 0;
    funcoesColuna1.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidthFuncoes);
      maxAlturaFuncoesCol1 += split.length * 5;
    });
    funcoesColuna2.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidthFuncoes);
      maxAlturaFuncoesCol2 += split.length * 5;
    });
    const alturaFuncoes = 8 + Math.max(maxAlturaFuncoesCol1, maxAlturaFuncoesCol2) + 8;
    doc.setFillColor(4, 91, 98);
    doc.roundedRect(15, currentHeight - 10, 180, alturaFuncoes - 5, 4, 4, 'F');
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15.8, currentHeight - 9.2, 178.4, alturaFuncoes - 6.6, 3.2, 3.2, 'F');
    doc.setFillColor(4, 91, 98);
    doc.rect(15, currentHeight - 10, 180, 6, 'F');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('FUNÇÕES PRINCIPAIS:', 18, currentHeight - 5);
    let funcoesY = currentHeight + 4;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    let offsetFuncoesCol1 = 0, offsetFuncoesCol2 = 0;
    funcoesColuna1.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidthFuncoes);
      doc.text(split, 18, funcoesY + offsetFuncoesCol1);
      offsetFuncoesCol1 += split.length * 5;
    });
    funcoesColuna2.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidthFuncoes);
      doc.text(split, 105, funcoesY + offsetFuncoesCol2);
      offsetFuncoesCol2 += split.length * 5;
    });
    currentHeight += alturaFuncoes + 2;
  }

  // Pontos Cegos Apostólico
  let paragraph = perfilContent.find(p => p.startsWith('PONTOS CEGOS E DESAFIOS'));
  if (paragraph) {
    let pontosColuna1: string[] = [
      'Autocracia e domínio excessivo',
      'Falta de empatia e sensibilidade relacional',
      'Impaciência com processos e pessoas',
      'Falta de compromisso com detalhes e rotinas',
      'Desgaste e esgotamento por excesso de atividades'
    ];
    let pontosColuna2: string[] = [
      'Dificuldade de delegar tarefas',
      'Tendência ao ativismo desenfreado',
      'Supervalorização do novo em detrimento do cuidado',
      'Desprezo por estruturas e tradições importantes',
      'Foco excessivo em resultados e metas'
    ];
    currentHeight = checkPageSpace(doc, currentHeight, 50);
    const maxWidthPontos = 85;
    let maxAlturaPontosCol1 = 0;
    let maxAlturaPontosCol2 = 0;
    pontosColuna1.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
      maxAlturaPontosCol1 += split.length * 5;
    });
    pontosColuna2.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
      maxAlturaPontosCol2 += split.length * 5;
    });
    const alturaPontos = 6 + 7 + 2 + Math.max(maxAlturaPontosCol1, maxAlturaPontosCol2) + 4;
    doc.setFillColor(4, 91, 98);
    doc.roundedRect(15, currentHeight - 10, 180, alturaPontos - 4, 4, 4, 'F');
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15.8, currentHeight - 9.2, 178.4, alturaPontos - 5.6, 3.2, 3.2, 'F');
    doc.setFillColor(4, 91, 98);
    doc.rect(15, currentHeight - 10, 180, 6, 'F');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('PONTOS CEGOS:', 18, currentHeight - 5);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(4, 91, 98);
    doc.text('(Cuidado com essas expressões de imaturidade)', 18, currentHeight + 2);
    let pontosY = currentHeight + 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    let offsetPontosCol1 = 0, offsetPontosCol2 = 0;
    pontosColuna1.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
      doc.text(split, 18, pontosY + offsetPontosCol1);
      offsetPontosCol1 += split.length * 5;
    });
    pontosColuna2.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
      doc.text(split, 105, pontosY + offsetPontosCol2);
      offsetPontosCol2 += split.length * 5;
    });
    currentHeight += alturaPontos + 2;
  }

  // Impacto Apostólico
  paragraph = perfilContent.find(p => p.startsWith('IMPACTO NA IGREJA'));
  if (paragraph) {
    const impactoApostolico = [
      'IMPACTO NA IGREJA: Extensão do Reino; Fortalecimento da missão; Inovação ministerial; Manutenção do DNA do Reino; Criação de redes ministeriais.',
      '',
      '• Sua atuação apostólica é fundamental para que a igreja não se torne um fim em si mesma, mas siga avançando, inovando e cumprindo sua missão. O apóstolo rompe barreiras, inicia movimentos, implanta novas igrejas e mantém a comunidade conectada ao propósito original de Cristo.',
      '',
      '• Você é chamado a ser um catalisador de transformação, mobilizando pessoas, recursos e estratégias para a expansão do Reino. Sua liderança inspira outros a saírem do comodismo, abraçarem desafios e participarem de algo maior do que eles mesmos.',
      '',
      '• Lembre-se de manter o equilíbrio entre avanço e cuidado, inovação e tradição, missão e comunhão. Um apóstolo maduro honra o passado, serve no presente e constrói o futuro da igreja com fidelidade, coragem e sabedoria.'
    ];
    let totalLines = 0;
    impactoApostolico.forEach(paragrafo => {
      const split = doc.splitTextToSize(paragrafo, 180);
      totalLines += split.length;
    });
    const lineHeight = 5.5;
    currentHeight = checkPageSpace(doc, currentHeight, totalLines * lineHeight);
    impactoApostolico.forEach(paragrafo => {
      const split = doc.splitTextToSize(paragrafo, 180);
      doc.text(split, 20, currentHeight);
      currentHeight += split.length * lineHeight;
    });
  }

  // Referências Bíblicas Apostólico
  // (Não existe campo 'REFERÊNCIAS BÍBLICAS' no array do Apostólico, então vamos inserir manualmente)
  currentHeight = checkPageSpace(doc, currentHeight, 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 38, 50);
  doc.text('REFERÊNCIAS BÍBLICAS:', 20, currentHeight);
  currentHeight += 8;
  const referenciasApostolico = [
    'Efésios 4:11-13',
    'Atos 13:1-3',
    'Romanos 15:20',
    '1 Coríntios 3:10',
    '2 Coríntios 10:13-16'
  ];
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  referenciasApostolico.forEach((ref) => {
    doc.text(ref, 20, currentHeight);
    currentHeight += 7;
  });
  doc.setFont('helvetica', 'normal');
  const textoRef = '“E ele designou alguns para apóstolos, outros para profetas, outros para evangelistas, outros para pastores e mestres, com o fim de preparar os santos para a obra do ministério, para que o corpo de Cristo seja edificado.” (Efésios 4:11-12)';
  const splitRef = doc.splitTextToSize(textoRef, 180);
  doc.text(splitRef, 20, currentHeight);
  currentHeight += splitRef.length * 7 + 8;

  // ESCOLA FIVE ONE
  doc.addPage();
  doc.setFillColor(4, 91, 98); // #045b62
  doc.rect(0, 0, 210, 297, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(173, 216, 230); // Azul claro para título
  doc.text('ESCOLA FIVE ONE', 105, 32, { align: 'center' });
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1);
  doc.line(55, 37, 155, 37);
  doc.setFontSize(14);
  doc.setTextColor(173, 216, 230);
  doc.text('Próximo passo na sua jornada ministerial!', 105, 50, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  const escolaParagrafo1 = 'Agora que você descobriu mais sobre o seu Dom Ministerial, é hora de se aprofundar, ser treinado e ativado de forma intencional.';
  const escolaParagrafo2 = 'Na Escola Five One, você terá acesso a uma formação completa, bíblica e prática, baseada nos cinco dons ministeriais de Efésios 4.';
  const escolaTextWidth = 160;
  let escolaY = 62;
  const splitEscola1 = doc.splitTextToSize(escolaParagrafo1, escolaTextWidth);
  splitEscola1.forEach((line: string, i: number) => {
    doc.text(line, 105, escolaY + i * 7, { align: 'center' });
  });
  escolaY += splitEscola1.length * 7 + 3;
  const splitEscola2 = doc.splitTextToSize(escolaParagrafo2, escolaTextWidth);
  splitEscola2.forEach((line: string, i: number) => {
    doc.text(line, 105, escolaY + i * 7, { align: 'center' });
  });
  escolaY += splitEscola2.length * 7 + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(173, 216, 230);
  const chamada2 = 'Venha desenvolver seu chamado, ativar seu dom e se posicionar no propósito que Deus preparou para você.';
  const splitChamada2 = doc.splitTextToSize(chamada2, escolaTextWidth);
  splitChamada2.forEach((line: string, i: number) => {
    doc.text(line, 105, escolaY + i * 7, { align: 'center' });
  });
  escolaY += splitChamada2.length * 7 + 10;
  doc.setFontSize(12);
  doc.setTextColor(173, 216, 230);
  const final = 'Faça parte da Escola Five One e viva o seu chamado ministerial!';
  const splitFinal = doc.splitTextToSize(final, escolaTextWidth);
  splitFinal.forEach((line: string, i: number) => {
    doc.text(line, 105, escolaY + i * 7, { align: 'center' });
  });
  escolaY += splitFinal.length * 7 + 3;
  const pageWidth = doc.internal.pageSize.getWidth();
  const buttonWidth = 150;
  const buttonHeight = 10;
  const buttonX = (pageWidth - buttonWidth) / 2;
  const buttonY = escolaY + 5;
  doc.setFillColor(0, 123, 255); // azul #007BFF
  doc.roundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 3, 3, 'F');
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Clique Aqui para Entender sobre a Formação Ministerial', pageWidth / 2, buttonY + 7, { align: 'center' });
  doc.link(buttonX, buttonY, buttonWidth, buttonHeight, { url: 'https://fiveonemovement.com/#/formacao-ministerial' });
  escolaY = buttonY + buttonHeight + 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('Escaneie o QR Code e entre para o nosso grupo de lista de espera!', 105, escolaY, { align: 'center' });
  const imgWidth = 80;
  const imgHeight = 80;
  const x = (pageWidth - imgWidth) / 2;
  doc.addImage(qrcodeListaEspera, 'PNG', x, escolaY + 8, imgWidth, imgHeight);

  // Página final: Resumo dos Seus Dons
  doc.addPage();
  aplicarFundo(doc);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 102, 204);
  doc.text('Resumo dos Seus Dons', 14, 20);

  const tableData = percentuais.map(p => [p.dom, `${p.valor.toFixed(1)}%`]);

  autoTable(doc, {
    head: [['Dom', 'Percentual']],
    body: tableData,
    startY: 30,
    theme: 'grid',
    styles: { halign: 'center' },
    headStyles: { fillColor: [49, 75, 86] },
    didDrawPage: () => {
      aplicarFundo(doc);
    }
  });

  // Nova página para o texto do APEST
  doc.addPage();
  aplicarFundo(doc);

  // Bloco de texto: Como é a Igreja sem o APEST completo?
  let yPosition = 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 38, 50);
  doc.text('Como fica uma Igreja sem os Cinco Ministérios em funcionamento?', 14, yPosition);

  yPosition += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const textoAPEST = `
Igreja Disfuncional — Quando falta equilíbrio nos Ministérios

De acordo com Efésios 4, Deus deu à Igreja cinco tipos de dons ministeriais: Apostólico, Profético, Evangelístico, Pastoral e de Ensino (Mestre). Cada um deles reflete um aspecto do ministério de Cristo e é fundamental para o crescimento saudável da Igreja.

Quando um ou mais desses dons não estão ativos ou funcionando corretamente, a Igreja se torna desequilibrada e disfuncional. Veja como isso acontece na prática:

Quando falta o Apostólico (Fica só Proféta, Evangelista, Pastor e Mestre)
Se a liderança apostólica não estiver presente, a igreja tende a ser fechada, presa ao status quo, sem visão de avanço, expansão ou inovação. Ela perde sua capacidade de romper barreiras, plantar igrejas, começar novos movimentos e se torna estagnada, com medo de mudanças. Sem o dom apostólico, a igreja fica sem direcionamento para multiplicação.

Quando falta o Profético (Fica só Apóstolo, Evangelista, Pastor e Mestre)
Sem a influência do dom profético, a igreja perde a sensibilidade à voz de Deus, à correção e ao alinhamento espiritual. Ela se torna muito institucional, mecânica e desconectada da vontade de Deus. É uma igreja sem discernimento, vulnerável ao erro e sem clareza sobre o que Deus quer para aquele tempo e lugar.

Quando falta o Evangelístico (Fica só Apóstolo, Proféta, Pastor e Mestre)
Quando não há operação do dom evangelístico, a igreja se torna voltada apenas para dentro, esquecendo o mundo à sua volta. Ela perde o senso de missão e deixa de ser relevante na sociedade. Sem o evangelístico, poucas pessoas se convertem, o crescimento da igreja para e ela deixa de cumprir seu papel no avanço do Reino.

Quando falta o Pastoral (Fica só Apóstolo, Proféta, Evangelista e Mestre)
Se a função pastoral não está presente, a igreja se torna fria, sem cuidado, sem acolhimento, sem comunhão e sem restauração. As pessoas se sentem sozinhas, sem acompanhamento e acabam se afastando. É uma igreja que até pode crescer numericamente, mas não cuida dos seus membros, gerando feridos e abandonados.

Quando falta o Mestre (Ensino) (Fica só Apóstolo, Proféta, Evangelista e Pastor)
Sem o dom de ensino, a igreja se torna superficial, sem profundidade na Palavra. As pessoas não crescem em conhecimento bíblico, ficam vulneráveis a heresias e acabam vivendo uma fé rasa, baseada apenas em experiências e emoções. É uma igreja que não amadurece espiritualmente.
`;

  const textoDivididoAPEST = doc.splitTextToSize(textoAPEST, 180);
  doc.text(textoDivididoAPEST, 14, yPosition + 6);

  // === Adiciona Resumo dos Seus Dons na página 7 (antes do rodapé) ===
  // Garante que a inserção será feita na página correta (antes do rodapé)
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 102, 204);
  doc.text('Resumo dos Seus Dons', 14, pageHeight - 100);

  const resumoTableData = percentuais.map(p => [p.dom, `${p.valor.toFixed(1)}%`]);

  autoTable(doc, {
    head: [['Dom', 'Percentual']],
    body: resumoTableData,
    startY: pageHeight - 90,
    theme: 'grid',
    styles: { halign: 'center' },
    headStyles: { fillColor: [49, 75, 86] },
  });

  // Rodapé com barra colorida
  doc.setFillColor(4, 91, 98);
  doc.rect(0, pageHeight - 20, 210, 20, 'F');

  // Adicionar logo no rodapé (lado esquerdo)
  const img = new Image();
  img.src = logo;
  doc.addImage(img, 'PNG', 10, pageHeight - 18, 20, 20);

  // Adicionar ícone do Instagram
  const instagram = new Image();
  instagram.src = instagramIcon;
  doc.addImage(instagram, 'PNG', 60, pageHeight - 11, 4, 4);

  // Texto do Instagram ao lado do ícone
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('@fiveone.oficial', 66, pageHeight - 8);

  // Adicionar ícone do YouTube
  const youtube = new Image();
  youtube.src = youtubeIcon;
  doc.addImage(youtube, 'PNG', 100, pageHeight - 11, 4, 4);

  // Texto do YouTube ao lado do ícone
  doc.text('@Five_One_Movement', 106, pageHeight - 8);

  // Adicionar ícone do Gmail
  const gmail = new Image();
  gmail.src = gmailIcon;
  doc.addImage(gmail, 'PNG', 150, pageHeight - 11, 4, 4);

  // Texto do email ao lado do ícone
  doc.text('escolafiveone@gmail.com', 156, pageHeight - 8);

  // Remove diretamente a penúltima página (página 6)
  const totalPages = doc.getNumberOfPages();
  if (totalPages >= 6) {
    doc.deletePage(6);
  }

  doc.save(`Resultado-${name}.pdf`);
}
// Função para renderizar o PDF do Mestre
function renderMestre(
  doc: jsPDF,
  name: string,
  percentuais: { dom: string; valor: number }[]
) {
  doc.addPage();
  aplicarFundo(doc);
  doc.setFillColor(240, 255, 250);
  doc.rect(0, 0, 210, 297, 'F');
  const headerImg = new Image();
  headerImg.src = headerMestre;
  doc.addImage(headerImg, 'PNG', 20, 5, 170, 30);
  doc.setDrawColor(15, 38, 50);
  doc.setLineWidth(0.8);
  doc.line(0, 32, 210, 32);

  let currentHeight = 43;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const textoIntro = `O dom de Mestre é concedido por Deus àqueles que possuem uma paixão profunda pela verdade e pela Palavra. Mestres são aqueles que amam estudar as Escrituras, organizar o conhecimento, estruturar o ensino e transmiti-lo de forma clara, precisa e transformadora. São guardiões da sã doutrina e responsáveis por conduzir o Corpo de Cristo ao conhecimento da verdade, protegendo-o contra heresias, confusões teológicas e interpretações distorcidas.

O mestre não é apenas alguém que acumula informações, mas alguém que entende profundamente a importância de aplicar a verdade bíblica à vida prática. Seu ensino não visa apenas ao acúmulo de conhecimento, mas à formação de discípulos maduros, conscientes, enraizados na fé e aptos a viverem de forma coerente com os princípios do Reino de Deus.

O dom ministerial do Mestre é indispensável para a edificação da Igreja, pois fortalece as bases doutrinárias, promove discernimento espiritual e capacita os crentes a viverem de acordo com a vontade de Deus. Mestres são instrumentos para levar a Igreja à maturidade, protegendo-a dos ventos de doutrina (Efésios 4:14) e guiando-a no caminho da verdade.`;
  const splitIntro = doc.splitTextToSize(textoIntro, 180);
  doc.text(splitIntro, 14, currentHeight);
  currentHeight += splitIntro.length * 7;

  // Características e Funções (similar renderApostolico/renderProfetico)
  // Características
  currentHeight = checkPageSpace(doc, currentHeight, 50);
  const caracteristicasColuna1 = [
    'Paixão pelo estudo e ensino das Escrituras',
    'Habilidade para comunicar verdades complexas de forma clara',
    'Discernimento doutrinário e zelo pela verdade',
    'Capacidade de estruturar conhecimento e organizar conteúdos',
    'Facilidade de mentorear e discipular outros',
    'Incentivo ao pensamento crítico e à busca do entendimento'
  ];
  const caracteristicasColuna2 = [
    'Atenção aos detalhes e precisão teológica',
    'Busca constante por aprofundamento bíblico',
    'Preocupação com a aplicação prática da Palavra',
    'Promotor de debates saudáveis e perguntas construtivas',
    'Aptidão para desenvolver materiais, estudos e recursos',
    'Capacidade de fundamentar a fé dos outros'
  ];
  currentHeight -= 10;
  const maxWidth = 85;
  let maxAlturaCol1 = 0;
  let maxAlturaCol2 = 0;
  caracteristicasColuna1.forEach((item) => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidth);
    maxAlturaCol1 += split.length * 5;
  });
  caracteristicasColuna2.forEach((item) => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidth);
    maxAlturaCol2 += split.length * 5;
  });
  const alturaCaracteristicas = 8 + Math.max(maxAlturaCol1, maxAlturaCol2) + 8;
  doc.setFillColor(4, 91, 98);
  doc.roundedRect(15, currentHeight - 10, 180, alturaCaracteristicas - 5, 4, 4, 'F');
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15.8, currentHeight - 9.2, 178.4, alturaCaracteristicas - 6.6, 3.2, 3.2, 'F');
  doc.setFillColor(4, 91, 98);
  doc.rect(15, currentHeight - 10, 180, 6, 'F');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('CARACTERÍSTICAS:', 18, currentHeight - 5);
  let caracteristicasY = currentHeight + 4;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  let offsetCol1 = 0, offsetCol2 = 0;
  caracteristicasColuna1.forEach((item) => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidth);
    doc.text(split, 18, caracteristicasY + offsetCol1);
    offsetCol1 += split.length * 5;
  });
  caracteristicasColuna2.forEach((item) => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidth);
    doc.text(split, 105, caracteristicasY + offsetCol2);
    offsetCol2 += split.length * 5;
  });
  currentHeight += alturaCaracteristicas + 2;

  // Funções
  const funcoesColuna1 = [
    'Ensino bíblico sólido e contextualizado',
    'Formação de discípulos maduros',
    'Mentoria intelectual e espiritual',
    'Defesa da fé e combate a heresias'
  ];
  const funcoesColuna2 = [
    'Elaboração de materiais e recursos de ensino',
    'Promoção do pensamento crítico e da busca pelo conhecimento',
    'Capacitação da igreja para interpretar e aplicar a Palavra'
  ];
  currentHeight = checkPageSpace(doc, currentHeight, 50);
  const maxWidthFuncoes = 85;
  let maxAlturaFuncoesCol1 = 0;
  let maxAlturaFuncoesCol2 = 0;
  funcoesColuna1.forEach((item) => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthFuncoes);
    maxAlturaFuncoesCol1 += split.length * 5;
  });
  funcoesColuna2.forEach((item) => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthFuncoes);
    maxAlturaFuncoesCol2 += split.length * 5;
  });
  const alturaFuncoes = 8 + Math.max(maxAlturaFuncoesCol1, maxAlturaFuncoesCol2) + 8;
  doc.setFillColor(4, 91, 98);
  doc.roundedRect(15, currentHeight - 10, 180, alturaFuncoes - 5, 4, 4, 'F');
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15.8, currentHeight - 9.2, 178.4, alturaFuncoes - 6.6, 3.2, 3.2, 'F');
  doc.setFillColor(4, 91, 98);
  doc.rect(15, currentHeight - 10, 180, 6, 'F');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('FUNÇÕES PRINCIPAIS:', 18, currentHeight - 5);
  let funcoesY = currentHeight + 4;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  let offsetFuncoesCol1 = 0, offsetFuncoesCol2 = 0;
  funcoesColuna1.forEach((item) => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthFuncoes);
    doc.text(split, 18, funcoesY + offsetFuncoesCol1);
    offsetFuncoesCol1 += split.length * 5;
  });
  funcoesColuna2.forEach((item) => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthFuncoes);
    doc.text(split, 105, funcoesY + offsetFuncoesCol2);
    offsetFuncoesCol2 += split.length * 5;
  });
  currentHeight += alturaFuncoes + 2;

  // Pontos Cegos
  currentHeight = checkPageSpace(doc, currentHeight, 50);
  const pontosColuna1 = [
    'Intelectualismo excessivo e distanciamento emocional',
    'Dificuldade em lidar com aprendizes lentos',
    'Tendência ao debate e à crítica',
    'Desconexão com a prática e com a vida cotidiana'
  ];
  const pontosColuna2 = [
    'Orgulho do conhecimento e sensação de superioridade',
    'Foco excessivo em detalhes e teorias',
    'Impatience com abordagens diferentes',
    'Negligência do cuidado relacional'
  ];
  const maxWidthPontos = 85;
  let maxAlturaPontosCol1 = 0;
  let maxAlturaPontosCol2 = 0;
  pontosColuna1.forEach((item) => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
    maxAlturaPontosCol1 += split.length * 5;
  });
  pontosColuna2.forEach((item) => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
    maxAlturaPontosCol2 += split.length * 5;
  });
  const alturaPontos = 6 + 7 + 2 + Math.max(maxAlturaPontosCol1, maxAlturaPontosCol2) + 4;
  doc.setFillColor(4, 91, 98);
  doc.roundedRect(15, currentHeight - 10, 180, alturaPontos - 4, 4, 4, 'F');
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15.8, currentHeight - 9.2, 178.4, alturaPontos - 5.6, 3.2, 3.2, 'F');
  doc.setFillColor(4, 91, 98);
  doc.rect(15, currentHeight - 10, 180, 6, 'F');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('PONTOS CEGOS:', 18, currentHeight - 5);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(4, 91, 98);
  doc.text('(Cuidado com essas expressões de imaturidade)', 18, currentHeight + 2);
  let pontosY = currentHeight + 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  let offsetPontosCol1 = 0, offsetPontosCol2 = 0;
  pontosColuna1.forEach((item) => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
    doc.text(split, 18, pontosY + offsetPontosCol1);
    offsetPontosCol1 += split.length * 5;
  });
  pontosColuna2.forEach((item) => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
    doc.text(split, 105, pontosY + offsetPontosCol2);
    offsetPontosCol2 += split.length * 5;
  });
  currentHeight += alturaPontos + 2;

  // Impacto
  currentHeight = checkPageSpace(doc, currentHeight, 40);
  const impactoMestre = [
    'IMPACTO NA IGREJA: Maturidade doutrinária; Crescimento no entendimento bíblico; Proteção contra heresias; Estímulo à busca pelo conhecimento; Igreja fundamentada na verdade.',
    '',
    '• Sua atuação como mestre é fundamental para que a igreja cresça em profundidade, discernimento e maturidade. Você protege a igreja das falsas doutrinas, fundamenta a fé dos irmãos e estimula a busca contínua pelo conhecimento de Deus.',
    '',
    '• Por meio do ensino, você equipa os crentes para viverem de modo coerente com a Palavra, tornando-os discípulos sólidos e preparados para toda boa obra.',
    '',
    '• Lembre-se de equilibrar o conhecimento com o amor, a teoria com a prática, e de ser um facilitador do crescimento integral da igreja.'
  ];
  let totalLines = 0;
  impactoMestre.forEach(paragrafo => {
    const split = doc.splitTextToSize(paragrafo, 180);
    totalLines += split.length;
  });
  const lineHeight = 5.5;
  currentHeight = checkPageSpace(doc, currentHeight, totalLines * lineHeight);
  impactoMestre.forEach(paragrafo => {
    const split = doc.splitTextToSize(paragrafo, 180);
    doc.text(split, 20, currentHeight);
    currentHeight += split.length * lineHeight;
  });

  // Referências Bíblicas
  currentHeight = checkPageSpace(doc, currentHeight, 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 38, 50);
  doc.text('REFERÊNCIAS BÍBLICAS:', 20, currentHeight);
  currentHeight += 8;
  const referenciasMestre = [
    'Atos 18:24-28',
    'Atos 20:20',
    '1 Coríntios 12:28',
    'Tiago 3:1'
  ];
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  referenciasMestre.forEach((ref) => {
    doc.text(ref, 20, currentHeight);
    currentHeight += 7;
  });
  doc.setFont('helvetica', 'normal');
  const textoRef = '“Meus irmãos, muitos de vós não sejam mestres, sabendo que receberemos um juízo mais severo.” (Tiago 3:1)';
  const splitRef = doc.splitTextToSize(textoRef, 180);
  doc.text(splitRef, 20, currentHeight);
  currentHeight += splitRef.length * 7 + 8;

  // ESCOLA FIVE ONE
  doc.addPage();
  doc.setFillColor(4, 91, 98); // #045b62
  doc.rect(0, 0, 210, 297, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(173, 216, 230); // Azul claro para título
  doc.text('ESCOLA FIVE ONE', 105, 32, { align: 'center' });
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1);
  doc.line(55, 37, 155, 37);
  doc.setFontSize(14);
  doc.setTextColor(173, 216, 230);
  doc.text('Próximo passo na sua jornada ministerial!', 105, 50, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  const escolaParagrafo1 = 'Agora que você descobriu mais sobre o seu Dom Ministerial, é hora de se aprofundar, ser treinado e ativado de forma intencional.';
  const escolaParagrafo2 = 'Na Escola Five One, você terá acesso a uma formação completa, bíblica e prática, baseada nos cinco dons ministeriais de Efésios 4.';
  const escolaTextWidth = 160;
  let escolaY = 62;
  const splitEscola1 = doc.splitTextToSize(escolaParagrafo1, escolaTextWidth);
  splitEscola1.forEach((line: string, i: number) => {
    doc.text(line, 105, escolaY + i * 7, { align: 'center' });
  });
  escolaY += splitEscola1.length * 7 + 3;
  const splitEscola2 = doc.splitTextToSize(escolaParagrafo2, escolaTextWidth);
  splitEscola2.forEach((line: string, i: number) => {
    doc.text(line, 105, escolaY + i * 7, { align: 'center' });
  });
  escolaY += splitEscola2.length * 7 + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(173, 216, 230);
  const chamada2 = 'Venha desenvolver seu chamado, ativar seu dom e se posicionar no propósito que Deus preparou para você.';
  const splitChamada2 = doc.splitTextToSize(chamada2, escolaTextWidth);
  splitChamada2.forEach((line: string, i: number) => {
    doc.text(line, 105, escolaY + i * 7, { align: 'center' });
  });
  escolaY += splitChamada2.length * 7 + 10;
  doc.setFontSize(12);
  doc.setTextColor(173, 216, 230);
  const final = 'Faça parte da Escola Five One e viva o seu chamado ministerial!';
  const splitFinal = doc.splitTextToSize(final, escolaTextWidth);
  splitFinal.forEach((line: string, i: number) => {
    doc.text(line, 105, escolaY + i * 7, { align: 'center' });
  });
  escolaY += splitFinal.length * 7 + 3;
  const pageWidth = doc.internal.pageSize.getWidth();
  const buttonWidth = 150;
  const buttonHeight = 10;
  const buttonX = (pageWidth - buttonWidth) / 2;
  const buttonY = escolaY + 5;
  doc.setFillColor(0, 123, 255); // azul #007BFF
  doc.roundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 3, 3, 'F');
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Clique Aqui para Entender sobre a Formação Ministerial', pageWidth / 2, buttonY + 7, { align: 'center' });
  doc.link(buttonX, buttonY, buttonWidth, buttonHeight, { url: 'https://fiveonemovement.com/#/formacao-ministerial' });
  escolaY = buttonY + buttonHeight + 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('Escaneie o QR Code e entre para o nosso grupo de lista de espera!', 105, escolaY, { align: 'center' });
  const imgWidth = 80;
  const imgHeight = 80;
  const x = (pageWidth - imgWidth) / 2;
  doc.addImage(qrcodeListaEspera, 'PNG', x, escolaY + 8, imgWidth, imgHeight);

  // Página final: Resumo dos Seus Dons
  doc.addPage();
  aplicarFundo(doc);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 102, 204);
  doc.text('Resumo dos Seus Dons', 14, 20);

  const tableData = percentuais.map(p => [p.dom, `${p.valor.toFixed(1)}%`]);

  autoTable(doc, {
    head: [['Dom', 'Percentual']],
    body: tableData,
    startY: 30,
    theme: 'grid',
    styles: { halign: 'center' },
    headStyles: { fillColor: [49, 75, 86] },
    didDrawPage: () => {
      aplicarFundo(doc);
    }
  });

  // Nova página para o texto do APEST
  doc.addPage();
  aplicarFundo(doc);

  // Bloco de texto: Como é a Igreja sem o APEST completo?
  let yPosition = 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 38, 50);
  doc.text('Como fica uma Igreja sem os Cinco Ministérios em funcionamento?', 14, yPosition);

  yPosition += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const textoAPEST = `
Igreja Disfuncional — Quando falta equilíbrio nos Ministérios

De acordo com Efésios 4, Deus deu à Igreja cinco tipos de dons ministeriais: Apostólico, Profético, Evangelístico, Pastoral e de Ensino (Mestre). Cada um deles reflete um aspecto do ministério de Cristo e é fundamental para o crescimento saudável da Igreja.

Quando um ou mais desses dons não estão ativos ou funcionando corretamente, a Igreja se torna desequilibrada e disfuncional. Veja como isso acontece na prática:

Quando falta o Apostólico (Fica só Proféta, Evangelista, Pastor e Mestre)
Se a liderança apostólica não estiver presente, a igreja tende a ser fechada, presa ao status quo, sem visão de avanço, expansão ou inovação. Ela perde sua capacidade de romper barreiras, plantar igrejas, começar novos movimentos e se torna estagnada, com medo de mudanças. Sem o dom apostólico, a igreja fica sem direcionamento para multiplicação.

Quando falta o Profético (Fica só Apóstolo, Evangelista, Pastor e Mestre)
Sem a influência do dom profético, a igreja perde a sensibilidade à voz de Deus, à correção e ao alinhamento espiritual. Ela se torna muito institucional, mecânica e desconectada da vontade de Deus. É uma igreja sem discernimento, vulnerável ao erro e sem clareza sobre o que Deus quer para aquele tempo e lugar.

Quando falta o Evangelístico (Fica só Apóstolo, Proféta, Pastor e Mestre)
Quando não há operação do dom evangelístico, a igreja se torna voltada apenas para dentro, esquecendo o mundo à sua volta. Ela perde o senso de missão e deixa de ser relevante na sociedade. Sem o evangelístico, poucas pessoas se convertem, o crescimento da igreja para e ela deixa de cumprir seu papel no avanço do Reino.

Quando falta o Pastoral (Fica só Apóstolo, Proféta, Evangelista e Mestre)
Se a função pastoral não está presente, a igreja se torna fria, sem cuidado, sem acolhimento, sem comunhão e sem restauração. As pessoas se sentem sozinhas, sem acompanhamento e acabam se afastando. É uma igreja que até pode crescer numericamente, mas não cuida dos seus membros, gerando feridos e abandonados.

Quando falta o Mestre (Ensino) (Fica só Apóstolo, Proféta, Evangelista e Pastor)
Sem o dom de ensino, a igreja se torna superficial, sem profundidade na Palavra. As pessoas não crescem em conhecimento bíblico, ficam vulneráveis a heresias e acabam vivendo uma fé rasa, baseada apenas em experiências e emoções. É uma igreja que não amadurece espiritualmente.
`;

  const textoDivididoAPEST = doc.splitTextToSize(textoAPEST, 180);
  doc.text(textoDivididoAPEST, 14, yPosition + 6);

  // === Adiciona Resumo dos Seus Dons na página 7 (antes do rodapé) ===
  // Garante que a inserção será feita na página correta (antes do rodapé)
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 102, 204);
  doc.text('Resumo dos Seus Dons', 14, pageHeight - 100);

  const resumoTableData = percentuais.map(p => [p.dom, `${p.valor.toFixed(1)}%`]);

  autoTable(doc, {
    head: [['Dom', 'Percentual']],
    body: resumoTableData,
    startY: pageHeight - 90,
    theme: 'grid',
    styles: { halign: 'center' },
    headStyles: { fillColor: [49, 75, 86] },
  });

  // Rodapé com barra colorida
  doc.setFillColor(4, 91, 98);
  doc.rect(0, pageHeight - 20, 210, 20, 'F');

  // Adicionar logo no rodapé (lado esquerdo)
  const img = new Image();
  img.src = logo;
  doc.addImage(img, 'PNG', 10, pageHeight - 18, 20, 20);

  // Adicionar ícone do Instagram
  const instagram = new Image();
  instagram.src = instagramIcon;
  doc.addImage(instagram, 'PNG', 60, pageHeight - 11, 4, 4);

  // Texto do Instagram ao lado do ícone
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('@fiveone.oficial', 66, pageHeight - 8);

  // Adicionar ícone do YouTube
  const youtube = new Image();
  youtube.src = youtubeIcon;
  doc.addImage(youtube, 'PNG', 100, pageHeight - 11, 4, 4);

  // Texto do YouTube ao lado do ícone
  doc.text('@Five_One_Movement', 106, pageHeight - 8);

  // Adicionar ícone do Gmail
  const gmail = new Image();
  gmail.src = gmailIcon;
  doc.addImage(gmail, 'PNG', 150, pageHeight - 11, 4, 4);

  // Texto do email ao lado do ícone
  doc.text('escolafiveone@gmail.com', 156, pageHeight - 8);

  // Remove diretamente a penúltima página (página 6)
  const totalPages = doc.getNumberOfPages();
  if (totalPages >= 6) {
    doc.deletePage(6);
  }

  doc.save(`Resultado-${name}.pdf`);
}