import pastorIcon from "../../../assets/images/icons/pastor.png";
import mestreIcon from "../../../assets/images/icons/mestre.png";
import profetaIcon from "../../../assets/images/icons/profeta.png";
import apostoloIcon from "../../../assets/images/icons/apostolo.png";
import evangelistaIcon from "../../../assets/images/icons/evangelista.png";

import "./TrilhaMinisterial.css";

interface TrilhaCard {
  icon: string;
  title: string;
  description: string;
  alt: string;
  link: string;
}

const trilhas: TrilhaCard[] = [
  {
    icon: apostoloIcon,
    title: "APÓSTOLO",
    description:
      "Nesta trilha exploraremos o apostólico. Das raízes teológicas ao chamado individual.",
    alt: "Apóstolo",
    link: "https://escolafiveone.hotmart.host/formacao-de-mestre-five-one-df44d8cd-3a6b-44b0-aaec-652290fc529a",
  },
  {
    icon: profetaIcon,
    title: "PROFETA",
    description:
      "Nesta trilha exploraremos o profético. Das raízes teológicas ao chamado individual.",
    alt: "Profeta",
    link: "https://escolafiveone.hotmart.host/formacao-de-mestre-five-one-df44d8cd-3a6b-44b0-aaec-652290fc529a",
  },
  {
    icon: evangelistaIcon,
    title: "EVANGELISTA",
    description:
      "Nesta trilha exploraremos o evangelístico. Das raízes teológicas ao chamado individual.",
    alt: "Evangelista",
    link: "https://escolafiveone.hotmart.host/formacao-de-mestre-five-one-df44d8cd-3a6b-44b0-aaec-652290fc529a",
  },
  {
    icon: pastorIcon,
    title: "PASTOR",
    description:
      "Nesta trilha exploraremos o pastoral. Das raízes teológicas ao chamado individual.",
    alt: "Pastor",
    link: "https://escolafiveone.hotmart.host/formacao-de-mestre-five-one-df44d8cd-3a6b-44b0-aaec-652290fc529a",
  },
  {
    icon: mestreIcon,
    title: "MESTRE",
    description:
      "Nesta trilha exploraremos o ensino. Das raízes teológicas ao chamado individual.",
    alt: "Mestre",
    link: "https://escolafiveone.hotmart.host/formacao-de-mestre-five-one-df44d8cd-3a6b-44b0-aaec-652290fc529a",
  },
];

const TrilhaMinisterial = () => {
  return (
    <section className="trilha-ministerial" id="trilha">
      <div className="content-container">
        <h2>ESCOLHA A SUA TRILHA MINISTERIAL</h2>
        <div className="trilha-cards">
          {trilhas.map((trilha, index) => (
            <a
              key={index}
              className="trilha-card"
              href={trilha.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="card-icon">
                <img src={trilha.icon} alt={trilha.alt} />
              </div>
              <h3>{trilha.title}</h3>
              <p>{trilha.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrilhaMinisterial;
