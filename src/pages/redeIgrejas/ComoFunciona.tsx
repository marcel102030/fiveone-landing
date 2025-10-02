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
          <p>
            Nas casas, a igreja volta a ter o ritmo das relações. Cada reunião começa com a mesa posta, acolhendo toda a
            família ao redor de oração, Palavra e partilha. Os encontros são leves, mas intencionais: abrimos a Bíblia,
            conversamos sobre como aplicar os ensinamentos no cotidiano e reservamos tempo para ouvir as histórias uns dos
            outros.
          </p>
          <p>
            Depois da partilha, servimos uns aos outros com os dons espirituais. Há espaço para encorajamento profético,
            ensino prático, cuidado pastoral e envio missionário. As crianças e adolescentes participam desse movimento,
            aprendendo desde cedo a caminhar em comunidade. Tudo acontece na simplicidade, mas com excelência, porque cada
            lar é tratado como um altar dedicado a Cristo.
          </p>
          <p>
            O formato das casas favorece o discipulado contínuo: acompanhamos pessoas de perto, caminhamos em grupos
            menores e celebramos cada passo de crescimento. Quando uma casa amadurece, multiplicamos para novos lares,
            levando a cultura da mesa a outros bairros.
          </p>
          <div className="casas-article__callout">
            A proposta é simples: viver a fé no dia a dia, quebrar a distância entre igreja e cidade e formar discípulos que
            reproduzam o amor de Jesus em todos os ambientes.
          </div>
        </article>
      </div>
    </div>
  );
};

export default ComoFunciona;
