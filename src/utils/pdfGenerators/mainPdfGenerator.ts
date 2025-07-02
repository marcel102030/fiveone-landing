// Helper para carregar imagem e adicionar ao PDF
export async function loadImageAndAdd(doc: jsPDFType, src: string, format: 'PNG' | 'JPEG', x: number, y: number, w: number, h: number) {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      doc.addImage(img, format, x, y, w, h);
      resolve();
    };
    img.onerror = reject;
  });
}
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import type { jsPDF as jsPDFType } from 'jspdf';



export async function renderHeader(doc: jsPDFType, name: string, date: string, domPrincipal: string) {
  // Cabeçalho com fundo verde escuro ocupando os primeiros 50mm
  doc.setFillColor(4, 91, 98); // Cor verde escuro
  doc.rect(0, 0, 210, 50, 'F');

  // Adicionar logo da Five One no canto esquerdo
  await loadImageAndAdd(doc, '/assets/images/logo_maior.png', 'PNG', 10, 5, 40, 40);

  // Ajustar posições para evitar sobreposição
  const leftX = 70;
  // const rightX = 130;
  const valueX = leftX + 45; // Aproxima os valores dos rótulos
  let linhaY = 18;

  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('FIVE ONE MOVEMENT', leftX, linhaY);

  linhaY += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Nome:', leftX, linhaY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${name}`, valueX, linhaY);

  linhaY += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Data da Avaliação:', leftX, linhaY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${date}`, valueX, linhaY);

  linhaY += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Dom Ministerial:', leftX, linhaY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${domPrincipal}`, valueX, linhaY);
}

export function aplicarFundo(doc: jsPDFType) {
  doc.setFillColor(240, 255, 250); // Cor verde água extremamente claro
  doc.rect(0, 0, 210, 297, 'F');
}
export async function renderEscolaFiveOne(doc: jsPDFType) {
    // Adiciona uma nova página com fundo verde escuro
    doc.addPage();
    doc.setFillColor(4, 91, 98); // Cor verde escuro
    doc.rect(0, 0, 210, 297, 'F');
  
    // Título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(173, 216, 230); // Azul claro
    doc.text('ESCOLA FIVE ONE', 105, 40, { align: 'center' });
  
    // Linha horizontal abaixo do título
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1);
    doc.line(30, 45, 180, 45);
  
    let escolaY = 55;
  
    // Subtítulo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(196, 207, 212);
    doc.text('Próximo passo na sua jornada ministerial!', 105, escolaY, { align: 'center' });
    escolaY += 10;
  
    // Parágrafos
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    const escolaTextWidth = 160;
  
    const paragrafo1 = 'Agora que você descobriu mais sobre o seu Dom Ministerial, é hora de se aprofundar, ser treinado e ativado de forma intencional.';
    const paragrafo2 = 'Na Escola Five One, você terá acesso a uma formação ministerial e teológica completa, 100% online, voltada para o desenvolvimento e ativação do seu Dom Ministerial, com base nos cinco dons descritos em Efésios 4.';
    const paragrafo3 = 'Venha desenvolver seu chamado, ativar seu dom e se posicionar no propósito que Deus preparou para você.';
    const paragrafo4 = 'Faça parte da Escola Five One e viva o seu chamado ministerial!';
  
    const split1: string[] = doc.splitTextToSize(paragrafo1, escolaTextWidth);
    split1.forEach((line: string, i: number) => doc.text(line, 105, escolaY + i * 7, { align: 'center' }));
    escolaY += split1.length * 7 + 10;

    const split2: string[] = doc.splitTextToSize(paragrafo2, escolaTextWidth);
    split2.forEach((line: string, i: number) => doc.text(line, 105, escolaY + i * 7, { align: 'center' }));
    escolaY += split2.length * 7 + 10;

    const split3: string[] = doc.splitTextToSize(paragrafo3, escolaTextWidth);
    split3.forEach((line: string, i: number) => doc.text(line, 105, escolaY + i * 7, { align: 'center' }));
    escolaY += split3.length * 7 + 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(196, 207, 212);
    const split4: string[] = doc.splitTextToSize(paragrafo4, escolaTextWidth);
    split4.forEach((line: string, i: number) => doc.text(line, 105, escolaY + i * 7, { align: 'center' }));
    escolaY += split4.length * 7 + 5;
  
    // Botão
    const pageWidth = doc.internal.pageSize.getWidth();
    const buttonWidth = 150;
    const buttonHeight = 12;
    const buttonX = (pageWidth - buttonWidth) / 2;
    const buttonY = escolaY;
  
    doc.setFillColor(42, 125, 255); // Azul claro
    doc.roundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 3, 3, 'F');
  
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Clique Aqui para Entender sobre a Formação Ministerial', pageWidth / 2, buttonY + 7, { align: 'center' });
  
    doc.link(buttonX, buttonY, buttonWidth, buttonHeight, { url: 'https://fiveonemovement.com/#/formacao-ministerial' });
  
    escolaY = buttonY + buttonHeight + 10;
  
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('Escaneie o QR Code e entre para o nosso grupo de lista de espera!', 105, escolaY, { align: 'center' });
  
    // QR Code
    const imgWidth = 90;
    const imgHeight = 90;
    const x = (pageWidth - imgWidth) / 2;
    await loadImageAndAdd(doc, '/assets/images/qrcode_lista_espera.jpeg', 'JPEG', x, escolaY + 4, imgWidth, imgHeight);
  }


