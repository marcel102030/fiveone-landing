import { FormEvent, useEffect, useMemo, useState } from "react";

type Comment = {
  id: string;
  text: string;
  ts: number;
  likes: number;
};

function storageKey(videoId: string, tab: string) {
  return `fiveone_comments::${videoId}::${tab}`;
}

const TABS = ["comentarios", "duvidas"] as const;
type Tab = typeof TABS[number];

export default function CommentSection({ videoId }: { videoId: string }) {
  const [active, setActive] = useState<Tab>("comentarios");
  const [list, setList] = useState<Comment[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(videoId, active));
      setList(raw ? JSON.parse(raw) : []);
    } catch {
      setList([]);
    }
  }, [videoId, active]);

  function persist(next: Comment[]) {
    try { localStorage.setItem(storageKey(videoId, active), JSON.stringify(next)); } catch {}
  }

  function add(e: FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    const c: Comment = { id: crypto.randomUUID(), text: t, ts: Date.now(), likes: 0 };
    const next = [c, ...list];
    setList(next);
    setText("");
    persist(next);
  }

  function like(id: string) {
    const next = list.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c));
    setList(next);
    persist(next);
  }

  const countLabel = useMemo(() => `${list.length} ${list.length === 1 ? "Comentário" : "Comentários"}`, [list.length]);

  return (
    <div className="comments-wrap">
      <div className="comments-tabs">
        <button className={`comments-tab ${active === "comentarios" ? "active" : ""}`} onClick={() => setActive("comentarios")}>Comentários</button>
        <button className={`comments-tab ${active === "duvidas" ? "active" : ""}`} onClick={() => setActive("duvidas")}>Dúvidas</button>
      </div>

      <form onSubmit={add} className="comments-form">
        <input
          className="comments-input"
          placeholder={active === "comentarios" ? "Adicionar um comentário…" : "Adicionar uma dúvida…"}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="comments-send" type="submit">Enviar</button>
      </form>

      <div className="comments-counter">{countLabel}</div>

      <ul className="comments-list">
        {list.map((c) => (
          <li key={c.id} className="comment-item">
            <div className="comment-main">
              <div className="comment-avatar">ONE</div>
              <div className="comment-body">
                <div className="comment-meta">
                  <span className="comment-author">Aluno</span>
                  <span className="comment-dot">•</span>
                  <span className="comment-time">{new Date(c.ts).toLocaleString("pt-BR")}</span>
                </div>
                <div className="comment-text">{c.text}</div>
                <button className="comment-like" onClick={() => like(c.id)}>Curtir ({c.likes})</button>
              </div>
            </div>
          </li>
        ))}
        {list.length === 0 && <li className="comment-empty">Sem registros ainda.</li>}
      </ul>
    </div>
  );
}

