import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminChurches.css";
import { useAdminToast } from "../components/AdminToast";
// import { clearAdminAuthenticated, getAdminEmail } from "../utils/adminAuth";

const PROD_ORIGIN = "https://fiveonemovement.com";

const SERVICE_LEAD_META: Record<string, { label: string; badge: string; color: string }> = {
  mentoria: { label: "Mentoria Individual", badge: "Individual", color: "#38bdf8" },
  palestra: { label: "Palestra Introdutória", badge: "Igreja toda", color: "#f472b6" },
  treinamento: { label: "Treinamento para Liderança", badge: "Liderança", color: "#f59e0b" },
  imersao: { label: "Imersão Ministerial", badge: "Imersão", color: "#34d399" },
};

type Row = {
  id: string;
  slug: string;
  name: string;
  leader_name: string | null;
  city: string | null;
  expected_members: number | null;
  created_at?: string;
  total_responses: number;
  report_url: string;
  invite_url: string;
  quiz_url: string;
};

type ApiOut = { ok: boolean; churches: Row[]; error?: string };

type Summary = { total: number; apostolo: number; profeta: number; evangelista: number; pastor: number; mestre: number };

type ServiceRequestRow = {
  id: string;
  created_at: string;
  service_type: string;
  status: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  city?: string | null;
  payload?: Record<string, any>;
  church?: { id: string; name: string; slug: string; city?: string | null; leader_name?: string | null } | null;
};

function formatRelTime(iso: string) {
  try {
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return "";
    const diffMs = Date.now() - dt.getTime();
    const minutes = Math.round(diffMs / 60000);
    if (Math.abs(minutes) < 1) return "agora";
    const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
    if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");
    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 48) return rtf.format(-hours, "hour");
    const days = Math.round(hours / 24);
    return rtf.format(-days, "day");
  } catch {
    return "";
  }
}

function formatDateTime(iso: string) {
  try {
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "";
  }
}

const FORM_LABEL_MAP: Record<string, string> = {
  participantName: "Nome do participante",
  responsibleName: "Nome do responsável",
  leaderName: "Nome do líder",
  leader_name: "Nome do líder",
  email: "E-mail",
  phone: "Telefone",
  phone_whatsapp: "Telefone",
  church: "Igreja",
  churchName: "Nome da igreja",
  city: "Cidade / Estado",
  currentStage: "Como serve hoje",
  currentstage: "Como serve hoje",
  preferredDate: "Data sugerida",
  preferredMonth: "Mês sugerido",
  goals: "Objetivos",
  context: "Objetivo",
  notes: "Observações",
  ministryAreas: "Áreas a trabalhar",
  ministryareas: "Áreas a trabalhar",
  teamSize: "Equipe",
  membersCount: "Membros",
  desiredDuration: "Duração desejada",
  desiredStart: "Data desejada",
  initiatives: "Iniciativas atuais",
  role: "Função",
};

