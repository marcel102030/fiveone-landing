// Página de link-in-bio — substitui o Linktree.
// URL: fiveonemovement.com/links
// Use este link na bio do Instagram em vez do linktr.ee

import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaInstagram, FaYoutube, FaTiktok, FaWhatsapp,
  FaCompass, FaBookOpen, FaGraduationCap, FaGlobe,
} from "react-icons/fa";
import { IconType } from "react-icons";
import logoUrl from "../../../assets/images/logo-fiveone-white.png";
import { SOCIAL } from "../../../shared/config/social";

type LinkItem = {
  label: string;
  sublabel?: string;
  Icon: IconType;
  iconClass: string;
  to?: string;
  href?: string;
  highlight?: boolean;
};

const LINKS: LinkItem[] = [
  {
    Icon: FaCompass,
    iconClass: "text-mint",
    label: "Descubra seu Dom Ministerial",
    sublabel: "Teste gratuito dos 5 Ministérios",
    to: "/descubra-seu-dom",
  },
  {
    Icon: FaBookOpen,
    iconClass: "text-mint",
    label: "Para Ler",
    sublabel: "Leituras semanais sobre fé e ministério",
    to: "/para-ler",
  },
  {
    Icon: FaGraduationCap,
    iconClass: "text-mint",
    label: "Defenda a sua Fé",
    sublabel: "Lançamento 6 de julho · R$ 59,90",
    to: "/cursos/apologetica",
  },
  {
    Icon: FaWhatsapp,
    iconClass: "text-[#25D366]",
    label: "Lista de Espera — WhatsApp",
    sublabel: "Comunidade do curso de Apologética",
    href: "https://chat.whatsapp.com/DuYWYWMQleG897njhHUOKa?s=cl&p=i&ilr=4",
  },
  {
    Icon: FaYoutube,
    iconClass: "text-[#FF0000]",
    label: "YouTube Five One",
    sublabel: "Ensinos e pregações gratuitas",
    href: SOCIAL.youtube.url,
  },
  {
    Icon: FaTiktok,
    iconClass: "text-slate-white",
    label: "TikTok Five One",
    sublabel: SOCIAL.tiktok.handle,
    href: SOCIAL.tiktok.url,
  },
  {
    Icon: FaGlobe,
    iconClass: "text-slate",
    label: "Site Five One",
    sublabel: "fiveonemovement.com",
    to: "/",
  },
];

const SOCIALS = [
  { Icon: FaInstagram, href: SOCIAL.instagram.url, label: "Instagram" },
  { Icon: FaYoutube,   href: SOCIAL.youtube.url,   label: "YouTube" },
  { Icon: FaTiktok,   href: SOCIAL.tiktok.url,    label: "TikTok" },
  { Icon: FaWhatsapp, href: SOCIAL.whatsapp.url,  label: "WhatsApp" },
];

export default function Links() {
  useEffect(() => {
    document.title = "Five One — Links";
  }, []);

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center px-4 py-10 pb-16">
      {/* Logo + identidade */}
      <div className="flex flex-col items-center mb-8">
        <img
          src={logoUrl}
          alt="Five One"
          className="h-16 w-auto mb-4"
          draggable={false}
        />
        <h1 className="text-xl font-bold text-slate-white tracking-tight">Five One</h1>
        <p className="text-sm text-slate mt-1 text-center max-w-xs">
          Movimento dos 5 Ministérios — cursos, leituras e conteúdo gratuito para
          crescer no seu chamado.
        </p>

        {/* Ícones sociais */}
        <div className="flex items-center gap-3 mt-5">
          {SOCIALS.map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-9 h-9 rounded-full bg-slate/10 flex items-center justify-center text-slate hover:bg-mint/20 hover:text-mint transition-colors"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>

      {/* Botões de link */}
      <div className="w-full max-w-sm space-y-3">
        {LINKS.map((item) => {
          const { Icon } = item;
          const inner = (
            <div className="flex items-center gap-4">
              <span className={`shrink-0 w-8 flex items-center justify-center ${item.iconClass}`}>
                <Icon className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className={`font-semibold text-sm leading-tight ${item.highlight ? "text-navy" : "text-slate-white"}`}>
                  {item.label}
                </p>
                {item.sublabel && (
                  <p className={`text-xs mt-0.5 ${item.highlight ? "text-navy/70" : "text-slate"}`}>
                    {item.sublabel}
                  </p>
                )}
              </div>
            </div>
          );

          const cls = `block w-full rounded-2xl px-5 py-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
            item.highlight
              ? "bg-mint shadow-mint hover:shadow-mint-strong"
              : "bg-navy-light border border-slate/15 hover:border-mint/40"
          }`;

          if (item.to) {
            return (
              <Link key={item.label} to={item.to} className={cls}>
                {inner}
              </Link>
            );
          }
          return (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cls}
            >
              {inner}
            </a>
          );
        })}
      </div>

      {/* Rodapé */}
      <p className="mt-10 text-2xs text-slate/50 text-center">
        © {new Date().getFullYear()} Five One · fiveonemovement.com
      </p>
    </div>
  );
}
