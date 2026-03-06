import "./Values.css";

const values = [
  {
    title: "Bíblia como a Palavra de Deus",
    content:
      "Acreditamos que as Escrituras Sagradas são a revelação reguladora e inspirada de Deus, a autoridade em nossa fé e prática, servindo como base para todas as nossas ações e doutrinas.",
  },
  {
    title: "Cristo como Centro",
    content:
      "Cremos que Jesus Cristo é o fundamento de toda a nossa fé e o centro de tudo o que fazemos. Ele é a pedra angular sobre a qual a Igreja é edificada, e todas as nossas atividades e ensinamentos apontam para Ele.",
  },
  {
    title: "Espírito Santo como Guia",
    content:
      "Reconhecemos o papel vital do Espírito Santo em guiar, capacitar e transformar cada crente. Ele é quem distribui os dons espirituais e ministeriais, e através dele somos guiados em nossa jornada de fé e ministério.",
  },
  {
    title: "Igreja como Corpo",
    content:
      "Entendemos a Igreja como o Corpo vivo de Cristo, onde cada membro tem um papel único e vital. Valorizamos a unidade na diversidade e buscamos fortalecer a Igreja através do desenvolvimento dos dons de cada pessoa.",
  },
];

const Values = () => {
  return (
    <section className="values-section">
      <div className="content-container">
        <h2>Nossos Valores</h2>
        <p className="values-subtitle">(Nossos Pilares de Fé)</p>
        <div className="values-grid">
          {values.map((value, index) => (
            <div key={index} className="value-card">
              <h3>{value.title}</h3>
              <p>{value.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Values;
