import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "./Header";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { getCurrentUserId } from "../../../shared/utils/user";
import {
  fetchUserProgressStats,
  formatDuration,
  type ProgressStats,
} from "../services/progressStats";
import { SkeletonCard } from "../../../shared/components/ui";

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const LayersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
  </svg>
);
const FlameIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

type StatCardProps = {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  sub?: string;
};

function StatCard({ icon, value, label, sub }: StatCardProps) {
  return (
    <div className="bg-navy-lighter/60 border border-slate/10 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-mint">{icon}</span>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-slate-white tabular-nums">{value}</p>
      <p className="text-xs sm:text-sm text-slate mt-1">{label}</p>
      {sub && <p className="text-2xs sm:text-xs text-slate/70 mt-0.5">{sub}</p>}
    </div>
  );
}

function HeatmapBar({ activity, max }: { activity: ProgressStats["activity_30d"]; max: number }) {
  if (activity.length === 0) return null;
  return (
    <div className="flex items-end gap-[3px] h-24 sm:h-28">
      {activity.map((day) => {
        const ratio = max > 0 ? day.seconds / max : 0;
        const heightPercent = day.seconds > 0 ? Math.max(10, Math.round(ratio * 100)) : 4;
        const isActive = day.seconds > 0;
        return (
          <div
            key={day.date}
            className="flex-1 h-full flex items-end"
            title={`${new Date(day.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} — ${formatDuration(day.seconds)}`}
          >
            <div
              className={`w-full rounded-sm transition-all ${isActive ? "bg-mint hover:bg-mint/80" : "bg-slate/10 hover:bg-slate/20"}`}
              style={{ height: `${heightPercent}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

const MeuProgresso = () => {
  document.title = "Meu progresso | Five One";
  const navigate = useNavigate();
  const { email: authEmail } = useAuth();
  const userId = authEmail || getCurrentUserId() || "";

  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchUserProgressStats(userId)
      .then((s) => {
        if (mounted) setStats(s);
      })
      .catch((e) => {
        console.error("Erro ao carregar progresso:", e);
        if (mounted) setError("Não conseguimos carregar seu progresso agora. Tente novamente em instantes.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [userId]);

  const maxDailySeconds = useMemo(() => {
    if (!stats?.activity_30d?.length) return 0;
    return stats.activity_30d.reduce((acc, d) => Math.max(acc, d.seconds), 0);
  }, [stats]);

  const continueProgressPercent = useMemo(() => {
    const ll = stats?.last_lesson;
    if (!ll || !ll.duration_seconds || ll.duration_seconds <= 0) return 0;
    return Math.min(100, Math.round((ll.watched_seconds / ll.duration_seconds) * 100));
  }, [stats]);

  return (
    <div className="min-h-screen bg-navy text-slate-light">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
        {/* ── Topo: voltar + título ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/plataforma")}
            className="p-2 rounded-lg hover:bg-navy-lighter transition-colors text-slate-light hover:text-mint"
            aria-label="Voltar para a plataforma"
          >
            <ArrowLeftIcon />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-white">Meu progresso</h1>
            <p className="text-xs sm:text-sm text-slate">
              Seu histórico de aprendizado e estatísticas pessoais
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* ── Cards de stats ─────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} lines={2} />
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <StatCard
              icon={<ClockIcon />}
              value={formatDuration(stats.total_seconds)}
              label="Tempo assistido"
            />
            <StatCard
              icon={<CheckCircleIcon />}
              value={stats.completions}
              label={stats.completions === 1 ? "Aula concluída" : "Aulas concluídas"}
            />
            <StatCard
              icon={<LayersIcon />}
              value={stats.lessons_started}
              label="Aulas iniciadas"
            />
            <StatCard
              icon={<FlameIcon />}
              value={stats.streak_days}
              label={stats.streak_days === 1 ? "Dia em sequência" : "Dias em sequência"}
              sub={stats.streak_days > 0 ? "Continue para não perder!" : "Assista hoje para começar"}
            />
          </div>
        )}

        {/* ── Continue de onde parou ─────────────────────────────────────── */}
        {!loading && stats?.last_lesson && (
          <section className="mb-8">
            <h2 className="text-base sm:text-lg font-semibold text-slate-white mb-3">
              Continue de onde parou
            </h2>
            <button
              onClick={() => {
                if (!stats.last_lesson) return;
                navigate(`/plataforma`);
              }}
              className="group w-full text-left bg-navy-lighter/60 border border-slate/10 hover:border-mint/40 rounded-2xl p-4 transition-all flex items-center gap-4"
            >
              <div className="relative shrink-0 w-24 sm:w-32 aspect-video rounded-lg overflow-hidden bg-navy">
                {stats.last_lesson.thumbnail ? (
                  <img
                    src={stats.last_lesson.thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate/40">
                    <PlayIcon />
                  </div>
                )}
                <div className="absolute inset-0 bg-navy/40 group-hover:bg-navy/20 transition-colors flex items-center justify-center">
                  <span className="text-mint opacity-80 group-hover:opacity-100">
                    <PlayIcon />
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium text-slate-white truncate">
                  {stats.last_lesson.title || "Aula sem título"}
                </p>
                <p className="text-xs text-slate mt-1">
                  {continueProgressPercent}% assistido
                  {stats.last_lesson.duration_seconds
                    ? ` · ${formatDuration(stats.last_lesson.watched_seconds)} de ${formatDuration(stats.last_lesson.duration_seconds)}`
                    : ""}
                </p>
                <div className="mt-2 h-1 bg-navy rounded-full overflow-hidden">
                  <div
                    className="h-full bg-mint rounded-full transition-all duration-700"
                    style={{ width: `${continueProgressPercent}%` }}
                  />
                </div>
              </div>
            </button>
          </section>
        )}

        {/* ── Atividade 30 dias ──────────────────────────────────────────── */}
        {!loading && stats && stats.activity_30d.length > 0 && (
          <section className="mb-8">
            <div className="flex items-end justify-between mb-3">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-white">
                  Atividade dos últimos 30 dias
                </h2>
                <p className="text-xs text-slate mt-1">
                  Pico de {formatDuration(maxDailySeconds)} em um único dia
                </p>
              </div>
            </div>
            <div className="bg-navy-lighter/60 border border-slate/10 rounded-2xl p-4 sm:p-5">
              <HeatmapBar activity={stats.activity_30d} max={maxDailySeconds} />
              <div className="flex items-center justify-between mt-3 text-2xs sm:text-xs text-slate">
                <span>
                  {new Date(stats.activity_30d[0].date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </span>
                <span>Hoje</span>
              </div>
            </div>
          </section>
        )}

        {/* ── Progresso por curso ────────────────────────────────────────── */}
        {!loading && stats && stats.ministries.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base sm:text-lg font-semibold text-slate-white mb-3">
              Progresso por curso
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {stats.ministries.map((m) => {
                const completionPercent = m.total_lessons > 0
                  ? Math.round((m.completed_lessons / m.total_lessons) * 100)
                  : 0;
                const startedPercent = m.total_lessons > 0
                  ? Math.round((m.started_lessons / m.total_lessons) * 100)
                  : 0;
                return (
                  <Link
                    key={m.ministry_id}
                    to={`/curso/${m.ministry_id}/modulos`}
                    className="group bg-navy-lighter/60 border border-slate/10 hover:border-mint/40 rounded-2xl p-4 sm:p-5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-semibold text-slate-white truncate">
                          {m.title}
                        </p>
                        <p className="text-xs text-slate mt-0.5">
                          {m.completed_lessons} de {m.total_lessons} aulas concluídas · {formatDuration(m.watched_seconds)} assistidos
                        </p>
                      </div>
                      <span className="text-mint font-semibold text-sm tabular-nums shrink-0">
                        {completionPercent}%
                      </span>
                    </div>
                    <div
                      className="relative h-2 bg-navy rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={completionPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="absolute inset-y-0 left-0 bg-mint/20 rounded-full transition-all duration-700"
                        style={{ width: `${startedPercent}%` }}
                      />
                      <div
                        className="absolute inset-y-0 left-0 bg-mint rounded-full transition-all duration-700"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-2xs text-slate/80">
                      <span>{m.started_lessons} iniciadas</span>
                      <span className="text-mint opacity-0 group-hover:opacity-100 transition-opacity">
                        Continuar →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Empty state ────────────────────────────────────────────────── */}
        {!loading && stats && stats.lessons_started === 0 && (
          <div className="bg-navy-lighter/60 border border-slate/10 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-mint/10 flex items-center justify-center text-mint">
              <PlayIcon />
            </div>
            <h3 className="text-slate-white font-semibold mb-1">Comece sua jornada</h3>
            <p className="text-sm text-slate mb-5">
              Você ainda não iniciou nenhuma aula. Que tal explorar os cursos disponíveis?
            </p>
            <Link
              to="/plataforma"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-mint text-navy font-semibold text-sm rounded-xl hover:shadow-mint transition-all"
            >
              Ver cursos disponíveis
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default MeuProgresso;