export async function renderResumoDosDons(doc: jsPDFType, percentuais: { dom: string; valor: number }[]): Promise<void> {
  aplicarFundo(doc);

  let yTitulo = 16;

  // Título principal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(4, 91, 98);
  doc.text('Relação dos 5 Ministérios', 105, yTitulo, { align: 'center' });

  // Subtítulo com espaçamento seguro
  yTitulo += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(4, 91, 98);
  doc.text('Quando falta equilíbrio nos Ministérios', 105, yTitulo, { align: 'center' });

  // --- Todos os preenchimentos de fundo e faixa central viriam aqui, se existissem ---


  let currentY = yTitulo;  // Atualize o currentY para seguir após o subtítulo

  // Layout das caixas dos dons
  const boxX = 15;
  const boxWidth = 180;
  const boxInnerPadding = 3; // mm (reduzido de 5 para 3)
  currentY += 2;  // Comece um pouco abaixo do subtítulo
  const boxSpacing = 5; // espaço vertical entre caixas (reduzido de 7 para 5)

  // Dados dos dons e descrições
  const dons = [
    {
      titulo: 'Quando falta o Apostólico (Fica só Profeta, Evangelista, Pastor e Mestre):',
      texto: 'A igreja tende a ser fechada, sem visão de expansão e inovação. Ela perde sua capacidade de romper barreiras, plantar igrejas, começar novos movimentos e se torna estagnada, com medo de mudanças. Sem o dom apostólico, a igreja fica sem direcionamento para multiplicação.'
    },
    {
      titulo: 'Quando falta o Profético (Fica só Apóstolo, Evangelista, Pastor e Mestre):',
      texto: 'Sem a influência do dom profético, a igreja perde a sensibilidade à voz de Deus, a correção e ao alinhamento espiritual. Ela se torna muito institucional, mecânica e desconectada da vontade de Deus. É uma igreja sem discernimento, vulnerável ao erro e sem clareza sobre o que Deus quer para aquele tempo e lugar.'
    },
    {
      titulo: 'Quando falta o Evangelístico (Fica só Apóstolo, Profeta, Pastor e Mestre):',
      texto: 'Quando não há operação do dom evangelístico, a igreja se torna voltada apenas para dentro, esquecendo o mundo à sua volta. Ela perde o senso de missão e deixa de ser relevante na sociedade. Sem o evangelístico, poucas pessoas se convertem, o crescimento da igreja para e ela deixa de cumprir seu papel no avanço do Reino.'
    },
    {
      titulo: 'Quando falta o Pastoral (Fica só Apóstolo, Profeta, Evangelista e Mestre):',
      texto: 'Se a função pastoral não está presente, a igreja se torna fria, sem cuidado, sem acolhimento, sem comunhão e sem restauração. As pessoas se sentem sozinhas, sem acompanhamento e acabam se afastando. É uma igreja que até pode crescer numericamente, mas não cuida dos seus membros, gerando feridos e abandonados.'
    },
    {
      titulo: 'Quando falta o Mestre (Ensino) (Fica só Apóstolo, Profeta, Evangelista e Pastor):',
      texto: 'Sem o dom de ensino, a igreja se torna superficial, sem profundidade na Palavra. As pessoas não crescem em conhecimento bíblico, ficam vulneráveis a heresias e acabam vivendo uma fé rasa, baseada apenas em experiências e emoções. É uma igreja que não amadurece espiritualmente.'
    }
  ];

  // Introdução geral
  const intro = '';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  // Caixa de introdução (sem borda azul, só fundo claro)
  const introLines = doc.splitTextToSize(intro, boxWidth - 2 * boxInnerPadding);
  const introHeight = introLines.length * 5.1 + 2 * boxInnerPadding;
  doc.setFillColor(235, 255, 250);
  doc.rect(boxX, currentY, boxWidth, introHeight, 'F');
  doc.text(introLines, boxX + boxInnerPadding, currentY + boxInnerPadding + 4);
  currentY += introHeight + boxSpacing;

  // Para cada dom: caixa cinza clara, borda azul, texto
  dons.forEach(({ titulo, texto }) => {
    // Preparar texto do dom
    const tituloLines = doc.splitTextToSize(titulo, boxWidth - 2 * boxInnerPadding);
    const textoLines = doc.splitTextToSize(texto, boxWidth - 2 * boxInnerPadding);
    const totalLines = tituloLines.length + textoLines.length;
    const boxHeight = totalLines * 5.1 + 2 * boxInnerPadding;

    // Caixa com fundo cinza claro e borda verde escuro do rodapé
    doc.setFillColor(230, 230, 230);
    doc.setDrawColor(4, 91, 98); // Verde escuro igual ao rodapé
    doc.rect(boxX, currentY, boxWidth, boxHeight, 'FD');

    // Texto dentro da caixa
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9); // reduzido de 10 para 9
    doc.setTextColor(0, 0, 0);
    let yText = currentY + boxInnerPadding + 4;
    doc.text(tituloLines, boxX + boxInnerPadding, yText, { maxWidth: boxWidth - 2 * boxInnerPadding });
    yText += tituloLines.length * 5.1;
    doc.text(textoLines, boxX + boxInnerPadding, yText, { maxWidth: boxWidth - 2 * boxInnerPadding });

    currentY += boxHeight + boxSpacing;
  });

  // Título do resumo dos dons
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14); // reduzido de 18 para 14
  doc.setTextColor(0, 51, 102); // Azul médio, mesma cor do subtítulo "Quando falta equilíbrio nos Ministérios"
  let resumoTitleY = currentY + 4;
  doc.text('Resumo dos Seus Dons', 14, resumoTitleY);

  // Verificar se o espaço restante é suficiente para a tabela
  const pageHeight = doc.internal.pageSize.getHeight();
  if (resumoTitleY > pageHeight - 50) {
    doc.addPage();
    resumoTitleY = 20;  // Reiniciar margem superior da nova página
  }

  // Tabela de percentuais
  const tableData = percentuais.map(p => [p.dom, `${p.valor.toFixed(1)}%`]);
  await autoTable(doc, {
    head: [['Dom', 'Percentual']],
    body: tableData,
    startY: resumoTitleY + 6,  // Adicionado espaçamento abaixo do título
    theme: 'grid',
    styles: { halign: 'center' },
    bodyStyles: { fontSize: 8 },
    headStyles: { fillColor: [49, 75, 86], fontSize: 9 },
  });

  await renderRodape(doc);
}
export async function renderRodape(doc: jsPDFType): Promise<void> {
  const pageHeight = doc.internal.pageSize.getHeight();

  // Fundo do rodapé
  doc.setFillColor(4, 91, 98); // Verde escuro
  doc.rect(0, pageHeight - 20, 210, 20, 'F');

  // Adicionar logo
  await loadImageAndAdd(doc, '/assets/images/logo_maior.png', 'PNG', 10, pageHeight - 18, 20, 20);
  await loadImageAndAdd(doc, '/assets/images/instagram.png', 'PNG', 60, pageHeight - 11, 4, 4);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('@fiveone.oficial', 66, pageHeight - 8);

  await loadImageAndAdd(doc, '/assets/images/youtube.png', 'PNG', 100, pageHeight - 11, 4, 4);
  doc.text('@Five_One_Movement', 106, pageHeight - 8);

  await loadImageAndAdd(doc, '/assets/images/gmail.png', 'PNG', 150, pageHeight - 11, 4, 4);
  doc.text('escolafiveone@gmail.com', 156, pageHeight - 8);
}
import { renderApostolico } from './pdfGeneratorApostolo';
import { renderProfeta } from './pdfGeneratorProfeta';
import { renderEvangelistico } from './pdfGeneratorEvangelista';
import { renderPastor } from './pdfGeneratorPastor';
import { renderMestre } from './pdfGeneratorMestre';

