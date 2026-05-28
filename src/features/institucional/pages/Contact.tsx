import { FormEvent, useEffect, useState } from "react";
import {
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
  FaTiktok,
  FaEnvelope,
} from "react-icons/fa";

type Social = {
  name: string;
  handle: string;
  desc: string;
  href: string;
  cta: string;
  Icon: typeof FaInstagram;
  iconClass: string; // cor de marca do ícone
  featured?: boolean;
};

const socials: Social[] = [
  {
    name: "Instagram",
    handle: "@fiveone.oficial",
    desc: "Reflexões diárias, bastidores e a comunidade do movimento. É por aqui que tudo acontece primeiro.",
    href: "https://www.instagram.com/fiveone.oficial/",
    cta: "Seguir no Instagram",
    Icon: FaInstagram,
    iconClass:
      "bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#962fbf] text-white",
    featured: true,
  },
  {
    name: "WhatsApp",
    handle: "(83) 98900-4764",
    desc: "Fale direto com a nossa equipe — dúvidas, matrículas e parcerias com igrejas.",
    href: "https://wa.me/5583989004764?text=Ol%C3%A1!%20Vim%20pelo%20site%20do%20Five%20One.",
    cta: "Conversar agora",
    Icon: FaWhatsapp,
    iconClass: "bg-[#25D366] text-white",
  },
  {
    name: "YouTube",
    handle: "@Escola_Five_One",
    desc: "Aulas, pregações e conteúdos em vídeo para aprofundar a sua caminhada.",
    href: "https://www.youtube.com/@Escola_Five_One/videos",
    cta: "Inscrever-se",
    Icon: FaYoutube,
    iconClass: "bg-[#FF0000] text-white",
  },
  {
    name: "TikTok",
    handle: "@escola.five.one",
    desc: "Cortes rápidos e conteúdo direto ao ponto para o dia a dia.",
    href: "https://www.tiktok.com/@escola.five.one",
    cta: "Seguir",
    Icon: FaTiktok,
    iconClass: "bg-black text-white border border-white/15",
  },
];

const ArrowIcon = () => (
  <svg
    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden
  >
    <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
  </svg>
);

