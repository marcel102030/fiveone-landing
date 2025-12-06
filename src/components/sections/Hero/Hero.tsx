import pastorIcon from "../../../assets/images/icons/pastor.png";
import mestreIcon from "../../../assets/images/icons/mestre.png";
import profetaIcon from "../../../assets/images/icons/profeta.png";
import logoUrl from "../../../assets/images/logo-fiveone-white.png";
import apostoloIcon from "../../../assets/images/icons/apostolo.png";
import evangelistaIcon from "../../../assets/images/icons/evangelista.png";

import "./Hero.css";

interface HeroProps {
  onScrollClick: () => void;
}

const icons = [
  apostoloIcon,
  profetaIcon,
  evangelistaIcon,
  pastorIcon,
  mestreIcon,
];

const IconColumn = ({
  icons,
  className,
}: {
  icons: string[];
  className: string;
}) => (
  <div className={`icon-column ${className}`}>
    <div className="icon-scroll">
      {icons.map((icon, index) => (
        <img
          key={`${className}-1-${index}`}
          src={icon}
          alt=""
          className="floating-icon"
          draggable="false"
        />
      ))}
    </div>
    <div className="icon-scroll">
      {icons.map((icon, index) => (
        <img
          key={`${className}-2-${index}`}
          src={icon}
          alt=""
          className="floating-icon"
          draggable="false"
        />
      ))}
    </div>
  </div>
);

const Hero = ({ onScrollClick }: HeroProps) => {
  return (
    <section className="hero" id="logo">
      <IconColumn icons={icons} className="left" />

      <div className="content-container">
        <img
          src={logoUrl}
          alt="Five One Logo"
          className="hero-logo"
          draggable="false"
        />
        <h1 className="hero-title">Bem-vindo ao Five One</h1>
        <div className="hero-button-wrapper">
          <button className="hero-main-button" onClick={onScrollClick}>
            CLIQUE AQUI E CONHEÇA NOSSAS TRILHAS MINISTERIAIS
          </button>
        </div>
      </div>

      <IconColumn icons={[...icons].reverse()} className="right" />
    </section>
  );
};

export default Hero;
