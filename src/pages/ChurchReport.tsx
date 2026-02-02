
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./ChurchReport.css";
import { AdminToastProvider, useAdminToast } from "../components/AdminToast";

// Tipagens simples do retorno da API
type Summary = {
  total: number;
  apostolo: number;
  profeta: number;
  evangelista: number;
  pastor: number;
  mestre: number;
};

type ApiResponse = {
  ok: boolean;
  churchId: string;
  churchName?: string;
  slug?: string;
  expected_members?: number;
  period?: { from: string | null; to: string | null; tz: string };
  summary: Summary & { ties?: number };
  series?: { date: string; total: number }[];
  participation?: { overallTotal: number; overallPct: number; periodTotal: number; periodPct: number };
  extra?: { lastTimestamp: string | null; activeDays: number; peak: { date: string; total: number } | null };
  previous?: { summary: Summary & { ties?: number }; participationPct: number; from: string; to: string } | null;
  peopleByDom?: Record<string, { name: string; date: string }[]>;
  error?: string;
};

type AdminToastApi = ReturnType<typeof useAdminToast>;

type ParticipantListItem = {
  id?: string;
  name: string;
  date: string;
  email?: string;
  phone?: string;
};

type ParticipantDetail = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  topDom: string | null;
  ties: string[];
  date: string | null;
  scores: Record<string, number>;
};

type ProfileDomKey = "apostolo" | "profeta" | "evangelista" | "pastor" | "mestre";

type ProfileItemBase = {
  key: ProfileDomKey;
  label: string;
  lower: string;
  emphasis: string;
  practice: string;
};

type ProfileItem = ProfileItemBase & { value: number; pct: number };

type RecommendationItem = {
  key: ProfileDomKey;
  label: string;
  status: "ausente" | "com baixa expressão";
  expressionTitle: string;
  expressionShort: string;
  expressionWhy: string;
  suggestions: string[];
  verse: string;
  verseRef: string;
};

const DOM_COLORS: Record<string, string> = {
  Apostólico: "#22c55e",
  Profeta: "#f472b6",
  Evangelista: "#06b6d4",
  Pastor: "#f59e0b",
  Mestre: "#60a5fa",
};

const SCORE_LABELS: Record<string, string> = {
  apostolo: 'Apostólico',
  profeta: 'Profeta',
  evangelista: 'Evangelista',
  pastor: 'Pastor',
  mestre: 'Mestre',
};

const SECONDARY_PROXIMITY_PCT = 7;
const LOW_PCT_THRESHOLD = 5;
const BALANCE_DOMINANCE_PCT = 70;
const BALANCE_EVEN_PCT = 45;
const BALANCE_ABSENT_COUNT = 2;
// Texto pastoral curto para orientar a leitura do relatório (diagnóstico inicial, não maturidade/ativação)
const REPORT_WHAT_THIS_SHOWS_TEXT =
  "Este relatório apresenta um retrato do período a partir das respostas ao teste dos 5 ministérios. Ele indica percepções e inclinações ministeriais entre os participantes e serve como um diagnóstico inicial para orientar cuidado, formação e cooperação no corpo — sem afirmar maturidade espiritual ou ativação prática dos dons. O crescimento acontece no processo, com discernimento, formação, prática comunitária e acompanhamento; a partir disso, o próximo bloco ajuda a reconhecer as ênfases percebidas da comunidade.";

const PROFILE_DOMS: ProfileItemBase[] = [
  {
    key: "apostolo",
    label: "Apóstolo",
    lower: "apóstolo",
    emphasis: "visão missionária e estabelecimento de fundamentos",
    practice: "envio missionário e abertura de novas frentes",
  },
  {
    key: "profeta",
    label: "Profeta",
    lower: "profeta",
    emphasis: "discernimento espiritual e santidade",
    practice: "oração, discernimento e santidade",
  },
  {
    key: "evangelista",
    label: "Evangelista",
    lower: "evangelista",
    emphasis: "alcance das boas-novas e mobilização",
    practice: "acolhimento e anúncio das boas-novas",
  },
  {
    key: "pastor",
    label: "Pastor",
    lower: "pastor",
    emphasis: "cuidado, acompanhamento e unidade do rebanho",
    practice: "cuidado mútuo e unidade do rebanho",
  },
  {
    key: "mestre",
    label: "Mestre",
    lower: "mestre",
    emphasis: "formação bíblica e maturidade no ensino",
    practice: "ensino bíblico e formação da fé",
  },
];

const RECOMMENDATION_MAP: Record<ProfileDomKey, { suggestions: string[]; verse: string; verseRef: string }> = {
  apostolo: {
    suggestions: [
      "Crie um ambiente de envio e visão, com momentos de oração e discernimento para novas frentes.",
      "Estabeleça mentoria para pessoas com inclinação missionária, acompanhando passos pequenos e consistentes.",
      "Inicie uma ação mensurável de expansão local (um grupo novo ou uma visita missionária por mês).",
    ],
    verse: "Portanto, ide, fazei discípulos de todas as nações.",
    verseRef: "Mateus 28:19",
  },
  profeta: {
    suggestions: [
      "Organize um ambiente regular de oração e escuta, cultivando discernimento com mansidão.",
      "Treine e acompanhe pessoas com sensibilidade espiritual para servir com equilíbrio e graça.",
      "Realize um encontro mensal de intercessão e consagração com foco na caminhada da comunidade.",
    ],
    verse: "Não apagueis o Espírito.",
    verseRef: "1 Tessalonicenses 5:19",
  },
  evangelista: {
    suggestions: [
      "Crie um ambiente acolhedor para visitantes, com cultura de hospitalidade e escuta.",
      "Treine e acompanhe pessoas para comunicar o evangelho de modo simples e fiel.",
      "Inicie uma ação mensurável de proclamação (uma saída evangelística ou roda de testemunhos por mês).",
    ],
    verse: "Faze a obra de um evangelista.",
    verseRef: "2 Timóteo 4:5",
  },
  pastor: {
    suggestions: [
      "Estabeleça um ambiente de cuidado mútuo, incentivando vínculos e reconciliação.",
      "Forme e acompanhe líderes de cuidado para visitas, escuta e oração consistente.",
      "Inicie uma prática mensurável de cuidado (um acompanhamento semanal por grupo ou setor).",
    ],
    verse: "Pastoreai o rebanho de Deus que há entre vós.",
    verseRef: "1 Pedro 5:2",
  },
  mestre: {
    suggestions: [
      "Crie um ambiente de ensino bíblico contínuo, com encontros simples e regulares.",
      "Forme e acompanhe pessoas com inclinação ao ensino, com mentoria e fidelidade às Escrituras.",
      "Inicie uma prática mensurável de formação (uma classe de fundamentos ou leitura guiada semanal).",
    ],
    verse: "Habite, ricamente, em vós a palavra de Cristo.",
    verseRef: "Colossenses 3:16",
  },
};

const EXPRESSIONS_MAP: Record<ProfileDomKey, { expressionTitle: string; expressionShort: string; expressionRiskIfAbsent: string; expressionRiskIfDominant: string }> = {
  apostolo: {
    expressionTitle: "Impacto Missionário",
    expressionShort: "envio e expansão do Reino",
    expressionRiskIfAbsent: "pouco envio/expansão e pouca abertura de novas frentes",
    expressionRiskIfDominant: "ativismo e expansão sem bases de cuidado/ensino e sem discernimento",
  },
  profeta: {
    expressionTitle: "Fidelidade à Aliança",
    expressionShort: "discernimento e santidade na caminhada",
    expressionRiskIfAbsent: "pouco discernimento e enfraquecimento da santidade comunitária",
    expressionRiskIfDominant: "rigidez e cobranças sem ternura pastoral e sem unidade",
  },
  evangelista: {
    expressionTitle: "Proclamação do Evangelho",
    expressionShort: "anúncio das boas-novas e acolhimento",
    expressionRiskIfAbsent: "pouca proclamação e menor abertura aos novos",
    expressionRiskIfDominant: "pressa em resultados sem cuidado, ensino e acompanhamento",
  },
  pastor: {
    expressionTitle: "Comunidade Reconciliada",
    expressionShort: "cuidado, unidade e reconciliação",
    expressionRiskIfAbsent: "fragilidade no cuidado mútuo e na unidade do corpo",
    expressionRiskIfDominant: "proteção excessiva que reduz envio, ensino e discernimento",
  },
  mestre: {
    expressionTitle: "Sabedoria Profunda",
    expressionShort: "ensino que forma e aprofunda a fé",
    expressionRiskIfAbsent: "superficialidade bíblica e pouca formação",
    expressionRiskIfDominant: "acúmulo de conteúdo sem prática, missão e cuidado",
  },
};

// Lê querystring do hash (HashRouter)
function useHashQuery() {
  const { hash } = useLocation();
  return useMemo(() => new URLSearchParams(hash.includes("?") ? hash.split("?")[1] : ""), [hash]);
}

