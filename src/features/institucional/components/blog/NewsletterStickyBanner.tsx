import { useEffect, useRef, useState } from "react";
import NewsletterForm from "./NewsletterForm";

const LS_DISMISSED = "fiveone_newsletter_dismissed";
const LS_SUBSCRIBED = "fiveone_newsletter_subscribed";

/**
 * Banner newsletter que aparece na tela (slide-up) quando o leitor chega
 * perto do final do artigo. Usa IntersectionObserver no elemento âncora
 * (rodapé do artigo). Dispensável com ✕ e não volta após assinar.
 */
export default function NewsletterStickyBanner({
  triggerSelector = ".article-footer-anchor",
}: {
  triggerSelector?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Não mostra se já dispensou ou já assinou
    if (
      localStorage.getItem(LS_DISMISSED) === "1" ||
      localStorage.getItem(LS_SUBSCRIBED) === "1"
    ) {
      return;
    }

    const anchor = document.querySelector(triggerSelector);
    if (!anchor) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observerRef.current.observe(anchor);
    return () => observerRef.current?.disconnect();
  }, [triggerSelector]);

  function dismiss() {
    setDismissed(true);
    localStorage.setItem(LS_DISMISSED, "1");
  }

  function onSubscribed() {
    setSubscribed(true);
    localStorage.setItem(LS_SUBSCRIBED, "1");
    // fecha o banner após 3 segundos da inscrição
    setTimeout(() => setVisible(false), 3000);
  }

  if (!visible || dismissed) return null;

  return (
    <div
      role="dialog"
      aria-label="Inscrição na newsletter"
      className="fixed bottom-0 inset-x-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6 pointer-events-none"
      style={{ animation: "newsletter-slide-up 0.4s cubic-bezier(.16,1,.3,1) both" }}
    >
      <style>{`
        @keyframes newsletter-slide-up {
          from { transform: translateY(110%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <div className="pointer-events-auto max-w-lg mx-auto bg-navy-light border border-mint/30 rounded-2xl shadow-mint px-5 py-4 relative">
        {/* Fechar */}
        <button
          onClick={dismiss}
          aria-label="Fechar"
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-slate hover:text-mint hover:bg-mint/10 transition text-lg leading-none"
        >
          ✕
        </button>

        {subscribed ? (
          <div className="flex items-center gap-3 pr-8">
            <span className="text-2xl">🙌</span>
            <div>
              <p className="text-sm font-semibold text-slate-white">Inscrição confirmada!</p>
              <p className="text-xs text-slate">Você vai receber os próximos artigos.</p>
            </div>
          </div>
        ) : (
          <div className="pr-8">
            <p className="text-sm font-bold text-slate-white mb-0.5">
              Gostou do artigo? 👋
            </p>
            <p className="text-xs text-slate mb-3">
              Receba os próximos diretamente no seu e-mail — sem spam, só conteúdo que edifica.
            </p>
            <NewsletterForm
              source="blog_sticky"
              compact
              onSuccess={onSubscribed}
            />
          </div>
        )}
      </div>
    </div>
  );
}
