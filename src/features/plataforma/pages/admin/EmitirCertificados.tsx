import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { issueCertificate, fetchCertificates } from "../../services/adminStats";
import { listUsersPage, FormationKey, FORMATION_KEYS, toFormationLabel } from "../../services/userAccount";

interface Certificate {
  id: string;
  user_id: string;
  ministry_id: string;
  issued_at: string;
  verify_code: string;
}

async function sendCertEmail(opts: {
  to: string; name: string | null; formation: string; verifyCode: string; issuedAt: string;
}) {
  try {
    await fetch('/api/certificate-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    });
  } catch {
    // email failure is non-critical
  }
}

export default function EmitirCertificados() {
  document.title = "Certificados | Five One Admin";

  const [certs, setCerts] = useState<Certificate[]>([]);
  const [users, setUsers] = useState<{ email: string; name: string | null; formation: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<{ userId: string; ministryId: FormationKey | '' }>({ userId: '', ministryId: '' });
  const [issuing, setIssuing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    Promise.all([
      fetchCertificates(),
      listUsersPage({ q: '', page: 0, pageSize: 200, formation: 'ALL' }),
    ]).then(([c, u]) => {
      setCerts(c as Certificate[]);
      setUsers(u.rows.map(r => ({ email: r.email, name: r.name, formation: r.formation ?? null })));
    }).finally(() => setLoading(false));
  }, []);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!form.userId || !form.ministryId) return;
    setIssuing(true);
    try {
      const verifyCode = await issueCertificate(form.userId, form.ministryId);
      const updated = await fetchCertificates();
      setCerts(updated as Certificate[]);

      // Enviar email ao aluno
      const user = users.find(u => u.email === form.userId);
      void sendCertEmail({
        to: form.userId,
        name: user?.name ?? null,
        formation: toFormationLabel(form.ministryId),
        verifyCode,
        issuedAt: new Date().toISOString(),
      });

      setForm({ userId: '', ministryId: '' });
      showToast('Certificado emitido com sucesso!', true);
    } catch {
      showToast('Erro ao emitir certificado.', false);
    } finally {
      setIssuing(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { dateStyle: 'long' });
  }

  const formationLabel: Record<string, string> = {
    APOSTOLO: 'Apóstolo', PROFETA: 'Profeta', EVANGELISTA: 'Evangelista',
    PASTOR: 'Pastor', MESTRE: 'Mestre',
  };

  return (
    <div className="min-h-screen bg-navy text-slate-white">
      <header className="border-b border-slate/10 px-6 py-4 flex items-center gap-4">
        <Link to="/admin/administracao" className="text-slate hover:text-mint transition-colors text-sm">← Painel</Link>
        <div>
          <h1 className="text-lg font-bold">Certificados</h1>
          <p className="text-xs text-slate">{certs.length} emitido{certs.length !== 1 ? 's' : ''}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Emitir novo */}
        <section className="bg-navy-light rounded-2xl border border-slate/10 p-6">
          <h2 className="font-semibold text-slate-white mb-4 flex items-center gap-2">
            <span>🏆</span> Emitir novo certificado
          </h2>
          <form onSubmit={e => void handleIssue(e)} className="flex flex-col sm:flex-row gap-3">
            <select
              value={form.userId}
              onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}
              className="flex-1 bg-navy-lighter border border-slate/20 rounded-xl px-4 py-2.5 text-sm text-slate-white focus:border-mint outline-none"
              required>
              <option value="">Selecionar aluno…</option>
              {users.map(u => (
                <option key={u.email} value={u.email}>
                  {u.name || u.email} {u.formation ? `(${formationLabel[u.formation] ?? u.formation})` : ''}
                </option>
              ))}
            </select>
            <select
              value={form.ministryId}
              onChange={e => setForm(f => ({ ...f, ministryId: e.target.value as FormationKey }))}
              className="sm:w-48 bg-navy-lighter border border-slate/20 rounded-xl px-4 py-2.5 text-sm text-slate-white focus:border-mint outline-none"
              required>
              <option value="">Formação…</option>
              {FORMATION_KEYS.map(k => (
                <option key={k} value={k}>{toFormationLabel(k)}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={issuing || !form.userId || !form.ministryId}
              className="px-6 py-2.5 rounded-xl bg-mint text-navy text-sm font-bold hover:bg-mint/90 transition-colors disabled:opacity-50">
              {issuing ? 'Emitindo…' : 'Emitir'}
            </button>
          </form>
        </section>

        {/* Lista de certificados */}
        <section>
          <h2 className="text-sm font-semibold text-slate uppercase tracking-wider mb-4">Histórico</h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-navy-light rounded-2xl border border-slate/10 animate-pulse" />
              ))}
            </div>
          ) : certs.length === 0 ? (
            <div className="text-center py-12 text-slate">Nenhum certificado emitido ainda.</div>
          ) : (
            <div className="space-y-3">
              {certs.map(c => (
                <div key={c.id} className="flex items-center gap-4 bg-navy-light rounded-2xl border border-slate/10 px-5 py-4">
                  <div className="w-10 h-10 rounded-full bg-mint/10 text-mint flex items-center justify-center text-lg flex-shrink-0">
                    🏆
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-white truncate">{c.user_id}</p>
                    <p className="text-xs text-slate">{formationLabel[c.ministry_id] ?? c.ministry_id} · {formatDate(c.issued_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate">Código</p>
                      <p className="text-xs font-mono text-mint">{c.verify_code.slice(0, 8)}…</p>
                    </div>
                    <a
                      href={`/#/certificado/${c.verify_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 rounded-lg bg-mint/10 text-mint border border-mint/20 hover:bg-mint/20 transition-colors whitespace-nowrap">
                      Ver →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.ok ? 'bg-mint text-navy' : 'bg-red-500/90 text-white'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
