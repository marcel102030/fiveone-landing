import "./ConhecaMais.css";
import { useNavigate } from "react-router-dom";

interface MinisterioCard {
  title: string;
  description: string;
}

const ministerios: MinisterioCard[] = [
  {
    title: "Apóstolo",
    description:
      "Conheça o papel do Apóstolo na edificação da igreja e na liderança espiritual",
  },
  {
    title: "Profeta",
    description:
      "Descubra a importância do ministério profético na revelação e exortação divina",
  },
  {
    title: "Evangelista",
    description:
      "Explore como o Evangelista leva o evangelho aos que estão longe de Cristo",
  },
  {
    title: "Pastor",
    description:
      "Compreenda o ministério pastoral na orientação e cuidado da comunidade",
  },
  {
    title: "Mestre",
    description: "Aprenda sobre o papel do Mestre em ensinar e edificar a fé",
  },
];

const ConhecaMais = () => {
  const navigate = useNavigate();
  return (
    <section className="conheca-mais">
      <div className="content-container">
        <h2>Conheça Mais Sobre os 5 Ministérios</h2>
        <div className="ministerio-cards">
          {ministerios.map((ministerio, index) => (
            <div key={index} className="ministerio-card">
              <h3>{ministerio.title}</h3>
              <p>{ministerio.description}</p>
              <button
                className="saiba-mais"
                onClick={() => navigate(`/ministerios/${ministerio.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()}`)}
              >
                Saiba Mais
              </button>
            </div>
          ))}
        </div>
        <h3 className="quiz-card-title">Pronto para descobrir seu dom?</h3>
        <div className="quiz-card" onClick={() => navigate("/teste-dons")}>
          <img
            src="/src/assets/images/icons/apostolo.png"
            alt="Ícone representando o teste de dons"
            className="quiz-card-icon"
            draggable="false"
          />
          <p className="quiz-card-text">Descubra o seu Chamado - Teste Dons Ministeriais</p>
        </div>
      </div>
    </section>
  );
};

export default ConhecaMais;
