

import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";

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
  summary: Summary;
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

  // Slug pode vir por /relatorio/:slug OU por ?churchSlug=
  const slug = params.slug || query.get("churchSlug") || "";

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/church-summary?churchSlug=${encodeURIComponent(slug)}`);
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
  }, [slug]);

  const summary: Summary | null = data?.summary ?? null;

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
    return items.map((i) => ({ ...i, pct: Math.round((i.value / summary.total) * 100) }));
  }, [summary]);

  return (
    <div style={{ maxWidth: 960, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 8 }}>Relatório por Igreja</h1>
      <p style={{ color: "#94a3b8", marginTop: 0 }}>Slug: <strong>{slug || "(não informado)"}</strong></p>

      {loading && <p>Carregando dados…</p>}
      {error && <p style={{ color: "#ef4444" }}>Erro: {error}</p>}

      {summary && (
        <>
          {/* Cards de totais */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            <Card title="Total de respostas" value={summary.total} />
            <Card title="Apostólico" value={summary.apostolo} />
            <Card title="Profeta" value={summary.profeta} />
            <Card title="Evangelista" value={summary.evangelista} />
            <Card title="Pastor" value={summary.pastor} />
            <Card title="Mestre" value={summary.mestre} />
          </div>

          {/* Barras */}
          <h2 style={{ marginTop: 32 }}>Distribuição por dom</h2>
          {bars.length === 0 ? (
            <p>Nenhum dado suficiente para mostrar gráfico.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {bars.map((b) => (
                <div key={b.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span>{b.label}</span>
                    <span style={{ color: "#64748b" }}>{b.value} ({b.pct}%)</span>
                  </div>
                  <div style={{ background: "#0f172a", borderRadius: 6, height: 14, overflow: "hidden", border: "1px solid #1e293b" }}>
                    <div style={{ width: `${b.pct}%`, height: "100%", background: "#22c55e" }} />
                  </div>
                </div>
              ))}
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

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div style={cardStyle}>
      <div style={cardTitle}>{title}</div>
      <div style={cardNumber}>{value}</div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#0b1220",
  border: "1px solid #1e293b",
  borderRadius: 10,
  padding: 16,
};

const cardTitle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  color: "#94a3b8",
};

const cardNumber: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700 as const,
  marginTop: 4,
};