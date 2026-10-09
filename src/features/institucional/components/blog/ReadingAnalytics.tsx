import { useEffect } from "react";

// Mede a leitura de um post (tempo na página, rolagem máxima, origem, device)
// e envia uma vez, quando a pessoa sai, via navigator.sendBeacon. Sem UI, sem
// dados pessoais. Falha em silêncio — nunca atrapalha a leitura.

function detectSource(): string {
  try {
    const utm = (new URLSearchParams(window.location.search).get("utm_source") || "").toLowerCase();
    const ref = (document.referrer || "").toLowerCase();
    const hay = `${utm} ${ref}`;
    if (/instagram|\big\b/.test(hay)) return "instagram";
    if (/whatsapp|wa\.me/.test(hay)) return "whatsapp";
    if (/google/.test(hay)) return "google";
    if (/facebook|fb\.com/.test(hay)) return "facebook";
    // Sem referrer, ou veio de outra página do próprio site → direto.
    if (!ref) return "direct";
    try {
      if (new URL(document.referrer).host === window.location.host) return "direct";
    } catch { /* ignore */ }
    return "other";
  } catch {
    return "other";
  }
}

function detectDevice(): string {
  const w = window.innerWidth;
  return w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop";
}

export default function ReadingAnalytics({ postId }: { postId: string }) {
  useEffect(() => {
    if (!postId) return;

    const start = Date.now();
    let maxScroll = 0;
    let sent = false;

    const source = detectSource();
    const deviceType = detectDevice();
    const sessionId =
      typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2);

    const measureScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const pct = scrollable <= 0 ? 100 : Math.round((window.scrollY / scrollable) * 100);
      if (pct > maxScroll) maxScroll = Math.min(100, Math.max(0, pct));
    };

    const send = () => {
      if (sent) return;
      const durationSeconds = Math.round((Date.now() - start) / 1000);
      // Ignora aberturas instantâneas (ruído) — conta leitura a partir de 2s.
      if (durationSeconds < 2) return;
      sent = true;
      measureScroll();
      const payload = {
        postId,
        sessionId,
        durationSeconds,
        maxScrollPct: maxScroll,
        reachedEnd: maxScroll >= 90,
        source,
        deviceType,
      };
      try {
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        if (navigator.sendBeacon && navigator.sendBeacon("/api/blog-track", blob)) return;
        void fetch("/api/blog-track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        });
      } catch {
        /* silencioso */
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") send();
    };

    window.addEventListener("scroll", measureScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", send);

    return () => {
      window.removeEventListener("scroll", measureScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", send);
      send(); // troca de post (SPA) também registra
    };
  }, [postId]);

  return null;
}
