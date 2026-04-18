import { useEffect, useState, useRef } from "react";
import InputMask from "react-input-mask";
import { CategoryEnum, Statement, ChoiceCategory } from "../types/quiz";
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

import { generatePDF } from "../../../shared/utils/pdfGenerators/mainPdfGenerator";


import { getRandomComparisonPair, categoryMetadata } from "../data/questions";

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

  // --- Suporte ao HashRouter: hash do tipo "#/teste-dons?churchSlug=..." ou "#/c/<slug>?..."
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
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const pendingLeaveAction = useRef<(() => void) | null>(null);
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
  const [usedStatements, setUsedStatements] = useState<Set<number>>(new Set());
  const [currentPair, setCurrentPair] = useState<{
    statement1: Statement;
    statement2: Statement;
  } | null>(null);
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
  const [selectedCategory, setSelectedCategory] = useState<ChoiceCategory | null>(null);
  const [showSelectWarning, setShowSelectWarning] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showEmailInfo, setShowEmailInfo] = useState(false);
  const [emailInfoLeaving, setEmailInfoLeaving] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [resultToken, setResultToken] = useState<string | null>(null);
  const quizStartedAtRef = useRef<number>(0);
  const questionStartedAtRef = useRef<number>(0);
  const answersRef = useRef<QuizAnswerPayload[]>([]);

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

  const lastHashRef = useRef(window.location.hash);

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

  useEffect(() => {
    const originalPushState = window.history.pushState;

    window.history.pushState = function (...args) {
      const result = originalPushState.apply(this, args as any);
      const newHash = window.location.hash;
      if (lastHashRef.current !== newHash) {
        const event = new PopStateEvent("popstate");
        window.dispatchEvent(event);
      }
      return result;
    };

    const handlePopState = () => {
      if (quizStarted && !showResults) {
        const currentHash = window.location.hash;
        const previousHash = lastHashRef.current;

        if (currentHash !== previousHash) {
          window.history.pushState(null, "", previousHash);
          pendingLeaveAction.current = () => {
            window.location.hash = currentHash;
          };
          setShowLeaveModal(true);
        }
      } else {
        lastHashRef.current = window.location.hash;
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.history.pushState = originalPushState;
    };
  }, [quizStarted, showResults]);

  const confirmLeave = () => {
    pendingLeaveAction.current?.();
    window.history.pushState(null, "", window.location.hash);
    lastHashRef.current = window.location.hash;
    setShowLeaveModal(false);
  };

  const cancelLeave = () => {
    window.history.pushState(null, "", lastHashRef.current);
    pendingLeaveAction.current = null;
    setShowLeaveModal(false);
  };

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
    if (quizStarted && quizTopRef.current) {
      quizTopRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [quizStarted]);

  useEffect(() => {
    if (quizStarted && !currentPair) {
      const pair = getRandomComparisonPair(usedStatements);
      if (pair) {
        setCurrentPair(pair);
        setUsedStatements(
          (prev) => new Set([...prev, pair.statement1.id, pair.statement2.id])
        );
      } else {
        setShowResults(true);
      }
    }
  }, [quizStarted, currentPair, usedStatements]);

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
    setQuizStarted(true);
    quizStartedAtRef.current = Date.now();
    questionStartedAtRef.current = Date.now();
    answersRef.current = [];
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

  const onHandleChoice = (chosenCategory: ChoiceCategory) => {
    setTransitioning(true);
    const pair = currentPair!;
    const timeMs = Date.now() - questionStartedAtRef.current;
    const step = currentQuestion + 1;

    setTimeout(() => {
      let choice: 'a' | 'b' | 'both' | 'none';
      if (chosenCategory === 'ambas') choice = 'both';
      else if (chosenCategory === 'nenhuma') choice = 'none';
      else if (chosenCategory === pair.statement1.category) choice = 'a';
      else choice = 'b';

      answersRef.current.push({
        step,
        statementAId: pair.statement1.id,
        statementBId: pair.statement2.id,
        choice,
        timeMs,
      });

      if (step % 10 === 0 && sessionId) {
        fetch('/api/quiz-session', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, lastStep: step }),
        }).catch(() => {});
      }

      questionStartedAtRef.current = Date.now();

      setCategoryScores((prevScores) => {
        const updatedScores = { ...prevScores };

        if (chosenCategory === "ambas") {
          updatedScores[pair.statement1.category] += 1;
          updatedScores[pair.statement2.category] += 1;
        } else if (
          chosenCategory !== "nenhuma" &&
          chosenCategory in updatedScores
        ) {
          updatedScores[chosenCategory] += 1;
        }

        return updatedScores;
      });

      if (currentQuestion >= TOTAL_QUESTIONS - 1) {
        if (typeof gtag === "function") {
          gtag("event", "quiz_completed", {
            event_category: "quiz",
            event_label: "Quiz dos 5 Ministérios",
          });
        }
        setShowResults(true);
        setCurrentPair(null);
        setTransitioning(false);
        return;
      }

      const newPair = getRandomComparisonPair(usedStatements);
      if (!newPair) {
        setShowResults(true);
        setCurrentPair(null);
        setTransitioning(false);
        return;
      }

      setCurrentQuestion((prev) => prev + 1);
      setCurrentPair(newPair);
      setUsedStatements(
        (prev) => new Set([...prev, newPair.statement1.id, newPair.statement2.id])
      );

      setTransitioning(false);
    }, 300);
  };

  const onHandleReset = () => {
    setQuizStarted(false);
    setShowResults(false);
    setCurrentQuestion(0);
    setCurrentPair(null);
    setUsedStatements(new Set());
    setSessionId(null);
    setResultToken(null);
    answersRef.current = [];
    quizStartedAtRef.current = 0;
    questionStartedAtRef.current = 0;
    setOpenAccordion(0);
    setRevealFull(false);
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
    const domNameToKey: Record<string, string> = {
      'Apóstolo': 'Apostólico',
      'Profeta': 'Profeta',
      'Evangelista': 'Evangelístico',
      'Pastor': 'Pastor',
      'Mestre': 'Mestre',
    };

    try {
      setIsGeneratingPDF(true);
      const totalScore = Object.values(categoryScores).reduce((sum, val) => sum + val, 0);

      const sortedScores = Object.entries(categoryScores)
        .map(([category, score]) => {
          const metadata = categoryMetadata.find((c) => c.id === category);
          const safeScore = totalScore > 0 ? (score / totalScore) * 100 : 0;

          if (!metadata || isNaN(safeScore)) {
            return null;
          }

          return {
            categoryEnum: category as CategoryEnum,
            score: safeScore,
            metadata,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
        .sort((a, b) => b.score - a.score);

      if (sortedScores.length === 0) {
        alert('Erro ao gerar PDF. Não foi possível calcular seu Dom principal.');
        return;
      }

      const highestScore = sortedScores[0].score;
      const tiedDoms = sortedScores.filter(
        (s) => Math.abs(s.score - highestScore) < 0.0001
      );

      const principais = tiedDoms
        .map((domResult) => domNameToKey[domResult.metadata.name] ?? domResult.metadata.name)
        .filter((value): value is string => Boolean(value));
      const principaisNormalizados = Array.from(new Set(principais));

      if (principaisNormalizados.length === 0 && sortedScores[0]) {
        principaisNormalizados.push(domNameToKey[sortedScores[0].metadata.name] ?? sortedScores[0].metadata.name);
      }

      await generatePDF(
        userInfo.name,
        new Date().toLocaleDateString(),
        sortedScores.map((s) => ({
          dom: domNameToKey[s.metadata.name],
          valor: s.score,
        })),
        principaisNormalizados
      );

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

  // ===== INTRO SCREEN =====
  if (!quizStarted) {
    return (
      <section className="quiz-section">
        <div className="content-container">
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
    // Determine leading dom for anticipation phrase
    const totalForAnticipation = Object.values(categoryScores).reduce((s, v) => s + v, 0);
    const leadingEntry = Object.entries(categoryScores).sort((a, b) => b[1] - a[1])[0];
    const leadingDom = leadingEntry ? (leadingEntry[0] as CategoryEnum) : null;
    const anticipationPhrase = leadingDom
      ? `Suas respostas indicam forte inclinação para o dom de ${DOM_NAMES[leadingDom]}. Preencha abaixo para ver seu resultado completo.`
      : 'Preencha abaixo para ver seu resultado completo.';

    return (
      <section className="quiz-section">
        <div className="content-container">
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

            <div className="floating-field form-field-2">
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
                  <>
                    <input
                      {...inputProps}
                      id="f-phone"
                      type="tel"
                      placeholder=" "
                      className={`floating-input${formErrors.phone ? ' input-error' : ''}`}
                    />
                    <label htmlFor="f-phone" className="floating-label">Telefone</label>
                  </>
                )}
              </InputMask>
              {formErrors.phone && <span className="error-msg">Digite um telefone válido</span>}
            </div>

            <div className="form-field-3">
              <button
                onClick={() => {
                  const hasErrors = {
                    name: !userInfo.name.trim(),
                    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email),
                    phone: userInfo.phone.replace(/\D/g, "").length !== 11,
                  };
                  setFormErrors(hasErrors);

                  if (!Object.values(hasErrors).some(Boolean)) {
                    setShowEmailInfo(true);
                    setUserInfo((prev) => ({ ...prev, submitted: true }));

                    (async () => {
                      try {
                        const domNameToKey: Record<string, string> = {
                          "Apóstolo": "Apostólico",
                          "Profeta": "Profeta",
                          "Evangelista": "Evangelístico",
                          "Pastor": "Pastor",
                          "Mestre": "Mestre",
                        };

                        const totalScore = Object.values(categoryScores).reduce((sum, val) => sum + val, 0);

                        const sortedScores = Object.entries(categoryScores)
                          .map(([category, score]) => {
                            const metadata = categoryMetadata.find((c) => c.id === category);
                            const safeScore = totalScore > 0 ? (score / totalScore) * 100 : 0;
                            if (!metadata || isNaN(safeScore)) return null;
                            return { categoryEnum: category as CategoryEnum, score: safeScore, metadata };
                          })
                          .filter((e): e is NonNullable<typeof e> => e !== null)
                          .sort((a, b) => b.score - a.score);

                        if (sortedScores.length === 0) {
                          console.warn("Não foi possível calcular o Dom principal para envio por e-mail.");
                          return;
                        }

                        const percentuaisPdf = sortedScores.map((s) => ({
                          dom: domNameToKey[s.metadata.name] ?? s.metadata.name,
                          valor: s.score,
                        }));

                        const highestScore = sortedScores[0].score;
                        const tiedDoms = sortedScores.filter((s) => Math.abs(s.score - highestScore) < 0.0001);

                        const principais = tiedDoms
                          .map((s) => domNameToKey[s.metadata.name] ?? s.metadata.name)
                          .filter((value): value is string => Boolean(value));
                        const principaisNormalizados = Array.from(new Set(principais));
                        if (principaisNormalizados.length === 0 && percentuaisPdf[0]) {
                          principaisNormalizados.push(percentuaisPdf[0].dom);
                        }

                        const hoje = new Date().toLocaleDateString("pt-BR");
                        const { base64, filename } = await generatePDF(
                          userInfo.name,
                          hoje,
                          percentuaisPdf,
                          principaisNormalizados,
                          false
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
                className="start-button"
              >
                Ver resultado
              </button>
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
                <div className="hero-pct">{animatedScores[topCat] ?? 0}%</div>
                <div className="hero-name">{DOM_NAMES[topCat]}</div>
                <p className="hero-phrase">{DOM_PHRASES[topCat]}</p>
              </div>
            )}

            {/* Radar chart + distribution bars */}
            <div className={`radar-section${revealFull ? ' reveal-full' : ''}`}>
              <h3 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--text-light-slate)' }}>
                Perfil dos 5 Dons
              </h3>
              <RadarChart scores={radarScores} />
            </div>

            <div className={`distribution-section${revealFull ? ' reveal-full' : ''}`}>
              {sortedScores.map(({ categoryEnum: cat, score }) => (
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
              <div className="don-card apostolo-card">
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
              <div className="don-card profeta-card">
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
              <div className="don-card evangelista-card">
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
              <div className="don-card pastor-card">
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
              <div className="don-card mestre-card">
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
              <img src={escolaFiveOne} alt="Escola Five One" />
            </div>
            <div className="promo-escola-content">
              <h3>Descubra a Escola Five One</h3>
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
                href="https://www.tiktok.com/@escola.five.one"
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
                    const url = `${window.location.origin}${window.location.pathname}#/resultado/${resultToken}`;
                    navigator.clipboard?.writeText(url).then(() => {
                      alert("Link copiado para a área de transferência!");
                    }).catch(() => {
                      window.prompt("Copie o link:", url);
                    });
                  }}
                >
                  🔗 Copiar link do resultado
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
      <section className="quiz-section">
        <div className="content-container" ref={quizTopRef}>

          {/* Milestone progress */}
          <div className="milestone-wrapper">
            <div className="milestone-track">
              <div
                className="milestone-line-fill"
                style={{ width: `${((currentQuestion) / (TOTAL_QUESTIONS - 1)) * 100}%` }}
              />
              <div className="milestone-line-bg" />
              {MILESTONES.map((m) => {
                const passed = currentQuestion + 1 > m;
                const current = currentQuestion + 1 === m;
                return (
                  <div
                    key={m}
                    className={`milestone-dot${passed ? ' passed' : ''}${current ? ' current' : ''}`}
                    style={{ left: `${((m - 1) / (TOTAL_QUESTIONS - 1)) * 100}%` }}
                  >
                    {m}
                  </div>
                );
              })}
            </div>
          </div>

          <h2 style={{ marginTop: '1.5rem' }}>
            Etapa {currentQuestion + 1} de {TOTAL_QUESTIONS}
          </h2>

          <p>Selecione a afirmação com a qual você mais se identifica.</p>

          <div className={`statement-container ${transitioning ? "slide-out" : "slide-in"}`}>
            <button
              className={`statement-button${selectedCategory === currentPair.statement1.category ? " selected" : ""}`}
              onClick={() => setSelectedCategory(currentPair.statement1.category)}
              aria-label={currentPair.statement1.text}
              type="button"
            >
              {currentPair.statement1.text}
              {selectedCategory === currentPair.statement1.category && (
                <span className="selected-icon" aria-label="Selecionado" style={{ marginLeft: 8 }}>✓</span>
              )}
            </button>
            <button
              className={`statement-button${selectedCategory === currentPair.statement2.category ? " selected" : ""}`}
              onClick={() => setSelectedCategory(currentPair.statement2.category)}
              aria-label={currentPair.statement2.text}
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
              onClick={() => setSelectedCategory("nenhuma")}
              className={`quiz-pill${selectedCategory === "nenhuma" ? " selected" : ""}`}
              type="button"
            >
              Nenhuma das opções
            </button>
            <button
              onClick={() => setSelectedCategory("ambas")}
              className={`quiz-pill${selectedCategory === "ambas" ? " selected" : ""}`}
              type="button"
            >
              Me identifico com as duas
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
            {showSelectWarning && (
              <p style={{ color: "#ff5252", textAlign: "center", marginBottom: "1rem" }}>
                Por favor, selecione uma das opções antes de continuar.
              </p>
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
              aria-label="Próxima Etapa"
            >
              Próxima Etapa
            </button>
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
        {showLeaveModal && (
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
