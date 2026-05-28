import { useEffect, useState } from "react";
import { supabase } from "../../../../shared/lib/supabaseClient";

type ReactionType = "clap" | "insight" | "inspire";

const LS_KEY = (postId: string) => `fiveone_blog_reacted_${postId}`;

// ── Ícones SVG monocromáticos ─────────────────────────────────

const ClapIcon = ({ filled }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-4 h-4">
    <path d="M14 5l-3 6" />
    <path d="M5 11l-2 5a4 4 0 0 0 1.17 4.83l1.66 1.17a4 4 0 0 0 5.06-.39l5.34-5.34a3 3 0 0 0-4.24-4.24L8.83 13" />
    <path d="M13 4l-4 4" />
    <path d="M19 8l-3 3" />
    <path d="M17 3l-1 2" />
  </svg>
);

const LightbulbIcon = ({ filled }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-4 h-4">
    <path d="M9 18h6" />
    <path d="M10 21h4" />
    <path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1.3 1.5 1.6 2.5h4.8c.3-1 .9-1.8 1.6-2.5A6 6 0 0 0 12 3z" />
  </svg>
);

const SparkleIcon = ({ filled }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-4 h-4">
    <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
    <path d="M19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
    <path d="M5 14l.6 1.2 1.2.6-1.2.6L5 17.6l-.6-1.2-1.2-.6 1.2-.6z" />
  </svg>
);

const REACTIONS: {
  type: ReactionType;
  label: string;
  Icon: typeof ClapIcon;
}[] = [
  { type: "clap",    label: "Aplaudir",   Icon: ClapIcon },
  { type: "insight", label: "Aprendi",    Icon: LightbulbIcon },
  { type: "inspire", label: "Inspirou",   Icon: SparkleIcon },
];

/**
 * Reações no rodapé do post — estilo editorial discreto.
 * Botões com ícone SVG mint + label + contador (só se >0).
 */
export default function BlogReactions({ postId }: { postId: string }) {
  const [counts, setCounts] = useState<Record<ReactionType, number>>({
    clap: 0,
    insight: 0,
    inspire: 0,
  });
  const [reacted, setReacted] = useState<Set<ReactionType>>(new Set());

  useEffect(() => {
    supabase
      .from("platform_blog_post")
      .select("reactions_clap, reactions_insight, reactions_inspire")
      .eq("id", postId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setCounts({
            clap: data.reactions_clap || 0,
            insight: data.reactions_insight || 0,
            inspire: data.reactions_inspire || 0,
          });
        }
      });

    try {
      const raw = localStorage.getItem(LS_KEY(postId));
      if (raw) setReacted(new Set(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
  }, [postId]);

  async function handleClick(type: ReactionType) {
    if (reacted.has(type)) return;
    setCounts((c) => ({ ...c, [type]: c[type] + 1 }));
    setReacted((prev) => {
      const next = new Set(prev);
      next.add(type);
      try {
        localStorage.setItem(LS_KEY(postId), JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
    const { error } = await supabase.rpc("increment_blog_reaction", {
      p_post_id: postId,
      p_reaction: type,
    });
    if (error) {
      console.warn("[reaction] falha ao persistir, mantendo otimista", error);
    }
  }

  return (
    <div className="flex items-center gap-px">
      {REACTIONS.map((r, i) => {
        const did = reacted.has(r.type);
        const { Icon } = r;
        return (
          <button
            key={r.type}
            onClick={() => handleClick(r.type)}
            disabled={did}
            title={did ? "Você já reagiu" : r.label}
            className={`group inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
              i === 0 ? "rounded-l-md" : ""
            } ${i === REACTIONS.length - 1 ? "rounded-r-md" : ""} ${
              did
                ? "text-mint bg-mint/[0.06] cursor-default"
                : "text-slate hover:text-mint hover:bg-mint/[0.04]"
            }`}
          >
            <Icon filled={did} />
            <span>{r.label}</span>
            {counts[r.type] > 0 && (
              <span className="text-2xs tabular-nums text-slate/60 ml-0.5">
                {counts[r.type]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
