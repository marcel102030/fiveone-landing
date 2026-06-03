import { useEffect } from "react";
import TrainingFormats from "../components/TrainingFormats";
import imgLeveOs5 from "../assets/images/LeveOs5ministerios.png";
import apostoloIcon from "../../../assets/images/icons/apostolo.png";
import profetaIcon  from "../../../assets/images/icons/profeta.png";
import evangelistaIcon from "../../../assets/images/icons/evangelista.png";
import pastorIcon from "../../../assets/images/icons/pastor.png";
import mestreIcon from "../../../assets/images/icons/mestre.png";

export default function Treinamentos() {
  useEffect(() => {
    document.title = "Treinamentos | Five One";
  }, []);

  return (
    <div className="bg-navy text-slate-light min-h-screen relative overflow-hidden">

      {/* Decorações globais — ícones dos ministérios nas laterais */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden hidden lg:block">
        <img src={apostoloIcon}    alt="" className="absolute top-[5%]    left-[1.5%] w-16 opacity-[0.08] grayscale" />
        <img src={evangelistaIcon} alt="" className="absolute top-[35%]   left-[1%]   w-14 opacity-[0.06] grayscale" />
        <img src={mestreIcon}      alt="" className="absolute top-[65%]   left-[2%]   w-14 opacity-[0.07] grayscale" />
        <img src={profetaIcon}     alt="" className="absolute top-[10%]   right-[1.5%] w-16 opacity-[0.08] grayscale" />
        <img src={pastorIcon}      alt="" className="absolute top-[45%]   right-[1%]   w-14 opacity-[0.06] grayscale" />
        <img src={apostoloIcon}    alt="" className="absolute bottom-[8%] right-[2%]   w-12 opacity-[0.07] grayscale" />
      </div>

      {/* Orbs e grid de pontos */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[450px] bg-mint/[0.07] blur-[100px] rounded-full" />
        <div className="absolute top-1/3 left-0 w-[500px] h-[400px] bg-blue-500/[0.06] blur-[80px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[350px] bg-golden/[0.05] blur-[100px] rounded-full" />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'radial-gradient(circle, #64ffda 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

      {/* ── Hero ── */}
      <section className="relative pt-8 sm:pt-10 pb-10 lg:pb-14 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-mint/[0.06] blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Texto */}
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-4">
                Treinamentos e Mentorias
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-white tracking-tight leading-[1.1] mb-4">
                Leve os 5 Ministérios para a sua{" "}
                <span className="text-mint">vida e a sua igreja</span>
              </h1>
              <p className="text-base sm:text-lg text-slate leading-relaxed mb-6">
                Da mentoria individual à imersão completa da comunidade — formatos
                flexíveis para ajudar você, sua liderança e toda a sua igreja a
                crescer no chamado ministerial.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-light/60 border border-slate/15 text-sm text-slate-light">
                  <svg className="w-4 h-4 text-mint" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  Mentoria individual
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-light/60 border border-slate/15 text-sm text-slate-light">
                  <svg className="w-4 h-4 text-mint" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  Palestras para igrejas
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-light/60 border border-slate/15 text-sm text-slate-light">
                  <svg className="w-4 h-4 text-mint" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  Imersão ministerial
                </span>
              </div>
            </div>

            {/* Imagem */}
            <div className="relative rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.4)] hidden lg:block">
              <img
                src={imgLeveOs5}
                alt="Treinamentos Five One"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent pointer-events-none" />
            </div>

          </div>
        </div>
      </section>

      {/* ── Formatos de treinamento (componente existente) ── */}
      <TrainingFormats />

    </div>
  );
}
