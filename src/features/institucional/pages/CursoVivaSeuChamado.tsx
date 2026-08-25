import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import courseCover from "../assets/images/VivaOSeuChamado.png";
import instrutorFoto from "../assets/images/Marcelo.jpeg";
import CourseWaitlist from "../components/CourseWaitlist";
import { VIVA_LAUNCHED, VIVA_PRESALE, VIVA_LAUNCH_DATE, VIVA_HOTMART_URL, VIVA_PRICE, VIVA_PRICE_FULL } from "../data/courses";
import apostoloIcon from "../../../assets/images/icons/apostolo.png";
import profetaIcon from "../../../assets/images/icons/profeta.png";
import mestreIcon from "../../../assets/images/icons/mestre.png";
import pastorIcon from "../../../assets/images/icons/pastor.png";
import evangelistaIcon from "../../../assets/images/icons/evangelista.png";

const HOTMART_CHECKOUT_URL = VIVA_HOTMART_URL;
const PRICE = VIVA_PRICE;
const PRICE_FULL = VIVA_PRICE_FULL;

// Vídeo de apresentação do curso — quando tiver o vídeo, cole o embed aqui
// (YouTube/Vimeo). Enquanto ficar vazio, a seção de vídeo não aparece.
const COURSE_VIDEO_EMBED = "";

// ── Metadados do curso ────────────────────────────────────────────────────────

const COURSE_TITLE = "Viva o seu Chamado";
const COURSE_SUBTITLE = "Curso dos 5 Ministérios";
const COURSE_TAGLINE = "Descubra, desenvolva e viva o seu dom ministerial no dia a dia";
const COURSE_DURATION_LABEL = "1/semana";

// ── Grade de aulas (Curso dos 5 Ministérios) ────────────────────────────────
const COURSE_MODULES: { title: string; lessons: string[] }[] = [
  {
    title: "Fundamentos: os 5 Ministérios",
    lessons: [
      "O que é um dom ministerial (e o que não é)",
      "Efésios 4.11-13: a base bíblica dos 5 dons",
      "Por que a Igreja precisa dos cinco — juntos",
      "Dom principal e secundário: como eles se combinam",
    ],
  },
  {
    title: "Conheça cada dom a fundo",
    lessons: [
      "Apóstolo: o pioneiro que abre caminhos",
      "Profeta: o guardião da verdade",
      "Evangelista: o coração que alcança",
      "Pastor: o cuidador do rebanho",
      "Mestre: o formador na Palavra",
    ],
  },
  {
    title: "Imaturo × Maduro: a sombra de cada dom",
    lessons: [
      "Como o seu dom pode operar de forma doentia",
      "Os pontos cegos que sabotam o seu chamado",
      "O caminho da maturidade em cada dom",
      "Cercar-se de quem completa você",
    ],
  },
  {
    title: "Viva o seu dom no dia a dia",
    lessons: [
      "O seu dom na família e nos relacionamentos",
      "O seu dom na igreja e no ministério",
      "O seu dom no trabalho e no mundo",
      "Servir sem se esgotar: limites saudáveis",
    ],
  },
  {
    title: "Desenvolva e multiplique",
    lessons: [
      "Base × fase: dom permanente e dom de temporada",
      "Como desenvolver o seu dom na prática",
      "Formar e liberar outros no chamado deles",
      "Seu plano dos próximos 90 dias",
    ],
  },
];

const TOTAL_LESSONS = COURSE_MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
const TOTAL_MODULES = COURSE_MODULES.length;

// ── Conteúdo de marketing (editável aqui) ─────────────────────────────────────

const HIGHLIGHTS = [
  "Entenda os 5 ministérios de Efésios 4 com profundidade bíblica",
  "Descubra como o seu dom principal e secundário se combinam",
  "Reconheça os seus pontos cegos e amadureça neles",
  "Aprenda a viver o seu dom na família, na igreja e no trabalho",
  "Materiais de apoio em PDF para cada módulo",
  "Comunidade de alunos caminhando junto no chamado",
];

