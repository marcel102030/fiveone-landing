import { Link } from "react-router-dom";

type Step = {
  number: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaTo?: string;
  icon: React.ReactNode;
};

const CompassIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const steps: Step[] = [
  {
    number: "01",
    title: "Faça o teste dos 5 ministérios",
    description:
      "Em ~5 minutos, descubra qual dos cinco dons bíblicos está mais presente na sua vida — Apóstolo, Profeta, Evangelista, Pastor ou Mestre.",
    ctaLabel: "Começar o teste",
    ctaTo: "/descubra-seu-dom",
    icon: <CompassIcon />,
  },
  {
    number: "02",
    title: "Receba seu resultado",
    description:
      "Enviamos um relatório completo por e-mail explicando o seu dom, suas características e os primeiros passos para desenvolvê-lo.",
    icon: <MailIcon />,
  },
  {
    number: "03",
    title: "Aprofunde-se em um curso",
    description:
      "Escolha um dos nossos cursos para se aprofundar nas Escrituras. Comece pelo curso de Apologética — base sólida para defender a sua fé.",
    ctaLabel: "Ver cursos",
    ctaTo: "/cursos",
    icon: <BookIcon />,
  },
];

const HowItWorks = () => {
  return (
    <section
      className="relative bg-navy py-20 lg:py-28 overflow-hidden"
      aria-labelledby="how-it-works-heading"
    >
      {/* Orbs decorativos */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 right-0 w-[650px] h-[450px] rounded-full bg-mint/[0.08] blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] rounded-full bg-blue-500/[0.07] blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="max-w-2xl mx-auto text-center mb-12 lg:mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-4">
            Como funciona
          </span>
          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-white tracking-tight"
          >
            Sua jornada no Five One em <span className="text-mint">3 passos</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate">
            Do autoconhecimento ao aprofundamento bíblico — um caminho simples e
            prático para crescer na fé.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid md:grid-cols-3 gap-6 lg:gap-8">
          {/* Linha conectora (desktop) */}
          <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-mint/30 to-transparent" />

          {steps.map((step) => (
            <div key={step.number} className="relative">
              {/* Number indicator no topo */}
              <div className="relative z-10 flex items-center justify-center w-24 h-24 mx-auto mb-5 bg-navy-light border border-mint/30 rounded-full text-mint shadow-mint">
                {step.icon}
              </div>

              <div className="relative bg-navy-light/60 border border-slate/10 rounded-2xl p-6 lg:p-7 backdrop-blur-sm hover:border-mint/30 transition-colors duration-300 text-center">
                <p className="text-mint text-sm font-bold tracking-wider mb-2">
                  PASSO {step.number}
                </p>
                <h3 className="text-xl lg:text-2xl font-bold text-slate-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-slate leading-relaxed mb-5">
                  {step.description}
                </p>
                {step.ctaLabel && step.ctaTo && (
                  <Link
                    to={step.ctaTo}
                    className="inline-flex items-center gap-1.5 text-sm text-mint font-semibold hover:gap-2.5 transition-all min-h-[44px] py-2 -my-2"
                  >
                    {step.ctaLabel}
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
