import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import "./AdministracaoFiveOne.css";
import "./AdminChurches.css";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ChurchRef { name: string; city: string; slug: string; }

interface QuizRow {
  id: string;
  person_name: string | null;
  person_email: string | null;
  person_phone: string | null;
  scores_json: Record<string, number>;
  top_dom: string;
  ties: string[];
  source: string | null;
  device_type: string | null;
  completion_seconds: number | null;
  result_token: string | null;
  church_id: string | null;
  created_at: string;
  church: ChurchRef | null;
}

interface Summary {
  domDistribution: Record<string, number>;
  thisMonth: number;
  avgSeconds: number | null;
  totalAll: number;
}

interface ApiResult {
  ok: boolean;
  total: number;
  page: number;
  limit: number;
  results: QuizRow[];
  summary: Summary;
}

// ─── Constantes de dom ────────────────────────────────────────────────────────

const DOM_LABELS: Record<string, string> = {
  apostolo: 'Apóstolo', profeta: 'Profeta',
  evangelista: 'Evangelista', pastor: 'Pastor', mestre: 'Mestre',
};
const DOM_COLORS: Record<string, string> = {
  apostolo: '#1b6ea5', profeta: '#a80d0d',
  evangelista: '#cfb012', pastor: '#9B59B6', mestre: '#2f994a',
};
const DOM_ORDER = ['apostolo', 'profeta', 'evangelista', 'pastor', 'mestre'];

const SOURCE_LABELS: Record<string, string> = {
  direct: 'Direto', church_invite: 'Igreja', organic: 'Orgânico', qr_code: 'QR Code',
};
const DEVICE_ICONS: Record<string, string> = {
  mobile: '📱', tablet: '⬜', desktop: '💻',
};

