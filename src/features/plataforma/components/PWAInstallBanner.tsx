import { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

const logoUrl = '/assets/images/logo-fiveone-white-small.png';

const PhoneIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);
const DownloadIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const ShareIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);
const MenuIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>
);

function Step({ n, icon, children }: { n: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-mint/15 border border-mint/30 flex items-center justify-center text-mint text-xs font-bold flex-shrink-0 mt-0.5">{n}</div>
      <div className="flex items-start gap-2 text-sm text-slate leading-snug">
        <span className="text-mint mt-0.5 flex-shrink-0">{icon}</span>
        <span>{children}</span>
      </div>
    </div>
  );
}

// ── Modal de instruções (iOS ou Android manual) ───────────────────────────────

function ManualInstallModal({ onClose, deviceType }: { onClose: () => void; deviceType: string }) {
  const isIOS = deviceType === 'ios-safari' || deviceType === 'ios-chrome';
  const isIOSChrome = deviceType === 'ios-chrome';

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-navy/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm bg-navy-light border border-mint/20 rounded-3xl p-6 shadow-[0_-8px_40px_rgba(0,0,0,0.5)] animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#07101f] border border-mint/20 flex items-center justify-center flex-shrink-0">
            <img src={logoUrl} alt="Five One" className="h-7 w-auto" />
          </div>
          <div>
            <p className="font-bold text-white text-base leading-tight">Instalar Escola Five One</p>
            <p className="text-xs text-slate mt-0.5">Como adicionar à tela inicial</p>
          </div>
          <button onClick={onClose} className="ml-auto p-1.5 text-slate hover:text-white">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="space-y-3 mb-5">
          {isIOS ? (
            isIOSChrome ? (
              <>
                <Step n={1} icon={<MenuIcon />}>Toque nos <strong className="text-white">3 pontinhos</strong> (...) no canto superior direito</Step>
                <Step n={2} icon={<DownloadIcon />}>Toque em <strong className="text-white">"Adicionar à tela inicial"</strong></Step>
                <Step n={3} icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}>Toque em <strong className="text-white">Adicionar</strong> — pronto! 🎉</Step>
              </>
            ) : (
              <>
                <Step n={1} icon={<ShareIcon />}>Toque no ícone <strong className="text-white">Compartilhar</strong> <span className="text-mint">↑</span> na barra do Safari</Step>
                <Step n={2} icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}>Role e toque em <strong className="text-white">"Adicionar à Tela de Início"</strong></Step>
                <Step n={3} icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}>Toque em <strong className="text-white">Adicionar</strong> — pronto! 🎉</Step>
              </>
            )
          ) : (
            /* Android sem prompt (Chrome Custom Tabs, Samsung Internet, etc.) */
            <>
              <Step n={1} icon={<MenuIcon />}>Toque nos <strong className="text-white">3 pontinhos</strong> ⋮ no canto superior do Chrome</Step>
              <Step n={2} icon={<DownloadIcon />}>Procure a opção <strong className="text-white">"Adicionar à tela inicial"</strong> ou <strong className="text-white">"Instalar app"</strong></Step>
              <Step n={3} icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}>Confirme e o app aparece na sua tela inicial 🎉</Step>
              <div className="mt-3 p-3 bg-amber-400/10 border border-amber-400/20 rounded-xl">
                <p className="text-amber-300 text-xs">💡 <strong>Dica:</strong> Para instalar, você precisa estar no <strong>Google Chrome</strong> (não em browser de app de email). Se abriu pelo Gmail, copie o link e cole no Chrome.</p>
              </div>
            </>
          )}
        </div>

        <button onClick={onClose} className="w-full py-3 text-sm text-slate hover:text-white border border-slate/20 rounded-2xl transition-colors">
          Entendi
        </button>
      </div>
    </div>
  );
}

// ── Banner flutuante ──────────────────────────────────────────────────────────

export function PWAInstallBanner() {
  const { canShowBanner, installState, deviceType, triggerInstall, dismissBanner } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (!canShowBanner) return null;

  const hasNativePrompt = installState === 'available-prompt';

  const handleInstall = async () => {
    if (hasNativePrompt) {
      await triggerInstall();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
        <div className="w-full max-w-md pointer-events-auto animate-fade-in-up">
          <div className="bg-navy-light/95 backdrop-blur-xl border border-mint/20 rounded-2xl p-4 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#07101f] border border-mint/20 flex items-center justify-center flex-shrink-0">
                <img src={logoUrl} alt="Five One" className="h-6 w-auto" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight">Instalar o app</p>
                <p className="text-slate/70 text-xs mt-0.5">
                  {hasNativePrompt ? 'Acesse seus cursos direto da tela inicial' : 'Toque para ver como instalar'}
                </p>
              </div>
              <button
                onClick={handleInstall}
                disabled={installState === 'installing'}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-mint text-navy text-xs font-bold rounded-xl shadow-[0_0_12px_rgba(100,255,218,0.3)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 flex-shrink-0"
              >
                <PhoneIcon />
                {installState === 'installing' ? 'Instalando…' : 'Instalar'}
              </button>
              <button onClick={dismissBanner} className="p-1.5 text-slate/50 hover:text-white transition-colors flex-shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <ManualInstallModal
          onClose={() => { setShowModal(false); dismissBanner(); }}
          deviceType={deviceType}
        />
      )}
    </>
  );
}

// ── Botão no menu do avatar ───────────────────────────────────────────────────

export function PWAInstallMenuItem({ onClose }: { onClose?: () => void }) {
  const { installState, deviceType, triggerInstall, isInstalled } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) return null;
  if (typeof window !== 'undefined' && window.location.hostname !== 'escolafiveone.com') return null;

  const hasNativePrompt = installState === 'available-prompt';

  const handleInstall = async () => {
    onClose?.();
    if (hasNativePrompt) {
      await triggerInstall();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstall}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-mint hover:text-white hover:bg-mint/10 rounded-xl transition-colors"
      >
        <PhoneIcon />
        Instalar aplicativo
        {!hasNativePrompt && <span className="ml-auto text-slate/50 text-xs">Como?</span>}
      </button>

      {showModal && (
        <ManualInstallModal
          onClose={() => setShowModal(false)}
          deviceType={deviceType}
        />
      )}
    </>
  );
}
