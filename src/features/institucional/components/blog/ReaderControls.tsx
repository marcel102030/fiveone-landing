import { useEffect, useState } from "react";

const FONT_KEY = "fiveone_blog_font_scale";
const FOCUS_KEY = "fiveone_blog_focus_mode";

type FontScale = "sm" | "md" | "lg";
const SCALES: Record<FontScale, number> = { sm: 0.9, md: 1, lg: 1.15 };

/**
 * Controles flutuantes: A- A A+ e Modo foco.
 * Aplica a escala global via CSS var --post-font-scale e classe `focus-mode` no body.
 */
export default function ReaderControls() {
  const [scale, setScale] = useState<FontScale>("md");
  const [focus, setFocus] = useState(false);

  // Persist
  useEffect(() => {
    try {
      const sv = localStorage.getItem(FONT_KEY) as FontScale | null;
      if (sv && SCALES[sv]) setScale(sv);
      const fv = localStorage.getItem(FOCUS_KEY);
      if (fv === "1") setFocus(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--post-font-scale",
      String(SCALES[scale]),
    );
    try { localStorage.setItem(FONT_KEY, scale); } catch {}
  }, [scale]);

  useEffect(() => {
    document.body.classList.toggle("blog-focus-mode", focus);
    try { localStorage.setItem(FOCUS_KEY, focus ? "1" : "0"); } catch {}
    return () => {
      document.body.classList.remove("blog-focus-mode");
    };
  }, [focus]);

  return (
    <div className="fixed right-4 bottom-24 lg:bottom-8 z-40 flex flex-col gap-2 items-end">
      {/* Modo foco */}
      <button
        onClick={() => setFocus((v) => !v)}
        title={focus ? "Sair do modo foco" : "Modo foco — esconde navbar e footer"}
        className={`flex items-center justify-center w-11 h-11 rounded-full border backdrop-blur-md transition shadow-card ${
          focus
            ? "bg-mint text-navy border-mint"
            : "bg-navy-light/80 text-slate-light border-slate/20 hover:border-mint hover:text-mint"
        }`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="3" />
          <path d="M21 12c-1.889-2.991-5.282-6-9-6s-7.111 3.009-9 6c1.889 2.991 5.282 6 9 6s7.111-3.009 9-6z" />
        </svg>
      </button>

      {/* Font size */}
      <div className="flex flex-col bg-navy-light/80 backdrop-blur-md border border-slate/20 rounded-full overflow-hidden shadow-card">
        <button
          onClick={() => setScale("sm")}
          title="Diminuir texto"
          className={`px-3 py-2 text-xs transition ${
            scale === "sm" ? "text-mint bg-mint/10" : "text-slate-light hover:text-mint"
          }`}
        >
          A-
        </button>
        <button
          onClick={() => setScale("md")}
          title="Texto padrão"
          className={`px-3 py-2 text-sm transition ${
            scale === "md" ? "text-mint bg-mint/10" : "text-slate-light hover:text-mint"
          }`}
        >
          A
        </button>
        <button
          onClick={() => setScale("lg")}
          title="Aumentar texto"
          className={`px-3 py-2 text-base transition ${
            scale === "lg" ? "text-mint bg-mint/10" : "text-slate-light hover:text-mint"
          }`}
        >
          A+
        </button>
      </div>
    </div>
  );
}
