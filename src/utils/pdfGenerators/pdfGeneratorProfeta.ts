import { jsPDF } from 'jspdf';
import { aplicarFundo, loadImageAndAdd } from './mainPdfGenerator';



export async function renderProfeta(doc: jsPDF) {
  await renderTextoProfeta(doc);
}

async function renderTextoProfeta(doc: jsPDF) {
  aplicarFundo(doc);

  await loadImageAndAdd(doc, '/assets/images/profeta_fundo_claro.png', 'PNG', 50, 5, 110, 30);
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
O dom profético é marcado por pessoas que têm sensibilidade espiritual aguçada e uma forte convicção de ouvir e comunicar a vontade de Deus. Quem tem esse dom é chamado a ser a voz de Deus para a Igreja, trazendo direção, correção, encorajamento e discernimento.

Os profetas são aqueles que percebem o que Deus está fazendo em tempos e estações, confrontam injustiças espirituais e chamam o povo de Deus ao arrependimento e à santidade. Sua paixão é manter a igreja alinhada com o coração de Deus.

Pessoas com esse dom tendem a ter uma linguagem direta, são intensas e muitas vezes incompreendidas, pois não temem dizer verdades difíceis. No entanto, são essenciais para manter a pureza, a visão espiritual e o temor do Senhor na comunidade.
`;

  const splitText = doc.splitTextToSize(texto, 180);
  doc.text(splitText, 15, alturaAtual);

  // Espaçamento antes das caixas
  let currentHeight = alturaAtual + splitText.length * 5 + 10;

  // ---------- Caixa CARACTERÍSTICAS ----------
  const caracteristicasColuna1 = [
    'Sensibilidade espiritual aguçada',
    'Percepção rápida de enganos espirituais',
    'Coragem para confrontar pecados',
    'Compromisso com a verdade bíblica',
    'Facilidade em discernir tempos e estações',
    'Intensidade emocional em relação à justiça de Deus'
  ];

  const caracteristicasColuna2 = [
    'Alto senso de missão profética',
    'Disposição para ser voz contracultural',
    'Busca constante por santidade e arrependimento',
    'Discernimento apurado de motivações ocultas',
    'Tendência a orar e interceder intensamente',
    'Paixão por ver a Igreja em alinhamento com Deus'
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
    'Chamar a Igreja ao arrependimento e santidade',
    'Discernir e confrontar falsas doutrinas e pecados ocultos',
    'Trazer direção profética para tempos de crise',
    'Encorajar a fé e fortalecer a confiança na Palavra de Deus'
  ];

  const funcoesColuna2 = [
    'Interpretar os tempos e movimentos espirituais',
    'Promover alinhamento espiritual na liderança',
    'Ser voz ativa de correção, edificação e consolo para a Igreja'
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
    'Tendência ao julgamento duro e falta de misericórdia',
    'Isolamento por se sentir incompreendido',
    'Falar sem sabedoria ou tempo certo',
    'Excesso de crítica e rigidez',
    'Expectativa irreal de perfeição nas pessoas',
    'Desconexão emocional com quem não entende seu dom',
    'Foco excessivo em erros e pecados alheios',
    'Negligência com o amor pastoral'
  ];
  const pontosCegosColuna2 = [
    'Dificuldade em trabalhar em equipe',
    'Falta de paciência com processos de maturação espiritual',
    'Imediatismo em ver resultados',
    'Excesso de autocobrança e culpa',
    'Desgaste emocional por carregar muitas cargas intercessórias',
    'Dificuldade em receber correção',
    'Falha ao equilibrar graça e verdade',
    'Exagero em trazer palavras duras sem base relacional'
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

  // Impacto Profético
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 38, 50);
  doc.text('IMPACTO PROFÉTICO:', 15, currentHeight);
  currentHeight += 6;

  const impactoApostolico = [
    'IMPACTO NA IGREJA: Alinhamento espiritual; Sensibilidade à voz de Deus; Arrependimento coletivo; Discernimento de tempos e estratégias do Reino.',
    '',
    '• Seja uma voz que traz vida, não condenação. Lembre-se que a profecia bíblica serve para edificação, exortação e consolação.',
    '',
    '• Procure compartilhar suas percepções espirituais com sabedoria e humildade, buscando edificar a comunidade e não gerar medo ou divisão.',
    '',
    '• Mantenha uma vida de oração, jejum e estudo da Palavra para que suas mensagens estejam sempre alinhadas com o coração de Deus.',
    '',
    '• Valorize a correção fraterna e esteja disposto a ser discipulado por outros dons para crescer em equilíbrio e maturidade.'
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
  doc.text('(Textos sobre os Profetas e o Ministério Profético)', 15, currentHeight);
  currentHeight += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(0, 0, 0);

  const referenciasColuna1 = [
    'Amós 3:7-8',
    'Jeremias 1:4-10',
    'Ezequiel 3:17-21',
    '1 Coríntios 14:1-5'
  ];

  const referenciasColuna2 = [
    '1 Coríntios 14:29-33',
    'Efésios 4:11-13',
    'Atos 11:27-30',
    'Apocalipse 19:10'
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
