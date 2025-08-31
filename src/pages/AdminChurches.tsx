import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminChurches.css";

const PROD_ORIGIN = "https://fiveonemovement.com";

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

export default function AdminChurches() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
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
  // Sucesso na criação (toast com links)
  const [createSuccess, setCreateSuccess] = useState<
    | null
    | {
        name: string;
        slug: string;
        invite_url?: string;
        report_url?: string;
        quiz_url?: string;
      }
  >(null);
  const [copied, setCopied] = useState(false);
  const [copiedRowSlug, setCopiedRowSlug] = useState<string | null>(null);
  function makeUrlsFromSlug(slug: string) {
    return {
      invite_url: `${PROD_ORIGIN}/c/${slug}`,
      report_url: `${PROD_ORIGIN}/#/relatorio/${slug}`,
      quiz_url: `${PROD_ORIGIN}/c/${slug}`,
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
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      alert("Não foi possível copiar o link");
    }
  }

  async function loadChurches() {
    try {
      setLoading(true);
      setError(null);
      const r = await fetch("/api/church-list");
      const j: ApiOut = await r.json();
      if (!r.ok || !j.ok) throw new Error(j?.error || `Erro ${r.status}`);
      setRows(j.churches || []);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadChurches();
  }, []);

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Nome é obrigatório");
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
      let urls = { invite_url: undefined as string | undefined, report_url: undefined as string | undefined, quiz_url: undefined as string | undefined };
      if (payload?.invite_url || payload?.report_url || payload?.quiz_url) {
        urls = {
          invite_url: payload.invite_url,
          report_url: payload.report_url,
          quiz_url: payload.quiz_url,
        };
      } else if (slugFromApi) {
        urls = makeUrlsFromSlug(slugFromApi);
      }

      const slugFinal = slugFromApi || nameFromApi
        .toLowerCase()
        .normalize("NFD").replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      setCreateSuccess({
        name: nameFromApi,
        slug: slugFinal,
        ...urls,
      });

      setShowCreate(false);
      setForm({ name: "", leader_name: "", city: "", expected_members: "", notes: "" });
      await loadChurches();
    } catch (err: any) {
      alert(err?.message ?? "Falha ao criar igreja");
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

  return (
    <div className="admin-wrap">
      <h1 className="admin-title">Painel de Igrejas</h1>
      <p className="admin-subtitle">
        Visualize todas as igrejas cadastradas e acesse seus relatórios.
      </p>

      {/* Indicadores agregados */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-title">Igrejas</div>
          <div className="stat-number">{totalIgrejas}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Membros previstos</div>
          <div className="stat-number">{totalMembrosPrev.toLocaleString("pt-BR")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Respostas</div>
          <div className="stat-number">{totalRespostas.toLocaleString("pt-BR")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Participação</div>
          <div className="stat-number">{taxaParticipacao}%</div>
          <div className="stat-muted">{totalRespostas}/{totalMembrosPrev || 0}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8, marginBottom: 8 }}>
        <button className="admin-btn" onClick={() => setShowCreate(true)}>+ Criar igreja</button>
      </div>

      {createSuccess && (
        <div className="toast-success">
          <div className="toast-body">
            <div>
              <div className="toast-title">Igreja criada com sucesso</div>
              <div className="toast-sub">{createSuccess.name} (slug: <code>{createSuccess.slug}</code>)</div>
            </div>
            <div className="toast-actions">
              {(createSuccess.slug) && (
                <button
                  className="admin-btn"
                  onClick={() => copyToClipboard(`${PROD_ORIGIN}/c/${createSuccess.slug}`)}
                  title="Copiar link do teste (5 Ministérios)"
                >
                  {copied ? "Copiado!" : "Copiar Link Teste 5 Ministérios"}
                </button>
              )}
              <button className="admin-btn" onClick={() => setCreateSuccess(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-search">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, slug, cidade ou líder…"
          className="admin-search-input"
        />
        {/* Filtro Cidade */}
        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="admin-filter-select admin-filter-city"
        >
          <option value="__ALL__">Todas as cidades</option>
          {cityOptions.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {/* Filtro Participação */}
        <select
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

      {loading && <p className="admin-msg">Carregando…</p>}
      {error && <p className="admin-msg admin-msg--error">Erro: {error}</p>}

      {!loading && !error && (
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
              {rowsSorted.map((r) => {
                const part = getParticipacao(r);
                let badgeClass = "badge-participacao badge-low";
                if (part >= 70) badgeClass = "badge-participacao badge-high";
                else if (part >= 30) badgeClass = "badge-participacao badge-med";
                return (
                  <tr key={r.id} className="admin-row">
                    <td className="admin-td">{r.name}</td>
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
                        <Link to={r.report_url}>
                          <button className="admin-btn">Relatório</button>
                        </Link>
                        <div className="copy-wrap">
                          <button
                            className="admin-btn"
                            onClick={() => {
                              copyToClipboard(`${PROD_ORIGIN}/c/${r.slug}`);
                              setCopiedRowSlug(r.slug);
                              setTimeout(() => setCopiedRowSlug(null), 1500);
                            }}
                            title="Copiar link do teste (5 Ministérios)"
                          >
                            Link convite
                          </button>
                          {copiedRowSlug === r.slug && (
                            <span className="copied-tip" role="status" aria-live="polite">✅ copiado</span>
                          )}
                        </div>
                        <a href={r.quiz_url}>
                          <button className="admin-btn">Abrir teste</button>
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rowsSorted.length === 0 && (
                <tr>
                  <td className="admin-td" colSpan={8}>Nenhuma igreja encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !error && rowsSorted.length > 0 && (
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
                <button type="submit" className="admin-btn" disabled={creating}>{creating ? "Criando..." : "Criar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}