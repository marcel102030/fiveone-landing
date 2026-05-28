import { Link } from "react-router-dom";
import type { BlogPost } from "../../services/blog";
import { formatPostDate } from "../../services/blog";

/**
 * Card grande "Continue lendo" sugerindo o próximo post da mesma categoria.
 */
export default function NextPostCard({ post }: { post: BlogPost }) {
  return (
    <section className="max-w-3xl mx-auto px-6 lg:px-8 mt-12">
      <p className="text-2xs uppercase tracking-wider text-slate/70 font-semibold mb-3">
        Continue lendo
      </p>
      <Link
        to={`/insights/${post.slug}`}
        className="group relative grid sm:grid-cols-[1fr_2fr] gap-5 sm:gap-7 bg-gradient-to-br from-navy-light to-navy border border-mint/20 rounded-3xl overflow-hidden hover:border-mint/40 transition-colors shadow-card-hover"
      >
        {/* Capa */}
        <div className="relative aspect-video sm:aspect-auto sm:min-h-[180px] overflow-hidden bg-navy">
          {post.cover_url ? (
            <img
              src={post.cover_url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate/30 text-5xl">📖</div>
          )}
        </div>

        {/* Texto */}
        <div className="p-5 sm:p-7 sm:pl-0 flex flex-col justify-center">
          <p className="text-2xs text-mint font-semibold uppercase tracking-wider">
            {post.category}
          </p>
          <h3 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-slate-white tracking-tight leading-tight group-hover:text-mint transition-colors line-clamp-2">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-2 text-sm text-slate leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3 text-2xs text-slate">
            <span>{post.author_name}</span>
            <span className="w-1 h-1 rounded-full bg-slate/40" />
            <span>{formatPostDate(post.published_at)}</span>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 text-mint text-sm font-semibold">
            Ler próximo
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
            </svg>
          </span>
        </div>
      </Link>
    </section>
  );
}
