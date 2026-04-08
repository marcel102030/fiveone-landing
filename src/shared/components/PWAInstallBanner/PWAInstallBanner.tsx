import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";

export default function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
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
