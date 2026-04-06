import { useEffect, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { listAdmins, createAdmin, revokeAdmin, AdminUser } from "../../services/userAccount";
import { useAdminToast } from "../../../../shared/components/AdminToast";

const PROTECTED_EMAILS = ["escolafiveone@gmail.com", "marcelojunio75@hotmail.com"];

export default function GerenciarAdmins() {
  document.title = "Gerenciar Admins | Five One";

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [saving, setSaving] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState<AdminUser | null>(null);
  const [revoking, setRevoking] = useState(false);
  const toast = useAdminToast();

  async function load() {
    setLoading(true);
    try {
      setAdmins(await listAdmins());
    } catch (e: any) {
      toast.error("Erro ao carregar admins", e?.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) return;
    setSaving(true);
    try {
      await createAdmin(form.email.trim(), form.password.trim(), form.name.trim() || null);
      toast.success("Administrador criado com sucesso.");
      setForm({ email: "", password: "", name: "" });
      setShowNew(false);
      await load();
    } catch (err: any) {
      toast.error("Erro ao criar administrador", err?.message || "Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function onRevoke(admin: AdminUser) {
    setRevoking(true);
    try {
      await revokeAdmin(admin.email);
      toast.success("Acesso de administrador removido.");
      setConfirmRevoke(null);
      await load();
    } catch (err: any) {
      toast.error("Erro ao remover acesso", err?.message || "Tente novamente.");
    } finally {
      setRevoking(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy text-slate-white">
      {/* Header */}
      <header className="border-b border-slate/10 px-6 py-4 flex items-center gap-4">
        <Link to="/admin/administracao"
          className="text-slate hover:text-slate-white text-sm flex items-center gap-1.5 transition-colors">
          ← Voltar
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Gerenciar Administradores</h1>
          <p className="text-xs text-slate">Adicione ou remova acessos de administrador à plataforma.</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 rounded-xl bg-mint text-navy text-sm font-semibold hover:bg-mint/90 transition-colors">
          + Novo Admin
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* Info box */}
        <div className="rounded-xl bg-navy-light border border-slate/10 p-4 text-sm text-slate">
          <p className="font-semibold text-slate-white mb-1">Como funciona</p>
          <p>Administradores acessam o painel pelo mesmo login em <strong className="text-slate-white">/admin</strong>. Não há tabela separada — o acesso é concedido pelo campo <code className="text-mint bg-navy px-1 rounded">role = ADMIN</code> na tabela <code className="text-mint bg-navy px-1 rounded">platform_user</code>.</p>
          <p className="mt-2">Para remover o acesso, o usuário continua cadastrado como aluno (role: STUDENT). Para excluir completamente, acesse a página de Alunos.</p>
        </div>

        {/* Lista */}
        <section className="bg-navy-light rounded-2xl border border-slate/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate/10">
            <h2 className="font-semibold text-slate-white">Administradores ativos ({admins.length})</h2>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-12 bg-navy-lighter rounded-xl animate-pulse" />
              ))}
            </div>
          ) : admins.length === 0 ? (
            <p className="p-5 text-slate text-sm">Nenhum administrador cadastrado.</p>
          ) : (
            <ul className="divide-y divide-slate/5">
              {admins.map(a => {
                const isProtected = PROTECTED_EMAILS.includes(a.email.toLowerCase());
                return (
                  <li key={a.email} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-9 h-9 rounded-full bg-mint/20 text-mint flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {(a.name || a.email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-white truncate">{a.name || "—"}</p>
                      <p className="text-xs text-slate truncate">{a.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {a.created_at && (
                        <span className="text-xs text-slate hidden sm:block">
                          desde {new Date(a.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                      {isProtected ? (
                        <span className="text-xs text-slate/40 italic">protegido</span>
                      ) : (
                        <button
                          onClick={() => setConfirmRevoke(a)}
                          className="px-3 py-1 rounded-lg text-xs text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors">
                          Remover acesso
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      {/* Modal: Novo Admin */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-navy-light border border-slate/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate/10">
              <h3 className="font-semibold text-slate-white">Novo Administrador</h3>
              <button onClick={() => setShowNew(false)}
                className="text-slate hover:text-slate-white text-xl leading-none">×</button>
            </div>
            <form onSubmit={onSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-slate mb-1">Nome (opcional)</label>
                <input
                  type="text"
                  className="w-full bg-navy border border-slate/20 rounded-xl px-4 py-2.5 text-sm text-slate-white placeholder-slate/40 focus:border-mint/50 focus:outline-none"
                  placeholder="Ex: João Silva"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-slate mb-1">E-mail *</label>
                <input
                  type="email"
                  required
                  className="w-full bg-navy border border-slate/20 rounded-xl px-4 py-2.5 text-sm text-slate-white placeholder-slate/40 focus:border-mint/50 focus:outline-none"
                  placeholder="admin@exemplo.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-slate mb-1">Senha de acesso *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full bg-navy border border-slate/20 rounded-xl px-4 py-2.5 text-sm text-slate-white placeholder-slate/40 focus:border-mint/50 focus:outline-none"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <p className="text-xs text-slate mt-1">O admin usará esse e-mail e senha para entrar em /admin.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNew(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate/20 text-sm text-slate hover:text-slate-white transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-mint text-navy text-sm font-semibold hover:bg-mint/90 disabled:opacity-50 transition-colors">
                  {saving ? "Criando…" : "Criar Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Remoção */}
      {confirmRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-navy-light border border-slate/10 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="font-semibold text-slate-white mb-2">Remover acesso de administrador?</h3>
            <p className="text-sm text-slate mb-1">
              <strong className="text-slate-white">{confirmRevoke.name || confirmRevoke.email}</strong> perderá acesso ao painel admin.
            </p>
            <p className="text-xs text-slate mb-5">O cadastro continuará ativo como aluno. Para excluir completamente, acesse a página de Alunos.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRevoke(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate/20 text-sm text-slate hover:text-slate-white transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => void onRevoke(confirmRevoke)}
                disabled={revoking}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors">
                {revoking ? "Removendo…" : "Remover acesso"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
