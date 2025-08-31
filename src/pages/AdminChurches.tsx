import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminChurches.css";

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

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        const r = await fetch("/api/church-list");
        const j: ApiOut = await r.json();
        if (!r.ok || !j.ok) throw new Error(j?.error || `Erro ${r.status}`);
        if (!cancel) setRows(j.churches || []);
      } catch (e: any) {
        if (!cancel) setError(String(e?.message || e));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

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
                        <a href={r.invite_url}>
                          <button className="admin-btn">Link convite</button>
                        </a>
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
    </div>
  );
}