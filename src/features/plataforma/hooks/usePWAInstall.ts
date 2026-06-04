import { useEffect, useState } from 'react';

export type InstallState = 'checking' | 'available-prompt' | 'available-manual' | 'installing' | 'installed' | 'dismissed';
export type DeviceType   = 'android' | 'ios-safari' | 'ios-chrome' | 'desktop' | 'unknown';

export interface PWAInstallResult {
  installState: InstallState;
  deviceType:   DeviceType;
  isInstalled:  boolean;
  isEscolaFiveOne: boolean;
  canShowBanner:  boolean;
  triggerInstall: () => Promise<void>;
  dismissBanner:  () => void;
}

const DISMISS_KEY  = 'pwa_install_dismissed_at';
const DISMISS_DAYS = 7;

function detectDevice(): DeviceType {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  if (isIOS) return /CriOS/.test(ua) ? 'ios-chrome' : 'ios-safari';
  return /Android/.test(ua) ? 'android' : 'desktop';
}

function isAlreadyInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

function wasDismissedRecently(): boolean {
  try {
    const stored = localStorage.getItem(DISMISS_KEY);
    if (!stored) return false;
    return (Date.now() - parseInt(stored, 10)) / 86_400_000 < DISMISS_DAYS;
  } catch { return false; }
}

export function usePWAInstall(): PWAInstallResult {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installState,   setInstallState]   = useState<InstallState>('checking');

  const deviceType      = detectDevice();
  const isInstalled     = isAlreadyInstalled();
  const isEscolaFiveOne = typeof window !== 'undefined' &&
    (window.location.hostname === 'escolafiveone.com' || window.location.hostname === 'localhost');

  useEffect(() => {
    if (isInstalled)            { setInstallState('installed');  return; }
    if (wasDismissedRecently()) { setInstallState('dismissed');  return; }

    // iOS — sem beforeinstallprompt, sempre mostra instrução manual
    if (deviceType === 'ios-safari' || deviceType === 'ios-chrome') {
      setInstallState('available-manual');
      return;
    }

    // Android / Desktop — tenta capturar o prompt nativo
    const checkGlobal = () => {
      const p = (window as any).__pwaPrompt;
      if (p) { setDeferredPrompt(p); setInstallState('available-prompt'); }
    };
    checkGlobal();

    const handler = (e: Event) => {
      e.preventDefault();
      (window as any).__pwaPrompt = e;
      setDeferredPrompt(e);
      setInstallState('available-prompt');
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setInstallState('installed');
      setDeferredPrompt(null);
    });

    // Fallback: se após 4s o prompt não chegou mas é Android, mostra instrução manual
    // (acontece em Chrome Custom Tabs, Samsung Internet, etc.)
    const fallback = setTimeout(() => {
      setInstallState(prev => {
        if (prev === 'checking') {
          if (deviceType === 'android') return 'available-manual';
          // Desktop: tenta verificar se Chrome tem a opção no menu
          if (deviceType === 'desktop') return 'available-manual';
        }
        return prev;
      });
    }, 4000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(fallback);
    };
  }, [deviceType, isInstalled]);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    setInstallState('installing');
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setInstallState(outcome === 'accepted' ? 'installed' : 'available-prompt');
    setDeferredPrompt(null);
    (window as any).__pwaPrompt = null;
  };

  const dismissBanner = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setInstallState('dismissed');
  };

  const canShowBanner =
    isEscolaFiveOne &&
    !isInstalled &&
    (installState === 'available-prompt' || installState === 'available-manual') &&
    !wasDismissedRecently();

  return { installState, deviceType, isInstalled, isEscolaFiveOne, canShowBanner, triggerInstall, dismissBanner };
}
