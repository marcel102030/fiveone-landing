import { useEffect, useState, useRef } from "react";
// useBlocker removido — incompatível com BrowserRouter (requer Data Router)
import InputMask from "react-input-mask";
import { CategoryEnum, ChoiceCategory, type Statement } from "../types/quiz";
// @ts-ignore
// @ts-ignore


import { BsInfoCircleFill } from "react-icons/bs";
import { FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";



import logo from "../../../assets/images/logo-fiveone-white.png";
import mestreIcon from "../../../assets/images/icons/mestre.png";
import pastorIcon from "../../../assets/images/icons/pastor.png";
import profetaIcon from "../../../assets/images/icons/profeta.png";
import apostoloIcon from "../../../assets/images/icons/apostolo.png";
import evangelistaIcon from "../../../assets/images/icons/evangelista.png";
import escolaFiveOne from "../../../assets/images/escola-fiveone.jpeg";

import { generateMinisterialPdf } from "../../../shared/utils/pdfGenerators/ministerialPdf";
import {
  sfx,
  confettiBurst,
  startAmbient,
  stopAmbient,
  fxEnabled,
  setFxEnabled,
  musicPref,
  setMusicPref,
} from "../utils/quizFx";
import { makeQrDataUrl } from "../utils/qr";

// Instagram do Marcelo (perfil principal a converter)
const IG_HANDLE = "marcelojunior.fiveone";
const IG_URL = "https://www.instagram.com/marcelojunior.fiveone/";


import { buildCounterbalancedComparisons, categoryMetadata, type ComparisonPair } from "../data/questions";

import "./Quiz.css";
import TrainingFormats from "../components/TrainingFormats";
import "../components/TrainingFormats.css";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// === Helpers (Passo 3) ===
interface EmailScoreItem { category: string; score: number }

async function sendResultsEmail(
  payload: {
    name: string;
    email: string;
    phone: string;
    scores: EmailScoreItem[];
    pdfBase64?: string;
    filename?: string;
    pdfs?: Array<{ filename: string; base64: string }>;
  }
) {
  try {
    const res = await fetch("/api/send-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        scores: payload.scores,
        ...(payload.pdfs && payload.pdfs.length > 0
          ? { pdfs: payload.pdfs }
          : payload.pdfBase64 && payload.filename
            ? { pdf: { filename: payload.filename, base64: payload.pdfBase64 } }
            : {}
        ),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("/api/send-quiz error:", data);
      return { ok: false, error: data } as const;
    }
    return { ok: true, id: data?.id } as const;
  } catch (e) {
    console.error("sendResultsEmail exception:", e);
    return { ok: false, error: e } as const;
  }
}

function computeScoresForEmail(categoryScores: Record<CategoryEnum, number>): EmailScoreItem[] {
  const total = Object.values(categoryScores).reduce((s, v) => s + v, 0);
  return Object.entries(categoryScores)
    .map(([cat, val]) => ({ category: String(cat), score: total > 0 ? Math.round((val / total) * 100) : 0 }))
    .sort((a, b) => b.score - a.score);
}

// === Helpers de tracking ===
function detectSource(churchCtx: { churchSlug?: string; churchId?: string }): 'direct' | 'church_invite' | 'qr_code' | 'organic' {
  if (churchCtx.churchSlug || churchCtx.churchId) return 'church_invite';
  const hashQuery = window.location.hash.includes('?')
    ? new URLSearchParams(window.location.hash.split('?')[1])
    : null;
  const src = new URL(window.location.href).searchParams.get('source') ?? hashQuery?.get('source');
  if (src === 'qr') return 'qr_code';
  return 'direct';
}

// === Helpers para igreja (URL) e envio backend ===
function getChurchFromURL() {
  if (typeof window === 'undefined') return { churchId: undefined, churchSlug: undefined };

  const { href, pathname, hash } = window.location;
  const url = new URL(href);

  let slugFromPath: string | undefined;
  let slugFromQuery: string | undefined;
  let idFromQuery: string | undefined;

  // --- Caminho normal (sem hash): /c/<slug> e query ?churchSlug= ...
  const m = pathname.match(/^\/c\/([^\/?#]+)/i);
  if (m) slugFromPath = decodeURIComponent(m[1]);

  slugFromQuery = url.searchParams.get('churchSlug') ?? undefined;
  idFromQuery = url.searchParams.get('church') ?? url.searchParams.get('churchId') ?? undefined;

  // --- Compat com links legados que ainda contenham hash (#/teste-dons?... ou #/c/<slug>?...)
  if (!slugFromPath && hash) {
    const hashStr = hash.startsWith('#') ? hash.slice(1) : hash;
    const [hashPath, hashQuery] = hashStr.split('?');

    const m2 = hashPath?.match(/^\/c\/([^\/?#]+)/i);
    if (m2) slugFromPath = decodeURIComponent(m2[1]);

    if (hashQuery) {
      const params = new URLSearchParams(hashQuery);
      slugFromQuery = slugFromQuery ?? (params.get('churchSlug') ?? undefined);
      idFromQuery = idFromQuery ?? (params.get('church') ?? params.get('churchId') ?? undefined);
    }
  }

  return {
    churchId: idFromQuery || undefined,
    churchSlug: slugFromPath ?? slugFromQuery,
  };
}

interface QuizAnswerPayload {
  step: number;
  statementAId: number;
  statementBId: number;
  choice: 'a' | 'b' | 'both' | 'none';
  timeMs?: number;
}

async function saveQuizResponseToServer(payload: {
  churchId?: string;
  churchSlug?: string;
  person?: { name?: string; email?: string; phone?: string };
  scores: Record<string, number>;
  rawScores?: Record<string, number>;
  totalPoints?: number;
  topDom: string;
  ties?: string[];
  startedAt?: string;
  completionSeconds?: number;
  source?: string;
  answers?: QuizAnswerPayload[];
  sessionId?: string;
  instrumentVersion?: number;
}): Promise<{ ok: boolean; result_token?: string }> {
  try {
    const res = await fetch('/api/quiz-store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('quiz-store error:', data);
      return { ok: false };
    }
    return { ok: true, result_token: data.result_token };
  } catch (err) {
    console.error('quiz-store exception:', err);
    return { ok: false };
  }
}

// === Persistência de progresso (I14) e recálculo de score ===
const PROGRESS_KEY = "fiveone_quiz_progress";

interface SavedProgress {
  v: number;
  comparisons: ComparisonPair[];
  currentQuestion: number;
  answers: QuizAnswerPayload[];
  scores: Record<CategoryEnum, number>;
  startedAt: number;
  sessionId: string | null;
}

function loadProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as SavedProgress;
    if (p?.v !== 2 || !Array.isArray(p.comparisons) || p.comparisons.length === 0) return null;
    if (typeof p.currentQuestion !== "number" || p.currentQuestion >= p.comparisons.length) return null;
    return p;
  } catch {
    return null;
  }
}

function saveProgress(p: SavedProgress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* storage cheio/indisponível — ignora */
  }
}

function clearProgress() {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    /* ignora */
  }
}

// Recalcula a pontuação a partir das respostas (fonte da verdade — permite Voltar).
function scoresFromAnswers(
  answers: QuizAnswerPayload[],
  comps: ComparisonPair[],
): Record<CategoryEnum, number> {
  const s: Record<CategoryEnum, number> = {
    [CategoryEnum.APOSTOLO]: 0,
    [CategoryEnum.PROFETA]: 0,
    [CategoryEnum.EVANGELISTA]: 0,
    [CategoryEnum.PASTOR]: 0,
    [CategoryEnum.MESTRE]: 0,
  };
  answers.forEach((a) => {
    const comp = comps[a.step - 1];
    if (!comp) return;
    if (a.choice === "a") s[comp.statement1.category] += 1;
    else if (a.choice === "b") s[comp.statement2.category] += 1;
    else if (a.choice === "both") {
      s[comp.statement1.category] += 1;
      s[comp.statement2.category] += 1;
    }
  });
  return s;
}

// === Cores, frases e radar ===
const DOM_COLORS: Record<CategoryEnum, string> = {
  [CategoryEnum.APOSTOLO]:    '#1b6ea5',
  [CategoryEnum.PROFETA]:     '#a80d0d',
  [CategoryEnum.EVANGELISTA]: '#cfb012',
  [CategoryEnum.PASTOR]:      '#9B59B6',
  [CategoryEnum.MESTRE]:      '#2f994a',
};

const DOM_PHRASES: Record<CategoryEnum, string> = {
  [CategoryEnum.APOSTOLO]:    'Você tem visão estratégica e paixão por abrir novos caminhos.',
  [CategoryEnum.PROFETA]:     'Você é sensível à voz de Deus e movido por autenticidade espiritual.',
  [CategoryEnum.EVANGELISTA]: 'Você é movido pelo desejo de alcançar e transformar vidas.',
  [CategoryEnum.PASTOR]:      'Você tem coração para cuidar e caminhar ao lado das pessoas.',
  [CategoryEnum.MESTRE]:      'Você tem paixão pelo ensino da Palavra e pela formação de discípulos.',
};

const RADAR_ANGLES: Record<CategoryEnum, number> = {
  [CategoryEnum.APOSTOLO]:    -90,
  [CategoryEnum.PROFETA]:     -18,
  [CategoryEnum.EVANGELISTA]:  54,
  [CategoryEnum.PASTOR]:      126,
  [CategoryEnum.MESTRE]:      198,
};

function toRad(deg: number) { return (deg * Math.PI) / 180; }
function radarPt(cx: number, cy: number, r: number, angleDeg: number) {
  return { x: cx + r * Math.cos(toRad(angleDeg)), y: cy + r * Math.sin(toRad(angleDeg)) };
}

const RadarChart = ({ scores }: { scores: Record<CategoryEnum, number> }) => {
  const cx = 140, cy = 140, maxR = 110;
  const cats = Object.values(CategoryEnum);
  const points = cats.map((c) => {
    const pct = scores[c] ?? 0;
    const r = (pct / 100) * maxR;
    return radarPt(cx, cy, r, RADAR_ANGLES[c]);
  });
  const polygon = points.map((p) => `${p.x},${p.y}`).join(' ');
  const gridLevels = [25, 50, 75, 100];
  return (
    <svg viewBox="0 0 280 280" className="radar-chart" aria-hidden="true">
      {gridLevels.map((lvl) => {
        const gridPts = cats.map((c) => radarPt(cx, cy, (lvl / 100) * maxR, RADAR_ANGLES[c]));
        return (
          <polygon
            key={lvl}
            points={gridPts.map((p) => `${p.x},${p.y}`).join(' ')}
            className="radar-grid"
          />
        );
      })}
      {cats.map((c) => {
        const outer = radarPt(cx, cy, maxR, RADAR_ANGLES[c]);
        return <line key={c} x1={cx} y1={cy} x2={outer.x} y2={outer.y} className="radar-axis" />;
      })}
      <polygon points={polygon} className="radar-score" />
      {cats.map((c, i) => {
        const pt = points[i];
        return (
          <circle
            key={c}
            cx={pt.x} cy={pt.y} r={4}
            fill={DOM_COLORS[c]}
            stroke="#fff"
            strokeWidth={1.5}
          />
        );
      })}
      {cats.map((c) => {
        const labelPt = radarPt(cx, cy, maxR + 22, RADAR_ANGLES[c]);
        return (
          <text key={c} x={labelPt.x} y={labelPt.y} className="radar-label" textAnchor="middle" dominantBaseline="middle">
            {c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()}
          </text>
        );
      })}
    </svg>
  );
};

const DOM_NAMES: Record<CategoryEnum, string> = {
  [CategoryEnum.APOSTOLO]:    'Apóstolo',
  [CategoryEnum.PROFETA]:     'Profeta',
  [CategoryEnum.EVANGELISTA]: 'Evangelista',
  [CategoryEnum.PASTOR]:      'Pastor',
  [CategoryEnum.MESTRE]:      'Mestre',
};

const gtag = window.gtag;


const categoryIcons: Record<CategoryEnum, string> = {
  [CategoryEnum.APOSTOLO]: apostoloIcon,
  [CategoryEnum.PROFETA]: profetaIcon,
  [CategoryEnum.EVANGELISTA]: evangelistaIcon,
  [CategoryEnum.PASTOR]: pastorIcon,
  [CategoryEnum.MESTRE]: mestreIcon,
};

const TOTAL_QUESTIONS = 50;

// Milestone labels every 10 steps
const MILESTONES = [10, 20, 30, 40, 50];

const ACCORDION_ITEMS = [
  {
    title: 'Sobre o Teste',
    content: 'Inspirado em Efésios 4:11-13, onde Paulo ensina que Cristo concedeu dons ministeriais à Igreja: apóstolos, profetas, evangelistas, pastores e mestres — para edificar o Corpo de Cristo e promover unidade da fé.',
  },
  {
    title: 'Como funciona?',
    content: 'Você verá 50 pares de afirmações. Para cada par, escolha a que mais te representa. Não há resposta certa ou errada — seja honesto para um resultado mais preciso.',
  },
  {
    title: 'O que vou descobrir?',
    content: 'Ao final, você receberá um perfil detalhado mostrando qual dos 5 dons ministeriais tem maior expressão em você, com percentuais, gráfico radar e PDF para guardar ou compartilhar.',
  },
];

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [categoryScores, setCategoryScores] = useState<
    Record<CategoryEnum, number>
  >({
    [CategoryEnum.APOSTOLO]: 0,
    [CategoryEnum.PROFETA]: 0,
    [CategoryEnum.EVANGELISTA]: 0,
    [CategoryEnum.PASTOR]: 0,
    [CategoryEnum.MESTRE]: 0,
  });
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [comparisons, setComparisons] = useState<ComparisonPair[]>([]);
  const [currentPair, setCurrentPair] = useState<ComparisonPair | null>(null);
  const [savedProgress, setSavedProgress] = useState<SavedProgress | null>(null);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    submitted: false,
  });
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    phone: false,
  });
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ChoiceCategory | null>(null);
  const [showSelectWarning, setShowSelectWarning] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  // Experiência: som/música + micro-celebrações
  const [fxOn, setFxOn] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [celebration, setCelebration] = useState<{ title: string; sub: string } | null>(null);
  const celebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Soft-gate de Instagram antes de revelar o resultado
  const [resultUnlocked, setResultUnlocked] = useState(false);
  const trackFollow = (where: string) => {
    if (typeof gtag === "function") {
      gtag("event", "instagram_follow_click", { event_category: "quiz", event_label: where });
    }
  };
  const openInstagram = () => {
    trackFollow("gate");
    window.open(IG_URL, "_blank", "noopener");
  };

  // Inicializa preferências de som/música; retoma música no 1º gesto; limpa ao sair
  useEffect(() => {
    setFxOn(fxEnabled());
    const wantsMusic = musicPref();
    setMusicOn(wantsMusic);
    const resume = () => {
      if (musicPref()) startAmbient();
      window.removeEventListener("pointerdown", resume);
    };
    if (wantsMusic) window.addEventListener("pointerdown", resume, { once: true });
    return () => {
      window.removeEventListener("pointerdown", resume);
      stopAmbient();
      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
    };
  }, []);

  const toggleFx = () => {
    const next = !fxOn;
    setFxOn(next);
    setFxEnabled(next);
    if (next) sfx.sample();
  };
  const toggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    setMusicPref(next);
    if (next) startAmbient();
    else stopAmbient();
  };
  const triggerCelebration = (title: string, sub: string) => {
    setCelebration({ title, sub });
    confettiBurst();
    sfx.milestone();
    if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
    celebrationTimerRef.current = setTimeout(() => setCelebration(null), 1900);
  };
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showEmailInfo, setShowEmailInfo] = useState(false);
  const [emailInfoLeaving, setEmailInfoLeaving] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [resultToken, setResultToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const quizStartedAtRef = useRef<number>(0);
  const questionStartedAtRef = useRef<number>(0);
  const answersRef = useRef<QuizAnswerPayload[]>([]);
  // Instrumento vindo do banco (I8) — com fallback pro hardcoded (data/questions.ts)
  const remoteStatementsRef = useRef<Record<CategoryEnum, Statement[]> | null>(null);
  const instrumentVersionRef = useRef<number>(2);

  // New UX state
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const [animatedScores, setAnimatedScores] = useState<Record<CategoryEnum, number>>({
    [CategoryEnum.APOSTOLO]: 0,
    [CategoryEnum.PROFETA]: 0,
    [CategoryEnum.EVANGELISTA]: 0,
    [CategoryEnum.PASTOR]: 0,
    [CategoryEnum.MESTRE]: 0,
  });
  const [revealFull, setRevealFull] = useState(false);

  const quizTopRef = useRef<HTMLDivElement | null>(null);
  const nextStepButtonRef = useRef<HTMLButtonElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const churchCtx = getChurchFromURL();
  const isInviteLink = Boolean(churchCtx.churchSlug);

  // Blocker removido — useBlocker requer Data Router (incompatível com BrowserRouter)

  const [churchInfo, setChurchInfo] = useState<{ id?: string; name?: string; slug?: string } | null>(null);

  useEffect(() => {
    if (!isInviteLink && !churchCtx.churchId) return;

    let aborted = false;
    (async () => {
      try {
        const res = await fetch('/api/church-list');
        if (!res.ok) return;
        const data = await res.json();
        const rows: any[] = Array.isArray(data?.rows) ? data.rows : (Array.isArray(data) ? data : []);
        const bySlug = churchCtx.churchSlug
          ? rows.find((r) => (r?.slug || '').toLowerCase() === String(churchCtx.churchSlug).toLowerCase())
          : undefined;
        const byId = !bySlug && churchCtx.churchId
          ? rows.find((r) => String(r?.id) === String(churchCtx.churchId))
          : undefined;
        const found = bySlug || byId || null;
        if (!aborted) setChurchInfo(found ? { id: found.id, name: found.name, slug: found.slug } : null);
      } catch (e) {
        console.warn('Falha ao carregar church-list para banner do quiz:', e);
      }
    })();

    return () => { aborted = true; };
  }, [isInviteLink, churchCtx.churchSlug, churchCtx.churchId]);

  const confirmLeave = () => {};
  const cancelLeave = () => {};

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (quizStarted && !showResults) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [quizStarted, showResults]);

  useEffect(() => {
    const img = new Image();
    img.src = logo;
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute("content") || "";
    document.title = "Teste dos 5 Ministérios — Descubra seu Dom (Apóstolo, Profeta, Evangelista, Pastor, Mestre) | Five One";
    description?.setAttribute(
      "content",
      "Faça o Teste dos 5 Ministérios do Five One e descubra seu dom ministerial — Apóstolo, Profeta, Evangelista, Pastor ou Mestre. Baseado em Efésios 4:11-13. Gratuito, ~10 minutos, com PDF de resultado."
    );
    return () => {
      document.title = previousTitle;
      if (previousDescription) description?.setAttribute("content", previousDescription);
    };
  }, []);

  useEffect(() => {
    if (quizStarted && quizTopRef.current) {
      quizTopRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [quizStarted]);

  // Detecta progresso salvo (I14) ao montar — habilita "Continuar de onde parou"
  useEffect(() => {
    setSavedProgress(loadProgress());
  }, []);

  // Carrega as afirmações do banco (I8); se falhar, usa o fallback hardcoded
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch("/api/quiz-statements");
        if (!res.ok) return;
        const data = await res.json();
        if (aborted || !data?.ok || !Array.isArray(data.statements)) return;
        const grouped: Record<CategoryEnum, Statement[]> = {
          [CategoryEnum.APOSTOLO]: [],
          [CategoryEnum.PROFETA]: [],
          [CategoryEnum.EVANGELISTA]: [],
          [CategoryEnum.PASTOR]: [],
          [CategoryEnum.MESTRE]: [],
        };
        for (const s of data.statements as Statement[]) {
          const c = s.category as CategoryEnum;
          if (grouped[c]) grouped[c].push({ id: s.id, category: c, text: s.text });
        }
        // Só usa o banco se todos os dons tiverem afirmações suficientes (>= 20)
        const enough = Object.values(CategoryEnum).every((c) => grouped[c].length >= 20);
        if (enough) {
          remoteStatementsRef.current = grouped;
          if (typeof data.instrumentVersion === "number") instrumentVersionRef.current = data.instrumentVersion;
        }
      } catch {
        /* mantém fallback hardcoded */
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  // Count-up animation for result scores
  useEffect(() => {
    if (!userInfo.submitted) return;
    const totalScore = Object.values(categoryScores).reduce((s, v) => s + v, 0);
    const targets: Record<CategoryEnum, number> = {} as Record<CategoryEnum, number>;
    Object.entries(categoryScores).forEach(([k, v]) => {
      targets[k as CategoryEnum] = totalScore > 0 ? Math.round((v / totalScore) * 100) : 0;
    });
    let start: number | null = null;
    const duration = 1200;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current: Record<CategoryEnum, number> = {} as Record<CategoryEnum, number>;
      Object.entries(targets).forEach(([k, target]) => {
        current[k as CategoryEnum] = Math.round(target * eased);
      });
      setAnimatedScores(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    const timer = setTimeout(() => setRevealFull(true), 1800);
    return () => clearTimeout(timer);
  }, [userInfo.submitted]);

  const handleStartQuiz = () => {
    // Constrói o instrumento contrabalanceado (50 comparações, posição randomizada)
    // Fonte: banco (I8) se disponível; senão, fallback hardcoded.
    const built = buildCounterbalancedComparisons(remoteStatementsRef.current ?? undefined);
    setComparisons(built);
    setCurrentPair(built[0] ?? null);
    setCurrentQuestion(0);
    answersRef.current = [];
    setCategoryScores({
      [CategoryEnum.APOSTOLO]: 0,
      [CategoryEnum.PROFETA]: 0,
      [CategoryEnum.EVANGELISTA]: 0,
      [CategoryEnum.PASTOR]: 0,
      [CategoryEnum.MESTRE]: 0,
    });
    clearProgress();
    setSavedProgress(null);

    setQuizStarted(true);
    quizStartedAtRef.current = Date.now();
    questionStartedAtRef.current = Date.now();
    const ctx = getChurchFromURL();
    const source = detectSource(ctx);
    fetch('/api/quiz-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...ctx, source }),
    }).then((r) => r.json()).then((d) => {
      if (d.sessionId) setSessionId(d.sessionId);
    }).catch(() => {});
    if (typeof gtag === 'function') {
      gtag('event', 'quiz_start', {
        event_category: 'quiz',
        event_label: 'Quiz dos 5 Ministérios',
      });
    }
  };

  // Retoma o teste de onde parou (I14)
  const handleResume = () => {
    const p = savedProgress;
    if (!p) {
      handleStartQuiz();
      return;
    }
    setComparisons(p.comparisons);
    setCurrentQuestion(p.currentQuestion);
    setCurrentPair(p.comparisons[p.currentQuestion] ?? null);
    answersRef.current = Array.isArray(p.answers) ? p.answers : [];
    setCategoryScores(p.scores);
    setSessionId(p.sessionId ?? null);
    quizStartedAtRef.current = p.startedAt || Date.now();
    questionStartedAtRef.current = Date.now();
    setSavedProgress(null);
    setQuizStarted(true);
  };

  const onHandleChoice = (chosenCategory: ChoiceCategory) => {
    setTransitioning(true);
    sfx.advance();
    const pair = currentPair!;
    const timeMs = Date.now() - questionStartedAtRef.current;
    const step = currentQuestion + 1;

    setTimeout(() => {
      let choice: 'a' | 'b' | 'both' | 'none';
      if (chosenCategory === 'ambas') choice = 'both';
      else if (chosenCategory === 'nenhuma') choice = 'none';
      else if (chosenCategory === pair.statement1.category) choice = 'a';
      else choice = 'b';

      // Registra a resposta desta etapa de forma idempotente (permite Voltar e refazer)
      const answers = answersRef.current.filter((a) => a.step !== step);
      answers.push({ step, statementAId: pair.statement1.id, statementBId: pair.statement2.id, choice, timeMs });
      answers.sort((a, b) => a.step - b.step);
      answersRef.current = answers;

      if (step % 10 === 0 && sessionId) {
        fetch('/api/quiz-session', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, lastStep: step }),
        }).catch(() => {});
      }

      questionStartedAtRef.current = Date.now();

      // Pontuação recalculada a partir das respostas (consistente com Voltar)
      const newScores = scoresFromAnswers(answersRef.current, comparisons);
      setCategoryScores(newScores);

      const isLast = currentQuestion >= comparisons.length - 1;
      if (isLast) {
        if (typeof gtag === "function") {
          gtag("event", "quiz_completed", {
            event_category: "quiz",
            event_label: "Quiz dos 5 Ministérios",
          });
        }
        sfx.finish();
        stopAmbient();
        clearProgress();
        setShowResults(true);
        setTransitioning(false);
        return;
      }

      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      setCurrentPair(comparisons[nextIndex] ?? null);

      // Micro-celebração ao cruzar 25% / 50% / 75% / 90%
      const totalQ = comparisons.length || TOTAL_QUESTIONS;
      const newStep = nextIndex + 1;
      const marks = [
        { frac: 0.25, title: "25% concluído", sub: "Ótimo ritmo — siga assim ✨" },
        { frac: 0.5, title: "Metade do caminho! 🔥", sub: "Você está indo muito bem" },
        { frac: 0.75, title: "75% concluído", sub: "Reta final chegando 💪" },
        { frac: 0.9, title: "Quase lá!", sub: "Faltam poucas etapas 🎯" },
      ];
      const hit = marks.find((m) => newStep === Math.round(totalQ * m.frac));
      if (hit) triggerCelebration(hit.title, hit.sub);

      // Persiste progresso para retomar depois (I14)
      saveProgress({
        v: 2,
        comparisons,
        currentQuestion: nextIndex,
        answers: answersRef.current,
        scores: newScores,
        startedAt: quizStartedAtRef.current,
        sessionId,
      });

      setTransitioning(false);
    }, 300);
  };

  // Voltar uma etapa (I13) — pré-seleciona a resposta anterior
  const handleBack = () => {
    if (currentQuestion <= 0 || transitioning) return;
    const prevIndex = currentQuestion - 1;
    const prevPair = comparisons[prevIndex];
    const prevAnswer = answersRef.current.find((a) => a.step === prevIndex + 1);
    setCurrentQuestion(prevIndex);
    setCurrentPair(prevPair ?? null);
    if (prevAnswer && prevPair) {
      setSelectedCategory(
        prevAnswer.choice === "both"
          ? "ambas"
          : prevAnswer.choice === "none"
            ? "nenhuma"
            : prevAnswer.choice === "a"
              ? prevPair.statement1.category
              : prevPair.statement2.category,
      );
    } else {
      setSelectedCategory(null);
    }
    setShowSelectWarning(false);
  };

  const onHandleReset = () => {
    setQuizStarted(false);
    setShowResults(false);
    setCurrentQuestion(0);
    setCurrentPair(null);
    setComparisons([]);
    clearProgress();
    setSavedProgress(loadProgress());
    setSessionId(null);
    setResultToken(null);
    answersRef.current = [];
    quizStartedAtRef.current = 0;
    questionStartedAtRef.current = 0;
    setOpenAccordion(0);
    setRevealFull(false);
    setIsSubmitting(false);
    setConsent(false);
    setConsentError(false);
    setAnimatedScores({
      [CategoryEnum.APOSTOLO]: 0,
      [CategoryEnum.PROFETA]: 0,
      [CategoryEnum.EVANGELISTA]: 0,
      [CategoryEnum.PASTOR]: 0,
      [CategoryEnum.MESTRE]: 0,
    });
    setCategoryScores(
      Object.values(CategoryEnum).reduce(
        (acc, category) => ({ ...acc, [category]: 0 }),
        {} as Record<CategoryEnum, number>
      )
    );
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      const totalScore = Object.values(categoryScores).reduce((sum, val) => sum + val, 0);
      if (totalScore <= 0) {
        alert('Erro ao gerar PDF. Não foi possível calcular seu Dom principal.');
        return;
      }
      const scoresByDom: Record<string, number> = {};
      Object.entries(categoryScores).forEach(([k, v]) => {
        scoresByDom[k] = (Number(v) / totalScore) * 100;
      });
      const hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
      const igQr = await makeQrDataUrl(IG_URL);
      await generateMinisterialPdf(userInfo.name, hoje, scoresByDom, true, igQr ?? undefined);

      setShowDownloadSuccess(true);
      setTimeout(() => setShowDownloadSuccess(false), 8000);
    } catch (err) {
      setIsGeneratingPDF(false);
      alert('Ocorreu um erro ao gerar o PDF. Tente novamente.');
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShareImage = async () => {
    const totalScore = Object.values(categoryScores).reduce((s, v) => s + v, 0);
    const sorted = Object.entries(categoryScores).sort((a, b) => b[1] - a[1]);
    const topCatKey = sorted[0]?.[0] as CategoryEnum | undefined;
    if (!topCatKey) return;

    const pct = totalScore > 0 ? Math.round((sorted[0][1] / totalScore) * 100) : 0;
    const color = DOM_COLORS[topCatKey];
    const name = DOM_NAMES[topCatKey];
    const phrase = DOM_PHRASES[topCatKey];

    const SIZE = 1080;
    const canvas = document.createElement('canvas');
    canvas.width = SIZE; canvas.height = SIZE;
    const ctx = canvas.getContext('2d')!;

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, SIZE);
    bg.addColorStop(0, '#0d1b2a');
    bg.addColorStop(1, '#0a1520');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Top color bar
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, SIZE, 10);

    // Dom icon
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = categoryIcons[topCatKey];
      img.onload = () => {
        ctx.save();
        ctx.filter = 'brightness(0) invert(1)';
        ctx.globalAlpha = 0.85;
        ctx.drawImage(img, SIZE / 2 - 70, 160, 140, 140);
        ctx.restore();
        resolve();
      };
      img.onerror = () => resolve();
    });

    // Percentage
    ctx.fillStyle = color;
    ctx.font = 'bold 180px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${pct}%`, SIZE / 2, 460);

    // Dom name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 90px system-ui, sans-serif';
    ctx.fillText(name, SIZE / 2, 580);

    // Phrase (word wrap)
    ctx.fillStyle = '#9ab0bc';
    ctx.font = '38px system-ui, sans-serif';
    const words = phrase.split(' ');
    let line = '';
    let y = 670;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > SIZE - 160) {
        ctx.fillText(line, SIZE / 2, y);
        line = word;
        y += 52;
      } else { line = test; }
    }
    if (line) ctx.fillText(line, SIZE / 2, y);

    // Divider
    ctx.strokeStyle = 'rgba(100,255,218,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(120, 860); ctx.lineTo(SIZE - 120, 860);
    ctx.stroke();

    // Branding
    ctx.fillStyle = '#64ffda';
    ctx.font = 'bold 32px system-ui, sans-serif';
    ctx.fillText('fiveonemovement.com/descubra-seu-dom', SIZE / 2, 940);
    ctx.fillStyle = '#4a6572';
    ctx.font = '26px system-ui, sans-serif';
    ctx.fillText('Quiz dos 5 Ministérios — Five One', SIZE / 2, 990);

    // Download or native share
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `resultado-${name.toLowerCase()}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: `Meu Dom: ${name}` }); return; } catch { /* fallback */ }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = file.name; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }, 'image/png');
  };

  // ===== INTRO SCREEN =====
  if (!quizStarted) {
    return (
      <section className="quiz-section" style={{ position: 'relative', overflow: 'hidden' }}>

        {/* ── Camada decorativa: ícones dos 5 ministérios no fundo ── */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>

          {/* Orbs de glow mais intensos */}
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 700, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(100,255,218,0.10) 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: 650, height: 550, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(59,130,246,0.09) 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', top: '40%', left: '30%', width: 800, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(100,255,218,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }} />
          <div style={{ position: 'absolute', top: '20%', right: '30%', width: 500, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />

          {/* Lateral esquerda — ícones empilhados */}
          <img src={apostoloIcon}    alt="" style={{ position: 'absolute', top: '6%',    left: '2%',   width: 110, opacity: 0.10, filter: 'brightness(0) invert(1)', transform: 'rotate(-12deg)' }} />
          <img src={evangelistaIcon} alt="" style={{ position: 'absolute', top: '30%',   left: '1%',   width: 90,  opacity: 0.08, filter: 'brightness(0) invert(1)', transform: 'rotate(8deg)'  }} />
          <img src={mestreIcon}      alt="" style={{ position: 'absolute', top: '58%',   left: '2.5%', width: 100, opacity: 0.09, filter: 'brightness(0) invert(1)', transform: 'rotate(-6deg)' }} />
          <img src={pastorIcon}      alt="" style={{ position: 'absolute', bottom: '6%', left: '1.5%', width: 85,  opacity: 0.07, filter: 'brightness(0) invert(1)', transform: 'rotate(14deg)' }} />

          {/* Lateral direita — ícones empilhados */}
          <img src={profetaIcon}     alt="" style={{ position: 'absolute', top: '8%',    right: '2%',   width: 115, opacity: 0.10, filter: 'brightness(0) invert(1)', transform: 'rotate(14deg)'  }} />
          <img src={pastorIcon}      alt="" style={{ position: 'absolute', top: '34%',   right: '1%',   width: 95,  opacity: 0.08, filter: 'brightness(0) invert(1)', transform: 'rotate(-10deg)' }} />
          <img src={apostoloIcon}    alt="" style={{ position: 'absolute', top: '62%',   right: '2.5%', width: 100, opacity: 0.09, filter: 'brightness(0) invert(1)', transform: 'rotate(7deg)'   }} />
          <img src={evangelistaIcon} alt="" style={{ position: 'absolute', bottom: '8%', right: '1.5%', width: 80,  opacity: 0.07, filter: 'brightness(0) invert(1)', transform: 'rotate(-15deg)' }} />

          {/* Centro do fundo — ícones grandes e muito sutis como wallpaper */}
          <img src={mestreIcon}      alt="" style={{ position: 'absolute', top: '5%',    left: '12%',  width: 220, opacity: 0.035, filter: 'brightness(0) invert(1)', transform: 'rotate(-25deg)' }} />
          <img src={profetaIcon}     alt="" style={{ position: 'absolute', top: '5%',    right: '12%', width: 200, opacity: 0.03,  filter: 'brightness(0) invert(1)', transform: 'rotate(20deg)'  }} />
          <img src={evangelistaIcon} alt="" style={{ position: 'absolute', bottom: '5%', left: '14%',  width: 210, opacity: 0.035, filter: 'brightness(0) invert(1)', transform: 'rotate(18deg)'  }} />
          <img src={apostoloIcon}    alt="" style={{ position: 'absolute', bottom: '5%', right: '13%', width: 200, opacity: 0.03,  filter: 'brightness(0) invert(1)', transform: 'rotate(-22deg)' }} />

          {/* Grid de pontos */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(100,255,218,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="content-container" style={{ position: 'relative', zIndex: 1 }}>
          {(churchCtx.churchSlug || churchCtx.churchId) && (
            <div className="church-banner-wrapper">
              <div className="church-banner" role="status" aria-live="polite">
                <span className="dot" aria-hidden="true" />
                Teste vinculado à igreja:{' '}
                <span className="slug">{churchInfo?.name || churchCtx.churchSlug || churchCtx.churchId}</span>
              </div>
            </div>
          )}

          <h1>Descubra o seu Dom Ministerial</h1>

          {/* 5 Dom icons */}
          <div className="dom-icons-row">
            {(Object.values(CategoryEnum) as CategoryEnum[]).map((cat) => (
              <div className="dom-icon-item" key={cat}>
                <img src={categoryIcons[cat]} alt={DOM_NAMES[cat]} />
                <span>{DOM_NAMES[cat]}</span>
              </div>
            ))}
          </div>

          {/* Info chips */}
          <div className="intro-chips">
            <span className="intro-chip">50 pares de afirmações</span>
            <span className="intro-chip">~10 minutos</span>
            <span className="intro-chip">Resultado com PDF</span>
          </div>

          {/* Retomar teste salvo (I14) */}
          {savedProgress && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", margin: "0 auto 1.25rem", maxWidth: 420 }}>
              <button
                onClick={handleResume}
                className="start-button"
                style={{ background: "#64ffda", color: "#052e16" }}
                aria-label="Continuar o teste de onde parou"
              >
                Continuar de onde parei (etapa {Math.min(savedProgress.currentQuestion + 1, savedProgress.comparisons.length)}/{savedProgress.comparisons.length})
              </button>
              <button
                onClick={handleStartQuiz}
                style={{ background: "none", border: "none", color: "#9ab0bc", fontSize: "0.85rem", textDecoration: "underline", cursor: "pointer" }}
              >
                Recomeçar do zero
              </button>
            </div>
          )}

          {/* Top CTA */}
          <div className="top-start-button-wrapper">
            <button
              onClick={handleStartQuiz}
              className="start-button pulse"
              aria-label="Iniciar o Teste (atalho superior)"
            >
              Começar Agora
            </button>
          </div>

          {/* Accordion */}
          <div className="intro-accordion">
            {ACCORDION_ITEMS.map((item, idx) => (
              <div className="accordion-item" key={idx}>
                <button
                  className="accordion-trigger"
                  onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}
                  aria-expanded={openAccordion === idx}
                >
                  {item.title}
                  <span className={`accordion-chevron${openAccordion === idx ? ' open' : ''}`}>▾</span>
                </button>
                {openAccordion === idx && (
                  <div className="accordion-content">
                    <p>{item.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="start-form">
            <button
              onClick={handleStartQuiz}
              className="start-button pulse"
              aria-label="Iniciar o Teste"
            >
              Quero Fazer o Teste
            </button>
          </div>
        </div>

        {!isInviteLink && (
          <>
            <div className="divider-line-only"></div>
            <TrainingFormats />
          </>
        )}
      </section>
    );
  }

  // ===== FORM SCREEN =====
  if (showResults && !userInfo.submitted) {
    // Dois dons de maior expressão para a prévia (linguagem calibrada, sem exagero)
    const previewSorted = Object.entries(categoryScores).sort((a, b) => b[1] - a[1]);
    const leadingDom = previewSorted[0] ? (previewSorted[0][0] as CategoryEnum) : null;
    const secondDom = previewSorted[1] ? (previewSorted[1][0] as CategoryEnum) : null;
    const anticipationPhrase = leadingDom
      ? `Suas respostas apontam ${DOM_NAMES[leadingDom]} como seu dom principal${secondDom ? `, seguido de ${DOM_NAMES[secondDom]}` : ''}. Preencha abaixo para ver o resultado completo — com ranking, gráfico e PDF.`
      : 'Preencha abaixo para ver seu resultado completo.';

    return (
      <section className="quiz-section">
        <div className="content-container">
          {/* M7: micro-celebração ao concluir as 50 etapas */}
          <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
            <span
              style={{ display: "inline-block", padding: "0.35rem 0.9rem", borderRadius: 999, background: "rgba(100,255,218,0.12)", border: "1px solid rgba(100,255,218,0.35)", color: "#64ffda", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.04em" }}
            >
              🎉 Você concluiu o teste!
            </span>
          </div>
          <h2>Quase lá!</h2>
          <p className="form-anticipation">{anticipationPhrase}</p>
          <div className="start-form">
            <div className="floating-field form-field-0">
              <input
                id="f-name"
                type="text"
                placeholder=" "
                value={userInfo.name}
                onChange={(e) => setUserInfo((prev) => ({ ...prev, name: e.target.value }))}
                onBlur={() => setFormErrors((prev) => ({ ...prev, name: !userInfo.name.trim() }))}
                className={`floating-input${formErrors.name ? ' input-error' : ''}`}
              />
              <label htmlFor="f-name" className="floating-label">Nome</label>
              {formErrors.name && <span className="error-msg">Preencha seu nome</span>}
            </div>

            <div className="floating-field form-field-1">
              <input
                id="f-email"
                type="email"
                placeholder=" "
                value={userInfo.email}
                onChange={(e) => setUserInfo((prev) => ({ ...prev, email: e.target.value }))}
                onBlur={() =>
                  setFormErrors((prev) => ({
                    ...prev,
                    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email),
                  }))
                }
                className={`floating-input${formErrors.email ? ' input-error' : ''}`}
              />
              <label htmlFor="f-email" className="floating-label">Email</label>
              {formErrors.email && <span className="error-msg">Digite um email válido</span>}
            </div>

            <div className={`floating-field form-field-2${userInfo.phone.replace(/\D/g, '').length > 0 ? ' has-value' : ''}`}>
              <InputMask
                mask="(99) 99999-9999"
                value={userInfo.phone}
                onChange={(e) => setUserInfo((prev) => ({ ...prev, phone: e.target.value }))}
                onBlur={() =>
                  setFormErrors((prev) => ({
                    ...prev,
                    phone: userInfo.phone.replace(/\D/g, "").length !== 11,
                  }))
                }
              >
                {(inputProps) => (
                  <input
                    {...inputProps}
                    id="f-phone"
                    type="tel"
                    inputMode="numeric"
                    className={`floating-input${formErrors.phone ? ' input-error' : ''}`}
                  />
                )}
              </InputMask>
              <label htmlFor="f-phone" className="floating-label">Telefone</label>
              {formErrors.phone && <span className="error-msg">Digite um telefone válido</span>}
            </div>

            <div className="consent-field" style={{ margin: "0.25rem 0 0.75rem" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", cursor: "pointer", fontSize: "0.85rem", color: "#cfd8dc", lineHeight: 1.45, textAlign: "left" }}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (e.target.checked) setConsentError(false);
                  }}
                  style={{ marginTop: "0.2rem", width: 18, height: 18, flexShrink: 0, accentColor: "#64ffda", cursor: "pointer" }}
                />
                <span>
                  Autorizo o uso dos meus dados para receber o resultado e comunicações do Five One, conforme a{" "}
                  <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer" style={{ color: "#64ffda", textDecoration: "underline" }}>
                    Política de Privacidade
                  </a>.
                </span>
              </label>
              {consentError && (
                <span className="error-msg" style={{ display: "block", marginTop: "0.35rem" }}>
                  Você precisa aceitar para ver o resultado.
                </span>
              )}
            </div>

            <div className="form-field-3">
              <button
                disabled={isSubmitting}
                className={`start-button${isSubmitting ? ' loading' : ''}`}
                onClick={() => {
                  const hasErrors = {
                    name: !userInfo.name.trim(),
                    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email),
                    phone: userInfo.phone.replace(/\D/g, "").length !== 11,
                  };
                  setFormErrors(hasErrors);
                  const consentMissing = !consent;
                  setConsentError(consentMissing);

                  if (!Object.values(hasErrors).some(Boolean) && !consentMissing) {
                    setIsSubmitting(true);
                    setShowEmailInfo(true);
                    setUserInfo((prev) => ({ ...prev, submitted: true }));

                    (async () => {
                      try {
                        const totalScore = Object.values(categoryScores).reduce((sum, val) => sum + val, 0);
                        if (totalScore <= 0) {
                          console.warn("Não foi possível calcular o Dom principal para envio por e-mail.");
                          return;
                        }

                        const scoresByDom: Record<string, number> = {};
                        Object.entries(categoryScores).forEach(([k, v]) => {
                          scoresByDom[k] = (Number(v) / totalScore) * 100;
                        });

                        const hoje = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
                        const igQr = await makeQrDataUrl(IG_URL);
                        const { base64, filename } = await generateMinisterialPdf(
                          userInfo.name,
                          hoje,
                          scoresByDom,
                          false,
                          igQr ?? undefined,
                        );

                        const scoresForEmail = computeScoresForEmail(categoryScores);
                        void sendResultsEmail({
                          name: userInfo.name,
                          email: userInfo.email,
                          phone: userInfo.phone,
                          scores: scoresForEmail,
                          pdfs: [{ filename, base64 }],
                        });
                      } catch (err) {
                        console.error("Falha ao gerar/enviar PDF(s):", err);
                      }
                    })();

                    (async () => {
                      try {
                        const totalScore = Object.values(categoryScores).reduce((s, v) => s + v, 0);
                        const scoresPercent: Record<string, number> = {};
                        Object.entries(categoryScores).forEach(([key, value]) => {
                          const pct = totalScore > 0 ? Math.round((Number(value) / totalScore) * 100) : 0;
                          scoresPercent[key] = isNaN(pct) ? 0 : pct;
                        });

                        const sortedRaw = Object.entries(categoryScores).sort((a, b) => b[1] - a[1]);
                        const topRawValue = sortedRaw[0]?.[1] ?? 0;
                        const ties = topRawValue > 0
                          ? sortedRaw.filter(([_, v]) => v === topRawValue).map(([k]) => k)
                          : [];
                        const topDom = sortedRaw[0]?.[0] ?? '';

                        const churchCtx = getChurchFromURL();
                        const source = detectSource(churchCtx);
                        const completionSeconds = quizStartedAtRef.current
                          ? Math.round((Date.now() - quizStartedAtRef.current) / 1000)
                          : undefined;

                        const result = await saveQuizResponseToServer({
                          ...churchCtx,
                          person: { name: userInfo.name, email: userInfo.email, phone: userInfo.phone },
                          scores: scoresPercent,
                          rawScores: Object.fromEntries(
                            Object.entries(categoryScores).map(([k, v]) => [k, v])
                          ),
                          totalPoints: totalScore,
                          topDom,
                          ties,
                          startedAt: quizStartedAtRef.current
                            ? new Date(quizStartedAtRef.current).toISOString()
                            : undefined,
                          completionSeconds,
                          source,
                          answers: answersRef.current,
                          sessionId: sessionId ?? undefined,
                          instrumentVersion: instrumentVersionRef.current,
                        });

                        if (result.ok && result.result_token) {
                          setResultToken(result.result_token);
                        }
                      } catch (e) {
                        console.error('Falha ao enviar resposta ao banco:', e);
                      }
                    })();

                    if (typeof gtag === "function") {
                      gtag("event", "quiz_form_submitted", {
                        event_category: "quiz",
                        event_label: "Quiz dos 5 Ministérios",
                        value: 1,
                      });
                    }
                  }
                }}
              >
                {isSubmitting ? 'Processando...' : 'Ver resultado'}
              </button>

              {/* Gatilho: seguir o Marcelo */}
              <div className="form-follow-nudge">
                <span>
                  Teste criado por <strong>@{IG_HANDLE}</strong>
                </span>
                <a
                  href={IG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="form-follow-link"
                  onClick={() => trackFollow("form")}
                >
                  <FaInstagram style={{ verticalAlign: "-2px", marginRight: 5 }} />
                  Seguir no Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // PDF toast
  const pdfToastBlock = (
    (isGeneratingPDF || showDownloadSuccess) && (
      <div
        style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          backgroundColor: "#32f2cf",
          color: "#003f2d",
          padding: "0.75rem 1.5rem",
          borderRadius: "8px",
          fontWeight: "bold",
          zIndex: 9999,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
        }}
      >
        {isGeneratingPDF
          ? "📄 Gerando PDF... Por favor, aguarde o download."
          : "✅ PDF gerado e baixado com sucesso!"}
      </div>
    )
  );

  // ===== SOFT-GATE: seguir o Instagram antes de revelar o resultado =====
  if (showResults && userInfo.submitted && !resultUnlocked) {
    const gSorted = Object.entries(categoryScores).sort((a, b) => b[1] - a[1]);
    const gLead = gSorted[0] ? (gSorted[0][0] as CategoryEnum) : null;
    const gDomName = gLead ? DOM_NAMES[gLead] : "o seu dom";
    return (
      <section className="quiz-section quiz-gate">
        <div className="content-container gate-card">
          <span className="gate-badge">🎉 Seu resultado está pronto!</span>
          <h2 className="gate-title">
            Você é <span className="gate-dom">{gDomName}</span>
          </h2>
          <p className="gate-text">
            Antes de ver o resultado completo, <strong>siga o Marcelo</strong> — toda semana ele ensina
            como desenvolver o seu dom de {gDomName}. Não perca o que vem por aí.
          </p>
          <button
            type="button"
            className="gate-follow-btn"
            onClick={() => {
              openInstagram();
              setResultUnlocked(true);
            }}
          >
            <FaInstagram style={{ marginRight: 8, verticalAlign: "-2px" }} />
            Seguir @{IG_HANDLE}
          </button>
          <button type="button" className="gate-skip" onClick={() => setResultUnlocked(true)}>
            Ver meu resultado →
          </button>
        </div>
      </section>
    );
  }

  // ===== RESULTS SCREEN =====
  if (showResults) {
    const totalScore = Object.values(categoryScores).reduce((sum, val) => sum + val, 0);

    const sortedScores = Object.entries(categoryScores)
      .map(([category, score]) => {
        const metadata = categoryMetadata.find((c) => c.id === category);
        const safeScore = totalScore > 0 ? (score / totalScore) * 100 : 0;
        if (!metadata || isNaN(safeScore)) return null;
        return { categoryEnum: category as CategoryEnum, score: safeScore, metadata };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .sort((a, b) => b.score - a.score);

    const topEntry = sortedScores[0];
    const topCat = topEntry?.categoryEnum;
    const secondEntry = sortedScores[1];
    const secondCat = secondEntry?.categoryEnum;
    const topPct = topEntry ? Math.round(topEntry.score) : 0;
    const secondPct = secondEntry ? Math.round(secondEntry.score) : 0;
    const gap = topPct - secondPct;
    const isTieTop = Boolean(topEntry && secondEntry && gap === 0);
    const profileNote = !topCat
      ? ''
      : isTieTop && secondCat
        ? `Empate técnico entre ${DOM_NAMES[topCat]} e ${DOM_NAMES[secondCat]} — dois dons em forte expressão.`
        : gap >= 8
          ? `${DOM_NAMES[topCat]} aparece como o seu dom predominante.`
          : gap >= 3 && secondCat
            ? `Seu dom principal é ${DOM_NAMES[topCat]}, com forte presença de ${DOM_NAMES[secondCat]}.`
            : secondCat
              ? `Perfil equilibrado: ${DOM_NAMES[topCat]} e ${DOM_NAMES[secondCat]} caminham juntos.`
              : `Seu dom principal é ${DOM_NAMES[topCat]}.`;

    // Scores as percent for radar
    const radarScores: Record<CategoryEnum, number> = {} as Record<CategoryEnum, number>;
    sortedScores.forEach(({ categoryEnum, score }) => {
      radarScores[categoryEnum] = Math.round(score);
    });

    return (
      <>
        {pdfToastBlock}
        {showEmailInfo && (
          <div className={`email-info-banner${emailInfoLeaving ? ' leave' : ''}`} aria-live="polite">
            <span className="icon">✉️</span>
            <span>
              Enviamos o seu resultado para <strong>{userInfo.email}</strong>.&nbsp;
              Verifique a sua <strong>Caixa de Entrada</strong> ou a pasta <strong>Spam/Lixo eletrônico</strong>.
              O PDF em anexo contém as características do seu Dom ministerial e os percentuais dos 5 dons.
            </span>
            <button
              type="button"
              onClick={() => {
                setEmailInfoLeaving(true);
                setTimeout(() => {
                  setShowEmailInfo(false);
                  setEmailInfoLeaving(false);
                }, 300);
              }}
              aria-label="Fechar aviso"
              className="ok-btn"
            >
              Ok
            </button>
          </div>
        )}
        <section className="Teste-section">
          <div className="content-container" id="quiz-result" ref={pdfRef}>
            <div className="results-header" style={{ marginTop: "6rem" }}>
              <h2>Parabéns, {userInfo.name}!</h2>
              <p>Seu perfil ministerial está pronto.</p>
            </div>

            {/* Hero dom card */}
            {topCat && (
              <div className={`hero-dom-card ${topCat}`}>
                <div className="hero-icon-wrap">
                  <img src={categoryIcons[topCat]} alt={DOM_NAMES[topCat]} className="hero-icon" />
                </div>
                <div style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#64ffda", fontWeight: 700, marginBottom: "0.2rem" }}>
                  {isTieTop ? "Dons principais (empate)" : "Seu dom principal"}
                </div>
                <div className="hero-name">
                  {isTieTop && secondCat ? `${DOM_NAMES[topCat]} & ${DOM_NAMES[secondCat]}` : DOM_NAMES[topCat]}
                </div>
                <div className="hero-pct">{animatedScores[topCat] ?? 0}%</div>
                <p className="hero-phrase">{DOM_PHRASES[topCat]}</p>
                {!isTieTop && secondCat && (
                  <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem", color: "#9ab0bc" }}>
                    Dom secundário: <strong style={{ color: "#cfd8dc" }}>{DOM_NAMES[secondCat]}</strong> ({animatedScores[secondCat] ?? 0}%)
                  </p>
                )}
              </div>
            )}

            {profileNote && (
              <p style={{ textAlign: "center", maxWidth: 620, margin: "1rem auto 0", color: "#cfd8dc", fontSize: "1rem", lineHeight: 1.6 }}>
                {profileNote}
              </p>
            )}

            {/* Radar chart + distribution bars */}
            <div className={`radar-section${revealFull ? ' reveal-full' : ''}`}>
              <h3 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--text-light-slate)' }}>
                Perfil dos 5 Dons
              </h3>
              <RadarChart scores={radarScores} />
            </div>

            <div className={`distribution-section${revealFull ? ' reveal-full' : ''}`}>
              {sortedScores.map(({ categoryEnum: cat }) => (
                <div className="dist-row" key={cat}>
                  <div className="dist-label">
                    <img src={categoryIcons[cat]} alt={DOM_NAMES[cat]} />
                    {DOM_NAMES[cat]}
                  </div>
                  <div className="dist-bar-bg">
                    <div
                      className={`dist-bar-fill ${cat}`}
                      style={{ width: `${animatedScores[cat] ?? 0}%` }}
                    >
                      <span>{animatedScores[cat] ?? 0}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p style={{ textAlign: "center", maxWidth: 560, margin: "1.25rem auto 0", color: "#7f98a6", fontSize: "0.82rem", lineHeight: 1.55 }}>
              Os percentuais são <strong>relativos entre os 5 dons</strong> (somam ~100%). O que mais importa é o seu <strong>ranking</strong> — a ordem dos dons —, não o número isolado.
            </p>

            <div className="down-arrow"></div>
          </div>

          <TrainingFormats />

          <div className="don-profile-wrapper">
            <h2
              style={{
                textAlign: "center",
                marginBottom: "2.5rem",
                marginTop: "5rem",
                fontSize: "2rem",
                color: "#ffffff",
              }}
            >
              Entenda seu Resultado
            </h2>
            <p
              style={{
                textAlign: "center",
                maxWidth: "750px",
                margin: "0 auto 3.5rem",
                fontSize: "1.15rem",
                lineHeight: "1.6",
                color: "#cfd8dc",
              }}
            >
              Os cinco dons ministeriais descritos em Efésios 4 — Apóstolo, Profeta, Evangelista, Pastor e Mestre — expressam dimensões únicas do ministério de Cristo distribuídas ao seu Corpo.
              A seguir, você encontrará uma explicação teológica de cada um desses dons, com base bíblica e doutrinária.
            </p>
            <div className="don-profile-cards">
              <div className={`don-card apostolo-card${topCat === CategoryEnum.APOSTOLO ? ' highlight-card' : ''}`}>
                <div className="don-card-header">
                  <img src={apostoloIcon} alt="Ícone do Apóstolo" className="don-icon" />
                  <h3>Apóstolo</h3>
                </div>
                <p>
                  O papel do apóstolo no Corpo de Cristo é de extrema importância. Ele amplia a visão da igreja, assegurando que cada membro cumpra seu papel de forma eficaz, restaurando princípios fundamentais e mantendo a igreja ancorada em bases sólidas.
                </p>
                <p>
                  Os apóstolos são desbravadores espirituais, frequentemente responsáveis por abrir novos caminhos, plantar igrejas e estabelecer fundamentos doutrinários. Sua liderança é marcada por coragem, visão estratégica e um profundo senso de missão.
                </p>
              </div>
              <div className={`don-card profeta-card${topCat === CategoryEnum.PROFETA ? ' highlight-card' : ''}`}>
                <div className="don-card-header">
                  <img src={profetaIcon} alt="Ícone do Profeta" className="don-icon" />
                  <h3>Profeta</h3>
                </div>
                <p>
                  O profeta é aquele que guarda a aliança. Sua principal função é garantir que a igreja permaneça fiel ao coração de Deus, confrontando desvios e chamando o povo de volta ao arrependimento e à intimidade com o Senhor.
                </p>
                <p>
                  Profetas são sensíveis à voz de Deus e muitas vezes têm discernimento aguçado sobre tempos, estações e situações espirituais. São chamados a proclamar a verdade com ousadia e a alinhar a igreja com os valores do Reino.
                </p>
              </div>
              <div className={`don-card evangelista-card${topCat === CategoryEnum.EVANGELISTA ? ' highlight-card' : ''}`}>
                <div className="don-card-header">
                  <img src={evangelistaIcon} alt="Ícone do Evangelista" className="don-icon" />
                  <h3>Evangelista</h3>
                </div>
                <p>
                  O evangelista é aquele que carrega no coração o anseio por alcançar os perdidos. Seu chamado está voltado à proclamação das boas novas de Jesus Cristo com paixão, clareza e compaixão.
                </p>
                <p>
                  Evangelistas movem a igreja para fora das quatro paredes, inspirando-a a viver de forma missionária. Têm a capacidade de conectar o evangelho com a vida real das pessoas e convidá-las a uma transformação genuína em Cristo.
                </p>
              </div>
              <div className={`don-card pastor-card${topCat === CategoryEnum.PASTOR ? ' highlight-card' : ''}`}>
                <div className="don-card-header">
                  <img src={pastorIcon} alt="Ícone do Pastor" className="don-icon" />
                  <h3>Pastor</h3>
                </div>
                <p>
                  O pastor é aquele que cuida, consola e caminha junto. Ele tem um coração voltado ao rebanho, guiando com empatia, proximidade e zelo.
                </p>
                <p>
                  Pastores promovem ambientes de cuidado e pertencimento dentro da igreja. Sua presença é marcada por serviço, escuta ativa e disposição para ajudar os outros a amadurecerem na fé.
                </p>
              </div>
              <div className={`don-card mestre-card${topCat === CategoryEnum.MESTRE ? ' highlight-card' : ''}`}>
                <div className="don-card-header">
                  <img src={mestreIcon} alt="Ícone do Mestre" className="don-icon" />
                  <h3>Mestre</h3>
                </div>
                <p>
                  O mestre é aquele que busca compreender e comunicar a verdade de Deus de forma clara e profunda. Tem paixão pelo ensino das Escrituras e pela formação espiritual da igreja.
                </p>
                <p>
                  Mestres ajudam a igreja a permanecer sólida na Palavra, combatendo falsas doutrinas e promovendo crescimento teológico. Sua influência molda o entendimento e a prática cristã.
                </p>
              </div>
            </div>
          </div>

          <section className="promo-escola-section">
            <div className="promo-escola-image">
              <img src={escolaFiveOne} alt="Movimento Five One" />
            </div>
            <div className="promo-escola-content">
              <h3>Descubra o Movimento Five One</h3>
              <p>
                Viva sua verdadeira identidade em Cristo. Descubra seu chamado, desenvolva seu dom
                ministerial e conecte-se com uma comunidade de aprendizado e propósito.
              </p>
              <a href="https://escolafiveone.hotmart.host/formacao-de-mestre-five-one-df44d8cd-3a6b-44b0-aaec-652290fc529a" target="_blank" rel="noopener noreferrer">
                Quero Fazer Parte
              </a>
            </div>
          </section>

          <div className="social-share">
            <p style={{ textAlign: "center", fontWeight: "bold", marginBottom: "1rem" }}>
              Nos siga nas redes sociais:
            </p>
            <div className="share-buttons" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="https://www.instagram.com/fiveone.oficial/"
                target="_blank"
                rel="noopener noreferrer"
                className="instagram"
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
                <span className="tooltip-share">Instagram</span>
              </a>
              <a
                href="https://www.tiktok.com/@fiveonemovement"
                target="_blank"
                rel="noopener noreferrer"
                className="tiktok"
                aria-label="TikTok"
              >
                <FaTiktok size={24} />
                <span className="tooltip-share">TikTok</span>
              </a>
              <a
                href="https://www.youtube.com/@Five_One_Movement"
                target="_blank"
                rel="noopener noreferrer"
                className="youtube"
                aria-label="YouTube"
                style={{ backgroundColor: "#FF0000", padding: "10px", borderRadius: "12px" }}
              >
                <FaYoutube size={24} color="#fff" />
              </a>
            </div>
          </div>

          {resultToken && (
            <div style={{ textAlign: "center", margin: "2rem 0 0.5rem" }}>
              <p style={{ color: "#cfd8dc", marginBottom: "0.5rem", fontSize: "0.95rem" }}>
                Salve o link abaixo para revisitar seu resultado a qualquer momento:
              </p>
              <div className="result-actions">
                <button
                  className="share-result-btn"
                  onClick={() => {
                    const url = `${window.location.origin}/resultado/${resultToken}`;
                    navigator.clipboard?.writeText(url).then(() => {
                      alert("Link copiado para a área de transferência!");
                    }).catch(() => {
                      window.prompt("Copie o link:", url);
                    });
                  }}
                >
                  🔗 Copiar link do resultado
                </button>
                <button className="share-result-btn" onClick={handleShareImage}>
                  🖼️ Salvar como imagem
                </button>
              </div>
            </div>
          )}

          <p className="pdf-download-note" style={{ textAlign: "center", marginTop: "3rem" }}>
            Clique para baixar um PDF com o seu resultado. Você pode guardar ou compartilhar!
          </p>
          <div className="pdf-download-wrapper">
            <button
              onClick={handleDownloadPDF}
              className="start-button"
              aria-label="Baixar resultado em PDF"
            >
              Baixar Resultado em PDF
            </button>
          </div>
          <button
            onClick={onHandleReset}
            className="reset-button"
            aria-label="Reiniciar o Teste"
            style={{ backgroundColor: "#314b56", color: "white", marginTop: "1.5rem" }}
          >
            Reiniciar
          </button>
        </section>
      </>
    );
  }

  if (typeof window === "undefined") return null;

  if (!currentPair || !currentPair.statement1 || !currentPair.statement2) {
    console.warn("Bloqueando renderização pois currentPair está incompleto:", currentPair);
    return null;
  }

  // ===== QUIZ QUESTION SCREEN =====
  return (
    <>
      {pdfToastBlock}

      {/* Barra de foco: logo + controles de som/música */}
      <div className="quiz-focus-bar">
        <div className="quiz-focus-inner">
          <a href="/" className="quiz-focus-logo" aria-label="Five One — voltar ao início">
            <img src={logo} alt="Five One" />
          </a>
          <div className="quiz-focus-controls">
            <button
              type="button"
              onClick={toggleFx}
              className={`focus-toggle${fxOn ? " on" : ""}`}
              aria-pressed={fxOn}
              title={fxOn ? "Desligar sons" : "Ligar sons"}
            >
              <span aria-hidden="true">{fxOn ? "🔊" : "🔈"}</span> Som
            </button>
            <button
              type="button"
              onClick={toggleMusic}
              className={`focus-toggle${musicOn ? " on" : ""}`}
              aria-pressed={musicOn}
              title={musicOn ? "Desligar música" : "Ligar música ambiente"}
            >
              <span aria-hidden="true">♪</span> Música
            </button>
          </div>
        </div>
      </div>

      {/* Overlay de micro-celebração */}
      {celebration && (
        <div className="quiz-celebration" role="status" aria-live="polite">
          <div className="quiz-celebration-card">
            <div className="quiz-celebration-title">{celebration.title}</div>
            <div className="quiz-celebration-sub">{celebration.sub}</div>
          </div>
        </div>
      )}

      <section className="quiz-section quiz-focus-active">
        <div className="content-container" ref={quizTopRef}>

          {/* Milestone progress */}
          <div className="milestone-wrapper">
            <div className="milestone-track">
              <div
                className="milestone-line-fill"
                style={{ width: `${((currentQuestion + 1) / TOTAL_QUESTIONS) * 100}%` }}
              />
              {MILESTONES.map((m) => {
                const passed = currentQuestion + 1 >= m;
                const current = currentQuestion + 1 === m;
                return (
                  <div
                    key={m}
                    className={`milestone-dot${passed ? ' passed' : ''}${current ? ' current' : ''}`}
                    style={{ left: `${(m / TOTAL_QUESTIONS) * 100}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* M1: contador discreto (aria-live anuncia a etapa) + M5: percentual */}
          <p
            aria-live="polite"
            style={{ marginTop: "1.25rem", marginBottom: "0.25rem", fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#7f98a6", fontWeight: 600 }}
          >
            Etapa {currentQuestion + 1} de {comparisons.length || TOTAL_QUESTIONS} ·{" "}
            {Math.round(((currentQuestion + 1) / (comparisons.length || TOTAL_QUESTIONS)) * 100)}%
          </p>

          {/* M1: a pergunta real ganha o destaque */}
          <h2 style={{ marginTop: "0.25rem", fontSize: "1.4rem" }}>
            Com qual afirmação você mais se identifica?
          </h2>

          <div
            className={`statement-container ${transitioning ? "slide-out" : "slide-in"}`}
            role="radiogroup"
            aria-label="Escolha uma afirmação"
          >
            <button
              className={`statement-button${selectedCategory === currentPair.statement1.category ? " selected" : ""}`}
              onClick={() => { sfx.tick(); setSelectedCategory(currentPair.statement1.category); }}
              aria-label={currentPair.statement1.text}
              role="radio"
              aria-checked={selectedCategory === currentPair.statement1.category}
              type="button"
            >
              {currentPair.statement1.text}
              {selectedCategory === currentPair.statement1.category && (
                <span className="selected-icon" aria-label="Selecionado" style={{ marginLeft: 8 }}>✓</span>
              )}
            </button>

            {/* M6: divisor claro entre as duas opções */}
            <span
              aria-hidden="true"
              style={{ textAlign: "center", color: "#4a6572", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.12em" }}
            >
              ou
            </span>

            <button
              className={`statement-button${selectedCategory === currentPair.statement2.category ? " selected" : ""}`}
              onClick={() => { sfx.tick(); setSelectedCategory(currentPair.statement2.category); }}
              aria-label={currentPair.statement2.text}
              role="radio"
              aria-checked={selectedCategory === currentPair.statement2.category}
              type="button"
            >
              {currentPair.statement2.text}
              {selectedCategory === currentPair.statement2.category && (
                <span className="selected-icon" aria-label="Selecionado" style={{ marginLeft: 8 }}>✓</span>
              )}
            </button>
          </div>

          {/* Quiz pills for "nenhuma" / "ambas" */}
          <div className="quiz-pills">
            <button
              onClick={() => { sfx.tick(); setSelectedCategory("nenhuma"); }}
              className={`quiz-pill${selectedCategory === "nenhuma" ? " selected" : ""}`}
              type="button"
              aria-pressed={selectedCategory === "nenhuma"}
            >
              Nenhuma das opções
            </button>
            <button
              onClick={() => { sfx.tick(); setSelectedCategory("ambas"); }}
              className={`quiz-pill${selectedCategory === "ambas" ? " selected" : ""}`}
              type="button"
              aria-pressed={selectedCategory === "ambas"}
            >
              Me identifico com as duas
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", marginTop: "1rem" }}>
            {showSelectWarning && (
              <p style={{ color: "#ff5252", textAlign: "center", margin: 0 }}>
                Por favor, selecione uma das opções antes de continuar.
              </p>
            )}
            <div className="quiz-nav-buttons">
              {currentQuestion > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="reset-button"
                  aria-label="Voltar para a etapa anterior"
                  style={{ background: "#314b56", color: "#fff", margin: 0, padding: "1rem 1.75rem", fontSize: "1.05rem", borderRadius: 12 }}
                >
                  ← Voltar
                </button>
              )}
              <button
                ref={nextStepButtonRef}
                onClick={() => {
                  if (!selectedCategory) {
                    setShowSelectWarning(true);
                    return;
                  }

                  if (nextStepButtonRef.current) {
                    nextStepButtonRef.current.classList.add("ring");
                    setTimeout(() => {
                      nextStepButtonRef.current?.classList.remove("ring");
                    }, 500);
                  }

                  onHandleChoice(selectedCategory);
                  setSelectedCategory(null);
                  setShowSelectWarning(false);
                }}
                disabled={!selectedCategory}
                className="next-step-button"
                style={{ marginTop: 0 }}
                aria-label={currentQuestion >= comparisons.length - 1 ? "Ver resultado" : "Próxima Etapa"}
              >
                {currentQuestion >= comparisons.length - 1 ? "Ver resultado" : "Próxima Etapa"}
              </button>
            </div>
          </div>

          {process.env.NODE_ENV === "development" &&
            currentPair &&
            currentPair.statement1 &&
            currentPair.statement2 && (
              <div className="debug-info">
                {[currentPair.statement1, currentPair.statement2].map(
                  (statement, index) => (
                    <p key={statement.id}>
                      Categoria {index + 1}:{" "}
                      {
                        categoryMetadata.find((c) => c.id === statement.category)
                          ?.name
                      }
                    </p>
                  )
                )}
              </div>
            )}
        </div>
        {false && (
          <div className="modal-backdrop">
            <div className="modal">
              <h3>Deseja sair do teste?</h3>
              <p>Suas respostas serão perdidas se você sair agora.</p>
              <div className="modal-actions">
                <button className="confirm-button" onClick={confirmLeave}>
                  Sair do Teste
                </button>
                <button className="cancel-button" onClick={cancelLeave}>
                  Continuar Respondendo
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default Quiz;
