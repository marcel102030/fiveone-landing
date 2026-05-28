import { useEffect, useState } from "react";
import { FaInstagram } from "react-icons/fa";
import { buildShareUrl } from "./blogHelpers";
import {
  buildInstagramCaption,
  generateInstagramCard,
  type CardFormat,
  type InstagramCardPost,
} from "./instagramCard";

type Post = InstagramCardPost & { slug: string; updated_at?: string | null };

/**
 * Botão "Gerar imagem pro Instagram" + modal com preview, download da arte
 * 1080×1350 (feed retrato), legenda pronta e o link versionado do post.
 */
export default function InstagramShareButton({
  post,
  variant = "full",
}: {
  post: Post;
  variant?: "full" | "compact";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Gerar imagem pronta pro Instagram"
        className={
          variant === "compact"
            ? "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate/20 hover:border-mint hover:text-mint transition"
            : "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate/20 text-slate-light text-xs hover:border-mint hover:text-mint transition"
        }
      >
        <FaInstagram className="w-4 h-4" />
        {variant === "compact" ? "Instagram" : "Imagem pro Instagram"}
      </button>
      {open && <InstagramShareModal post={post} onClose={() => setOpen(false)} />}
    </>
  );
}

function InstagramShareModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const [format, setFormat] = useState<CardFormat>("feed");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState<"caption" | "link" | null>(null);

  const shareUrl = buildShareUrl(post.slug, post.updated_at);
  const caption = buildInstagramCaption(post, shareUrl);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(false);
    setDataUrl(null);
    generateInstagramCard(post, format)
      .then((url) => alive && (setDataUrl(url), setLoading(false)))
      .catch(() => alive && (setError(true), setLoading(false)));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format]);

  // Fecha com ESC e trava o scroll do body
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const dims = format === "story" ? "1080×1920" : "1080×1350";

  function download() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `fiveone-${post.slug}-${format}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function copy(text: string, key: "caption" | "link") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-navy/80 backdrop-blur-sm overflow-y-auto p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-3xl my-4 bg-navy-light border border-slate/15 rounded-2xl shadow-card-hover"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate/10">
          <h3 className="text-base font-bold text-slate-white inline-flex items-center gap-2">
            <FaInstagram className="w-5 h-5 text-mint" /> Compartilhar no Instagram
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate hover:text-mint hover:bg-mint/10 transition"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="grid sm:grid-cols-[300px_1fr] gap-5 p-5">
          {/* Preview */}
          <div className="shrink-0">
            {/* Tabs de formato */}
            <div className="flex gap-1 mb-3 p-1 bg-navy rounded-lg border border-slate/15">
              {([
                ["feed", "Feed"],
                ["story", "Story"],
              ] as [CardFormat, string][]).map(([f, label]) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`flex-1 text-xs font-semibold py-2 rounded-md transition ${
                    format === f
                      ? "bg-mint text-navy"
                      : "text-slate-light hover:text-mint"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div
              className="w-full rounded-xl overflow-hidden border border-slate/15 bg-navy flex items-center justify-center"
              style={{ aspectRatio: format === "story" ? "1080 / 1920" : "1080 / 1350" }}
            >
              {loading ? (
                <div className="flex flex-col items-center gap-3 text-slate text-sm">
                  <div className="w-7 h-7 border-2 border-mint border-t-transparent rounded-full animate-spin" />
                  Gerando arte…
                </div>
              ) : error ? (
                <p className="text-xs text-red-300 px-4 text-center">
                  Não foi possível gerar a imagem (a capa do post pode estar
                  bloqueando). Tente novamente.
                </p>
              ) : (
                <img src={dataUrl!} alt="Prévia do post para Instagram" className="w-full h-full object-cover" />
              )}
            </div>
            <button
              onClick={download}
              disabled={!dataUrl}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-mint text-navy font-semibold rounded-xl shadow-mint hover:shadow-mint-strong transition disabled:opacity-50"
            >
              ⬇ Baixar {format === "story" ? "Story" : "Feed"} ({dims})
            </button>
          </div>

          {/* Ações / texto */}
          <div className="min-w-0 space-y-4">
            {/* Legenda */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-2xs uppercase tracking-wider text-slate font-semibold">
                  Legenda pronta
                </label>
                <button
                  onClick={() => copy(caption, "caption")}
                  className="text-2xs px-2.5 py-1 rounded-md border border-slate/20 text-slate-light hover:border-mint hover:text-mint transition"
                >
                  {copied === "caption" ? "✓ Copiado" : "Copiar legenda"}
                </button>
              </div>
              <textarea
                readOnly
                value={caption}
                rows={7}
                className="w-full text-xs leading-relaxed bg-navy border border-slate/15 rounded-lg p-3 text-slate-light resize-none focus:outline-none focus:border-mint/50"
              />
            </div>

            {/* Link versionado */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-2xs uppercase tracking-wider text-slate font-semibold">
                  Link do post (pro story / bio)
                </label>
                <button
                  onClick={() => copy(shareUrl, "link")}
                  className="text-2xs px-2.5 py-1 rounded-md border border-slate/20 text-slate-light hover:border-mint hover:text-mint transition"
                >
                  {copied === "link" ? "✓ Copiado" : "Copiar link"}
                </button>
              </div>
              <p className="text-xs text-mint break-all bg-navy border border-slate/15 rounded-lg p-3">
                {shareUrl}
              </p>
            </div>

            {/* Dica de uso */}
            <div className="text-xs text-slate leading-relaxed bg-mint/5 border border-mint/15 rounded-lg p-3 space-y-1.5">
              <p className="text-slate-light font-semibold">Como postar:</p>
              <p>
                <strong className="text-mint">Feed:</strong> poste a imagem e cole
                a legenda. O Instagram não deixa link clicável no feed — use
                "link na bio".
              </p>
              <p>
                <strong className="text-mint">Story:</strong> poste a imagem e
                adicione o <strong>adesivo de link</strong> com o link acima —
                aí sim fica clicável e leva direto pro post.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
