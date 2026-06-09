import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import courseCover from "../assets/images/capa_curso_apologetica.jpg";
import imgProximosCursos from "../assets/images/ProximosCursos.png";
import imgNossosCursos from "../assets/images/NossosCursos.png";
import apostoloIcon from "../../../assets/images/icons/apostolo.png";
import profetaIcon  from "../../../assets/images/icons/profeta.png";
import evangelistaIcon from "../../../assets/images/icons/evangelista.png";
import pastorIcon from "../../../assets/images/icons/pastor.png";
import mestreIcon from "../../../assets/images/icons/mestre.png";
import { UPCOMING_COURSES as upcoming, APOLOGETICA_LAUNCHED, APOLOGETICA_LAUNCH_DATE } from "../data/courses";

function useDaysLeft() {
  const calc = () => Math.max(0, Math.ceil((APOLOGETICA_LAUNCH_DATE.getTime() - Date.now()) / 86400000));
  const [days, setDays] = useState(calc);
  useEffect(() => { const id = setInterval(() => setDays(calc()), 60000); return () => clearInterval(id); }, []); // eslint-disable-line
  return days;
}

const CheckIcon = () => (
  <svg className="w-4 h-4 text-mint shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const AwardIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

// BookIcon removido — card Cursos online agora usa imagem de capa

// ChurchIcon removido — card de treinamentos agora usa imagem de capa

const Cursos = () => {
  const daysLeft = useDaysLeft();
  useEffect(() => {
    document.title = "Cursos e Treinamentos | Five One";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Cursos bíblicos online e treinamentos dos 5 Ministérios para igrejas. Fundamento teológico, linguagem clara e aplicação prática — para você e para a sua comunidade."
      );
    }
  }, []);

  return (
    <div className="bg-navy text-slate-light min-h-screen relative overflow-hidden">
      {/* Decorações globais da página — ícones dos ministérios nas laterais */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden hidden lg:block">
        <img src={apostoloIcon}    alt="" className="absolute top-[5%]    left-[1.5%] w-16 opacity-[0.07] grayscale" />
        <img src={evangelistaIcon} alt="" className="absolute top-[30%]   left-[1%]   w-14 opacity-[0.05] grayscale" />
        <img src={mestreIcon}      alt="" className="absolute top-[60%]   left-[2%]   w-14 opacity-[0.06] grayscale" />
        <img src={profetaIcon}     alt="" className="absolute top-[12%]   right-[1.5%] w-16 opacity-[0.07] grayscale" />
        <img src={pastorIcon}      alt="" className="absolute top-[50%]   right-[1%]   w-14 opacity-[0.05] grayscale" />
        <img src={evangelistaIcon} alt="" className="absolute bottom-[8%] right-[2%]   w-12 opacity-[0.06] grayscale" />
      </div>
      {/* Grid de pontos sutil */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: 'radial-gradient(circle, #64ffda 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

      {/* ──────────────────────────────────── Hero da página ─── */}
      <section className="relative pt-8 sm:pt-10 pb-10 lg:pb-14 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-mint/[0.06] blur-[120px] rounded-full" />
          <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-golden/[0.06] blur-[80px] rounded-full" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 lg:px-8">
          <img
            src={imgNossosCursos}
            alt="Cursos e Treinamentos Five One — conhecimento bíblico que transforma você e a sua igreja"
            className="w-full h-auto rounded-2xl lg:rounded-3xl border border-slate/10 shadow-card-hover"
            loading="eager"
            draggable={false}
          />
        </div>

      </section>

      {/* ───────────────────────────── Card destaque Apologética ─── */}
      <section id="cursos" className="pt-6 pb-14 lg:pb-16 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mb-8 lg:mb-10">
            <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-3">
              Cursos online
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-white tracking-tight">
              Estude no seu ritmo, com profundidade
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate leading-relaxed">
              Conteúdo 100% online, com certificado e acesso por 1 ano a partir
              da sua compra.
            </p>
          </div>

          <article className="relative bg-gradient-to-br from-navy-light to-navy border border-mint/20 rounded-3xl overflow-hidden shadow-card-hover">
            <div className="pointer-events-none absolute -top-32 -right-32 w-[400px] h-[400px] bg-mint/10 blur-[80px] rounded-full" />

            <div className="relative grid lg:grid-cols-5 gap-0">
              {/* Capa — preenche a coluna inteira (flush), nítida, sem borda vazia. */}
              <div className="lg:col-span-2 relative overflow-hidden bg-navy aspect-square lg:aspect-auto">
                <img
                  src={courseCover}
                  alt="Curso de Apologética"
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              </div>

              {/* Conteúdo */}
              <div className="lg:col-span-3 p-6 sm:p-8 lg:p-10 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-navy text-xs font-bold uppercase tracking-wider">
                    Lançamento
                  </span>
                  <span className="text-xs text-slate">Introdução à Apologética Cristã · 20 aulas</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-white mb-3">
                  Defenda a sua Fé
                </h2>

                <p className="text-sm sm:text-base text-mint font-medium mb-2">
                  Fundamentos para defender a fé com inteligência e respeito
                </p>

                <p className="text-sm sm:text-base text-slate leading-relaxed mb-5">
                  Aprenda a defender a sua fé com solidez bíblica e racional.
                  Conteúdo profundo, linguagem clara e exemplos do dia a dia para
                  conversas reais com céticos, irmãos com dúvidas e a sua própria
                  caminhada.
                </p>

                <ul className="space-y-2.5 mb-6">
                  <li className="flex items-start gap-2.5 text-sm text-slate-light">
                    <CheckIcon />
                    <span>20 aulas em vídeo (~8h20 de conteúdo)</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-light">
                    <CheckIcon />
                    <span>Materiais complementares em PDF</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-light">
                    <CheckIcon />
                    <span>Certificado ao concluir o curso</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-light">
                    <CheckIcon />
                    <span>Acesso por 1 ano a partir da compra</span>
                  </li>
                </ul>

                <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6 pb-6 border-b border-slate/10">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate">
                    <ClockIcon /> ~8h20 de conteúdo
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate">
                    <PlayIcon /> 20 aulas · 4 módulos
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate">
                    <GlobeIcon /> 100% online
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate">
                    <AwardIcon /> Certificado
                  </span>
                </div>

                <div className="mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-2xs text-slate uppercase tracking-wider">Pagamento único</p>
                    <p className="text-3xl sm:text-4xl font-bold text-mint tabular-nums">R$ 59,90</p>
                    {!APOLOGETICA_LAUNCHED && (
                      <p className="text-2xs text-slate/70 mt-0.5">
                        ⏱ Lança em <span className="text-mint font-semibold">{daysLeft} dias</span>
                      </p>
                    )}
                  </div>
                  <Link
                    to="/cursos/apologetica"
                    className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-mint text-navy font-semibold rounded-xl shadow-mint hover:shadow-mint-strong hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    {APOLOGETICA_LAUNCHED ? "Saber mais" : "Saiba mais"}
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden><path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" /></svg>
                  </Link>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ──────────────────────────────────── Próximos cursos ─── */}
      <section className="py-16 lg:py-20 bg-navy-light/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Banner visual da seção */}
          <div className="relative rounded-2xl overflow-hidden mb-10 lg:mb-12 max-w-4xl mx-auto">
            <img src={imgProximosCursos} alt="Próximos Cursos Five One" className="w-full h-48 sm:h-56 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/30 to-transparent flex flex-col justify-end p-6 sm:p-8">
              <span className="inline-block self-start px-3 py-1 rounded-full bg-golden/20 border border-golden/40 text-golden text-xs font-medium uppercase tracking-wider mb-3">
                Em breve
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Próximos cursos no catálogo
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-light/80">
                Estamos preparando novos conteúdos para fortalecer ainda mais sua jornada bíblica.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {upcoming.map((c) => (
              <div
                key={c.title}
                className="relative bg-navy-light/60 border border-slate/10 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-slate/20 transition-colors"
              >
                {/* Área de capa 1200×630 — aspect-ratio 40/21 ≈ 1200/630 */}
                {c.coverUrl ? (
                  <img
                    src={c.coverUrl}
                    alt={c.title}
                    className="w-full aspect-[40/21] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[40/21] bg-gradient-to-br from-navy-light via-navy to-navy-light flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-mint/5 to-golden/5" />
                    <span className="relative text-slate/30 text-xs font-medium tracking-widest uppercase">Imagem 1200×630 em breve</span>
                  </div>
                )}
                {/* Conteúdo */}
                <div className="p-6">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate/10 border border-slate/20 text-slate text-2xs font-medium uppercase tracking-wider mb-3">
                    {c.category}
                  </span>
                  <h3 className="text-lg lg:text-xl font-semibold text-slate-light mb-2">
                    {c.title}
                  </h3>
                  <p className="text-sm text-slate leading-relaxed">{c.description}</p>
                  <div className="mt-4 pt-4 border-t border-slate/10">
                    <span className="inline-flex items-center gap-1.5 text-2xs text-golden uppercase tracking-wider font-semibold">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Em produção
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────── CTA final ─── */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-mint/[0.08] blur-[150px] rounded-full" />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-white tracking-tight">
            Não sabe por onde <span className="text-mint">começar?</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate max-w-xl mx-auto">
            Faça o Teste dos 5 Ministérios — gratuito, leva ~5 minutos e ajuda
            você a entender qual o seu chamado antes de escolher um curso.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/descubra-seu-dom"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-mint text-navy font-semibold rounded-xl shadow-mint hover:shadow-mint-strong hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Fazer o teste grátis
            </Link>
            <Link
              to="/contato"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-transparent border border-mint/40 text-mint font-semibold rounded-xl hover:bg-mint/10 hover:border-mint/60 transition-all duration-200"
            >
              Falar com a Five One
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Cursos;
