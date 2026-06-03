// Landing page de vendas — sem navbar, sem footer, sem links de saída.
// Projetada para tráfego pago (Instagram Ads, etc.).
// URL: /lp/apologetica

import { useEffect } from "react";
import courseCover from "../assets/images/capa_curso_apologetica.jpg";

const HOTMART_CHECKOUT_URL =
  "https://pay.hotmart.com/SUBSTITUA_PELO_LINK_REAL?checkoutMode=10";

const CheckIcon = () => (
  <svg className="w-5 h-5 text-mint shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const BULLETS = [
  "20 aulas em vídeo — 8h20 de conteúdo real",
  "Do básico ao avançado, sem enrolação",
  "Responda céticos, fortaleça sua própria fé",
  "Certificado ao concluir",
  "Acesso por 1 ano a partir da compra",
  "Assista no celular, tablet ou computador",
];

const OBJECTIONS = [
  {
    q: "Preciso ter conhecimento teológico?",
    a: "Não. O curso foi construído pra qualquer crente — do iniciante ao líder com anos de caminhada.",
  },
  {
    q: "Como funciona o acesso?",
    a: "Após a compra você recebe um e-mail com seus dados de acesso à plataforma Five One. Acessa pelo celular ou computador, no seu ritmo.",
  },
  {
    q: "Por quanto tempo tenho acesso?",
    a: "1 ano a partir da data da compra — tempo mais que suficiente pra concluir as 20 aulas.",
  },
  {
    q: "E se eu não gostar?",
    a: "A Hotmart garante 7 dias de reembolso total, sem perguntas.",
  },
];

export default function LpApologetica() {
  useEffect(() => {
    document.title = "Curso de Apologética | Five One";
    const meta = document.querySelector('meta[name="description"]');
    if (meta)
      meta.setAttribute("content", "Aprenda a defender a fé com solidez bíblica e racional. 20 aulas, do básico ao avançado. Pagamento único, acesso por 1 ano, certificado incluído.");
  }, []);

  return (
    <div className="bg-navy text-slate-light min-h-screen relative overflow-hidden">
      {/* Decorações globais */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-mint/[0.04] blur-[120px] rounded-full" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[350px] bg-blue-500/[0.04] blur-[100px] rounded-full" />
        <div className="absolute top-2/3 right-0 w-[450px] h-[300px] bg-golden/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-mint/[0.03] blur-[100px] rounded-full" />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: 'radial-gradient(circle, #64ffda 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
      {/* ── Header minimalista ─── */}
      <header className="py-5 text-center border-b border-slate/10">
        <span className="text-2xs font-semibold uppercase tracking-widest text-mint">
          Five One — Movimento dos 5 Ministérios
        </span>
      </header>

      {/* ── Hero ─── */}
      <section className="relative pt-14 pb-10 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-mint/[0.06] blur-[120px] rounded-full" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-mint text-navy text-xs font-bold uppercase tracking-wider mb-5">
            Lançamento
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-white tracking-tight leading-[1.1] mb-6">
            Aprenda a defender<br className="hidden sm:block" /> a fé com{" "}
            <span className="text-mint">inteligência</span> e respeito
          </h1>
          <p className="text-lg sm:text-xl text-slate max-w-2xl mx-auto mb-10 leading-relaxed">
            O Curso de Apologética do Five One te equipa para responder dúvidas, conversar
            com céticos e crescer na sua própria fé — sem precisar ser teólogo.
          </p>
          <a
            href={HOTMART_CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-mint text-navy text-lg font-bold rounded-xl shadow-mint hover:shadow-mint-strong hover:scale-[1.02] active:scale-[0.99] transition-all"
          >
            Quero o curso por R$ 59,90 →
          </a>
          <p className="mt-3 text-xs text-slate/70">
            Pagamento único · acesso por 1 ano · certificado incluído · 7 dias de garantia
          </p>
        </div>
      </section>

      {/* ── Capa + bullets ─── */}
      <section className="py-14 lg:py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-mint/10 blur-2xl rounded-3xl" />
            <img
              src={courseCover}
              alt="Curso de Apologética Five One"
              className="relative rounded-2xl shadow-card w-full h-auto"
              loading="eager"
            />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-white mb-6">
              O que você vai aprender
            </h2>
            <ul className="space-y-4">
              {BULLETS.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm sm:text-base text-slate-light">
                  <CheckIcon />
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8 p-5 bg-navy-light/60 border border-mint/20 rounded-2xl">
              <p className="text-2xs text-slate uppercase tracking-wider mb-1">Pagamento único</p>
              <p className="text-4xl font-extrabold text-mint tabular-nums">R$ 59,90</p>
              <p className="text-xs text-slate mt-1">1 ano de acesso · certificado · 7 dias de garantia</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA central ─── */}
      <section className="py-14 text-center bg-navy-light/30">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-slate mb-8">
            Mais de 20 aulas com fundamento bíblico e argumentação racional. Assista no
            seu ritmo, onde quiser.
          </p>
          <a
            href={HOTMART_CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-mint text-navy text-lg font-bold rounded-xl shadow-mint hover:shadow-mint-strong hover:scale-[1.02] active:scale-[0.99] transition-all"
          >
            Garantir meu acesso por R$ 59,90 →
          </a>
          <p className="mt-3 text-xs text-slate/70">
            Você será direcionado ao checkout seguro da Hotmart
          </p>
        </div>
      </section>

      {/* ── FAQ ─── */}
      <section className="py-14 lg:py-16">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-white text-center mb-8">
            Dúvidas frequentes
          </h2>
          <div className="space-y-4">
            {OBJECTIONS.map(({ q, a }) => (
              <div key={q} className="bg-navy-light/60 border border-slate/10 rounded-2xl px-6 py-5">
                <p className="font-semibold text-slate-white mb-2">{q}</p>
                <p className="text-sm text-slate leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ─── */}
      <section className="py-16 text-center">
        <div className="max-w-xl mx-auto px-6">
          <p className="text-slate mb-6 text-base">
            Não é um curso cheio de teoria vazia. É conteúdo que você usa na prática —
            com a família, na célula, nas redes, na sua própria caminhada.
          </p>
          <a
            href={HOTMART_CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-mint text-navy text-lg font-bold rounded-xl shadow-mint hover:shadow-mint-strong hover:scale-[1.02] active:scale-[0.99] transition-all"
          >
            Quero o curso por R$ 59,90 →
          </a>
        </div>
      </section>

      {/* ── Footer minimalista ─── */}
      <footer className="border-t border-slate/10 py-5 text-center">
        <p className="text-2xs text-slate/60">
          © {new Date().getFullYear()} Five One — Todos os direitos reservados ·{" "}
          <a href="/" className="hover:text-mint transition-colors">
            fiveonemovement.com
          </a>
        </p>
      </footer>
    </div>
  );
}