export async function renderIntroducao(doc: jsPDFType): Promise<void> {
  aplicarFundo(doc);

  let y = 30;

  // Título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 38, 50);
  doc.text('VISÃO GERAL SOBRE OS 5 MINISTÉRIOS', 105, y, { align: 'center' });

  // Linha horizontal
  y += 5;
  doc.setDrawColor(15, 38, 50);
  doc.setLineWidth(1.5);
  doc.line(30, y, 180, y);

  y += 10;

  // Texto de Introdução
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  const texto = `
A sua jornada ministerial começa aqui. Este documento é fruto de uma avaliação fundamentada nas Escrituras, especialmente em Efésios 4:7-13, onde o apóstolo Paulo revela que, ao subir aos céus, Cristo concedeu dons ministeriais ao Seu Corpo — a Igreja. Esses dons não são simples talentos ou habilidades naturais, mas expressões da própria natureza de Jesus, distribuídas de forma intencional e estratégica para que a Igreja cumpra sua missão na Terra.

Deus estabeleceu cinco dons ministeriais: Apostólico, Profético, Evangelístico, Pastoral e de Ensino (Mestre). Cada um desses dons reflete uma dimensão do caráter e da missão de Cristo. Eles são, ao mesmo tempo, um chamado divino, uma vocação espiritual e uma função vital para a edificação, crescimento, maturidade e expansão do Reino de Deus. A operação plena desses dons é essencial para que a Igreja se torne um organismo saudável, relevante e capaz de expressar a plenitude de Cristo em todas as esferas da sociedade.

Quando esses dons operam juntos, a Igreja cresce de forma equilibrada e missional. No entanto, quando um ou mais desses dons não são reconhecidos, ativados ou desenvolvidos, a comunidade cristã se torna desequilibrada, disfuncional, centrada em si mesma e, muitas vezes, desconectada da missão que lhe foi confiada.

Esta avaliação não é apenas uma análise de perfil. Ela é uma ferramenta que tem o objetivo de te ajudar a compreender melhor o propósito específico que Deus colocou sobre sua vida, te guiando na descoberta, desenvolvimento e ativação do seu Dom Ministerial. Saber quem você é no Corpo de Cristo muda a forma como você vive, serve e impacta pessoas, tanto dentro quanto fora da igreja.

Ao entender profundamente como o seu dom opera — suas características, funções, pontos fortes e desafios — você estará mais alinhado à missão que Deus te confiou. Isso não apenas trará mais clareza e direção pessoal, mas também contribuirá para a construção de uma Igreja mais forte, madura e alinhada ao Reino.

Portanto, este relatório é muito mais do que informação. Ele é um convite para que você viva sua vocação com intencionalidade, paixão e comprometimento, entendendo que o seu dom é indispensável para que a Igreja revele Cristo ao mundo.
`;

  const textoFormatado = doc.splitTextToSize(texto.trim(), 180);
  doc.text(textoFormatado, 15, y);
}

