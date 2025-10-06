import React from 'react';
import { useNavigate } from 'react-router-dom';

import '../igrejaNasCasas.css';

const RedeFiveOne: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/rede-igrejas');
  };

  return (
    <div className="casas-article">
      <div className="casas-article__container">
        <button type="button" className="casas-article__back" onClick={handleBack}>
          &larr; Voltar
        </button>
        <header className="casas-article__header">
          <span className="casas-article__tag">Rede Five One</span>
          <h1>Rede de Igrejas Five One</h1>
          <p>
            Conheça a visão que sustenta a rede e como cuidamos de pessoas, líderes e casas para que cada bairro receba o
            Evangelho de forma prática.
          </p>
        </header>
        <article className="casas-article__body">
          <section className="casas-article__section">
            <h2>A Rede de Igrejas nas Casas – Five One</h2>
            <p>
              A Rede Five One nasce da convicção de que a Igreja de Cristo é chamada a ser um corpo vivo e missionário,
              fundamentado na prática comunitária, na simplicidade do evangelho e no poder transformador do Espírito Santo.
              Diferente de modelos excessivamente centralizados e hierarquizados, essa rede se estrutura de maneira orgânica,
              tendo como base as igrejas que se reúnem em casas, como no tempo do Novo Testamento (At 2.46; Rm 16.5; Cl 4.15).
            </p>
          </section>

          <section className="casas-article__section">
            <h2>O papel dos presbíteros</h2>
            <p>
              Cada igreja na casa é liderada por presbíteros, responsáveis pelo cuidado espiritual da comunidade local. Seu
              papel é semelhante ao dos anciãos da igreja primitiva (At 14.23; Tt 1.5-9), que zelavam pela fé, acompanhavam os
              irmãos em suas necessidades e preservavam a unidade da comunidade.
            </p>
            <p>
              Os presbíteros não assumem funções isoladas, mas fazem parte de um sistema maior, no qual recebem suporte
              contínuo dos cinco ministérios. Isso garante que cada comunidade local não seja apenas um ponto de reunião, mas
              um organismo vivo, conectado ao corpo maior de Cristo.
            </p>
          </section>

          <section className="casas-article__section">
            <h2>O ministério quíntuplo</h2>
            <p>
              A Rede Five One reconhece que Cristo concedeu à igreja cinco dons ministeriais (Ef 4.11): apóstolos, profetas,
              evangelistas, pastores e mestres. Esses dons não são títulos hierárquicos, mas funções de serviço para edificação
              da Igreja. Eles funcionam como um sistema circulatório espiritual, levando vida e nutrientes para cada igreja.
            </p>
            <ul className="casas-article__list">
              <li>
                <strong>O apóstolo</strong> garante o impacto missionário, abrindo novos caminhos, plantando novas igrejas e
                mantendo a visão voltada para a expansão do Reino.
              </li>
              <li>
                <strong>O profeta</strong> assegura a fidelidade à aliança, lembrando constantemente a igreja do chamado à
                santidade, à verdade e à justiça de Deus.
              </li>
              <li>
                <strong>O evangelista</strong> promove a proclamação do evangelho, trazendo novos discípulos e mantendo a
                chama da salvação acesa em cada comunidade.
              </li>
              <li>
                <strong>O pastor</strong> gera uma comunidade reconciliada, cuidando das feridas, promovendo reconciliação e
                fortalecendo a vida fraterna.
              </li>
              <li>
                <strong>O mestre</strong> conduz à sabedoria profunda, edificando a igreja no conhecimento bíblico e na
                maturidade cristã.
              </li>
            </ul>
            <p>
              Esses cinco dons juntos formam um equilíbrio que impede que a igreja se torne unilateral. Cada ministério traz
              um aspecto essencial de Cristo para dentro do corpo, e sua interação assegura que a igreja viva em plenitude.
            </p>
          </section>

          <section className="casas-article__section">
            <h2>A rede como organismo</h2>
            <p>
              Diferente de uma organização meramente institucional, a Rede Five One se estrutura como uma rede apostólica de
              significados. Seu funcionamento não depende de estruturas rígidas, mas de relacionamentos de discipulado,
              fidelidade ao evangelho e compartilhamento de vida.
            </p>
            <ul className="casas-article__list">
              <li>As igrejas nas casas são os pontos de vida local.</li>
              <li>Os presbíteros oferecem cuidado e liderança espiritual em cada comunidade.</li>
              <li>
                Os cinco ministérios circulam entre as casas, fortalecendo, corrigindo, ensinando e consolidando a fé, como
                tendões que mantêm o corpo unido.
              </li>
            </ul>
          </section>

          <section className="casas-article__section">
            <h2>Multiplicação e missão</h2>
            <p>
              Esse modelo permite que a Rede Five One seja expansiva por natureza. Como cada igreja se reúne em casas e é
              nutrida pelos ministérios, ela se torna saudável e, consequentemente, apta a multiplicar-se. Cada casa pode
              tornar-se o ponto inicial de uma nova comunidade, e cada comunidade pode se conectar a outras, formando uma teia
              viva de discipulado e missão (At 6.7).
            </p>
          </section>

          <section className="casas-article__section">
            <h2>Unidade na diversidade</h2>
            <p>
              Um dos maiores desafios da igreja ao longo da história foi o risco de se tornar monopolizada por apenas um dom.
              A Rede Five One busca superar esse desequilíbrio, promovendo a plenitude dos cinco dons atuando em conjunto, para
              que a igreja reflita Cristo em sua totalidade.
            </p>
          </section>

          <section className="casas-article__section">
            <h2>Conclusão</h2>
            <p>
              A Rede Five One é uma expressão contemporânea do modelo bíblico de igreja: simples, missionária e relacional.
              Ela une a força das igrejas nas casas, a liderança de presbíteros e a atuação indispensável dos cinco
              ministérios. Mais do que uma instituição, é um movimento vivo, onde cada comunidade local é parte de um organismo
              maior, nutrido e sustentado por Cristo, o verdadeiro cabeça da Igreja.
            </p>
            <div className="casas-article__callout">
              Um chamado a viver o DNA apostólico da igreja primitiva, para que o povo de Deus seja formado, as cidades sejam
              impactadas e o Reino de Cristo avance até os confins da terra.
            </div>
          </section>
        </article>

        <section className="casas-cta">
          <div className="casas-cta__content">
            <h2>Faça parte da Rede de Igrejas nas Casas</h2>
            <p>
              Quer abrir sua casa? Deseja encontrar uma família espiritual perto de você? Fale com o nosso time e descubra
              como podemos caminhar juntos na missão do Reino.
            </p>
            <div className="casas-cta__actions">
              <a
                className="btn primary"
                href="https://wa.me/5583987181731?text=Quero%20participar%20da%20Rede%20Five%20One"
                target="_blank"
                rel="noopener noreferrer"
              >
                Quero participar
              </a>
              <a
                className="btn ghost"
                href="https://wa.me/5583987181731?text=Quero%20abrir%20minha%20casa%20para%20uma%20igreja"
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir minha casa
              </a>
            </div>
          </div>
          <div className="casas-cta__highlight">
            <strong>+ de 30 encontros</strong>
            <span>ao longo do ano, entre mesas, celebrações e missões.</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RedeFiveOne;
