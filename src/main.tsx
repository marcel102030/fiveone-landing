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
// Registra SOMENTE em escolafiveone.com E apenas em rotas da plataforma.
// Na página de login e no site público, o SW não é registrado — isso garante
// que o Chrome não exiba o banner de instalação antes do login.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const host = window.location.hostname;
    const path = window.location.pathname;
    const isEscolaFiveOne = host === 'escolafiveone.com' || host === 'localhost';
    const isPlatformPage =
      path.startsWith('/plataforma') ||
      path.startsWith('/perfil') ||
      path.startsWith('/meu-progresso') ||
      path.startsWith('/favoritos') ||
      path.startsWith('/certificados') ||
      path.startsWith('/curso/');

    if (isEscolaFiveOne && isPlatformPage) {
      // Usuário está logado na plataforma → registrar SW e ativar PWA
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          setInterval(() => reg.update(), 60 * 60 * 1000);
        })
        .catch((err) => console.warn('[SW] Falha ao registrar:', err));
    } else {
      // Fora da plataforma → desregistrar SW para não mostrar banner de instalação
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      });
    }
  });
}
