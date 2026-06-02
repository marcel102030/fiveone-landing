import { Link } from "react-router-dom";
import testeImg from "../../../assets/images/Teste5Ministerios.png";

const ClockIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const GiftIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

const QuizBanner = () => {
  return (
    <section
      className="relative py-20 lg:py-28 overflow-hidden"
      aria-labelledby="quiz-banner-heading"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy" />

      {/* Decorative glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[1100px] h-[400px] bg-mint/[0.06] blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-navy-light/90 to-navy/80 backdrop-blur-sm border border-mint/20 rounded-3xl p-8 sm:p-10 lg:p-14 overflow-hidden">
          {/* Decorative circles internal */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-mint/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-mint/5 blur-3xl" />

          <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-12 items-center">
            {/* Texto */}
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint/15 border border-mint/40 text-mint text-2xs sm:text-xs font-semibold uppercase tracking-wider mb-4">
                <GiftIcon /> Teste grátis
              </span>

              <h2
                id="quiz-banner-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-white tracking-tight leading-[1.1]"
              >
                Descubra qual é o seu{" "}
                <span className="text-mint">dom ministerial</span>
              </h2>

              <p className="mt-4 text-base sm:text-lg text-slate leading-relaxed max-w-xl mx-auto lg:mx-0">
                Responda 20 perguntas e descubra qual dos 5 ministérios bíblicos
                (Apóstolo, Profeta, Evangelista, Pastor ou Mestre) está mais
                presente na sua vida.
              </p>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 justify-center lg:justify-start text-xs sm:text-sm text-slate">
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon /> Leva ~5 minutos
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <GiftIcon /> 100% gratuito
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="17 11 19 13 23 9" />
                  </svg>
                  Receba o resultado por email
                </span>
              </div>

              <div className="mt-8">
                <Link
                  to="/descubra-seu-dom"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-mint text-navy font-semibold rounded-xl shadow-mint hover:shadow-mint-strong hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Começar o teste agora
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Visual — imagem Teste dos 5 Ministérios */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.4)] border border-mint/15">
                <img
                  src={testeImg}
                  alt="Teste dos 5 Ministérios"
                  className="w-full h-auto object-cover"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/30 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuizBanner;
