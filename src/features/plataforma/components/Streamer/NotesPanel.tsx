import { FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "../../../../shared/contexts/AuthContext";
import {
  LessonNote,
  addNote,
  deleteNote,
  fetchNotes,
  fetchNotesFromCache,
  updateNote,
} from "../../services/notes";
import { SkeletonText } from "../../../../shared/components/ui";

// ── Helpers ────────────────────────────────────────────────────────────────
function formatTs(seconds: number): string {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) {
    return `${h}:${String(m % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// ── Props ──────────────────────────────────────────────────────────────────
interface NotesPanelProps {
  lessonId: string;
  currentSeconds: number;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function NotesPanel({ lessonId, currentSeconds }: NotesPanelProps) {
  const { email } = useAuth();
  const [notes, setNotes]           = useState<LessonNote[]>([]);
  const [draft, setDraft]           = useState("");
  const [adding, setAdding]         = useState(false);
  const [loading, setLoading]       = useState(true);
  const [editId, setEditId]         = useState<string | null>(null);
  const [editText, setEditText]     = useState("");
  const [exportConfirm, setExportConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load notes on lessonId change
  useEffect(() => {
    if (!email) { setLoading(false); return; }
    setLoading(true);
    // Show cache immediately
    const cached = fetchNotesFromCache(email, lessonId);
    setNotes(cached);
    // Then fetch from server
    fetchNotes(email, lessonId)
      .then(setNotes)
      .catch(() => {/* keep cache */})
      .finally(() => setLoading(false));
  }, [lessonId, email]);

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !draft.trim() || adding) return;
    setAdding(true);
    // Optimistic
    const optimistic: LessonNote = {
      id: crypto.randomUUID(),
      userId: email,
      lessonId,
      text: draft.trim(),
      videoTs: currentSeconds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, optimistic].sort((a, b) => a.videoTs - b.videoTs));
    setDraft("");
    try {
      const saved = await addNote(email, lessonId, optimistic.text, optimistic.videoTs);
      setNotes((prev) =>
        prev.map((n) => (n.id === optimistic.id ? saved : n)).sort((a, b) => a.videoTs - b.videoTs)
      );
    } catch {
      // revert optimistic
      setNotes((prev) => prev.filter((n) => n.id !== optimistic.id));
      setDraft(optimistic.text);
    } finally {
      setAdding(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const prev = notes;
    setNotes((list) => list.filter((n) => n.id !== id));
    try {
      await deleteNote(id);
    } catch {
      setNotes(prev);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────
  const startEdit = (note: LessonNote) => {
    setEditId(note.id);
    setEditText(note.text);
  };

  const handleEditSave = async (id: string) => {
    if (!editText.trim()) return;
    const prevNotes = notes;
    setNotes((list) =>
      list.map((n) => (n.id === id ? { ...n, text: editText.trim() } : n))
    );
    setEditId(null);
    try {
      await updateNote(id, editText.trim());
    } catch {
      setNotes(prevNotes);
    }
  };

  // ── Export TXT ───────────────────────────────────────────────────────────
  const handleExport = () => {
    if (notes.length === 0) return;
    const lines = notes.map(
      (n) => `[${formatTs(n.videoTs)}] ${n.text}`
    );
    const content = `Notas da aula\nGerado em: ${new Date().toLocaleString("pt-BR")}\n\n${lines.join("\n\n")}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `notas-aula-${lessonId.slice(0, 8)}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    setExportConfirm(false);
  };

  if (!email) return null;

  return (
    <div className="mt-8 rounded-xl border border-slate/10 bg-navy-lighter/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate/10">
        <div className="flex items-center gap-2">
          {/* Notebook icon */}
          <svg className="w-4 h-4 text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <h3 className="text-sm font-semibold text-slate-white">Minhas Notas</h3>
          {notes.length > 0 && (
            <span className="text-xs text-slate bg-navy-lighter px-2 py-0.5 rounded-full">
              {notes.length}
            </span>
          )}
        </div>
        {notes.length > 0 && (
          <div className="relative">
            {!exportConfirm ? (
              <button
                onClick={() => setExportConfirm(true)}
                className="flex items-center gap-1 text-xs text-slate hover:text-mint transition-colors px-2 py-1 rounded"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Exportar TXT
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate">Baixar?</span>
                <button onClick={handleExport} className="text-xs text-mint hover:underline">Sim</button>
                <button onClick={() => setExportConfirm(false)} className="text-xs text-slate hover:text-slate-white">Não</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 border-b border-slate/10">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Adicionar nota no ${formatTs(currentSeconds)}…`}
          disabled={adding}
          rows={2}
          className="w-full bg-navy-lighter border border-slate/20 rounded-lg px-3 py-2 text-sm
                     text-slate-white placeholder-slate resize-none
                     focus:outline-none focus:border-mint/50 focus:ring-1 focus:ring-mint/30
                     transition-colors disabled:opacity-50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSubmit(e as unknown as FormEvent); }
          }}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate">
            ⏱ {formatTs(currentSeconds)}
          </span>
          <button
            type="submit"
            disabled={!draft.trim() || adding}
            className="flex items-center gap-1.5 px-4 py-2.5 sm:py-1.5 text-xs font-medium rounded-lg
                       bg-mint text-navy transition-all min-h-[44px] sm:min-h-0
                       hover:bg-mint/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {adding ? (
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            )}
            {adding ? "Salvando…" : "Adicionar nota"}
          </button>
        </div>
      </form>

      {/* Notes list */}
      <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
        {loading ? (
          <SkeletonText lines={3} />
        ) : notes.length === 0 ? (
          <p className="text-sm text-slate text-center py-2">
            Nenhuma nota ainda. Adicione uma nota enquanto assiste!
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="flex gap-3 p-3 bg-navy-lighter/60 rounded-lg border border-slate/10 group"
            >
              {/* Timestamp badge */}
              <button
                className="flex-shrink-0 text-xs font-mono text-mint bg-mint/10 px-2 py-0.5 rounded
                           hover:bg-mint/20 transition-colors cursor-pointer self-start mt-0.5"
                title="Timestamp no vídeo"
              >
                {formatTs(note.videoTs)}
              </button>

              {/* Text */}
              <div className="flex-1 min-w-0">
                {editId === note.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                      rows={2}
                      className="w-full bg-navy-lighter border border-mint/30 rounded px-2 py-1
                                 text-sm text-slate-white resize-none focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => void handleEditSave(note.id)}
                        className="text-xs text-mint hover:underline px-2 py-1.5 min-h-[36px]"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="text-xs text-slate hover:text-slate-white px-2 py-1.5 min-h-[36px]"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-light leading-relaxed whitespace-pre-wrap break-words">
                    {note.text}
                  </p>
                )}
              </div>

              {/* Actions — sempre visível no mobile, hover no desktop */}
              {editId !== note.id && (
                <div className="flex-shrink-0 flex items-start gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(note)}
                    className="p-2 text-slate hover:text-slate-white rounded transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="Editar nota"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => void handleDelete(note.id)}
                    className="p-2 text-slate hover:text-red-400 rounded transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="Excluir nota"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
