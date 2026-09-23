// Rotas do site da Rede de Igrejas nas Casas.
//
// No domínio próprio (redeigrejanascasas.com) as páginas ficam na raiz
// (/valores, /casas…). No domínio do Five One elas ficam sob /rede-igrejas,
// para não colidir com rotas do Five One (ex.: /contato).

export const REDE_PAGE_SLUGS = [
  'quem-somos',
  'historia',
  'valores',
  'estrutura',
  'confissao',
  'casas',
  'agenda',
  'recursos',
  'contato',
] as const;

export type RedePageSlug = (typeof REDE_PAGE_SLUGS)[number];

/** Slugs que já são rotas do Five One; no domínio da rede a rota troca de página. */
export const REDE_SLUGS_SHARED_WITH_FIVEONE: readonly RedePageSlug[] = ['quem-somos', 'contato'];

export function isRedeDomain(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'redeigrejanascasas.com' || host === 'www.redeigrejanascasas.com';
}

/** Caminho de uma página da rede no domínio atual. Sem slug = página inicial. */
export function redePath(slug?: RedePageSlug): string {
  const base = isRedeDomain() ? '' : '/rede-igrejas';
  if (!slug) return base || '/';
  return `${base}/${slug}`;
}
