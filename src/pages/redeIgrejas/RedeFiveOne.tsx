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
          <p>
            A Rede Five One surgiu da convicção de que a igreja pode ser simples e profunda ao mesmo tempo. Mantemos a
            centralidade de Cristo, a mesa como lugar de restauração e a missão como estilo de vida. Nosso time pastoral
            acompanha anfitriões, líderes de casas e cada pessoa que chega, ajudando a alinhar cultura, ritmo e valores.
          </p>
          <p>
            Trabalhamos com mentoria contínua, encontros de alinhamento e materiais personalizados. Os cinco dons
            ministeriais são ativados para formar equipes saudáveis: apóstolos pavimentam o caminho, profetas guardam a
            direção, evangelistas alcançam novos lares, pastores cuidam das pessoas e mestres fundamentam na Palavra.
          </p>
          <p>
            Também promovemos mesas apostólicas e retiros para renovar visão e unidade. Tudo é feito em parceria com as
            casas, reconhecendo que cada família local expressa a mesma identidade da rede, mas com a personalidade da sua
            comunidade.
          </p>
          <div className="casas-article__callout">
            Nossa missão é acompanhar cada casa com proximidade, gerar pertencimento e enviar discípulos que também plantem
            novas expressões do Reino.
          </div>
        </article>
      </div>
    </div>
  );
};

export default RedeFiveOne;
