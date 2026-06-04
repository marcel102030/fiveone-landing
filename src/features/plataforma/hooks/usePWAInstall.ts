/**
 * usePWAInstall — lógica limpa de instalação do PWA
 *
 * Estados:
 *  'checking'   → ainda aguardando beforeinstallprompt
 *  'available'  → pronto para instalar (nativo ou manual)
 *  'installing' → dialog nativo aberto
 *  'installed'  → já instalado
 *  'dismissed'  → usuário fechou por 7 dias
 */
import { useEffect, useState } from 'react';

export type PWAState  = 'checking' | 'available' | 'installing' | 'installed' | 'dismissed';
export type DeviceOS  = 'ios-safari' | 'ios-chrome' | 'android' | 'desktop';

function detectOS(): DeviceOS {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  if (isIOS) return /CriOS/.test(ua) ? 'ios-chrome' : 'ios-safari';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

function dismissed(): boolean {
  try {
    const t = localStorage.getItem('pwa_banner_dismissed');
    return !!t && (Date.now() - +t) / 86_400_000 < 7;
  } catch { return false; }
}

export interface PWAInstall {
  state:          PWAState;
  os:             DeviceOS;
  hasPrompt:      boolean;   // true = prompt nativo disponível (Android/Desktop)
  canShow:        boolean;   // true = mostrar banner
  install:        () => Promise<void>;
  dismiss:        () => void;
}

export function usePWAInstall(): PWAInstall {
  const [prompt, setPrompt] = useState<any>(null);
  const [state,  setState]  = useState<PWAState>('checking');

  const os         = detectOS();
  const standalone = isStandalone();
  const isSchool   = typeof window !== 'undefined' &&
    (window.location.hostname === 'escolafiveone.com' ||
     window.location.hostname === 'localhost');

  useEffect(() => {
    // Já instalado como app
    if (standalone) { setState('installed'); return; }
    // Usuário dispensou recentemente
    if (dismissed()) { setState('dismissed'); return; }

    // ── iOS: sem beforeinstallprompt — instrução manual imediata ─────────
    if (os === 'ios-safari' || os === 'ios-chrome') {
      setState('available');
      return;
    }

    // ── Android / Desktop: espera o evento nativo ────────────────────────
    // 1. Verifica se o index.html já capturou o prompt antes do React carregar
    const cached = (window as any).__pwaPrompt;
    if (cached) {
      setPrompt(cached);
      setState('available');
      return;
    }

    // 2. Escuta o evento (pode chegar depois do mount)
    const onPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__pwaPrompt = e;
      setPrompt(e);
      setState('available');
    };
    const onInstalled = () => {
      setState('installed');
      setPrompt(null);
      (window as any).__pwaPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    // Nota: NÃO há fallback de timer para Android.
    // Se o prompt não chegar, o usuário usa o menu do Chrome (3 pontos > Instalar).
    // Mostrar modal de instruções genéricas sem o prompt causava confusão.

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [os, standalone]);

  const install = async () => {
    if (!prompt) return;
    setState('installing');
    try {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      setState(outcome === 'accepted' ? 'installed' : 'available');
    } catch {
      setState('available');
    }
    setPrompt(null);
    (window as any).__pwaPrompt = null;
  };

  const dismiss = () => {
    try { localStorage.setItem('pwa_banner_dismissed', String(Date.now())); } catch {}
    setState('dismissed');
  };

  const canShow =
    isSchool &&
    !standalone &&
    state === 'available' &&
    !dismissed();

  return {
    state,
    os,
    hasPrompt: !!prompt,
    canShow,
    install,
    dismiss,
  };
}
