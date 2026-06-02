import { Link } from "react-router-dom";
import logoUrl from "../../../../../assets/images/logo-fiveone-white.png";
import apostoloIcon from "../../../../../assets/images/icons/apostolo.png";
import profetaIcon from "../../../../../assets/images/icons/profeta.png";
import evangelistaIcon from "../../../../../assets/images/icons/evangelista.png";
import pastorIcon from "../../../../../assets/images/icons/pastor.png";
import mestreIcon from "../../../../../assets/images/icons/mestre.png";

interface HeroProps {
  onScrollClick?: () => void;
}

const ministries = [
  { name: "Apóstolo", icon: apostoloIcon },
  { name: "Profeta", icon: profetaIcon },
  { name: "Evangelista", icon: evangelistaIcon },
  { name: "Pastor", icon: pastorIcon },
  { name: "Mestre", icon: mestreIcon },
];

const scrollToCourses = () => {
  const el = document.getElementById("cursos");
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  } else {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  }
};

const Hero = ({ onScrollClick }: HeroProps) => {
  const handleScroll = onScrollClick ?? scrollToCourses;

  return (
    <section
      id="logo"
      className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center overflow-hidden bg-navy text-slate-white"
    >
      {/* Background — gradients radiais sutis */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] rounded-full bg-mint/[0.06] blur-[120px]" />
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full bg-mint/[0.03] blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] rounded-full bg-golden/[0.025] blur-[120px]" />
      </div>

      {/* Grid de pontos sutil */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'radial-gradient(circle, #64ffda 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

      {/* Ícones dos 5 ministérios nas laterais — só desktop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden hidden lg:block">
        <img src={apostoloIcon}    alt="" className="absolute top-[12%]   left-[2.5%]  w-20 opacity-[0.08] grayscale" />
        <img src={evangelistaIcon} alt="" className="absolute top-[48%]   left-[1.5%]  w-16 opacity-[0.06] grayscale" />
        <img src={mestreIcon}      alt="" className="absolute bottom-[14%] left-[3%]   w-14 opacity-[0.07] grayscale" />
        <img src={profetaIcon}     alt="" className="absolute top-[18%]   right-[2.5%] w-18 opacity-[0.08] grayscale" />
        <img src={pastorIcon}      alt="" className="absolute bottom-[22%] right-[1.5%] w-16 opacity-[0.06] grayscale" />
      </div>

      <div className="relative w-full max-w-5xl mx-auto px-6 lg:px-8 pt-8 pb-4 text-center flex-1 flex flex-col items-center justify-center">
        {/* Logo Five One em destaque */}
        <div className="flex justify-center mb-3 lg:mb-4 animate-fade-in-up">
          <img
            src={logoUrl}
            alt="Five One"
            className="w-full max-w-[170px] sm:max-w-[200px] lg:max-w-[220px] h-auto"
            style={{ filter: "drop-shadow(0 0 40px rgba(100, 255, 218, 0.15))" }}
            draggable={false}
          />
        </div>

        {/* Linha decorativa com ícones dos 5 ministérios */}
        <div
          className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8 mb-5 lg:mb-6 animate-fade-in-up opacity-0"
          style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
        >
          {ministries.map((m) => (
            <div
              key={m.name}
              className="flex flex-col items-center gap-1 group"
              title={m.name}
            >
              <img
                src={m.icon}
                alt={m.name}
                className="w-5 h-5 sm:w-6 sm:h-6 opacity-55 group-hover:opacity-100 transition-opacity duration-300"
                style={{ filter: "brightness(0) invert(1)" }}
                draggable={false}
              />
              <span className="text-[10px] sm:text-2xs text-slate/60 group-hover:text-slate-light transition-colors duration-300 font-medium tracking-wider uppercase">
                {m.name}
              </span>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] animate-fade-in-up opacity-0"
          style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
        >
          Descubra e cresça no <br className="hidden sm:block" />
          seu <span className="text-mint">chamado ministerial</span>
        </h1>

        {/* Parágrafo institucional */}
        <p
          className="mt-3 text-sm sm:text-base text-slate max-w-2xl mx-auto leading-relaxed animate-fade-in-up opacity-0"
          style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
        >
          O Five One é um movimento voltado a quem deseja viver com profundidade o
          chamado de Deus. Oferecemos{" "}
          <span className="text-slate-light font-medium">cursos bíblicos</span>,{" "}
          <span className="text-slate-light font-medium">treinamentos para igrejas</span> e o{" "}
          <span className="text-slate-light font-medium">Teste dos 5 Ministérios</span> para
          você dar o próximo passo na sua jornada.
        </p>

        {/* CTAs */}
        <div
          className="mt-5 flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up opacity-0"
          style={{ animationDelay: "400ms", animationFillMode: "forwards" }}
        >
          <button
            onClick={handleScroll}
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-mint text-navy font-semibold rounded-xl shadow-mint hover:shadow-mint-strong hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Conheça o que oferecemos
            <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </button>
          <Link
            to="/descubra-seu-dom"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-mint/40 text-mint font-semibold rounded-xl hover:bg-mint/10 hover:border-mint/60 transition-all duration-200"
          >
            Faça o teste dos dons
          </Link>
        </div>

      </div>

      {/* Scroll indicator — rodapé do hero, garante caber dentro de h-screen */}
      <button
        onClick={handleScroll}
        aria-label="Descer para ver mais"
        className="relative z-10 hidden sm:flex flex-col items-center gap-1.5 pb-6 text-slate/50 hover:text-mint transition-colors duration-300"
      >
        <span className="text-[10px] uppercase tracking-widest">Role para descobrir</span>
        <svg
          className="w-4 h-4 animate-bounce"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 5v14" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      </button>
    </section>
  );
};

export default Hero;
