import { useEffect, useState } from "react";
import { getCurrentUserId } from "../../../../shared/utils/user";
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
  const uid = getCurrentUserId();

  useEffect(() => {
    (async () => {
      try {
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
  }, [videoId, uid]);

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
      if (uid) setReaction(uid, videoId, null).catch(()=>{});
      return;
    }
    if (prevSelected) next[prevSelected] = Math.max(0, next[prevSelected] - 1);
    next[type] += 1;
    setSelected(type);
    setCounts(next);
    persist(next, type);
    if (uid) setReaction(uid, videoId, type as any).catch(()=>{});
  }

  return (
    <div className="flex items-center gap-2">
      {/* Curtir */}
      <button
        onClick={() => toggle("like")}
        aria-label="Curtir"
        className={`flex items-center gap-1.5 px-3 py-2.5 sm:py-1.5 rounded-full text-sm font-medium transition-all min-h-[44px] sm:min-h-0 ${
          selected === "like"
            ? "bg-mint/20 text-mint border border-mint/40"
            : "bg-navy-lighter text-slate hover:text-slate-white border border-transparent"
        }`}
      >
        {/* Thumbs-up SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/>
          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
        </svg>
        <span>{counts.like > 0 ? counts.like : ""}</span>
      </button>

      {/* Não curtir */}
      <button
        onClick={() => toggle("dislike")}
        aria-label="Não curtir"
        className={`flex items-center gap-1.5 px-3 py-2.5 sm:py-1.5 rounded-full text-sm font-medium transition-all min-h-[44px] sm:min-h-0 ${
          selected === "dislike"
            ? "bg-red-500/20 text-red-400 border border-red-500/40"
            : "bg-navy-lighter text-slate hover:text-slate-white border border-transparent"
        }`}
      >
        {/* Thumbs-down SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3z"/>
          <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
        </svg>
        <span>{counts.dislike > 0 ? counts.dislike : ""}</span>
      </button>
    </div>
  );
}
