import "./ConhecaMais.css";

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
  return (
    <section className="conheca-mais">
      <div className="content-container">
        <h2>Conheça Mais Sobre os 5 Ministérios</h2>
        <div className="ministerio-cards">
          {ministerios.map((ministerio, index) => (
            <div key={index} className="ministerio-card">
              <h3>{ministerio.title}</h3>
              <p>{ministerio.description}</p>
              <button className="saiba-mais">Saiba Mais</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ConhecaMais;
