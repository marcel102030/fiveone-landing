import { useEffect, useState } from "react";
import type { TocItem } from "./blogHelpers";

/**
 * Sumário lateral com scrollspy (destaca o item ativo).
 * Esconde se não houver itens.
 */
export default function ReadingTOC({ items }: { items: TocItem[] }) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    const headings = items
      .map((i) => document.getElementById(i.slug))
      .filter(Boolean) as HTMLElement[];

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pega o "mais visível" perto do topo da viewport
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = (visible[0].target as HTMLElement).id;
          setActiveSlug(id);
        }
      },
      {
        rootMargin: "-120px 0px -60% 0px",
        threshold: [0, 1],
      },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <aside
      aria-label="Sumário"
      className="hidden xl:block sticky top-28 self-start max-w-[220px]"
    >
      <p className="text-2xs uppercase tracking-wider text-slate/60 font-semibold mb-3">
        Nesta leitura
      </p>
      <nav>
        <ul className="space-y-1.5 border-l border-slate/15">
          {items.map((item) => {
            const active = activeSlug === item.slug;
            return (
              <li key={item.slug} className={item.level === 3 ? "pl-3" : ""}>
                <a
                  href={`#${item.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(item.slug);
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.scrollY - 100;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                  }}
                  className={`block pl-3 -ml-px py-1 text-[13px] leading-snug transition-colors border-l-2 ${
                    active
                      ? "border-mint text-mint font-semibold"
                      : "border-transparent text-slate hover:text-slate-light"
                  }`}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
