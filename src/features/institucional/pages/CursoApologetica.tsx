import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import courseCover from "../assets/images/capa_curso_apologetica.jpg";
import CourseWaitlist from "../components/CourseWaitlist";
import { APOLOGETICA_LAUNCHED } from "../data/courses";

// TODO: substituir por link real do Hotmart quando o produto estiver cadastrado lá
const HOTMART_CHECKOUT_URL =
  "https://pay.hotmart.com/";

// ── Metadados do curso ────────────────────────────────────────────────────────

const COURSE_TITLE = "Curso de Apologética";
const COURSE_SUBTITLE = "Introdução à Apologética Cristã";
const COURSE_TAGLINE = "Fundamentos para defender a fé com inteligência e respeito";
const COURSE_DURATION_LABEL = "~8h20";

// ── Grade de aulas (grade real validada pelo Marcelo) ───────────────────────
const COURSE_MODULES: { title: string; lessons: string[] }[] = [
  {
    title: "Fundamentos da Apologética",
    lessons: [
      "O que é apologética e o que ela não é",
      "A base bíblica da apologética (1 Pedro 3.15)",
      "Apologética defensiva x ofensiva",
      "Por que todo cristão precisa saber defender a fé",
      "Os grandes apologistas da história da fé",
    ],
  },
  {
    title: "Evidências para a Existência de Deus",
    lessons: [
      "O argumento cosmológico: de onde veio tudo?",
      "O argumento do design inteligente",
      "O argumento moral: de onde vem o certo e o errado?",
      "O ajuste fino do universo: acaso ou criação?",
      "Como apresentar essas evidências na prática",
    ],
  },
  {
    title: "A Bíblia e Jesus",
    lessons: [
      "A Bíblia é confiável? Cânon e formação",
      "Manuscritos e evidências históricas das Escrituras",
      "As profecias cumpridas como evidência",
      "Jesus existiu? Evidências históricas extrabíblicas",
      "A ressurreição: teorias alternativas e por que falham",
    ],
  },
  {
    title: "Respondendo as Grandes Objeções",
    lessons: [
      "Se Deus é bom, por que existe o mal?",
      "Ciência x fé: o mito do conflito",
      "Evolução, criação e o que a Bíblia realmente diz",
      "A Bíblia tem contradições? Como responder",
      "Como conversar com ateus e céticos na prática",
    ],
  },
];

const TOTAL_LESSONS = COURSE_MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
const TOTAL_MODULES = COURSE_MODULES.length;

// ── Conteúdo de marketing (editável aqui) ─────────────────────────────────────

const HIGHLIGHTS = [
  "Defesa racional da fé com base bíblica sólida",
  "Argumentos para responder dúvidas reais (suas e dos outros)",
  "Linguagem clara, sem jargão acadêmico",
  "Exemplos do dia a dia com aplicação prática",
  "Materiais de apoio em PDF para revisão",
  "Acesso a uma comunidade de alunos",
];

const FOR_WHOM = [
  {
    title: "Cristão com dúvidas",
    description:
      "Você crê, mas tem perguntas que ainda não conseguiu responder. Este curso te dá fundamento racional e bíblico.",
  },
  {
    title: "Líder ou pastor",
    description:
      "Você precisa equipar sua igreja a defender a fé. Saia do curso pronto para ensinar, pregar e discipular sobre apologética.",
  },
  {
    title: "Novo convertido",
    description:
      "Você acabou de iniciar a caminhada cristã e quer construir uma fé que resista a perguntas difíceis.",
  },
  {
    title: "Quem dialoga com céticos",
    description:
      "Você convive com ateus, agnósticos ou pessoas de outras religiões. Aprenda a conversar com respeito, profundidade e clareza.",
  },
];

const INCLUDED = [
  "20 aulas em vídeo (~8h20 de conteúdo)",
  "4 módulos organizados do básico ao avançado",
  "Materiais complementares em PDF",
  "Certificado de conclusão",
  "Acesso por 1 ano a todas as aulas, materiais e atualizações",
  "Assista no seu ritmo, quando e onde quiser",
];

