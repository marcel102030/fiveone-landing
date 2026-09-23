// Artigos da Rede de Igrejas nas Casas. Os caminhos continuam os mesmos das
// páginas antigas (/rede-igrejas/...), que já estão no sitemap e no Google.

export type ArtigoBloco =
  | string
  | { tipo: 'destaque'; texto: string }
  | { tipo: 'lista'; itens: { titulo?: string; texto: string }[] };

export type Artigo = {
  slug: 'como-funciona' | 'rede-five-one' | 'o-que-e-five-one';
  categoria: string;
  titulo: string;
  destaque: string;
  resumo: string;
  secoes: { titulo?: string; blocos: ArtigoBloco[] }[];
};

export const artigoPath = (slug: Artigo['slug']) => `/rede-igrejas/${slug}`;

export const ARTIGOS: Artigo[] = [
  {
    slug: 'como-funciona',
    categoria: 'Igreja nas casas',
    titulo: 'Como funcionam as igrejas',
    destaque: 'nas casas?',
    resumo:
      'A Rede Five One nasce na mesa. Descubra como cada encontro nas casas cria ambientes seguros para discipular, enviar e servir a cidade com o Evangelho.',
    secoes: [
      {
        titulo: 'O que são',
        blocos: [
          'Igreja no lar é vida comunitária de cristãos conduzida por força sobrenatural em casas bem normais. É o estilo de vida redimido, vivido na situação concreta. É o caminho orgânico pelo qual os cristãos seguem a Jesus conjuntamente no cotidiano.',
          'Pelo fato de não mais pertencerem a si próprios, os redimidos adotam consistentemente um estilo de vida comunitário. Já não vivem num mundo particular e individualista. Igrejas nos lares nascem quando os cristãos entendem que não podem mais conduzir sua própria vida, mas, juntos com outros, começam a colocar em prática os valores do Reino de Deus, compartilhando a vida com cristãos e pessoas ainda não cristãs em seu redor.',
          'Trata-se de uma concretização consequente de reconhecimento de que não existem caminhos para experimentar Jesus Cristo e seu Espírito apenas em recintos sagrados, mas, sim, no meio da vida. Nesse sentido, o local é indiferente, salvo o leito de morte do egoísmo – e, por consequência, o local de nascimento da comunidade eclesial.',
          {
            tipo: 'destaque',
            texto: 'A verdadeira comunhão começa onde termina o individualismo. Como diz Arthur Katz: “Quando estamos reunidos é que estamos em casa!”.',
          },
          'Em muitos sentidos, uma igreja no lar constitui uma família extensa espiritual, na qual se partilha a vida de modo espontâneo e orgânico. A vida cotidiana dessas igrejas não requer mais organização, burocracia e cerimônias do que as famílias extensas comuns.',
          'Igrejas nos lares são uma criação de Deus, um caminho de vida sobrenatural para realizar coisas que uma família normal não seria capaz de fazer. Um dos mistérios extraordinários está na estrutura multiplicativa inerente, com o ministério quíntuplo como sistema circulatório, estimulando o corpo todo a crescer e a multiplicar-se.',
        ],
      },
      {
        titulo: 'Como são',
        blocos: [
          'Igrejas nos lares espelham as qualidades e o caráter de Deus. O estilo de vida comunitário é marcado por amor, verdade, perdão, fé e graça; um caminho ideal para demonstrações de cuidado mútuo, encorajamento e serviço.',
          'É um espaço em que todas as máscaras podem ser removidas, em que as pessoas são francas umas com as outras e, apesar disso, continuam se amando. É onde experimentam e praticam pessoalmente a verdade e o perdão de Deus no dia a dia.',
        ],
      },
      {
        titulo: 'O que fazem',
        blocos: [
          'Em um mundo que busca modelos prontos, preferimos discernir com o Espírito como viver a igreja no lar em nosso contexto. Transferir fórmulas prontas produz estruturas vazias; por isso, revisitamos os princípios fundamentais dados por Deus para encarná-los novamente em nossa cultura.',
          'Dons apostólicos e proféticos têm papel crucial nesse processo, ajudando a desbravar caminhos saudáveis de igreja em cada realidade. Ao longo da história e hoje, vemos quatro elementos básicos sustentando essa jornada, formando o arcabouço das igrejas nos lares em todos os tempos.',
        ],
      },
      {
        titulo: 'Como funciona a liderança',
        blocos: [
          {
            tipo: 'lista',
            itens: [
              {
                titulo: 'Presbíteros.',
                texto:
                  'Igrejas nos lares estão sob a responsabilidade de presbíteros que exercem papel paternal e maternal sobre a comunidade. A maturidade comprovada por Deus e a sabedoria vivida fazem deles referências claras do estilo de vida do Reino. Cuidam do rebanho como uma família, assegurando autenticidade, seriedade e exemplo prático para cada discípulo.',
              },
              {
                titulo: 'O ministério quíntuplo.',
                texto:
                  'Esses presbíteros são formados e treinados por pessoas vocacionadas a um dos cinco ministérios – apóstolos, profetas, evangelistas, pastores e mestres. Eles percorrem casa em casa, funcionando como um sistema circulatório espiritual que abastece a rede com os nutrientes necessários para se manter saudável e se multiplicar. Fortalecem a coesão do corpo, como tendões que mantêm um organismo unido.',
              },
            ],
          },
          'Por meio desses ministérios, as igrejas nos lares operam de forma orgânica, servindo todo o corpo de Cristo em uma região e conectando-se a outras cidades e nações. São recursos contínuos de formação que mantêm a igreja viva, em expansão e alinhada à voz de Deus.',
        ],
      },
    ],
  },
  {
    slug: 'rede-five-one',
    categoria: 'A rede',
    titulo: 'Rede de Igrejas',
    destaque: 'Five One',
    resumo:
      'Conheça a visão que sustenta a rede e como cuidamos de pessoas, líderes e casas para que cada bairro receba o Evangelho de forma prática.',
    secoes: [
      {
        titulo: 'A Rede de Igrejas nas Casas – Five One',
        blocos: [
          'A Rede Five One nasce da convicção de que a Igreja de Cristo é chamada a ser um corpo vivo e missionário, fundamentado na prática comunitária, na simplicidade do evangelho e no poder transformador do Espírito Santo. Diferente de modelos excessivamente centralizados e hierarquizados, essa rede se estrutura de maneira orgânica, tendo como base as igrejas que se reúnem em casas, como no tempo do Novo Testamento (At 2.46; Rm 16.5; Cl 4.15).',
        ],
      },
      {
        titulo: 'O papel dos presbíteros',
        blocos: [
          'Cada igreja na casa é liderada por presbíteros, responsáveis pelo cuidado espiritual da comunidade local. Seu papel é semelhante ao dos anciãos da igreja primitiva (At 14.23; Tt 1.5-9), que zelavam pela fé, acompanhavam os irmãos em suas necessidades e preservavam a unidade da comunidade.',
          'Os presbíteros não assumem funções isoladas, mas fazem parte de um sistema maior, no qual recebem suporte contínuo dos cinco ministérios. Isso garante que cada comunidade local não seja apenas um ponto de reunião, mas um organismo vivo, conectado ao corpo maior de Cristo.',
        ],
      },
      {
        titulo: 'O ministério quíntuplo',
        blocos: [
          'A Rede Five One reconhece que Cristo concedeu à igreja cinco dons ministeriais (Ef 4.11): apóstolos, profetas, evangelistas, pastores e mestres. Esses dons não são títulos hierárquicos, mas funções de serviço para edificação da Igreja. Eles funcionam como um sistema circulatório espiritual, levando vida e nutrientes para cada igreja.',
          {
            tipo: 'lista',
            itens: [
              { titulo: 'O apóstolo', texto: 'garante o impacto missionário, abrindo novos caminhos, plantando novas igrejas e mantendo a visão voltada para a expansão do Reino.' },
              { titulo: 'O profeta', texto: 'assegura a fidelidade à aliança, lembrando constantemente a igreja do chamado à santidade, à verdade e à justiça de Deus.' },
              { titulo: 'O evangelista', texto: 'promove a proclamação do evangelho, trazendo novos discípulos e mantendo a chama da salvação acesa em cada comunidade.' },
              { titulo: 'O pastor', texto: 'gera uma comunidade reconciliada, cuidando das feridas, promovendo reconciliação e fortalecendo a vida fraterna.' },
              { titulo: 'O mestre', texto: 'conduz à sabedoria profunda, edificando a igreja no conhecimento bíblico e na maturidade cristã.' },
            ],
          },
          'Esses cinco dons juntos formam um equilíbrio que impede que a igreja se torne unilateral. Cada ministério traz um aspecto essencial de Cristo para dentro do corpo, e sua interação assegura que a igreja viva em plenitude.',
        ],
      },
      {
        titulo: 'A rede como organismo',
        blocos: [
          'Diferente de uma organização meramente institucional, a Rede Five One se estrutura como uma rede apostólica de significados. Seu funcionamento não depende de estruturas rígidas, mas de relacionamentos de discipulado, fidelidade ao evangelho e compartilhamento de vida.',
          {
            tipo: 'lista',
            itens: [
              { texto: 'As igrejas nas casas são os pontos de vida local.' },
              { texto: 'Os presbíteros oferecem cuidado e liderança espiritual em cada comunidade.' },
              { texto: 'Os cinco ministérios circulam entre as casas, fortalecendo, corrigindo, ensinando e consolidando a fé, como tendões que mantêm o corpo unido.' },
            ],
          },
        ],
      },
      {
        titulo: 'Multiplicação e missão',
        blocos: [
          'Esse modelo permite que a Rede Five One seja expansiva por natureza. Como cada igreja se reúne em casas e é nutrida pelos ministérios, ela se torna saudável e, consequentemente, apta a multiplicar-se. Cada casa pode tornar-se o ponto inicial de uma nova comunidade, e cada comunidade pode se conectar a outras, formando uma teia viva de discipulado e missão (At 6.7).',
        ],
      },
      {
        titulo: 'Unidade na diversidade',
        blocos: [
          'Um dos maiores desafios da igreja ao longo da história foi o risco de se tornar monopolizada por apenas um dom. A Rede Five One busca superar esse desequilíbrio, promovendo a plenitude dos cinco dons atuando em conjunto, para que a igreja reflita Cristo em sua totalidade.',
        ],
      },
      {
        titulo: 'Conclusão',
        blocos: [
          'A Rede Five One é uma expressão contemporânea do modelo bíblico de igreja: simples, missionária e relacional. Ela une a força das igrejas nas casas, a liderança de presbíteros e a atuação indispensável dos cinco ministérios. Mais do que uma instituição, é um movimento vivo, onde cada comunidade local é parte de um organismo maior, nutrido e sustentado por Cristo, o verdadeiro cabeça da Igreja.',
          {
            tipo: 'destaque',
            texto: 'Um chamado a viver o DNA apostólico da igreja primitiva, para que o povo de Deus seja formado, as cidades sejam impactadas e o Reino de Cristo avance até os confins da terra.',
          },
        ],
      },
    ],
  },
  {
    slug: 'o-que-e-five-one',
    categoria: 'Five One',
    titulo: 'O que é o',
    destaque: 'Five One',
    resumo:
      'Entenda o coração apostólico da Five One e como despertamos discípulos para viver, ensinar e multiplicar o Reino em todos os lugares.',
    secoes: [
      {
        blocos: [
          'Five One é uma cultura, não apenas um nome. Somos inspirados por Efésios 4:11 e acreditamos que os cinco dons ministeriais continuam ativos hoje para edificar a igreja. Trabalhamos para despertar e integrar esses dons no dia a dia das casas, das equipes e de toda a rede.',
          'Nosso processo envolve formação intencional, acompanhamento pastoral e experiências práticas de serviço. Cada pessoa é convidada a descobrir sua vocação em Cristo e a colocá-la em movimento na comunidade. Queremos remover a separação entre “chamados” e “membros”, pois todos são capacitados pelo Espírito para servir.',
          'A Five One também desenvolve conteúdos, encontros regionais e iniciativas sociais para impactar cidades. A mesa abre portas, o discipulado gera maturidade e o envio mantém a chama missionária acesa. Assim, fortalecemos a unidade do corpo de Cristo enquanto multiplicamos igrejas nas casas.',
          {
            tipo: 'destaque',
            texto: 'Nosso compromisso é formar discípulos maduros que manifestem Jesus com criatividade, coragem e amor em cada contexto da sociedade.',
          },
        ],
      },
    ],
  },
];