const FOR_WHOM = [
  {
    title: "Quem fez o teste",
    description:
      "Você descobriu o seu dom no Teste dos 5 Ministérios e agora quer desenvolvê-lo de verdade, na prática.",
  },
  {
    title: "Líder ou pastor",
    description:
      "Você quer entender os dons da sua equipe e edificar uma liderança equilibrada nos 5 ministérios.",
  },
  {
    title: "Quem se sente sem lugar",
    description:
      "Você ama a Deus, mas nunca soube onde encaixar na igreja. Este curso te mostra o seu lugar.",
  },
  {
    title: "Quem quer viver o chamado",
    description:
      "Você quer sair da teoria e viver o seu propósito no dia a dia, com clareza e direção.",
  },
];

// ── Seção "O Problema" — dores que o leitor reconhece ────────────────────────
const PROBLEMS = [
  "Você sente que Deus te chamou, mas não sabe exatamente para quê.",
  "Já tentou servir na igreja, mas nunca se encaixou de verdade.",
  "Vê outros florescendo no ministério e se pergunta qual é o seu lugar.",
  "Sabe qual é o seu dom, mas não sabe como desenvolvê-lo na prática.",
  "Se esgota tentando fazer de tudo, em vez de servir no seu dom.",
];

// ── Seção "Como funciona" — o método em 3 passos ─────────────────────────────
const METHOD_STEPS = [
  {
    n: "01",
    title: "Descubra",
    description:
      "Entenda os 5 ministérios e identifique com clareza o seu dom principal e secundário.",
  },
  {
    n: "02",
    title: "Aprofunde",
    description:
      "Conheça as forças, os pontos cegos e o caminho de maturidade do seu dom.",
  },
  {
    n: "03",
    title: "Viva",
    description:
      "Coloque o seu dom em prática — na família, na igreja e no mundo — com um plano real.",
  },
];

const INCLUDED = [
  "Aulas em vídeo liberadas toda semana (turma pioneira)",
  "5 módulos: dos fundamentos à prática do seu chamado",
  "Materiais de apoio em PDF por módulo",
  "Certificado de conclusão",
  "Acesso por 1 ano a todas as aulas e atualizações",
  "Comunidade de alunos + encontros da turma pioneira",
];

const FAQ_ITEMS = [
  {
    q: "O que recebo comprando na pré-venda?",
    a: "Você garante o curso com desconto (de R$ 59,90 por R$ 39,90) e ganha, de bônus, o Livro dos 5 Ministérios. No dia do lançamento (9 de setembro) são liberadas 5 aulas de uma vez e, depois, uma nova aula por semana.",
  },
  {
    q: "Como funciona o acesso ao curso?",
    a: "Após a compra, você recebe acesso à plataforma. No lançamento chegam as 5 primeiras aulas e, depois, uma nova a cada semana — no seu ritmo, no computador ou no celular.",
  },
  {
    q: "Por que as aulas são liberadas por semana?",
    a: "Porque desenvolver um dom leva tempo. Uma aula por semana evita o afogamento, cria constância e te ajuda a aplicar de verdade — não só assistir.",
  },
  {
    q: "Preciso ter feito o Teste dos 5 Ministérios?",
    a: "Não é obrigatório, mas ajuda muito. Se ainda não fez, faça primeiro (é grátis) — assim você já começa o curso sabendo o seu dom.",
  },
  {
    q: "Recebo certificado ao terminar?",
    a: "Sim. Ao concluir todas as aulas, você recebe um certificado digital que pode compartilhar nas suas redes e currículo.",
  },
  {
    q: "Por quanto tempo tenho acesso?",
    a: "Você tem acesso por 1 ano a partir da entrada — tempo de sobra para acompanhar a turma e revisar quando quiser.",
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

// ── Pré-venda: countdown, botão de compra e card de preço ─────────────────────

// Só vende de fato quando há um checkout configurado — sem link, cai na lista de espera.
const SELLING = (VIVA_LAUNCHED || VIVA_PRESALE) && HOTMART_CHECKOUT_URL.trim() !== "";
const PRESALE = VIVA_PRESALE && !VIVA_LAUNCHED;
const LAUNCH_DAY_LABEL = VIVA_LAUNCH_DATE.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });

