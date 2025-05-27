import { useParams } from "react-router-dom";
import escolaFiveOne from "../assets/images/escola-fiveone.jpeg";
import "./Ministerio.css";

const ministeriosDetalhes: Record<string, { titulo: string; conteudo: string; preocupacoes?: string; metricas?: string; contribuicao?: string; sombras?: string; historicos?: string; disfuncional?: string }> = {
  apostolo: {
    titulo: "Apóstolo",
    conteudo: `O apóstolo é um dom de governo, fundação e envio. É alguém que estabelece a igreja em novos lugares, planta e fortalece comunidades cristãs e ajuda a alinhar o corpo de Cristo ao propósito de Deus. O apóstolo funciona como um arquiteto espiritual, cuidando da estrutura, saúde e expansão da missão da igreja. Geralmente carrega uma visão clara, espírito pioneiro e capacidade de formar líderes.`,
    preocupacoes: "Isso nos ajudará a aumentar nossa capacidade de missão?",
    metricas: "Extensão saudável e sistemática do cristianismo dentro e além das fronteiras culturais. Multiplicação do reino.",
    contribuicao: "Assegurar a consistência com as ideias centrais. Estabelecer novas bases e projetar sistemas em torno da mobilização e extensão.",
    sombras: "Dominância: focado na tarefa, exigente e insensível aos outros. Os A's de imaturidade podem sucumbir ao controle e isso pode levar ao esgotamento pessoal e corporativo.",
    historicos: "Jesus, Pedro, Paulo, São Patrício, Joana D'Arc, John Wesley, Aimee Semple McPherson.",
    disfuncional: "Se um líder apostólico dominar, a igreja ou outra organização tenderá a ser obstinada, autocrática, com muita pressão para mudança e desenvolvimento, e deixará muitas pessoas feridas em seu rastro. Não é sustentável e tende a se dissolver com o tempo."
  },
  profeta: {
    titulo: "Profeta",
    conteudo: `O profeta é o dom que traz sensibilidade espiritual, discernimento e direção profética para a igreja. Ele fala em nome de Deus, confronta injustiças, chama o povo ao arrependimento e revela o coração de Deus. O ministério profético não é apenas sobre previsões, mas sobre percepção espiritual e fidelidade à aliança. Ele é essencial para manter a igreja sensível ao Espírito e alinhada à Palavra.`,
    preocupacoes: "Isso nos ajudará a incorporar as preocupações de Deus?",
    metricas: "Fidelidade aos valores de Deus por meio de ações visíveis e tangíveis e consciência do caráter e da presença de Deus.",
    contribuicao: "Ancorando o movimento nos valores de Deus e fornecendo feedback crítico para realinhamento constante.",
    sombras: "Desrespeitoso: Apaixonado pode se tornar ideológico e exigente. O foco na verdade pode se tornar míope e simplista. Uma chamada à convicção pode se tornar crítica e condenatória.",
    historicos: "Jesus, Jeremias, São Bento, Martinho Lutero, Santa Teresa de Ávila, Ida B. Robinson, Dietrich Bonhoeffer.",
    disfuncional: "Se os líderes proféticos dominarem, a organização será unidimensional (sempre voltando a uma ou duas questões), provavelmente será facciosa e sectária, terá uma vibração 'superespiritual' ou, paradoxalmente, tenderá a ser ou muito ativista para ser sustentável ou muito quietista para ser útil. Esta não é uma forma viável de organização."
  },
  evangelista: {
    titulo: "Evangelista",
    conteudo: `O evangelista é aquele que carrega o desejo de anunciar as boas novas da salvação. Ele motiva a igreja a sair das quatro paredes, compartilha o evangelho com paixão e atrai pessoas para Jesus. O evangelista também treina outros para evangelizar e muitas vezes atua em lugares onde o evangelho ainda não foi anunciado. É o dom do alcance, da colheita e da expansão.`,
    preocupacoes: "Isso nos ajudará a alcançar pessoas que ainda não conhecem Jesus?",
    metricas: "Número de conversões e novos contatos com o evangelho. Número de pessoas envolvidas na evangelização.",
    contribuicao: "Expandindo o movimento, adicionando novas pessoas e conectando a mensagem com o mundo externo.",
    sombras: "Manipulador: Pode comprometer a mensagem para ser mais palatável. Pode ser visto como superficial. Pode se concentrar em números e não em qualidade de discípulos.",
    historicos: "Jesus, Filipe, Francisco de Assis, George Whitefield, Billy Graham, Nicky Cruz, Reinhard Bonnke.",
    disfuncional: "Se os evangelistas lideram isoladamente, a igreja pode se tornar rasa, orientada para eventos, com foco excessivo em crescimento numérico sem discipulado verdadeiro. O movimento se dilui."
  },
  pastor: {
    titulo: "Pastor",
    conteudo: `O pastor é o dom que cuida das pessoas. Ele apascenta, consola, orienta e protege o rebanho. Sua principal função é promover comunhão, cura emocional, reconciliação e maturidade espiritual. O pastor cria ambientes seguros e relacionamentos saudáveis. Ele acompanha a caminhada das pessoas com empatia e amor constante. É o dom da comunidade e do cuidado.`,
    preocupacoes: "Isso ajudará a cuidar bem das pessoas envolvidas?",
    metricas: "Qualidade da comunidade e profundidade relacional. Cuidado mútuo, resolução de conflitos, maturidade nos relacionamentos.",
    contribuicao: "Estabelecendo um ambiente de cuidado, amor, segurança e unidade no corpo de Cristo.",
    sombras: "Permissivo: Pode evitar confrontos difíceis. Pode resistir à mudança. Pode ser excessivamente protetor e controlar a comunidade.",
    historicos: "Jesus, Barnabé, Gregório Magno, Richard Baxter, Corrie ten Boom, Henri Nouwen.",
    disfuncional: "Se os pastores dominam, a igreja pode se tornar um clube fechado, resistente a mudanças e excessivamente focada nas necessidades internas, negligenciando a missão externa."
  },
  mestre: {
    titulo: "Mestre",
    conteudo: `O mestre é o dom da instrução e da formação bíblica. Ele ensina com profundidade, ajuda as pessoas a entenderem a Palavra de Deus e aplicá-la em suas vidas. O mestre preserva a doutrina, combate heresias e treina novos discípulos. É responsável por estabelecer a igreja na verdade, equipar o corpo com sabedoria e promover o crescimento por meio do ensino sólido.`,
    preocupacoes: "Isso ajudará a promover sabedoria e verdade no meio do povo de Deus?",
    metricas: "Profundidade do ensino, crescimento no conhecimento bíblico, habilidade de viver com base na Palavra de Deus.",
    contribuicao: "Estabelecendo a igreja na verdade e sabedoria. Evitando desvios doutrinários e formando discípulos sólidos.",
    sombras: "Orgulhoso: Pode ser dogmático, argumentativo e desconectado da realidade prática. Pode valorizar conhecimento acima do amor.",
    historicos: "Jesus, Esdras, Agostinho, Calvino, C. S. Lewis, John Stott, Elizabeth Elliot.",
    disfuncional: "Se os mestres dominam, a igreja pode se tornar excessivamente intelectual, fria, centrada em debates e resistente ao mover do Espírito. Pode perder a simplicidade da fé prática."
  },
};

