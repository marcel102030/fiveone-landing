import { FormEvent, useState } from "react";

type State = "idle" | "loading" | "success" | "error";

/**
 * Formulário de inscrição na newsletter "Para Ler".
 * Pode ser usado no rodapé de posts, na BlogList e na Home.
 */
export default function NewsletterForm({
  source = "blog",
  compact = false,
  onSuccess,
}: {
  source?: string;
  compact?: boolean;
  /** Chamado depois que a inscrição é confirmada (além de mostrar o estado de sucesso interno). */
  onSuccess?: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/newsletter-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined, source }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setState("success");
        onSuccess?.();
      } else {
        setErrorMsg(data.error || "Não foi possível cadastrar.");
        setState("error");
      }
    } catch {
      setErrorMsg("Erro de conexão. Tente novamente.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className={`rounded-xl bg-mint/10 border border-mint/30 flex items-start gap-3 ${compact ? "px-4 py-3" : "px-5 py-4"}`}>
        <span className="text-mint text-lg shrink-0">✓</span>
        <div>
          <p className="text-sm font-semibold text-slate-white">Inscrição confirmada!</p>
          <p className="text-xs text-slate mt-0.5">
            Você vai receber os próximos artigos por e-mail.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!compact && (
        <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">
          Receba novos artigos por e-mail
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome (opcional)"
          className="px-3.5 py-2.5 rounded-xl bg-navy border border-slate/20 text-sm text-slate-white placeholder:text-slate/50 focus:outline-none focus:border-mint/50 focus:ring-1 focus:ring-mint/20 transition"
        />
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-navy border border-slate/20 text-sm text-slate-white placeholder:text-slate/50 focus:outline-none focus:border-mint/50 focus:ring-1 focus:ring-mint/20 transition"
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className="shrink-0 px-4 py-2.5 bg-mint text-navy text-sm font-semibold rounded-xl hover:shadow-mint-strong transition disabled:opacity-60"
          >
            {state === "loading" ? "Enviando…" : "Inscrever"}
          </button>
        </div>
      </form>
      {state === "error" && (
        <p className="text-xs text-red-300 mt-1.5">{errorMsg}</p>
      )}
    </div>
  );
}
