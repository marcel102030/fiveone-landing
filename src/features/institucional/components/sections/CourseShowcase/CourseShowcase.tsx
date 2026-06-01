import { Link } from "react-router-dom";
import courseCover from "../../../assets/images/capa_curso_apologetica.jpg";
import { UPCOMING_COURSES, APOLOGETICA_LAUNCHED } from "../../../data/courses";

type FeaturedCourse = {
  slug: string;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  highlights: string[];
  duration: string;
  lessons: string;
  format: string;
  priceLabel: string;
  ctaLabel: string;
  cover: string;
};

const featured: FeaturedCourse = {
  slug: "apologetica",
  title: "Apologética",
  badge: "Lançamento",
  tagline: "Introdução à Apologética Cristã · 20 aulas",
  description:
    "Aprenda a defender a fé com solidez bíblica e racional. Conteúdo profundo, linguagem clara e exemplos do dia a dia para conversas reais com céticos, irmãos com dúvidas e a sua própria caminhada.",
  highlights: [
    "20 aulas em vídeo (~8h20 de conteúdo)",
    "4 módulos organizados do básico ao avançado",
    "Materiais complementares em PDF",
    "Certificado ao concluir o curso",
  ],
  duration: "~8h20 de conteúdo",
  lessons: "20 aulas",
  format: "100% online",
  priceLabel: "R$ 59,90",
  ctaLabel: "Quero esse curso",
  cover: courseCover,
};

// Cursos em breve: importados da fonte única em data/courses.ts
// Altere lá — reflete aqui e na página /cursos automaticamente.
const upcoming = UPCOMING_COURSES;

const CheckIcon = () => (
  <svg
    className="w-4 h-4 text-mint shrink-0 mt-0.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
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

const CourseShowcase = () => {
  return (
    <section
      id="cursos"
      className="relative bg-navy-light/40 py-20 lg:py-28 overflow-hidden"
      aria-labelledby="cursos-heading"
    >
      {/* Gradient sutil de fundo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-mint/[0.04] blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Cabeçalho da seção */}
        <div className="max-w-2xl mx-auto text-center mb-12 lg:mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-4">
            Nossos cursos
          </span>
          <h2
            id="cursos-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-white tracking-tight"
          >
            Conhecimento bíblico que <span className="text-mint">transforma</span> a sua vida
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate">
            Comece pelo curso de Apologética. Em breve novos temas para aprofundar
            sua jornada.
          </p>
        </div>

        {/* Card destaque do curso de Apologética */}
        <article className="relative bg-gradient-to-br from-navy-light to-navy border border-mint/20 rounded-3xl overflow-hidden shadow-card-hover">
          {/* Glow interno */}
          <div className="pointer-events-none absolute -top-32 -right-32 w-[400px] h-[400px] bg-mint/10 blur-[100px] rounded-full" />

          <div className="relative grid lg:grid-cols-5 gap-0">
            {/* Capa — preenche a coluna inteira (flush), nítida, sem borda vazia. */}
            <div className="lg:col-span-2 relative overflow-hidden bg-navy aspect-square lg:aspect-auto">
              <img
                src={featured.cover}
                alt={`Curso de ${featured.title}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                draggable={false}
              />
            </div>

            {/* Conteúdo */}
            <div className="lg:col-span-3 p-6 sm:p-8 lg:p-10 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-navy text-xs font-bold uppercase tracking-wider">
                  {featured.badge}
                </span>
                <span className="text-xs text-slate">{featured.tagline}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-white mb-3">
                Curso de {featured.title}
              </h3>

              <p className="text-sm sm:text-base text-slate leading-relaxed mb-5">
                {featured.description}
              </p>

              {/* Highlights */}
              <ul className="space-y-2.5 mb-6">
                {featured.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm text-slate-light">
                    <CheckIcon />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              {/* Meta info */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6 pb-6 border-b border-slate/10">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate">
                  <ClockIcon /> {featured.duration}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate">
                  <PlayIcon /> {featured.lessons}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate">
                  <GlobeIcon /> {featured.format}
                </span>
              </div>

              {/* Preço + CTA */}
              <div className="mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-2xs text-slate uppercase tracking-wider">
                    {APOLOGETICA_LAUNCHED ? "Pagamento único" : "Lançamento 6 de julho"}
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-mint tabular-nums">R$ 59,90</p>
                </div>
                <Link
                  to={`/cursos/${featured.slug}`}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-mint text-navy font-semibold rounded-xl shadow-mint hover:shadow-mint-strong hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  {APOLOGETICA_LAUNCHED ? featured.ctaLabel : "Saiba mais"}
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden><path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" /></svg>
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Em breve */}
        <div className="mt-10 lg:mt-14">
          <h3 className="text-lg font-semibold text-slate-light mb-5 text-center">
            Próximos cursos
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 lg:gap-5">
            {upcoming.map((c) => (
              <div
                key={c.title}
                className="relative bg-navy-light/60 border border-slate/10 rounded-2xl p-6 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="text-lg font-semibold text-slate-light">{c.title}</h4>
                  <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-golden/15 border border-golden/30 text-golden text-2xs font-medium uppercase tracking-wider">
                    Em breve
                  </span>
                </div>
                <p className="text-sm text-slate leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseShowcase;