const PAYMENT_METHODS = ["Pix", "Cartão em até 12x", "Boleto"];

function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, over: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      over: false,
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return t;
}

function CountdownBar() {
  const { days, hours, minutes, seconds, over } = useCountdown(VIVA_LAUNCH_DATE);
  if (over) return null;
  const cell = (v: number, l: string) => (
    <div className="flex flex-col items-center min-w-[42px]">
      <span className="text-2xl font-extrabold text-mint tabular-nums leading-none">{String(v).padStart(2, "0")}</span>
      <span className="text-2xs text-slate/70 uppercase tracking-wide mt-0.5">{l}</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1">
      {cell(days, "dias")}<span className="text-slate/40 text-lg mb-2">:</span>
      {cell(hours, "h")}<span className="text-slate/40 text-lg mb-2">:</span>
      {cell(minutes, "min")}<span className="text-slate/40 text-lg mb-2">:</span>
      {cell(seconds, "seg")}
    </div>
  );
}

function BuyButton({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <a
      href={HOTMART_CHECKOUT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center justify-center gap-2 px-7 py-4 bg-mint text-navy font-semibold rounded-xl shadow-mint hover:shadow-mint-strong hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ${className}`}
    >
      {children}
      <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
      </svg>
    </a>
  );
}

/** Bloco de preço/checkout — usado no hero. Mostra moldura de pré-venda. */
function PurchaseCard() {
  return (
    <div className="p-5 sm:p-6 bg-navy-light/70 border border-mint/30 rounded-2xl">
      {PRESALE && (
        <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-slate/10">
          <div>
            <span className="inline-block px-2.5 py-1 rounded-full bg-mint text-navy text-2xs font-bold uppercase tracking-wider">
              Pré-venda aberta
            </span>
            <p className="text-2xs text-slate uppercase tracking-widest mt-2">Acesso libera em</p>
          </div>
          <CountdownBar />
        </div>
      )}

      <p className="text-2xs text-slate uppercase tracking-wider">
        {PRESALE ? "Preço de pré-venda" : "Pagamento único"}
      </p>
      <div className="flex items-baseline gap-2">
        {PRESALE && (
          <p className="text-lg text-slate line-through decoration-slate/60 tabular-nums">{PRICE_FULL}</p>
        )}
        <p className="text-4xl font-extrabold text-mint tabular-nums">{PRICE}</p>
        <p className="text-sm text-slate">à vista</p>
      </div>
      <p className="text-xs text-slate mt-0.5">
        {PRESALE ? (
          <>de <span className="line-through">{PRICE_FULL}</span> · ou em até <strong className="text-slate-light">12x no cartão</strong></>
        ) : (
          <>ou em até <strong className="text-slate-light">12x no cartão</strong></>
        )}
      </p>

      <div className="flex flex-wrap gap-2 mt-4">
        {PAYMENT_METHODS.map((m) => (
          <span key={m} className="text-2xs text-slate-light bg-navy/60 border border-slate/15 rounded-lg px-2.5 py-1.5">
            {m}
          </span>
        ))}
      </div>

      <BuyButton className="w-full mt-5">
        {PRESALE ? "Garantir minha vaga na pré-venda" : "Quero esse curso agora"}
      </BuyButton>

      <div className="mt-4 space-y-1.5">
        {PRESALE && (
          <>
            <p className="flex items-start gap-2 text-xs text-slate">
              <CheckIcon /> No lançamento ({LAUNCH_DAY_LABEL}): 5 aulas de uma vez + 1 nova por semana
            </p>
            <p className="flex items-start gap-2 text-xs text-golden">
              <CheckIcon /> Bônus exclusivo da pré-venda: o Livro dos 5 Ministérios no lançamento
            </p>
          </>
        )}
        <p className="flex items-start gap-2 text-xs text-slate">
          <CheckIcon /> Acesso por 1 ano + certificado de conclusão
        </p>
        <p className="flex items-start gap-2 text-xs text-slate">
          <CheckIcon /> 7 dias de garantia incondicional
        </p>
        <p className="flex items-start gap-2 text-xs text-slate">
          <CheckIcon /> Checkout 100% seguro via Hotmart
        </p>
      </div>
    </div>
  );
}

/** CTA de compra centralizado, repetido ao longo da página. */
function BuyCTA({ label }: { label: string }) {
  if (!SELLING) return null;
  return (
    <div className="mt-10 text-center">
      <BuyButton>{label}</BuyButton>
      <p className="mt-3 text-2xs text-slate/80">
        {PRESALE ? `Pré-venda · de ${PRICE_FULL} por ${PRICE} · acesso em ${LAUNCH_DAY_LABEL}` : `${PRICE} · pagamento único · checkout seguro Hotmart`}
      </p>
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────

const CursoVivaSeuChamado = () => {
  useEffect(() => {
    document.title = `${COURSE_TITLE} | Five One`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        `${COURSE_SUBTITLE}. ${COURSE_TAGLINE}. ${TOTAL_LESSONS} aulas em ${TOTAL_MODULES} módulos, liberadas toda semana na turma pioneira. Descubra, desenvolva e viva o seu dom ministerial.`,
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
    <div className="bg-navy text-slate-light min-h-screen pb-24 lg:pb-0 relative overflow-hidden">
      {/* Decorações globais */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden hidden lg:block">
        <img src={apostoloIcon}    alt="" className="absolute top-[4%]    left-[1.5%] w-16 opacity-[0.07] grayscale" />
        <img src={mestreIcon}      alt="" className="absolute top-[28%]   left-[1%]   w-14 opacity-[0.05] grayscale" />
        <img src={evangelistaIcon} alt="" className="absolute top-[55%]   left-[2%]   w-12 opacity-[0.06] grayscale" />
        <img src={pastorIcon}      alt="" className="absolute bottom-[10%] left-[1.5%] w-14 opacity-[0.05] grayscale" />
        <img src={profetaIcon}     alt="" className="absolute top-[10%]   right-[1.5%] w-16 opacity-[0.07] grayscale" />
        <img src={apostoloIcon}    alt="" className="absolute top-[40%]   right-[1%]   w-14 opacity-[0.05] grayscale" />
        <img src={mestreIcon}      alt="" className="absolute bottom-[15%] right-[2%]  w-12 opacity-[0.06] grayscale" />
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-mint/[0.07] blur-[80px] rounded-full" />
        <div className="absolute top-2/3 left-0 w-[650px] h-[450px] bg-golden/[0.06] blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/3 w-[700px] h-[400px] bg-mint/[0.07] blur-[80px] rounded-full" />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: 'radial-gradient(circle, #64ffda 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

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
                alt="Curso Viva o seu Chamado — os 5 Ministérios"
                className="relative w-full h-auto rounded-2xl shadow-card-hover border border-slate/10"
                draggable={false}
              />
              <div className="absolute -top-3 right-3 sm:-top-4 sm:right-4 bg-mint text-navy text-xs font-bold px-3 py-1.5 rounded-full shadow-mint-strong rotate-3">
                {PRESALE ? "Pré-venda" : "Turma pioneira"}
              </div>
            </div>

            {/* Info */}
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-4">
                {COURSE_SUBTITLE} · {TOTAL_LESSONS} aulas
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-white tracking-tight leading-[1.1]">
                Viva o seu <span className="text-mint">Chamado</span>
              </h1>

              <p className="mt-3 text-sm sm:text-base text-mint font-medium">
                {COURSE_TAGLINE}
              </p>

              <p className="mt-4 text-base sm:text-lg text-slate leading-relaxed">
                Descobrir o seu dom é só o começo. Neste curso você aprende a
                desenvolver e viver o seu chamado ministerial no dia a dia — com
                fundamento bíblico, clareza e um caminho prático, na sua família,
                na sua igreja e no mundo ao seu redor.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="bg-navy-light/60 border border-slate/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-slate-white">{TOTAL_LESSONS}</p>
                  <p className="text-2xs text-slate uppercase tracking-wider mt-0.5">aulas</p>
                </div>
                <div className="bg-navy-light/60 border border-slate/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-slate-white">{COURSE_DURATION_LABEL}</p>
                  <p className="text-2xs text-slate uppercase tracking-wider mt-0.5">novas aulas</p>
                </div>
                <div className="bg-navy-light/60 border border-slate/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-slate-white">{TOTAL_MODULES}</p>
                  <p className="text-2xs text-slate uppercase tracking-wider mt-0.5">módulos</p>
                </div>
              </div>

              <div id="comprar" />
              <div className="mt-7">
                {SELLING ? (
                  <PurchaseCard />
                ) : (
                  <CourseWaitlist
                    launchDate={null}
                    price={null}
                    source="waitlist_viva_chamado"
                    eyebrow="Turma pioneira"
                    headline="Vagas abrindo em breve"
                    formPrompt="Entre na lista e seja o primeiro a saber da abertura da turma"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────── Como funciona o lançamento (pré-venda) ─── */}
      {PRESALE && (
        <section className="py-12 lg:py-16 bg-navy-light/30">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-8 lg:mb-10">
              <span className="inline-block px-3 py-1 rounded-full bg-golden/10 border border-golden/30 text-golden text-xs font-medium uppercase tracking-wider mb-4">
                Pré-venda aberta
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-white tracking-tight">
                Como funciona o lançamento
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate">
                Garanta agora com desconto e comece com tudo no dia {LAUNCH_DAY_LABEL}.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              <div className="relative bg-navy-light/60 border border-mint/20 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-3" aria-hidden>🚀</div>
                <p className="text-2xs text-mint uppercase tracking-widest font-semibold mb-1">
                  {LAUNCH_DAY_LABEL}
                </p>
                <h3 className="text-lg font-bold text-slate-white">5 aulas de uma vez</h3>
                <p className="mt-2 text-sm text-slate leading-relaxed">
                  No dia do lançamento você já recebe as 5 primeiras aulas para começar com força.
                </p>
              </div>
              <div className="relative bg-navy-light/60 border border-slate/10 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-3" aria-hidden>🗓️</div>
                <p className="text-2xs text-slate uppercase tracking-widest font-semibold mb-1">
                  Toda semana
                </p>
                <h3 className="text-lg font-bold text-slate-white">1 nova aula por semana</h3>
                <p className="mt-2 text-sm text-slate leading-relaxed">
                  Depois do lançamento, uma aula nova a cada semana — no ritmo certo para aplicar de verdade.
                </p>
              </div>
              <div className="relative bg-navy-light/60 border border-golden/30 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-3" aria-hidden>🎁</div>
                <p className="text-2xs text-golden uppercase tracking-widest font-semibold mb-1">
                  Bônus da pré-venda
                </p>
                <h3 className="text-lg font-bold text-slate-white">Livro dos 5 Ministérios</h3>
                <p className="mt-2 text-sm text-slate leading-relaxed">
                  Quem compra na pré-venda ganha o livro, liberado junto com o curso no lançamento.
                </p>
              </div>
            </div>

            <p className="text-center mt-8 text-sm sm:text-base text-slate">
              De <span className="line-through">{PRICE_FULL}</span>{" "}
              <span className="text-mint font-bold text-lg">{PRICE}</span> só na pré-venda.
            </p>
            <BuyCTA label="Garantir minha vaga na pré-venda" />
          </div>
        </section>
      )}

      {/* ──────────────────────────────────── O Problema ─── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <span className="inline-block px-3 py-1 rounded-full bg-golden/10 border border-golden/30 text-golden text-xs font-medium uppercase tracking-wider mb-4">
              Reconhece isso?
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-white tracking-tight">
              Você sente o chamado. Mas sabe <span className="text-mint">onde</span> é o seu lugar?
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {PROBLEMS.map((p) => (
              <div
                key={p}
                className="flex items-start gap-3 bg-navy-light/50 border border-slate/10 rounded-xl px-5 py-4"
              >
                <span className="shrink-0 mt-0.5 text-golden">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </span>
                <span className="text-sm sm:text-base text-slate-light leading-relaxed">{p}</span>
              </div>
            ))}
          </div>

          <p className="max-w-2xl mx-auto text-center mt-8 text-base sm:text-lg text-slate leading-relaxed">
            Se você se identificou, o problema não é falta de chamado — é falta de{" "}
            <strong className="text-slate-light">direção</strong>. E é exatamente
            isso que este curso te dá.
          </p>
        </div>
      </section>

      {/* ──────────────────────────────────── Como funciona ─── */}
      <section className="py-16 lg:py-20 bg-navy-light/30">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-4">
              O método
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-white tracking-tight">
              De “qual é o meu dom?” para “eu <span className="text-mint">vivo</span> o meu dom”
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate">
              Um caminho em 3 passos, do descobrir ao viver.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {METHOD_STEPS.map((s) => (
              <div
                key={s.n}
                className="relative bg-navy-light/60 border border-slate/10 rounded-2xl p-6 hover:border-mint/30 transition-colors"
              >
                <span className="text-4xl font-extrabold text-mint/30 tabular-nums leading-none">
                  {s.n}
                </span>
                <h3 className="mt-3 text-lg font-bold text-slate-white">{s.title}</h3>
                <p className="mt-2 text-sm text-slate leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
          <BuyCTA label="Quero seguir esse caminho" />
        </div>
      </section>

      {/* ──────────────────────────────────── Vídeo ─── */}
      {COURSE_VIDEO_EMBED && (
        <section className="relative py-10 lg:py-14">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-4">
                Assista agora
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-white tracking-tight">
                Conheça o curso em poucos minutos
              </h2>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate/10 shadow-card-hover bg-navy-light/60">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={COURSE_VIDEO_EMBED}
                title="Viva o seu Chamado — apresentação do curso"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <BuyCTA label="Quero garantir minha vaga" />
          </div>
        </section>
      )}

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
              {TOTAL_MODULES} módulos · {TOTAL_LESSONS} aulas em vídeo · liberadas toda semana
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
          <BuyCTA label="Quero viver o meu chamado" />
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
          <BuyCTA label="Esse curso é pra mim" />
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

          <div className="bg-navy-light/60 border border-slate/10 rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row gap-6 lg:gap-8 items-center sm:items-center">
            <div className="shrink-0 w-44 lg:w-52 aspect-[3/4] rounded-2xl overflow-hidden border border-mint/20">
              <img
                src={instrutorFoto}
                alt="Marcelo Junior"
                className="w-full h-full object-cover object-top"
                loading="lazy"
                draggable={false}
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-white">
                Marcelo Junior
              </h3>
              <p className="text-sm text-mint font-medium mt-1">
                Fundador do Movimento Five One
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                <span className="text-2xs text-slate-light bg-navy/60 border border-mint/20 rounded-lg px-2.5 py-1.5">Teólogo</span>
                <span className="text-2xs text-slate-light bg-navy/60 border border-mint/20 rounded-lg px-2.5 py-1.5">
                  Pós-graduado em Novo Testamento · Cidade Viva
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate leading-relaxed mt-4">
                Teólogo e pós-graduado em Novo Testamento pela Cidade Viva,
                Marcelo dedica seu ministério a ensinar e capacitar pessoas a
                viverem o seu dom ministerial com profundidade e propósito.
              </p>
              <p className="text-sm sm:text-base text-slate leading-relaxed mt-3">
                Apaixonado por equipar a igreja, ele acredita que todo cristão
                tem um dom e um lugar no Corpo de Cristo. Seu ensino é marcado
                pela <strong className="text-slate-light">fidelidade às
                Escrituras</strong> e por uma linguagem acessível, que aproxima a
                teologia da vida real.
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
          <BuyCTA label="Quero garantir meu acesso" />
        </div>
      </section>

      {/* ──────────────────────────────────── Garantia ─── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="bg-navy-light/60 border border-mint/25 rounded-3xl p-8 sm:p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-mint/10 border border-mint/30 mb-5">
              <svg className="w-8 h-8 text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-white tracking-tight">
              Risco zero: 7 dias de garantia
            </h2>
            <p className="mt-4 text-base text-slate leading-relaxed max-w-xl mx-auto">
              Entre, assista e sinta o curso. Se em até 7 dias você achar que não é
              pra você, basta pedir o reembolso pela Hotmart e devolvemos 100% do
              valor — sem perguntas, sem burocracia.
            </p>
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
            Pronto para viver o seu <span className="text-mint">chamado</span>?
          </h2>
          {SELLING ? (
            <>
              <p className="mt-5 text-base sm:text-lg text-slate max-w-xl mx-auto">
                {PRESALE
                  ? `Garanta agora na pré-venda: de ${PRICE_FULL} por ${PRICE}, com o Livro dos 5 Ministérios de bônus. No lançamento (${LAUNCH_DAY_LABEL}) saem 5 aulas de uma vez e, depois, 1 nova por semana.`
                  : `Entre na turma pioneira por ${PRICE}, com acesso por 1 ano às aulas, materiais e certificado.`}
              </p>
              <div className="mt-9 flex flex-col items-center gap-3">
                <BuyButton className="px-8">
                  {PRESALE ? "Garantir minha vaga na pré-venda" : "Quero viver o meu chamado"}
                </BuyButton>
                <p className="text-2xs text-slate/80">
                  Pix · cartão em até 12x · boleto · 7 dias de garantia
                </p>
              </div>
            </>
          ) : (
            <div className="mt-8 max-w-md mx-auto">
              <CourseWaitlist
                launchDate={null}
                price={null}
                source="waitlist_viva_chamado"
                eyebrow="Turma pioneira"
                headline="Vagas abrindo em breve"
                formPrompt="Entre na lista e seja o primeiro a saber da abertura da turma"
              />
            </div>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────── Sticky CTA mobile ─── */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-navy-light/95 backdrop-blur-md border-t border-mint/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-2xs text-slate uppercase tracking-wider">
              {SELLING ? (PRESALE ? `Pré-venda · acesso ${LAUNCH_DAY_LABEL}` : "Turma pioneira") : "Viva o seu Chamado"}
            </p>
            <p className="text-base font-bold text-mint tabular-nums leading-tight">
              {SELLING ? PRICE : "Turma pioneira"}
            </p>
          </div>
          {SELLING ? (
            <a
              href={HOTMART_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-mint text-navy text-sm font-bold rounded-xl shadow-mint"
            >
              {PRESALE ? "Garantir vaga" : "Comprar"}
            </a>
          ) : (
            <Link
              to="#comprar"
              onClick={() => document.querySelector("#comprar")?.scrollIntoView({ behavior: "smooth" })}
              className="shrink-0 inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-mint text-navy text-sm font-bold rounded-xl shadow-mint"
            >
              Lista de espera
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CursoVivaSeuChamado;
