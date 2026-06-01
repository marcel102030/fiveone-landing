import { Link } from "react-router-dom";

const FinalCTA = () => {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy" />

      {/* Decorative glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-mint/[0.08] blur-[150px] rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-5">
          Pronto para começar?
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-white tracking-tight leading-[1.1]">
          Sua jornada na Palavra <br className="hidden sm:block" />
          começa <span className="text-mint">hoje</span>
        </h2>

        <p className="mt-5 text-base sm:text-lg lg:text-xl text-slate max-w-2xl mx-auto leading-relaxed">
          Aprofunde sua fé com conteúdo bíblico de qualidade. Comece pelo teste
          gratuito ou já entre direto no curso de Apologética.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            to="/cursos/apologetica"
            className="group inline-flex items-center justify-center gap-2 px-7 py-4 bg-mint text-navy font-semibold rounded-xl shadow-mint hover:shadow-mint-strong hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Quero o curso de Apologética
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
            </svg>
          </Link>
          <Link
            to="/descubra-seu-dom"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-transparent border border-mint/40 text-mint font-semibold rounded-xl hover:bg-mint/10 hover:border-mint/60 transition-all duration-200"
          >
            Fazer o teste grátis
          </Link>
        </div>

        <p className="mt-7 text-xs sm:text-sm text-slate/80">
          R$ 59,90 · pagamento único · acesso por 1 ano · certificado incluído
        </p>
      </div>
    </section>
  );
};

export default FinalCTA;
