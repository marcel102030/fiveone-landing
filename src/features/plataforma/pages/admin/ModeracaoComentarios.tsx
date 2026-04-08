import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPendingComments, approveComment, rejectComment, PendingComment } from "../../services/adminStats";

export default function ModeracaoComentarios() {
  document.title = "Moderação | Five One Admin";

  const [comments, setComments] = useState<PendingComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetchPendingComments()
      .then(setComments)
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function handle(id: string, action: 'approve' | 'reject') {
    setProcessing(prev => new Set(prev).add(id));
    try {
      if (action === 'approve') await approveComment(id);
      else await rejectComment(id);
      setComments(prev => prev.filter(c => c.id !== id));
      showToast(action === 'approve' ? 'Comentário aprovado.' : 'Comentário rejeitado.', action === 'approve');
    } catch {
      showToast('Erro ao processar comentário.', false);
    } finally {
      setProcessing(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }

  return (
    <div className="min-h-screen bg-navy text-slate-white">
      <header className="border-b border-slate/10 px-6 py-4 flex items-center gap-4">
        <Link to="/admin/administracao" className="text-slate hover:text-mint transition-colors text-sm">← Painel</Link>
        <div>
          <h1 className="text-lg font-bold">Moderação de Comentários</h1>
          <p className="text-xs text-slate">{comments.length} comentário{comments.length !== 1 ? 's' : ''} pendente{comments.length !== 1 ? 's' : ''}</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-navy-light rounded-2xl border border-slate/10 animate-pulse" />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">✅</p>
            <p className="text-slate-white font-semibold text-lg">Tudo em dia!</p>
            <p className="text-slate text-sm mt-1">Nenhum comentário aguardando moderação.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map(c => {
              const busy = processing.has(c.id);
              return (
                <div key={c.id} className="bg-navy-light rounded-2xl border border-slate/10 p-5">
                  <div className="flex items-center gap-2 mb-3 text-xs text-slate">
                    <span className="font-mono bg-navy-lighter px-2 py-0.5 rounded">{c.user_id.split('@')[0]}</span>
                    <span>·</span>
                    <span>aula: {c.lesson_id.slice(0, 12)}…</span>
                    <span>·</span>
                    <span>{formatDate(c.created_at)}</span>
                    {c.parent_id && (
                      <span className="ml-auto bg-navy-lighter px-2 py-0.5 rounded text-slate">↩ resposta</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-white leading-relaxed mb-4">{c.text}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => void handle(c.id, 'approve')}
                      disabled={busy}
                      className="flex-1 py-2 rounded-xl text-sm font-medium bg-mint/10 text-mint border border-mint/30 hover:bg-mint/20 transition-colors disabled:opacity-50">
                      {busy ? '…' : '✓ Aprovar'}
                    </button>
                    <button
                      onClick={() => void handle(c.id, 'reject')}
                      disabled={busy}
                      className="flex-1 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors disabled:opacity-50">
                      {busy ? '…' : '✕ Rejeitar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
