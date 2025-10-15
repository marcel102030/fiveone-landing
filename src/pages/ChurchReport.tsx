
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

  // Paleta de cores por dom
  const domColors: Record<string, string> = {
    "Apostólico": "#22c55e",   // verde
    "Profeta": "#f472b6",      // rosa
    "Evangelista": "#06b6d4",  // ciano
    "Pastor": "#f59e0b",       // âmbar
    "Mestre": "#60a5fa",       // azul
  };

  // Modal de participantes
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDom, setModalDom] = useState<"Apostólico" | "Profeta" | "Evangelista" | "Pastor" | "Mestre" | null>(null);
  const participants = useMemo((): { name: string; date: string }[] => {
    if (!data?.peopleByDom || !modalDom) return [] as { name: string; date: string }[];
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
  const [list, setList] = useState<{ id?: string; name: string; date: string; email?: string; phone?: string }[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (modalOpen) {
      // inicia com o snapshot do summary
      setList(participants as any);
      setPage(0);
      setHasMore((participants?.length || 0) >= 200);
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
                    <ul className="people-list">
                      {filteredSorted.map((p, i) => (
                        <li key={`${p.name}-${p.date}-${i}`}>
                          <div>
                            <span className="person-name">{p.name}</span>
                            {showContacts && (
                              <div className="muted" style={{ fontSize:12 }}>
                                {p.email || '—'} • {p.phone || '—'}
                              </div>
                            )}
                          </div>
                          <span className="person-date">{formatPtDate(p.date)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {hasMore && (
                    <div style={{ display:'flex', justifyContent:'center', marginTop:10 }}>
                      <button className="btn" onClick={loadMorePeople}>Carregar mais</button>
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
