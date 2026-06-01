import { useEffect } from "react";
import { Link } from "react-router-dom";
import TrainingFormats from "../components/TrainingFormats";
import courseCover from "../assets/images/capa_curso_apologetica.jpg";

type UpcomingCourse = {
  title: string;
  description: string;
  category: string;
};

const upcoming: UpcomingCourse[] = [
  {
    title: "Hermenêutica Bíblica",
    description:
      "Como interpretar a Bíblia corretamente — contexto, gênero literário e princípios sólidos de interpretação.",
    category: "Estudo Bíblico",
  },
  {
    title: "Cristologia",
    description:
      "A pessoa e a obra de Cristo do Antigo ao Novo Testamento. Quem é Jesus, o que ele fez e o que isso significa.",
    category: "Teologia",
  },
  {
    title: "Vida Devocional",
    description:
      "Princípios práticos para uma vida de oração, jejum e meditação na Palavra que sustenta o ministério.",
    category: "Espiritualidade",
  },
];

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

const BookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const ChurchIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 2v6" />
    <path d="M9 5h6" />
    <path d="M12 8l6 4v10H6V12l6-4z" />
    <path d="M10 22v-4a2 2 0 0 1 4 0v4" />
  </svg>
);

const Cursos = () => {
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
    <div className="bg-navy text-slate-light min-h-screen">
      {/* ──────────────────────────────────── Hero da página ─── */}
      <section className="relative pt-8 sm:pt-10 pb-10 lg:pb-14 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-mint/[0.06] blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-4">
            Cursos e Treinamentos
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-white tracking-tight leading-[1.1]">
            Conhecimento bíblico que <span className="text-mint">transforma</span>
            <br className="hidden sm:block" /> você e a sua igreja
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate max-w-2xl mx-auto leading-relaxed">
            Cursos online sob demanda para a sua jornada e treinamentos dos 5
            Ministérios para a sua comunidade. Fundamento teológico, linguagem
            clara e aplicação prática.
          </p>
        </div>

        {/* ───────────── Resumo do que oferecemos (cursos + treinamentos) ─── */}
        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 mt-10 lg:mt-12">
          <div className="grid sm:grid-cols-2 gap-4 lg:gap-5">
            <a
              href="#cursos"
              className="group relative flex flex-col p-6 lg:p-7 rounded-2xl bg-navy-light/60 border border-slate/10 hover:border-mint/40 hover:bg-navy-light transition-all duration-200"
            >
              <span className="inline-flex w-11 h-11 items-center justify-center rounded-xl bg-mint/10 border border-mint/30 text-mint mb-4">
                <BookIcon />
              </span>
              <span className="text-2xs uppercase tracking-wider text-slate font-semibold mb-1">
                Para você
              </span>
              <h2 className="text-xl font-bold text-slate-white mb-2">
                Cursos online
              </h2>
              <p className="text-sm text-slate leading-relaxed grow">
                Estude no seu ritmo, 100% online, com certificado. Comece pelo
                Curso de Apologética — e novos cursos a caminho.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mint">
                Ver cursos
                <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M10 3a1 1 0 011 1v9.586l3.293-3.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L9 13.586V4a1 1 0 011-1z" />
                </svg>
              </span>
            </a>

            <a
              href="#formatos-treinamento"
              className="group relative flex flex-col p-6 lg:p-7 rounded-2xl bg-navy-light/60 border border-slate/10 hover:border-mint/40 hover:bg-navy-light transition-all duration-200"
            >
              <span className="inline-flex w-11 h-11 items-center justify-center rounded-xl bg-mint/10 border border-mint/30 text-mint mb-4">
                <ChurchIcon />
              </span>
              <span className="text-2xs uppercase tracking-wider text-slate font-semibold mb-1">
                Para sua igreja
              </span>
              <h2 className="text-xl font-bold text-slate-white mb-2">
                Treinamentos para igrejas
              </h2>
              <p className="text-sm text-slate leading-relaxed grow">
                Leve os 5 Ministérios para a sua igreja — palestras,
                treinamento de liderança, mentoria e imersão ministerial.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mint">
                Ver treinamentos
                <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M10 3a1 1 0 011 1v9.586l3.293-3.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L9 13.586V4a1 1 0 011-1z" />
                </svg>
              </span>
            </a>
          </div>
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
            <div className="pointer-events-none absolute -top-32 -right-32 w-[400px] h-[400px] bg-mint/10 blur-[100px] rounded-full" />

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
                  Curso de Apologética
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
                    <p className="text-3xl sm:text-4xl font-bold text-mint tabular-nums">
                      R$ 59,90
                    </p>
                  </div>
                  <Link
                    to="/cursos/apologetica"
                    className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-mint text-navy font-semibold rounded-xl shadow-mint hover:shadow-mint-strong hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    Saber mais
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                    </svg>
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
          <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-golden/10 border border-golden/30 text-golden text-xs font-medium uppercase tracking-wider mb-4">
              Em breve
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-white tracking-tight">
              Próximos cursos no catálogo
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate">
              Estamos preparando novos conteúdos para fortalecer ainda mais sua
              jornada bíblica.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {upcoming.map((c) => (
              <div
                key={c.title}
                className="relative bg-navy-light/60 border border-slate/10 rounded-2xl p-6 backdrop-blur-sm hover:border-slate/20 transition-colors"
              >
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
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────── Treinamentos B2B ─── */}
      <TrainingFormats />

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
