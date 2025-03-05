import InfoCard from "../../InfoCard/InfoCard";
import "./AboutHero.css";

const infoCards = [
  {
    title: "Nossa Missão",
    content:
      "Capacitar cada cristão a descobrir e exercer seu papel único no Corpo de Cristo, desenvolvendo um ministério eficaz que fortaleça a Igreja e expanda o Reino de Deus na Terra.",
  },
  {
    title: "Nossa Visão",
    content:
      "Oferecer formação ministerial robusta, através de ensino teológico prático e bíblico, mentorias e discipulado, utilizando métodos inovadores que incentivem o crescimento espiritual e ministerial.",
  },
  {
    title: "Nosso Propósito",
    content:
      "Capacitar e equipar os cristãos para que cresçam em maturidade espiritual, firmes na verdade e no amor de Cristo. Nosso objetivo é ajudar cada pessoa a desenvolver plenamente o seu Dom e cumprir seu papel no Corpo de Cristo, contribuindo para que a Igreja seja ajustada, unida e edificada em amor, conforme cada membro realiza sua função, de acordo com a liderança de Cristo, que é a cabeça.",
  },
];

const AboutHero = () => {
  return (
    <section className="about-section">
      <div className="content-container">
        <h1>Quem Somos</h1>
        <div className="info-cards">
          {infoCards.map((card, index) => (
            <InfoCard key={index} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
