import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";

/** Instalação do app só faz sentido em celular/tablet (nunca no computador). */
function isMobileOrTablet(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/Android|iPhone|iPad|iPod/i.test(ua)) return true;
  // iPad no iPadOS 13+ se identifica como Mac — detecta por toque.
  return /Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1;
}

export default function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Só na plataforma do aluno (escolafiveone.com), em celular/tablet, e fora
    // do /plataforma (o dashboard tem o seu próprio banner). Sem isto, o banner
    // vazava para o site institucional e o domínio da rede.
    const host = window.location.hostname;
    const isPlatform = host === "escolafiveone.com" || host === "localhost";
    if (!isPlatform) return;
    if (window.location.pathname.startsWith("/plataforma")) return;
    if (!isMobileOrTablet()) return;

    // Don't show if already dismissed recently
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: "12px 16px",
        background: "rgba(10, 25, 47, 0.97)",
        borderTop: "1px solid rgba(100, 255, 218, 0.25)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* App icon */}
      <img
        src="/web-app-manifest-192x192.png"
        alt="Five One"
        style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }}
      />

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#e6f1ff" }}>
          Instalar Five One
        </p>
        <p style={{ margin: 0, fontSize: "0.78rem", color: "#8892b0", marginTop: 2 }}>
          Acesse offline, como um app nativo
        </p>
      </div>

      {/* Install button */}
      <button
        onClick={handleInstall}
        style={{
          background: "#64ffda",
          color: "#0a192f",
          border: "none",
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: "0.85rem",
          fontWeight: 800,
          cursor: "pointer",
          flexShrink: 0,
          minHeight: 40,
          whiteSpace: "nowrap",
        }}
      >
        Instalar
      </button>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        aria-label="Fechar"
        style={{
          background: "none",
          border: "none",
          color: "#8892b0",
          cursor: "pointer",
          padding: "4px",
          flexShrink: 0,
          lineHeight: 1,
          minWidth: 32,
          minHeight: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}
