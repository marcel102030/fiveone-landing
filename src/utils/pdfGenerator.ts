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
    'REFERÊNCIAS BÍBLICAS: Atos 11:27-28; 13:1; 21:10-11; 1 Coríntios 14:1,3.',
    'PONTOS CEGOS E DESAFIOS: Dureza ou insensibilidade; Isolamento; Orgulho espiritual; Impaciência com processos; Falta de graça ao corrigir.',
    'IMPACTO NA IGREJA: Sensibilidade à voz de Deus; Alinhamento à Palavra; Correção de rumos; Estímulo à oração e intercessão; Ambientes de transparência e santidade.',
    'CONCLUSÃO: O dom Profético é fundamental para manter a igreja sensível à direção do Espírito, alinhada à verdade e pronta para responder ao chamado de Deus em cada tempo.'
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

  doc.addPage();
  aplicarFundo(doc);

  // Fundo verde água extremamente claro em toda a página 3
  doc.setFillColor(240, 255, 250); // Cor #F0FFF9 (um verde água extremamente claro)
  doc.rect(0, 0, 210, 297, 'F');
  // Cabeçalho específico do Apostólico na página 3
  if (domPrincipal === 'Apostólico') {
    const headerImg = new Image();
    headerImg.src = headerApostolico;
    doc.addImage(headerImg, 'PNG', 20, 5, 170, 30);
    // Linha horizontal ajustada para ficar dentro do cabeçalho, logo abaixo da imagem
    doc.setDrawColor(15, 38, 50);
    doc.setLineWidth(0.8);
    doc.line(0, 32, 210, 32);
  }

  // Seção: Meu Perfil Ministerial na terceira página
  doc.setFontSize(14);
  // doc.text('Meu Perfil Ministerial', 14, 20);
  currentHeight = 35;

  const perfilContent = perfisMinisteriais[domPrincipal];

  // Renderização da Visão Geral e Características ANTES do forEach
  const visaoGeral = perfilContent.find(p => p.startsWith('VISÃO GERAL'));
  if (visaoGeral) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 38, 50);
    currentHeight = checkPageSpace(doc, currentHeight, 8);
    // doc.text('VISÃO GERAL DO DOM APOSTÓLICO:', 14, currentHeight);
    currentHeight += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const splitText = doc.splitTextToSize(
      'O dom apostólico é marcado por pessoas que carregam uma visão clara e ampla sobre o propósito da igreja. Quem tem esse dom costuma ser inquieto com o status atual e sente constantemente o desejo de expandir, inovar e levar o Reino de Deus a novos lugares.\n\n' +
      'Essas pessoas são naturalmente estratégicas, pioneiras e movidas por uma paixão intensa pela missão. São líderes que enxergam além, identificam oportunidades e criam caminhos onde não existem. Sua atuação não se limita ao ambiente local, pois carregam uma mentalidade de expansão e plantação de igrejas, comunidades e projetos que gerem transformação.\n\n' +
      'Aqueles que operam no dom apostólico costumam ter facilidade em lidar com riscos, são adaptáveis, visionários e impulsionam movimentos. Não se acomodam com estruturas prontas, porque carregam dentro de si o chamado para gerar, renovar e multiplicar.\n\n' +
      'O apóstolo é, ao mesmo tempo, guardião e disseminador do DNA da igreja, ou seja, da cultura, dos valores e dos princípios que garantem a saúde espiritual e a missão do Corpo de Cristo. Ele entende a igreja como um organismo vivo, composto por partes que precisam funcionar em harmonia.\n\n' +
      'Por isso, seu papel é vital na liderança, na construção de ambientes saudáveis, no fortalecimento da missão e na expansão do Reino de Deus.',
      180
    );
    currentHeight = checkPageSpace(doc, currentHeight, splitText.length * 7);
    doc.text(splitText, 14, currentHeight);
    currentHeight += splitText.length * 7;

    // doc.setDrawColor(200);
    // currentHeight = checkPageSpace(doc, currentHeight, 4);
    // doc.line(14, currentHeight, 196, currentHeight);
    // currentHeight += 4;

    // Renderiza Características do Apostólico
    if (domPrincipal === 'Apostólico') {
      // Checa espaço antes das características
      currentHeight = checkPageSpace(doc, currentHeight, 50);
      const caracteristicasColuna1 = [
        'Pensamento visionário e motivação',
        'Confortável cruzando fronteiras - intelectuais, sociais ou culturais',
        'Interesses empresariais para construir comunidades de fé',
        'Começar algo novo é energizante',
        'Pioneirismo em novos empreendimentos',
        'Decisor Estratégico'
      ];

      const caracteristicasColuna2 = [
        'Abordagens e soluções inovadoras',
        'Desconfortável com o status quo',
        'Vê as coisas de forma holística, parte de um sistema maior',
        'Compreende múltiplas dinâmicas e componentes',
        'Relacionamentos profundos à distância, em redes externas',
        'Precisa se mudar ocasionalmente para buscar uma coisa nova'
      ];

      // Ajuste para subir o bloco das características
      currentHeight -= 28;
      // --- Bloco visual para Características ---
      // Calcular altura da caixa das características
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
      // Caixa de fundo
      doc.setFillColor(4, 91, 98); // #045b62
      doc.roundedRect(15, currentHeight - 10, 180, alturaCaracteristicas - 5, 4, 4, 'F');
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(15.8, currentHeight - 9.2, 178.4, alturaCaracteristicas - 6.6, 3.2, 3.2, 'F');
      // Faixa de título
      doc.setFillColor(4, 91, 98);
      doc.rect(15, currentHeight - 10, 180, 6, 'F');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('CARACTERÍSTICAS:', 18, currentHeight - 5);
      // Conteúdo das características
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

      // --- Bloco visual para Funções Principais ---
      // Declarações das funções (colunas)
      const funcoesColuna1 = [
        'Semeando o DNA da igreja por meio de missões e obras que ampliam o movimento',
        'Manter um compromisso permanente de envio (missão) em toda a organização',
        'Estendendo o impacto missionário da igreja',
        'Manter a conformidade em torno de ideias e cultura centrais (DNA)'
      ];

      const funcoesColuna2 = [
        'Manter um compromisso estratégico com a estratégia de plantação de igrejas e liderança pioneira',
        'Garantir agilidade organizacional, adaptabilidade e escalabilidade',
        'Mobilização de líderes, recursos e igrejas'
      ];

      currentHeight = checkPageSpace(doc, currentHeight, 50);
      // Calcular altura da caixa das funções
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
      // Caixa de fundo Funções Principais
      doc.setFillColor(4, 91, 98);
      doc.roundedRect(15, currentHeight - 10, 180, alturaFuncoes - 5, 4, 4, 'F');
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(15.8, currentHeight - 9.2, 178.4, alturaFuncoes - 6.6, 3.2, 3.2, 'F');
      // Faixa de título Funções
      doc.setFillColor(4, 91, 98);
      doc.rect(15, currentHeight - 10, 180, 6, 'F');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('FUNÇÕES PRINCIPAIS:', 18, currentHeight - 5);
      // Conteúdo das funções
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
  }

  perfilContent.forEach(paragraph => {
    // Evita duplicação da visão geral e da seção Funções Principais
    if (paragraph.startsWith('VISÃO GERAL DO DOM APOSTÓLICO')) return;
    if (paragraph.startsWith('FUNÇÕES PRINCIPAIS')) return;

    // Substitui renderização dos pontos cegos do Apostólico por bloco customizado
    if (
      domPrincipal === 'Apostólico' &&
      paragraph.startsWith('PONTOS CEGOS E DESAFIOS')
    ) {
      // Declarações dos pontos cegos (colunas)
      const pontosColuna1 = [
        'Tendência ao autoritarismo ou domínio excessivo',
        'Falta de empatia e sensibilidade relacional',
        'Impaciência com processos e pessoas',
        'Desgaste por excesso de trabalho',
      ];
      const pontosColuna2 = [
        'Negligência de detalhes e processos',
        'Dificuldade em se submeter a lideranças',
        'Tendência ao isolamento',
        'Desconexão com a base local'
      ];

      currentHeight = checkPageSpace(doc, currentHeight, 50);
      // Calcular altura da caixa dos pontos cegos
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
      // Altura: faixa título (6), subtítulo (7), espaçamento (2), bullets (máx), padding (4)
      const alturaPontos = 6 + 7 + 2 + Math.max(maxAlturaPontosCol1, maxAlturaPontosCol2) + 4;
      // Caixa de fundo
      doc.setFillColor(4, 91, 98);
      doc.roundedRect(15, currentHeight - 10, 180, alturaPontos - 4, 4, 4, 'F');
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(15.8, currentHeight - 9.2, 178.4, alturaPontos - 5.6, 3.2, 3.2, 'F');
      // Faixa de título (altura 6)
      doc.setFillColor(4, 91, 98);
      doc.rect(15, currentHeight - 10, 180, 6, 'F');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('PONTOS CEGOS:', 18, currentHeight - 5);
      // Subtítulo logo abaixo do título, alinhado com X=18, Y=currentHeight+2, itálico, #045b62
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(4, 91, 98);
      doc.text('(Cuidado com essas expressões de imaturidade)', 18, currentHeight + 2);
      // Conteúdo dos bullets, começa em Y = currentHeight + 8
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
      return;
    }

    // Bloco customizado do Impacto e da Escola para Apostólico — REMOVIDO, agora renderiza fora das caixas
    // As seções "IMPACTO", "REFERÊNCIAS BÍBLICAS" e "ESCOLA FIVE ONE" não terão mais caixas, apenas texto padrão
    if (
      domPrincipal === 'Apostólico' &&
      paragraph.startsWith('IMPACTO NA IGREJA')
    ) {
      // Renderização padrão do texto de impacto na igreja (fora de caixa)
      const splitText = doc.splitTextToSize(paragraph, 180);
      currentHeight = checkPageSpace(doc, currentHeight, splitText.length * 7);
      doc.text(splitText, 20, currentHeight);
      currentHeight += splitText.length * 7;
      // Renderiza os textos de impacto (os três bullets), agora como texto comum
      const impactoTextos = [
        '• Transmita visão para aqueles ao seu redor. Não tenha medo de deixar sua paixão e entusiasmo incendiar a vida dos outros. Ouça as perguntas e comentários dos outros. Muitas vezes, esses elementos identificam detalhes que precisam ser integrados à sua mensagem, proporcionando maior clareza. Não tenha medo de explicar demais por que certas pessoas, organizações e recursos são necessários para estabilizar a visão.',
        '• As pessoas mais próximas a você provavelmente têm uma mentalidade apostólica ou profética. Peça-lhes para ajudar a explicar e fornecer uma estratégia para a visão. É improvável que saibam como realizar a visão. Permita que eles inspirem outros em direção à compreensão. Recrute e libere outros indivíduos com ideias semelhantes para semear a visão dentro da estrutura do movimento.',
        '• O que você vê como necessário para promover uma causa missionária pode não ser visto imediatamente por aqueles próximos a você. Visualize dentro da igreja local, explicando temas para reuniões anuais, eventos, campanhas financeiras e indivíduos. Dependendo de sua mentalidade, alguns líderes apostólicos servem melhor inspirando pessoas individualmente ou em grandes grupos.'
      ];
      impactoTextos.forEach(paragrafo => {
        const split = doc.splitTextToSize(paragrafo, 180);
        currentHeight = checkPageSpace(doc, currentHeight, split.length * 7);
        doc.text(split, 20, currentHeight);
        currentHeight += split.length * 7;
      });
      // Renderização das referências bíblicas (fora de caixa)
      const referencia1 = `“Depois disso, o Senhor designou outros setenta e dois e os enviou, dois a dois, adiante dele, a todas as cidades e lugares aonde ele estava para ir. Ele lhes disse: 'A colheita é grande, mas os trabalhadores são poucos. Peça ao Senhor da messe, portanto, que envie trabalhadores para o seu campo de colheita. Ir! Estou enviando vocês como cordeiros no meio de lobos.'”`;
      const splitRef1 = doc.splitTextToSize(referencia1, 180);
      const referencia2 = `"O que, afinal, é Apolo? E o que é Paulo? Apenas servos, por meio dos quais vocês acreditaram - como o Senhor designou a cada um a sua tarefa. Eu plantei a semente, Apolo regou, mas Deus a fez crescer. Então Nem o que planta nem o que rega são alguma coisa, mas somente Deus, que faz as coisas crescerem. O que planta e o que rega têm um só propósito, e cada um receberá conforme o seu próprio trabalho. Pois nós somos cooperadores de Deus. Vós sois lavoura de Deus, edifício de Deus. [...] Porque ninguém pode lançar outro fundamento, senão o que já está posto, que é Jesus Cristo."`;
      const splitRef2 = doc.splitTextToSize(referencia2, 180);
      // Título da seção de referências
      currentHeight = checkPageSpace(doc, currentHeight, 8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 38, 50);
      doc.text('REFERÊNCIAS BÍBLICAS:', 20, currentHeight);
      currentHeight += 8;
      // Conteúdo das referências
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text('Lucas 10: 1-3', 20, currentHeight);
      currentHeight += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(splitRef1, 20, currentHeight);
      currentHeight += splitRef1.length * 7 + 5;
      doc.setFont('helvetica', 'bold');
      doc.text('1 Coríntios 3: 5-9,11', 20, currentHeight);
      currentHeight += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(splitRef2, 20, currentHeight);
      currentHeight += splitRef2.length * 7 + 8;
      // ESCOLA FIVE ONE — Padrão anterior, fundo inteiro #045b62, textos brancos, centralizado, sem caixa arredondada
      doc.addPage();
      // Fundo inteiro #045b62
      doc.setFillColor(4, 91, 98); // #045b62
      doc.rect(0, 0, 210, 297, 'F');
      // Centralizar título principal
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(173, 216, 230); // Azul claro para título
      doc.text('ESCOLA FIVE ONE', 105, 32, { align: 'center' });
      // Linha horizontal decorativa branca, comprimento médio
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(1);
      doc.line(55, 37, 155, 37);
      // Chamada centralizada
      doc.setFontSize(14);
      doc.setTextColor(173, 216, 230); // Azul claro para título
      doc.text('Próximo passo na sua jornada ministerial!', 105, 50, { align: 'center' });
      // Dois parágrafos explicativos, centralizados e justificados
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255); // branco para parágrafos
      const escolaParagrafo1 = 'Agora que você descobriu mais sobre o seu Dom Ministerial, é hora de se aprofundar, ser treinado e ativado de forma intencional.';
      const escolaParagrafo2 = 'Na Escola Five One, você terá acesso a uma formação completa, bíblica e prática, baseada nos cinco dons ministeriais de Efésios 4.';
      // Centralizar e justificar: usar text em várias linhas, centralizando bloco
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
      // Destaque em negrito, maior, centralizado
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(173, 216, 230); // Azul claro para título
      const chamada2 = 'Venha desenvolver seu chamado, ativar seu dom e se posicionar no propósito que Deus preparou para você.';
      const splitChamada2 = doc.splitTextToSize(chamada2, escolaTextWidth);
      splitChamada2.forEach((line: string, i: number) => {
        doc.text(line, 105, escolaY + i * 7, { align: 'center' });
      });
      escolaY += splitChamada2.length * 7 + 10;
      // Frase final negrito, centralizada
      doc.setFontSize(12);
      doc.setTextColor(173, 216, 230); // Azul claro para título
      const final = 'Faça parte da Escola Five One e viva o seu chamado ministerial!';
      const splitFinal = doc.splitTextToSize(final, escolaTextWidth);
      splitFinal.forEach((line: string, i: number) => {
        doc.text(line, 105, escolaY + i * 7, { align: 'center' });
      });
      escolaY += splitFinal.length * 7 + 3;

      // === Botão visual clicável para Formação Ministerial ===
      // Botão link
      const pageWidth = doc.internal.pageSize.getWidth();
      const buttonWidth = 150;
      const buttonHeight = 10;
      const buttonX = (pageWidth - buttonWidth) / 2;
      const buttonY = escolaY + 5;

      // Desenhar botão
      doc.setFillColor(0, 123, 255); // azul #007BFF
      doc.roundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 3, 3, 'F');

      // Texto do botão
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Clique Aqui para Entender sobre a Formação Ministerial', pageWidth / 2, buttonY + 7, { align: 'center' });

      // Link funcional no botão
      doc.link(buttonX, buttonY, buttonWidth, buttonHeight, { url: 'https://fiveonemovement.com/#/formacao-ministerial' });

      // Atualizar posição do Y após o botão
      escolaY = buttonY + buttonHeight + 6;

      // Orientação QR code, centralizada
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255); // branco para instrução do QR
      doc.text('Escaneie o QR Code e entre para o nosso grupo de lista de espera!', 105, escolaY, { align: 'center' });
      // QR Code centralizado
      const imgWidth = 80;
      const imgHeight = 80;
      const x = (pageWidth - imgWidth) / 2;
      doc.addImage(qrcodeListaEspera, 'PNG', x, escolaY + 8, imgWidth, imgHeight);
    } else {
      // Renderização padrão para demais parágrafos
      const splitText = doc.splitTextToSize(paragraph, 180);
      currentHeight = checkPageSpace(doc, currentHeight, splitText.length * 7);
      doc.text(splitText, 20, currentHeight);
      currentHeight += splitText.length * 7;
    }
  });

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
};