import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { marked } from "marked";
import {
  type BlogComment,
  type BlogPost,
  formatPostDate,
  getPostBySlug,
  listApprovedComments,
  listRelatedPosts,
  submitComment,
} from "../services/blog";
import ReadingProgress from "../components/blog/ReadingProgress";
import ReadingTOC from "../components/blog/ReadingTOC";
import SelectionShare from "../components/blog/SelectionShare";
import BlogReactions from "../components/blog/BlogReactions";
import NextPostCard from "../components/blog/NextPostCard";
import AuthorCard from "../components/blog/AuthorCard";
import ReaderControls from "../components/blog/ReaderControls";
import ReadingJourney from "../components/blog/ReadingJourney";
import NewsletterForm from "../components/blog/NewsletterForm";
import NewsletterStickyBanner from "../components/blog/NewsletterStickyBanner";
import InstagramShareButton from "../components/blog/InstagramShareButton";
import {
  buildShareUrl,
  calculateReadingTime,
  extractToc,
  headingSlug,
  preprocessMarkdown,
} from "../components/blog/blogHelpers";
import { applyEmbeds } from "../components/blog/EmbedRenderer";
import "./BlogPostPage.css";

const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// Configura renderer do marked pra adicionar `id` em h2/h3 (ancoras de TOC)
function setupMarkedRenderer() {
  const renderer = new marked.Renderer();
  const originalHeading = renderer.heading.bind(renderer);
  renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    if (depth === 2 || depth === 3) {
      const slug = headingSlug(text.replace(/<[^>]+>/g, ""));
      return `<h${depth} id="${slug}">${text}</h${depth}>\n`;
    }
    return originalHeading.apply(this, [{ tokens, depth, raw: "", text: "" } as any]);
  };
  return renderer;
}

const BlogPostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const slug = postId || "";

  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setNotFound(false);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

    getPostBySlug(slug)
      .then(async (p) => {
        if (!alive) return;
        if (!p) {
          setNotFound(true);
          return;
        }
        setPost(p);
        try {
          const rel = await listRelatedPosts(p.id, p.category, 3);
          if (alive) setRelated(rel);
        } catch {
          /* ignore */
        }
      })
      .catch(() => alive && setNotFound(true))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [slug]);

  // SEO + JSON-LD
  useEffect(() => {
    if (!post) return;
    document.title = `${post.title} | Five One`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && post.excerpt) meta.setAttribute("content", post.excerpt);

    const ld = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt || "",
      image: post.cover_url || undefined,
      datePublished: post.published_at,
      dateModified: post.updated_at,
      author: { "@type": "Person", name: post.author_name },
      publisher: {
        "@type": "Organization",
        name: "Five One",
        url: "https://fiveonemovement.com",
      },
      articleSection: post.category,
      keywords: post.tags.join(", "),
    };
    let scriptEl = document.getElementById("blog-jsonld") as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = "blog-jsonld";
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }
    scriptEl.text = JSON.stringify(ld);
    return () => {
      const el = document.getElementById("blog-jsonld");
      if (el) el.remove();
    };
  }, [post]);

  // Animação fade-in nos parágrafos da .post-content
  useEffect(() => {
    if (!post) return;
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(".post-content > *");
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
      );
      elements.forEach((el) => {
        el.classList.add("fade-up");
        observer.observe(el);
      });
      return () => observer.disconnect();
    }, 200);
    return () => clearTimeout(timer);
  }, [post]);

  const contentHtml = useMemo(() => {
    if (!post) return "";
    try {
      const renderer = setupMarkedRenderer();
      const processed = preprocessMarkdown(post.content_markdown);
      const raw = marked.parse(processed, { async: false, renderer }) as string;
      return applyEmbeds(raw);
    } catch {
      return "<p>Erro ao renderizar conteúdo.</p>";
    }
  }, [post]);

  const tocItems = useMemo(
    () => (post ? extractToc(post.content_markdown) : []),
    [post],
  );

  const readingMinutes = useMemo(
    () => (post ? calculateReadingTime(post.content_markdown) : 0),
    [post],
  );

  const wasEdited = useMemo(() => {
    if (!post) return false;
    if (!post.published_at) return false;
    const pub = new Date(post.published_at).getTime();
    const upd = new Date(post.updated_at).getTime();
    return upd - pub > 1000 * 60 * 60 * 24; // > 1 dia
  }, [post]);

  if (loading) {
    return (
      <div className="bg-navy text-slate-light min-h-screen">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-12 pb-20">
          <div className="h-3 w-24 bg-navy-light/60 rounded animate-pulse" />
          <div className="mt-4 h-10 w-3/4 bg-navy-light/60 rounded animate-pulse" />
          <div className="mt-3 h-5 w-1/2 bg-navy-light/60 rounded animate-pulse" />
          <div className="mt-8 aspect-video bg-navy-light/60 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="bg-navy text-slate-light min-h-screen">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-16 pb-20 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-mint/10 flex items-center justify-center text-mint text-3xl">🔍</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-white">Leitura não encontrada</h1>
          <p className="mt-3 text-sm text-slate">O link pode estar incorreto ou o post pode ter sido removido.</p>
          <Link
            to="/insights"
            className="mt-8 inline-flex items-center gap-1.5 px-5 py-3 bg-mint text-navy font-semibold rounded-xl hover:shadow-mint-strong transition"
          >
            <ArrowLeftIcon />
            Voltar para as leituras
          </Link>
        </div>
      </div>
    );
  }

  const nextPost = related[0] || null;
  // URL de compartilhamento versionada por updated_at — força WhatsApp/Meta a
  // re-buscarem o card sempre que o post (ex.: a capa) é editado.
  const shareUrl = buildShareUrl(slug, post.updated_at);

  return (
    <div className="bg-navy text-slate-light min-h-screen">
      <ReadingProgress targetSelector="article.post-article" />
      <ReaderControls />
      <NewsletterStickyBanner />
      <SelectionShare title={post.title} shareUrl={shareUrl} />

      {/* ─────────── Hero do post ─── */}
      <header className="relative pt-8 sm:pt-10 pb-8 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-mint/[0.04] blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 lg:px-8">
          <Link
            to="/insights"
            className="inline-flex items-center gap-1.5 text-xs text-slate hover:text-mint transition-colors mb-6"
          >
            <ArrowLeftIcon />
            Voltar para as leituras
          </Link>

          <p className="text-2xs text-mint font-semibold uppercase tracking-wider">
            {post.category}
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-white tracking-tight leading-[1.15]">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="mt-4 text-lg sm:text-xl text-slate leading-relaxed">
              {post.subtitle}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between flex-wrap gap-3 pb-6 border-b border-slate/10">
            <div className="flex items-center gap-3 text-sm text-slate flex-wrap">
              <span className="font-medium text-slate-light">{post.author_name}</span>
              <span className="w-1 h-1 rounded-full bg-slate/40" />
              <span>{formatPostDate(post.published_at)}</span>
              <span className="w-1 h-1 rounded-full bg-slate/40" />
              <span className="inline-flex items-center gap-1">
                <ClockIcon /> {readingMinutes} min de leitura
              </span>
              {wasEdited && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate/40" />
                  <span className="text-2xs italic text-slate/70">
                    atualizado em {formatPostDate(post.updated_at)}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ShareButton title={post.title} shareUrl={shareUrl} />
              <InstagramShareButton post={post} />
            </div>
          </div>
        </div>
      </header>

      {/* Cover — alinhada com a coluna de leitura */}
      {post.cover_url && (
        <div className="max-w-3xl mx-auto px-6 lg:px-8 mb-10">
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full h-auto rounded-2xl shadow-card-hover border border-slate/10"
          />
        </div>
      )}

      {/* Layout: TOC à esquerda (xl+) + conteúdo. Sem TOC = single column centralizado. */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-10">
        {tocItems.length >= 2 ? (
          <div className="xl:grid xl:grid-cols-[220px_minmax(0,720px)] xl:gap-12 xl:justify-center">
            <ReadingTOC items={tocItems} />
            <article className="post-article max-w-3xl mx-auto xl:mx-0">
              <div
                className="post-content"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
              <ArticleFooter post={post} />
            </article>
          </div>
        ) : (
          <article className="post-article max-w-3xl mx-auto">
            <div
              className="post-content"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
            <ArticleFooter post={post} />
          </article>
        )}
      </div>

      {/* Próximo post (destaque) */}
      {nextPost && <NextPostCard post={nextPost} />}

      {/* Jornada de leitura — 3 blocos: mesma categoria, outros temas, mais lidos */}
      <ReadingJourney
        currentPostId={post.id}
        currentCategory={post.category}
        excludePostId={nextPost?.id || null}
      />

      {/* Comentários */}
      {/* Newsletter — captação antes dos comentários */}
      <section className="max-w-3xl mx-auto px-6 lg:px-8 pb-4">
        <div className="bg-navy-light/60 border border-slate/10 rounded-2xl px-6 py-5">
          <p className="text-sm font-bold text-slate-white mb-1">Gostou da leitura?</p>
          <p className="text-sm text-slate mb-4">Receba os próximos diretamente no seu e-mail.</p>
          <NewsletterForm source="blog_post" />
        </div>
      </section>

      <CommentsSection postId={post.id} />
    </div>
  );
};

export default BlogPostPage;

// ─── Sub-components ──────────────────────────────────────────

/**
 * Rodapé compacto do artigo: autor (lado esquerdo) + reações (lado direito).
 * Vem logo abaixo do texto, separado por uma linha sutil.
 */
function ArticleFooter({ post }: { post: BlogPost }) {
  const authorBio = post.author_name.toLowerCase().includes("marcelo")
    ? "Fundador do Movimento Five One."
    : undefined;

  return (
    <footer className="article-footer-anchor mt-12 pt-6 border-t border-slate/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
      <AuthorCard name={post.author_name} bio={authorBio} />
      <BlogReactions postId={post.id} />
    </footer>
  );
}

// ─── Share button ─────────────────────────────────────────────

function ShareButton({ title, shareUrl }: { title: string; shareUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = shareUrl;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* fallback */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate/20 text-slate-light text-xs hover:border-mint hover:text-mint transition"
    >
      <ShareIcon />
      {copied ? "Link copiado!" : "Compartilhar"}
    </button>
  );
}

// ─── Comments section ────────────────────────────────────────

function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listApprovedComments(postId)
      .then((data) => alive && setComments(data))
      .catch(() => alive && setComments([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      setError("Preencha nome e comentário.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitComment({
        postId,
        authorName: name,
        authorEmail: email,
        content,
      });
      setSubmitted(true);
      setName("");
      setEmail("");
      setContent("");
    } catch (e: any) {
      setError(e?.message || "Falha ao enviar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="blog-comments bg-navy py-16 border-t border-slate/10">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-white tracking-tight">
          Comentários{" "}
          <span className="text-slate text-base font-medium">
            ({comments.length})
          </span>
        </h2>

        <form
          onSubmit={handleSubmit}
          className="mt-6 bg-navy-light/60 border border-slate/10 rounded-2xl p-5 sm:p-6 space-y-4"
        >
          {submitted ? (
            <div className="text-sm text-mint">
              ✓ Comentário enviado. Aparecerá aqui após aprovação.
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="ml-2 underline hover:opacity-80"
              >
                Enviar outro
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-base font-semibold text-slate-light">
                Deixe um comentário
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome *"
                  required
                  className="bg-navy border border-slate/20 rounded-lg px-3 py-2.5 text-sm text-slate-light placeholder:text-slate/50 focus:outline-none focus:border-mint"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu email (opcional, não exibido)"
                  className="bg-navy border border-slate/20 rounded-lg px-3 py-2.5 text-sm text-slate-light placeholder:text-slate/50 focus:outline-none focus:border-mint"
                />
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva seu comentário…"
                required
                rows={4}
                className="w-full bg-navy border border-slate/20 rounded-lg px-3 py-2.5 text-sm text-slate-light placeholder:text-slate/50 focus:outline-none focus:border-mint"
              />
              {error && <p className="text-xs text-red-300">{error}</p>}
              <p className="text-2xs text-slate/70">
                Comentários passam por moderação antes de aparecer.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-mint text-navy font-semibold rounded-xl hover:shadow-mint transition disabled:opacity-50"
              >
                {submitting ? "Enviando…" : "Enviar comentário"}
              </button>
            </>
          )}
        </form>

        <div className="mt-8 space-y-4">
          {loading ? (
            <div className="text-sm text-slate">Carregando comentários…</div>
          ) : comments.length === 0 ? (
            <div className="text-sm text-slate italic">
              Seja o primeiro a comentar.
            </div>
          ) : (
            comments.map((c) => (
              <article
                key={c.id}
                className="bg-navy-light/40 border border-slate/10 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-mint/15 border border-mint/30 flex items-center justify-center text-mint text-xs font-bold uppercase">
                    {c.author_name.slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-light">
                      {c.author_name}
                    </p>
                    <p className="text-2xs text-slate">
                      {formatPostDate(c.created_at)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-light leading-relaxed whitespace-pre-wrap">
                  {c.content}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
