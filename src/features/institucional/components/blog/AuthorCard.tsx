/**
 * Author card compacto — uma linha discreta no rodapé do artigo.
 */
export default function AuthorCard({
  name,
  bio,
  avatarUrl,
}: {
  name: string;
  bio?: string;
  avatarUrl?: string;
  links?: { label: string; href: string }[];
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-mint/20 to-mint/5 border border-mint/20 flex items-center justify-center text-mint text-xs font-bold overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          initials
        )}
      </div>
      <div className="min-w-0">
        <p className="text-2xs text-slate uppercase tracking-wider leading-tight">Escrito por</p>
        <p className="text-sm font-semibold text-slate-light leading-tight truncate">{name}</p>
        {bio && (
          <p className="text-2xs text-slate/80 leading-snug mt-0.5 line-clamp-1">
            {bio}
          </p>
        )}
      </div>
    </div>
  );
}
