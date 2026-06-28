import { FaWhatsapp } from "react-icons/fa";

// Grupo do WhatsApp do "Para Ler" — é também um Clube de Leitura.
// Link centralizado aqui (usado no banner de fim de leitura e na página /para-ler).
export const PARA_LER_WHATSAPP = "https://chat.whatsapp.com/HsKc228MZtB4QN5bD0eDvl";

/**
 * Bloco de destaque do Clube de Leitura no WhatsApp.
 * Usado na página /para-ler (topo e fim).
 */
export default function ReadingClubCTA({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-[#25D366]/30 bg-gradient-to-br from-[#0c2a1e] via-navy-light to-navy p-6 sm:p-8 ${className}`}
    >
      {/* Glow verde */}
      <div className="pointer-events-none absolute -top-12 -right-10 w-52 h-52 bg-[#25D366]/15 blur-[80px] rounded-full" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 text-center sm:text-left">
        <div className="shrink-0 mx-auto sm:mx-0 w-14 h-14 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]">
          <FaWhatsapp className="w-7 h-7" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-2xs text-[#25D366] font-bold uppercase tracking-wider">
            Clube de Leitura · WhatsApp
          </p>
          <h3 className="mt-1 text-xl sm:text-2xl font-bold text-slate-white tracking-tight">
            Leia junto com a gente
          </h3>
          <p className="mt-1.5 text-sm text-slate leading-relaxed max-w-xl mx-auto sm:mx-0">
            Mais do que receber as leituras: um grupo para discutir os textos,
            partilhar reflexões e crescer na fé em comunidade.
          </p>
        </div>

        <a
          href={PARA_LER_WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] text-[#052e16] font-bold hover:bg-[#1ebe5a] hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
        >
          <FaWhatsapp className="w-5 h-5" />
          Entrar no Clube
        </a>
      </div>
    </div>
  );
}