const Ministerio = () => {
  const { nome } = useParams<{ nome: string }>();
  const detalhes = ministeriosDetalhes[nome?.toLowerCase() || ""];

  return (
    <div className="ministerio-page">
      {detalhes ? (
        <>
          <h1>{detalhes.titulo}</h1>
          <p>{detalhes.conteudo}</p>
          {detalhes.preocupacoes && (
            <div className="detalhe-box">
              <h2>Preocupações Prioritárias</h2>
              <p>{detalhes.preocupacoes}</p>
            </div>
          )}
          {detalhes.metricas && (
            <div className="detalhe-box">
              <h2>Métricas para o Sucesso</h2>
              <p>{detalhes.metricas}</p>
            </div>
          )}
          {detalhes.contribuicao && (
            <div className="detalhe-box">
              <h2>Como Contribui para a Saúde do Movimento</h2>
              <p>{detalhes.contribuicao}</p>
            </div>
          )}
          {detalhes.sombras && (
            <div className="detalhe-box">
              <h2>Pontos Cegos e Sombras</h2>
              <p>{detalhes.sombras}</p>
            </div>
          )}
          {detalhes.historicos && (
            <div className="detalhe-box">
              <h2>Exemplos Históricos</h2>
              <p>{detalhes.historicos}</p>
            </div>
          )}
          {detalhes.disfuncional && (
            <div className="detalhe-box">
              <h2>5 Ministérios Disfuncional</h2>
              <p>{detalhes.disfuncional}</p>
            </div>
          )}
        </>
      ) : (
        <p>Ministério não encontrado.</p>
      )}
      <section className="promo-escola-section">
        <div className="promo-escola-image">
          <img src={escolaFiveOne} alt="Escola Five One" />
        </div>
        <div className="promo-escola-content">
          <h3>Descubra a Escola Five One</h3>
          <p>
            Viva sua verdadeira identidade em Cristo. Descubra seu chamado, desenvolva seu dom
            ministerial e conecte-se com uma comunidade de aprendizado e propósito.
          </p>
          <a href="https://alunos.escolafiveone.com" target="_blank" rel="noopener noreferrer">
            Quero Fazer Parte
          </a>
        </div>
      </section>
      <section className="estrutura-academica-section">
        <h2 className="estrutura-titulo">O que você encontrará na Escola Five One</h2>
        <div className="estrutura-itens">
          <div className="estrutura-item">
            <span className="estrutura-icone">🎥</span>
            <p>Aulas em vídeo de até 25 minutos</p>
          </div>
          <div className="estrutura-item">
            <span className="estrutura-icone">👨‍🏫</span>
            <p>Professores com experiência ministerial</p>
          </div>
          <div className="estrutura-item">
            <span className="estrutura-icone">🧑‍🤝‍🧑</span>
            <p>Comunidade de apoio e grupos ativos</p>
          </div>
          <div className="estrutura-item">
            <span className="estrutura-icone">📚</span>
            <p>Mentoria e discipulado contínuo</p>
          </div>
          <div className="estrutura-item">
            <span className="estrutura-icone">📅</span>
            <p>Encontros ao vivo semanais e conteúdo novo toda segunda</p>
          </div>
        </div>
      </section>
      <section className="beneficios-escola-section">
        <h2 className="beneficios-titulo">Tudo o que a Escola Five One oferece</h2>
        <div className="beneficio-item">
          <h3>1. Descubra seu Dom</h3>
          <p>A Escola ajuda você a identificar e exercer seu chamado ministerial (Apóstolo, Profeta, Evangelista, Pastor ou Mestre).</p>
        </div>
        <div className="beneficio-item">
          <h3>2. Formação Teológica Completa</h3>
          <p>Oferecemos uma base sólida em Apologética, história da igreja e interpretação bíblica, garantindo preparo completo para o ministério.</p>
        </div>
        <div className="beneficio-item">
          <h3>3. Professores Especializados</h3>
          <p>Você aprende com ministros experientes que oferecem uma formação rica e aplicada.</p>
        </div>
        <div className="beneficio-item">
          <h3>4. Plataforma Acessível</h3>
          <p>Aulas em estilo Netflix, com acesso prático de qualquer lugar e materiais disponíveis para aprofundamento.</p>
        </div>
        <div className="beneficio-item">
          <h3>5. Aulas Gravadas e ao Vivo</h3>
          <p>Encontros semanais ao vivo e novas aulas gravadas toda segunda-feira, com duração de até 25 minutos.</p>
        </div>
        <div className="beneficio-item">
          <h3>6. Comunidade e Mentoria</h3>
          <p>Participe de grupos de apoio, tire dúvidas e cresça junto com outros alunos em uma jornada compartilhada.</p>
        </div>
        <div className="beneficio-item">
          <h3>7. Grupos no Discord e WhatsApp</h3>
          <p>Interaja, compartilhe experiências e receba suporte direto em nossa comunidade online.</p>
        </div>
      </section>
    </div>
  );
};

export default Ministerio;