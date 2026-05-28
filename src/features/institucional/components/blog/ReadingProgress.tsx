import { useEffect, useState } from "react";

/**
 * Barra de progresso de leitura fixa no topo.
 * Calcula a % baseada na altura do elemento `targetSelector` (default: article).
 */
export default function ReadingProgress({
  targetSelector = "article",
}: {
  targetSelector?: string;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const target = document.querySelector(targetSelector) as HTMLElement | null;
    if (!target) return;

    function calc() {
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const totalHeight = target.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const pct = Math.min(100, Math.max(0, (scrolled / totalHeight) * 100));
      setProgress(pct);
    }

    calc();
    window.addEventListener("scroll", calc, { passive: true });
    window.addEventListener("resize", calc);
    return () => {
      window.removeEventListener("scroll", calc);
      window.removeEventListener("resize", calc);
    };
  }, [targetSelector]);

  return (
    <div
      aria-hidden
      className="fixed top-20 left-0 right-0 z-40 h-0.5 bg-transparent pointer-events-none"
    >
      <div
        className="h-full bg-gradient-to-r from-mint via-mint to-mint/50 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%`, boxShadow: "0 0 12px rgba(100,255,218,0.6)" }}
      />
    </div>
  );
}
