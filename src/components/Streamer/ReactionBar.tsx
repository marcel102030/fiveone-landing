import { useEffect, useState } from "react";

type Counts = { like: number; love: number; dislike: number };

function keyFor(videoId: string) {
  return `fiveone_stream_reactions::${videoId}`;
}

function userKeyFor(videoId: string) {
  return `fiveone_stream_reactions_user::${videoId}`;
}

export default function ReactionBar({ videoId }: { videoId: string }) {
  const [counts, setCounts] = useState<Counts>({ like: 0, love: 0, dislike: 0 });
  const [selected, setSelected] = useState<keyof Counts | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(keyFor(videoId));
      if (saved) setCounts(JSON.parse(saved));
      const savedUser = localStorage.getItem(userKeyFor(videoId));
      if (savedUser) setSelected(savedUser as keyof Counts);
    } catch {}
  }, [videoId]);

  function persist(nextCounts: Counts, nextSelected: keyof Counts | null) {
    try {
      localStorage.setItem(keyFor(videoId), JSON.stringify(nextCounts));
      if (nextSelected) localStorage.setItem(userKeyFor(videoId), nextSelected);
      else localStorage.removeItem(userKeyFor(videoId));
    } catch {}
  }

  function toggle(type: keyof Counts) {
    const prevSelected = selected;
    const next: Counts = { ...counts };
    if (prevSelected === type) {
      next[type] = Math.max(0, next[type] - 1);
      setSelected(null);
      setCounts(next);
      persist(next, null);
      return;
    }
    if (prevSelected) next[prevSelected] = Math.max(0, next[prevSelected] - 1);
    next[type] += 1;
    setSelected(type);
    setCounts(next);
    persist(next, type);
  }

  return (
    <div className="reaction-bar">
      <button className={`react-btn ${selected === "love" ? "active" : ""}`} onClick={() => toggle("love")}>❤️ {counts.love}</button>
      <button className={`react-btn ${selected === "like" ? "active" : ""}`} onClick={() => toggle("like")}>👍 {counts.like}</button>
      <button className={`react-btn ${selected === "dislike" ? "active" : ""}`} onClick={() => toggle("dislike")}>👎 {counts.dislike}</button>
    </div>
  );
}

