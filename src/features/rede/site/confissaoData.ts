// Texto da Confissão de Fé da Rede de Igrejas nas Casas, extraído de
// public/assets/pdfs/confissao-de-fe.pdf. Ao revisar o PDF, atualize aqui também.

export type Bloco =
  | string
  | { tipo: 'citacao'; texto: string; ref: string }
  | { tipo: 'subtitulo'; texto: string }
  | { tipo: 'lista'; ordenada: boolean; itens: string[] };

export type Doutrina = {
  id: string;
  letra: string;
  titulo: string;
  cremos: string;
  blocos: Bloco[];
  aplicacaoTitulo: string | null;
  aplicacao: string[];
};

export type Confissao = {
  prefacio: string[];
  prefacioAssinatura: string;
  credo: { origem: string; intro: string; linhas: string[] };
  introducao: Bloco[];
  primarias: Doutrina[];
  secundarias: Doutrina[];
  conclusao: Bloco[];
};

export const CONFISSAO: Confissao = {
  "prefacio": [
    "Toda comunidade cristã, desde os primeiros séculos, sentiu a necessidade de colocar por escrito aquilo em que crer. Não porque a fé caiba dentro de palavras humanas — ela é maior do que qualquer formulação —, mas porque palavras claras protegem os simples, instruem os novos discípulos e mantêm a igreja unida em torno do mesmo evangelho.",
    "Esta Confissão de Fé é o coração doutrinário da nossa Rede de Igrejas nas Casas. Antes de tudo, é importante esclarecer o que cada palavra significa para nós: o nome da igreja local não é “Five One”. Cada igreja é, antes de tudo, uma igreja na casa. A Rede de Igrejas nas Casas — identificada internamente como Rede Five One — é a rede de cinco ministérios que cuida, acompanha e fortalece essas igrejas nas casas, para que o Corpo de Cristo seja edificado de forma saudável e fiel à Escritura. Não somos uma denominação, e nenhuma instituição “possui” as casas — os vínculos entre nós se parecem mais com os de uma família do que com os de uma estrutura institucional.",
    "Este documento, portanto, não é um manual de regras, e sim um pacto de aliança: declaramos publicamente o que cremos, como cremos e por que cremos, para que cada irmão e irmã saiba em que terreno estamos pisando juntos.",
    "Organizamos o documento em duas grandes partes. A primeira reúne as doutrinas primárias, aquelas que definem o evangelho e sem as quais não há cristianismo verdadeiro. A segunda apresenta as doutrinas secundárias, que não determinam quem é cristão, mas moldam profundamente a forma como vivemos a vida da igreja local.",
    "Que cada página deste documento sirva à glória de Cristo, à edificação dos santos e à expansão do Reino — perseverando, como a Igreja primitiva, na doutrina dos apóstolos, na comunhão, no partir do pão e nas orações (At 2.42)."
  ],
  "prefacioAssinatura": "Liderança da Rede de Igrejas nas Casas",
  "credo": {
    "origem": "Concílio de Niceia (325 d.C.) · Concílio de Constantinopla (381 d.C.)",
    "intro": "Em comunhão com a Igreja Global de todos os tempos, recitamos o credo confessado pelos primeiros concílios ecumênicos.",
    "linhas": [
      "Creio em um só Deus, Pai Todo-Poderoso,",
      "criador do céu e da terra,",
      "de todas as coisas visíveis e invisíveis.",
      "Creio em um só Senhor, Jesus Cristo,",
      "Filho Unigênito de Deus,",
      "nascido do Pai antes de todos os séculos:",
      "Deus de Deus, luz da luz,",
      "Deus verdadeiro de Deus verdadeiro,",
      "gerado, não criado, consubstancial ao Pai.",
      "Por ele todas as coisas foram feitas.",
      "E por nós, homens, e para nossa salvação,",
      "desceu dos céus",
      "e se encarnou pelo Espírito Santo,",
      "no seio da Virgem Maria,",
      "e se fez homem.",
      "Também por nós foi crucificado sob Pôncio Pilatos;",
      "padeceu e foi sepultado.",
      "Ressuscitou ao terceiro dia,",
      "conforme as Escrituras,",
      "e subiu aos céus,",
      "onde está sentado à direita do Pai.",
      "E de novo há de vir, em sua glória,",
      "para julgar os vivos e os mortos;",
      "e o seu reino não terá fim.",
      "Creio no Espírito Santo,",
      "Senhor que dá a vida,",
      "e procede do Pai e do Filho;",
      "e com o Pai e o Filho é adorado e glorificado:",
      "ele que falou pelos profetas.",
      "Creio na Igreja, una, santa, católica e apostólica.",
      "Professo um só batismo para remissão dos pecados.",
      "E espero a ressurreição dos mortos",
      "e a vida do mundo que há de vir.",
      "Amém."
    ]
  },
  "introducao": [
    "A história do povo de Deus é também a história de uma fé confessada. Israel confessava: “Ouve, ó Israel, o Senhor é o nosso Deus, o Senhor é um” (Dt 6.4). A igreja primitiva confessava: “Jesus é Senhor” (Rm 10.9). Nos séculos seguintes, irmãos perseguidos selaram com o próprio sangue confissões cristológicas e trinitárias que ainda hoje guiam o povo de Deus.",
    "Confessar a fé é, antes de tudo, um ato de adoração. É colocar palavras claras em cima de convicções profundas, para que a comunidade saiba o que é negociável e o que jamais será. Nesse sentido, distinguir doutrinas primárias e secundárias não é hierarquizar verdades em mais e menos importantes — todas as doutrinas bíblicas importam — mas reconhecer que algumas estão no centro do evangelho e outras, embora preciosas, situam-se na vida prática da comunidade.",
    {
      "tipo": "subtitulo",
      "texto": "Doutrinas Primárias — essenciais ao evangelho"
    },
    "As doutrinas primárias são o alicerce sobre o qual o cristianismo se sustenta. São inegociáveis. Negá-las é, na prática, abandonar o evangelho transmitido “uma vez por todas aos santos” (Jd 3).",
    "Elas são essenciais para a fé e para a salvação. São aquilo que a Igreja Global, em todos os tempos e lugares, professou. Quando alguém abraça essas verdades, é parte da família da fé; quando alguém as rejeita, ainda que se diga cristão, está fora dos limites do evangelho.",
    "Exemplos: a Trindade, a divindade e humanidade de Cristo, sua morte vicária e ressurreição corporal, a salvação pela graça mediante a fé, a autoridade plena da Escritura, a segunda vinda gloriosa de Cristo.",
    {
      "tipo": "subtitulo",
      "texto": "Doutrinas Secundárias — urgentes para a saúde da igreja"
    },
    "As doutrinas secundárias não fundamentam a salvação, mas são urgentes para a prática saudável e fiel da igreja. Elas moldam a vida comunitária, a forma como nos organizamos, servimos, batizamos, ceiamos e vivemos em missão.",
    "É inteiramente possível que um irmão ou irmã seja genuinamente cristão e discorde de pontos secundários da nossa confissão. Reconhecemos isso com alegria. No entanto, quando alguém deseja se tornar membro desta comunidade, é necessário que esteja disposto a viver segundo essas convicções — não como imposição, mas como aliança. Caso contrário, a vida em comunhão se tornará fonte de frustração mútua, pois divergências em pontos secundários inevitavelmente geram diferentes expressões de igreja.",
    "Em síntese: as doutrinas primárias dizem quem é cristão; as doutrinas secundárias dizem que tipo de igreja somos.",
    {
      "tipo": "citacao",
      "texto": "Permaneçamos firmes na esperança que professamos, pois aquele que prometeu é fiel.",
      "ref": "Hebreus 10.23"
    }
  ],
  "primarias": [
    {
      "id": "p-a-santissima-trindade",
      "letra": "a",
      "titulo": "A Santíssima Trindade",
      "cremos": "CREMOS em um único Deus, eterno e vivo, que existe em três Pessoas distintas e inseparáveis: o Pai, o Filho e o Espírito Santo (Dt 6.4; Mt 28.19; 2Co 13.13; Jo 1.1; 14.16-17).",
      "blocos": [
        "Essas três Pessoas são iguais em essência, glória, poder e eternidade, distintas em suas relações pessoais e unidas em perfeita comunhão de amor. O Pai gera eternamente o Filho; o Espírito procede eternamente do Pai e do Filho. Não cremos em três deuses, nem em um único Deus que se manifesta sob três máscaras: cremos em um Deus que é, em si mesmo e desde a eternidade, comunhão pessoal e amorosa.",
        "A doutrina da Trindade, longe de ser um enigma especulativo, é o coração da fé cristã. É ela que nos permite compreender que “Deus é amor” (1Jo 4.8) — não porque ame algo fora de si, mas porque, em sua própria vida, Pai, Filho e Espírito sempre se amaram. A criação, a redenção e a consumação da história são obras desse Deus tripessoal agindo em perfeita unidade."
      ],
      "aplicacaoTitulo": "Implicações para a comunidade",
      "aplicacao": [
        "Toda nossa adoração é dirigida a um só Deus em três Pessoas — oramos ao Pai, por meio do Filho, no Espírito Santo.",
        "A vida da igreja deve refletir a comunhão trinitária: pluralidade harmônica, amor relacional e unidade na diversidade."
      ]
    },
    {
      "id": "p-a-pessoa-e-obra-de-jesus-cristo",
      "letra": "b",
      "titulo": "A Pessoa e Obra de Jesus Cristo",
      "cremos": "CREMOS em Jesus Cristo, o Filho eterno e unigênito de Deus, que veio em forma de homem, sendo plenamente Deus e plenamente homem em uma só Pessoa (Jo 1.1,14; Cl 2.9; Fp 2.6-11; Hb 1.1-3).",
      "blocos": [
        "O Verbo eterno se fez carne na plenitude dos tempos, sendo concebido pelo Espírito Santo e nascido da virgem Maria. Em sua humanidade verdadeira, Ele teve fome, sede, cansaço e tristeza; em sua divindade plena, perdoou pecados, dominou ventos e mares, e recebeu adoração. Viveu uma vida de perfeita obediência ao Pai, sem jamais conhecer o pecado, ainda que tenha sido tentado em todas as coisas como nós (Hb 4.15).",
        "Em obediência ao Pai, foi crucificado sob Pôncio Pilatos, morrendo em nosso lugar como sacrifício substitutivo pelos nossos pecados. Ao terceiro dia, ressuscitou corporalmente dos mortos, vencendo a morte e o diabo, garantindo a salvação dos que creem. Ascendeu ao céu, onde reina à direita do Pai, intercedendo por nós como nosso único Mediador e Sumo Sacerdote. De lá voltará pessoal, visível e gloriosamente, para julgar os vivos e os mortos e consumar seu Reino eterno.",
        {
          "tipo": "citacao",
          "texto": "Cristo morreu pelos nossos pecados, segundo as Escrituras, foi sepultado e ressuscitou ao terceiro dia.",
          "ref": "1 Coríntios 15.3-4"
        }
      ],
      "aplicacaoTitulo": "Implicações para a comunidade",
      "aplicacao": [
        "Cristo é o centro absoluto da nossa fé, pregação, adoração e vida. Não há cristianismo sem Cristo crucificado e ressuscitado.",
        "A encarnação nos ensina que Deus se aproxima do humano — e por isso nossa missão é encarnacional, vivendo o evangelho dentro das casas, dos relacionamentos e das fragilidades humanas."
      ]
    },
    {
      "id": "p-o-espirito-santo",
      "letra": "c",
      "titulo": "O Espírito Santo",
      "cremos": "CREMOS no Espírito Santo, a terceira Pessoa da Trindade, plenamente divino, pessoal e ativo na obra de Deus (Jo 14.16-17; 16.7-15; At 1.8; 5.3-4; Rm 8.9-11).",
      "blocos": [
        "O Espírito Santo é o Senhor que dá a vida. Ele participou da criação, inspirou os profetas, ungiu o Messias, capacitou os apóstolos e hoje continua sua obra na história. É Ele quem convence o mundo do pecado, da justiça e do juízo (Jo 16.8); quem regenera o coração humano fazendo nascer de novo (Jo 3.5-6); quem habita no crente como selo e penhor da herança (Ef 1.13-14); e quem santifica, consola, ensina, intercede e capacita o povo de Deus para a missão.",
        "Não O reduzimos a uma força impessoal, nem O confundimos com emoções humanas. Ele é Pessoa que pode ser entristecida (Ef 4.30) e a quem se pode mentir (At 5.3). Sem o Espírito, não há vida cristã, não há igreja, não há missão."
      ],
      "aplicacaoTitulo": "Implicações para a comunidade",
      "aplicacao": [
        "Buscamos viver continuamente cheios do Espírito (Ef 5.18), dependendo dele para discernir, pregar, servir e amar.",
        "Reconhecemos sua liberdade soberana de distribuir dons como Lhe apraz (1Co 12.11), recebendo cada manifestação com gratidão e discernimento bíblico."
      ]
    },
    {
      "id": "p-as-escrituras-sagradas",
      "letra": "d",
      "titulo": "As Escrituras Sagradas",
      "cremos": "CREMOS que a Bíblia, composta pelos sessenta e seis livros do Antigo e do Novo Testamento, é a Palavra de Deus inspirada, infalível, inerrante em seus autógrafos originais e plenamente suficiente para a fé e a prática cristãs (2Tm 3.16-17; 2Pe 1.20-21; Sl 19.7-11; Sl 119).",
      "blocos": [
        "A Escritura é a auto-revelação verbal e escrita do Deus vivo. Foi produzida ao longo de séculos, por dezenas de autores humanos, em diferentes culturas e gêneros literários, mas todos eles foram conduzidos pelo Espírito Santo de tal modo que aquilo que escreveram é, simultaneamente, palavra plenamente humana e plenamente divina.",
        "Como Palavra de Deus, a Bíblia possui autoridade suprema sobre toda consciência, tradição, experiência e razão humana. Todas as outras autoridades — pastorais, eclesiásticas, culturais — devem submeter-se a ela. Como suficiente, ela contém tudo o que é necessário para a salvação, a fé e a vida piedosa, sem que precisemos acrescentar a ela revelações, tradições ou ensinos que a contradigam.",
        "Reconhecemos que o Espírito Santo continua falando hoje à igreja, mas sempre de modo coerente com — e nunca contra — aquilo que já foi escrito. Toda profecia, toda direção, todo ensino devem ser provados pela Escritura (At 17.11; 1Ts 5.20-21)."
      ],
      "aplicacaoTitulo": "Implicações para a comunidade",
      "aplicacao": [
        "Lemos, ensinamos, pregamos e meditamos na Palavra como prática central de nossa vida comunitária.",
        "Toda doutrina, prática e decisão da rede deve ser submetida ao crivo das Escrituras, e nenhuma tradição humana — inclusive as nossas — está acima dela."
      ]
    },
    {
      "id": "p-a-igreja",
      "letra": "e",
      "titulo": "A Igreja",
      "cremos": "CREMOS que a Igreja é o Corpo de Cristo, o povo eterno de Deus, formada por todos os que, em todos os tempos e lugares, foram regenerados pelo Espírito Santo e unidos a Cristo pela fé (Ef 1.22-23; 1Co 12.12-13; Mt 16.18; 1Pe 2.9-10).",
      "blocos": [
        "A Igreja é, ao mesmo tempo, Global e local. Global, porque inclui todos os santos de todas as épocas, de todas as tribos, línguas e nações, no céu e na terra. Local, porque se manifesta concretamente em comunidades visíveis que se reúnem regularmente para a vida do evangelho — comunhão, ensino, oração, partir do pão, serviço e missão (At 2.42-47).",
        "Não há cristianismo solitário. O Novo Testamento não conhece o crente desligado do Corpo. Quem se converte a Cristo é, por isso mesmo, incorporado à sua Igreja. Por isso, a vida cristã madura exige pertencimento, compromisso e submissão mútua dentro de uma comunidade local."
      ],
      "aplicacaoTitulo": "Implicações para a comunidade",
      "aplicacao": [
        "Levamos a sério a vida em comunidade local, com pertencimento, fidelidade e responsabilidade mútua.",
        "Reconhecemos como irmãos todos os que confessam o evangelho, ainda que pertençam a outras tradições eclesiásticas, sem perder nossa identidade própria."
      ]
    },
    {
      "id": "p-o-sacerdocio-de-todos-os-santos",
      "letra": "f",
      "titulo": "O Sacerdócio de Todos os Santos",
      "cremos": "CREMOS que todo cristão é sacerdote de Deus, com acesso direto ao Pai por meio de Jesus Cristo, sem necessidade de qualquer mediação humana (Hb 4.14-16; 10.19-22; 1Pe 2.5,9; Ap 1.6; 1Tm 2.5).",
      "blocos": [
        "Sob a Nova Aliança, o véu do templo foi rasgado de alto a baixo. Não há mais uma casta sacerdotal especial entre Deus e os homens. Cristo, nosso único Sumo Sacerdote, abriu um novo e vivo caminho. Todo aquele que crê tem livre acesso ao trono da graça e é, ele mesmo, parte de um sacerdócio real, oferecendo a Deus sacrifícios espirituais — adoração, intercessão, serviço e testemunho.",
        "Isso não anula a existência de líderes reconhecidos na igreja, como presbíteros e ministérios específicos. Ao contrário, esses líderes existem para equipar todos os santos para a obra do ministério (Ef 4.11-12), e não para fazer a obra no lugar deles. Cada irmão e irmã, sem exceção, tem dom, vocação e responsabilidade no Reino."
      ],
      "aplicacaoTitulo": "Implicações para a comunidade",
      "aplicacao": [
        "Rejeitamos qualquer forma de clericalismo que separe artificialmente “ministros” e “leigos”.",
        "Estimulamos cada membro a descobrir, desenvolver e exercer seus dons, ministrando uns aos outros, a Deus e ao mundo."
      ]
    },
    {
      "id": "p-a-salvacao-pela-graca",
      "letra": "g",
      "titulo": "A Salvação pela Graça",
      "cremos": "CREMOS que a salvação é dom inteiramente gratuito de Deus, concedido pela graça mediante a fé em Jesus Cristo, e jamais por méritos, obras ou esforços humanos (Ef 2.8-9; Tt 3.5; Rm 3.21-26; Jo 3.16).",
      "blocos": [
        "A salvação tem origem no amor eterno do Pai, que enviou seu Filho ao mundo para nos salvar (Jo 3.16; 1Jo 4.9-10). Foi conquistada pelo Filho na cruz e na ressurreição, que pagou em nosso lugar a dívida do pecado e venceu a morte. É aplicada pelo Espírito Santo, que regenera, justifica, adota e santifica, e que é dado a todo aquele que crê como selo e penhor da herança eterna (Ef 1.13-14; 2Co 1.21-22).",
        "Reconhecemos que cristãos fiéis têm explicado de modos diferentes como a graça soberana de Deus e a resposta humana se relacionam no momento da salvação. Esses debates, ainda que importantes, não devem dividir o Corpo de Cristo. Permanecemos firmes naquilo que une toda a Igreja: salvos pela graça, mediante a fé, em Cristo, para a glória de Deus."
      ],
      "aplicacaoTitulo": "Implicações para a comunidade",
      "aplicacao": [
        "Pregamos um evangelho de pura graça, sem misturá-lo com legalismo, moralismo ou prosperidade.",
        "Vivemos em gratidão: as boas obras não são causa, mas fruto inevitável da salvação recebida (Ef 2.10)."
      ]
    },
    {
      "id": "p-a-justificacao-pela-fe-somente",
      "letra": "h",
      "titulo": "A Justificação pela Fé Somente",
      "cremos": "CREMOS que todo pecador é declarado justo diante de Deus somente pela fé em Jesus Cristo, com base unicamente em sua obra expiatória, à parte de qualquer mérito ou obra da Lei (Rm 3.21-28; 5.1; Gl 2.16; Fp 3.9; 2Co 5.21).",
      "blocos": [
        "A justificação é o ato judicial e gracioso pelo qual Deus, agindo como Juiz justo, declara o pecador absolvido de toda culpa e revestido da perfeita justiça de Cristo. Seu fundamento histórico está na cruz, onde Cristo carregou nossos pecados, sofreu em nosso lugar a condenação que merecíamos e satisfez plenamente a justiça de Deus (Is 53.4-6; Rm 3.25-26; 1Pe 2.24).",
        "O Novo Testamento descreve essa realidade como a grande troca: “Aquele que não conheceu pecado, Deus o fez pecado por nós; para que nele fôssemos feitos justiça de Deus” (2Co 5.21). Nossos pecados foram imputados a Cristo na cruz; sua justiça perfeita é imputada a nós pela fé. Por isso a justificação é plena e definitiva — não pode ser perdida, porque seu fundamento está fora de nós, na obra consumada de Cristo.",
        "Justificação e santificação devem ser distinguidas, ainda que jamais separadas. A justificação muda o nosso status diante de Deus, de uma vez por todas; a santificação muda gradualmente o nosso caráter pelo Espírito (2Co 3.18; Fp 1.6). A primeira é ato instantâneo recebido pela fé; a segunda é processo de toda a vida. Distingui-las nos liberta para amar a Deus por gratidão, e não por medo."
      ],
      "aplicacaoTitulo": "Implicações para a comunidade",
      "aplicacao": [
        "Vivemos com consciência limpa e segurança da salvação, repousando exclusivamente na obra de Cristo.",
        "Pregamos a justificação pela fé como pão diário da vida cristã, e não como doutrina apenas para o momento da conversão."
      ]
    },
    {
      "id": "p-a-segunda-vinda-de-cristo",
      "letra": "i",
      "titulo": "A Segunda Vinda de Cristo",
      "cremos": "CREMOS que Jesus Cristo voltará pessoal, visível, corporal e gloriosamente para consumar o Reino de Deus (At 1.11; Tt 2.13; 1Ts 4.13-18; Mt 24-25; Ap 22.12-20).",
      "blocos": [
        "Não esperamos um retorno simbólico ou meramente espiritual. O mesmo Jesus que ascendeu aos céus voltará da mesma maneira: visível e corporal. Sua vinda será o clímax da história. Naquele dia, todos os mortos ressuscitarão, todos serão julgados conforme suas obras, e o Reino do Pai será plenamente manifestado.",
        "A esperança da volta de Cristo é o horizonte sob o qual toda a vida cristã deve ser vivida. Ela nos liberta da ansiedade pelo presente, da sedução das idolatrias e do desespero diante do mal, porque sabemos que “este mesmo Jesus” terá a última palavra na história.",
        {
          "tipo": "citacao",
          "texto": "Eis que venho sem demora! Felizes aqueles que lavam as suas vestes, para que tenham direito à árvore da vida.",
          "ref": "Apocalipse 22.12,14"
        }
      ],
      "aplicacaoTitulo": "Implicações para a comunidade",
      "aplicacao": [
        "Vivemos em vigilância e santidade, à luz daquele dia (1Jo 3.2-3).",
        "Mantemos humildade nas questões cronológicas e esquemáticas do fim, sem perder a centralidade da volta gloriosa de Cristo."
      ]
    },
    {
      "id": "p-a-ressurreicao-dos-mortos-e-a-vida-eterna",
      "letra": "j",
      "titulo": "A Ressurreição dos Mortos e a Vida Eterna",
      "cremos": "CREMOS na ressurreição corporal de todos os mortos: os que creram em Cristo para a vida eterna em comunhão plena com Deus, e os que rejeitaram o evangelho para a condenação eterna, separados para sempre da presença gloriosa do Senhor (Jo 5.28-29; 1Co 15.42-58; Ap 20.11-15; 21.1-5).",
      "blocos": [
        "A esperança cristã não é a fuga da matéria, mas a redenção do corpo (Rm 8.23). O que Deus promete não é uma existência etérea de almas desincorporadas, mas a ressurreição corporal e a renovação completa da criação. Os redimidos viverão eternamente, em corpos glorificados, com Deus, em uma nova terra onde habita a justiça.",
        "Levamos igualmente a sério a realidade do juízo final. Falamos com tristeza, jamais com leveza, do destino dos que rejeitam Cristo. Mas é precisamente essa seriedade que torna o evangelho urgente e a missão indispensável."
      ],
      "aplicacaoTitulo": "Implicações para a comunidade",
      "aplicacao": [
        "Vivemos com esperança firme diante da morte, do luto e do sofrimento — eles não têm a última palavra.",
        "A urgência da missão e do evangelismo decorre da realidade do juízo e da glória da vida eterna."
      ]
    },
    {
      "id": "p-a-criacao",
      "letra": "l",
      "titulo": "A Criação",
      "cremos": "CREMOS que Deus, por sua Palavra eterna, criou os céus e a terra e tudo quanto neles há, do nada e por sua livre vontade soberana, declarando boa toda a sua obra (Gn 1-2; Sl 19.1-4; Sl 33.6-9; Sl 104; Sl 148; Jo 1.1-3; Cl 1.16-17; Hb 11.3; Ap 4.11).",
      "blocos": [
        "Toda a criação tem origem em Deus e existe para sua glória. O cosmo não é fruto do acaso, nem produto de forças impessoais: é obra das mãos do Deus vivo, que falou e tudo veio a existir (Sl 33.9). Os céus proclamam a glória de Deus, e o firmamento anuncia a obra de suas mãos (Sl 19.1). De galáxias a microorganismos, das montanhas aos pássaros do campo, das estrelas aos cabelos da nossa cabeça, tudo carrega a assinatura do Criador — seu poder, sua sabedoria, sua beleza e sua bondade (Rm 1.20; Sl 104).",
        "A criação não é apenas matéria-prima para o uso humano: é palco da glória de Deus e objeto de seu cuidado constante. Ele veste os lírios do campo, alimenta os pássaros do céu, sustenta toda a vida pelo poder de sua palavra (Mt 6.26-30; Hb 1.3; Cl 1.17). Por isso, animais, plantas, oceanos e florestas não são descartáveis; participam, à sua maneira, do louvor que sobe do conjunto da criação ao seu Criador (Sl 148; Sl 150.6).",
        "De modo singular, dentre todas as criaturas, o ser humano foi feito à imagem e semelhança de Deus (Gn 1.26-27). Homem e mulher, juntos, refletem essa imagem, recebendo o chamado de cultivar a terra, gerar vida, viver em comunhão e adorar a Deus. A dignidade humana é inviolável e não pode ser anulada pela queda, pelo pecado, pela cor, pela classe, pela idade, pela origem ou pela condição — toda vida humana, do ventre ao último suspiro, é sagrada porque traz a marca do Eterno.",
        "Embora ferida pelo pecado, a criação não foi abandonada por Deus. Ela geme, aguardando ansiosamente a redenção, e será plenamente restaurada quando Cristo retornar para fazer novas todas as coisas (Rm 8.19-23; Ap 21.5). Cremos, portanto, na criação não como um acontecimento apenas do passado, mas como um arco que começa em Gênesis e termina em Apocalipse — na nova criação, onde habitará a justiça."
      ],
      "aplicacaoTitulo": "Implicações para a comunidade",
      "aplicacao": [
        "Defendemos a dignidade de toda vida humana, do ventre ao último suspiro, e somos chamados a um cuidado responsável da criação.",
        "Reconhecemos o trabalho, a cultura, a ciência, a arte e a vida cotidiana como espaços legítimos de adoração ao Criador.",
        "Contemplamos a beleza da criação como convite à adoração, e como antegozo da nova criação que há de vir."
      ]
    },
    {
      "id": "p-a-queda-e-a-depravacao-humana",
      "letra": "m",
      "titulo": "A Queda e a Depravação Humana",
      "cremos": "CREMOS que, por causa do pecado de Adão, toda a humanidade caiu, tornando-se separada de Deus, espiritualmente morta, escrava do pecado e incapaz, por si mesma, de salvar-se ou de agradar a Deus (Gn 3; Rm 3.10-23; 5.12-21; Ef 2.1-3; Sl 51.5).",
      "blocos": [
        "A condição humana caída atinge todas as dimensões: a mente, a vontade, as emoções, as relações e o corpo. Não somos pecadores apenas porque pecamos; pecamos porque, desde a queda, somos pecadores. Nada em nós escapa do alcance dessa corrupção, embora pela graça comum de Deus a humanidade ainda manifeste resquícios da imagem divina — capaz de bondade relativa, beleza e justiça civil.",
        "Essa doutrina, longe de ser pessimista, é radicalmente realista. Ela explica o mal do mundo, a violência, a injustiça e o quebrantamento das relações. E é justamente sobre esse pano de fundo escuro que a graça de Deus brilha de modo tão glorioso."
      ],
      "aplicacaoTitulo": "Implicações para a comunidade",
      "aplicacao": [
        "Cultivamos humildade: jamais nos colocamos como melhores que os de fora, pois fomos resgatados pela mesma graça.",
        "Nossa pregação chama ao arrependimento genuíno, sem suavizar a gravidade do pecado nem a beleza da redenção."
      ]
    },
    {
      "id": "p-a-exclusividade-de-cristo-como-mediador",
      "letra": "n",
      "titulo": "A Exclusividade de Cristo como Mediador",
      "cremos": "CREMOS que há um só Deus e um só Mediador entre Deus e os homens: Jesus Cristo, e que ninguém vem ao Pai senão por meio dele (1Tm 2.5; Jo 14.6; At 4.12; Hb 9.15).",
      "blocos": [
        "Esta é, talvez, a afirmação mais ofensiva do cristianismo aos ouvidos contemporâneos — e, ainda assim, é o coração do evangelho. Não há salvação em qualquer outro nome, em qualquer outra religião, em qualquer outro caminho. Cristo não é uma opção entre muitas; ele é o único Mediador, porque é o único plenamente Deus e plenamente homem, o único que viveu sem pecado e o único que morreu e ressuscitou para a salvação dos pecadores.",
        "Confessar essa exclusividade não nos torna arrogantes; ao contrário, nos coloca de joelhos. Não fomos nós que descobrimos o caminho — foi Cristo que veio até nós. E precisamente por sabermos que Ele é o único caminho, somos enviados ao mundo com a mensagem da salvação para todos os povos."
      ],
      "aplicacaoTitulo": "Implicações para a comunidade",
      "aplicacao": [
        "Pregamos com convicção e amor a Cristo como único Salvador, sem relativismos.",
        "A missão entre todos os povos é mandato indispensável, não opcional, da igreja."
      ]
    }
  ],
  "secundarias": [
    {
      "id": "s-a-igreja-nas-casas",
      "letra": "a",
      "titulo": "A Igreja nas Casas",
      "cremos": "CREMOS que a igreja deve se reunir prioritariamente em casas, recuperando o modelo neotestamentário e relacional dos primeiros discípulos (At 2.46; 5.42; 16.40; 20.20; Rm 16.5; 1Co 16.19; Cl 4.15; Fm 2).",
      "blocos": [
        "Quando lemos o Novo Testamento, encontramos uma igreja que se reunia, sobretudo, nas casas. Não havia edifícios cristãos próprios nos primeiros séculos. Havia mesas, salas, pátios, oficinas. E aqui está uma distinção que precisamos guardar com cuidado: a casa não se transforma em “templo”, “santuário” ou “lugar sagrado” pelo fato de uma igreja se reunir nela. A casa continua sendo apenas uma casa. O que importa é quem se reúne ali — porque nós, o povo de Deus, e não o local, somos a Igreja (1Co 3.16-17; 1Pe 2.5).",
        "A igreja nas casas não é uma estratégia de crescimento nem uma reação contra estruturas maiores. É uma convicção: cremos que a casa é o ambiente mais natural para a formação de discípulos. Em torno da mesa, ninguém é plateia. A Palavra é compartilhada, as crianças participam, os fardos são divididos, o pão e o vinho lembram o sacrifício de Cristo, e a hospitalidade se torna serviço de adoração. A casa nos liberta da separação artificial entre o sagrado e o cotidiano — e nos lembra que a Igreja é, antes de tudo, gente, e não local."
      ],
      "aplicacaoTitulo": "Aplicação na nossa rede",
      "aplicacao": [
        "Cada igreja da nossa rede é, antes de tudo, uma igreja na casa — essa é nossa expressão básica de comunidade.",
        "Reunimos eventualmente as comunidades em encontros maiores, mas a casa é o centro gravitacional da nossa vida.",
        "A liderança é exercida no contexto relacional do convívio, não da distância institucional."
      ]
    },
    {
      "id": "s-os-cinco-ministerios",
      "letra": "b",
      "titulo": "Os Cinco Ministérios",
      "cremos": "CREMOS que o Cristo ressurreto concedeu à sua Igreja cinco dons ministeriais — apóstolos, profetas, evangelistas, pastores e mestres — para equipar os santos, edificar o Corpo de Cristo e conduzi-lo à plenitude da maturidade (Ef 4.7-13; 1Co 12.28; Rm 12.6-8).",
      "blocos": [
        "Esses cinco dons não formam uma elite espiritual nem um clube fechado. Cremos que toda a igreja recebe medidas dos cinco ministérios — todo cristão tem, em alguma proporção, vocação apostólica, profética, evangelística, pastoral ou mestral a expressar no Corpo. Cada um possui, contudo, uma natureza própria:",
        {
          "tipo": "subtitulo",
          "texto": "Os cinco dons ministeriais"
        },
        {
          "tipo": "lista",
          "ordenada": false,
          "itens": [
            "Apóstolos — enviados que abrem caminhos, plantam comunidades e cuidam da fidelidade ao evangelho.",
            "Profetas — vozes que ouvem a Deus para o presente, exortando, consolando e chamando à conversão.",
            "Evangelistas — proclamadores das boas-novas, dotados de paixão e clareza para alcançar os que ainda não creem.",
            "Pastores — cuidadores que conhecem cada ovelha pelo nome, alimentando, protegendo e curando.",
            "Mestres — guardiões da sã doutrina, que ensinam com fidelidade e profundidade as Escrituras."
          ]
        },
        "A ausência de qualquer um desses ministérios empobrece e desequilibra a igreja. Onde só há mestres, a igreja tende ao intelectualismo. Onde só há evangelistas, falta enraizamento. Onde tudo gira em torno de um único pastor, faltam o envio missionário, a voz profética e a clareza doutrinária. Por isso, é nosso compromisso identificar, ativar e desenvolver cada um desses dons no Corpo.",
        "Embora todos os cristãos participem em alguma medida desses cinco ministérios, a igreja reconhece, dentre eles, alguns que liderarão cada uma das cinco frentes ministeriais. Esse reconhecimento não cria uma casta superior; soma-se ao dom recebido a graça da liderança descrita em Romanos 12.8 — capacidade de conduzir, equipar e mobilizar os demais. Liderar uma frente é, antes de tudo, servir aqueles que comigo compartilham aquele mesmo dom."
      ],
      "aplicacaoTitulo": "Aplicação na nossa rede",
      "aplicacao": [
        "Encorajamos cada irmão e irmã a descobrir e exercer sua participação nos cinco ministérios, em alguma medida, no convívio da comunidade.",
        "Reconhecemos lideranças específicas para cada uma das cinco frentes, escolhidas conforme dom de liderança e maturidade espiritual.",
        "Rejeitamos o modelo de “ministério de um homem só”, em que toda a vida da igreja se concentra na figura de uma única liderança."
      ]
    },
    {
      "id": "s-a-continuidade-dos-dons-espirituais",
      "letra": "c",
      "titulo": "A Continuidade dos Dons Espirituais",
      "cremos": "CREMOS que os dons espirituais descritos no Novo Testamento permanecem plenamente ativos hoje, distribuídos pelo Espírito Santo segundo sua vontade soberana, para a edificação do Corpo, o serviço amoroso uns dos outros e o testemunho ao mundo (1Co 12.4-11,28-31; Rm 12.6-8; 1Pe 4.10-11; 1Co 14).",
      "blocos": [
        "Nada no Novo Testamento sugere que os dons cessariam ao final da era apostólica. Pelo contrário, são dados “até que todos cheguemos à unidade da fé” (Ef 4.13) e enquanto durar a era da igreja. Cremos, portanto, que profecia, palavra de sabedoria, dons de cura, línguas, interpretação, discernimento de espíritos e todos os demais dons continuam disponíveis e necessários.",
        "Ao mesmo tempo, queremos exercê-los com sobriedade e ordem (1Co 14.40). Toda manifestação deve ser submetida ao crivo das Escrituras, edificar o Corpo, e nunca contradizer a sã doutrina. Rejeitamos tanto o cessacionismo, que apaga o Espírito (1Ts 5.19), quanto o sensacionalismo, que confunde emoções com revelação."
      ],
      "aplicacaoTitulo": "Aplicação na nossa rede",
      "aplicacao": [
        "Damos espaço para o exercício dos dons em nossas reuniões nas casas, com ordem e edificação.",
        "Ensinamos discernimento bíblico, para julgar toda manifestação à luz das Escrituras (1Ts 5.20- 21)."
      ]
    },
    {
      "id": "s-lideranca-plural-por-presbiteros",
      "letra": "d",
      "titulo": "Liderança Plural por Presbíteros",
      "cremos": "CREMOS que a liderança espiritual da igreja na casa é exercida por presbíteros maduros, reconhecidos por seu caráter cristão, sua maturidade espiritual e sua capacidade de cuidar do rebanho, em comunhão com os demais presbíteros da rede e com os cinco ministérios (At 14.23; 20.17,28; Tt 1.5-9; 1Tm 3.1-7; 5.17; 1Pe 5.1-4).",
      "blocos": [
        "O modelo neotestamentário não reconhece o líder solitário no topo de uma estrutura piramidal. Reconhece, sim, presbíteros (anciãos) — sempre no plural — que cuidam juntos do rebanho de Deus. As palavras presbítero, ancião e bispo (epíscopo) referem-se, no Novo Testamento, à mesma função, vista por ângulos diferentes: presbítero destaca a maturidade, ancião o caráter formado pelo tempo, e bispo a responsabilidade de zelar pelo rebanho (At 20.17,28; Tt 1.5-7; 1Pe 5.1-2).",
        "Distinguimos cuidadosamente, contudo, presbítero de pastor. Em Efésios 4.11, pastor é um dos cinco dons ministeriais que o Cristo ressurreto distribuiu à sua Igreja, ao lado de apóstolos, profetas, evangelistas e mestres. Um presbítero pode ter o dom de pastor, mas nem todo presbítero é pastor — pode liderar a igreja por dom de mestre, profeta, evangelista ou apóstolo —, e nem todo aquele que tem o dom pastoral é, automaticamente, presbítero. Essa distinção é um diferencial importante para nós: queremos resgatar a pluralidade dos cinco ministérios e abandonar o modelo de “ministério de um homem só”, em que toda a vida da igreja é reduzida à figura de um único pastor.",
        "Na prática da nossa rede, cada igreja na casa — pequena por natureza, com cerca de até vinte pessoas — é cuidada por um casal de presbíteros (marido e esposa), responsáveis por pastorear a vida cotidiana daquela comunidade e por formar outros possíveis presbíteros para a multiplicação. A pluralidade da liderança, portanto, não se expressa pelo acúmulo de muitos presbíteros em uma única casa, mas pela comunhão constante entre os presbíteros das diversas casas, que caminham juntos no contexto da rede, sob o cuidado dos cinco ministérios.",
        "Os presbíteros são reconhecidos pelo caráter antes da capacidade. Os critérios paulinos em 1Tm 3 e Tt 1 são quase todos relacionais, morais e familiares. Eles ensinam a Palavra, guardam a doutrina, cuidam do rebanho, exercem disciplina amorosa e dão exemplo de vida. Não dominam sobre os irmãos; servem sob o Sumo Pastor, que é o próprio Cristo (1Pe 5.3-4)."
      ],
      "aplicacaoTitulo": "Aplicação na nossa rede",
      "aplicacao": [
        "Cada igreja na casa é cuidada por um casal de presbíteros, que pastoreia a comunidade e forma novos líderes para a multiplicação.",
        "A pluralidade da liderança se vive na comunhão entre os presbíteros das diversas casas, que caminham juntos no contexto da rede.",
        "A rede como um todo é liderada pelos cinco ministérios, em colaboração constante com os presbíteros das igrejas nas casas.",
        "O reconhecimento de presbíteros se dá pela observação do caráter e da maturidade ao longo do tempo, e não pela atribuição de títulos ou cargos."
      ]
    },
    {
      "id": "s-o-discipulado",
      "letra": "e",
      "titulo": "O Discipulado",
      "cremos": "CREMOS que cada cristão é, ao mesmo tempo, discípulo e discipulador, chamado a seguir a Cristo e a fazer outros discípulos em todas as nações, ensinando-os a obedecer a tudo o que Jesus ordenou (Mt 28.18-20; 2Tm 2.2; Lc 6.40; Jo 13.34-35).",
      "blocos": [
        "O discipulado é a tarefa central da igreja. Cristo não nos chamou apenas para evangelizar, mas para fazer discípulos — pessoas que aprendem a viver como Ele viveu. Isso acontece, sobretudo, de forma relacional, intencional e multiplicadora, no convívio diário, nas refeições, nos conflitos resolvidos e nas alegrias compartilhadas.",
        "Discipular alguém não é apenas transmitir conteúdo; é compartilhar a própria vida (1Ts 2.8). Por isso, o discipulado floresce em ambientes pequenos e relacionais, como o ambiente da casa. Cada discípulo maduro deve formar outros que, por sua vez, formarão outros, perpetuando o evangelho geração após geração."
      ],
      "aplicacaoTitulo": "Aplicação na nossa rede",
      "aplicacao": [
        "Cada irmão e irmã é incentivado a estar em uma relação de discipulado — sendo discipulado e discipulando.",
        "Buscamos formação de líderes não pela mera capacitação técnica, mas pelo caminhar lado a lado em vida real."
      ]
    },
    {
      "id": "s-o-batismo",
      "letra": "f",
      "titulo": "O Batismo",
      "cremos": "CREMOS que o batismo é uma ordenança instituída por Jesus Cristo, a ser administrada por imersão a todos os que professam fé pessoal nele, como sinal público de arrependimento, de identificação com a morte e ressurreição de Cristo e de entrada visível na comunidade da fé (Mt 28.19; At 2.38,41; 8.12,36-38; Rm 6.3-4; Cl 2.12).",
      "blocos": [
        "No Novo Testamento, o batismo é sempre subsequente à fé. Quem se arrepende e crê, batiza-se. O ato externo confessa publicamente a realidade interna: morri com Cristo, fui sepultado com ele, ressuscitei para uma vida nova. A imersão expressa simbolicamente esse mergulho na morte e essa emergência para a vida.",
        "O batismo é também a porta visível de entrada na comunidade da fé. Por meio dele, a pessoa declara publicamente sua adesão a Cristo e ao seu povo. Por isso, o batismo é antes celebração comunitária do que ato privado: é a igreja recebendo, com alegria, mais um membro no Corpo de Cristo."
      ],
      "aplicacaoTitulo": "Aplicação na nossa rede",
      "aplicacao": [
        "Batizamos por imersão pessoas que professam fé consciente em Cristo.",
        "O batismo é celebrado como festa comunitária, idealmente na presença da igreja local."
      ]
    },
    {
      "id": "s-a-ceia-ao-redor-da-mesa",
      "letra": "g",
      "titulo": "A Ceia ao Redor da Mesa",
      "cremos": "CREMOS que a Ceia do Senhor é uma ordenança instituída por Cristo, a ser celebrada como refeição comunitária, na qual recordamos seu sacrifício, alimentamo-nos espiritualmente dele pela fé, fortalecemos a comunhão entre os santos e antecipamos o banquete escatológico do Reino (Mt 26.26-29; 1Co 11.17-34; 10.16-17; Lc 22.14-20; Ap 19.9).",
      "blocos": [
        "A Ceia, no Novo Testamento, não era um rito breve realizado depois do culto: era a refeição em si. A igreja primitiva se reunia para as refeições comuns, e nesse contexto repartia o pão e o cálice em memória do Senhor. Em torno da mesa, recordava-se a entrega do corpo e do sangue de Cristo na cruz, ao mesmo tempo em que se antecipava a grande ceia das bodas do Cordeiro (Ap 19.9).",
        "Cremos que essa centralidade da mesa precisa ser recuperada. A Ceia partilhada como refeição autêntica fortalece a comunhão, expõe e cura divisões (1Co 11.17-22), reconcilia, alimenta a alma e renova a esperança. Não há lugar mais cristão do que uma mesa onde irmãos partilham pão, vinho e vida."
      ],
      "aplicacaoTitulo": "Aplicação na nossa rede",
      "aplicacao": [
        "Celebramos a Ceia regularmente como parte da refeição comunitária, e não como rito isolado.",
        "Ensinamos os irmãos a se aproximarem da mesa com reverência, autoexame e alegria."
      ]
    },
    {
      "id": "s-mutualismo-homem-e-mulher-em-igualdade-no-reino",
      "letra": "h",
      "titulo": "Mutualismo — Homem e Mulher em Igualdade no Reino",
      "cremos": "CREMOS que homens e mulheres foram criados igualmente à imagem de Deus, com igual valor, dignidade, capacidade espiritual e vocação no Reino, e que ambos são chamados ao serviço, ao ministério e à liderança na igreja conforme os dons distribuídos pelo Espírito Santo (Gn 1.27; Gl 3.28; At 2.17-18; Rm 16.1-7; Ef 5.21).",
      "blocos": [
        "Desde o jardim, a humanidade foi criada masculina e feminina, ambos refletindo a imagem de Deus. Cristo, em sua encarnação, dignificou a mulher de modo extraordinário em uma cultura patriarcal: ensinou-as como discípulas, foi sustentado por elas, apareceu primeiro a elas após a ressurreição e enviou-as como primeiras testemunhas da vida nova (Jo 20.17-18).",
        "Em Pentecostes, o Espírito foi derramado sobre filhos e filhas, servos e servas, e todos profetizaram (At 2.17-18). No corpo apostólico, encontramos mulheres como Priscila ensinando a Apolo (At 18.26), Febe servindo como diaconisa (Rm 16.1-2), Júnia destacada entre os apóstolos (Rm 16.7) e diversas outras lideranças femininas no plantio de igrejas nas casas.",
        "Reconhecemos as diferenças biológicas e relacionais entre homens e mulheres, mas afirmamos que essas diferenças não estabelecem hierarquia espiritual nem restringem o acesso ao ministério. Em nossas igrejas nas casas, ambos podem assumir funções de liderança, inclusive no presbitério, conforme o dom recebido do Espírito. A liderança é serviço no Espírito, não privilégio baseado em gênero. O princípio governante das relações é a mútua sujeição em amor (Ef 5.21), e não a dominação de um sobre o outro."
      ],
      "aplicacaoTitulo": "Aplicação na nossa rede",
      "aplicacao": [
        "Mulheres e homens podem servir em todas as funções da igreja, inclusive no presbitério.",
        "Combatemos qualquer forma de machismo cultural ou misoginia, valorizando a voz e o ministério das mulheres como dom de Deus à igreja."
      ]
    },
    {
      "id": "s-a-disciplina-eclesiastica",
      "letra": "i",
      "titulo": "A Disciplina Eclesiástica",
      "cremos": "CREMOS que a disciplina eclesiástica, exercida em amor, paciência e firmeza, é instrumento necessário e gracioso pelo qual a igreja busca restaurar irmãos que vivem em pecado persistente, preservar a santidade da comunidade e dar testemunho da seriedade do evangelho (Mt 18.15-20; 1Co 5.1-13; Gl 6.1-2; 2Ts 3.6-15; Tt 3.10-11).",
      "blocos": [
        "Toda igreja saudável pratica disciplina, ainda que de modo discreto, todas as vezes que um irmão é exortado, corrigido ou confrontado com amor. A disciplina formal — com etapas progressivas como as de Mateus 18 — é o último recurso, reservado para situações de pecado grave e impenitente.",
        "Os objetivos da disciplina, em ordem, são sempre: (a) o arrependimento e a restauração do irmão em pecado; (b) a preservação da pureza e do testemunho do Corpo; (c) a glória de Deus diante do mundo. Nunca se trata de punição, vingança ou expulsão arbitrária. Quando há arrependimento, a igreja celebra com alegria, como o pai que recebeu o filho pródigo (Lc 15.20- 24)."
      ],
      "aplicacaoTitulo": "Aplicação na nossa rede",
      "aplicacao": [
        "Praticamos a correção fraterna em amor, antes que situações se agravem.",
        "Casos formais são conduzidos pelos presbíteros, com sigilo, prudência e sempre buscando restauração."
      ]
    },
    {
      "id": "s-a-membresia-como-pacto-comunitario",
      "letra": "j",
      "titulo": "A Membresia como Pacto Comunitário",
      "cremos": "CREMOS que a membresia formal em uma igreja local não é mera adesão administrativa, mas um pacto de aliança espiritual entre o crente e a comunidade da fé, comprometendo-os mutuamente diante de Deus e uns dos outros (Hb 10.24-25; 13.17; At 2.42-47; Ef 4.1-3,15-16).",
      "blocos": [
        "Para se tornar membro de uma das nossas igrejas nas casas, a pessoa precisa:",
        {
          "tipo": "lista",
          "ordenada": true,
          "itens": [
            "Concluir o curso Bases, em que percorrem-se os fundamentos da fé cristã e da nossa identidade como rede.",
            "Ler esta Confissão de Fé junto com os presbíteros e acolhê-la como sua, professando o evangelho expresso nas Doutrinas Primárias e a identidade prática expressa nas Doutrinas Secundárias."
          ]
        },
        "O candidato à membresia reconhece, ainda, que a vida em comunidade requer uma aliança congregacional — comprometendo-se com:",
        {
          "tipo": "lista",
          "ordenada": false,
          "itens": [
            "Viver em submissão mútua e em aliança fraterna com os demais irmãos (Ef 4.1-3; Hb 10.24-25).",
            "Participar ativamente das reuniões, ministérios e expressões da comunidade (1Co 14.26; At 2.42).",
            "Assumir a missão de fazer discípulos e servir com amor, dentro e fora da igreja (Mt 28.19-20).",
            "Caminhar em generosidade alegre, sustentando a missão do Reino e cuidando dos necessitados (At 2.44-45; 2Co 9.7).",
            "Receber o cuidado dos presbíteros e dos cinco ministérios, acolhendo correção amorosa quando necessário (Hb 13.17; 1Pe 5.1-5)."
          ]
        },
        "A membresia, portanto, é mais do que um nome em uma lista: é uma aliança pública e voluntária, na qual seguimos juntos em discipulado, comunhão e missão, prestando contas uns aos outros diante de Deus."
      ],
      "aplicacaoTitulo": null,
      "aplicacao": []
    },
    {
      "id": "s-a-familia",
      "letra": "l",
      "titulo": "A Família",
      "cremos": "CREMOS que Deus criou homem e mulher à sua imagem, e que o casamento é uma aliança vitalícia entre um homem e uma mulher, instituída por Deus como expressão privilegiada do amor entre Cristo e sua igreja, e como contexto saudável para a geração e formação de filhos (Gn 1.27; 2.18-25; Mt 19.4-6; Ef 5.21-33; Sl 127-128).",
      "blocos": [
        "Na família cristã, o princípio que governa todas as relações é a mútua sujeição em amor (Ef 5.21). Maridos amam suas esposas como Cristo amou a igreja, entregando-se por elas. Esposas e maridos cuidam um do outro com honra. Pais conduzem os filhos no caminho do Senhor com ternura e firmeza, evitando provocá-los (Ef 6.4). Filhos honram pai e mãe (Ex 20.12).",
        "O lar cristão é mais do que um espaço privado: é a unidade básica do Reino. Ali se aprende a perdoar, a servir, a falar a verdade em amor e a viver o evangelho no cotidiano. Por isso, a casa não é separada da igreja — ela é igreja em escala doméstica. Quando a casa se abre em hospitalidade aos irmãos e aos perdidos, ela se torna instrumento poderoso de discipulado e missão."
      ],
      "aplicacaoTitulo": "Aplicação na nossa rede",
      "aplicacao": [
        "Cuidamos pastoralmente de casamentos, pais, mães, filhos, solteiros, viúvos e divorciados como família estendida da fé.",
        "Promovemos a hospitalidade e o discipulado de filhos como práticas centrais da vida das nossas igrejas nas casas."
      ]
    },
    {
      "id": "s-a-generosidade-e-as-financas-do-reino",
      "letra": "m",
      "titulo": "A Generosidade e as Finanças do Reino",
      "cremos": "CREMOS que todo cristão é chamado a viver em generosidade espontânea, alegre e sacrificial, reconhecendo que tudo o que possui pertence a Deus e deve ser administrado para a glória dele e o bem do próximo (2Co 8-9; 1Co 16.1-2; At 2.44-45; 4.32-37; 1Tm 6.17-19; Ml 3.10).",
      "blocos": [
        "Rejeitamos tanto o legalismo do dízimo obrigatório quanto a leveza do indiferentismo financeiro. A Nova Aliança não nos coloca debaixo da Lei mosaica, mas sob a graça que liberta para uma generosidade muito maior do que dez por cento. Quem foi salvo pela cruz não calcula o quanto deve dar — pergunta o quanto pode entregar.",
        "As finanças da comunidade devem ser administradas com integridade, transparência e sabedoria, sustentando a missão do evangelho, apoiando obreiros, cuidando de viúvas, órfãos e necessitados, e promovendo justiça generosa onde houver dor e pobreza (Tg 1.27; Mt 25.35-36). A verdadeira prosperidade cristã não é o acúmulo, mas o uso dos recursos como instrumentos de serviço, amor e transformação.",
        "Rejeitamos veementemente toda forma de teologia da prosperidade que transforma o evangelho em técnica de enriquecimento, instrumentaliza a fé como meio de barganha com Deus ou explora financeiramente o povo de Deus. Nossa vida financeira deve refletir o evangelho da graça: livre, alegre, sacrificial e voltada para os outros."
      ],
      "aplicacaoTitulo": "Aplicação na nossa rede",
      "aplicacao": [
        "Praticamos transparência total no uso dos recursos da comunidade, prestando contas regularmente.",
        "Ensinamos os irmãos a viver com simplicidade, generosidade e administração sábia diante de Deus."
      ]
    }
  ],
  "conclusao": [
    "Esta confissão não é uma muralha que separa, mas um lar que abriga. Ao escrevê-la, não pretendemos esgotar a riqueza inesgotável do evangelho, nem definir todos os contornos da vida cristã. Pretendemos, sim, dizer com clareza no que cremos, para que cada pessoa que se aproxime da nossa Rede de Igrejas nas Casas saiba em que terreno está pisando.",
    "As doutrinas primárias nos unem à Igreja Global de Cristo de todos os tempos. As doutrinas secundárias dão à nossa rede um rosto, uma identidade, uma forma concreta de ser igreja. Nem umas nem outras valem por si mesmas: valem porque apontam para Aquele de quem, por quem e para quem são todas as coisas (Rm 11.36).",
    "Confessamos a fé não para vencer debates, mas para adorar melhor. Que cada doutrina aqui declarada se transforme, no coração de cada irmão e irmã, em adoração, missão e amor prático. E que, fiéis a essa fé recebida, vivamos juntos na expectativa do dia em que todas as coisas serão reveladas — quando o Cordeiro reunir o seu povo à sua mesa, e a história inteira encontrar nele a sua consumação eterna.",
    {
      "tipo": "citacao",
      "texto": "E o anjo me disse: Escreva — Felizes os convidados para o banquete do casamento do Cordeiro! E acrescentou: Estas são as palavras verdadeiras de Deus.",
      "ref": "Apocalipse 19.9"
    }
  ]
};
