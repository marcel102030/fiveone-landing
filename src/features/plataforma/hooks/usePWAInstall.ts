import { useEffect, useState } from 'react';

type InstallState = 'not-supported' | 'available' | 'installing' | 'installed' | 'dismissed';
type DeviceType = 'android' | 'ios-safari' | 'ios-chrome' | 'desktop' | 'unknown';

interface PWAInstallResult {
  installState: InstallState;
  deviceType: DeviceType;
  isInstalled: boolean;
  isEscolaFiveOne: boolean;
  canShowBanner: boolean;
  triggerInstall: () => Promise<void>;
  dismissBanner: () => void;
}

const DISMISS_KEY = 'pwa_install_dismissed_at';
const DISMISS_DAYS = 7;

function detectDevice(): DeviceType {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  if (isIOS) {
    return /CriOS/.test(ua) ? 'ios-chrome' : 'ios-safari';
  }
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
    const days = (Date.now() - parseInt(stored, 10)) / (1000 * 60 * 60 * 24);
    return days < DISMISS_DAYS;
  } catch { return false; }
}

export function usePWAInstall(): PWAInstallResult {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installState, setInstallState] = useState<InstallState>('not-supported');

  const deviceType = detectDevice();
  const isInstalled = isAlreadyInstalled();
  const isEscolaFiveOne =
    typeof window !== 'undefined' && window.location.hostname === 'escolafiveone.com';

  useEffect(() => {
    if (isInstalled) { setInstallState('installed'); return; }
    if (wasDismissedRecently()) { setInstallState('dismissed'); return; }

    // iOS não tem beforeinstallprompt — instrução manual
    if (deviceType === 'ios-safari' || deviceType === 'ios-chrome') {
      setInstallState('available');
      return;
    }

    // Lê o prompt capturado globalmente no index.html (antes do React carregar)
    // Isso garante que o banner nativo do browser NÃO apareceu
    const checkPrompt = () => {
      const globalPrompt = (window as any).__pwaPrompt;
      if (globalPrompt) {
        setDeferredPrompt(globalPrompt);
        setInstallState('available');
      }
    };

    checkPrompt();

    // Também ouve novos eventos (caso a página recarregue)
    const handler = (e: Event) => {
      e.preventDefault();
      (window as any).__pwaPrompt = e;
      setDeferredPrompt(e);
      setInstallState('available');
    };
    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setInstallState('installed');
      setDeferredPrompt(null);
      (window as any).__pwaPrompt = null;
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [deviceType, isInstalled]);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    setInstallState('installing');
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setInstallState(outcome === 'accepted' ? 'installed' : 'available');
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
    installState === 'available' &&
    !wasDismissedRecently();

  return { installState, deviceType, isInstalled, isEscolaFiveOne, canShowBanner, triggerInstall, dismissBanner };
}
