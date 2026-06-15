// Confirmação de cidade para a Rede de Igrejas nas Casas.
// A rede só atua em Campina Grande - PB hoje. Antes de qualquer contato
// (WhatsApp, formulários), perguntamos se a pessoa é da região; quem não for
// vê a mensagem de expansão e fala no WhatsApp já contextualizado.
//
// Uso por página (sem provider global):
//   const { gate, modal } = useCityGateModal();
//   <a onClick={(e) => { e.preventDefault(); gate(() => window.open(waUrl)); }}>...</a>
//   {modal}  // renderizar uma vez no fim da página
//
// No formulário de cadastro use <CityGateInline onConfirm={...} /> como 1ª tela.

import { useCallback, useState, type ReactNode } from 'react';
import './cityGate.css';

const REDE_WHATSAPP_NUMBER = '5583987181731';

/** Link de WhatsApp já contextualizado para quem é de fora de Campina Grande. */
export function buildOutOfCityWhatsApp(city: string): string {
  const c = city.trim();
  const msg = c
    ? `Olá! Sou de ${c}. Vi que a Rede Five One ainda não tem casa por aqui — gostaria de ser avisado(a) quando vocês chegarem na minha região.`
    : `Olá! Sou de outra cidade. Vi que a Rede Five One ainda não tem casa por aqui — gostaria de ser avisado(a) quando vocês chegarem na minha região.`;
  return `https://wa.me/${REDE_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

/** Aviso sempre visível de onde a rede atua. */
export function RedeLocationNotice({ className = '' }: { className?: string }) {
  return (
    <div className={`citygate-notice ${className}`} role="note">
      <span className="citygate-notice__pin">📍</span>
      <span>
        No momento, a Rede Five One está presente <strong>apenas em Campina Grande - PB</strong>.
        Estamos crescendo — em breve, novas cidades.
      </span>
    </div>
  );
}

/** Corpo da confirmação — usado tanto no modal quanto inline (formulário). */
function CityGateBody({
  onYes,
  onDismiss,
  variant = 'modal',
}: {
  onYes: () => void;
  onDismiss?: () => void;
  variant?: 'modal' | 'inline';
}) {
  const [view, setView] = useState<'ask' | 'out'>('ask');
  const [city, setCity] = useState('');

  if (view === 'ask') {
    return (
      <div className="citygate-body">
        <span className="citygate-badge">📍 Campina Grande - PB</span>
        <h3 className="citygate-title">Você é de Campina Grande - PB e região?</h3>
        <p className="citygate-text">
          No momento, a Rede de Igrejas nas Casas está presente <strong>apenas em
          Campina Grande - PB</strong>. Queremos te direcionar da melhor forma.
        </p>
        <div className="citygate-actions">
          <button type="button" className="citygate-btn citygate-btn--primary" onClick={onYes}>
            Sim, sou de Campina Grande
          </button>
          <button type="button" className="citygate-btn citygate-btn--ghost" onClick={() => setView('out')}>
            Não sou da região
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="citygate-body">
      <span className="citygate-badge">🙏 Em breve na sua cidade</span>
      <h3 className="citygate-title">Ainda não chegamos à sua cidade</h3>
      <p className="citygate-text">
        Hoje a rede está só em Campina Grande - PB, mas temos a intenção de
        expandir, no tempo de Deus. Deixe sua cidade e fale com a gente —
        avisamos quando chegarmos perto de você.
      </p>
      <input
        className="citygate-input"
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Sua cidade (ex: São Paulo - SP)"
      />
      <div className="citygate-actions">
        <a
          className="citygate-btn citygate-btn--whatsapp"
          href={buildOutOfCityWhatsApp(city)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onDismiss?.()}
        >
          Falar no WhatsApp
        </a>
        <button type="button" className="citygate-btn citygate-btn--ghost" onClick={() => setView('ask')}>
          Voltar
        </button>
      </div>
      {variant === 'modal' && onDismiss && (
        <button type="button" className="citygate-close" aria-label="Fechar" onClick={onDismiss}>
          Fechar
        </button>
      )}
    </div>
  );
}

/**
 * Hook para o modal de confirmação de cidade, sem provider global.
 * Retorna `gate(action)` para interceptar um contato e `modal` (JSX) para
 * renderizar uma vez no fim da página.
 */
export function useCityGateModal() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<(() => void) | null>(null);

  const gate = useCallback((action: () => void) => {
    setPending(() => action);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setPending(null);
  }, []);

  const handleYes = useCallback(() => {
    const action = pending;
    close();
    if (action) action();
  }, [pending, close]);

  const modal: ReactNode = open ? (
    <div className="citygate-overlay" role="dialog" aria-modal="true" onClick={close}>
      <div className="citygate-modal" onClick={(e) => e.stopPropagation()}>
        <CityGateBody onYes={handleYes} onDismiss={close} variant="modal" />
      </div>
    </div>
  ) : null;

  return { gate, modal };
}

/** Versão inline para usar como 1ª tela de um formulário (perguntar sempre). */
export function CityGateInline({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="citygate-inline">
      <CityGateBody onYes={onConfirm} variant="inline" />
    </div>
  );
}