function fmtTime(s: number | null) {
  if (!s) return '—';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
  });
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function DomBadge({ dom }: { dom: string }) {
  const color = DOM_COLORS[dom] ?? '#555';
  return (
    <span style={{
      background: color + '22', border: `1px solid ${color}66`,
      color, borderRadius: 999, padding: '2px 10px',
      fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      {DOM_LABELS[dom] ?? dom}
    </span>
  );
}

function ScoreBars({ scores }: { scores: Record<string, number> }) {
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 100 }}>
      {DOM_ORDER.map(dom => {
        const pct = Math.round((scores[dom] ?? 0) / total * 100);
        return (
          <div key={dom} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 56, height: 5, borderRadius: 3,
              background: 'rgba(148,163,184,0.12)', overflow: 'hidden',
            }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: DOM_COLORS[dom] ?? '#555', borderRadius: 3,
              }} />
            </div>
            <span style={{ fontSize: '0.6rem', color: '#8fa5ba', width: 24 }}>{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

function SourceChip({ source }: { source: string | null }) {
  const label = source ? (SOURCE_LABELS[source] ?? source) : '—';
  const colors: Record<string, string> = {
    direct: '#38bdf8', church_invite: '#a78bfa', organic: '#6ee7b7', qr_code: '#fbbf24',
  };
  const c = source ? (colors[source] ?? '#8fa5ba') : '#8fa5ba';
  return (
    <span style={{
      background: c + '18', border: `1px solid ${c}44`,
      color: c, borderRadius: 999, padding: '1px 8px',
      fontSize: '0.68rem', fontWeight: 600,
    }}>{label}</span>
  );
}

function SummaryCard({ label, value, sub, icon, accent, color }: {
  label: string; value: string | number; sub?: string;
  icon?: string; accent?: boolean; color?: string;
}) {
  const border = color ? `1px solid ${color}44` : accent ? '1px solid rgba(56,189,248,0.3)' : '1px solid var(--admin-border)';
  const bg     = color ? `${color}12` : accent ? 'rgba(56,189,248,0.08)' : 'var(--admin-surface)';
  const valCol = color ?? (accent ? '#38bdf8' : '#f1fbff');
  return (
    <div style={{ background: bg, border, borderRadius: 16, padding: '20px 22px' }}>
      <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: '0.72rem', color: '#8fa5ba', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: valCol, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.72rem', color: '#8fa5ba', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

const LIMIT = 50;

export default function RelatorioQuiz() {
  document.title = "Administração | Five One — Relatório Quiz";

  const [rows, setRows]       = useState<QuizRow[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const summaryLoaded = useRef(false);

  const [search,   setSearch]   = useState('');
  const [topDom,   setTopDom]   = useState('');
  const [source,   setSource]   = useState('');
  const [churchId, setChurchId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [sort,     setSort]     = useState('created_at');
  const [order,    setOrder]    = useState<'asc'|'desc'>('desc');

  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const buildUrl = useCallback((p: number) => {
    const params = new URLSearchParams({ page: String(p), limit: String(LIMIT), sort, order });
    if (search)   params.set('search', search);
    if (topDom)   params.set('topDom', topDom);
    if (source)   params.set('source', source);
    if (churchId) params.set('churchId', churchId);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo)   params.set('dateTo', dateTo);
    return `/api/quiz-admin-list?${params}`;
  }, [search, topDom, source, churchId, dateFrom, dateTo, sort, order]);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(buildUrl(p));
      const data: ApiResult = await res.json();
      if (data.ok) {
        setRows(data.results);
        setTotal(data.total);
        if (!summaryLoaded.current) {
          setSummary(data.summary);
          summaryLoaded.current = true;
        }
      }
    } finally { setLoading(false); }
  }, [buildUrl]);

  useEffect(() => { load(1); setPage(1); }, [topDom, source, churchId, dateFrom, dateTo, sort, order]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { load(1); setPage(1); }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  useEffect(() => { load(page); }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  async function exportCsv() {
    const params = new URLSearchParams({ page: '1', limit: '10000', sort, order });
    if (search)   params.set('search', search);
    if (topDom)   params.set('topDom', topDom);
    if (source)   params.set('source', source);
    if (churchId) params.set('churchId', churchId);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo)   params.set('dateTo', dateTo);
    const res  = await fetch(`/api/quiz-admin-list?${params}`);
    const data: ApiResult = await res.json();
    if (!data.ok) return;
    const headers = ['Nome','Email','Telefone','Dom Principal','Apostolo%','Profeta%','Evangelista%','Pastor%','Mestre%','Fonte','Igreja','Cidade','Dispositivo','Tempo(s)','Data','Token'];
    const csvRows = data.results.map(r => {
      const sc = r.scores_json ?? {};
      const t  = Object.values(sc).reduce((a,b)=>a+b,0)||1;
      return [
        r.person_name ?? '', r.person_email ?? '', r.person_phone ?? '',
        DOM_LABELS[r.top_dom] ?? r.top_dom,
        Math.round((sc.apostolo??0)/t*100),
        Math.round((sc.profeta??0)/t*100),
        Math.round((sc.evangelista??0)/t*100),
        Math.round((sc.pastor??0)/t*100),
        Math.round((sc.mestre??0)/t*100),
        r.source ?? '', r.church?.name ?? '', r.church?.city ?? '',
        r.device_type ?? '', r.completion_seconds ?? '',
        fmtDate(r.created_at), r.result_token ?? '',
      ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(',');
    });
    const blob = new Blob([[headers.join(','), ...csvRows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `quiz-resultados-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  }

  function toggleSort(col: string) {
    if (sort === col) setOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSort(col); setOrder('desc'); }
  }
  const sortIcon = (col: string) => sort === col ? (order === 'asc' ? ' ▲' : ' ▼') : '';

  const topDomEntry = summary
    ? Object.entries(summary.domDistribution).sort((a,b)=>b[1]-a[1])[0]
    : null;

  return (
    <div className="admin-wrap">
      {/* Header */}
      <div className="admin-header" style={{ marginBottom: 32 }}>
        <div className="admin-header-text">
          <span className="admin-pill">📊 Relatório</span>
          <h1 className="admin-title">Quiz dos 5 Dons</h1>
          <p className="admin-subtitle">
            Todos os resultados do teste ministerial — convite de igreja ou link direto.
          </p>
        </div>
        <div className="admin-header-actions">
          <Link to="/admin/administracao" className="admin-btn admin-btn--ghost">← Voltar</Link>
          <button className="admin-btn" onClick={exportCsv}>⬇ Exportar CSV</button>
        </div>
      </div>

      {/* Cards de resumo */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
          <SummaryCard label="Total de respostas" value={summary.totalAll} icon="📋" accent />
          <SummaryCard label="Este mês" value={summary.thisMonth} icon="📅" />
          <SummaryCard
            label="Dom mais comum"
            value={topDomEntry ? DOM_LABELS[topDomEntry[0]] ?? topDomEntry[0] : '—'}
            sub={topDomEntry ? `${topDomEntry[1]} pessoas` : undefined}
            icon="🏆"
            color={topDomEntry ? DOM_COLORS[topDomEntry[0]] : undefined}
          />
          <SummaryCard label="Tempo médio" value={fmtTime(summary.avgSeconds)} icon="⏱" />
        </div>
      )}

      {/* Distribuição dos 5 dons */}
      {summary && (
        <div style={{
          background: 'var(--admin-surface)', border: '1px solid var(--admin-border)',
          borderRadius: 20, padding: '24px 28px', marginBottom: 32,
        }}>
          <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f1fbff', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Distribuição dos Dons Principais
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DOM_ORDER.map(dom => {
              const count = summary.domDistribution[dom] ?? 0;
              const pct   = summary.totalAll > 0 ? (count / summary.totalAll) * 100 : 0;
              const color = DOM_COLORS[dom];
              return (
                <div key={dom} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 86, fontSize: '0.8rem', color: '#cbd5e1', textAlign: 'right', flexShrink: 0 }}>
                    {DOM_LABELS[dom]}
                  </span>
                  <div style={{ flex: 1, height: 12, borderRadius: 6, background: 'rgba(148,163,184,0.1)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%', borderRadius: 6, background: color,
                      transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)', minWidth: pct > 0 ? 6 : 0,
                    }} />
                  </div>
                  <span style={{ fontSize: '0.78rem', color, fontWeight: 700, width: 60, whiteSpace: 'nowrap' }}>
                    {count} <span style={{ color: '#8fa5ba', fontWeight: 400 }}>({Math.round(pct)}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 20 }}>
        <input
          type="text" placeholder="🔍 Nome ou e-mail…"
          value={search} onChange={e => setSearch(e.target.value)}
          className="admin-search-input"
          style={{ flex: '1 1 200px', minWidth: 180 }}
        />
        <select value={topDom} onChange={e => setTopDom(e.target.value)} className="admin-filter-select">
          <option value="">Todos os dons</option>
          {DOM_ORDER.map(d => <option key={d} value={d}>{DOM_LABELS[d]}</option>)}
        </select>
        <select value={source} onChange={e => setSource(e.target.value)} className="admin-filter-select">
          <option value="">Todas as fontes</option>
          <option value="direct">Direto</option>
          <option value="organic">Orgânico</option>
          <option value="church_invite">Convite Igreja</option>
          <option value="qr_code">QR Code</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="admin-filter-select" />
        <input type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)}   className="admin-filter-select" />
        {(search||topDom||source||churchId||dateFrom||dateTo) && (
          <button className="admin-btn admin-btn--ghost" style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            onClick={() => { setSearch(''); setTopDom(''); setSource(''); setChurchId(''); setDateFrom(''); setDateTo(''); }}>
            ✕ Limpar
          </button>
        )}
        <span style={{ marginLeft: 'auto', color: '#8fa5ba', fontSize: '0.82rem' }}>
          {loading ? 'Carregando…' : `${total} resultado${total !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Tabela */}
      <div style={{
        background: 'var(--admin-surface)', border: '1px solid var(--admin-border)',
        borderRadius: 20, overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border)', background: 'rgba(15,23,42,0.6)' }}>
                {[
                  { label: 'Nome / E-mail', col: 'person_name' },
                  { label: 'Dom Principal', col: 'top_dom' },
                  { label: 'Distribuição',  col: '' },
                  { label: 'Fonte',         col: '' },
                  { label: 'Igreja',        col: '' },
                  { label: 'Data',          col: 'created_at' },
                  { label: 'Tempo',         col: 'completion_seconds' },
                  { label: '',              col: '' },
                ].map(({ label, col }) => (
                  <th key={label + col}
                    onClick={() => col && toggleSort(col)}
                    style={{
                      padding: '12px 14px', textAlign: 'left', fontWeight: 700,
                      color: '#8fa5ba', textTransform: 'uppercase', fontSize: '0.7rem',
                      letterSpacing: '0.08em', cursor: col ? 'pointer' : 'default',
                      userSelect: 'none', whiteSpace: 'nowrap',
                    }}>
                    {label}{col && sortIcon(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#8fa5ba' }}>
                    Nenhum resultado encontrado.
                  </td>
                </tr>
              )}
              {rows.map((row, i) => (
                <tr key={row.id}
                  style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(148,163,184,0.08)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '10px 14px', maxWidth: 200 }}>
                    <div style={{ fontWeight: 600, color: '#f1fbff', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.person_name || <span style={{ color: '#8fa5ba', fontStyle: 'italic' }}>Anônimo</span>}
                    </div>
                    {row.person_email && (
                      <div style={{ color: '#8fa5ba', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {row.person_email}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px' }}><DomBadge dom={row.top_dom} /></td>
                  <td style={{ padding: '10px 14px' }}><ScoreBars scores={row.scores_json ?? {}} /></td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <SourceChip source={row.source} />
                    {row.device_type && (
                      <span style={{ marginLeft: 6, fontSize: '0.78rem' }} title={row.device_type}>
                        {DEVICE_ICONS[row.device_type] ?? ''}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {row.church ? (
                      <span style={{ color: '#a78bfa', fontSize: '0.78rem', fontWeight: 600 }}>
                        {row.church.name}
                        {row.church.city && <><br /><span style={{ color: '#8fa5ba', fontWeight: 400 }}>{row.church.city}</span></>}
                      </span>
                    ) : (
                      <span style={{ color: '#8fa5ba' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {fmtDate(row.created_at)}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {fmtTime(row.completion_seconds)}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {row.result_token && (
                      <a
                        href={`/#/resultado/${row.result_token}`}
                        target="_blank" rel="noopener noreferrer"
                        title="Ver resultado"
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 30, height: 30, borderRadius: 8,
                          background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)',
                          color: '#38bdf8', fontSize: '0.85rem', textDecoration: 'none',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.22)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.1)')}
                      >↗</a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 }}>
          <button className="admin-btn admin-btn--ghost" disabled={page <= 1}
            onClick={() => setPage(p => p - 1)} style={{ padding: '6px 14px' }}>
            ← Anterior
          </button>
          <span style={{ color: '#8fa5ba', fontSize: '0.82rem' }}>
            Página {page} de {totalPages} &nbsp;·&nbsp; {total} resultados
          </span>
          <button className="admin-btn admin-btn--ghost" disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)} style={{ padding: '6px 14px' }}>
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
