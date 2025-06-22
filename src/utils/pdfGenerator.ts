// Helper para verificar espaço disponível na página
function checkPageSpace(doc: jsPDF, currentHeight: number, alturaNecessaria: number): number {
  if (currentHeight + alturaNecessaria >= 280) {
    doc.addPage();
    doc.setFillColor(230, 242, 255); // azul claro
    doc.rect(0, 0, 210, 297, 'F');
    return 20;
  }
  return currentHeight;
}
import introducao from '../assets/images/introducao.png';
import gmailIcon from '../assets/images/icons/gmail.png';
import logo from '../assets/images/FIVE ONE LOGO QUADRADA FUNDO BRANCO.png';
import instagramIcon from '../assets/images/icons/instagram.png';
import youtubeIcon from '../assets/images/icons/youtube.png';
import meuPerfilMinisterial from '../assets/images/meuperfilministerial.png';
import qrcodeListaEspera from '../assets/images/qrcodeListaEspera.jpeg';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

  // Fundo azul claro em toda a página 1
  doc.setFillColor(230, 242, 255); // Azul claro
  doc.rect(0, 0, 210, 297, 'F');

  // Borda da página (A4 padrão = 210mm x 297mm)
  doc.setLineWidth(0.5);
  doc.rect(5, 5, 200, 287);

  // Cabeçalho com fundo
  doc.setFillColor(15, 38, 50); // Cor azul escuro
  doc.rect(0, 0, 210, 40, 'F'); // Retângulo de fundo no topo (A4 = 210mm largura)

  // Adicionar logo à esquerda
  const img = new Image();
  img.src = logo;
  doc.addImage(img, 'PNG', 10, 5, 30, 30); // posição X=10, Y=5, tamanho=30x30

  // Texto "FIVE ONE MOVEMENT"
  doc.setTextColor(255, 255, 255); // branco
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FIVE ONE MOVEMENT', 60, 20);

  // Dados abaixo do texto
  doc.setFontSize(10);
  doc.text(`Data da Avaliação: ${date}`, 60, 26);
  doc.text(`Nome da Pessoa: ${name}`, 60, 31);
  doc.text(`Dom Ministerial: ${domPrincipal}`, 60, 36);

  // Linha separadora
  doc.setTextColor(0, 0, 0);
  doc.line(10, 45, 200, 45);

  // Adicionar imagem 'meuperfilministerial' na primeira página (ajuste de tamanho e centralização)
  const perfilImg = new Image();
  perfilImg.src = meuPerfilMinisterial;
  doc.addImage(perfilImg, 'PNG', 20, 55, 170, 210);

  doc.addPage();

  // Fundo azul claro em toda a página 2
  doc.setFillColor(230, 242, 255); // Azul claro
  doc.rect(0, 0, 210, 297, 'F');

  // Cabeçalho da segunda página usando a imagem introducao.png
  const introImg = new Image();
  introImg.src = introducao;
  doc.addImage(introImg, 'PNG', 0, 0, 210, 40);

  // Conteúdo da página 2 abaixo do cabeçalho
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  const textoIntro = `Essa é uma avaliação ministerial fundamentada no modelo bíblico de Efésios 4:7,11-12, onde o apóstolo Paulo revela que Cristo, ao subir aos céus, concedeu dons aos homens — não apenas habilidades, mas expressões ministeriais que refletem a própria natureza de Jesus distribuída no Seu Corpo, que é a Igreja. Esses dons ministeriais — Apostólico, Profético, Evangelístico, Pastoral e de Ensino (ou Mestre) — são ferramentas essenciais, designadas pelo próprio Senhor, para o aperfeiçoamento dos santos, a edificação do Corpo de Cristo e o avanço do Reino de Deus na terra.

Cada dom carrega uma dimensão única do caráter e da missão de Cristo. Eles são mais do que funções; são expressões vivas de como Cristo age e se manifesta através da Sua Igreja. De maneira intencional, cada crente é capacitado com uma inclinação predominante para um ou mais desses dons. Isso reflete não apenas suas habilidades, mas também seu chamado, seu papel no Corpo e sua contribuição para a expansão do Reino.

Por isso, compreender seu dom ministerial não é apenas uma questão de autoconhecimento, mas um chamado divino para alinhar sua vida, sua missão e seu serviço ao propósito de Deus. Quando cada membro do Corpo opera segundo o dom que recebeu, a Igreja se torna madura, saudável, relevante e eficaz, cumprindo seu papel de manifestar Cristo em todas as esferas da sociedade.

Abaixo, você terá uma visão detalhada sobre o seu Dom Ministerial específico. Essa descrição foi cuidadosamente elaborada para te ajudar a entender não apenas as características e funções do seu dom, mas também como ele se manifesta na prática, seus pontos fortes, desafios e seu impacto no Corpo de Cristo. Ao conhecer essas informações, você será incentivado a ter uma visão mais clara e abrangente sobre seu chamado, seu potencial e seu papel dentro do Reino de Deus, além de ser motivado a crescer, desenvolver e aplicar esse dom de forma intencional e frutífera.`;

  const textoDividido = doc.splitTextToSize(textoIntro, 180);
  let currentHeight = 50;
  // Garante padrão de fonte e cor antes de renderizar o texto de introdução
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  currentHeight = checkPageSpace(doc, currentHeight, textoDividido.length * 7);
  doc.text(textoDividido, 14, currentHeight);
  currentHeight += textoDividido.length * 7;

  doc.addPage();

  // Fundo azul claro em toda a página 3
  doc.setFillColor(230, 242, 255); // Azul claro
  doc.rect(0, 0, 210, 297, 'F');

  // Seção: Meu Perfil Ministerial na terceira página
  doc.setFontSize(14);
  doc.text('Meu Perfil Ministerial', 14, 20);
  currentHeight = 30;

  const perfilContent = perfisMinisteriais[domPrincipal];

  // Renderização da Visão Geral e Características ANTES do forEach
  const visaoGeral = perfilContent.find(p => p.startsWith('VISÃO GERAL'));
  if (visaoGeral) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 38, 50);
    currentHeight = checkPageSpace(doc, currentHeight, 8);
    doc.text('VISÃO GERAL DO DOM APOSTÓLICO:', 14, currentHeight);
    currentHeight += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const splitText = doc.splitTextToSize(visaoGeral.replace('VISÃO GERAL DO DOM APOSTÓLICO:', ''), 180);
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
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('CARACTERÍSTICAS:', 14, currentHeight);
      currentHeight += 8;

      const maxWidth = 85;
      let maxAlturaCol1 = 0;
      let maxAlturaCol2 = 0;

      caracteristicasColuna1.forEach((item) => {
        const split = doc.splitTextToSize(`• ${item}`, maxWidth);
        doc.setFont('helvetica', 'normal');
        doc.text(split, 14, currentHeight + maxAlturaCol1);
        maxAlturaCol1 += split.length * 6;
      });

      caracteristicasColuna2.forEach((item) => {
        const split = doc.splitTextToSize(`• ${item}`, maxWidth);
        doc.setFont('helvetica', 'normal');
        doc.text(split, 110, currentHeight + maxAlturaCol2);
        maxAlturaCol2 += split.length * 6;
      });

      currentHeight += Math.max(maxAlturaCol1, maxAlturaCol2) + 10;

      // Antes das funções principais, checa espaço
      currentHeight = checkPageSpace(doc, currentHeight, 50);
      // Renderiza Funções Principais do Apostólico
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('FUNÇÕES PRINCIPAIS:', 14, currentHeight);
      currentHeight += 8;

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

      const maxWidthFuncoes = 85;
      let maxAlturaFuncoesCol1 = 0;
      let maxAlturaFuncoesCol2 = 0;

      funcoesColuna1.forEach((item) => {
        const split = doc.splitTextToSize(`• ${item}`, maxWidthFuncoes);
        doc.setFont('helvetica', 'normal');
        doc.text(split, 14, currentHeight + maxAlturaFuncoesCol1);
        maxAlturaFuncoesCol1 += split.length * 6;
      });

      funcoesColuna2.forEach((item) => {
        const split = doc.splitTextToSize(`• ${item}`, maxWidthFuncoes);
        doc.setFont('helvetica', 'normal');
        doc.text(split, 110, currentHeight + maxAlturaFuncoesCol2);
        maxAlturaFuncoesCol2 += split.length * 6;
      });

      currentHeight += Math.max(maxAlturaFuncoesCol1, maxAlturaFuncoesCol2) + 10;
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
      currentHeight = checkPageSpace(doc, currentHeight, 50);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Pontos Cegos (Cuidado com essas expressões de imaturidade)', 14, currentHeight);
      currentHeight += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Apóstolo disfuncional', 14, currentHeight);
      currentHeight += 8;

      const pontosColuna1 = [
        'Dogmático sobre a visão',
        'Autocrático e dominador',
        'Procura usar o bullying para controlar',
        'Ignora ou se desassocia daqueles “que não entendem”',
        'Falta empatia'
      ];

      const pontosColuna2 = [
        'Fica entediado rapidamente',
        'Fica desiludido quando não vê resultados rápidos',
        'Pode ser impaciente',
        'Vê as pessoas como um meio para um fim',
        'Lutas com responsabilidade'
      ];

      const maxWidthPontos = 85;
      let maxAlturaPontosCol1 = 0;
      let maxAlturaPontosCol2 = 0;

      pontosColuna1.forEach((item) => {
        const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
        doc.text(split, 14, currentHeight + maxAlturaPontosCol1);
        maxAlturaPontosCol1 += split.length * 6;
      });

      pontosColuna2.forEach((item) => {
        const split = doc.splitTextToSize(`• ${item}`, maxWidthPontos);
        doc.text(split, 110, currentHeight + maxAlturaPontosCol2);
        maxAlturaPontosCol2 += split.length * 6;
      });

      currentHeight += Math.max(maxAlturaPontosCol1, maxAlturaPontosCol2) + 10;
      return;
    }

    // Bloco customizado do Impacto e da Escola para Apostólico
    if (
      domPrincipal === 'Apostólico' &&
      paragraph.startsWith('IMPACTO NA IGREJA')
    ) {
      // Novo bloco customizado para impacto do Apostólico
      currentHeight = checkPageSpace(doc, currentHeight, 50);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Impacto: Extensão, aquele que é enviado', 14, currentHeight);
      currentHeight += 8;
      
      doc.setFont('helvetica', 'normal');

      const impactoTextos = [
        '• Transmita visão para aqueles ao seu redor. Não tenha medo de deixar sua paixão e entusiasmo incendiar a vida dos outros. Ouça as perguntas e comentários dos outros. Muitas vezes, esses elementos identificam detalhes que precisam ser integrados à sua mensagem, proporcionando maior clareza. Não tenha medo de explicar demais por que certas pessoas, organizações e recursos são necessários para estabilizar a visão.',
        '• As pessoas mais próximas a você provavelmente têm uma mentalidade apostólica ou profética. Peça-lhes para ajudar a explicar e fornecer uma estratégia para a visão. É improvável que saibam como realizar a visão. Permita que eles inspirem outros em direção à compreensão. Recrute e libere outros indivíduos com ideias semelhantes para semear a visão dentro da estrutura do movimento.',
        '• O que você vê como necessário para promover uma causa missionária pode não ser visto imediatamente por aqueles próximos a você. Visualize dentro da igreja local, explicando temas para reuniões anuais, eventos, campanhas financeiras e indivíduos. Dependendo de sua mentalidade, alguns líderes apostólicos servem melhor inspirando pessoas individualmente ou em grandes grupos.'
      ];

      impactoTextos.forEach(paragrafo => {
        const split = doc.splitTextToSize(paragrafo, 180);
        doc.text(split, 14, currentHeight);
        currentHeight += split.length * 7;
      });

      currentHeight += 5;

      // --- INÍCIO DO BLOCO DE REFERÊNCIAS BÍBLICAS ---
      // Referências Bíblicas
      currentHeight = checkPageSpace(doc, currentHeight, 50);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Referências Bíblicas', 14, currentHeight);
      currentHeight += 8;

      // Lucas 10: 1-3
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Lucas 10: 1-3', 14, currentHeight);
      currentHeight += 7;

      doc.setFont('helvetica', 'normal');
      const referencia1 = `“Depois disso, o Senhor designou outros setenta e dois e os enviou, dois a dois, adiante dele, a todas as cidades e lugares aonde ele estava para ir. Ele lhes disse: 'A colheita é grande, mas os trabalhadores são poucos. Peça ao Senhor da messe, portanto, que envie trabalhadores para o seu campo de colheita. Ir! Estou enviando vocês como cordeiros no meio de lobos.'”`;
      const splitRef1 = doc.splitTextToSize(referencia1, 180);
      doc.text(splitRef1, 14, currentHeight);
      currentHeight += splitRef1.length * 7;

      // 1 Coríntios 3: 5-9,11
      currentHeight += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('1 Coríntios 3: 5-9,11', 14, currentHeight);
      currentHeight += 7;

      doc.setFont('helvetica', 'normal');
      const referencia2 = `"O que, afinal, é Apolo? E o que é Paulo? Apenas servos, por meio dos quais vocês acreditaram - como o Senhor designou a cada um a sua tarefa. Eu plantei a semente, Apolo regou, mas Deus a fez crescer. Então Nem o que planta nem o que rega são alguma coisa, mas somente Deus, que faz as coisas crescerem. O que planta e o que rega têm um só propósito, e cada um receberá conforme o seu próprio trabalho. Pois nós somos cooperadores de Deus. Vós sois lavoura de Deus, edifício de Deus. [...] Porque ninguém pode lançar outro fundamento, senão o que já está posto, que é Jesus Cristo."`;
      const splitRef2 = doc.splitTextToSize(referencia2, 180);
      doc.text(splitRef2, 14, currentHeight);
      currentHeight += splitRef2.length * 7;
      // --- FIM DO BLOCO DE REFERÊNCIAS BÍBLICAS ---

      // --- INÍCIO DO BLOCO DA ESCOLA FIVE ONE (CARD DESTACADO) ---
      doc.addPage();
      // Fundo azul claro
      doc.setFillColor(230, 242, 255);
      doc.rect(0, 0, 210, 297, 'F');

      // Card com fundo azul escuro e borda azulada diferenciada
      doc.setDrawColor(200, 220, 245);
      doc.setFillColor(15, 23, 42); // Azul escuro semelhante ao fundo da plataforma
      doc.roundedRect(10, 20, 190, 250, 8, 8, 'FD');

      // Cabeçalho do card
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 102, 204);
      doc.text('Próximo Passo na Sua Jornada Ministerial!', 22, 38);

      // Linha decorativa
      doc.setDrawColor(0, 102, 204);
      doc.setLineWidth(1);
      doc.line(22, 42, 188, 42);

      // Texto de introdução
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255, 255, 255);
      const textoIntro = `Agora que você descobriu mais sobre o seu Dom Ministerial, é hora de se aprofundar, ser treinado e ativado de forma intencional.

Na Escola Five One, você terá acesso a uma formação completa, bíblica e prática, baseada nos cinco dons ministeriais de Efésios 4.`;
      const intro = doc.splitTextToSize(textoIntro, 164);
      doc.text(intro, 22, 52);

      // Bloco de chamada principal (card destacado dentro do card)
      doc.setFillColor(31, 41, 55); // Azul ainda mais escuro para o bloco de chamada principal
      doc.roundedRect(22, 80, 156, 22, 4, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(0, 102, 204);
      const chamada = doc.splitTextToSize(
        'Venha desenvolver seu chamado, ativar seu dom e se posicionar no propósito que Deus preparou para você.',
        148
      );
      doc.text(chamada, 26, 93);

      // Link de acesso
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text('Acesse:', 22, 120);
      doc.setTextColor(0, 102, 204);
      doc.textWithLink(
        'https://fiveonemovement.com/#/formacao-ministerial',
        44,
        120,
        { url: 'https://fiveonemovement.com/#/formacao-ministerial' }
      );

      // Chamada final
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      const final = doc.splitTextToSize(
        'Faça parte da Escola Five One e viva o seu chamado ministerial!',
        164
      );
      doc.text(final, 22, 140);

      // Texto de instrução para o QR Code e o QR Code em si (centralizado, imagem maior)
      const pageWidth = doc.internal.pageSize.getWidth();
      const imgWidth = 80;
      const imgHeight = 80;
      const x = (pageWidth - imgWidth) / 2;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255, 255, 255);
      doc.text('Escaneie o QR Code e entre para o nosso grupo de lista de espera!', pageWidth / 2, 155, { align: 'center' });

      doc.addImage(qrcodeListaEspera, 'PNG', x, 160, imgWidth, imgHeight);
      // --- FIM DO BLOCO DA ESCOLA FIVE ONE (CARD DESTACADO) ---

    } else {
      // Renderização padrão para demais parágrafos
      const splitText = doc.splitTextToSize(paragraph, 180);
      currentHeight = checkPageSpace(doc, currentHeight, splitText.length * 7);
      doc.text(splitText, 14, currentHeight);
      currentHeight += splitText.length * 7;
    }
  });

  // Seção: Percentuais
  doc.addPage();
  // Fundo azul claro em toda a página de percentuais
  doc.setFillColor(230, 242, 255); // Azul claro
  doc.rect(0, 0, 210, 297, 'F');
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
  });

  // Rodapé com barra colorida
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(15, 38, 50);
  doc.rect(0, pageHeight - 20, 210, 20, 'F');

  // Adicionar logo no rodapé (lado esquerdo)
  doc.addImage(img, 'PNG', 10, pageHeight - 18, 12, 12);

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


  doc.save(`Resultado-${name}.pdf`);
};