import { jsPDF } from 'jspdf';
import { aplicarFundo, loadImageAndAdd } from './mainPdfGenerator';



export async function renderMestre(doc: jsPDF) {
  await renderTextoMestre(doc);
}

async function renderTextoMestre(doc: jsPDF) {
  aplicarFundo(doc);

  await loadImageAndAdd(doc, '/assets/images/mestre_fundo_claro.png', 'PNG', 50, 5, 110, 30);
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
O dom de mestre é caracterizado por um amor profundo pela Palavra de Deus e pelo desejo de ensinar com fidelidade, clareza e profundidade. Pessoas com esse dom têm a habilidade de organizar conteúdos bíblicos e apresentar verdades teológicas de forma acessível e prática para a comunidade.

O mestre é movido por um compromisso com a verdade, com zelo pela sã doutrina e pela formação espiritual dos discípulos. Seu ministério visa proteger a Igreja de heresias, trazendo equilíbrio teológico e maturidade espiritual.

Quem carrega esse dom costuma inspirar outros a estudar e aplicar as Escrituras com responsabilidade, promovendo uma cultura de aprendizado contínuo na Igreja. Eles têm paciência para ensinar, esclarecer dúvidas e repetir fundamentos sempre que necessário.

Mestres não apenas transmitem conhecimento, mas modelam uma vida enraizada na Palavra. Eles ajudam a Igreja a crescer em discernimento, firmeza doutrinária e prática cristã saudável.
  `;

  const splitText = doc.splitTextToSize(texto, 180);
  doc.text(splitText, 15, alturaAtual);

  // Espaçamento antes das caixas
  let currentHeight = alturaAtual + splitText.length * 5 + 10;

  // ---------- Caixa CARACTERÍSTICAS ----------
  const caracteristicasColuna1 = [
    'Paixão por estudar e ensinar a Palavra de Deus com profundidade e clareza',
    'Capacidade de organizar conteúdos bíblicos de forma didática e acessível',
    'Amor por doutrinas e desejo de proteger a Igreja de heresias',
    'Facilidade em responder perguntas difíceis com base nas Escrituras',
    'Habilidade em contextualizar verdades bíblicas para a realidade atual',
    'Zelo pela sã doutrina e pela formação teológica da comunidade'
  ];

  const caracteristicasColuna2 = [
    'Disciplina pessoal em estudo, leitura e pesquisa bíblica',
    'Capacidade de gerar compreensão e crescimento espiritual nos ouvintes',
    'Espírito paciente para ensinar, corrigir e explicar repetidas vezes quando necessário',
    'Sensibilidade para perceber áreas de confusão teológica na Igreja e trazer clareza',
    'Disposição para formar e treinar novos mestres e líderes de ensino',
    'Busca constante por coerência entre vida prática e ensino bíblico'
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
  doc.text('CARACTERÍSTICAS DO MESTRE:', 18, currentHeight - 3);

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
    'Ensinar as Escrituras com clareza, profundidade e aplicação prática para a vida diária da comunidade.',
    'Proteger a Igreja de heresias, trazendo equilíbrio doutrinário e formando um povo alicerçado na Palavra de Deus.',
    'Desenvolver materiais, estudos e recursos teológicos que fortaleçam o crescimento espiritual dos irmãos.',
    'Identificar áreas de confusão doutrinária na Igreja e trazer ensino corretivo com graça e firmeza.'
  ];

  const funcoesColuna2 = [
    'Treinar e capacitar novos mestres e líderes de ensino, promovendo uma cultura de formação teológica contínua.',
    'Estimular o estudo sistemático da Bíblia entre os membros, promovendo discipulado com base na Palavra.',
    'Conectar a doutrina com a prática cristã, ajudando a Igreja a viver com coerência entre fé e ação.',
    'Contribuir para a maturidade espiritual da comunidade, promovendo discernimento bíblico em todas as áreas da vida.'
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
  doc.text('FUNÇÕES PRINCIPAIS DO MESTRE:', 18, currentHeight - 3);

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
  const pontosCegosColuna1Mestre = [
    'Tendência ao intelectualismo excessivo, focando mais no conhecimento do que na vida prática de fé.',
    'Rigidez teológica, com falta de flexibilidade para ouvir novas perspectivas ou reconhecer limitações pessoais na interpretação bíblica.',
    'Desconexão com a realidade pastoral e emocional das pessoas, tornando-se frio ou insensível às necessidades do rebanho.',
    'Falta de ação missionária, priorizando ensino e estudo, mas sem engajamento com os perdidos ou com a prática da Grande Comissão.',
    'Uso excessivo de linguagem técnica, dificultando o entendimento para os membros da igreja menos instruídos.',
    'Tendência ao perfeccionismo doutrinário, gerando debates desnecessários e divisões sobre assuntos secundários.'
  ];
  const pontosCegosColuna2Mestre = [
    'Foco desproporcional em detalhes doutrinários, perdendo de vista a simplicidade e centralidade do Evangelho.',
    'Dificuldade em trabalhar em equipe com outros dons ministeriais, especialmente com evangelistas e pastores, por causa de diferenças metodológicas.',
    'Falta de aplicação prática nas mensagens, oferecendo ensino denso, mas com pouca conexão com a vida diária dos ouvintes.',
    'Orgulho intelectual, tratando os que sabem menos com impaciência ou superioridade.',
    'Tendência a "idolatrar" o conhecimento bíblico, colocando-o acima da comunhão com Deus e da obediência prática.',
    'Resistência a mudanças na estrutura da igreja por medo de diluir a pureza doutrinária.'
  ];

  // Calcular altura máxima de cada coluna
  let maxAlturaPontosCol1 = 0;
  let maxAlturaPontosCol2 = 0;
  const maxWidthPontos = 85;

  pontosCegosColuna1Mestre.forEach(item => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
    maxAlturaPontosCol1 += split.length * 5;
  });

  pontosCegosColuna2Mestre.forEach(item => {
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
  pontosCegosColuna1Mestre.forEach(item => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
    doc.text(split, 18, pontosY + offsetPontosCol1);
    offsetPontosCol1 += split.length * 5;
  });

  // Renderizar coluna 2
  pontosCegosColuna2Mestre.forEach(item => {
    const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
    doc.text(split, 105, pontosY + offsetPontosCol2);
    offsetPontosCol2 += split.length * 5;
  });

  currentHeight = y + alturaPontos - 5;

  // Impacto Ministerial do Mestre
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 38, 50);
  doc.text('IMPACTO MINISTERIAL DO MESTRE:', 15, currentHeight);
  currentHeight += 6;

  const impactoMestre = [
    'IMPACTO NA IGREJA: Maturidade espiritual; Estabilidade doutrinária; Crescimento em discernimento bíblico; Formação de líderes saudáveis; Equilíbrio entre prática e teologia.',
    '',
    '• Seja uma voz que ensina com profundidade e relevância. Ajude a Igreja a crescer em conhecimento e aplicação das Escrituras no dia a dia.',
    '',
    '• Proteja a comunidade de heresias, trazendo segurança doutrinária e promovendo uma fé sólida e bem fundamentada.',
    '',
    '• Contribua para a formação de novos líderes e mestres, discipulando com paciência e atenção aos detalhes da Palavra de Deus.',
    '',
    '• Promova uma cultura de estudo bíblico, estimulando o amor pela verdade e pela interpretação saudável das Escrituras.',
    '',
    '• Ajude a Igreja a conectar a doutrina com a prática, mostrando como a fé se traduz em ações no cotidiano.',
    '',
    '• Sirva como referência teológica, respondendo com graça e clareza às dúvidas e questionamentos da comunidade.'
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const impactoTexto = doc.splitTextToSize(impactoMestre.join('\n'), 180);
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
  doc.text('(Textos sobre Ensino, Doutrina e Ministério de Mestre)', 15, currentHeight);
  currentHeight += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(0, 0, 0);

  const referenciasColuna1 = [
    '2 Timóteo 2:1-2',
    '2 Timóteo 3:16-17',
    'Tiago 3:1',
    'Efésios 4:11-13'
  ];

  const referenciasColuna2 = [
    'Atos 18:24-28',
    'Colossenses 1:28',
    'Tito 1:9',
    'Hebreus 5:12-14'
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
