import { useEffect, useState } from "react";

type Pos = { x: number; y: number };

/**
 * Tooltip flutuante que aparece quando o usuário seleciona um trecho de texto
 * dentro do `targetSelector`. Permite compartilhar a citação.
 */
export default function SelectionShare({
  targetSelector = ".post-content",
  title = "",
}: {
  targetSelector?: string;
  title?: string;
}) {
  const [selectedText, setSelectedText] = useState<string>("");
  const [pos, setPos] = useState<Pos | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const container = document.querySelector(targetSelector);
    if (!container) return;

    function handle() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setPos(null);
        setSelectedText("");
        return;
      }
      const text = sel.toString().trim();
      if (text.length < 12) {
        setPos(null);
        setSelectedText("");
        return;
      }
      // Garante que a seleção é dentro do container
      const range = sel.getRangeAt(0);
      if (!container?.contains(range.commonAncestorContainer)) {
        setPos(null);
        setSelectedText("");
        return;
      }
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setPos({
        x: rect.left + rect.width / 2 + window.scrollX,
        y: rect.top + window.scrollY - 12,
      });
    }

    document.addEventListener("selectionchange", handle);
    return () => document.removeEventListener("selectionchange", handle);
  }, [targetSelector]);

  if (!pos || !selectedText) return null;

  const quote = `"${selectedText.length > 220 ? selectedText.slice(0, 220) + "…" : selectedText}"${title ? `\n\n— ${title}` : ""}\n\n${typeof window !== "undefined" ? window.location.href : ""}`;

  async function copyQuote() {
    try {
      await navigator.clipboard.writeText(quote);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* fallback ignore */
    }
  }

  function shareWhatsapp() {
    const url = `https://wa.me/?text=${encodeURIComponent(quote)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function shareNative() {
    if (navigator.share) {
      navigator
        .share({ title: title || "Trecho do post", text: quote })
        .catch(() => {});
    } else {
      copyQuote();
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Compartilhar trecho"
      className="absolute z-30 -translate-x-1/2 -translate-y-full flex items-center gap-1 bg-navy-light border border-mint/30 rounded-full shadow-mint-strong px-2 py-1.5 backdrop-blur-md"
      style={{ left: pos.x, top: pos.y, animation: "fade-in 0.18s ease-out" }}
    >
      <button
        onClick={copyQuote}
        title="Copiar citação"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-slate-light hover:text-mint hover:bg-mint/10 transition"
      >
        {copied ? "✓ Copiado" : "📋 Copiar"}
      </button>
      <button
        onClick={shareWhatsapp}
        title="Compartilhar no WhatsApp"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-slate-light hover:text-mint hover:bg-mint/10 transition"
      >
        💬 WhatsApp
      </button>
      <button
        onClick={shareNative}
        title="Compartilhar"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-slate-light hover:text-mint hover:bg-mint/10 transition"
      >
        📤
      </button>
    </div>
  );
}
