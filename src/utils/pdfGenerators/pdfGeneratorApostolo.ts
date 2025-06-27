import { jsPDF } from 'jspdf';
import { aplicarFundo, loadImageAndAdd } from './mainPdfGenerator';



export async function renderApostolico(doc: jsPDF, name: string, date: string, percentuais: any) {
  await renderTextoApostolico(doc, name, date);
}

async function renderTextoApostolico(doc: jsPDF, name: string, date: string) {
  aplicarFundo(doc);

  await loadImageAndAdd(doc, '/assets/images/apostolico_fundo_claro.png', 'PNG', 50, 10, 110, 30);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(0, 35, 210, 35);

  let alturaAtual = 28;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);

  alturaAtual += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);

  const texto = `
O dom apostólico é marcado por pessoas que carregam uma visão clara e ampla sobre o propósito da igreja. Quem tem esse dom costuma ser inquieto com o status atual e sente constantemente o desejo de expandir, inovar e levar o Reino de Deus a novos lugares.

Essas pessoas são naturalmente estratégicas, pioneiras e movidas por uma paixão intensa pela missão. São líderes que enxergam além, identificam oportunidades e criam caminhos onde não existem. Sua atuação não se limita ao ambiente local, pois carregam uma mentalidade de expansão e plantação de igrejas, comunidades e projetos que gerem transformação.

Aqueles que operam no dom apostólico costumam ter facilidade em lidar com riscos, são adaptáveis, visionários e impulsionam movimentos. Não se acomodam com estruturas prontas, porque carregam dentro de si o chamado para gerar, renovar e multiplicar.

O apóstolo é, ao mesmo tempo, guardião e disseminador do DNA da igreja, ou seja, da cultura, dos valores e dos princípios que garantem a saúde espiritual e a missão do Corpo de Cristo. Ele entende a igreja como um organismo vivo, composto por partes que precisam funcionar em harmonia.

Por isso, seu papel é vital na liderança, na construção de ambientes saudáveis, no fortalecimento da missão e na expansão do Reino de Deus.
`;

  const splitText = doc.splitTextToSize(texto, 180);
  doc.text(splitText, 15, alturaAtual);

  // Espaçamento antes das caixas
  let currentHeight = alturaAtual + splitText.length * 5 + 10;

  // ---------- Caixa CARACTERÍSTICAS ----------
  const caracteristicasColuna1 = [
    'Visão estratégica e motivação constante',
    'Facilidade em lidar com diferentes culturas e ideias',
    'Empreendedor espiritual',
    'Energizado por novos desafios',
    'Inovador e pioneiro',
    'Decisivo em momentos estratégicos'
  ];

  const caracteristicasColuna2 = [
    'Busca soluções fora do comum',
    'Inquieto com o status atual',
    'Enxerga o todo de forma integrada',
    'Consegue entender várias dinâmicas ao mesmo tempo',
    'Mantém relações profundas, mesmo à distância',
    'Gosta de mudar para abrir novos caminhos'
  ];

  let maxAlturaCol1 = 0;
  let maxAlturaCol2 = 0;
  const maxWidth = 85;

  // Calcular altura máxima de cada coluna
  caracteristicasColuna1.forEach(item => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidth);
    maxAlturaCol1 += split.length * 5;
  });

  caracteristicasColuna2.forEach(item => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidth);
    maxAlturaCol2 += split.length * 5;
  });

  const alturaCaracteristicas = 8 + Math.max(maxAlturaCol1, maxAlturaCol2) + 8;

  // Caixa de fundo
  doc.setFillColor(4, 91, 98);
  doc.roundedRect(15, currentHeight - 10, 180, alturaCaracteristicas - 5, 4, 4, 'F');
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15.8, currentHeight - 9.2, 178.4, alturaCaracteristicas - 6.6, 3.2, 3.2, 'F');

  // Título da Caixa
  doc.setFillColor(4, 91, 98);
  doc.rect(15, currentHeight - 10, 180, 10, 'F');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('CARACTERÍSTICAS:', 18, currentHeight - 3);

  // Texto das colunas
  let caracteristicasY = currentHeight + 4;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  let offsetCol1 = 0;
  let offsetCol2 = 0;

  caracteristicasColuna1.forEach(item => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidth);
    doc.text(split, 18, caracteristicasY + offsetCol1);
    offsetCol1 += split.length * 5;
  });

  caracteristicasColuna2.forEach(item => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidth);
    doc.text(split, 105, caracteristicasY + offsetCol2);
    offsetCol2 += split.length * 5;
  });

  currentHeight += alturaCaracteristicas + 2;

  // ---------- Caixa FUNÇÕES PRINCIPAIS ----------
  const funcoesColuna1 = [
    'Transmitir o DNA da igreja por meio de ações missionais que impulsionam o avanço do Reino',
    'Sustentar um compromisso contínuo com o envio de pessoas e a expansão missionária',
    'Ampliar o alcance e o impacto apostólico da igreja em diferentes contextos',
    'Proteger a essência da visão e da cultura da igreja, mantendo unidade e clareza de propósito'
  ];

  const funcoesColuna2 = [
    'Garantir estratégias claras para plantação de novas igrejas e desenvolvimento de líderes pioneiros',
    'Promover agilidade organizacional, incentivando inovação e capacidade de adaptação',
    'Mobilizar líderes, recursos e comunidades em prol da missão e da expansão do Reino'
  ];

  let maxAlturaFuncoesCol1 = 0;
  let maxAlturaFuncoesCol2 = 0;
  const maxWidthFuncoes = 85;

  // Calcular altura das funções
  funcoesColuna1.forEach(item => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthFuncoes);
    maxAlturaFuncoesCol1 += split.length * 5;
  });

  funcoesColuna2.forEach(item => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthFuncoes);
    maxAlturaFuncoesCol2 += split.length * 5;
  });

  const alturaFuncoes = 8 + Math.max(maxAlturaFuncoesCol1, maxAlturaFuncoesCol2) + 8;

  // Caixa de fundo
  doc.setFillColor(4, 91, 98);
  doc.roundedRect(15, currentHeight - 10, 180, alturaFuncoes - 5, 4, 4, 'F');
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15.8, currentHeight - 9.2, 178.4, alturaFuncoes - 6.6, 3.2, 3.2, 'F');

  // Título da Caixa
  doc.setFillColor(4, 91, 98);
  doc.rect(15, currentHeight - 10, 180, 10, 'F');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('FUNÇÕES PRINCIPAIS:', 18, currentHeight - 3);

  // Texto das colunas
  let funcoesY = currentHeight + 4;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  let offsetFuncoesCol1 = 0;
  let offsetFuncoesCol2 = 0;

  funcoesColuna1.forEach(item => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthFuncoes);
    doc.text(split, 18, funcoesY + offsetFuncoesCol1);
    offsetFuncoesCol1 += split.length * 5;
  });

  funcoesColuna2.forEach(item => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthFuncoes);
    doc.text(split, 105, funcoesY + offsetFuncoesCol2);
    offsetFuncoesCol2 += split.length * 5;
  });

  currentHeight += alturaFuncoes + 2;

  // ----------- Página 4: Pontos Cegos, Impacto, Referências -----------
  // Criar nova página para os Pontos Cegos, Impacto e Referências
  doc.addPage();
  aplicarFundo(doc);

  let y = 30;

  // Dados Pontos Cegos
  const pontosCegosColuna1 = [
    'Tendência ao autoritarismo ou querer controlar demais',
    'Falta de empatia e pouco cuidado com os sentimentos das pessoas',
    'Impaciência com processos, rotinas e pessoas mais lentas',
    'Desgaste físico e emocional por assumir tarefas além do limite',
    'Pressa em executar sem planejar bem os detalhes',
    'Foco excessivo em resultados e metas, esquecendo de pessoas',
    'Falta de escuta ativa e abertura para o feedback de outros dons',
    'Mudanças constantes de direção sem concluir projetos iniciados'
  ];
  const pontosCegosColuna2 = [
    'Negligência com os detalhes e com a execução prática',
    'Dificuldade em se submeter à liderança e rendição ao coletivo',
    'Tendência ao isolamento e à independência excessiva',
    'Desconexão com a realidade e as necessidades da base local',
    'Falta de acompanhamento pós-implantação (abandono de projetos)',
    'Crítica excessiva às estruturas existentes sem apresentar soluções claras',
    'Supervalorização do novo e desprezo pelo cuidado e pastoreio',
    'Agir por ativismo, acumulando muitas frentes sem foco'
  ];

  // Calcular altura máxima de cada coluna
  let maxAlturaPontosCol1 = 0;
  let maxAlturaPontosCol2 = 0;
  const maxWidthPontos = 85;

  pontosCegosColuna1.forEach(item => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
    maxAlturaPontosCol1 += split.length * 5;
  });

  pontosCegosColuna2.forEach(item => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
    maxAlturaPontosCol2 += split.length * 5;
  });

  const alturaPontos = 8 + Math.max(maxAlturaPontosCol1, maxAlturaPontosCol2) + 28;

  // Caixa de fundo geral (borda externa)
  doc.setFillColor(4, 91, 98);
  doc.roundedRect(15, y - 10, 180, alturaPontos - 5, 4, 4, 'F');

  // Caixa interna branca
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15.8, y - 9.2, 178.4, alturaPontos - 6.6, 3.2, 3.2, 'F');

  // Título da caixa
  doc.setFillColor(4, 91, 98);
  doc.rect(15, y - 10, 180, 10, 'F');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('PONTOS CEGOS:', 18, y - 3);

  // Subtítulo
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(4, 91, 98);
  doc.text('(Cuidado com essas expressões de imaturidade)', 18, y + 5);

  // Ajustar o ponto inicial dos textos das colunas
  let pontosY = y + 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  let offsetPontosCol1 = 0;
  let offsetPontosCol2 = 0;

  // Renderizar coluna 1
  pontosCegosColuna1.forEach(item => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
    doc.text(split, 18, pontosY + offsetPontosCol1);
    offsetPontosCol1 += split.length * 5;
  });

  // Renderizar coluna 2
  pontosCegosColuna2.forEach(item => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
    doc.text(split, 105, pontosY + offsetPontosCol2);
    offsetPontosCol2 += split.length * 5;
  });

  currentHeight = y + alturaPontos + 2;

  // Impacto Apostólico
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 38, 50);
  doc.text('IMPACTO APOSTÓLICO:', 15, currentHeight);
  currentHeight += 6;

  const impactoApostolico = [
    'IMPACTO NA IGREJA: Extensão do Reino; Fortalecimento da missão; Inovação ministerial; Manutenção do DNA do Reino; Criação de redes ministeriais.',
    '',
    '• Transmita visão para aqueles ao seu redor. Não tenha medo de deixar sua paixão e entusiasmo incendiar a vida dos outros. Ouça as perguntas e comentários dos outros. Muitas vezes, esses elementos identificam detalhes que precisam ser integrados à sua mensagem, proporcionando maior clareza. Não tenha medo de explicar demais por que certas pessoas, organizações e recursos são necessários para estabilizar a visão.',
    '',
    '• As pessoas mais próximas a você provavelmente têm uma mentalidade apostólica ou profética. Peça-lhes para ajudar a explicar e fornecer uma estratégia para a visão. É improvável que saibam como realizar a visão. Permita que eles inspirem outros em direção à compreensão. Recrute e libere outros indivíduos com ideias semelhantes para semear a visão dentro da estrutura do movimento.',
    '',
    '• O que você vê como necessário para promover uma causa missionária pode não ser visto imediatamente por aqueles próximos a você. Visualize dentro da igreja local, explicando temas para reuniões anuais, eventos, campanhas financeiras e indivíduos. Dependendo de sua mentalidade, alguns líderes apostólicos servem melhor inspirando pessoas individualmente ou em grandes grupos.'
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const impactoTexto = doc.splitTextToSize(impactoApostolico.join('\n'), 180);
  doc.text(impactoTexto, 15, currentHeight);
  currentHeight += impactoTexto.length * 5 + 10;

  // Referências Bíblicas - Reformulado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 38, 50);
  doc.text('REFERÊNCIAS BÍBLICAS:', 15, currentHeight - 12);
  currentHeight -= 6;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('(Textos sobre os Apóstolos e o Ministério Apostólico)', 15, currentHeight);
  currentHeight += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(0, 0, 0);

  const referenciasColuna1 = [
    'Mateus 10:2-4',
    'Atos 1:21-26',
    'Atos 9:15',
    '1 Coríntios 3:5-9,11'
  ];

  const referenciasColuna2 = [
    '1 Coríntios 4:9',
    '1 Coríntios 15:7-9',
    'Gálatas 2:9',
    'Apocalipse 2:2'
  ];

  let refY = currentHeight + 2;
  const espacamentoLinha = 5;

  referenciasColuna1.forEach((ref, index) => {
    doc.text(ref, 15, refY + (index * espacamentoLinha));
  });

  referenciasColuna2.forEach((ref, index) => {
    doc.text(ref, 105, refY + (index * espacamentoLinha));
  });

  currentHeight = refY + (referenciasColuna1.length * espacamentoLinha) + 8;
}
