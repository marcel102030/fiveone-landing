import { Link } from "react-router-dom";
import { FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";
import { SOCIAL } from "../../../config/social";
import logoUrl from "../../../../assets/images/logo-fiveone-white-small.png";

const NAV_LINKS = [
  { to: "/cursos", label: "Cursos e Treinamentos" },
  { to: "/descubra-seu-dom", label: "Descubra seu Dom" },
  { to: "/insights", label: "Para Ler" },
  { to: "/contato", label: "Contato" },
];

const SOCIAL_LINKS = [
  { href: SOCIAL.instagram.url, Icon: FaInstagram, label: "Instagram" },
  { href: SOCIAL.youtube.url, Icon: FaYoutube, label: "YouTube" },
  { href: SOCIAL.tiktok.url, Icon: FaTiktok, label: "TikTok" },
];

const Footer = () => (
  <footer className="bg-navy-light border-t border-slate/10">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

        {/* Marca */}
        <div className="lg:col-span-2">
          <img src={logoUrl} alt="Five One" className="h-8 w-auto mb-4" draggable={false} />
          <p className="text-sm text-slate leading-relaxed max-w-sm">
            Um movimento voltado a quem deseja viver com profundidade o chamado de
            Deus — com fundamento teológico, vida devocional e propósito claro.
          </p>
          {/* Redes sociais */}
          <div className="flex items-center gap-4 mt-6">
            {SOCIAL_LINKS.map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-full bg-slate/10 flex items-center justify-center text-slate hover:bg-mint/15 hover:text-mint transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Navegação */}
        <div>
          <h3 className="text-2xs font-semibold uppercase tracking-wider text-slate mb-4">
            Navegação
          </h3>
          <ul className="space-y-2.5">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-sm text-slate-light hover:text-mint transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contato */}
        <div>
          <h3 className="text-2xs font-semibold uppercase tracking-wider text-slate mb-4">
            Contato
          </h3>
          <ul className="space-y-2.5 text-sm text-slate-light">
            <li>
              <a
                href={`${SOCIAL.whatsapp.url}?text=Ol%C3%A1!%20Vim%20pelo%20site%20do%20Five%20One.`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-mint transition-colors"
              >
                WhatsApp: {SOCIAL.whatsapp.display}
              </a>
            </li>
            <li>
              <a href={`mailto:${SOCIAL.email}`} className="hover:text-mint transition-colors">
                {SOCIAL.email}
              </a>
            </li>
            <li className="text-slate pt-1 text-xs">
              Escola Five One Ltda<br />
              CNPJ: 48.442.767/0001-05
            </li>
          </ul>
        </div>

      </div>
    </div>

    {/* Barra inferior */}
    <div className="border-t border-slate/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-2xs text-slate">
        <span>© {new Date().getFullYear()} Five One — Todos os direitos reservados</span>
        <span>Feito com propósito 🙏</span>
      </div>
    </div>
  </footer>
);

export default Footer;