const Contact = () => {
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = "Contato | Five One";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Conecte-se com o Five One. Siga no Instagram, YouTube e TikTok, fale no WhatsApp ou envie uma mensagem. Estamos por perto.",
      );
    }
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");

    const mailto = `mailto:escolafiveone@gmail.com?subject=Contato%20via%20site%20Five%20One&body=${encodeURIComponent(
      `Nome: ${name}\nE-mail: ${email}\n\nMensagem:\n${message}`,
    )}`;
    window.location.href = mailto;
    setSent(true);
  };

  return (
    <div className="bg-navy text-slate-light min-h-screen">
      {/* ──────────────────────────────── Hero ─── */}
      <section className="relative pt-8 sm:pt-10 pb-10 lg:pb-12 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-mint/[0.06] blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-4">
            Conecte-se com o Five One
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-white tracking-tight leading-[1.1]">
            Vamos caminhar <span className="text-mint">juntos</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate max-w-2xl mx-auto leading-relaxed">
            Acompanhe o movimento nas redes, fale com a gente no WhatsApp ou
            envie uma mensagem. O melhor lugar para começar é o nosso Instagram —
            é lá que a comunidade vive todos os dias.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://www.instagram.com/fiveone.oficial/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-mint text-navy font-semibold rounded-xl shadow-mint hover:shadow-mint-strong hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <FaInstagram className="w-5 h-5" />
              Seguir no Instagram
            </a>
            <a
              href="https://wa.me/5583989004764?text=Ol%C3%A1!%20Vim%20pelo%20site%20do%20Five%20One."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-transparent border border-mint/40 text-mint font-semibold rounded-xl hover:bg-mint/10 hover:border-mint/60 transition-all duration-200"
            >
              <FaWhatsapp className="w-5 h-5" />
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────── Cards de canais ─── */}
      <section className="pb-6 lg:pb-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-4 lg:gap-5">
            {socials.map((s) => {
              const { Icon } = s;
              return (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex flex-col p-6 lg:p-7 rounded-2xl border transition-all duration-200 hover:-translate-y-1 ${
                    s.featured
                      ? "bg-gradient-to-br from-mint/[0.07] to-navy-light border-mint/30 hover:border-mint/50 sm:col-span-2"
                      : "bg-navy-light/60 border-slate/10 hover:border-mint/30 hover:bg-navy-light"
                  }`}
                >
                  {s.featured && (
                    <span className="absolute top-5 right-5 px-2.5 py-1 rounded-full bg-mint text-navy text-2xs font-bold uppercase tracking-wider">
                      Comece por aqui
                    </span>
                  )}

                  <div className="flex items-center gap-4 mb-4">
                    <span
                      className={`inline-flex w-12 h-12 items-center justify-center rounded-xl ${s.iconClass}`}
                    >
                      <Icon className="w-6 h-6" />
                    </span>
                    <div>
                      <h2 className="text-lg lg:text-xl font-bold text-slate-white leading-tight">
                        {s.name}
                      </h2>
                      <p className="text-sm text-slate">{s.handle}</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-light leading-relaxed grow">
                    {s.desc}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-mint">
                    {s.cta}
                    <ArrowIcon />
                  </span>
                </a>
              );
            })}
          </div>

          {/* E-mail — canal secundário */}
          <div className="mt-4 lg:mt-5">
            <a
              href="mailto:escolafiveone@gmail.com"
              className="group flex items-center gap-4 p-5 rounded-2xl bg-navy-light/40 border border-slate/10 hover:border-mint/30 transition-all duration-200"
            >
              <span className="inline-flex w-11 h-11 items-center justify-center rounded-xl bg-mint/10 border border-mint/30 text-mint shrink-0">
                <FaEnvelope className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-2xs uppercase tracking-wider text-slate font-semibold">
                  Prefere e-mail?
                </p>
                <p className="text-sm sm:text-base text-slate-white font-medium truncate">
                  escolafiveone@gmail.com
                </p>
              </div>
              <span className="ml-auto text-mint shrink-0">
                <ArrowIcon />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────── Formulário enxuto ─── */}
      <section className="py-14 lg:py-20 bg-navy-light/30">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-3">
              Envie uma mensagem
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-white tracking-tight">
              Quer falar com calma?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate">
              Escreva pra gente e respondemos em até 1 dia útil.
            </p>
          </div>

          {sent ? (
            <div className="text-center bg-navy-light/60 border border-mint/30 rounded-2xl p-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-mint/10 flex items-center justify-center text-mint text-2xl">
                ✓
              </div>
              <p className="text-slate-white font-medium">
                Abrimos seu aplicativo de e-mail com a mensagem pronta.
              </p>
              <p className="mt-2 text-sm text-slate">
                Se não abriu, escreva direto para{" "}
                <a
                  href="mailto:escolafiveone@gmail.com"
                  className="text-mint hover:underline"
                >
                  escolafiveone@gmail.com
                </a>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-light mb-1.5">
                  Nome
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Seu nome"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-navy border border-slate/20 text-slate-white placeholder:text-slate/50 focus:outline-none focus:border-mint/60 focus:ring-1 focus:ring-mint/30 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-light mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="nome@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-navy border border-slate/20 text-slate-white placeholder:text-slate/50 focus:outline-none focus:border-mint/60 focus:ring-1 focus:ring-mint/30 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-light mb-1.5">
                  Mensagem
                </label>
                <textarea
                  name="message"
                  placeholder="Como podemos ajudar?"
                  rows={5}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-navy border border-slate/20 text-slate-white placeholder:text-slate/50 focus:outline-none focus:border-mint/60 focus:ring-1 focus:ring-mint/30 transition resize-y"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-mint text-navy font-semibold rounded-xl shadow-mint hover:shadow-mint-strong hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
              >
                Enviar mensagem
              </button>
              <p className="text-center text-2xs text-slate/70">
                Ao enviar, você concorda em ser contatado pelos canais
                informados.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default Contact;
