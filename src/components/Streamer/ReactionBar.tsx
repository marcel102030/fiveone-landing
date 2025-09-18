import { useEffect, useState } from "react";
import { getCurrentUserId } from "../../utils/user";
import { fetchReactionState, setReaction } from "../../services/reactions";

type Counts = { like: number; dislike: number };

function keyFor(videoId: string) {
  return `fiveone_stream_reactions::${videoId}`;
}

function userKeyFor(videoId: string) {
  return `fiveone_stream_reactions_user::${videoId}`;
}

export default function ReactionBar({ videoId }: { videoId: string }) {
  const [counts, setCounts] = useState<Counts>({ like: 0, dislike: 0 });
  const [selected, setSelected] = useState<keyof Counts | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const uid = getCurrentUserId();
        if (uid) {
          const s = await fetchReactionState(uid, videoId);
          setCounts(s.counts);
          setSelected(s.selected);
        } else {
          const saved = localStorage.getItem(keyFor(videoId));
          if (saved) {
            const obj = JSON.parse(saved);
            const next: Counts = { like: Number(obj.like||0), dislike: Number(obj.dislike||0) };
            setCounts(next);
          }
          const savedUser = localStorage.getItem(userKeyFor(videoId));
          if (savedUser) setSelected(savedUser as keyof Counts);
        }
      } catch {}
    })();
  }, [videoId]);

  // se antes salvamos por URL e agora usamos ID, tenta migrar uma vez
  useEffect(()=>{
    try {
      if (/^mestre-/.test(videoId)) {
        const legacy = localStorage.getItem(keyFor((videoId as any).url || ''));
        if (legacy) {
          localStorage.setItem(keyFor(videoId), legacy);
          localStorage.removeItem(keyFor((videoId as any).url || ''));
        }
      }
    } catch {}
  }, [videoId]);

  function persist(nextCounts: Counts, nextSelected: keyof Counts | null) {
    try {
      localStorage.setItem(keyFor(videoId), JSON.stringify(nextCounts));
      if (nextSelected) localStorage.setItem(userKeyFor(videoId), nextSelected);
      else localStorage.removeItem(userKeyFor(videoId));
    } catch {}
  }

  async function toggle(type: keyof Counts) {
    const prevSelected = selected;
    const next: Counts = { ...counts };
    if (prevSelected === type) {
      next[type] = Math.max(0, next[type] - 1);
      setSelected(null);
      setCounts(next);
      persist(next, null);
      const uid = getCurrentUserId();
      if (uid) setReaction(uid, videoId, null).catch(()=>{});
      return;
    }
    if (prevSelected) next[prevSelected] = Math.max(0, next[prevSelected] - 1);
    next[type] += 1;
    setSelected(type);
    setCounts(next);
    persist(next, type);
    const uid = getCurrentUserId();
    if (uid) setReaction(uid, videoId, type as any).catch(()=>{});
  }

  return (
    <div className="reaction-bar reaction-modern">
      <button className={`react-btn thumb up ${selected === "like" ? "active" : ""}`} onClick={() => toggle("like")} aria-label="Curtir">
        <span className="icon" aria-hidden />
        <span className="react-count">{counts.like}</span>
      </button>
      <button className={`react-btn thumb down ${selected === "dislike" ? "active" : ""}`} onClick={() => toggle("dislike")} aria-label="Não curtir">
        <span className="icon" aria-hidden />
        <span className="react-count">{counts.dislike}</span>
      </button>
    </div>
  );
}
