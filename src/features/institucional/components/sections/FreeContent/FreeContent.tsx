import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaYoutube, FaBookOpen } from "react-icons/fa";
import { SOCIAL } from "../../../../../shared/config/social";
import { type BlogPost, listPublishedPosts } from "../../../services/blog";
import PostCard from "../../blog/PostCard";

type Channel = {
  name: string;
  desc: string;
  cta: string;
  to?: string; // rota interna
  href?: string; // link externo
  Icon: typeof FaInstagram;
  iconClass: string;
};

const CHANNELS: Channel[] = [
  {
    name: "Para Ler",
    desc: "Leituras teológicas e práticas que aprofundam a sua fé.",
    cta: "Explorar",
    to: "/insights",
    Icon: FaBookOpen,
    iconClass: "bg-mint/10 border border-mint/30 text-mint",
  },
  {
    name: "YouTube",
    desc: "Ensinos e pregações em vídeo — conteúdo gratuito toda semana.",
    cta: "Inscrever-se",
    href: SOCIAL.youtube.url,
    Icon: FaYoutube,
    iconClass: "bg-[#FF0000] text-white",
  },
  {
    name: "Instagram",
    desc: "Reflexões, reels e carrosséis pra crescer no seu dia a dia.",
    cta: "Seguir",
    href: SOCIAL.instagram.url,
    Icon: FaInstagram,
    iconClass:
      "bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#962fbf] text-white",
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

function ChannelCard({ channel }: { channel: Channel }) {
  const { Icon } = channel;
  const inner = (
    <>
      <span
        className={`inline-flex w-12 h-12 items-center justify-center rounded-xl ${channel.iconClass} mb-4`}
      >
        <Icon className="w-6 h-6" />
      </span>
      <h3 className="text-lg font-bold text-slate-white mb-1.5">{channel.name}</h3>
      <p className="text-sm text-slate leading-relaxed grow">{channel.desc}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mint">
        {channel.cta}
        <ArrowIcon />
      </span>
    </>
  );

  const cls =
    "group relative flex flex-col p-6 lg:p-7 rounded-2xl bg-navy-light/60 border border-slate/10 hover:border-mint/40 hover:bg-navy-light transition-all duration-200";

  return channel.to ? (
    <Link to={channel.to} className={cls}>
      {inner}
    </Link>
  ) : (
    <a href={channel.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  );
}

/**
 * Seção da Home que dá palco ao conteúdo GRATUITO (Blog, YouTube, Instagram),
 * amarrado ao objetivo de crescimento diário, + os últimos artigos do blog.
 */
export default function FreeContent() {
  const [latest, setLatest] = useState<BlogPost[]>([]);

  useEffect(() => {
    let alive = true;
    listPublishedPosts({ limit: 3 })
      .then((data) => alive && setLatest(data))
      .catch(() => {
        /* silencioso — sem artigos, escondemos o bloco */
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="relative bg-navy py-20 lg:py-28 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-mint/[0.04] blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="max-w-2xl mx-auto text-center mb-12 lg:mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-4">
            Conteúdo gratuito
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-white tracking-tight">
            Cresça no seu chamado <span className="text-mint">todos os dias</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate">
            Nem tudo é curso. Acompanhe o Five One de graça e amadureça na fé, no
            propósito e no seu dom — no seu ritmo.
          </p>
        </div>

        {/* Cards de canal */}
        <div className="grid sm:grid-cols-3 gap-4 lg:gap-5">
          {CHANNELS.map((c) => (
            <ChannelCard key={c.name} channel={c} />
          ))}
        </div>

        {/* Últimas leituras (só aparece se houver) */}
        {latest.length > 0 && (
          <div className="mt-16 lg:mt-20">
            <div className="flex items-end justify-between gap-4 mb-6 lg:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-white tracking-tight">
                Últimas leituras
              </h3>
              <Link
                to="/insights"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-mint shrink-0"
              >
                Ver todos
                <ArrowIcon />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {latest.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
