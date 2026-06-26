import { Link } from "react-router-dom";
import { type BlogPost, formatPostDate } from "../../services/blog";

/**
 * Card de post reutilizável (capa + categoria + título + excerpt + autor/data).
 * Usado na listagem /para-ler (BlogList) e na seção de conteúdo gratuito da Home.
 */
export default function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to={`/para-ler/${post.slug}`}
      className="group flex flex-col bg-navy-light/60 border border-slate/10 rounded-2xl overflow-hidden hover:border-mint/30 hover:shadow-mint transition-all"
    >
      <div className="relative aspect-video overflow-hidden bg-navy">
        {post.cover_url ? (
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate/30 text-5xl">
            📖
          </div>
        )}
      </div>

      <div className="flex-1 p-5 flex flex-col">
        <p className="text-2xs text-mint font-semibold uppercase tracking-wider">
          {post.category}
        </p>
        <h3 className="mt-2 text-lg font-bold text-slate-white tracking-tight leading-snug group-hover:text-mint transition-colors line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm text-slate leading-relaxed line-clamp-3 grow">
            {post.excerpt}
          </p>
        )}
        <div className="mt-4 pt-4 border-t border-slate/10 flex items-center justify-between text-2xs text-slate">
          <span className="truncate">{post.author_name}</span>
          <span>{formatPostDate(post.published_at)}</span>
        </div>
      </div>
    </Link>
  );
}
