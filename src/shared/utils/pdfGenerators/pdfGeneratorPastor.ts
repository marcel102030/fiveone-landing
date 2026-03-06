import { jsPDF } from 'jspdf';
import { aplicarFundo, loadImageAndAdd } from './mainPdfGenerator';



export async function renderPastor(doc: jsPDF) {
  await renderTextoPastoral(doc);
}

async function renderTextoPastoral(doc: jsPDF) {
  aplicarFundo(doc);

  await loadImageAndAdd(doc, '/assets/images/pastor_fundo_claro.png', 'PNG', 50, 5, 110, 30);
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
O dom pastoral é marcado por um profundo senso de cuidado, proteção e amor pelas pessoas. O pastor tem a responsabilidade de zelar pelo bem-estar espiritual, emocional e, muitas vezes, físico dos membros da comunidade.

Movido por compaixão e empatia, o pastor é aquele que caminha ao lado, escuta com atenção e acompanha os discípulos durante suas jornadas de fé, oferecendo direção, consolo, correção e apoio.

Seu ministério é relacional e envolve promover unidade, cura emocional e maturidade espiritual dentro da Igreja. Além disso, o pastor é um facilitador de comunhão, criando ambientes onde cada pessoa se sinta acolhida, discipulada e valorizada.

A figura pastoral reflete o cuidado de Cristo como o Bom Pastor, liderando com mansidão, mas também com firmeza e responsabilidade sobre o rebanho.
`;

  const splitText = doc.splitTextToSize(texto, 180);
  doc.text(splitText, 15, alturaAtual);

  // Espaçamento antes das caixas
  let currentHeight = alturaAtual + splitText.length * 5 + 10;

  // ---------- Caixa CARACTERÍSTICAS ----------
  const caracteristicasColuna1 = [
    'Amor profundo e cuidado genuíno pelas pessoas da comunidade',
    'Capacidade de ouvir, aconselhar e oferecer suporte emocional',
    'Sensibilidade para identificar necessidades espirituais e emocionais',
    'Habilidade em promover unidade e reconciliação entre membros',
    'Compromisso com o crescimento espiritual e maturidade dos discípulos',
    'Pacência e empatia para acompanhar processos de cura e transformação'
  ];

  const caracteristicasColuna2 = [
    'Liderança servidora, guiando com mansidão e responsabilidade',
    'Disposição para estar presente em momentos difíceis e celebrações',
    'Capacidade de criar ambientes acolhedores e inclusivos',
    'Habilidade em comunicar esperança e conforto baseados na fé',
    'Compromisso com a oração e intercessão pela comunidade',
    'Integridade e exemplo de vida cristã autêntica'
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
  doc.text('CARACTERÍSTICAS DO PASTOR:', 18, currentHeight - 3);

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
    'Zelar pelo bem-estar espiritual, emocional e físico da comunidade',
    'Aconselhar, confortar e orientar os membros em suas jornadas de fé',
    'Promover a unidade, reconciliação e cura dentro da Igreja',
    'Liderar com mansidão, responsabilidade e exemplo cristão',
  ];

  const funcoesColuna2 = [
    'Criar ambientes acolhedores que favoreçam a comunhão e o discipulado',
    'Orar e interceder regularmente pela congregação',
    'Treinar e capacitar líderes para o cuidado pastoral',
    'Representar a comunidade em momentos importantes e desafios',
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
  doc.text('FUNÇÕES PRINCIPAIS DO PASTOR:', 18, currentHeight - 3);

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
  const pontosCegosColuna1Pastoral = [
    'Tendência a superproteger, limitando o crescimento da autonomia dos membros.',
    'Dificuldade em delegar responsabilidades, assumindo sobrecarga de trabalho.',
    'Sensibilidade excessiva a críticas, afetando a saúde emocional e liderança.',
    'Falta de equilíbrio entre cuidado pastoral e administração ministerial.',
    'Possível desgaste emocional devido à constante exposição às necessidades alheias.',
    'Risco de criar dependência emocional na comunidade em relação ao pastor.'
  ];
  const pontosCegosColuna2Pastoral = [
    'Dificuldade em confrontar problemas ou conflitos, evitando situações desconfortáveis.',
    'Tendência a priorizar o cuidado emocional em detrimento da disciplina espiritual.',
    'Resistência a mudanças necessárias para o crescimento da igreja.',
    'Falta de atenção à própria formação e cuidado pessoal do pastor.',
    'Dificuldade em manter limites saudáveis entre vida pessoal e ministerial.',
    'Possível isolamento devido à carga emocional e responsabilidades pastorais.'
  ];

  // Calcular altura máxima de cada coluna
  let maxAlturaPontosCol1 = 0;
  let maxAlturaPontosCol2 = 0;
  const maxWidthPontos = 85;

  pontosCegosColuna1Pastoral.forEach(item => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
    maxAlturaPontosCol1 += split.length * 5;
  });

  pontosCegosColuna2Pastoral.forEach(item => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
    maxAlturaPontosCol2 += split.length * 5;
  });

  const alturaPontos = 8 + Math.max(maxAlturaPontosCol1, maxAlturaPontosCol2) + 20;

  // Caixa de fundo geral (borda externa)
  doc.setFillColor(4, 91, 98);
  doc.roundedRect(15, y - 10, 180, alturaPontos - 10, 4, 4, 'F');

  // Caixa interna branca
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15.8, y - 9.2, 178.4, alturaPontos - 11.6, 3.2, 3.2, 'F');

  // Título da caixa
  doc.setFillColor(4, 91, 98);
  doc.rect(15, y - 10, 180, 10, 'F');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('PONTOS CEGOS DO PASTOR:', 18, y - 3);

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
  pontosCegosColuna1Pastoral.forEach(item => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
    doc.text(split, 18, pontosY + offsetPontosCol1);
    offsetPontosCol1 += split.length * 5;
  });

  // Renderizar coluna 2
  pontosCegosColuna2Pastoral.forEach(item => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
    doc.text(split, 105, pontosY + offsetPontosCol2);
    offsetPontosCol2 += split.length * 5;
  });

  currentHeight = y + alturaPontos - 5;

  // Impacto Ministerial do Mestre
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 38, 50);
  doc.text('IMPACTO MINISTERIAL DO PASTOR:', 15, currentHeight);
  currentHeight += 6;

  const impactoPastoral = [
    'IMPACTO NA IGREJA: Fortalecimento da comunhão; cuidado integral das ovelhas; desenvolvimento de uma cultura de discipulado; restauração emocional e espiritual; liderança servidora e relacional.',
    '',
    '• Cria um ambiente de segurança e pertencimento, onde cada membro é conhecido pelo nome, cuidado em suas dores e encorajado em seu propósito, refletindo o coração pastoral de Cristo, o Bom Pastor.',
    '',
    '• Promove o crescimento espiritual da comunidade, acompanhando os fiéis em suas jornadas pessoais de fé, por meio de aconselhamento, oração intercessora e discipulado próximo.',
    '',
    '• Desenvolve e forma líderes com caráter cristão, modelando uma liderança que serve, escuta e capacita outros a assumirem responsabilidades no Corpo de Cristo, gerando uma igreja madura e multiplicadora.',
    '',
    '• Atua como agente de reconciliação, trazendo cura para feridas emocionais e espirituais, mediando conflitos com graça e verdade, e restaurando relacionamentos quebrados dentro da comunidade.',
    '',
    '• Inspira uma cultura de serviço e amor sacrificial, sendo exemplo vivo de humildade, generosidade e compromisso com o bem-estar integral das pessoas, apontando constantemente para o amor incondicional de Deus.',
    '',
    '• Fomenta a comunhão bíblica autêntica, encorajando a mutualidade, a hospitalidade e o discipulado relacional, onde cada membro entende que é responsável por cuidar e edificar o próximo, cumprindo assim a missão de ser uma família espiritual viva e atuante.'
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const impactoTexto = doc.splitTextToSize(impactoPastoral.join('\n'), 180);
  doc.text(impactoTexto, 15, currentHeight);
  currentHeight += impactoTexto.length * 5 + 10;

  // Referências Bíblicas - Mestre
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 38, 50);
  doc.text('REFERÊNCIAS BÍBLICAS:', 15, currentHeight - 12);
  currentHeight -= 6;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('(Textos sobre Cuidado Pastoral e Liderança Espiritual)', 15, currentHeight);
  currentHeight += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(0, 0, 0);

  const referenciasColuna1 = [
    '1 Pedro 5:2-4',
    'Efésios 4:11-12',
    'Jeremias 3:15',
    'Atos 20:28'
  ];

  const referenciasColuna2 = [
    'João 10:11-16',
    'Hebreus 13:17',
    '1 Timóteo 3:1-7',
    'Salmo 23:1-6'
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