function ChurchReportInner() {
  const params = useParams();
  const query = useHashQuery();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  // filtros simples de período (ISO yyyy-mm-dd)
  // Datas padrão usando fuso local para evitar descompasso com UTC
  const todayIso = new Date().toLocaleDateString('en-CA'); // yyyy-mm-dd no fuso local
  const d = new Date(); d.setDate(d.getDate() - 29);
  const thirtyDaysAgoIso = d.toLocaleDateString('en-CA');
  const [from, setFrom] = useState<string>(query.get("from") || thirtyDaysAgoIso);
  const [to, setTo] = useState<string>(query.get("to") || todayIso);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const distRef = useRef<HTMLDivElement>(null);
  const isPublic = useLocation().pathname.startsWith('/r/');
  const [metricMode, setMetricMode] = useState<'pct' | 'count'>('pct');
  const [visibleDoms, setVisibleDoms] = useState<Record<string, boolean>>({ Apostólico: true, Profeta: true, Evangelista: true, Pastor: true, Mestre: true });
  const toast = useAdminToast();

  // Slug pode vir por /relatorio/:slug OU por ?churchSlug=
  const slug = params.slug || query.get("churchSlug") || "";
  const tokenParam = query.get("token") || "";

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';
        const qsObj = { churchSlug: slug, from, to, tz, includePeople: 'true' } as Record<string,string>;
        if (tokenParam) (qsObj as any).token = tokenParam;
        const qs = new URLSearchParams(qsObj).toString();
        const res = await fetch(`/api/church-summary?${qs}`);
        const json: ApiResponse = await res.json();
        if (!res.ok || !json.ok) throw new Error(json?.error || `Erro ${res.status}`);
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [slug, from, to]);

  const summary: (Summary & { ties?: number }) | null = data?.summary ?? null;

  // Prepara dados para um gráfico de barras simples (sem libs externas)
  const bars = useMemo(() => {
    if (!summary || summary.total === 0)
      return [] as { label: string; value: number; pct: number }[];
    const items = [
      { key: "apostolo", label: "Apostólico", value: summary.apostolo },
      { key: "profeta", label: "Profeta", value: summary.profeta },
      { key: "evangelista", label: "Evangelista", value: summary.evangelista },
      { key: "pastor", label: "Pastor", value: summary.pastor },
      { key: "mestre", label: "Mestre", value: summary.mestre },
    ];
    return items
      .map((i) => ({ ...i, pct: Math.round((i.value / summary.total) * 100) }))
      .sort((a, b) => b.pct - a.pct); // ordenar do maior para o menor para leitura rápida
  }, [summary]);

  const domColors = DOM_COLORS;

  // Modal de participantes
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDom, setModalDom] = useState<"Apostólico" | "Profeta" | "Evangelista" | "Pastor" | "Mestre" | null>(null);
  const participants = useMemo((): ParticipantListItem[] => {
    if (!data?.peopleByDom || !modalDom) return [];
    const mapKeys: Record<'Apostólico' | 'Profeta' | 'Evangelista' | 'Pastor' | 'Mestre', 'apostolo' | 'profeta' | 'evangelista' | 'pastor' | 'mestre'> = {
      Apostólico: 'apostolo',
      Profeta: 'profeta',
      Evangelista: 'evangelista',
      Pastor: 'pastor',
      Mestre: 'mestre',
    };
    const key = mapKeys[modalDom];
    const dict = data.peopleByDom as Record<string, { name: string; date: string }[]>;
    return dict[key] ?? [];
  }, [data?.peopleByDom, modalDom]);

  // Controles e dados do modal
  const [includeTies, setIncludeTies] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'name'|'date'>('name');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');
  const [list, setList] = useState<ParticipantListItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [participantDetail, setParticipantDetail] = useState<ParticipantDetail | null>(null);
  const [participantDetailError, setParticipantDetailError] = useState<string | null>(null);
  const [participantDetailLoading, setParticipantDetailLoading] = useState(false);

  useEffect(() => {
    if (modalOpen) {
      // inicia com o snapshot do summary
      setList(participants as any);
      setPage(0);
      setHasMore((participants?.length || 0) >= 200);
      setSelectedParticipantId(null);
      setParticipantDetail(null);
      setParticipantDetailError(null);
      setParticipantDetailLoading(false);
    } else {
      setSelectedParticipantId(null);
      setParticipantDetail(null);
      setParticipantDetailError(null);
      setParticipantDetailLoading(false);
    }
  }, [modalOpen, participants]);

  async function refetchPeopleFromSummary() {
    if (!modalDom) return;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';
    const qs = new URLSearchParams({
      churchSlug: slug,
      from: from || '',
      to: to || '',
      tz,
      includePeople: 'true',
      includeTies: includeTies ? 'true' : 'false',
      includeContacts: showContacts ? 'true' : 'false'
    }).toString();
    const res = await fetch(`/api/church-summary?${qs}`);
    const j = await res.json();
    if (!res.ok || !j.ok) return;
    const map: any = { 'Apostólico':'apostolo','Profeta':'profeta','Evangelista':'evangelista','Pastor':'pastor','Mestre':'mestre' };
    const key = map[modalDom];
    const arr = (j.peopleByDom && j.peopleByDom[key]) ? j.peopleByDom[key] : [];
    setList(arr);
    setPage(0);
    setHasMore((arr?.length || 0) >= 200);
  }

  async function loadMorePeople() {
    if (!modalDom) return;
    const map: any = { 'Apostólico':'apostolo','Profeta':'profeta','Evangelista':'evangelista','Pastor':'pastor','Mestre':'mestre' };
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';
    const qs = new URLSearchParams({
      churchSlug: slug,
      dom: map[modalDom],
      from: from || '',
      to: to || '',
      tz,
      includeTies: includeTies ? 'true' : 'false',
      includeContacts: showContacts ? 'true' : 'false',
      page: String(page + 1),
      limit: '50'
    }).toString();
    const res = await fetch(`/api/church-people?${qs}`);
    const j = await res.json();
    if (!res.ok || !j.ok) return;
    setList(prev => [...prev, ...j.items]);
    setPage(j.page);
    setHasMore(j.hasMore);
  }

  async function handleSelectParticipant(item: ParticipantListItem) {
    if (!item.id) {
      setSelectedParticipantId(null);
      setParticipantDetail(null);
      setParticipantDetailError('Resposta sem identificador.');
      return;
    }
    if (selectedParticipantId === item.id && participantDetail && !participantDetailLoading) {
      return; // já carregado
    }
    setSelectedParticipantId(item.id);
    setParticipantDetail(null);
    setParticipantDetailError(null);
    setParticipantDetailLoading(true);
    try {
      const qs = new URLSearchParams({ id: item.id, churchSlug: slug });
      if (tokenParam) qs.set('token', tokenParam);
      const res = await fetch(`/api/quiz-result?${qs.toString()}`);
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `Erro ${res.status}`);
      }
      const participant = json.participant as ParticipantDetail;
      setParticipantDetail(participant);
    } catch (err: any) {
      setParticipantDetailError(String(err?.message || err || 'Erro ao carregar participante.'));
    } finally {
      setParticipantDetailLoading(false);
    }
  }

  const filteredSorted = useMemo(() => {
    let arr = list;
    if (search.trim()) {
      const s = search.toLowerCase();
      arr = arr.filter(it => it.name.toLowerCase().includes(s));
    }
    const mul = sortDir === 'asc' ? 1 : -1;
    arr = [...arr].sort((a,b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name,'pt-BR')*mul;
      return (a.date<b.date?-1:1)*mul;
    });
    return arr;
  }, [list, search, sortKey, sortDir]);

  useEffect(() => {
    if (selectedParticipantId) {
      const exists = filteredSorted.some((p) => p.id === selectedParticipantId);
      if (!exists) {
        setSelectedParticipantId(null);
        setParticipantDetail(null);
        setParticipantDetailError(null);
        setParticipantDetailLoading(false);
      }
    }
  }, [filteredSorted, selectedParticipantId]);

  const participantScores = useMemo(() => {
    if (!participantDetail || !participantDetail.scores) return [] as { key: string; label: string; value: number; color: string }[];
    return Object.entries(participantDetail.scores)
      .map(([key, value]) => {
        const label = SCORE_LABELS[key as keyof typeof SCORE_LABELS] ?? key;
        const color = DOM_COLORS[label] ?? '#60a5fa';
        return { key, label, value: Number(value) || 0, color };
      })
      .filter((item) => !Number.isNaN(item.value))
      .sort((a, b) => b.value - a.value);
  }, [participantDetail]);

  const totalParticipation = typeof data?.participation?.overallPct === 'number'
    ? Math.round(data.participation.overallPct)
    : null;
  const totalResponses = typeof data?.participation?.overallTotal === 'number'
    ? data.participation.overallTotal
    : summary?.total ?? null;
  const expectedMembers = typeof data?.expected_members === 'number'
    ? data.expected_members
    : null;

  function formatDateLabel(value: string | null | undefined) {
    if (!value) return null;
    const parts = value.split("-");
    if (parts.length !== 3) return null;
    const [y, m, d] = parts;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }

  const periodLabel = (() => {
    const fromLabel = formatDateLabel(from);
    const toLabel = formatDateLabel(to);
    if (fromLabel && toLabel) return `${fromLabel} — ${toLabel}`;
    if (fromLabel) return `Desde ${fromLabel}`;
    if (toLabel) return `Até ${toLabel}`;
    return "Período completo";
  })();

  const profile = useMemo(() => {
    if (!summary || summary.total <= 0) return null;
    const items = buildProfileItems(summary);
    if (items.length === 0) return null;

    const topValue = Math.max(...items.map((item) => item.value));
    if (topValue <= 0) return null;
    const primaryItems = items.filter((item) => item.value === topValue);
    const primaryLabel = primaryItems.map((item) => `${item.label} (${formatPct(item.pct)})`).join(" • ");

    const remaining = items.filter((item) => item.value < topValue);
    const secondaryCandidate = remaining[0] ?? null;
    const topPct = primaryItems[0]?.pct ?? 0;
    const secondary = secondaryCandidate && secondaryCandidate.value > 0 && (topPct - secondaryCandidate.pct <= SECONDARY_PROXIMITY_PCT)
      ? secondaryCandidate
      : null;
    const secondaryLabel = secondary
      ? `${secondary.label} (${formatPct(secondary.pct)})`
      : "Sem proximidade relevante neste período.";

    const lowItems = items.filter((item) => item.value === 0 || item.pct <= LOW_PCT_THRESHOLD);
    const lowLabel = lowItems.length > 0
      ? lowItems.map((item) => `${item.label} (${formatPct(item.pct)})`).join(", ")
      : "Nenhum neste período.";

    const statusKey = computeStatusKey(items);
    const insight = buildPastoralInsight(primaryItems, secondary, lowItems, statusKey);

    return {
      primaryLabel,
      secondaryLabel,
      lowLabel,
      insight,
    };
  }, [summary]);

  const balance = useMemo(() => {
    if (!summary || summary.total <= 0) return null;
    const items = buildProfileItems(summary);
    if (items.length === 0) return null;
    return buildBalanceIndex(items);
  }, [summary]);

  const recommendations = useMemo(() => {
    if (!summary || summary.total <= 0) return [] as RecommendationItem[];
    const items = buildProfileItems(summary);
    if (items.length === 0) return [] as RecommendationItem[];
    return buildRecommendations(items);
  }, [summary]);

  const recommendationsEmptyMessage = useMemo(() => {
    if (!summary) return "Nenhuma orientação disponível para este período.";
    const items = buildProfileItems(summary);
    if (items.length === 0) return "Nenhuma orientação disponível para este período.";
    const statusKey = computeStatusKey(items);
    const maxValue = Math.max(...items.map((item) => item.value));
    const topItems = items.filter((item) => item.value === maxValue);
    const absentItems = items.filter((item) => item.value === 0 || item.pct === 0);
    const lowItems = items.filter((item) => item.pct > 0 && item.pct <= LOW_PCT_THRESHOLD);
    const sortedDesc = [...items].sort((a, b) => b.pct - a.pct);
    const secondItem = sortedDesc[1] ?? null;
    const scenario = buildScenarioNarrative({
      statusKey,
      topItems,
      absentItems,
      lowItems,
      secondItem,
    });
    return scenario.recommendationsEmptyText;
  }, [summary]);

  const nextStep = useMemo(() => {
    if (!summary) return null;
    const items = buildProfileItems(summary);
    if (items.length === 0) return null;
    return buildNextStep(items, summary.total);
  }, [summary]);

  const executive = useMemo(() => {
    if (!summary) return null;
    const items = buildProfileItems(summary);
    if (items.length === 0) return null;
    return buildExecutiveSummary(items, summary.total);
  }, [summary]);

  return (
    <div className="report-wrap">
      <header className="report-hero">
        <div className="report-hero-main">
          <div className="report-hero-top">
            {!isPublic && (
              <Link className="report-hero-back" to="/admin/igrejas">← Voltar</Link>
            )}
            <span className="report-pill">Relatórios</span>
          </div>
          <h1 className="report-title">Relatório por Igreja</h1>
          <p className="report-sub">
            Acompanhe respostas, distribuição de dons e engajamento durante o período selecionado.
          </p>
          <div className="report-meta">
            <div className="report-meta-item">
              <span className="report-meta-label">Igreja</span>
              <span className="report-meta-value">{data?.churchName || "(não informado)"}</span>
            </div>
            <div className="report-meta-item">
              <span className="report-meta-label">Slug</span>
              <span className="report-meta-value">{data?.slug || slug || "(n/d)"}</span>
            </div>
            <div className="report-meta-item">
              <span className="report-meta-label">Membros previstos</span>
              <span className="report-meta-value">{expectedMembers !== null ? expectedMembers.toLocaleString("pt-BR") : "—"}</span>
            </div>
            <div className="report-meta-item">
              <span className="report-meta-label">Respostas totais</span>
              <span className="report-meta-value">{typeof totalResponses === "number" ? totalResponses.toLocaleString("pt-BR") : "—"}</span>
            </div>
            <div className="report-meta-item">
              <span className="report-meta-label">Participação</span>
              <span className="report-meta-value">{totalParticipation !== null ? `${totalParticipation}%` : "—"}</span>
            </div>
            <div className="report-meta-item">
              <span className="report-meta-label">Período</span>
              <span className="report-meta-value">{periodLabel}</span>
            </div>
          </div>
        </div>
        <div className="report-hero-actions">
          <button className="btn" onClick={() => shareReportLink(data?.slug || slug, from, to, toast)}>
            Compartilhar relatório
          </button>
          {!isPublic && (() => {
            const s = data?.slug || slug;
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            const href = `${origin}/#/teste-dons?churchSlug=${encodeURIComponent(String(s))}`;
            return (
              <a className="btn ghost" href={href} target="_blank" rel="noopener noreferrer">
                Abrir teste
              </a>
            );
          })()}
        </div>
      </header>

      {/* O que este relatório mostra */}
      <section className="report-profile" aria-label="O que este relatório mostra">
        <div className="report-profile-header">
          <div>
            <span className="report-kicker">Guia de leitura</span>
            <h2 className="report-profile-title">O que este relatório mostra</h2>
          </div>
          <div className="report-profile-note">Diagnóstico inicial do período, baseado nas respostas do teste, que prepara a leitura das ênfases percebidas</div>
        </div>
        <div className="report-profile-grid">
          <div className="report-profile-insight" style={{ gridColumn: "1 / -1" }}>
            <span className="profile-insight-label">Orientação</span>
            <p>{REPORT_WHAT_THIS_SHOWS_TEXT}</p>
            <span className="profile-insight-base">Efésios 4.11–13; 1 Coríntios 12.7.</span>
          </div>
        </div>
      </section>

      {executive && (
        <section className="report-profile" aria-label="Resumo executivo">
          <div className="report-profile-header">
            <div>
              <span className="report-kicker">Para líderes</span>
              <h2 className="report-profile-title">{executive.title}</h2>
            </div>
            <div className="report-profile-note">Síntese pastoral do período para orientar decisões</div>
          </div>
          <div className="report-profile-grid">
            <div className="report-profile-insight" style={{ gridColumn: "1 / -1" }}>
              <span className="profile-insight-label">Leitura em 6–8 linhas</span>
              {executive.lines.map((line, index) => (
                <p key={`exec-${index}`}>{line}</p>
              ))}
              <span className="profile-insight-base">{executive.base}</span>
            </div>
          </div>
        </section>
      )}

      {/* Filtros de período */}
      <section className="report-toolbar">
        <div className="report-toolbar-left">
          <label className="field">
            <span>De</span>
            <input className="input-date" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="field">
            <span>Até</span>
            <input className="input-date" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
        <div className="report-toolbar-right">
          <button className="btn pill" onClick={() => { setFrom(thirtyDaysAgoIso); setTo(todayIso); }}>Últimos 30 dias</button>
          <button className="btn pill ghost" onClick={() => { setFrom("" as any); setTo("" as any); }}>Tudo</button>
        </div>
      </section>

      {loading && <p>Carregando dados…</p>}
      {error && <p style={{ color: "#ef4444" }}>Erro: {error}</p>}

      {summary && (
        <>
          {/* Cards de totais */}
          <div className="cards-wrap" ref={containerRef}>
            {/* Grupo 1: Dons */}
            <h3 className="group-title sticky">Dons</h3>
            <div className="cards-doms" ref={pageRef}>
              {bars.length > 0 && (
                <div className="cards cards-doms-top">
                  <HighlightCard
                    title="Maior dom"
                    label={bars[0].label}
                    percent={bars[0].pct}
                    color={domColors[bars[0].label] || "#22c55e"}
                    hint={bars[1] ? `+${bars[0].pct - bars[1].pct}% vs 2º (${bars[1].label})` : undefined}
                  />
                </div>
              )}
              <div className="cards-row-5">
                <CardClickable title="Apóstolo" value={summary.apostolo} color={domColors['Apostólico']} onClick={() => { setModalDom('Apostólico'); setModalOpen(true); }} />
                <CardClickable title="Profeta" value={summary.profeta} color={domColors['Profeta']} onClick={() => { setModalDom('Profeta'); setModalOpen(true); }} />
                <CardClickable title="Evangelista" value={summary.evangelista} color={domColors['Evangelista']} onClick={() => { setModalDom('Evangelista'); setModalOpen(true); }} />
                <CardClickable title="Pastor" value={summary.pastor} color={domColors['Pastor']} onClick={() => { setModalDom('Pastor'); setModalOpen(true); }} />
                <CardClickable title="Mestre" value={summary.mestre} color={domColors['Mestre']} onClick={() => { setModalDom('Mestre'); setModalOpen(true); }} />
              </div>
            </div>

            {/* Separador visual entre grupos */}
            <div className="cards-separator" role="separator" aria-label="Separador de seções" />

            {/* Grupo 2: Métricas gerais */}
            <h3 className="group-title sticky">Resultados</h3>
            <div className="cards cards-metrics">
              <Card title="Respostas (período)" value={summary.total} delta={(summary.total - (data?.previous?.summary.total || 0))} />
              <Card title="Participação (período)" value={(data?.participation?.periodPct ?? 0)} suffix="%" delta={((data?.participation?.periodPct ?? 0) - (data?.previous?.participationPct ?? 0))} deltaIsPercent />
              <Card title="Empates" value={summary.ties ?? 0} delta={((summary.ties ?? 0) - (data?.previous?.summary.ties ?? 0))} />
              {data?.extra?.lastTimestamp && (
                <Card title="Última resposta" valueLabel={formatRelTime(data.extra.lastTimestamp)} />
              )}
              {typeof data?.extra?.activeDays === 'number' && (
                <Card title="Dias ativos" value={data.extra.activeDays} />
              )}
              {data?.extra?.peak && (
                <Card title="Pico de respostas" value={data.extra.peak.total} />
              )}
            </div>
          </div>

          <section className="report-profile">
            <div className="report-profile-header">
              <div>
                <span className="report-kicker">Quem somos como comunidade?</span>
                <h2 className="report-profile-title">Perfil Ministerial da Comunidade</h2>
              </div>
              <div className="report-profile-note">Leitura do período com base na distribuição percebida, preparando o índice de equilíbrio</div>
            </div>
            {profile ? (
              <div className="report-profile-grid">
                <div className="report-profile-list">
                  <div className="profile-line">
                    <span className="profile-label">Perfil predominante</span>
                    <span className="profile-value">{profile.primaryLabel}</span>
                  </div>
                  <div className="profile-line">
                    <span className="profile-label">Perfil secundário</span>
                    <span className="profile-value">{profile.secondaryLabel}</span>
                  </div>
                  <div className="profile-line">
                    <span className="profile-label">Dons ausentes ou sub-representados</span>
                    <span className="profile-value">{profile.lowLabel}</span>
                  </div>
                </div>
                <div className="report-profile-insight">
                  <span className="profile-insight-label">Insight Ministerial</span>
                  {profile.insight.map((line, index) => (
                    <p key={`${line.slice(0, 16)}-${index}`}>{line}</p>
                  ))}
                  <span className="profile-insight-base">Efésios 4.11–13; 1 Coríntios 12.14–26.</span>
                </div>
              </div>
            ) : (
              <div className="report-profile-empty">Dados insuficientes para compor o perfil ministerial deste período.</div>
            )}
          </section>

          <section className="report-balance">
            <div className="report-balance-header">
              <div>
                <span className="report-kicker">Índice de equilíbrio</span>
                <h2 className="report-balance-title">Índice de Equilíbrio Ministerial</h2>
                <p className="report-profile-note">Leitura do corpo como um todo no período, não da caminhada individual, preparando ações acompanhadas.</p>
              </div>
              {balance && (
                <div className={`balance-pill ${balance.statusKey}`}>
                  <span className="balance-indicator" aria-hidden="true">{balance.indicator}</span>
                  <strong>{balance.label}</strong>
                </div>
              )}
            </div>
            {balance ? (
              <div className="report-balance-grid">
                <div className="balance-card">
                  <span className="profile-label">Leitura pastoral do cenário</span>
                  <p>{balance.reading}</p>
                </div>
                <div className="balance-card">
                  <span className="profile-label">Onde há sinais percebidos?</span>
                  <p>{balance.mature}</p>
                </div>
                <div className="balance-card">
                  <span className="profile-label">Onde há riscos percebidos?</span>
                  <p>{balance.imbalance}</p>
                </div>
              </div>
            ) : (
              <div className="report-profile-empty">Dados insuficientes para compor o índice de equilíbrio ministerial deste período.</div>
            )}
          </section>

          <section className="report-growth">
            <div className="report-growth-header">
              <div>
                <span className="report-kicker">Como crescer juntos rumo à plenitude de Cristo?</span>
                <h2 className="report-growth-title">Recomendações Práticas por Dom Ausente</h2>
              </div>
              <div className="report-profile-note">Sugestões pastorais para fortalecer expressões com baixa percepção e preparar o próximo passo.</div>
            </div>
            {recommendations.length > 0 ? (
              <div className="report-growth-grid">
                {recommendations.map((rec) => (
                  <article key={rec.key} className="growth-card">
                    <div className="growth-alert">⚠️ Oportunidade: Dom {rec.label} {rec.status} neste período</div>
                    <div className="growth-expression">
                      <span className="profile-label">Expressão a fortalecer</span>
                      <p>{rec.expressionTitle} — {rec.expressionShort}</p>
                      <p className="muted">{rec.expressionWhy}</p>
                    </div>
                    <div className="growth-suggestions">
                      <span className="profile-label">Sugestões</span>
                      <ul>
                        {rec.suggestions.map((suggestion, index) => (
                          <li key={`${rec.key}-${index}`}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="growth-verse">
                      <span className="profile-label">📖 Texto bíblico</span>
                      <p>“{rec.verse}” <span className="growth-verse-ref">{rec.verseRef}</span></p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="report-profile-empty">{recommendationsEmptyMessage}</div>
            )}
          </section>

          <section className="report-next-step">
            <div className="report-growth-header">
              <div>
                <span className="report-kicker">Próximo passo sugerido</span>
                <h2 className="report-growth-title">Um caminho simples e pastoral para este período</h2>
              </div>
            </div>
            {nextStep ? (
              <div className="next-step-card">
                <span className="profile-label">Próximo passo sugerido</span>
                <strong>{nextStep.title}</strong>
                <span className="muted">{nextStep.subtitle}</span>
                <div>
                  <span className="profile-label">30 dias</span>
                  <ul>
                    {nextStep.bullets30.map((item, index) => (
                      <li key={`next30-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="profile-label">60 dias</span>
                  <ul>
                    {nextStep.bullets60.map((item, index) => (
                      <li key={`next60-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="profile-label">90 dias</span>
                  <ul>
                    {nextStep.bullets90.map((item, index) => (
                      <li key={`next90-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                <p>{nextStep.note}</p>
                <p>{nextStep.optionalSupport}</p>
              </div>
            ) : (
              <div className="report-profile-empty">Nenhum passo sugerido para este período.</div>
            )}
          </section>

          {/* Barras */}
          <h2 className="section-title">Distribuição por dom</h2>
          <div className="legend">
            {Object.entries(domColors).map(([name, color]) => {
              const active = visibleDoms[name] !== false;
              return (
                <button key={name}
                        className={`legend-item ${active ? 'active' : 'muted'}`}
                        onClick={() => setVisibleDoms(v => ({ ...v, [name]: !active }))}
                        title={active ? `Ocultar ${name}` : `Mostrar ${name}`}>
                  <span className="legend-dot" style={{ background: color, opacity: active ? 1 : .35 }} />
                  <span>{name}</span>
                </button>
              );
            })}
            <div style={{ marginLeft: 'auto', display: 'inline-flex', gap: 6 }}>
              <button className={`btn pill ${metricMode === 'pct' ? '' : 'ghost'}`} onClick={() => setMetricMode('pct')}>% Percentual</button>
              <button className={`btn pill ${metricMode === 'count' ? '' : 'ghost'}`} onClick={() => setMetricMode('count')}># Contagem</button>
            </div>
          </div>
          {bars.length === 0 ? (
            <p>Nenhum dado suficiente para mostrar gráfico.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }} ref={distRef}>
              {(() => {
                const filtered = bars.filter(b => visibleDoms[b.label] !== false);
                const maxCount = Math.max(...filtered.map(b => b.value), 1);
                return filtered.map((b) => (
                  <BarRow key={b.label} label={b.label} value={b.value} pct={b.pct} mode={metricMode} maxCount={maxCount} color={domColors[b.label] || '#22c55e'} />
                ));
              })()}
            </div>
          )}

          {/* Série temporal simples */}
          <h2 className="section-title">Respostas por dia</h2>
          {data?.series && data.series.length > 0 ? (
            <div style={{ display: 'grid', gap: 8 }}>
              <SparkBar series={data.series} />
            </div>
          ) : (
            <p>Nenhum dado para o período selecionado.</p>
          )}

          {/* Exportações */}
          <div className="export-row">
            <button className="btn" onClick={() => downloadCSV(slug, data)}>Exportar CSV</button>
            <button className="btn" onClick={() => exportExecutivePDF(slug, data, pageRef.current, distRef.current)}>PDF Executivo</button>
            <button className="btn" onClick={() => exportPDF(pageRef.current)}>Exportar PDF (cartões)</button>
            {!isPublic && (
              <button className="btn ghost" onClick={() => copyPublicLink(slug, from, to, toast)}>Copiar link público</button>
            )}
            <button className="btn ghost" onClick={() => downloadPNG(containerRef.current)}>Baixar imagem dos cartões</button>
          </div>
          {/* Modal de participantes por dom */}
          {modalOpen && modalDom && (
            <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setModalOpen(false)}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-head" style={{ borderColor: domColors[modalDom], boxShadow: `inset 0 3px 0 0 ${domColors[modalDom]}66` }}>
                  <h3 className="modal-title">Participantes — {modalDom} ({filteredSorted.length})</h3>
                  <button className="modal-close" onClick={() => setModalOpen(false)} aria-label="Fechar">×</button>
                </div>
                <div className="modal-body">
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
                    <label className="field"><span>Buscar</span><input className="input-date" type="text" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Nome"/></label>
                    <label className="field" style={{ alignItems:'center', flexDirection:'row', gap:6 }}>
                      <input type="checkbox" checked={includeTies} onChange={(e)=>{setIncludeTies(e.target.checked); refetchPeopleFromSummary();}}/>
                      <span>Incluir empatados</span>
                    </label>
                    <label className="field" style={{ alignItems:'center', flexDirection:'row', gap:6 }}>
                      <input type="checkbox" checked={showContacts} onChange={(e)=>{setShowContacts(e.target.checked); refetchPeopleFromSummary();}}/>
                      <span>Mostrar contatos</span>
                    </label>
                    <div style={{ marginLeft:'auto', display:'inline-flex', gap:6 }}>
                      <button className={`btn pill ${sortKey==='name'?'':'ghost'}`} onClick={()=>setSortKey('name')}>Ordenar por nome</button>
                      <button className={`btn pill ${sortKey==='date'?'':'ghost'}`} onClick={()=>setSortKey('date')}>Ordenar por data</button>
                      <button className={`btn pill ${sortDir==='asc'?'':'ghost'}`} onClick={()=>setSortDir(sortDir==='asc'?'desc':'asc')}>{sortDir==='asc'?'↑':'↓'}</button>
                    </div>
                  </div>
                  {filteredSorted.length === 0 ? (
                    <p className="muted">Nenhum participante neste período.</p>
                  ) : (
                    <div className="people-layout">
                      <div className="people-list-wrapper">
                        <ul className="people-list">
                          {filteredSorted.map((p, i) => {
                            const isSelected = Boolean(p.id && p.id === selectedParticipantId);
                            return (
                              <li key={`${p.id || p.name}-${p.date}-${i}`}>
                                <button
                                  type="button"
                                  className={`people-row ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleSelectParticipant(p)}
                                >
                                  <div>
                                    <span className="person-name">{p.name}</span>
                                    {showContacts && (
                                      <div className="muted" style={{ fontSize:12 }}>
                                        {(p.email && p.email !== 'null') ? p.email : '—'} • {(p.phone && p.phone !== 'null') ? p.phone : '—'}
                                      </div>
                                    )}
                                  </div>
                                  <span className="person-date">{p.date ? formatPtDate(p.date) : '—'}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                        {hasMore && (
                          <div style={{ display:'flex', justifyContent:'center', marginTop:10 }}>
                            <button className="btn" onClick={loadMorePeople}>Carregar mais</button>
                          </div>
                        )}
                      </div>
                      <div className="people-detail-wrapper">
                        <div className="person-detail-card">
                          {selectedParticipantId === null ? (
                            <p className="muted">Selecione um participante para visualizar os percentuais.</p>
                          ) : participantDetailLoading ? (
                            <p className="muted">Carregando resultados…</p>
                          ) : participantDetailError ? (
                            <p className="error-text">{participantDetailError}</p>
                          ) : participantDetail ? (
                            <>
                              <div className="person-detail-header">
                                <h4>{participantDetail.name}</h4>
                                <span className="person-detail-meta">
                                  {participantDetail.date ? new Date(participantDetail.date).toLocaleDateString('pt-BR') : '—'}
                                </span>
                              </div>
                              <div className="detail-tags">
                                {participantDetail.topDom && (
                                  <span className="person-detail-topdom">
                                    Dom principal: {SCORE_LABELS[participantDetail.topDom as keyof typeof SCORE_LABELS] ?? participantDetail.topDom}
                                  </span>
                                )}
                                {participantDetail.ties && participantDetail.ties.length > 0 && (
                                  <span className="person-detail-topdom" style={{ background: 'rgba(34, 197, 94, 0.18)', color: '#bbf7d0' }}>
                                    Empates: {participantDetail.ties.map((t: string) => SCORE_LABELS[t as keyof typeof SCORE_LABELS] ?? t).join(', ')}
                                  </span>
                                )}
                              </div>
                              {participantScores.length > 0 ? (
                                <ul className="detail-scores">
                                  {participantScores.map((score) => (
                                    <li key={score.key} className="detail-score-item">
                                      <div className="detail-score-header">
                                        <span>{score.label}</span>
                                        <strong>{score.value.toFixed(1)}%</strong>
                                      </div>
                                      <div className="score-bar-track">
                                        <div
                                          className="score-bar-fill"
                                          style={{ width: `${Math.max(0, Math.min(100, score.value))}%`, background: score.color }}
                                        />
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="muted">Nenhum percentual registrado para este participante.</p>
                              )}
                              {(participantDetail.email || participantDetail.phone) && (
                                <div style={{ display: 'grid', gap: 4 }}>
                                  {participantDetail.email && (
                                    <div className="person-detail-meta">E-mail: {participantDetail.email}</div>
                                  )}
                                  {participantDetail.phone && (
                                    <div className="person-detail-meta">Telefone: {participantDetail.phone}</div>
                                  )}
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="muted">Selecione um participante para visualizar os percentuais.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-actions">
                  {filteredSorted.length > 0 && (
                    <>
                      <button className="btn" onClick={() => exportPeopleCSV(slug, modalDom!, filteredSorted)}>Exportar CSV</button>
                      {showContacts && filteredSorted.some(p => p.email) && (
                        <button className="btn" onClick={() => copyEmails(filteredSorted, toast)}>Copiar e-mails</button>
                      )}
                    </>
                  )}
                  <button className="btn ghost" onClick={() => setModalOpen(false)}>Fechar</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!loading && !summary && !error && (
        <p>Nenhum dado encontrado para este slug.</p>
      )}
    </div>
  );
}

function Card({ title, value, suffix, valueLabel, delta, deltaIsPercent }: { title: string; value?: number; suffix?: string; valueLabel?: string; delta?: number; deltaIsPercent?: boolean }) {
  let deltaNode: JSX.Element | null = null;
  if (typeof delta === 'number' && !Number.isNaN(delta)) {
    const up = delta > 0; const flat = delta === 0;
    const color = flat ? '#9fb2c5' : up ? '#22c55e' : '#ef4444';
    const sign = flat ? '' : up ? '+' : '';
    const text = `${sign}${deltaIsPercent ? Math.round(delta) : delta}${deltaIsPercent ? '%' : ''}`;
    deltaNode = (
      <span style={{
        marginLeft: 8,
        fontSize: 12,
        padding: '2px 6px',
        borderRadius: 999,
        border: `1px solid ${color}66`,
        color,
        background: `${color}1A`,
      }} aria-label={flat ? 'sem variação' : up ? 'aumento' : 'queda'}>
        {up ? '▲' : (flat ? '■' : '▼')} {text}
      </span>
    );
  }
  return (
    <div style={cardStyle} title={title}>
      <div style={cardTitle}>{title}</div>
      <div style={cardNumber}>
        {valueLabel ?? value}{suffix && value !== undefined ? suffix : ''}
        {deltaNode}
      </div>
    </div>
  );
}

function CardClickable({ title, value, color, onClick }: { title: string; value: number; color: string; onClick: () => void }) {
  return (
    <button className="card-clickable" onClick={onClick} title="Ver participantes" aria-label={`Ver participantes do dom ${title}`}>
      <div className="card-clickable-title">{title}</div>
      <div className="card-clickable-value">{value}</div>
      <div className="card-clickable-hint" style={{ color }}>Ver participantes</div>
    </button>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#0b1220",
  border: "1px solid #1f2a3a",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
};

const cardTitle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  color: "#9fb2c5",
};

const cardNumber: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700 as const,
  marginTop: 4,
  color: '#e5f3ff',
};

// Mini gráfico de barras por dia
function SparkBar({ series }: { series: { date: string; total: number }[] }) {
  const max = Math.max(...series.map(s => s.total), 1);
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${series.length}, 1fr)`, gap: 4, alignItems: 'end', height: 120, border: '1px solid #1e293b', borderRadius: 8, padding: 8, background: '#0b1220' }}>
        {series.map(item => (
          <div key={item.date}
               title={`${formatPtDate(item.date)}: ${item.total}`}
               style={{ background: 'linear-gradient(180deg, #34d399 0%, #22c55e 100%)', height: `${(item.total / max) * 100}%`, borderRadius: 4 }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9fb2c5', marginTop: 6 }}>
        <span>{formatPtDate(series[0].date)}</span>
        <span>{formatPtDate(series[series.length - 1].date)}</span>
      </div>
    </div>
  );
}

function downloadCSV(slug: string, data: ApiResponse | null) {
  if (!data) return;
  const lines: string[] = [];
  // resumo
  const s = data.summary;
  lines.push('tipo,chave,valor');
  lines.push(`resumo,total,${s.total}`);
  lines.push(`resumo,apostolico,${s.apostolo}`);
  lines.push(`resumo,profeta,${s.profeta}`);
  lines.push(`resumo,evangelista,${s.evangelista}`);
  lines.push(`resumo,pastor,${s.pastor}`);
  lines.push(`resumo,mestre,${s.mestre}`);
  lines.push(`resumo,empates,${(s as any).ties ?? 0}`);
  // série
  for (const d of data.series || []) {
    lines.push(`serie,${d.date},${d.total}`);
  }
  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `relatorio_${slug || 'igreja'}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function downloadPNG(el: HTMLElement | null) {
  if (!el) return;
  const canvas = await html2canvas(el as HTMLElement, { backgroundColor: null, scale: 2 });
  const link = document.createElement('a');
  link.download = 'cartoes_relatorio.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

async function exportPDF(el: HTMLElement | null) {
  if (!el) return;
  const canvas = await html2canvas(el, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth - 20; // 10mm margin
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let y = 10;
  if (imgHeight <= pageHeight - 20) {
    pdf.addImage(imgData, 'PNG', 10, y, imgWidth, imgHeight);
  } else {
    let remaining = imgHeight;
    let position = 10;
    const sliceHeight = pageHeight - 20; // per page usable height
    const ratio = imgWidth / canvas.width;
    const srcHeight = Math.floor((sliceHeight / ratio) * (canvas.width / imgWidth));
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d')!;
    tempCanvas.width = canvas.width;
    tempCanvas.height = srcHeight;
    let srcY = 0;
    while (remaining > 0) {
      ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      ctx.drawImage(canvas, 0, srcY, canvas.width, srcHeight, 0, 0, tempCanvas.width, tempCanvas.height);
      const part = tempCanvas.toDataURL('image/png');
      pdf.addImage(part, 'PNG', 10, position, imgWidth, sliceHeight);
      remaining -= sliceHeight;
      srcY += srcHeight;
      if (remaining > 0) {
        pdf.addPage();
        position = 10;
      }
    }
  }
  pdf.save('relatorio.pdf');
}

async function exportExecutivePDF(slug: string, data: ApiResponse | null, cardsEl: HTMLElement | null, distEl: HTMLElement | null) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 16;
  // Capa
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('Relatório por Igreja', pageWidth/2, y, { align:'center' });
  y += 10;
  pdf.setFontSize(12);
  pdf.setFont('helvetica','normal');
  const church = data?.churchName || slug || '(não informado)';
  const period = data?.period ? `${data.period.from || '—'} a ${data.period.to || '—'}` : '—';
  pdf.text(`Igreja: ${church}`, pageWidth/2, y, { align:'center' }); y+=6;
  pdf.text(`Período: ${period}`, pageWidth/2, y, { align:'center' }); y+=10;
  pdf.setDrawColor(30,41,59); pdf.line(20,y, pageWidth-20,y); y+=8;
  // KPIs
  const kpis = [
    `Respostas (período): ${data?.summary.total ?? 0}`,
    `Participação (período): ${data?.participation?.periodPct ?? 0}%`,
    `Empates: ${data?.summary.ties ?? 0}`,
  ];
  pdf.setFont('helvetica','normal');
  kpis.forEach((t) => { pdf.text(t, 20, y); y+=6; });
  y+=4;
  // Top participantes (opcional)
  const people = data?.peopleByDom || undefined;
  if (people) {
    const flatten: { name:string; date:string; dom:string }[] = [];
    const map: Record<string,string> = { apostolo:'Apostólico', profeta:'Profeta', evangelista:'Evangelista', pastor:'Pastor', mestre:'Mestre' };
    Object.entries(people).forEach(([k, arr]) => {
      arr.forEach((p:any)=> flatten.push({ name:p.name, date:String(p.date||''), dom: map[k]||k }));
    });
    flatten.sort((a,b)=> (a.date<b.date?1:-1));
    const top = flatten.slice(0,10);
    if (top.length>0) {
      pdf.setFont('helvetica','bold'); pdf.text('Top 10 participantes (recentes)', 20, y); y+=6; pdf.setFont('helvetica','normal');
      top.forEach((p)=> { pdf.text(`• ${p.name} — ${p.dom} — ${p.date}`, 22, y); y+=6; if (y>270){ pdf.addPage(); y=16;} });
    }
  }
  // Nova página: cartões (snapshot)
  if (cardsEl) {
    pdf.addPage();
    const canvas = await html2canvas(cardsEl, { scale:2 });
    const img = canvas.toDataURL('image/png');
    const w = pageWidth-20; const h = (canvas.height * w) / canvas.width;
    pdf.addImage(img, 'PNG', 10, 10, w, Math.min(h, 260));
  }
  // Nova página: distribuição por dom
  if (distEl) {
    pdf.addPage();
    const canvas = await html2canvas(distEl, { scale:2, backgroundColor:null });
    const img = canvas.toDataURL('image/png');
    const w = pageWidth-20; const h = (canvas.height * w) / canvas.width;
    pdf.setFont('helvetica','bold'); pdf.text('Distribuição por dom', 10, 10);
    pdf.addImage(img, 'PNG', 10, 14, w, Math.min(h, 260));
  }
  pdf.save(`relatorio_${slug||'igreja'}.pdf`);
}

function copyPublicLink(slug: string, from: string, to: string, toast: AdminToastApi) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${origin}/#/r/${slug}?from=${encodeURIComponent(from||'')}&to=${encodeURIComponent(to||'')}`;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url)
      .then(() => toast.success('Link copiado', 'Compartilhe o painel público com a sua igreja.'))
      .catch(() => fallback());
  } else {
    fallback();
  }

  function fallback() {
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      toast.success('Link copiado', 'Compartilhe o painel público com a sua igreja.');
    } catch {
      toast.error('Não foi possível copiar', 'Copie manualmente e tente novamente.');
    }
    document.body.removeChild(ta);
  }
}

function shareReportLink(slug: string, from: string, to: string, toast: AdminToastApi) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${origin}/#/relatorio/${slug}?from=${encodeURIComponent(from||'')}&to=${encodeURIComponent(to||'')}`;
  const title = `Relatório — ${slug}`;
  if ((navigator as any).share) {
    (navigator as any).share({ title, url }).catch(() => copyToClipboard(url));
  } else {
    copyToClipboard(url);
  }

  function copyToClipboard(text: string) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => toast.success('Link copiado', 'O link do relatório foi copiado.'))
        .catch(() => fallback(text));
    } else {
      fallback(text);
    }
  }

  function fallback(t: string) {
    const ta = document.createElement('textarea');
    ta.value = t;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      toast.success('Link copiado', 'O link do relatório foi copiado.');
    } catch {
      toast.error('Não foi possível copiar', 'Copie manualmente e tente novamente.');
    }
    document.body.removeChild(ta);
  }
}
/* function exportPeopleCSV(slug: string, dom: string, list: { name: string; date: string }[]) {
  const lines = ['nome,data,dom'];
  for (const p of list) {
    const nome = p.name.replace(/"/g, """");
    lines.push(`"${nome}",${p.date},${dom}`);
  }
  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `participantes_${slug}_${dom}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
} */

function exportPeopleCSV(slug: string, dom: string, list: { name: string; date: string }[]) {
  const lines: string[] = ['nome,data,dom'];
  for (const p of list) {
    const nome = String(p.name || '').replace(/"/g, '""');
    lines.push(`"${nome}",${p.date},${dom}`);
  }
  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `participantes_${slug}_${dom}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function copyEmails(list: { email?: string | null }[], toast: AdminToastApi) {
  // Extrai e deduplica e-mails válidos
  const emails = Array.from(new Set(
    (list || [])
      .map((p) => (p.email || '').trim())
      .filter((e): e is string => !!e && /@/.test(e))
  ));
  if (emails.length === 0) {
    toast.info('Nenhum e-mail disponível', 'Cadastre participantes com e-mail para exportar.');
    return;
  }
  const text = emails.join('; ');
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('E-mails copiados', `${emails.length} e-mail(s) prontos para uso.`);
      })
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }

  function fallbackCopy(t: string) {
    const ta = document.createElement('textarea');
    ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try {
      document.execCommand('copy');
      toast.success('E-mails copiados', `${emails.length} e-mail(s) prontos para uso.`);
    } catch {
      toast.error('Não foi possível copiar', 'Copie manualmente e tente novamente.');
    }
    document.body.removeChild(ta);
  }
}

export default function ChurchReport() {
  return (
    <AdminToastProvider>
      <ChurchReportInner />
    </AdminToastProvider>
  );
}

// (removido) função de copiar link do relatório — não utilizada

// Linha de barra com rótulo interno e tooltip
function BarRow({ label, value, pct, mode = 'pct', maxCount = 1, color }: { label: string; value: number; pct: number; mode?: 'pct' | 'count'; maxCount?: number; color?: string }) {
  const barColor = color || '#22c55e';
  const bgColor = '#0f172a';
  const border = '#1e293b';
  const text = '#e5f3ff';
  const widthPct = mode === 'pct' ? pct : Math.round((value / Math.max(1, maxCount)) * 100);
  const small = widthPct < 12;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ color: '#64748b' }}>{value} ({pct}%)</span>
      </div>
      <div style={{ position: 'relative', background: bgColor, borderRadius: 8, height: 18, overflow: 'hidden', border: `1px solid ${border}` }}
           title={`${label}: ${value} (${pct}%)`}>
        <div style={{ width: `${widthPct}%`, height: '100%', background: barColor, transition: 'width 300ms ease' }} />
        {!small ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', paddingLeft: 8, color: text, fontSize: 12, fontWeight: 700 as const }}>
            {mode === 'pct' ? `${pct}%` : value}
          </div>
        ) : (
          <div style={{ position: 'absolute', right: 8, top: 0, bottom: 0, display: 'flex', alignItems: 'center', color: '#9fb2c5', fontSize: 12 }}>
            {mode === 'pct' ? `${pct}%` : value}
          </div>
        )}
      </div>
    </div>
  );
}

function formatPtDate(d: string) {
  const [y, m, day] = d.split('-').map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, day || 1));
  return dt.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function formatRelTime(iso: string) {
  try {
    const dt = new Date(iso);
    const diffMs = Date.now() - dt.getTime();
    const minutes = Math.round(diffMs / 60000);
    const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
    if (Math.abs(minutes) < 60) return rtf.format(-minutes, 'minute');
    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 48) return rtf.format(-hours, 'hour');
    const days = Math.round(hours / 24);
    return rtf.format(-days, 'day');
  } catch { return ''; }
}

function buildProfileItems(summary: Summary): ProfileItem[] {
  const total = summary.total;
  if (!total || total <= 0) return [];
  return PROFILE_DOMS.map((dom) => {
    const value = summary[dom.key];
    const pct = total > 0 ? (value / total) * 100 : 0;
    return { ...dom, value, pct };
  }).sort((a, b) => (b.value - a.value) || (b.pct - a.pct));
}

function computeStatusKey(items: ProfileItem[]): "green" | "yellow" | "red" {
  const maxPct = Math.max(...items.map((item) => item.pct));
  const zeroItems = items.filter((item) => item.value === 0 || item.pct === 0);
  if (maxPct >= BALANCE_DOMINANCE_PCT || zeroItems.length >= BALANCE_ABSENT_COUNT) return "red";
  if (maxPct <= BALANCE_EVEN_PCT && zeroItems.length === 0) return "green";
  return "yellow";
}

function buildScenarioNarrative(args: {
  statusKey: "green" | "yellow" | "red";
  topItems: ProfileItem[];
  absentItems: ProfileItem[];
  lowItems: ProfileItem[];
  secondItem?: ProfileItem | null;
}): {
  balanceReadingAddon: string;
  balanceRiskText: string;
  profileInsightAddon: string;
  recommendationsEmptyText: string;
  nextStepSubtitleAddon: string;
} {
  const topExprs = joinList(args.topItems.map((item) => EXPRESSIONS_MAP[item.key].expressionTitle));
  const absentNames = joinList(args.absentItems.map((item) => item.lower));
  const lowNames = joinList(args.lowItems.map((item) => item.lower));
  const absentRisks = joinList(args.absentItems.slice(0, 2).map((item) => EXPRESSIONS_MAP[item.key].expressionRiskIfAbsent));
  const lowRisks = joinList(args.lowItems.slice(0, 2).map((item) => EXPRESSIONS_MAP[item.key].expressionRiskIfAbsent));
  const dominantRisk = args.topItems.length === 1
    ? EXPRESSIONS_MAP[args.topItems[0].key].expressionRiskIfDominant
    : "centralização gradual de uma expressão";

  if (args.statusKey === "green") {
    return {
      balanceReadingAddon: "Mesmo em cenários cooperativos, o processo precisa de acompanhamento para evitar acomodação.",
      balanceRiskText:
        "Quando há cooperação, o risco é a acomodação que permite centralização gradual; o convite pastoral é sustentar práticas que mantenham o corpo em cooperação.",
      profileInsightAddon:
        "Esse retrato sugere cooperação percebida, mas lembra que a caminhada exige discernimento contínuo e acompanhamento pastoral.",
      recommendationsEmptyText:
        "Não há expressões ausentes neste período; o convite é sustentar práticas que preservem a cooperação do corpo.",
      nextStepSubtitleAddon:
        "Com acompanhamento, preservem a cooperação e evitem centralização gradual.",
    };
  }

  if (args.statusKey === "yellow") {
    const riskText = lowRisks || absentRisks
      ? `Quando algumas expressões aparecem de forma discreta, pode haver ${lowRisks || absentRisks}; o convite é agir com intencionalidade pastoral.`
      : "Há risco de desequilíbrio por falta de intencionalidade pastoral; o convite é ajustar com cuidado.";
    return {
      balanceReadingAddon: "Há cooperação percebida, mas algumas expressões precisam de atenção para não ficarem discretas.",
      balanceRiskText: riskText,
      profileInsightAddon:
        "Esse retrato sugere cooperação real, mas pede intencionalidade para que nenhuma expressão fique à margem no processo.",
      recommendationsEmptyText:
        "Ainda que não haja ausências claras, vale observar expressões discretas e encorajar participação com acompanhamento.",
      nextStepSubtitleAddon:
        "Com intencionalidade pastoral, fortaleçam as expressões discretas.",
    };
  }

  const redRiskParts: string[] = [];
  if (args.absentItems.length > 0) {
    redRiskParts.push(`Quando ${absentNames} não se expressam, a igreja tende a experimentar ${absentRisks}.`);
  }
  if (args.lowItems.length > 0) {
    redRiskParts.push(`Quando ${lowNames} aparecem com menos força, pode haver ${lowRisks}.`);
  }
  if (args.topItems.length === 1) {
    redRiskParts.push(`Quando ${topExprs} assume o centro sozinho, pode surgir ${dominantRisk}.`);
  }
  const redRiskText = redRiskParts.length > 0
    ? `${redRiskParts.join(" ")} O convite é ajustar com passos pequenos e acompanhados.`
    : "Há sinais de concentração funcional; o convite é ajustar com passos pequenos e acompanhados.";

  return {
    balanceReadingAddon: "Há lacunas ou concentração forte; a resposta pastoral é fortalecer cooperação com passos simples.",
    balanceRiskText: redRiskText,
    profileInsightAddon:
      "Esse retrato aponta lacunas funcionais do corpo e chama para passos pequenos, com formação e acompanhamento pastoral.",
    recommendationsEmptyText:
      "Mesmo sem ausências claras, pode haver lacunas funcionais; vale revisar o período e manter o acompanhamento pastoral.",
    nextStepSubtitleAddon:
      "Com passos pequenos e acompanhados, busquem restaurar a cooperação do corpo.",
  };
}

function formatPct(pct: number) {
  if (!Number.isFinite(pct)) return "0%";
  if (pct <= 0) return "0%";
  if (pct < 10) return `${pct.toFixed(1).replace(".", ",")}%`;
  return `${Math.round(pct)}%`;
}

function joinList(items: string[]) {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} e ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;
}

function buildBalanceIndex(items: ProfileItem[]) {
  const statusKey = computeStatusKey(items);
  const zeroItems = items.filter((item) => item.value === 0 || item.pct === 0);
  const lowItems = items.filter((item) => item.pct > 0 && item.pct <= LOW_PCT_THRESHOLD);
  const presentItems = items.filter((item) => item.value > 0);

  const labels = {
    green: { indicator: "🟢", label: "Equilibrada" },
    yellow: { indicator: "🟡", label: "Parcialmente equilibrada" },
    red: { indicator: "🔴", label: "Desequilíbrio ministerial" },
  } as const;

  const sortedPresent = [...presentItems].sort((a, b) => b.pct - a.pct);
  const top = sortedPresent[0];
  const second = sortedPresent[1];
  const maxValue = presentItems.length > 0 ? Math.max(...presentItems.map((item) => item.value)) : 0;
  const topItems = presentItems.filter((item) => item.value === maxValue);
  const scenario = buildScenarioNarrative({
    statusKey,
    topItems,
    absentItems: zeroItems,
    lowItems,
    secondItem: second ?? null,
  });

  let mature = "";
  if (topItems.length === 1) {
    const expr = EXPRESSIONS_MAP[topItems[0].key];
    mature = `Há sinais de ênfase percebida em ${expr.expressionTitle}, o que tende a fortalecer ${expr.expressionShort} se for acompanhado com cuidado.`;
  } else if (topItems.length === 2) {
    const exprA = EXPRESSIONS_MAP[topItems[0].key];
    const exprB = EXPRESSIONS_MAP[topItems[1].key];
    mature = `Há sinais de ênfases percebidas em ${exprA.expressionTitle} e ${exprB.expressionTitle}, com potencial de cooperação entre ${exprA.expressionShort} e ${exprB.expressionShort}.`;
  } else if (topItems.length > 2) {
    const exprNames = joinList(topItems.map((item) => EXPRESSIONS_MAP[item.key].expressionTitle));
    mature = `Há sinais de diversidade funcional percebida entre ${exprNames}, indicando potencial para servir o corpo com maior unidade.`;
  }

  let imbalance = scenario.balanceRiskText;

  let reading = "";
  if (presentItems.length === 1 && top) {
    const expr = EXPRESSIONS_MAP[top.key];
    reading = `Este índice indica um retrato comunitário com concentração funcional em ${expr.expressionTitle}, o que sugere atenção pastoral para que a cooperação do corpo não se reduza a uma expressão. `;
  } else if (presentItems.length > 1 && top) {
    if (second && second.pct > LOW_PCT_THRESHOLD) {
      const exprA = EXPRESSIONS_MAP[top.key];
      const exprB = EXPRESSIONS_MAP[second.key];
      reading = `Este índice indica um retrato comunitário com cooperação mais visível entre ${exprA.expressionTitle} e ${exprB.expressionTitle}, ainda que outras expressões possam precisar de espaço. `;
    } else {
      const expr = EXPRESSIONS_MAP[top.key];
      reading = `Este índice indica um retrato comunitário com maior ênfase em ${expr.expressionTitle} e menor visibilidade de outras expressões. `;
    }
  }
  reading += "A partir disso, as recomendações a seguir não buscam corrigir números, mas fortalecer a cooperação do corpo.";
  reading = `${reading} ${scenario.balanceReadingAddon}`;

  return {
    statusKey,
    indicator: labels[statusKey].indicator,
    label: labels[statusKey].label,
    reading,
    mature,
    imbalance,
  };
}

function buildRecommendations(items: ProfileItem[]): RecommendationItem[] {
  const lowItems = items.filter((item) => item.value === 0 || item.pct <= LOW_PCT_THRESHOLD);
  if (lowItems.length === 0) return [];
  const ordered = [...lowItems].sort((a, b) => {
    if (a.value === 0 && b.value !== 0) return -1;
    if (b.value === 0 && a.value !== 0) return 1;
    return a.pct - b.pct;
  });
  return ordered
    .map((item) => {
      const data = RECOMMENDATION_MAP[item.key];
      const expr = EXPRESSIONS_MAP[item.key];
      if (!data) return null;
      const status = item.value === 0 || item.pct === 0 ? "ausente" : "com baixa expressão";
      const expressionWhy = `Quando esta expressão é fortalecida, a igreja tende a superar ${expr.expressionRiskIfAbsent}.`;
      return {
        key: item.key,
        label: item.label,
        status,
        expressionTitle: expr.expressionTitle,
        expressionShort: expr.expressionShort,
        expressionWhy,
        suggestions: data.suggestions.slice(0, 3),
        verse: data.verse,
        verseRef: data.verseRef,
      } satisfies RecommendationItem;
    })
    .filter((item): item is RecommendationItem => Boolean(item));
}

function buildNextStep(items: ProfileItem[], total: number) {
  const statusKey = computeStatusKey(items);
  const zeroItems = items.filter((item) => item.value === 0 || item.pct === 0);
  const sortedAsc = [...items].sort((a, b) => a.pct - b.pct);
  const sortedDesc = [...items].sort((a, b) => b.pct - a.pct);
  const lowestExprs = joinList(sortedAsc.slice(0, 2).map((item) => EXPRESSIONS_MAP[item.key].expressionTitle));
  const dominant = sortedDesc[0];
  const dominantExpr = dominant ? EXPRESSIONS_MAP[dominant.key].expressionTitle : "uma expressão";
  const maxValue = sortedDesc.length > 0 ? sortedDesc[0].value : 0;
  const topItems = sortedDesc.filter((item) => item.value === maxValue);
  const lowItems = items.filter((item) => item.pct > 0 && item.pct <= LOW_PCT_THRESHOLD);
  const scenario = buildScenarioNarrative({
    statusKey,
    topItems,
    absentItems: zeroItems,
    lowItems,
    secondItem: sortedDesc[1] ?? null,
  });

  if (total < 10) {
    return {
      title: "Plano 30/60/90 dias",
      subtitle: `Caminho pastoral para ampliar a participação com leveza. ${scenario.nextStepSubtitleAddon}`,
      bullets30: [
        "Reforcem o convite ao teste com uma palavra pastoral curta no culto e nos grupos.",
        "Explique que o teste revela percepções e é um primeiro passo para cuidado do corpo.",
        "Abram um período de escuta para acolher dúvidas e orações dos participantes.",
      ],
      bullets60: [
        "Compartilhem um testemunho simples de quem participou e se sentiu edificado.",
        "Reservem um momento nos encontros para esclarecer a finalidade do relatório.",
        "Acompanhem quem iniciou o teste e ofereçam apoio para concluir.",
      ],
      bullets90: [
        "Reúnam a liderança para ler os dados com calma e definir um foco pastoral inicial.",
        "Iniciem uma prática comunitária leve que fortaleça o corpo como um todo.",
        "Registrem aprendizados e preparem o próximo ciclo de participação.",
      ],
      note: "Lembrete: o teste mostra percepções; a ativação acontece com discipulado e prática comunitária.",
      optionalSupport:
        "Se a liderança desejar transformar esse retrato em ativação prática, um acompanhamento (online ou presencial) ajuda a traduzir as expressões em rotinas, treinar líderes por dom e acompanhar sinais simples de progresso.",
    };
  }

  if (statusKey === "red") {
    const practiceMap: Record<ProfileDomKey, string> = {
      apostolo: "uma pequena ação de envio local e abertura de novas frentes",
      profeta: "um encontro de oração e escuta para discernimento e santidade",
      evangelista: "uma iniciativa de acolhimento e anúncio das boas-novas",
      pastor: "uma rotina de cuidado mútuo em grupos e visitas",
      mestre: "uma trilha curta de ensino bíblico básico",
    };
    const primaryLow = sortedAsc[0];
    const practice = primaryLow ? practiceMap[primaryLow.key] : "uma prática simples ligada às expressões frágeis";
    return {
      title: "Plano 30/60/90 dias",
      subtitle: `Caminho pastoral para restaurar a cooperação do corpo. ${scenario.nextStepSubtitleAddon}`,
      bullets30: [
        "Separem um tempo de oração e diagnóstico pastoral para compreender as lacunas do corpo.",
        `Mapeiem quais expressões estão mais frágeis, especialmente ${lowestExprs}.`,
        "Formem um pequeno time de acompanhamento para sustentar o processo com graça.",
      ],
      bullets60: [
        `Iniciem mentoria e treino simples para os dons ligados a ${lowestExprs}.`,
        "Criem rotinas leves de formação bíblica e prática supervisionada.",
        "Acompanhem passos pequenos e constantes, sem pressão por resultados rápidos.",
      ],
      bullets90: [
        `Realizem a primeira prática mensurável: ${practice}.`,
        "Avaliem juntos o que gerou edificação e onde ajustar o caminho.",
        `Reequilibrem o corpo, evitando centralizar tudo em ${dominantExpr}.`,
      ],
      note: "Lembrete: o teste mostra percepções; a ativação acontece com discipulado e prática comunitária.",
      optionalSupport:
        "Se a liderança desejar transformar esse retrato em ativação prática, um acompanhamento (online ou presencial) ajuda a traduzir as expressões em rotinas, treinar líderes por dom e acompanhar sinais simples de progresso.",
    };
  }

  if (statusKey === "yellow") {
    return {
      title: "Plano 30/60/90 dias",
      subtitle: `Caminho pastoral para fortalecer o que está discreto. ${scenario.nextStepSubtitleAddon}`,
      bullets30: [
        `Reconheçam a força atual de ${dominantExpr} sem deixar as demais expressões apagadas.`,
        `Identifiquem pessoas com inclinação para ${lowestExprs} e ofereçam mentoria simples.`,
        "Estabeleçam um ritmo semanal de oração e escuta para discernimento do corpo.",
      ],
      bullets60: [
        "Rodem pequenos pilotos, um por expressão mais discreta, em grupos ou ministérios.",
        "Acompanhem com líderes próximos, avaliando sinais de edificação.",
        "Guardem o processo com formação bíblica e unidade pastoral.",
      ],
      bullets90: [
        "Consolidem os pilotos que trouxeram fruto e descartem o que não serviu.",
        "Escolham uma prioridade por trimestre para manter foco e continuidade.",
        "Registrem aprendizados e planejem o próximo ciclo de cooperação.",
      ],
      note: "Lembrete: o teste mostra percepções; a ativação acontece com discipulado e prática comunitária.",
      optionalSupport:
        "Se a liderança desejar transformar esse retrato em ativação prática, um acompanhamento (online ou presencial) ajuda a traduzir as expressões em rotinas, treinar líderes por dom e acompanhar sinais simples de progresso.",
    };
  }

  return {
    title: "Plano 30/60/90 dias",
    subtitle: `Caminho pastoral para preservar o equilíbrio e amadurecer o corpo. ${scenario.nextStepSubtitleAddon}`,
    bullets30: [
      "Preservem o equilíbrio, treinando líderes para reconhecer e encorajar cada expressão.",
      "Orem juntos pedindo discernimento e humildade para cooperar.",
      "Abram espaço para novos participantes praticarem dons de forma acompanhada.",
    ],
    bullets60: [
      "Organizem prática supervisionada em pequenos grupos e ministérios.",
      "Promovam mentoria curta para quem demonstra inclinação ministerial.",
      "Acompanhem sinais de edificação e unidade nas equipes.",
    ],
    bullets90: [
      "Criem uma rotina mensal de alinhamento entre expressões do corpo.",
      "Escolham um foco comunitário que integre missão, cuidado e ensino.",
      "Registrem avanços e ajustem o processo com simplicidade.",
    ],
    note: "Lembrete: o teste mostra percepções; a ativação acontece com discipulado e prática comunitária.",
    optionalSupport:
      "Se a liderança desejar transformar esse retrato em ativação prática, um acompanhamento (online ou presencial) ajuda a traduzir as expressões em rotinas, treinar líderes por dom e acompanhar sinais simples de progresso.",
  };
}

function buildExecutiveSummary(items: ProfileItem[], total: number) {
  const sortedDesc = [...items].sort((a, b) => b.pct - a.pct);
  const sortedAsc = [...items].sort((a, b) => a.pct - b.pct);
  const maxValue = sortedDesc.length > 0 ? sortedDesc[0].value : 0;
  const topItems = sortedDesc.filter((item) => item.value === maxValue);
  const topExprs = joinList(topItems.map((item) => EXPRESSIONS_MAP[item.key].expressionTitle));
  const lowExprs = joinList(sortedAsc.slice(0, 2).map((item) => EXPRESSIONS_MAP[item.key].expressionTitle));

  const zeroItems = items.filter((item) => item.value === 0 || item.pct === 0);
  const maxPct = Math.max(...items.map((item) => item.pct));
  const statusKey: "green" | "yellow" | "red" =
    maxPct >= BALANCE_DOMINANCE_PCT || zeroItems.length >= BALANCE_ABSENT_COUNT
      ? "red"
      : maxPct <= BALANCE_EVEN_PCT && zeroItems.length === 0
        ? "green"
        : "yellow";
  const statusLabel = statusKey === "green" ? "equilibrado" : statusKey === "yellow" ? "parcialmente equilibrado" : "concentrado";

  if (total < 10) {
    return {
      title: "Resumo Executivo (para líderes)",
      lines: [
        "Há poucos dados neste período; o retrato ainda é inicial.",
        "O teste ajuda a mapear percepções e inclinações ministeriais do corpo.",
        "Prioridade pastoral: ampliar a participação com convites simples e cuidado.",
        "Explique que o relatório orienta discernimento, não conclui maturidade.",
        "Use este momento para formar líderes e preparar práticas acompanhadas.",
        "Próximo passo (30 dias): mobilizar respostas e ouvir a comunidade.",
      ],
      base: "Ef 4.11–16; 1Co 12",
    };
  }

  return {
    title: "Resumo Executivo (para líderes)",
    lines: [
      `Ênfase percebida no período: ${topExprs}.`,
      `Leitura do equilíbrio: cenário ${statusLabel}, com foco em cooperação.`,
      `Expressões a fortalecer: ${lowExprs}.`,
      "Este retrato é baseado em respostas e não confirma ativação ou maturidade.",
      "Resultado equilibrado ou concentrado pede discernimento e acompanhamento pastoral.",
      "Próximo passo (30 dias): escolher 1 expressão para fortalecer e iniciar uma prática simples acompanhada.",
    ],
    base: "Ef 4.11–16; 1Co 12",
  };
}

function buildPastoralInsight(primary: ProfileItem[], secondary: ProfileItem | null, lowItems: ProfileItem[], statusKey?: "green" | "yellow" | "red") {
  const sentences: string[] = [];
  const exprNames = joinList(primary.map((item) => EXPRESSIONS_MAP[item.key].expressionTitle));
  const exprShorts = joinList(primary.map((item) => EXPRESSIONS_MAP[item.key].expressionShort));

  sentences.push(`Com base nas respostas, percebe-se uma ênfase ministerial em ${exprNames}, sinalizando ${exprShorts} como tendência percebida.`);
  sentences.push("Essa leitura não afirma que os dons estejam ativados ou maduros; a ativação acontece com prática, discipulado e organização comunitária.");
  sentences.push("A plenitude de Cristo se expressa quando as funções cooperam e servem ao corpo em unidade, e este relatório aponta caminhos para esse processo.");

  if (lowItems.length > 0) {
    const weaker = joinList(lowItems.slice(0, 2).map((item) => EXPRESSIONS_MAP[item.key].expressionTitle));
    sentences.push(`Há oportunidade de criar espaço e fortalecer ${weaker}, para que essas expressões também sirvam ao corpo com liberdade.`);
  } else {
    sentences.push("Quando não há grandes ausências, o desafio é preservar o equilíbrio e evitar que uma única expressão se centralize.");
  }

  if (statusKey) {
    const absentItems = lowItems.filter((item) => item.value === 0 || item.pct === 0);
    const lowOnly = lowItems.filter((item) => item.pct > 0 && item.pct <= LOW_PCT_THRESHOLD);
    const scenario = buildScenarioNarrative({
      statusKey,
      topItems: primary,
      absentItems,
      lowItems: lowOnly,
      secondItem: secondary ?? null,
    });
    sentences.push(scenario.profileInsightAddon);
  }

  sentences.push("Esse entendimento prepara o caminho para ler o equilíbrio do corpo e seguir com passos acompanhados.");

  return sentences;
}

// Card de destaque para o maior dom
function HighlightCard({ title, label, percent, color, hint, className }: { title: string; label: string; percent: number; color: string; hint?: string; className?: string }) {
  return (
    <div className={className}
         style={{
      borderRadius: 12,
      padding: 16,
      background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
      border: `1px solid ${color}66`,
      boxShadow: `0 8px 24px ${color}22`,
      display: 'grid',
      gap: 6,
    }} title={`${title}: ${label} (${percent}%)`}>
      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: .5, color: '#cfe5ff' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#eaf6ff' }}>{label}</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: color }}>{percent}%</span>
      </div>
      {hint && <div style={{ fontSize: 12, color: '#9fb2c5' }}>{hint}</div>}
    </div>
  );
}
