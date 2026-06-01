import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BLOG_CATEGORIES,
  type BlogPost,
  formatPostDate,
  listPublishedPosts,
} from "../services/blog";
import PostCard from "../components/blog/PostCard";
import NewsletterForm from "../components/blog/NewsletterForm";

const PAGE_SIZE = 12;

const BlogList = () => {
  useEffect(() => {
    document.title = "Para Ler | Five One";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Artigos teológicos, ministeriais e práticos do Five One sobre os 5 ministérios, vida cristã, apologética, igreja e cultura.",
      );
    }
  }, []);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string | "ALL">("ALL");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    listPublishedPosts(category === "ALL" ? {} : { category })
      .then((data) => {
        if (alive) setPosts(data);
      })
      .catch((e) => {
        if (alive) setError(e?.message || "Erro ao carregar artigos.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [category]);

  const { featured, rest } = useMemo(() => {
    // Destaque = post marcado manualmente (is_featured). Se nenhum estiver
    // marcado, cai no mais recente (posts já vêm ordenados por published_at).
    const f = posts.find((p) => p.is_featured) || posts[0] || null;
    const r = posts.filter((p) => p.id !== f?.id).slice(0, PAGE_SIZE);
    return { featured: f, rest: r };
  }, [posts]);

  return (
    <div className="bg-navy text-slate-light min-h-screen">
      {/* ─────────── Hero ─── */}
      <section className="relative pt-8 sm:pt-10 pb-10 lg:pb-14 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-mint/[0.06] blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-medium uppercase tracking-wider mb-4">
            Para Ler
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-white tracking-tight leading-[1.1]">
            Artigos para <span className="text-mint">crescer</span> na fé
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate max-w-2xl mx-auto leading-relaxed">
            Reflexões teológicas, ministeriais e práticas. Conteúdo profundo,
            mas acessível, para quem leva a fé a sério.
          </p>

          {/* Newsletter — abaixo da descrição, compacto e centralizado */}
          <div className="mt-8 max-w-md mx-auto">
            <p className="text-xs text-slate mb-2">Receba os próximos artigos no e-mail</p>
            <NewsletterForm source="blog_list" compact />
          </div>
        </div>
      </section>

      {/* ─────────── Filtros de categoria ─── */}
      <section className="pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <CategoryChip
              label="Todos"
              active={category === "ALL"}
              onClick={() => setCategory("ALL")}
            />
            {BLOG_CATEGORIES.map((c) => (
              <CategoryChip
                key={c}
                label={c}
                active={category === c}
                onClick={() => setCategory(c)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── Conteúdo ─── */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {loading ? (
            <BlogSkeleton />
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center text-red-300 text-sm">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <EmptyState category={category} />
          ) : (
            <>
              {featured && <FeaturedPostCard post={featured} />}

              {rest.length > 0 && (
                <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                  {rest.map((p) => (
                    <PostCard key={p.id} post={p} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default BlogList;

// ─── Sub-componentes ───────────────────────────────────────────

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
        active
          ? "bg-mint text-navy border-mint"
          : "border-slate/20 text-slate hover:border-mint/40 hover:text-slate-light"
      }`}
    >
      {label}
    </button>
  );
}

function FeaturedPostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to={`/insights/${post.slug}`}
      className="group relative grid lg:grid-cols-5 gap-0 lg:gap-10 bg-gradient-to-br from-navy-light to-navy border border-mint/20 rounded-3xl overflow-hidden hover:border-mint/40 transition-colors shadow-card-hover"
    >
      <div className="relative lg:col-span-3 aspect-video lg:aspect-auto lg:h-full overflow-hidden bg-navy">
        {post.cover_url ? (
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate/30 text-6xl">📖</div>
        )}
        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-navy text-2xs font-bold uppercase tracking-wider">
          Em destaque
        </div>
      </div>

      <div className="lg:col-span-2 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
        <p className="text-2xs text-mint font-semibold uppercase tracking-wider">
          {post.category}
        </p>
        <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-white tracking-tight leading-tight group-hover:text-mint transition-colors">
          {post.title}
        </h2>
        {post.subtitle && (
          <p className="mt-3 text-sm sm:text-base text-slate-light leading-relaxed line-clamp-3">
            {post.subtitle}
          </p>
        )}
        <div className="mt-5 flex items-center gap-3 text-2xs text-slate">
          <span>{post.author_name}</span>
          <span className="w-1 h-1 rounded-full bg-slate/40" />
          <span>{formatPostDate(post.published_at)}</span>
        </div>
        <div className="mt-6 inline-flex items-center gap-1.5 text-mint text-sm font-semibold">
          Ler artigo
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ category }: { category: string }) {
  return (
    <div className="bg-navy-light/60 border border-slate/10 rounded-2xl p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-mint/10 flex items-center justify-center text-mint text-3xl">📝</div>
      <h3 className="text-xl font-bold text-slate-white">
        {category === "ALL"
          ? "Em breve, novos artigos"
          : `Nenhum artigo em ${category} ainda`}
      </h3>
      <p className="mt-2 text-sm text-slate max-w-md mx-auto">
        Estamos preparando conteúdos para fortalecer sua jornada na fé. Volte em
        breve.
      </p>
    </div>
  );
}

function BlogSkeleton() {
  return (
    <div className="space-y-10">
      <div className="grid lg:grid-cols-5 gap-6 lg:gap-10 bg-navy-light/40 border border-slate/10 rounded-3xl overflow-hidden p-6 lg:p-10">
        <div className="lg:col-span-3 aspect-video bg-navy/60 rounded-xl animate-pulse" />
        <div className="lg:col-span-2 flex flex-col justify-center gap-3">
          <div className="h-3 w-24 bg-navy/60 rounded animate-pulse" />
          <div className="h-8 w-full bg-navy/60 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-navy/60 rounded animate-pulse" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-navy-light/40 border border-slate/10 rounded-2xl overflow-hidden">
            <div className="aspect-video bg-navy/60 animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-3 w-20 bg-navy/60 rounded animate-pulse" />
              <div className="h-5 w-full bg-navy/60 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-navy/60 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