function humanizeKey(key: string) {
  if (FORM_LABEL_MAP[key]) return FORM_LABEL_MAP[key];
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AdminChurches() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [page, setPage] = useState(0);
  const pageSize = 20;
  // Ordenação
  const [sortKey, setSortKey] = useState<
    "name" | "total_responses" | "city" | "expected_members" | "participacao"
  >("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Filtros
  const [filterCity, setFilterCity] = useState<string>("__ALL__");
  const [filterPart, setFilterPart] = useState<"ALL" | "LOW" | "MED" | "HIGH">("ALL");

  // Modal criar igreja
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    leader_name: "",
    city: "",
    expected_members: "" as number | string,
    notes: ""
  });
  const toast = useAdminToast();
  const [copiedRowSlug, setCopiedRowSlug] = useState<string | null>(null);
  const [shareLoadingSlug, setShareLoadingSlug] = useState<string | null>(null);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadsByType, setLeadsByType] = useState<Record<string, ServiceRequestRow[]>>({});
  const [leadModalType, setLeadModalType] = useState<string | null>(null);
  const [leadModalSelected, setLeadModalSelected] = useState<string | null>(null);
  function makeUrlsFromSlug(slug: string) {
    return {
      invite_url: `${PROD_ORIGIN}/c/${slug}`,
      report_url: `/relatorio/${slug}`,
      quiz_url: `${PROD_ORIGIN}/#/teste-dons?churchSlug=${slug}`,
    };
  }

  async function copyToClipboard(text: string) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback para ambientes sem HTTPS
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast.success('Link copiado', 'O link foi copiado para a área de transferência.');
    } catch (e) {
      toast.error('Não foi possível copiar', 'Copie manualmente no navegador e tente novamente.');
    }
  }

  async function loadChurches() {
    try {
      setLoading(true);
      setError(null);
      const r = await fetch("/api/church-list");
      const j: ApiOut = await r.json();
      if (!r.ok || !j.ok) throw new Error(j?.error || `Erro ${r.status}`);
      const normalized = (j.churches || []).map((row) => ({
        ...row,
        ...makeUrlsFromSlug(row.slug),
      }));
      setRows(normalized);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function loadServiceRequests() {
    try {
      setLeadLoading(true);
      setLeadError(null);
      const response = await fetch("/api/service-request-list");
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || `Erro ${response.status}`);
      }
      setLeadsByType(data?.requestsByType || {});
    } catch (err: any) {
      setLeadError(String(err?.message || err));
    } finally {
      setLeadLoading(false);
    }
  }

  const openLeadModal = (type: string) => {
    const list = leadsByType[type] || [];
    if (!list.length) return;
    setLeadModalType(type);
    setLeadModalSelected(list[0].id);
  };

  const closeLeadModal = () => {
    setLeadModalType(null);
    setLeadModalSelected(null);
  };

  // carregar/persistir preferências
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("adminChurchesPrefs") || "{}");
      if (p.q) setQ(p.q);
      if (p.filterCity) setFilterCity(p.filterCity);
      if (p.filterPart) setFilterPart(p.filterPart);
      if (p.sortKey) setSortKey(p.sortKey);
      if (p.sortDir) setSortDir(p.sortDir);
      if (p.from) setFrom(p.from);
      if (p.to) setTo(p.to);
    } catch {}
    loadChurches();
    loadServiceRequests();
  }, []);

  useEffect(() => {
    const p = { q, filterCity, filterPart, sortKey, sortDir, from, to };
    try { localStorage.setItem("adminChurchesPrefs", JSON.stringify(p)); } catch {}
  }, [q, filterCity, filterPart, sortKey, sortDir, from, to]);

  useEffect(() => {
    if (!leadModalType) return;
    const list = leadsByType[leadModalType] || [];
    if (!list.length) {
      setLeadModalType(null);
      setLeadModalSelected(null);
      return;
    }
    if (!leadModalSelected || !list.some((item) => item.id === leadModalSelected)) {
      setLeadModalSelected(list[0].id);
    }
  }, [leadModalType, leadModalSelected, leadsByType]);

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.warning('Informe o nome', 'Preencha o nome da igreja para continuar.');
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/church-create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          leader_name: form.leader_name.trim() || null,
          city: form.city.trim() || null,
          expected_members:
            typeof form.expected_members === "string"
              ? Number(form.expected_members || 0)
              : form.expected_members || 0,
          notes: form.notes?.trim() || null,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Erro ${res.status}`);
      }

      let payload: any = null;
      try { payload = await res.json(); } catch {}

      // Tenta extrair slug e URLs do backend; se não vier, cria a partir do nome
      const slugFromApi = payload?.church?.slug || payload?.slug;
      const nameFromApi = payload?.church?.name || form.name.trim();

      const slugFinal = slugFromApi || nameFromApi
        .toLowerCase()
        .normalize("NFD").replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      setShowCreate(false);
      setForm({ name: "", leader_name: "", city: "", expected_members: "", notes: "" });
      await loadChurches();
      toast.success('Igreja criada', `Slug: ${slugFinal}`);
    } catch (err: any) {
      toast.error('Não foi possível criar a igreja', err?.message ?? 'Tente novamente em instantes.');
    } finally {
      setCreating(false);
    }
  }

  // Lista de cidades distintas para o filtro (inclui "Não informado")
  const cityOptions = Array.from(
    new Set(
      rows.map(r => (r.city && r.city.trim()) ? r.city.trim() : "Não informado")
    )
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  const filtered = rows.filter(r => {
    // Busca textual
    const s = q.toLowerCase().trim();
    const matchesSearch = !s || (
      r.name.toLowerCase().includes(s) ||
      (r.slug || "").toLowerCase().includes(s) ||
      (r.city || "").toLowerCase().includes(s) ||
      (r.leader_name || "").toLowerCase().includes(s)
    );

    if (!matchesSearch) return false;

    // Filtro por cidade
    const city = (r.city && r.city.trim()) ? r.city.trim() : "Não informado";
    const matchesCity = filterCity === "__ALL__" || city === filterCity;
    if (!matchesCity) return false;

    // Filtro por faixa de participação
    const members = r.expected_members ?? 0;
    const resp = r.total_responses || 0;
    const part = members > 0 ? Math.round((resp / members) * 100) : 0;
    let matchesPart = true;
    if (filterPart === "LOW") matchesPart = part < 30;
    else if (filterPart === "MED") matchesPart = part >= 30 && part < 70;
    else if (filterPart === "HIGH") matchesPart = part >= 70;

    return matchesPart;
  });

  // Indicadores agregados (calculados no cliente)
  const totalIgrejas = rows.length;
  const totalRespostas = rows.reduce((acc, r) => acc + (r.total_responses || 0), 0);
  const totalMembrosPrev = rows.reduce((acc, r) => acc + (r.expected_members ?? 0), 0);
  const taxaParticipacao = totalMembrosPrev > 0
    ? Math.round((totalRespostas / totalMembrosPrev) * 100)
    : 0;

  // Participação por linha (evita divisão por zero)
  const getParticipacao = (r: Row) => {
    const members = r.expected_members ?? 0;
    const resp = r.total_responses || 0;
    return members > 0 ? Math.round((resp / members) * 100) : 0;
  };

  // Aplica ordenação ao resultado filtrado
  const rowsSorted = [...filtered].sort((a, b) => {
    let va: string | number; let vb: string | number;
    switch (sortKey) {
      case "city":
        va = ((a.city || "").trim()).toLowerCase();
        vb = ((b.city || "").trim()).toLowerCase();
        break;
      case "expected_members":
        va = a.expected_members ?? 0;
        vb = b.expected_members ?? 0;
        break;
      case "participacao":
        va = getParticipacao(a);
        vb = getParticipacao(b);
        break;
      case "total_responses":
        va = a.total_responses || 0;
        vb = b.total_responses || 0;
        break;
      case "name":
      default:
        va = (a.name || "").toLowerCase();
        vb = (b.name || "").toLowerCase();
        break;
    }
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // paginação
  const totalPages = Math.max(1, Math.ceil(rowsSorted.length / pageSize));
  useEffect(() => { if (page >= totalPages) setPage(Math.max(0, totalPages - 1)); }, [totalPages]);
  const pageRows = useMemo(() => rowsSorted.slice(page * pageSize, page * pageSize + pageSize), [rowsSorted, page]);

  // drawer de detalhes por igreja
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  useEffect(() => {
    (async () => {
      if (!openSlug) return;
      setSummaryLoading(true);
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';
        const qsObj: Record<string,string> = { churchSlug: openSlug, tz };
        if (from) qsObj.from = from; if (to) qsObj.to = to;
        const res = await fetch(`/api/church-summary?${new URLSearchParams(qsObj)}`);
        const j = await res.json();
        if (res.ok && j?.ok) setSummary(j.summary as Summary);
        else setSummary(null);
      } catch { setSummary(null); }
      finally { setSummaryLoading(false); }
    })();
  }, [openSlug, from, to]);

  function onShareWhatsApp(slug: string, name: string) {
    const origin = (typeof window !== 'undefined') ? window.location.origin : '';
    const link = `${origin}/#/teste-dons?churchSlug=${encodeURIComponent(slug)}`;
    const text = encodeURIComponent(`Olá! Segue o link do Teste dos 5 Ministérios para a igreja "${name}": ${link}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  async function onSharePublicReport(slug: string) {
    setShareLoadingSlug(slug);
    try {
      const res = await fetch('/api/report-share', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ slug, from, to }) });
      const j = await res.json();
      if (!res.ok || !j?.ok) {
        const errMsg = j?.error || `Erro ${res.status}`;
        if ((errMsg || '').includes('REPORT_SHARE_SECRET')) {
          toast.error('Configure o link público', 'Defina REPORT_SHARE_SECRET nas variáveis do projeto.');
        } else {
          toast.error('Não foi possível gerar o link público', errMsg);
        }
        return;
      }
      const url = j.url as string;
      if ((navigator as any).share) {
        (navigator as any).share({ title:`Relatório — ${slug}`, url }).catch(()=>copy(url));
      } else {
        copy(url);
      }
    } catch(e:any){
      toast.error('Não foi possível gerar o link público', e?.message || String(e));
    } finally {
      setShareLoadingSlug(prev => (prev === slug ? null : prev));
    }
    function copy(t:string){
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(t).then(()=> toast.success('Link público pronto', 'Copiamos o link para a área de transferência.'));
      } else {
        const ta = document.createElement('textarea'); ta.value=t; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        toast.success('Link público pronto', 'Copiamos o link para a área de transferência.');
      }
    }
  }

  function exportCSV(list: Row[]) {
    const lines = ["name,slug,city,leader,expected_members,total_responses,quiz_url,invite_url,report_url"]; 
    list.forEach(r=> lines.push(`${safe(r.name)},${r.slug},${safe(r.city||'')},${safe(r.leader_name||'')},${r.expected_members||0},${r.total_responses||0},${r.quiz_url},${r.invite_url},${r.report_url}`));
    const csv = lines.join('\n'); const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'igrejas.csv'; document.body.appendChild(a); a.click(); a.remove();
    function safe(s:string){ return `"${String(s).replace(/"/g,'""')}"`; }
  }

  async function onImportCSV(file: File){
    try{
      const txt = await file.text();
      const lines = txt.split(/\r?\n/).filter(Boolean);
      // cabeçalho opcional: name,leader,city,expected_members
      for (let i=0;i<lines.length;i++){
        const cols = lines[i].split(',').map(c=>c.replace(/^\"|\"$/g,'').trim());
        const [name, leader_name, city, expected_members] = cols;
        if (!name) continue;
        await fetch('/api/church-create',{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ name, leader_name: leader_name||null, city: city||null, expected_members: Number(expected_members||0) })});
      }
      await loadChurches();
      toast.success('Importação concluída', 'As igrejas foram adicionadas à lista.');
    }catch(e:any){
      toast.error('Não foi possível importar', e?.message || String(e));
    }
  }

  const handleSort = (
    key: "name" | "total_responses" | "city" | "expected_members" | "participacao"
  ) => {
    if (key === sortKey) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const leadModalList = leadModalType ? leadsByType[leadModalType] || [] : [];
  const leadMeta = leadModalType ? SERVICE_LEAD_META[leadModalType] : null;
  const activeLead = leadModalType
    ? leadModalList.find((item) => item.id === leadModalSelected) || leadModalList[0] || null
    : null;
  const activeLeadUrls = activeLead?.church?.slug ? makeUrlsFromSlug(activeLead.church.slug) : null;

  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <div className="admin-header-text">
          <span className="admin-pill">Dashboard Quiz</span>
          <h1 className="admin-title">Painel de Igrejas</h1>
          <p className="admin-subtitle">
            Visualize todas as igrejas cadastradas, acompanhe métricas-chave e acesse seus relatórios.
          </p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn--ghost" onClick={()=> navigate('/admin/administracao')}>← Voltar ao hub</button>
        </div>
      </header>

      <section className="admin-section admin-section--leads">
        <div className="leads-header">
          <div>
            <h2>Solicitações recentes</h2>
            <p>Acompanhe os pedidos enviados pelos formulários “Leve os 5 Ministérios para sua igreja”.</p>
          </div>
          <div className="leads-actions">
            <button className="admin-btn" onClick={loadServiceRequests} disabled={leadLoading}>
              {leadLoading ? "Atualizando..." : "Atualizar"}
            </button>
          </div>
        </div>
        {leadError && <div className="leads-error" role="alert">{leadError}</div>}
        <div className="leads-grid">
          {Object.entries(SERVICE_LEAD_META).map(([key, meta]) => {
            const list = leadsByType[key] || [];
            const lastCreated = list[0]?.created_at;
            const hasItems = list.length > 0;
            const handleClick = () => {
              if (!hasItems || leadLoading) return;
              openLeadModal(key);
            };
            return (
              <article
                key={key}
                className={`lead-card${hasItems ? " lead-card--clickable" : ""}`}
                onClick={handleClick}
                role={hasItems ? "button" : undefined}
                tabIndex={hasItems ? 0 : -1}
                onKeyDown={(event) => {
                  if (!hasItems) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openLeadModal(key);
                  }
                }}
              >
                <header className="lead-card-head" style={{ borderColor: `${meta.color}33` }}>
                  <div>
                    <span className="lead-badge" style={{ background: `${meta.color}22`, color: meta.color }}>
                      {meta.badge}
                    </span>
                    <h3>{meta.label}</h3>
                  </div>
                  <div className="lead-count">{list.length}</div>
                </header>
                <div className="lead-card-body">
                  {leadLoading && list.length === 0 ? (
                    <p className="lead-muted">Carregando solicitações...</p>
                  ) : !hasItems ? (
                    <p className="lead-muted">Nenhuma solicitação registrada.</p>
                  ) : (
                    <div className="lead-summary">
                      <p>
                        Última solicitação {lastCreated ? formatRelTime(lastCreated) : "recente"}.<br />
                        Clique para visualizar {list.length === 1 ? "a solicitação" : `${list.length} solicitações`}.
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Indicadores agregados */}
      <section className="admin-section admin-section--kpis">
        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-icon stat-icon--church" aria-hidden="true" />
            <div className="stat-content">
              <div className="stat-title">Igrejas</div>
              <div className="stat-number">{totalIgrejas}</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon stat-icon--members" aria-hidden="true" />
            <div className="stat-content">
              <div className="stat-title">Membros previstos</div>
              <div className="stat-number">{totalMembrosPrev.toLocaleString("pt-BR")}</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon stat-icon--responses" aria-hidden="true" />
            <div className="stat-content">
              <div className="stat-title">Respostas</div>
              <div className="stat-number">{totalRespostas.toLocaleString("pt-BR")}</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon stat-icon--engagement" aria-hidden="true" />
            <div className="stat-content">
              <div className="stat-title">Participação</div>
              <div className="stat-number">{taxaParticipacao}%</div>
              <div className="stat-muted">{totalRespostas}/{totalMembrosPrev || 0}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="admin-section admin-section--filters">
        <div className="admin-toolbar">
          <div className="admin-toolbar-left">
            <label className="admin-field">De
              <input className="admin-input" type="date" value={from} onChange={e=>{setFrom(e.target.value); setPage(0);}} />
            </label>
            <label className="admin-field">Até
              <input className="admin-input" type="date" value={to} onChange={e=>{setTo(e.target.value); setPage(0);}} />
            </label>
          </div>
          <div className="admin-toolbar-right">
            <input type="file" accept=".csv" id="importCsv" style={{ display:'none' }} onChange={(e)=>{ const f=e.target.files?.[0]; if (f) onImportCSV(f); }} />
            <button className="admin-btn admin-btn--outline" onClick={()=>document.getElementById('importCsv')?.click()}>Importar CSV</button>
            <button className="admin-btn admin-btn--outline" onClick={()=>exportCSV(rowsSorted)}>Exportar CSV</button>
            <button className="admin-btn admin-btn--primary" onClick={() => setShowCreate(true)}>+ Criar igreja</button>
          </div>
        </div>

        <div className="admin-search">
          <div className="admin-search-field">
            <label className="admin-field-label" htmlFor="adminChurchSearch">Buscar</label>
            <input
              id="adminChurchSearch"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, slug, cidade ou líder…"
              className="admin-search-input"
            />
          </div>
          {/* Filtro Cidade */}
          <div className="admin-filter-field">
            <label className="admin-field-label" htmlFor="adminChurchCity">Cidade</label>
            <select
              id="adminChurchCity"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="admin-filter-select admin-filter-city"
            >
              <option value="__ALL__">Todas as cidades</option>
              {cityOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {/* Filtro Participação */}
          <div className="admin-filter-field">
            <label className="admin-field-label" htmlFor="adminChurchParticipation">Participação</label>
            <select
              id="adminChurchParticipation"
              value={filterPart}
              onChange={(e) => setFilterPart(e.target.value as any)}
              className="admin-filter-select admin-filter-part"
            >
              <option value="ALL">Participação: todas</option>
              <option value="LOW">Baixa (&lt; 30%)</option>
              <option value="MED">Média (30–69%)</option>
              <option value="HIGH">Alta (≥ 70%)</option>
            </select>
          </div>
        </div>
      </section>

      {loading && <p className="admin-msg">Carregando…</p>}
      {error && <p className="admin-msg admin-msg--error">Erro: {error}</p>}

      {!loading && !error && (
        <section className="admin-section admin-section--table">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr className="admin-thead-row">
                  <th
                    className="admin-th admin-th--sortable"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSort("name")}
                    onKeyDown={(e) => e.key === "Enter" && handleSort("name")}
                  >
                    Nome {sortKey === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th className="admin-th">Slug</th>
                  <th
                    className="admin-th admin-th--sortable"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSort("city")}
                    onKeyDown={(e) => e.key === "Enter" && handleSort("city")}
                  >
                    Cidade {sortKey === "city" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th className="admin-th">Líder</th>
                  <th
                    className="admin-th admin-th--sortable"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSort("expected_members")}
                    onKeyDown={(e) => e.key === "Enter" && handleSort("expected_members")}
                  >
                    Membros (prev.) {sortKey === "expected_members" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th
                    className="admin-th admin-th--sortable"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSort("total_responses")}
                    onKeyDown={(e) => e.key === "Enter" && handleSort("total_responses")}
                  >
                    Respostas {sortKey === "total_responses" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th
                    className="admin-th admin-th--sortable"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSort("participacao")}
                    onKeyDown={(e) => e.key === "Enter" && handleSort("participacao")}
                  >
                    Participação {sortKey === "participacao" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th className="admin-th">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => {
                  const part = getParticipacao(r);
                  let badgeClass = "badge-participacao badge-low";
                  if (part >= 70) badgeClass = "badge-participacao badge-high";
                  else if (part >= 30) badgeClass = "badge-participacao badge-med";
                  return (
                    <tr key={r.id} className="admin-row">
                      <td className="admin-td admin-name-cell">
                        <button className="linklike" onClick={()=> setOpenSlug(r.slug)} title="Ver detalhes">
                          {r.name}
                        </button>
                      </td>
                      <td className="admin-td"><code>{r.slug}</code></td>
                      <td className="admin-td">{r.city || "—"}</td>
                      <td className="admin-td">{r.leader_name || "—"}</td>
                      <td className="admin-td">{r.expected_members ?? "—"}</td>
                      <td className="admin-td">{r.total_responses}</td>
                      <td className="admin-td">
                        <span className={badgeClass}>{part}%</span>
                      </td>
                  <td className="admin-td">
                    <div className="admin-actions">
                      {(() => {
                        const params = new URLSearchParams();
                        if (from) params.set('from', from);
                        if (to) params.set('to', to);
                        const query = params.toString();
                        const reportHref = `/relatorio/${r.slug}${query ? `?${query}` : ''}`;
                        const sharing = shareLoadingSlug === r.slug;
                        const copied = copiedRowSlug === r.slug;
                        return (
                          <>
                            <Link className="admin-chip admin-chip--primary" to={reportHref}>Relatório</Link>
                            <button className="admin-chip admin-chip--accent" onClick={()=> onShareWhatsApp(r.slug, r.name)}>WhatsApp</button>
                            <button
                              className="admin-chip admin-chip--ghost"
                              onClick={()=> onSharePublicReport(r.slug)}
                              disabled={sharing}
                            >
                              {sharing ? 'Gerando…' : 'Link público'}
                            </button>
                            <button
                              className="admin-chip admin-chip--ghost"
                              onClick={() => {
                                copyToClipboard(`${PROD_ORIGIN}/c/${r.slug}`);
                                setCopiedRowSlug(r.slug);
                                setTimeout(() => setCopiedRowSlug(null), 1500);
                              }}
                              title="Copiar link do teste (5 Ministérios)"
                            >
                              Link convite
                            </button>
                            {copied && (
                              <span className="admin-chip-note" role="status" aria-live="polite">Link copiado</span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </td>
                    </tr>
                  );
                })}
                {!pageRows.length && (
                  <tr className="admin-row admin-row-empty">
                    <td className="admin-td admin-empty" colSpan={8}>
                      <div className="admin-empty-state">
                        <span className="admin-empty-title">Nenhuma igreja encontrada</span>
                        <span className="admin-empty-sub">Ajuste os filtros ou cadastre uma nova igreja.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {!loading && !error && rowsSorted.length > 0 && (
        <section className="admin-section admin-section--summary">
          <div className="admin-city-summary">
            <h2 className="admin-h2">Resumo por cidade</h2>
            <ul className="city-list">
              {Object.entries(
                rowsSorted.reduce<Record<string, { churches: number; responses: number }>>((acc, r) => {
                  const city = (r.city || "Não informado").trim();
                  if (!acc[city]) acc[city] = { churches: 0, responses: 0 };
                  acc[city].churches += 1;
                  acc[city].responses += (r.total_responses || 0);
                  return acc;
                }, {})
              ).map(([city, agg]) => (
                <li key={city} className="city-item">
                  <span className="city-name">{city}</span>
                  <span className="city-metrics">{agg.churches} igrejas • {agg.responses} respostas</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Paginação */}
      {!loading && !error && totalPages > 1 && (
        <section className="admin-section admin-section--pagination">
          <div className="admin-pagination">
            <button className="admin-btn admin-btn--outline" disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))}>Anterior</button>
            <span className="admin-pagination-info">Página {page+1} de {totalPages}</span>
            <button className="admin-btn admin-btn--outline" disabled={page>=totalPages-1} onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))}>Próxima</button>
          </div>
      </section>
    )}

      {leadModalType && leadMeta && (
        <div className="lead-modal-backdrop" role="dialog" aria-modal="true" onClick={closeLeadModal}>
          <div className="lead-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="lead-modal-head">
              <div>
                <span className="lead-badge" style={{ background: `${leadMeta.color}22`, color: leadMeta.color }}>
                  {leadMeta.badge}
                </span>
                <h3>Solicitações — {leadMeta.label}</h3>
              </div>
              <button className="lead-modal-close" onClick={closeLeadModal} aria-label="Fechar">×</button>
            </div>
            <div className="lead-modal-body">
              <aside className="lead-modal-list">
                {leadModalList.length === 0 ? (
                  <p className="lead-muted">Nenhuma solicitação registrada.</p>
                ) : (
                  <ul className="lead-list">
                    {leadModalList.map((item) => {
                      const active = activeLead?.id === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            className={`lead-item-button${active ? " lead-item-button--active" : ""}`}
                            onClick={() => setLeadModalSelected(item.id)}
                          >
                            <div className="lead-item-main">
                              <strong>{item.contact_name || "(Sem nome)"}</strong>
                              <span className="lead-meta">
                                {item.church?.name || "Igreja não informada"}
                                {item.city ? ` • ${item.city}` : item.church?.city ? ` • ${item.church.city}` : ""}
                              </span>
                            </div>
                            <span className="lead-time">{formatRelTime(item.created_at)}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </aside>
              <div className="lead-modal-details">
                {activeLead ? (
                  <>
                    <div className="lead-detail-block">
                      <h4>Responsável</h4>
                      <p><strong>{activeLead.contact_name || "(Sem nome)"}</strong></p>
                      {activeLead.contact_email && (
                        <p><a className="lead-link" href={`mailto:${activeLead.contact_email}`}>Enviar e-mail</a></p>
                      )}
                      {activeLead.contact_phone && (
                        <p><a className="lead-link" href={`https://wa.me/${activeLead.contact_phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a></p>
                      )}
                      <p className="lead-meta">Recebido em {formatDateTime(activeLead.created_at)}</p>
                    </div>

                    <div className="lead-detail-block">
                      <h4>Igreja</h4>
                      <p><strong>{activeLead.church?.name || "Não informado"}</strong></p>
                      <p className="lead-meta">
                        {activeLead.church?.city || activeLead.city || "Cidade não informada"}
                        {activeLead.church?.leader_name ? ` • Líder: ${activeLead.church.leader_name}` : ""}
                      </p>
                      <div className="lead-detail-actions">
                        {activeLeadUrls?.quiz_url && (
                          <a className="btn primary" href={activeLeadUrls.quiz_url} target="_blank" rel="noreferrer">Abrir teste</a>
                        )}
                        {activeLead.church?.slug && (
                          <Link className="btn ghost" to={`/relatorio/${activeLead.church.slug}`} onClick={closeLeadModal}>Abrir relatório</Link>
                        )}
                      </div>
                    </div>

                    <div className="lead-detail-block">
                      <h4>Informações do formulário</h4>
                      <div className="lead-detail-list">
                        {Object.entries(activeLead.payload?.form || {}).length === 0 ? (
                          <p className="lead-muted">Nenhuma resposta adicional registrada.</p>
                        ) : (
                          Object.entries(activeLead.payload?.form || {}).map(([key, value]) => (
                            <div key={key} className="lead-detail-row">
                              <span className="lead-detail-label">{humanizeKey(key)}</span>
                              <span className="lead-detail-value">{String(value ?? "")}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="lead-muted">Nenhuma solicitação selecionada.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer de detalhes */}
      {openSlug && (
        <div className="drawer-backdrop" onClick={()=> setOpenSlug(null)}>
          <aside className="drawer" onClick={e=> e.stopPropagation()}>
            <div className="drawer-head">
              <h3>Detalhes — {openSlug}</h3>
              <button className="drawer-close" onClick={()=> setOpenSlug(null)}>×</button>
            </div>
            <div className="drawer-body">
              {summaryLoading && <p className="admin-msg">Carregando…</p>}
              {summary && (
                <div className="drawer-kpis">
                  <div className="stat-card"><div className="stat-title">Respostas</div><div className="stat-number">{summary.total}</div></div>
                  <div className="stat-card"><div className="stat-title">Apostólico</div><div className="stat-number">{summary.apostolo}</div></div>
                  <div className="stat-card"><div className="stat-title">Profeta</div><div className="stat-number">{summary.profeta}</div></div>
                  <div className="stat-card"><div className="stat-title">Evangelista</div><div className="stat-number">{summary.evangelista}</div></div>
                  <div className="stat-card"><div className="stat-title">Pastor</div><div className="stat-number">{summary.pastor}</div></div>
                  <div className="stat-card"><div className="stat-title">Mestre</div><div className="stat-number">{summary.mestre}</div></div>
                </div>
              )}
              {!summaryLoading && !summary && (
                <p className="admin-msg">Nenhum dado para o período.</p>
              )}
              <div className="drawer-actions">
                <Link to={`/relatorio/${openSlug}${from||to?`?from=${from}&to=${to}`:''}`}><button className="admin-btn">Abrir relatório</button></Link>
                <button className="admin-btn" onClick={()=> onSharePublicReport(openSlug)}>Gerar link público</button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {showCreate && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-head">
              <h3 className="modal-title">Criar igreja</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)} aria-label="Fechar">×</button>
            </div>

            <form onSubmit={submitCreate} className="modal-form">
              <div className="form-row">
                <label>Nome *</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex.: Rede Five One - Centro"
                  required
                />
              </div>

              <div className="form-row">
                <label>Líder</label>
                <input
                  className="form-input"
                  value={form.leader_name}
                  onChange={(e) => setForm((f) => ({ ...f, leader_name: e.target.value }))}
                  placeholder="Ex.: Marcelo"
                />
              </div>

              <div className="form-row">
                <label>Cidade</label>
                <input
                  className="form-input"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="Ex.: Campina Grande"
                />
              </div>

              <div className="form-row">
                <label>Membros previstos</label>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  value={form.expected_members}
                  onChange={(e) => setForm((f) => ({ ...f, expected_members: e.target.value }))}
                  placeholder="Ex.: 120"
                />
              </div>

              <div className="form-row">
                <label>Observações</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Opcional"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="admin-btn" onClick={() => setShowCreate(false)}>Cancelar</button>
                <button
                  type="button"
                  className="admin-btn"
                  onClick={() => {
                    const origin = (typeof window !== 'undefined') ? window.location.origin : '';
                    copyToClipboard(`${origin}/#/cadastrar-igreja`);
                  }}
                  title="Copiar link para o líder preencher o cadastro da igreja"
                >
                  Gerar Formulário
                </button>
                <button type="submit" className="admin-btn" disabled={creating}>{creating ? "Criando..." : "Criar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
