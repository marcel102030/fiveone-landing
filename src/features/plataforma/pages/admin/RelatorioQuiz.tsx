import { useEffect, useState, useMemo } from "react";
import "./AdministracaoFiveOne.css";

type ChurchRow = {
  id: string;
  slug: string;
  name: string;
  leader_name: string | null;
  city: string | null;
  expected_members: number | null;
  total_responses: number;
  participation_pct: number | null;
  last_response_at: string | null;
  report_url: string;
  quiz_url: string;
};

function formatRelTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    const dt = new Date(iso);
    const diffMs = Date.now() - dt.getTime();
    const minutes = Math.round(diffMs / 60000);
    const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
    if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");
    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 48) return rtf.format(-hours, "hour");
    const days = Math.round(hours / 24);
    if (Math.abs(days) < 60) return rtf.format(-days, "day");
    const months = Math.round(days / 30);
    return rtf.format(-months, "month");
  } catch {
    return "—";
  }
}

function formatPtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return "—";
  }
}

function ParticipationBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span style={{ color: "#64748b" }}>—</span>;
  const color =
    pct >= 80
      ? "#22c55e"
      : pct >= 40
      ? "#f59e0b"
      : "#ef4444";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 700,
        background: `${color}22`,
        color,
        border: `1px solid ${color}55`,
      }}
    >
      {pct}%
    </span>
  );
}

