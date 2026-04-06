import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { clearAdminAuthenticated, getAdminEmail } from "../../../../shared/utils/adminAuth";
import { signOut } from "../../services/userAccount";
import { fetchDashboardStats, fetchTopLessons, fetchRecentUsers, AdminDashboardStats, TopLesson, RecentUser } from "../../services/adminStats";

const quickAccessLinks = [
  { label: "Acessar Site", href: "https://fiveonemovement.com/", icon: "🌐" },
  { label: "Acessar Plataforma", href: "https://fiveonemovement.com/#/login-aluno", icon: "🎓" },
  { label: "Rede de Igrejas", href: "https://redeigrejanascasas.com/", icon: "🏠" },
];

const navCards = [
  { to: "/admin/alunos", title: "Alunos", desc: "Gerencie perfis e matrículas.", icon: "👥" },
  { to: "/admin/conteudo", title: "Conteúdo", desc: "Formações, módulos e aulas.", icon: "📚" },
  { to: "/admin/moderacao", title: "Moderação", desc: "Aprovar e rejeitar comentários.", icon: "💬" },
  { to: "/admin/certificados", title: "Certificados", desc: "Emitir e visualizar certificados.", icon: "🏆" },
  { to: "/admin/igrejas", title: "Quiz de Igrejas", desc: "Cadastro e relatórios do quiz.", icon: "⛪" },
  { to: "/admin/rede-igrejas", title: "Rede de Igrejas", desc: "Cadastros da rede nas casas.", icon: "🏘️" },
  { to: "/admin/relatorio-quiz", title: "Relatório Quiz", desc: "Consolidados e exportações.", icon: "📊" },
  { to: "/admin/blog", title: "Blog Site", desc: "Postagens e categorias.", icon: "✍️" },
  { to: "/admin/admins", title: "Administradores", desc: "Gerenciar acessos de admin.", icon: "🔑" },
];

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 flex flex-col gap-1 ${accent ? 'bg-mint/10 border border-mint/30' : 'bg-navy-light border border-slate/10'}`}>
      <p className="text-xs text-slate uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold ${accent ? 'text-mint' : 'text-slate-white'}`}>{value}</p>
      {sub && <p className="text-xs text-slate">{sub}</p>}
    </div>
  );
}

export default function AdministracaoFiveOne() {
  document.title = "Administração | Five One";
  const navigate = useNavigate();

  const name = useMemo(() => {
    const email = (getAdminEmail() || "").toLowerCase();
    if (email === "marcelojunio75@hotmail.com") return "Marcelo";
    if (email === "sueniakarcia@gmail.com") return "Suenia";
    if (!email) return "Admin";
    const first = email.split("@")[0].split(/[._-]/)[0];
    return first ? first[0].toUpperCase() + first.slice(1) : "Admin";
  }, []);

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [topLessons, setTopLessons] = useState<TopLesson[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchDashboardStats(), fetchTopLessons(5), fetchRecentUsers(5)])
      .then(([s, lessons, users]) => {
        setStats(s);
        setTopLessons(lessons);
        setRecentUsers(users);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSignOut() {
    try { await signOut(); } catch { /* noop */ }
    clearAdminAuthenticated();
    navigate('/admin', { replace: true });
  }

  const formationLabel: Record<string, string> = {
    APOSTOLO: 'Apóstolo', PROFETA: 'Profeta', EVANGELISTA: 'Evangelista',
    PASTOR: 'Pastor', MESTRE: 'Mestre',
  };

  return (
    <div className="min-h-screen bg-navy text-slate-white">
      {/* Topbar */}
      <header className="border-b border-slate/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-white">Olá, {name}! 👋</h1>
          <p className="text-sm text-slate">Painel de administração Five One</p>
        </div>
        <div className="flex items-center gap-3">
          {quickAccessLinks.map(l => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate hover:text-slate-white hover:bg-navy-lighter border border-slate/10 transition-colors">
              <span>{l.icon}</span>{l.label}
            </a>
          ))}
          <button onClick={() => void handleSignOut()}
            className="px-3 py-1.5 rounded-lg text-xs text-slate hover:text-red-400 hover:bg-red-500/10 border border-slate/10 transition-colors">
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-8 space-y-8">

        {/* Stats cards */}
        <section>
          <h2 className="text-sm font-semibold text-slate uppercase tracking-wider mb-4">Visão Geral</h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-5 bg-navy-light border border-slate/10 animate-pulse h-24" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard label="Alunos ativos" value={stats?.totalAlunos ?? 0} accent />
              <StatCard label="Novos (30d)" value={stats?.novos30d ?? 0} sub="últimos 30 dias" />
              <StatCard label="Aulas publicadas" value={stats?.totalAulas ?? 0} />
              <StatCard label="Conclusões" value={stats?.totalConclusoes ?? 0} />
              <StatCard label="Comentários pendentes" value={stats?.comentariosPendentes ?? 0}
                accent={(stats?.comentariosPendentes ?? 0) > 0} />
              <StatCard label="Certificados" value={stats?.totalCertificados ?? 0} />
            </div>
          )}
        </section>

        {/* Nav cards */}
        <section>
          <h2 className="text-sm font-semibold text-slate uppercase tracking-wider mb-4">Gerenciar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {navCards.map(c => (
              <Link key={c.to} to={c.to}
                className="group flex flex-col gap-2 p-4 rounded-2xl bg-navy-light border border-slate/10 hover:border-mint/40 hover:bg-navy-lighter transition-all">
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <p className="font-semibold text-slate-white text-sm group-hover:text-mint transition-colors">{c.title}</p>
                  <p className="text-xs text-slate mt-0.5">{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom: top lessons + recent users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Top aulas */}
          <section className="bg-navy-light rounded-2xl border border-slate/10 p-5">
            <h2 className="font-semibold text-slate-white mb-4 flex items-center gap-2">
              <span>🔥</span> Aulas mais vistas
            </h2>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-navy-lighter rounded-lg animate-pulse" />
                ))}
              </div>
            ) : topLessons.length === 0 ? (
              <p className="text-slate text-sm">Nenhuma aula com visualizações ainda.</p>
            ) : (
              <ol className="space-y-2">
                {topLessons.map((l, i) => (
                  <li key={l.id} className="flex items-center gap-3 py-2 border-b border-slate/5 last:border-0">
                    <span className="text-xs font-bold text-slate w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-white truncate">{l.title}</p>
                    </div>
                    <span className="text-xs text-slate whitespace-nowrap">{l.views_count ?? 0} views</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Alunos recentes */}
          <section className="bg-navy-light rounded-2xl border border-slate/10 p-5">
            <h2 className="font-semibold text-slate-white mb-4 flex items-center gap-2">
              <span>🆕</span> Alunos recentes
            </h2>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-navy-lighter rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentUsers.length === 0 ? (
              <p className="text-slate text-sm">Nenhum aluno cadastrado ainda.</p>
            ) : (
              <ul className="space-y-2">
                {recentUsers.map(u => (
                  <li key={u.email} className="flex items-center gap-3 py-2 border-b border-slate/5 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-mint/20 text-mint flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {(u.name || u.email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-white truncate">{u.name || u.email}</p>
                      <p className="text-xs text-slate">{formationLabel[u.formation ?? ''] ?? u.formation ?? '—'}</p>
                    </div>
                    <span className="text-xs text-slate whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

      </main>
    </div>
  );
}
