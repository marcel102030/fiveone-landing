
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import html2canvas from "html2canvas";
import "./ChurchReport.css";

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
  error?: string;
};

// Lê querystring do hash (HashRouter)
function useHashQuery() {
  const { hash } = useLocation();
  return useMemo(() => new URLSearchParams(hash.includes("?") ? hash.split("?")[1] : ""), [hash]);
}

export default function ChurchReport() {
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

  // Slug pode vir por /relatorio/:slug OU por ?churchSlug=
  const slug = params.slug || query.get("churchSlug") || "";

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';
        const qs = new URLSearchParams({ churchSlug: slug, from, to, tz }).toString();
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

  return (
    <div className="report-wrap">
      <h1 className="report-title">Relatório por Igreja</h1>
      <p className="report-sub">
        Igreja: <strong>{data?.churchName || "(não informado)"}</strong>
        {" "}• Slug: <strong>{data?.slug || slug || "(n/d)"}</strong>
      </p>

      {/* Filtros de período */}
      <div className="toolbar">
        <div className="toolbar-left">
          <label className="field">
            <span>De</span>
            <input className="input-date" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="field">
            <span>Até</span>
            <input className="input-date" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <button className="btn pill" onClick={() => { setFrom(thirtyDaysAgoIso); setTo(todayIso); }}>Últimos 30 dias</button>
          <button className="btn pill ghost" onClick={() => { setFrom("" as any); setTo("" as any); }}>Tudo</button>
        </div>
        <div className="toolbar-right">
          <Link to={`/c/${data?.slug || slug}`} target="_blank" rel="noopener noreferrer">
            <button className="btn">Abrir teste</button>
          </Link>
        </div>
      </div>

      {loading && <p>Carregando dados…</p>}
      {error && <p style={{ color: "#ef4444" }}>Erro: {error}</p>}

      {summary && (
        <>
          {/* Cards de totais */}
          <div className="cards-wrap" ref={containerRef}>
            {/* Grupo 1: Dons */}
            <h3 className="group-title">Dons</h3>
            <div className="cards cards-doms">
              {bars.length > 0 && (
                <HighlightCard
                  title="Maior dom"
                  label={bars[0].label}
                  percent={bars[0].pct}
                  color={domColors[bars[0].label] || "#22c55e"}
                  hint={bars[1] ? `+${bars[0].pct - bars[1].pct}% vs 2º (${bars[1].label})` : undefined}
                />
              )}
              <Card title="Apostólico" value={summary.apostolo} />
              <Card title="Profeta" value={summary.profeta} />
              <Card title="Evangelista" value={summary.evangelista} />
              <Card title="Pastor" value={summary.pastor} />
              <Card title="Mestre" value={summary.mestre} />
            </div>

            {/* Separador visual entre grupos */}
            <div className="cards-separator" role="separator" aria-label="Separador de seções" />

            {/* Grupo 2: Métricas gerais */}
            <h3 className="group-title">Resultados</h3>
            <div className="cards cards-metrics">
              <Card title="Respostas (período)" value={summary.total} />
              <Card title="Participação (período)" value={(data?.participation?.periodPct ?? 0)} suffix="%" />
              <Card title="Empates" value={summary.ties ?? 0} />
            </div>
          </div>

          {/* Barras */}
          <h2 className="section-title">Distribuição por dom</h2>
          <div className="legend">
            {Object.entries(domColors).map(([name, color]) => (
              <div key={name} className="legend-item">
                <span className="legend-dot" style={{ background: color }} />
                <span>{name}</span>
              </div>
            ))}
          </div>
          {bars.length === 0 ? (
            <p>Nenhum dado suficiente para mostrar gráfico.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {bars.map((b) => (
                <BarRow key={b.label} label={b.label} value={b.value} pct={b.pct} color={domColors[b.label] || '#22c55e'} />
              ))}
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
            <button className="btn ghost" onClick={() => downloadPNG(containerRef.current)}>Baixar imagem dos cartões</button>
          </div>
        </>
      )}

      {!loading && !summary && !error && (
        <p>Nenhum dado encontrado para este slug.</p>
      )}
    </div>
  );
}

function Card({ title, value, suffix }: { title: string; value: number; suffix?: string }) {
  return (
    <div style={cardStyle} title={title}>
      <div style={cardTitle}>{title}</div>
      <div style={cardNumber}>{value}{suffix ? suffix : ''}</div>
    </div>
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

// Linha de barra com rótulo interno e tooltip
function BarRow({ label, value, pct, color }: { label: string; value: number; pct: number; color?: string }) {
  const barColor = color || '#22c55e';
  const bgColor = '#0f172a';
  const border = '#1e293b';
  const text = '#e5f3ff';
  const small = pct < 12;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ color: '#64748b' }}>{value} ({pct}%)</span>
      </div>
      <div style={{ position: 'relative', background: bgColor, borderRadius: 8, height: 18, overflow: 'hidden', border: `1px solid ${border}` }}
           title={`${label}: ${value} (${pct}%)`}>
        <div style={{ width: `${pct}%`, height: '100%', background: barColor, transition: 'width 300ms ease' }} />
        {!small ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', paddingLeft: 8, color: text, fontSize: 12, fontWeight: 700 as const }}>
            {pct}%
          </div>
        ) : (
          <div style={{ position: 'absolute', right: 8, top: 0, bottom: 0, display: 'flex', alignItems: 'center', color: '#9fb2c5', fontSize: 12 }}>
            {pct}%
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

// Card de destaque para o maior dom
function HighlightCard({ title, label, percent, color, hint }: { title: string; label: string; percent: number; color: string; hint?: string }) {
  return (
    <div style={{
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
