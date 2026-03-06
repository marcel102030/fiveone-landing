import React from 'react';
import { useNavigate } from 'react-router-dom';

import '../igrejaNasCasas.css';

const OQueEFiveOne: React.FC = () => {
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
          <h1>O que é o Five One</h1>
          <p>
            Entenda o coração apostólico da Five One e como despertamos discípulos para viver, ensinar e multiplicar o Reino
            em todos os lugares.
          </p>
        </header>
        <article className="casas-article__body">
          <p>
            Five One é uma cultura, não apenas um nome. Somos inspirados por Efésios 4:11 e acreditamos que os cinco dons
            ministeriais continuam ativos hoje para edificar a igreja. Trabalhamos para despertar e integrar esses dons no
            dia a dia das casas, das equipes e de toda a rede.
          </p>
          <p>
            Nosso processo envolve formação intencional, acompanhamento pastoral e experiências práticas de serviço. Cada
            pessoa é convidada a descobrir sua vocação em Cristo e a colocá-la em movimento na comunidade. Queremos
            remover a separação entre “chamados” e “membros”, pois todos são capacitados pelo Espírito para servir.
          </p>
          <p>
            A Five One também desenvolve conteúdos, encontros regionais e iniciativas sociais para impactar cidades. A mesa
            abre portas, o discipulado gera maturidade e o envio mantém a chama missionária acesa. Assim, fortalecemos a
            unidade do corpo de Cristo enquanto multiplicamos igrejas nas casas.
          </p>
          <div className="casas-article__callout">
            Nosso compromisso é formar discípulos maduros que manifestem Jesus com criatividade, coragem e amor em cada
            contexto da sociedade.
          </div>
        </article>
      </div>
    </div>
  );
};

export default OQueEFiveOne;
