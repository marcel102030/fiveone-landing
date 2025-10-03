import React from 'react';
import { useNavigate } from 'react-router-dom';

import '../igrejaNasCasas.css';

const ComoFunciona: React.FC = () => {
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
          <h1>Como funcionam as Igrejas nas Casas?</h1>
          <p>
            A Rede Five One nasce na mesa. Descubra como cada encontro nas casas cria ambientes seguros para discipular,
            enviar e servir a cidade com o Evangelho.
          </p>
        </header>
        <article className="casas-article__body">
          <section className="casas-article__section">
            <h2>O que são</h2>
            <p>
              Igreja no lar é vida comunitária de cristãos conduzida por força sobrenatural em casas bem normais. É o estilo
              de vida redimido, vivido na situação concreta. É o caminho orgânico pelo qual os cristãos seguem a Jesus
              conjuntamente no cotidiano.
            </p>
            <p>
              Pelo fato de não mais pertencerem a si próprios, os redimidos adotam consistentemente um estilo de vida
              comunitário. Já não vivem num mundo particular e individualista. Igrejas nos lares nascem quando os cristãos
              entendem que não podem mais conduzir sua própria vida, mas, juntos com outros, começam a colocar em prática os
              valores do Reino de Deus, compartilhando a vida com cristãos e pessoas ainda não cristãs em seu redor.
            </p>
            <p>
              Trata-se de uma concretização consequente de reconhecimento de que não existem caminhos para experimentar Jesus
              Cristo e seu Espírito apenas em recintos sagrados, mas, sim, no meio da vida. Nesse sentido, o local é
              indiferente, salvo o leito de morte do egoísmo – e, por consequência, o local de nascimento da comunidade
              eclesial.
            </p>
            <div className="casas-article__callout">
              A verdadeira comunhão começa onde termina o individualismo. Como diz Arthur Katz: “Quando estamos reunidos é que
              estamos em casa!”.
            </div>
            <p>
              Em muitos sentidos, uma igreja no lar constitui uma família extensa espiritual, na qual se partilha a vida de
              modo espontâneo e orgânico. A vida cotidiana dessas igrejas não requer mais organização, burocracia e cerimônias
              do que as famílias extensas comuns.
            </p>
            <p>
              Igrejas nos lares são uma criação de Deus, um caminho de vida sobrenatural para realizar coisas que uma família
              normal não seria capaz de fazer. Um dos mistérios extraordinários está na estrutura multiplicativa inerente, com
              o ministério quíntuplo como sistema circulatório, estimulando o corpo todo a crescer e a multiplicar-se.
            </p>
          </section>

          <section className="casas-article__section">
            <h2>Como são</h2>
            <p>
              Igrejas nos lares espelham as qualidades e o caráter de Deus. O estilo de vida comunitário é marcado por amor,
              verdade, perdão, fé e graça; um caminho ideal para demonstrações de cuidado mútuo, encorajamento e serviço.
            </p>
            <p>
              É um espaço em que todas as máscaras podem ser removidas, em que as pessoas são francas umas com as outras e,
              apesar disso, continuam se amando. É onde experimentam e praticam pessoalmente a verdade e o perdão de Deus no
              dia a dia.
            </p>
          </section>

          <section className="casas-article__section">
            <h2>O que fazem</h2>
            <p>
              Em um mundo que busca modelos prontos, preferimos discernir com o Espírito como viver a igreja no lar em nosso
              contexto. Transferir fórmulas prontas produz estruturas vazias; por isso, revisitamos os princípios fundamentais
              dados por Deus para encarná-los novamente em nossa cultura.
            </p>
            <p>
              Dons apostólicos e proféticos têm papel crucial nesse processo, ajudando a desbravar caminhos saudáveis de
              igreja em cada realidade. Ao longo da história e hoje, vemos quatro elementos básicos sustentando essa jornada,
              formando o arcabouço das igrejas nos lares em todos os tempos.
            </p>
          </section>

          <section className="casas-article__section">
            <h2>Como funciona a liderança</h2>
            <p>
              ① <strong>Presbíteros.</strong> Igrejas nos lares estão sob a responsabilidade de presbíteros que exercem papel
              paternal e maternal sobre a comunidade. A maturidade comprovada por Deus e a sabedoria vivida fazem deles
              referências claras do estilo de vida do Reino. Cuidam do rebanho como uma família, assegurando autenticidade,
              seriedade e exemplo prático para cada discípulo.
            </p>
            <p>
              ② <strong>O ministério quíntuplo.</strong> Esses presbíteros são formados e treinados por pessoas vocacionadas a um
              dos cinco ministérios – apóstolos, profetas, evangelistas, pastores e mestres. Eles percorrem casa em casa,
              funcionando como um sistema circulatório espiritual que abastece a rede com os nutrientes necessários para se
              manter saudável e se multiplicar. Fortalecem a coesão do corpo, como tendões que mantêm um organismo unido.
            </p>
            <p>
              Por meio desses ministérios, as igrejas nos lares operam de forma orgânica, servindo todo o corpo de Cristo em uma
              região e conectando-se a outras cidades e nações. São recursos contínuos de formação que mantêm a igreja viva,
              em expansão e alinhada à voz de Deus.
            </p>
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

export default ComoFunciona;
