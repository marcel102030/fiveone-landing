import React from 'react';
// import testemunho1 from '../assets/images/testemunho1.jpg';
// import testemunho2 from '../assets/images/testemunho2.jpg';
// import testemunho3 from '../assets/images/testemunho3.jpg';
// import imagemTopo from '../assets/images/Comunhão de pessoas lendo a biblia.jpg';
// import imagemTopo from '../assets/images/Comunhão de pessoas lendo a biblia2.jpg';
// import imagemTopo from '../assets/images/Comunhão de pessoas lendo a biblia3.jpg';
import imagemTopo from '../assets/images/Comunhão de pessoas lendo a biblia4.jpg';
// import encontro1 from '../assets/images/encontro1.jpg';
// import encontro2 from '../assets/images/encontro2.jpg';
// import encontro3 from '../assets/images/encontro3.jpg';
// import encontro4 from '../assets/images/encontro4.jpg';
import './igrejaNasCasas.css';

const IgrejaNasCasas: React.FC = () => {
  // Lista de igrejas, estados e cidades
  const igrejas = [
    {
      cidade: "Campina Grande",
      estado: "PB",
      nome: "Igreja Casas Catolé",
      endereco: "Catolé, Campina Grande - PB",
      linkMaps: "https://www.google.com/maps/place/Igreja+Casas+Catolé/@-7.2371273,-35.9068963,17z",
      linkMapsEmbed: "https://www.google.com/maps/d/embed?mid=1wd8qIMzPhFLIkd7rjLhV9dK6WZ7fwc4"
    },
  ];

  const [estadoSelecionado, setEstadoSelecionado] = React.useState('PB');
  const [cidadeSelecionada, setCidadeSelecionada] = React.useState('Campina Grande');

  const cidadesDisponiveis = [...new Set(igrejas
    .filter(igreja => !estadoSelecionado || igreja.estado === estadoSelecionado)
    .map(igreja => igreja.cidade))];

  const igrejasFiltradas = igrejas.filter(igreja =>
    (!estadoSelecionado || igreja.estado === estadoSelecionado) &&
    (!cidadeSelecionada || igreja.cidade === cidadeSelecionada));

  const mapaLink = cidadeSelecionada
    ? igrejasFiltradas[0]?.linkMapsEmbed
    : "https://www.google.com/maps/d/embed?mid=1wd8qIMzPhFLIkd7rjLhV9dK6WZ7fwc4";

  return (
    <div className="igreja-container">
      <header className="igreja-header">
        <img src={imagemTopo} alt="Comunhão de pessoas lendo a Bíblia" className="igreja-imagem-topo" />
        <h1>Rede de Igrejas nas Casas</h1>
        <p>Uma rede missionária de igrejas nas casas, fundamentada em Cristo e alinhada aos cinco dons ministeriais.</p>
      </header>

      <section className="igreja-section manifesto-bloco">
        <h2>O que acreditamos (Visão)</h2>
        <p>
          Cremos que a Igreja de Jesus Cristo é uma comunidade viva de discípulos que se reúnem sob a liderança do Espírito Santo para manifestar o Reino de Deus em todos os lugares.
          A Igreja não é um prédio, nem uma instituição, mas um corpo orgânico de pessoas redimidas, chamadas para viverem em comunhão, discipulado e missão.
        </p>
        <ul>
          <li>Cristo como o cabeça da Igreja (Colossenses 1:18);</li>
          <li>O sacerdócio de todos os santos (1 Pedro 2:9);</li>
          <li>Os dons ministeriais como expressão da plenitude de Cristo (Efésios 4:11-13);</li>
          <li>As casas como lugares de comunhão, ensino, partilha e missão (Romanos 16:3-5);</li>
          <li>A simplicidade como força, e não fraqueza — menos púlpitos, mais mesas.</li>
        </ul>
        <blockquote>
          “O novo movimento de igrejas precisa de menos púlpitos e mais mesas, menos plateias e mais comunidades.”<br />
          <strong>– Wolfgang Simson</strong>
        </blockquote>
      </section>

      <section className="igreja-section manifesto-bloco">
        <h2>Onde estamos hoje (Missão)</h2>
        <p>
          Estamos iniciando com uma única igreja reunida em uma casa. Esse é o ponto de partida de muitos movimentos que transformaram nações.
          Embora simples, essa igreja já contém em si o DNA da multiplicação: uma comunidade de fé, comunhão, discipulado e missão.
        </p>
        <p>
        Inspirados por autores como Frank Viola, estamos em um tempo de redescoberta do que é ser Igreja: uma fé que se vive em comunidade, com simplicidade, participação e relacionamento autêntico. Estamos nos movendo de estruturas formais para encontros vivos — onde Cristo está presente e cada pessoa tem espaço para servir e crescer.
        </p>
      </section>

      <section className="igreja-section manifesto-bloco">
        <h2>Para onde estamos indo (Proposito)</h2>
        <p>
          Estamos caminhando rumo à multiplicação de comunidades simples, cheias do Espírito, fundadas em casas,
          enraizadas no amor e focadas na missão. Cada casa uma mesa de comunhão. Cada discípulo é um sacerdote.
          Cada reunião é uma expressão do Corpo de Cristo.
        </p>
        <p>Queremos ver:</p>
        <ul>
          <li>Discípulos que fazem discípulos (2 Timóteo 2:2);</li>
          <li>Casas se tornando centros de glória e avivamento, como escreve Jeremiah Johnson;</li>
          <li>Uma rede relacional e apostólica, e não uma instituição centralizada;</li>
          <li>Cada cristão vivendo seu dom ministerial com ousadia (Efésios 4:7-16);</li>
          <li>Uma Igreja que não cresce como uma pirâmide, buscando altura e centralização, mas como uma videira, que se espalha de casa em casa. Quando há crescimento numérico, não construímos prédios — multiplicamos a vida e abrimos novas casas de glória.</li>
        </ul>
        <blockquote>
          A igreja não está morrendo. Ela está se movendo. De volta às casas. <br />
          <strong>– Alan Hirsch</strong>
        </blockquote>
      </section>

      <section className="igreja-section manifesto-bloco">
        <h2>Somos várias igrejas conectadas</h2>
        <p>
        As Escrituras estabelecem uma expressão da igreja que transcende culturas, regimes e épocas — uma comunidade moldada para resistir ao tempo e perseverar até o fim. Trata-se de uma estrutura simples, viva e fiel à vontade de Deus, capaz de florescer em qualquer lugar, sob qualquer circunstância, até a volta de Cristo:
        </p>
        <ul>
          <li>
            <strong>Presbitério e Liderança Distribuída</strong><br />
            Em cada Casa da rede, há um presbítero local disponível, comprometido com o cuidado, a escuta e a edificação da comunidade. A liderança é descentralizada e relacional, surgindo de dentro do povo. Não se trata de um único líder à frente, mas de uma rede viva, sustentada por presbíteros em cada lar e pelos cinco ministérios em movimento, edificando o corpo de Cristo em unidade.
          </li>
          <li>
            <strong>Descentralizada do "Lugar Santo" e do Sacerdote Exclusivo</strong><br />
            A vida da igreja não se resume a um local específico nem a um grupo seleto de líderes. Não existe mais um “lugar sagrado” nem uma “casta sacerdotal”. Em Cristo, todos os santos foram feitos sacerdotes (1Pe 2:5,9), chamados a participar ativamente da comunhão, do ensino, da oração e da missão. A presença de Deus se manifesta em qualquer lugar onde Cristo é proclamado, a Bíblia é reconhecida como a Palavra de Deus, e o Espírito Santo tem liberdade para conduzir.
          </li>
          <li>
            <strong>Comunidades de Discipulado Diversas e Locais</strong><br />
            A reunião geográfica nos conduz à diversidade real. Vivemos juntos, como uma família espiritual, com pessoas de diferentes idades, origens sociais, culturas, etnias, estágios de vida e níveis de maturidade na fé. Não nos reunimos apenas por afinidade, mas também por aliança. O discipulado acontece no encontro com o outro — no lugar onde Deus nos planta.
          </li>
        </ul>
      </section>

      <section className="igreja-section">
        <h2>Como Funciona</h2>
        <ul>
          <li>Reuniões semanais nos lares, com ensino bíblico, louvor, oração, discipulado e partilha de vida</li>
          <li>Presbíteros em cada casa assumem uma função paterna e maternal, cuidando de perto dos membros como um pai ou mãe cuida dos filhos. Com sabedoria reconhecida e maturidade aprovada por Deus, eles acompanham a vida da igreja local de forma relacional e contínua.</li>
          <li>Formação por meio dos cinco ministérios (apóstolos, profetas, evangelistas, pastores e mestres), que servem como um sistema circulatório espiritual para manter a saúde da igreja</li>
          <li>Liderança plural que promove unidade, crescimento e fidelidade ao modelo de Cristo</li>
          <li>Multiplicação natural, com igrejas que se reproduzem organicamente pela ação do Espírito Santo</li>
        </ul>
      </section>

      <section className="igreja-section">
        <h2>Participe da Rede</h2>
        <div className="igreja-buttons">
          <button className="igreja-btn">Quero participar de uma igreja nas Casas</button>
          <button className="igreja-btn">Quero abrir minha casa e liderar uma igreja nas casas.</button>
        </div>
      </section>

      <section className="igreja-section">
        <h2>Por que Igrejas nas Casas?</h2>
        <p>
        Nos inspiramos no Novo Testamento, onde a Igreja primitiva se reunia em casas, como vemos claramente nas cartas de Paulo e no relato de Atos 2:42-47. Ali, os discípulos perseveravam na doutrina dos apóstolos, na comunhão, no partir do pão e nas orações. Acreditamos que esse modelo simples, relacional e centrado em Cristo não é apenas bíblico, mas também atual e estratégico. Em um mundo cada vez mais hostil ao evangelho, as igrejas nos lares oferecem uma estrutura resiliente e fiel à missão — com ou sem prédios religiosos, com ou sem liberdade institucional. Assim, a Igreja volta para as casas: onde a fé é provada, a vida é compartilhada e o evangelho é vivido no cotidiano.
        </p>
        <blockquote>
          Quando cristãos de todos os segmentos sociais e culturais, de todas as situações de vida e denominações sentirem em seu espírito um eco nítido daquilo que o Espírito de Deus diz hoje à igreja, eles começarão a funcionar claramente como um corpo, a ouvir globalmente e agir localmente. Deixarão de pedir que Deus abençoe o que fazem e começarão a fazer o que Deus abençoa. Na própria vizinhança se congregarão em igrejas nos lares e se encontrarão para cultos festivos que abrangem a cidade ou região toda.<br />
          Você também está convidado a aderir a esse movimento aberto e dar a sua própria contribuição. Dessa maneira provavelmente também a sua casa há de ser uma casa que transforma o mundo.<br />
          <strong>– Wolfgang Simson</strong>
        </blockquote>
      </section>

      <section className="igreja-section">
        <h2>Encontre uma Igreja Próxima</h2>
        <p>Confira no mapa onde há uma igreja da nossa rede mais perto de você:</p>
        {/* Filtros e cards de igrejas */}
        <div className="igreja-filtros">
          <select value={estadoSelecionado} onChange={e => {
            setEstadoSelecionado(e.target.value);
            setCidadeSelecionada('');
          }}>
            <option value="">Selecione um estado</option>
            <option value="PB">Paraíba</option>
            <option value="PE">Pernambuco</option>
          </select>

          <select value={cidadeSelecionada} onChange={e => setCidadeSelecionada(e.target.value)} disabled={!estadoSelecionado}>
            <option value="">Selecione uma cidade</option>
            {cidadesDisponiveis.map(cidade => (
              <option key={cidade} value={cidade}>{cidade}</option>
            ))}
          </select>
        </div>
        <div className="igreja-mapa-container">
          <iframe
            title="Mapa de Igrejas nas Casas"
            src={mapaLink}
            width="100%"
            height="480"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </section>

      {/* <section className="igreja-section encontros-bloco">
        <h2>Veja como são os nossos encontros</h2>
        <div className="encontros-grid">
          <div
            className="encontro-card"
            style={{
              backgroundImage: `url(${encontro1})`,
            }}
          >
            <h3></h3>
          </div>
          <div
            className="encontro-card"
            style={{
              backgroundImage: `url(${encontro2})`,
            }}
          >
            <h3>Louvor e Comunhão</h3>
          </div>
          <div
            className="encontro-card"
            style={{
              backgroundImage: `url(${encontro3})`,
            }}
          >
            <h3>Palavra e Partilha</h3>
          </div>
          <div
            className="encontro-card"
            style={{
              backgroundImage: `url(${encontro4})`,
            }}
          >
            <h3></h3>
          </div>
        </div>
      </section> */}

      {/* <section className="igreja-section testemunhos-bloco">
        <h2>Histórias de Vida</h2>
        <div className="testemunhos-grid">
          <div className="testemunho-card" style={{ backgroundImage: `url(${testemunho1})` }}>
            <span className="testemunho-tag">HISTÓRIA</span>
            <h3>A história da Suenia</h3>
            <p>“Jesus restaurou meu lar e minha identidade. Hoje nossa casa é uma extensão do Reino.”<br />– Suenia</p>
          </div>
          <div className="testemunho-card" style={{ backgroundImage: `url(${testemunho2})` }}>
            <span className="testemunho-tag">HISTÓRIA</span>
            <h3>A história do Marcelo</h3>
            <p>“Eu achava que igreja era um lugar. Agora entendi que é gente, mesa e missão.”<br />– Marcelo</p>
          </div>
          <div className="testemunho-card" style={{ backgroundImage: `url(${testemunho3})` }}>
            <span className="testemunho-tag">HISTÓRIA</span>
            <h3>A história da Lidia</h3>
            <p>“Fui acolhida como família. Pela primeira vez, me senti parte de algo vivo.”<br />– Lidia</p>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default IgrejaNasCasas;