import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const rootElement = document.getElementById("root");
const faviconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
const appleTouchLink = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
const redeIgrejasFavicon = "/rede-igrejas-favicon.jpeg";

const updateFavicon = () => {
  const isRedeIgrejas = window.location.pathname.startsWith("/rede-igrejas");

  if (isRedeIgrejas) {
    if (faviconLink) {
      faviconLink.dataset.originalHref = faviconLink.dataset.originalHref || faviconLink.href;
      faviconLink.href = redeIgrejasFavicon;
    }
    if (appleTouchLink) {
      appleTouchLink.dataset.originalHref = appleTouchLink.dataset.originalHref || appleTouchLink.href;
      appleTouchLink.href = redeIgrejasFavicon;
    }
  } else {
    if (faviconLink?.dataset.originalHref) {
      faviconLink.href = faviconLink.dataset.originalHref;
    }
    if (appleTouchLink?.dataset.originalHref) {
      appleTouchLink.href = appleTouchLink.dataset.originalHref;
    }
  }
};

updateFavicon();
window.addEventListener("popstate", updateFavicon);

// Como pushState/replaceState não disparam evento nativo, monitora-os para
// atualizar o favicon em navegações internas do React Router.
const originalPushState = window.history.pushState.bind(window.history);
const originalReplaceState = window.history.replaceState.bind(window.history);
window.history.pushState = (...args) => {
  const result = originalPushState(...args);
  updateFavicon();
  return result;
};
window.history.replaceState = (...args) => {
  const result = originalReplaceState(...args);
  updateFavicon();
  return result;
};

createRoot(rootElement as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// ── Registro do Service Worker (PWA) ─────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // Verifica atualização a cada 60 minutos
        setInterval(() => reg.update(), 60 * 60 * 1000);
      })
      .catch((err) => console.warn('[SW] Falha ao registrar:', err));
  });
}