import meuPerfilMinisterial from '/assets/images/PerfilMinisterial3.png';

export async function generatePDF(name: string, date: string, percentuais: { dom: string; valor: number }[], domPrincipal: string) {
  const doc = new jsPDF();

  aplicarFundo(doc);
  // const maiorPercentual = percentuais.reduce((prev, current) => (current.valor > prev.valor ? current : prev));
  await renderHeader(doc, name, date, domPrincipal);

  // Adicionar imagem 'meuPerfilMinisterial' na primeira página (ajuste de tamanho e posição como no PDF antigo)
  const perfilImg = new Image();
  perfilImg.src = meuPerfilMinisterial;
  doc.addImage(perfilImg, 'PNG', 20, 70, 170, 210); // Y alterado de 110 para 70

  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 38, 50);
  doc.text('Meu Perfil Ministerial', 105, 95, { align: 'center' });  // Y alterado de 85 para 95
  // Linha horizontal abaixo do título "Meu Perfil Ministerial"
  doc.setDrawColor(15, 38, 50); // Cor semelhante ao título
  doc.setLineWidth(1.5);
  doc.line(60, 100, 150, 100);  // Y alterado de 90 para 100

  doc.addPage();
  await renderIntroducao(doc);

  doc.addPage();
  switch (domPrincipal) {
    case 'Apostólico':
      await renderApostolico(doc);
      break;
    case 'Profeta':
      await renderProfeta(doc);
      break;
    case 'Evangelístico':
      await renderEvangelistico(doc);
      break;
    case 'Pastor':
      await renderPastor(doc);
      break;
    case 'Mestre':
      await renderMestre(doc);
      break;
    default:
      console.error('Dom ministerial não reconhecido:', domPrincipal);
      break;
  }

  await renderEscolaFiveOne(doc);
  doc.addPage();
  await renderResumoDosDons(doc, percentuais);
  await renderRodape(doc);

  console.log('Dom recebido:', domPrincipal);
  console.log('Salvando PDF agora...');
  const nomeArquivo = `Resultado_FiveOne_${domPrincipal}`.normalize('NFD').replace(/[\u0300-\u036f\s]/g, '');
  await new Promise<void>((resolve) => {
    doc.save(`${nomeArquivo}.pdf`);
    resolve();
  });
}