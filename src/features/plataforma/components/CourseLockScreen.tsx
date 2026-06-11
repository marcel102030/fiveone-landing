import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/HM8rzV4WIK6CAqcxBwCbUn';

function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, over: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      over: false,
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return t;
}

function Cell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[58px] sm:min-w-[68px] bg-navy-light rounded-2xl py-3 px-2 border border-mint/15">
      <span className="text-3xl sm:text-4xl font-extrabold text-mint tabular-nums leading-none">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[11px] text-slate uppercase tracking-wide mt-1.5">{label}</span>
    </div>
  );
}

/**
 * Tela de "curso em pré-venda — abre no lançamento".
 * Renderizada no lugar do conteúdo enquanto a data não chega.
 * (O Header é renderizado por quem chama — aqui só o corpo.)
 */
export default function CourseLockScreen({
  courseName,
  launchDate,
}: {
  courseName: string;
  launchDate: Date;
}) {
  const navigate = useNavigate();
  const { days, hours, minutes, seconds } = useCountdown(launchDate);
  const dateLabel = launchDate.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-navy pt-6 pb-16 px-4 overflow-x-hidden">
      <div className="max-w-2xl mx-auto w-full">
        <button
          onClick={() => navigate('/plataforma')}
          className="flex items-center gap-1.5 text-sm text-slate hover:text-mint transition-colors mb-6"
        >
          ← Voltar aos cursos
        </button>

        <div className="bg-navy-light border border-mint/20 rounded-3xl p-7 sm:p-10 text-center shadow-mint/10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-mint/10 border border-mint/30 mb-6">
            <svg className="w-8 h-8 text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-semibold uppercase tracking-wider mb-4">
            Pré-venda garantida
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-white tracking-tight">
            Sua vaga em <span className="text-mint">{courseName}</span> está garantida!
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate leading-relaxed max-w-md mx-auto">
            As aulas serão liberadas no lançamento, em{' '}
            <strong className="text-slate-light">{dateLabel}</strong>. Assim que abrir,
            seu acesso aqui é automático — você não precisa fazer nada.
          </p>

          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-7">
            <Cell value={days} label="dias" />
            <Cell value={hours} label="h" />
            <Cell value={minutes} label="min" />
            <Cell value={seconds} label="seg" />
          </div>

          <div className="mt-8 pt-6 border-t border-slate/10">
            <p className="text-sm text-slate mb-3">
              Enquanto isso, entre no grupo e acompanhe as novidades do lançamento:
            </p>
            <a
              href={WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-mint text-navy font-semibold rounded-xl shadow-mint hover:shadow-mint-strong hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Entrar no grupo do WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