const FAQ_ITEMS = [
  {
    q: "Como funciona o acesso ao curso?",
    a: "Após a compra, você recebe um e-mail com seus dados de acesso à plataforma. Lá, você assiste às aulas no seu ritmo, no computador ou no celular.",
  },
  {
    q: "Recebo certificado ao terminar?",
    a: "Sim. Ao concluir as 20 aulas, você recebe um certificado digital que pode ser compartilhado nas suas redes sociais e currículo.",
  },
  {
    q: "Preciso ter conhecimento prévio?",
    a: "Não. O curso é construído do básico ao mais profundo, com linguagem acessível para qualquer pessoa interessada em apologética.",
  },
  {
    q: "Por quanto tempo tenho acesso?",
    a: "Você tem acesso por 1 ano a partir da data da compra — tempo mais que suficiente para concluir o curso no seu ritmo.",
  },
  {
    q: "Tem suporte? Posso tirar dúvidas?",
    a: "Sim. Dentro da plataforma você consegue comentar em cada aula. As dúvidas são respondidas pela nossa equipe e pela comunidade de alunos.",
  },
];

// ── Ícones ────────────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg className="w-5 h-5 text-mint shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" />
  </svg>
);

const ChevronDownIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`w-5 h-5 text-slate transition-transform duration-300 ${open ? "rotate-180" : ""}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

// ── Sub-componentes ───────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate/10 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left hover:text-mint transition-colors"
        aria-expanded={open}
      >
        <span className="text-base sm:text-lg font-semibold text-slate-light">
          {q}
        </span>
        <ChevronDownIcon open={open} />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm sm:text-base text-slate leading-relaxed pr-8">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

function ModuleAccordion({
  title,
  count,
  lessons,
}: {
  title: string;
  count: number;
  lessons: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-navy-light/60 border border-slate/10 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left hover:bg-navy-light/80 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-4">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-mint/10 border border-mint/30 flex items-center justify-center text-mint text-sm font-bold tabular-nums">
            {count}
          </div>
          <div>
            <p className="text-base sm:text-lg font-semibold text-slate-light">{title}</p>
            <p className="text-2xs text-slate uppercase tracking-wider mt-0.5">
              {lessons.length} {lessons.length === 1 ? "aula" : "aulas"}
            </p>
          </div>
        </div>
        <ChevronDownIcon open={open} />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-2 border-t border-slate/10 pt-4">
            {lessons.map((l, i) => (
              <li
                key={l.id}
                className="flex items-start gap-3 text-sm text-slate-light py-1.5"
              >
                <span className="shrink-0 w-6 h-6 rounded-full bg-slate/5 border border-slate/10 flex items-center justify-center text-2xs text-slate tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{l.title}</span>
                <span className="shrink-0 text-mint">
                  <PlayIcon />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────

const CursoApologetica = () => {
  useEffect(() => {
    document.title = `${COURSE_TITLE} | Five One`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        `${COURSE_SUBTITLE}. ${COURSE_TAGLINE}. ${TOTAL_LESSONS} aulas em ${TOTAL_MODULES} módulos, ${COURSE_DURATION_LABEL} de conteúdo. Pagamento único com 1 ano de acesso e certificado.`,
      );
    }
  }, []);

  // Grade hardcoded (ver const COURSE_MODULES no topo)
  const modulesView = {
    modules: COURSE_MODULES.map((m, mi) => ({
      id: `mod-${mi}`,
      title: m.title,
      lessons: m.lessons.map((title, li) => ({ id: `mod-${mi}-l-${li}`, title })),
    })),
    total: TOTAL_LESSONS,
  };

  return (
    <div className="bg-navy text-slate-light min-h-screen pb-24 lg:pb-0">
      {/* ─────────────────────────────────────────── Hero ─── */}
      <section className="relative pt-8 sm:pt-10 pb-10 lg:pb-14 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-mint/[0.06] blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
          <Link
            to="/cursos"
            className="inline-flex items-center gap-1.5 text-xs text-slate hover:text-mint transition-colors mb-6"
          >
            <ArrowLeftIcon />
            Voltar para cursos
          </Link>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Capa */}
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-br from-mint/30 via-mint/10 to-transparent rounded-3xl blur-2xl opacity-70" />
              <img
                src={courseCover}
                alt="Curso de Apologética"
                className="relative w-full h-auto rounded-2xl shadow-card-hover border border-slate/10"
                draggable={false}
              />
              <div className="absolute -top-3 right-3 sm:-top-4 sm:right-4 bg-mint text-navy text-xs font-bold px-3 py-1.5 rounded-full shadow-mint-strong rotate-3">
                Lançamento
              </div>
            </div>

            {/* Info */}
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-4">
                {COURSE_SUBTITLE} · {TOTAL_LESSONS} aulas
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-white tracking-tight leading-[1.1]">
                Curso de <span className="text-mint">Apologética</span>
              </h1>

              <p className="mt-3 text-sm sm:text-base text-mint font-medium">
                {COURSE_TAGLINE}
              </p>

              <p className="mt-4 text-base sm:text-lg text-slate leading-relaxed">
                Aprenda a defender sua fé com solidez bíblica e racional.
                Conteúdo profundo, linguagem clara e exemplos do dia a dia para
                conversas reais com céticos, irmãos com dúvidas e a sua própria
                caminhada.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="bg-navy-light/60 border border-slate/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-slate-white">{TOTAL_LESSONS}</p>
                  <p className="text-2xs text-slate uppercase tracking-wider mt-0.5">aulas</p>
                </div>
                <div className="bg-navy-light/60 border border-slate/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-slate-white">{COURSE_DURATION_LABEL}</p>
                  <p className="text-2xs text-slate uppercase tracking-wider mt-0.5">conteúdo</p>
                </div>
                <div className="bg-navy-light/60 border border-slate/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-slate-white">{TOTAL_MODULES}</p>
                  <p className="text-2xs text-slate uppercase tracking-wider mt-0.5">módulos</p>
                </div>
              </div>

              {APOLOGETICA_LAUNCHED ? (
                <>
                  <div className="mt-7 p-5 bg-navy-light/60 border border-mint/20 rounded-2xl">
                    <p className="text-2xs text-slate uppercase tracking-wider">Pagamento único</p>
                    <p className="text-3xl sm:text-4xl font-bold text-mint tabular-nums">R$ 59,90</p>
                    <p className="text-2xs text-slate mt-1">Acesso por 1 ano · certificado incluído</p>
                  </div>
                  <a
                    href={HOTMART_CHECKOUT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-6 inline-flex w-full sm:w-auto items-center justify-center gap-2 px-7 py-4 bg-mint text-navy font-semibold rounded-xl shadow-mint hover:shadow-mint-strong hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    Quero esse curso agora
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                    </svg>
                  </a>
                  <p className="mt-3 text-2xs text-slate/80">Você será direcionado ao checkout seguro do Hotmart</p>
                </>
              ) : (
                <div className="mt-7">
                  <CourseWaitlist />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────── Sobre o curso ─── */}
      <section className="py-16 lg:py-20 bg-navy-light/30">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-4">
            Sobre o curso
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-white tracking-tight mb-6">
            Por que estudar apologética?
          </h2>
          <div className="space-y-5 text-base sm:text-lg text-slate leading-relaxed">
            <p>
              Em um mundo cada vez mais cético, defender a fé deixou de ser uma
              opção para se tornar uma necessidade. Pessoas — talvez você mesmo
              — têm dúvidas sinceras sobre Deus, sobre a Bíblia, sobre Jesus.
            </p>
            <p>
              <strong className="text-slate-light">Apologética</strong> é o
              estudo da defesa racional e bíblica da fé cristã. É a disciplina
              que prepara você para responder com clareza, profundidade e
              respeito a perguntas que antes pareciam difíceis demais.
            </p>
            <p>
              Neste curso, você vai construir uma fé que <em>resiste</em>: que
              sabe por que crê, sabe explicar e sabe dialogar — tanto com
              céticos quanto com irmãos em dúvida.
            </p>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────── O que vai aprender ─── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-4">
              Conteúdo completo
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-white tracking-tight">
              O que você vai aprender
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate">
              {TOTAL_MODULES} módulos · {TOTAL_LESSONS} aulas em vídeo · {COURSE_DURATION_LABEL} de conteúdo
            </p>
          </div>

          {modulesView.modules.length > 0 ? (
            <div className="space-y-3 max-w-3xl mx-auto">
              {modulesView.modules.map((m, i) => (
                <ModuleAccordion
                  key={m.id}
                  count={i + 1}
                  title={m.title}
                  lessons={m.lessons}
                />
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto bg-navy-light/60 border border-slate/10 rounded-2xl p-8 text-center text-slate">
              Carregando conteúdo do curso…
            </div>
          )}

          {/* Highlights bullets adicionais */}
          <div className="mt-12 max-w-3xl mx-auto grid sm:grid-cols-2 gap-3">
            {HIGHLIGHTS.map((h) => (
              <div
                key={h}
                className="flex items-start gap-3 bg-navy-light/40 border border-slate/10 rounded-xl px-4 py-3"
              >
                <CheckIcon />
                <span className="text-sm text-slate-light">{h}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────── Para quem é ─── */}
      <section className="py-16 lg:py-20 bg-navy-light/30">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-4">
              Indicado para
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-white tracking-tight">
              Para quem é este curso
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FOR_WHOM.map((p) => (
              <div
                key={p.title}
                className="bg-navy-light/60 border border-slate/10 rounded-2xl p-6 hover:border-mint/30 transition-colors"
              >
                <h3 className="text-lg font-semibold text-slate-light mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-slate leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────── Instrutor ─── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-4">
            Quem ensina
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-white tracking-tight mb-8">
            Conheça o instrutor
          </h2>

          <div className="bg-navy-light/60 border border-slate/10 rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row gap-6 lg:gap-8 items-center sm:items-start">
            {/* Placeholder de foto — substituir por foto real depois */}
            <div className="shrink-0 w-32 h-32 lg:w-40 lg:h-40 rounded-2xl bg-gradient-to-br from-mint/20 to-mint/5 border border-mint/20 flex items-center justify-center text-mint text-4xl lg:text-5xl font-bold">
              MJ
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-white">
                Marcelo Junior
              </h3>
              <p className="text-sm text-mint font-medium mt-1">
                Fundador do Movimento Five One
              </p>
              <p className="text-sm sm:text-base text-slate leading-relaxed mt-4">
                Apaixonado por equipar a igreja com fundamento bíblico e teológico
                sólido. Acredita que cada cristão precisa saber explicar a sua
                fé com profundidade e clareza, e dedica seu ministério a tornar
                isso possível para qualquer pessoa.
              </p>
              <p className="text-2xs text-slate/60 italic mt-3">
                Bio detalhada em breve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────── O que está incluso ─── */}
      <section className="py-16 lg:py-20 bg-navy-light/30">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-4">
            Tudo incluso
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-white tracking-tight mb-8">
            O que está incluído no curso
          </h2>

          <div className="grid sm:grid-cols-2 gap-3">
            {INCLUDED.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 bg-navy-light/60 border border-slate/10 rounded-xl px-5 py-4"
              >
                <CheckIcon />
                <span className="text-sm sm:text-base text-slate-light">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────── FAQ ─── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-4">
            Perguntas frequentes
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-white tracking-tight mb-8">
            Dúvidas comuns
          </h2>

          <div className="bg-navy-light/60 border border-slate/10 rounded-3xl px-6 sm:px-8">
            {FAQ_ITEMS.map((f) => (
              <FAQItem key={f.q} q={f.q} a={f.a} />
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
            Pronto para começar sua <span className="text-mint">jornada</span>?
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate max-w-xl mx-auto">
            Pagamento único de R$ 59,90 com acesso por 1 ano ao curso
            completo, materiais e certificado.
          </p>
          <div className="mt-9">
            <a
              href={HOTMART_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-mint text-navy font-semibold rounded-xl shadow-mint hover:shadow-mint-strong hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Quero o curso de Apologética
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────── Sticky CTA mobile ─── */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-navy-light/95 backdrop-blur-md border-t border-mint/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-2xs text-slate uppercase tracking-wider">Apologética</p>
            <p className="text-base font-bold text-mint tabular-nums leading-tight">
              R$ 59,90
            </p>
          </div>
          <a
            href={HOTMART_CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-mint text-navy text-sm font-bold rounded-xl shadow-mint"
          >
            Comprar
          </a>
        </div>
      </div>
    </div>
  );
};

export default CursoApologetica;
