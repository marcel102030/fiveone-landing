import { FormEvent, useEffect, useMemo, useState } from "react";
import { getCurrentUserId } from "../../utils/user";
import { addComment, fetchComments, likeComment } from "../../services/comments";

type Comment = {
  id: string;
  text: string;
  ts: number;
  likes: number;
};

function storageKey(videoId: string) {
  return `fiveone_comments::${videoId}`;
}

export default function CommentSection({ videoId }: { videoId: string }) {
  const [list, setList] = useState<Comment[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const rows = await fetchComments(videoId);
        setList(rows.map(r => ({ id: r.id, text: r.text, ts: new Date(r.created_at).getTime(), likes: r.likes })));
      } catch {
        try {
          const raw = localStorage.getItem(storageKey(videoId));
          setList(raw ? JSON.parse(raw) : []);
        } catch { setList([]); }
      }
    })();
  }, [videoId]);

  function persist(next: Comment[]) { try { localStorage.setItem(storageKey(videoId), JSON.stringify(next)); } catch {} }

  function add(e: FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    const c: Comment = { id: crypto.randomUUID(), text: t, ts: Date.now(), likes: 0 };
    setText("");
    const uid = getCurrentUserId();
    if (uid) {
      addComment(uid, videoId, t)
        .then(() => fetchComments(videoId))
        .then(rows => setList(rows.map(r => ({ id: r.id, text: r.text, ts: new Date(r.created_at).getTime(), likes: r.likes }))))
        .catch(() => { const next = [c, ...list]; setList(next); persist(next); });
    } else {
      const next = [c, ...list]; setList(next); persist(next);
    }
  }

  function like(id: string) {
    const next = list.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c));
    setList(next);
    persist(next);
    likeComment(id).catch(()=>{});
  }

  const countLabel = useMemo(() => `${list.length} ${list.length === 1 ? "Comentário" : "Comentários"}`, [list.length]);

  return (
    <div className="comments-wrap comments-modern">
      <div className="comments-header">
        <h4>Comentários</h4>
        <span className="comments-counter">{countLabel}</span>
      </div>

      <form onSubmit={add} className="comments-form">
        <input
          className="comments-input"
          placeholder="Adicionar um comentário…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="comments-send" type="submit">Enviar</button>
      </form>

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
                <button className="comment-like" onClick={() => like(c.id)}>👍 Curtir ({c.likes})</button>
              </div>
            </div>
          </li>
        ))}
        {list.length === 0 && <li className="comment-empty">Sem registros ainda.</li>}
      </ul>
    </div>
  );
}
