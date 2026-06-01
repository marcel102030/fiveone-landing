import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  type BlogComment,
  type BlogCommentStatus,
  deleteComment,
  formatPostDate,
  listCommentsAdmin,
  setCommentStatus,
} from "../../../institucional/services/blog";

type CommentWithPost = BlogComment & { post_title?: string; post_slug?: string };

const STATUS_LABEL: Record<BlogCommentStatus, { label: string; tone: string }> = {
  pending:  { label: "Pendente", tone: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
  approved: { label: "Aprovado", tone: "bg-mint/10 text-mint border-mint/30" },
  rejected: { label: "Rejeitado", tone: "bg-red-500/10 text-red-300 border-red-500/30" },
};

export default function ModeracaoBlog() {
  useEffect(() => {
    document.title = "Moderação Blog | Five One Admin";
  }, []);

  const [comments, setComments] = useState<CommentWithPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BlogCommentStatus | "ALL">("pending");
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await listCommentsAdmin({ status: filter });
      setComments(data);
    } catch (e: any) {
      showToast(e?.message || "Erro ao carregar.", false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function setStatus(id: string, status: BlogCommentStatus) {
    setProcessing((s) => new Set(s).add(id));
    try {
      await setCommentStatus(id, status);
      setComments((prev) => prev.filter((c) => c.id !== id));
      showToast(
        status === "approved" ? "Comentário aprovado." : "Comentário rejeitado.",
        status === "approved",
      );
    } catch (e: any) {
      showToast(e?.message || "Falha.", false);
    } finally {
      setProcessing((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este comentário definitivamente?")) return;
    setProcessing((s) => new Set(s).add(id));
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      showToast("Comentário excluído.", true);
    } catch (e: any) {
      showToast(e?.message || "Falha.", false);
    } finally {
      setProcessing((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <div className="min-h-screen bg-navy text-slate-light">
      <header className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Link to="/admin/administracao" className="text-xs text-slate hover:text-mint">
              ← Voltar à administração
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-white mt-1">
              Moderação de comentários — Blog
            </h1>
            <p className="text-sm text-slate mt-0.5">
              Aprove ou rejeite comentários públicos das leituras
            </p>
          </div>
          <Link
            to="/admin/blog"
            className="text-xs px-4 py-2 rounded-xl border border-slate/20 text-slate-light hover:border-mint/40 transition"
          >
            ✍️ Editor de posts
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip label="Pendentes" active={filter === "pending"} onClick={() => setFilter("pending")} />
          <FilterChip label="Aprovados" active={filter === "approved"} onClick={() => setFilter("approved")} />
          <FilterChip label="Rejeitados" active={filter === "rejected"} onClick={() => setFilter("rejected")} />
          <FilterChip label="Todos" active={filter === "ALL"} onClick={() => setFilter("ALL")} />
        </div>

        {/* Lista */}
        {loading ? (
          <div className="bg-navy-light/60 border border-slate/10 rounded-2xl p-8 text-slate text-sm text-center">
            Carregando…
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-navy-light/60 border border-slate/10 rounded-2xl p-12 text-slate text-sm text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-mint/10 flex items-center justify-center text-mint text-2xl">✓</div>
            <p className="text-slate-light font-semibold">Nada na fila.</p>
            <p className="mt-1">
              {filter === "pending"
                ? "Sem comentários aguardando moderação."
                : "Nenhum comentário com este status."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <article
                key={c.id}
                className="bg-navy-light border border-slate/10 rounded-2xl p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-mint/15 border border-mint/30 flex items-center justify-center text-mint text-sm font-bold uppercase">
                      {c.author_name.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-white">
                        {c.author_name}
                      </p>
                      {c.author_email && (
                        <p className="text-2xs text-slate">{c.author_email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex text-2xs uppercase tracking-wider px-2 py-1 rounded-full border ${STATUS_LABEL[c.status].tone}`}
                    >
                      {STATUS_LABEL[c.status].label}
                    </span>
                    <span className="text-2xs text-slate">
                      {formatPostDate(c.created_at)}
                    </span>
                  </div>
                </div>

                {c.post_title && (
                  <p className="text-2xs text-slate mb-3">
                    em{" "}
                    <Link
                      to={`/insights/${c.post_slug}`}
                      target="_blank"
                      className="text-mint hover:underline"
                    >
                      {c.post_title}
                    </Link>
                  </p>
                )}

                <p className="text-sm text-slate-light leading-relaxed whitespace-pre-wrap mb-4">
                  {c.content}
                </p>

                <div className="flex flex-wrap gap-2">
                  {c.status !== "approved" && (
                    <button
                      onClick={() => setStatus(c.id, "approved")}
                      disabled={processing.has(c.id)}
                      className="px-4 py-2 rounded-lg bg-mint text-navy text-xs font-bold hover:shadow-mint transition disabled:opacity-50"
                    >
                      ✓ Aprovar
                    </button>
                  )}
                  {c.status !== "rejected" && (
                    <button
                      onClick={() => setStatus(c.id, "rejected")}
                      disabled={processing.has(c.id)}
                      className="px-4 py-2 rounded-lg border border-slate/30 text-slate-light text-xs hover:border-amber-500/50 hover:text-amber-300 transition disabled:opacity-50"
                    >
                      ✕ Rejeitar
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={processing.has(c.id)}
                    className="px-4 py-2 rounded-lg border border-red-500/30 text-red-300 text-xs hover:bg-red-500/10 transition disabled:opacity-50"
                  >
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl border shadow-card ${
            toast.ok
              ? "bg-mint/10 border-mint/40 text-mint"
              : "bg-red-500/10 border-red-500/40 text-red-300"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "bg-mint text-navy border-mint"
          : "border-slate/20 text-slate hover:border-mint/40 hover:text-slate-light"
      }`}
    >
      {label}
    </button>
  );
}
