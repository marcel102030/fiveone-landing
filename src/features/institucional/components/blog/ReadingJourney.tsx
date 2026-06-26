import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  type BlogPost,
  formatPostDate,
  listMostReactedPosts,
  listPostsFromCategory,
  listPostsFromOtherCategories,
} from "../../services/blog";

interface Props {
  /** Post atual (já lido) */
  currentPostId: string;
  /** Categoria do post atual */
  currentCategory: string;
  /** ID do "próximo post" exibido em outro componente (será excluído daqui pra não duplicar) */
  excludePostId?: string | null;
}

/**
 * Seção rica de leitura ao final do post:
 *  - Continue na mesma categoria (3 posts)
 *  - Descubra outros temas (3 posts de categorias diferentes)
 *  - Os mais lidos do blog (opcional, se houver reações)
 */
export default function ReadingJourney({
  currentPostId,
  currentCategory,
  excludePostId,
}: Props) {
  const [sameCategory, setSameCategory] = useState<BlogPost[]>([]);
  const [otherCategories, setOtherCategories] = useState<BlogPost[]>([]);
  const [mostRead, setMostRead] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const excludes = [currentPostId, excludePostId].filter(Boolean) as string[];

    Promise.all([
      listPostsFromCategory(currentCategory, excludes, 3),
      listPostsFromOtherCategories(currentCategory, excludes, 3),
    ])
      .then(async ([same, others]) => {
        if (!alive) return;
        setSameCategory(same);
        setOtherCategories(others);

        // Most read excluindo todos os já mostrados
        const allShown = [...excludes, ...same.map((p) => p.id), ...others.map((p) => p.id)];
        const mostReadList = await listMostReactedPosts(allShown, 3);
        if (alive) setMostRead(mostReadList);
      })
      .catch(() => {
        if (alive) {
          setSameCategory([]);
          setOtherCategories([]);
          setMostRead([]);
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [currentPostId, currentCategory, excludePostId]);

  if (loading) return null;

  // Se não há nada pra mostrar, esconde
  if (sameCategory.length === 0 && otherCategories.length === 0 && mostRead.length === 0) {
    return null;
  }

  return (
    <section className="bg-navy-light/30 py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
        {/* Continue na mesma categoria */}
        {sameCategory.length > 0 && (
          <JourneyBlock
            badge="Continue lendo"
            title={
              <>
                Mais sobre <span className="text-mint">{currentCategory}</span>
              </>
            }
            description="Aprofunde no tema que você acabou de ler."
            posts={sameCategory}
          />
        )}

        {/* Descubra outros temas */}
        {otherCategories.length > 0 && (
          <JourneyBlock
            badge="Descubra"
            title={
              <>
                Explore <span className="text-mint">outros temas</span>
              </>
            }
            description="Conteúdos de outras categorias pra ampliar sua jornada."
            posts={otherCategories}
            highlightCategory
          />
        )}

        {/* Mais lidos */}
        {mostRead.length > 0 && (
          <JourneyBlock
            badge="Em alta"
            title={
              <>
                Os <span className="text-mint">mais lidos</span> do blog
              </>
            }
            description="Os posts que mais ressoaram com a comunidade Five One."
            posts={mostRead}
            showReactions
          />
        )}
      </div>
    </section>
  );
}

// ─── Bloco reutilizável ──────────────────────────────────────

function JourneyBlock({
  badge,
  title,
  description,
  posts,
  highlightCategory,
  showReactions,
}: {
  badge: string;
  title: React.ReactNode;
  description: string;
  posts: BlogPost[];
  highlightCategory?: boolean;
  showReactions?: boolean;
}) {
  return (
    <div>
      <header className="mb-6 lg:mb-8">
        <span className="inline-block px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-2xs font-semibold uppercase tracking-wider mb-3">
          {badge}
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-white tracking-tight leading-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm sm:text-base text-slate max-w-2xl">
            {description}
          </p>
        )}
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((p, i) => (
          <JourneyCard
            key={p.id}
            post={p}
            featured={i === 0}
            highlightCategory={highlightCategory}
            showReactions={showReactions}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Card de post da jornada ─────────────────────────────────

function JourneyCard({
  post,
  featured,
  highlightCategory,
  showReactions,
}: {
  post: BlogPost;
  featured?: boolean;
  highlightCategory?: boolean;
  showReactions?: boolean;
}) {
  const totalReactions =
    ((post as any).reactions_clap || 0) +
    ((post as any).reactions_insight || 0) +
    ((post as any).reactions_inspire || 0);

  return (
    <Link
      to={`/para-ler/${post.slug}`}
      className="group flex flex-col bg-navy-light/60 border border-slate/10 rounded-2xl overflow-hidden hover:border-mint/30 hover:shadow-mint transition-all hover:-translate-y-1 duration-300"
    >
      {/* Capa */}
      <div className="relative aspect-video overflow-hidden bg-navy">
        {post.cover_url ? (
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate/30 text-4xl">
            📖
          </div>
        )}

        {/* Badge da categoria quando highlightCategory */}
        {highlightCategory && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 bg-navy/85 backdrop-blur-sm border border-mint/30 text-mint text-2xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              {post.category}
            </span>
          </div>
        )}

        {/* Featured badge */}
        {featured && !highlightCategory && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 bg-mint text-navy text-2xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              ⭐ Destaque
            </span>
          </div>
        )}

        {/* Reaction count overlay */}
        {showReactions && totalReactions > 0 && (
          <div className="absolute bottom-3 right-3 bg-navy/85 backdrop-blur-sm border border-mint/20 rounded-full px-3 py-1 text-2xs font-semibold text-mint">
            🔥 {totalReactions}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 p-5 flex flex-col">
        {!highlightCategory && (
          <p className="text-2xs text-mint font-semibold uppercase tracking-wider">
            {post.category}
          </p>
        )}
        <h3
          className={`mt-2 font-bold text-slate-white tracking-tight leading-snug group-hover:text-mint transition-colors line-clamp-2 ${
            featured ? "text-lg lg:text-xl" : "text-base"
          }`}
        >
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-xs sm:text-sm text-slate leading-relaxed line-clamp-2 grow">
            {post.excerpt}
          </p>
        )}
        <div className="mt-3 pt-3 border-t border-slate/10 flex items-center justify-between text-2xs text-slate">
          <span className="truncate">{post.author_name}</span>
          <span>{formatPostDate(post.published_at)}</span>
        </div>
      </div>
    </Link>
  );
}
