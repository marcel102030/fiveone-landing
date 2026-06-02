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
        <div className="relative border border-mint/20 rounded-3xl overflow-hidden min-h-[340px] sm:min-h-[380px] lg:min-h-[420px]">
          {/* Imagem de fundo preenchendo o bloco inteiro */}
          <img
            src={testeImg}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center"
            draggable={false}
          />
          {/* Overlay gradiente para legibilidade do texto */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/80 to-navy/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />

          {/* Conteúdo sobreposto */}
          <div className="relative p-8 sm:p-10 lg:p-14 flex flex-col justify-center h-full">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint/15 border border-mint/40 text-mint text-2xs sm:text-xs font-semibold uppercase tracking-wider mb-4">
                <GiftIcon /> Teste grátis
              </span>

              <h2
                id="quiz-banner-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.1]"
              >
                Descubra qual é o seu{" "}
                <span className="text-mint">dom ministerial</span>
              </h2>

              <p className="mt-4 text-base sm:text-lg text-slate-light/90 leading-relaxed">
                Responda 20 perguntas e descubra qual dos 5 ministérios bíblicos
                (Apóstolo, Profeta, Evangelista, Pastor ou Mestre) está mais
                presente na sua vida.
              </p>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-light/70">
                <span className="inline-flex items-center gap-1.5"><ClockIcon /> Leva ~5 minutos</span>
                <span className="inline-flex items-center gap-1.5"><GiftIcon /> 100% gratuito</span>
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuizBanner;
