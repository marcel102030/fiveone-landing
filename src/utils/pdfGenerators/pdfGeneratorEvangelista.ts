import { jsPDF } from 'jspdf';
import { aplicarFundo, loadImageAndAdd } from './mainPdfGenerator';



export async function renderEvangelistico(doc: jsPDF) {
  await renderTextoEvangelistico(doc);
}

async function renderTextoEvangelistico(doc: jsPDF) {
  aplicarFundo(doc);

  await loadImageAndAdd(doc, '/assets/images/evangelista_fundo_claro.png', 'PNG', 50, 5, 110, 30);
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
O dom evangelístico é caracterizado por uma paixão profunda em compartilhar as boas novas de Cristo com os outros. Pessoas com esse dom têm sensibilidade espiritual para perceber quando alguém está pronto para ouvir a mensagem de salvação e possuem habilidade natural de comunicar o Evangelho de forma clara e impactante.

O evangelista é movido por um senso de urgência em alcançar os perdidos. Sua vida e ministério são marcados por um coração cheio de compaixão e por uma fé ativa que acredita no poder transformador do Evangelho. São pessoas que criam pontes entre a Igreja e o mundo, levando a mensagem de Cristo a diferentes contextos sociais, culturais e geográficos.

Quem carrega esse dom costuma inspirar outros a também compartilharem sua fé, ajudando a Igreja a manter um foco missionário constante. Sua presença em uma comunidade é como um catalisador que desperta, motiva e treina outros para o trabalho de evangelização.

Os evangelistas mantêm o coração da Igreja voltado para fora de suas paredes, lembrando a todos que a missão ainda não terminou enquanto houver pessoas que não ouviram sobre Jesus.
`;

  const splitText = doc.splitTextToSize(texto, 180);
  doc.text(splitText, 15, alturaAtual);

  // Espaçamento antes das caixas
  let currentHeight = alturaAtual + splitText.length * 5 + 10;

  // ---------- Caixa CARACTERÍSTICAS ----------
  const caracteristicasColuna1 = [
    'Facilidade em comunicar o Evangelho de forma simples e clara',
    'Sensibilidade para perceber oportunidades de compartilhar a fé',
    'Coragem e ousadia em abordar pessoas de diferentes contextos',
    'Entusiasmo contagiante ao falar de Jesus',
    'Persistência em alcançar os que estão distantes da fé',
    'Habilidade de contextualizar a mensagem para públicos variados'
  ];

  const caracteristicasColuna2 = [
    'Amor profundo pelos perdidos e compromisso com a missão',
    'Energia missionária que inspira outros a evangelizar',
    'Foco em resultados de conversão e discipulado inicial',
    'Capacidade de conectar a Igreja com o mundo ao redor',
    'Criatividade em métodos evangelísticos',
    'Perseverança mesmo diante de rejeições ou indiferença'
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
  doc.text('CARACTERÍSTICAS DO EVANGELISTA:', 18, currentHeight - 3);

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
    'Anunciar o Evangelho com clareza, convicção e sensibilidade ao Espírito, buscando a salvação dos perdidos.',
    'Mobilizar e encorajar a Igreja local a viver com intencionalidade missionária, despertando um estilo de vida evangelístico.',
    'Estabelecer pontes entre a Igreja e a sociedade, aproximando pessoas distantes da fé.',
    'Inspirar, treinar e capacitar outros irmãos para o testemunho pessoal e evangelização em diferentes contextos.'
  ];

  const funcoesColuna2 = [
    'Integrar os novos convertidos na vida da comunidade, promovendo acompanhamento e primeiros passos no discipulado.',
    'Enfrentar barreiras culturais e espirituais que dificultam o avanço do Evangelho, com criatividade e ousadia.',
    'Gerar uma cultura de colheita, ajudando a Igreja a manter foco na missão de alcançar novos povos, bairros e segmentos sociais.',
    'Alertar a Igreja quando ela se tornar excessivamente interna, lembrando que a missão é alcançar os que ainda não ouviram.'
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
  doc.text('FUNÇÕES PRINCIPAIS DO EVANGELISTA:', 18, currentHeight - 3);

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
    'Superficialidade na apresentação do Evangelho, focando apenas em decisões rápidas sem atenção ao discipulado.',
    'Redução da mensagem à persuasão emocional ou estratégias humanas, sem dependência real do Espírito Santo.',
    'Foco excessivo em números e resultados visíveis, negligenciando o cuidado pastoral e o crescimento saudável dos novos convertidos.',
    'Tendência a se frustrar facilmente com a Igreja local quando ela não adere ao ritmo ou urgência do evangelista.',
    'Falta de enraizamento doutrinário, levando a uma pregação desequilibrada e teologicamente rasa.',
    'Tornar o Evangelho tão acessível a ponto de ser simplista, enfatizando apenas o amor de Deus e evitando temas como pecado, arrependimento e o chamado à santidade.'
  ];
  const pontosCegosColuna2 = [
    'Pressa em apresentar o Evangelho sem ouvir verdadeiramente a história e as dores das pessoas.',
    'Isolamento ministerial, agindo como "lobo solitário" na missão, sem se submeter à liderança e aos outros dons ministeriais.',
    'Reduzir o valor dos demais dons da Igreja, considerando que só a evangelização importa, desvalorizando ensino, pastoreio, profecia e apostolado.',
    'Manipulação emocional nas mensagens evangelísticas, usando medo ou culpa para gerar conversões (ou o oposto: nunca falar sobre juízo e inferno para não ofender).',
    'Dificuldade em aceitar processos mais lentos de transformação, sendo impaciente com aqueles que têm barreiras para crer.',
    'Esquecer da centralidade da Cruz, oferecendo uma mensagem de “bem-estar” ou “autoajuda espiritual”, sem confrontar o pecado.'
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

  currentHeight = y + alturaPontos - 5;

  // Impacto Profético
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 38, 50);
  doc.text('IMPACTO EVANGELÍSTICO:', 15, currentHeight);
  currentHeight += 6;

  const impactoEvangelistico = [
    'IMPACTO NA IGREJA: Foco na Missão; Cultura de Evangelização; Crescimento numérico por conversões; Atmosfera de alegria pela salvação de vidas; Despertar missionário coletivo.',
    '',
    '• Seja uma voz que convida à salvação. Sua presença na comunidade deve inspirar a proclamação constante das Boas Novas. Lembre à Igreja que há pessoas ao redor esperando ouvir sobre Jesus.',
    '',
    '• Motive outros a compartilhar sua fé. Evangelistas maduros não apenas pregam, mas despertam uma cultura onde todos se tornam testemunhas de Cristo no dia a dia.',
    '',
    '• Mantenha a centralidade do Evangelho. Evite diluir a mensagem. Anuncie o amor de Deus, mas também chame ao arrependimento e à resposta à cruz de Cristo.',
    '',
    '• Equilibre paixão com verdade bíblica. Uma comunicação cheia de entusiasmo deve sempre estar firmada nas Escrituras, evitando manipulação emocional ou exageros.',
    '',
    '• Promova discipulado desde a conversão. Evangelizar é o primeiro passo, mas acompanhar e integrar os novos convertidos à vida da Igreja é parte do seu chamado.',
    '',
    '• Seja uma ponte entre a Igreja e a sociedade. O Evangelista conecta o Corpo de Cristo com os que estão fora, lembrando a todos que a missão é alcançar os perdidos.'
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const impactoTexto = doc.splitTextToSize(impactoEvangelistico.join('\n'), 180);
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
  doc.text('(Textos sobre Evangelização e o Ministério Evangelístico)', 15, currentHeight);
  currentHeight += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(0, 0, 0);

  const referenciasColuna1 = [
    'Mateus 28:18-20',
    'Marcos 16:15',
    'Atos 1:8',
    'Romanos 10:13-15'
  ];

  const referenciasColuna2 = [
    '2 Timóteo 4:5',
    '1 Coríntios 9:19-23',
    'João 3:16-17',
    'Lucas 19:10'
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
