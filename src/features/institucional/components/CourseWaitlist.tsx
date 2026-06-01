import { FormEvent, useEffect, useState } from "react";
import { APOLOGETICA_LAUNCH_DATE } from "../data/courses";

type State = "idle" | "loading" | "success" | "error";

function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, over: true };
    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { days, hours, minutes, seconds, over: false };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return t;
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl sm:text-5xl font-extrabold text-mint tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-2xs text-slate uppercase tracking-wider mt-1">{label}</span>
    </div>
  );
}

/**
 * Bloco de pré-lançamento: contador regressivo + formulário de lista de espera.
 * Substitui o bloco de preço/CTA enquanto APOLOGETICA_LAUNCHED = false.
 */
export default function CourseWaitlist({ compact = false }: { compact?: boolean }) {
  const { days, hours, minutes, seconds, over } = useCountdown(APOLOGETICA_LAUNCH_DATE);
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  const launchStr = APOLOGETICA_LAUNCH_DATE.toLocaleDateString("pt-BR", {
    day: "numeric", month: "long", year: "numeric",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/newsletter-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined, source: "waitlist_apologetica" }),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (data.ok) setState("success");
      else { setError(data.error || "Erro ao cadastrar."); setState("error"); }
    } catch {
      setError("Erro de conexão. Tente novamente."); setState("error");
    }
  }

  return (
    <div className={`rounded-2xl border border-mint/25 bg-navy-light/60 ${compact ? "p-5" : "p-6 sm:p-7"}`}>
      {/* Lançamento em */}
      <p className="text-2xs text-slate uppercase tracking-widest mb-2">
        {over ? "Curso disponível!" : `Lançamento em ${launchStr}`}
      </p>

      {/* Contador */}
      {!over && (
        <div className="flex items-end gap-4 sm:gap-6 mb-5">
          <Digit value={days}    label="dias" />
          <span className="text-3xl text-mint/40 font-light mb-1">:</span>
          <Digit value={hours}   label="horas" />
          <span className="text-3xl text-mint/40 font-light mb-1">:</span>
          <Digit value={minutes} label="min" />
          <span className="text-3xl text-mint/40 font-light mb-1">:</span>
          <Digit value={seconds} label="seg" />
        </div>
      )}

      {/* Preço visível */}
      <div className="mb-5">
        <p className="text-2xs text-slate uppercase tracking-wider">Valor do curso</p>
        <p className="text-3xl font-extrabold text-mint tabular-nums">R$ 59,90</p>
        <p className="text-2xs text-slate mt-0.5">Pagamento único · acesso por 1 ano · certificado</p>
      </div>

      {/* Formulário de lista de espera */}
      {state === "success" ? (
        <div className="rounded-xl bg-mint/10 border border-mint/30 px-4 py-3 flex items-start gap-3">
          <span className="text-xl">🎉</span>
          <div>
            <p className="text-sm font-semibold text-slate-white">Você está na lista!</p>
            <p className="text-xs text-slate mt-0.5">
              Avisaremos você assim que o curso abrir. Fique de olho no e-mail.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <p className="text-sm font-semibold text-slate-white mb-3">
            Entre na lista de espera — seja avisado no lançamento
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome (opcional)"
            className="w-full px-3.5 py-2.5 rounded-xl bg-navy border border-slate/20 text-sm text-slate-white placeholder:text-slate/50 focus:outline-none focus:border-mint/50 transition"
          />
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-navy border border-slate/20 text-sm text-slate-white placeholder:text-slate/50 focus:outline-none focus:border-mint/50 transition"
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className="shrink-0 px-4 py-2.5 bg-mint text-navy font-semibold text-sm rounded-xl shadow-mint hover:shadow-mint-strong transition disabled:opacity-60"
            >
              {state === "loading" ? "…" : "Entrar"}
            </button>
          </div>
          {state === "error" && <p className="text-xs text-red-300">{error}</p>}
        </form>
      )}
    </div>
  );
}
