// Cloudflare Pages Function — gera o sitemap.xml dinamicamente.
//
// Inclui as rotas estáticas do site e todos os posts publicados do blog,
// buscados em tempo real do Supabase. O Google usa isso pra descobrir e
// indexar as páginas — essencial pro SEO dos artigos do "Para Ler".
//
// Acesso: https://fiveonemovement.com/sitemap.xml

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

const SITE = "https://fiveonemovement.com";

const STATIC_ROUTES: { url: string; priority: string; changefreq: string }[] = [
  { url: "/",                    priority: "1.0", changefreq: "weekly" },
  { url: "/cursos",              priority: "0.9", changefreq: "weekly" },
  { url: "/cursos/apologetica",  priority: "0.9", changefreq: "monthly" },
  { url: "/descubra-seu-dom",    priority: "0.8", changefreq: "monthly" },
  { url: "/insights",            priority: "0.8", changefreq: "daily" },
  { url: "/contato",             priority: "0.6", changefreq: "monthly" },
];

// Sitemap próprio do domínio da Rede de Igrejas nas Casas.
const REDE_SITE = "https://redeigrejanascasas.com";
const REDE_ROUTES: { url: string; priority: string; changefreq: string }[] = [
  { url: "/",                                priority: "1.0", changefreq: "weekly" },
  { url: "/rede-igrejas/o-que-e-five-one",   priority: "0.8", changefreq: "monthly" },
  { url: "/rede-igrejas/como-funciona",      priority: "0.8", changefreq: "monthly" },
  { url: "/rede-igrejas/rede-five-one",      priority: "0.8", changefreq: "monthly" },
];

function buildSitemap(routes: { url: string; priority: string; changefreq: string }[], site: string, today: string): string {
  const entries = routes
    .map(({ url, priority, changefreq }) => `
  <url>
    <loc>${site}${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`.trim();
}

export const onRequest = async (ctx: {
  request: Request;
  env: Env;
}) => {
  const { request, env } = ctx;
  const today = new Date().toISOString().split("T")[0];

  // ── Domínio da Rede: sitemap próprio (sem cursos/blog do Five One) ────────
  const host = new URL(request.url).hostname;
  if (host === "redeigrejanascasas.com" || host === "www.redeigrejanascasas.com") {
    return new Response(buildSitemap(REDE_ROUTES, REDE_SITE, today), {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  }

  // Busca posts publicados do blog
  let posts: { slug: string; updated_at: string; published_at: string | null }[] = [];
  try {
    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      const api =
        `${env.SUPABASE_URL}/rest/v1/platform_blog_post` +
        `?status=eq.published&select=slug,updated_at,published_at&order=published_at.desc&limit=200`;
      const resp = await fetch(api, {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          Accept: "application/json",
        },
      });
      if (resp.ok) {
        posts = await resp.json();
      }
    }
  } catch {
    // Se falhar, gera sitemap só com rotas estáticas
  }

  const staticEntries = STATIC_ROUTES.map(
    ({ url, priority, changefreq }) => `
  <url>
    <loc>${SITE}${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  ).join("");

  const postEntries = posts
    .map(({ slug, updated_at, published_at }) => {
      const lastmod = (updated_at || published_at || today).split("T")[0];
      return `
  <url>
    <loc>${SITE}/insights/${encodeURIComponent(slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${postEntries}
</urlset>`;

  return new Response(xml.trim(), {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600", // revalida a cada 1h
    },
  });
};