export default function AdminRelatorioQuiz() {
  document.title = "Administração | Five One — Relatório Quiz";

  const [churches, setChurches] = useState<ChurchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<
    "name" | "total_responses" | "participation_pct" | "last_response_at"
  >("total_responses");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/church-list")
      .then((r) => r.json())
      .then((j) => {
        if (!j.ok) throw new Error(j.error || "Erro ao carregar");
        setChurches(j.churches || []);
      })
      .catch((e) => setError(String(e?.message || e)))
      .finally(() => setLoading(false));
  }, []);

  const totalResponses = useMemo(
    () => churches.reduce((s, c) => s + c.total_responses, 0),
    [churches]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let arr = q
      ? churches.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (c.city || "").toLowerCase().includes(q) ||
            (c.leader_name || "").toLowerCase().includes(q) ||
            c.slug.toLowerCase().includes(q)
        )
      : [...churches];

    const mul = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name, "pt-BR") * mul;
      if (sortKey === "total_responses")
        return (a.total_responses - b.total_responses) * mul;
      if (sortKey === "participation_pct")
        return ((a.participation_pct ?? -1) - (b.participation_pct ?? -1)) * mul;
      if (sortKey === "last_response_at")
        return (
          ((a.last_response_at ?? "") < (b.last_response_at ?? "") ? -1 : 1) *
          mul
        );
      return 0;
    });
    return arr;
  }, [churches, search, sortKey, sortDir]);

  function toggleSort(
    key: "name" | "total_responses" | "participation_pct" | "last_response_at"
  ) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function sortIcon(
    key: "name" | "total_responses" | "participation_pct" | "last_response_at"
  ) {
    if (sortKey !== key) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  function exportCSV() {
    const lines = [
      "Igreja,Slug,Cidade,Líder,Membros previstos,Respostas,Participação %,Última resposta",
    ];
    for (const c of filtered) {
      lines.push(
        [
          `"${c.name.replace(/"/g, '""')}"`,
          c.slug,
          c.city ?? "",
          c.leader_name ?? "",
          c.expected_members ?? "",
          c.total_responses,
          c.participation_pct ?? "",
          formatPtDate(c.last_response_at),
        ].join(",")
      );
    }
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "relatorio_quiz_igrejas.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="adm5-wrap">
      {/* Topo */}
      <div className="adm5-topbar" style={{ marginBottom: 6 }}>
        <div className="adm5-topbar__intro">
          <h1 className="adm5-title">Relatório do Quiz</h1>
          <p className="adm5-sub">
            Acompanhe respostas, engajamento e participação de cada igreja na
            Rede de Igrejas nas Casas.
          </p>
        </div>
        <button
          className="adm5-pill"
          onClick={() =>
            window.history.length
              ? history.back()
              : (location.hash = "#/admin/administracao")
          }
        >
          ← Voltar ao hub
        </button>
      </div>

      {/* Cards de resumo */}
      {!loading && !error && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {[
            { label: "Igrejas cadastradas", value: churches.length },
            { label: "Respostas totais", value: totalResponses },
            {
              label: "Com respostas",
              value: churches.filter((c) => c.total_responses > 0).length,
            },
            {
              label: "Sem respostas",
              value: churches.filter((c) => c.total_responses === 0).length,
            },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: "#0b1220",
                border: "1px solid #1e293b",
                borderRadius: 14,
                padding: "16px 20px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#64748b",
                  marginBottom: 6,
                }}
              >
                {card.label}
              </div>
              <div
                style={{ fontSize: 32, fontWeight: 800, color: "#e2e8f0" }}
              >
                {card.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <input
          type="text"
          placeholder="Buscar por nome, cidade, líder ou slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1 1 240px",
            background: "#0b1220",
            border: "1px solid #1e293b",
            borderRadius: 8,
            padding: "8px 14px",
            color: "#e2e8f0",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          className="adm5-pill"
          onClick={exportCSV}
          disabled={filtered.length === 0}
        >
          Exportar CSV
        </button>
      </div>

      {/* Estado de carregamento / erro */}
      {loading && (
        <p style={{ color: "#94a3b8", padding: "32px 0" }}>Carregando…</p>
      )}
      {error && (
        <p style={{ color: "#ef4444", padding: "16px 0" }}>Erro: {error}</p>
      )}

      {/* Tabela */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <p style={{ color: "#64748b" }}>
              {search ? "Nenhuma igreja encontrada para esta busca." : "Nenhuma igreja cadastrada."}
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid #1e293b",
                      color: "#64748b",
                      textTransform: "uppercase",
                      fontSize: 11,
                      letterSpacing: "0.07em",
                    }}
                  >
                    {(
                      [
                        { key: "name", label: "Igreja" },
                        { key: null, label: "Cidade / Líder" },
                        { key: null, label: "Membros prev." },
                        { key: "total_responses", label: "Respostas" },
                        { key: "participation_pct", label: "Participação" },
                        { key: "last_response_at", label: "Última resposta" },
                        { key: null, label: "Ações" },
                      ] as { key: string | null; label: string }[]
                    ).map(({ key, label }, i) => (
                      <th
                        key={`${label}-${i}`}
                        style={{
                          padding: "10px 12px",
                          textAlign: "left",
                          cursor: key ? "pointer" : "default",
                          whiteSpace: "nowrap",
                          userSelect: "none",
                        }}
                        onClick={() =>
                          key &&
                          toggleSort(
                            key as
                              | "name"
                              | "total_responses"
                              | "participation_pct"
                              | "last_response_at"
                          )
                        }
                      >
                        {label}
                        {key ? sortIcon(key as any) : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: "1px solid #0f172a",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          "#0f172a")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          "transparent")
                      }
                    >
                      {/* Igreja */}
                      <td style={{ padding: "12px 12px" }}>
                        <div style={{ fontWeight: 600, color: "#e2e8f0" }}>
                          {c.name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#475569",
                            marginTop: 2,
                          }}
                        >
                          {c.slug}
                        </div>
                      </td>

                      {/* Cidade / Líder */}
                      <td style={{ padding: "12px 12px", color: "#94a3b8" }}>
                        <div>{c.city || "—"}</div>
                        <div style={{ fontSize: 12, color: "#475569" }}>
                          {c.leader_name || "—"}
                        </div>
                      </td>

                      {/* Membros previstos */}
                      <td
                        style={{
                          padding: "12px 12px",
                          color: "#94a3b8",
                          textAlign: "center",
                        }}
                      >
                        {c.expected_members ?? "—"}
                      </td>

                      {/* Respostas */}
                      <td
                        style={{
                          padding: "12px 12px",
                          textAlign: "center",
                          fontWeight: 700,
                          color:
                            c.total_responses > 0 ? "#e2e8f0" : "#475569",
                        }}
                      >
                        {c.total_responses > 0 ? (
                          c.total_responses
                        ) : (
                          <span style={{ color: "#475569" }}>0</span>
                        )}
                      </td>

                      {/* Participação */}
                      <td
                        style={{ padding: "12px 12px", textAlign: "center" }}
                      >
                        <ParticipationBadge pct={c.participation_pct} />
                      </td>

                      {/* Última resposta */}
                      <td
                        style={{
                          padding: "12px 12px",
                          color: "#64748b",
                          fontSize: 13,
                          whiteSpace: "nowrap",
                        }}
                        title={
                          c.last_response_at
                            ? formatPtDate(c.last_response_at)
                            : undefined
                        }
                      >
                        {c.last_response_at
                          ? formatRelTime(c.last_response_at)
                          : "—"}
                      </td>

                      {/* Ações */}
                      <td style={{ padding: "12px 12px" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          <a
                            href={`#/relatorio/${c.slug}`}
                            className="adm5-pill"
                            style={{
                              textDecoration: "none",
                              fontSize: 12,
                              padding: "4px 10px",
                            }}
                          >
                            Relatório
                          </a>
                          <a
                            href={c.quiz_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="adm5-pill"
                            style={{
                              textDecoration: "none",
                              fontSize: 12,
                              padding: "4px 10px",
                            }}
                          >
                            Abrir quiz
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div
                style={{
                  marginTop: 12,
                  color: "#475569",
                  fontSize: 13,
                  textAlign: "right",
                }}
              >
                {filtered.length} de {churches.length} igrejas
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
