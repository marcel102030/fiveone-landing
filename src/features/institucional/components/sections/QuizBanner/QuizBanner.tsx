import { Link } from "react-router-dom";
import testeImg from "../../../assets/images/Teste5Ministerios.png";


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
        <div className="relative border border-mint/20 rounded-3xl overflow-hidden">
          {/* Imagem domina o bloco inteiro */}
          <img
            src={testeImg}
            alt="Teste dos 5 Ministérios"
            className="w-full h-auto object-cover block"
            draggable={false}
          />
          {/* Gradiente sutil só na base — não apaga a imagem */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />

          {/* CTA sobreposto na base */}
          <div className="absolute bottom-5 left-6 sm:bottom-7 sm:left-8">
            <Link
              to="/descubra-seu-dom"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-mint text-navy font-semibold rounded-xl shadow-mint hover:shadow-mint-strong hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm sm:text-base"
            >
              Começar o teste agora
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuizBanner;
