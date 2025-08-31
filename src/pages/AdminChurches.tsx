// src/pages/AdminChurches.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

  const filtered = rows.filter(r => {
    const s = q.toLowerCase().trim();
    if (!s) return true;
    return (
      r.name.toLowerCase().includes(s) ||
      (r.slug || "").toLowerCase().includes(s) ||
      (r.city || "").toLowerCase().includes(s) ||
      (r.leader_name || "").toLowerCase().includes(s)
    );
  });

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 8 }}>Painel de Igrejas</h1>
      <p style={{ color: "#94a3b8", marginTop: 0 }}>
        Visualize todas as igrejas cadastradas e acesse seus relatórios.
      </p>

      <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, slug, cidade ou líder…"
          style={{
            flex: 1,
            background: "#0b1220",
            border: "1px solid #1e293b",
            borderRadius: 8,
            padding: "10px 12px",
            color: "#fff",
          }}
        />
      </div>

      {loading && <p>Carregando…</p>}
      {error && <p style={{ color: "#ef4444" }}>Erro: {error}</p>}

      {!loading && !error && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #1e293b" }}>
                <th style={th}>Nome</th>
                <th style={th}>Slug</th>
                <th style={th}>Cidade</th>
                <th style={th}>Líder</th>
                <th style={th}>Membros (prev.)</th>
                <th style={th}>Respostas</th>
                <th style={th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #1e293b" }}>
                  <td style={td}>{r.name}</td>
                  <td style={td}><code>{r.slug}</code></td>
                  <td style={td}>{r.city || "—"}</td>
                  <td style={td}>{r.leader_name || "—"}</td>
                  <td style={td}>{r.expected_members ?? "—"}</td>
                  <td style={td}>{r.total_responses}</td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Link to={r.report_url}>
                        <button style={btn}>Relatório</button>
                      </Link>
                      <a href={r.invite_url}>
                        <button style={btn}>Link convite</button>
                      </a>
                      <a href={r.quiz_url}>
                        <button style={btn}>Abrir teste</button>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td style={td} colSpan={7}>Nenhuma igreja encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = { padding: "10px 8px", fontWeight: 600, color: "#cbd5e1" };
const td: React.CSSProperties = { padding: "10px 8px", color: "#e2e8f0" };
const btn: React.CSSProperties = {
  background: "#0b1220",
  border: "1px solid #334155",
  color: "#e2e8f0",
  borderRadius: 8,
  padding: "6px 10px",
  cursor: "pointer",
};