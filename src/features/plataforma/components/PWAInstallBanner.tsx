/**
 * PWAInstallBanner — componente de instalação do PWA
 * Só renderiza dentro de plataforma.tsx (usuário logado + escolafiveone.com)
 */
import { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import type { DeviceOS } from '../hooks/usePWAInstall';

const LOGO = '/assets/images/logo-fiveone-white-small.png';

// ── Ícones simples ────────────────────────────────────────────────────────────
const Icon = {
  Phone: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  ),
  Share: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  ),
  Menu: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

// ── Passo numerado ────────────────────────────────────────────────────────────
function Step({ n, icon, children }: { n: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-mint/15 border border-mint/30 flex items-center justify-center text-mint text-xs font-bold flex-shrink-0 mt-0.5">
        {n}
      </div>
      <div className="flex items-start gap-2 text-sm text-slate leading-snug">
        <span className="text-mint mt-0.5 flex-shrink-0">{icon}</span>
        <span>{children}</span>
      </div>
    </div>
  );
}

// ── Modal de instruções manuais ───────────────────────────────────────────────
function InstallModal({ os, onClose }: { os: DeviceOS; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-navy/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-navy-light border border-mint/20 rounded-3xl p-6 shadow-[0_-8px_40px_rgba(0,0,0,0.5)] animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#07101f] border border-mint/20 flex items-center justify-center flex-shrink-0">
            <img src={LOGO} alt="Five One" className="h-7 w-auto" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-white text-base leading-tight">Instalar Escola Five One</p>
            <p className="text-xs text-slate mt-0.5">Adicionar à tela inicial</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate hover:text-white transition-colors">
            <Icon.Close />
          </button>
        </div>

        {/* Passos por dispositivo */}
        <div className="space-y-3 mb-5">
          {os === 'ios-safari' && (
            <>
              <Step n={1} icon={<Icon.Share />}>
                Toque no ícone <strong className="text-white">Compartilhar</strong>{' '}
                <span className="text-mint font-bold">↑</span> na barra inferior do Safari
              </Step>
              <Step n={2} icon={<Icon.Download />}>
                Role a lista e toque em{' '}
                <strong className="text-white">"Adicionar à Tela de Início"</strong>
              </Step>
              <Step n={3} icon={<Icon.Check />}>
                Toque em <strong className="text-white">Adicionar</strong> — pronto! 🎉
              </Step>
            </>
          )}

          {os === 'ios-chrome' && (
            <>
              <Step n={1} icon={<Icon.Menu />}>
                Toque nos <strong className="text-white">3 pontinhos</strong> (...) no canto superior direito
              </Step>
              <Step n={2} icon={<Icon.Download />}>
                Toque em <strong className="text-white">"Adicionar à Tela de Início"</strong>
              </Step>
              <Step n={3} icon={<Icon.Check />}>
                Confirme tocando em <strong className="text-white">Adicionar</strong> 🎉
              </Step>
            </>
          )}

          {(os === 'android' || os === 'desktop') && (
            <>
              <Step n={1} icon={<Icon.Menu />}>
                Toque nos <strong className="text-white">3 pontos</strong> ⋮ no canto superior direito do Chrome
              </Step>
              <Step n={2} icon={<Icon.Download />}>
                Toque em <strong className="text-white">"Instalar app"</strong> ou{' '}
                <strong className="text-white">"Adicionar à tela inicial"</strong>
              </Step>
              <Step n={3} icon={<Icon.Check />}>
                Confirme — o app aparece na sua tela inicial 🎉
              </Step>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 text-sm text-slate hover:text-white border border-slate/20 rounded-2xl transition-colors"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}

// ── Banner flutuante (na base da tela da plataforma) ─────────────────────────
export function PWAInstallBanner() {
  const { canShow, state, os, hasPrompt, install, dismiss } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (!canShow) return null;

  const handleInstall = async () => {
    if (hasPrompt) {
      // Android/Desktop com prompt nativo → instala diretamente
      await install();
    } else {
      // iOS ou Android sem prompt → mostra instrução manual
      setShowModal(true);
    }
  };

  return (
    <>
      {/* Banner */}
      <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
        <div className="w-full max-w-md pointer-events-auto animate-fade-in-up">
          <div className="bg-navy-light/95 backdrop-blur-xl border border-mint/20 rounded-2xl p-4 shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(100,255,218,0.06)]">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="w-11 h-11 rounded-xl bg-[#07101f] border border-mint/20 flex items-center justify-center flex-shrink-0">
                <img src={LOGO} alt="Five One" className="h-6 w-auto" />
              </div>

              {/* Texto */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight">Instalar o app</p>
                <p className="text-slate/70 text-xs mt-0.5 leading-snug">
                  Acesse seus cursos direto da tela inicial
                </p>
              </div>

              {/* Botão instalar */}
              <button
                onClick={handleInstall}
                disabled={state === 'installing'}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-mint text-navy text-xs font-bold rounded-xl shadow-[0_0_12px_rgba(100,255,218,0.3)] hover:shadow-[0_0_20px_rgba(100,255,218,0.5)] hover:scale-[1.04] active:scale-[0.97] transition-all duration-200 flex-shrink-0 whitespace-nowrap"
              >
                <Icon.Phone />
                {state === 'installing' ? 'Instalando…' : 'Instalar'}
              </button>

              {/* Fechar */}
              <button
                onClick={dismiss}
                className="p-1.5 text-slate/40 hover:text-white transition-colors flex-shrink-0"
                aria-label="Fechar"
              >
                <Icon.Close />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de instruções manuais */}
      {showModal && (
        <InstallModal
          os={os}
          onClose={() => { setShowModal(false); dismiss(); }}
        />
      )}
    </>
  );
}

// ── Item no menu do avatar ────────────────────────────────────────────────────
export function PWAInstallMenuItem({ onClose }: { onClose?: () => void }) {
  const { state, os, hasPrompt, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // Só aparece em escolafiveone.com
  if (typeof window !== 'undefined' && window.location.hostname !== 'escolafiveone.com') return null;
  // Não aparece se já instalado
  if (state === 'installed') return null;

  const handleClick = async () => {
    onClose?.();
    if (hasPrompt) {
      await install();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-mint hover:text-white hover:bg-mint/10 rounded-xl transition-colors"
      >
        <Icon.Phone />
        Instalar aplicativo
      </button>

      {showModal && (
        <InstallModal
          os={os}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
