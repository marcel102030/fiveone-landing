// Cloudflare Pages Function — Open Graph dinâmico por post do blog.
//
// Intercepta GET /para-ler/:postId no servidor, busca o post no Supabase e
// injeta as meta tags (og:* e twitter:*) corretas no index.html ANTES de
// servir. Assim, WhatsApp/Facebook/Twitter (que não executam JS) exibem o
// card com título, descrição e imagem do post específico.
//
// Para usuários normais, o React assume a navegação a partir do mesmo HTML.
//
// Env vars necessárias (já configuradas no projeto):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY  (usada só para leitura server-side de posts publicados)

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ASSETS: { fetch: (input: RequestInfo | URL) => Promise<Response> };
}

const SITE = "https://fiveonemovement.com";
const DEFAULT_IMAGE = `${SITE}/assets/og-image.jpg`;

type PostMeta = {
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  cover_url: string | null;
  author_name: string | null;
  published_at: string | null;
};

export const onRequest = async (ctx: {
  request: Request;
  env: Env;
  params: { postId: string };
}) => {
  const { request, env, params } = ctx;
  const slug = decodeURIComponent(params.postId || "");

  // 1. Carrega o index.html base (SPA shell)
  const indexResp = await env.ASSETS.fetch(new URL("/index.html", request.url));
  let html = await indexResp.text();

  // Garante caminhos absolutos de assets (defesa caso o build use base relativa).
  // Em rota aninhada (/para-ler/slug), `./assets` resolveria errado e o app não
  // carregaria — força para `/assets` e `/blog`.
  html = html
    .replace(/(src|href)="\.\/assets\//g, '$1="/assets/')
    .replace(/(src|href)="\.\/blog\//g, '$1="/blog/')
    .replace(/(src|href)="\.\/(favicon|apple-touch|web-app|site\.webmanifest)/g, '$1="/$2');

  // 2. Busca o post publicado no Supabase
  try {
    const apiUrl =
      `${env.SUPABASE_URL}/rest/v1/platform_blog_post` +
      `?slug=eq.${encodeURIComponent(slug)}` +
      `&status=eq.published` +
      `&select=title,subtitle,excerpt,cover_url,author_name,published_at`;

    const resp = await fetch(apiUrl, {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        Accept: "application/json",
      },
    });

    if (resp.ok) {
      const rows = (await resp.json()) as PostMeta[];
      const post = Array.isArray(rows) ? rows[0] : null;
      if (post) {
        const title = `${post.title} | Five One`;
        const description = clamp(
          post.excerpt || post.subtitle || "Insights ministeriais e teológicos da Five One.",
          200,
        );
        const image = absolutizeImage(post.cover_url);
        const url = `${SITE}/para-ler/${slug}`;
        html = injectMeta(html, { title, description, image, url, author: post.author_name, publishedAt: post.published_at });
      }
    }
  } catch {
    // fallback silencioso: serve o index.html original
  }

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
};

// ── Helpers ───────────────────────────────────────────────────

function clamp(text: string, max: number): string {
  const t = (text || "").replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}

function absolutizeImage(coverUrl: string | null): string {
  // URL absoluta da imagem original
  const src = !coverUrl
    ? DEFAULT_IMAGE
    : /^https?:\/\//i.test(coverUrl)
      ? coverUrl
      : `${SITE}${coverUrl.startsWith("/") ? "" : "/"}${coverUrl}`;

  // Otimiza para o formato ideal de Open Graph (1200x630), independente do
  // tamanho/peso da imagem original. Resolve retroativamente TODOS os posts
  // (capas grandes que o WhatsApp não conseguia processar) e os futuros.
  // weserv.nl: proxy de imagem gratuito atrás de Cloudflare.
  const noProto = src.replace(/^https?:\/\//i, "");
  return (
    "https://images.weserv.nl/?url=" +
    encodeURIComponent("ssl:" + noProto) +
    "&w=1200&h=630&fit=cover&a=attention&output=jpg&q=82"
  );
}

function escapeAttr(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function injectMeta(
  html: string,
  meta: {
    title: string;
    description: string;
    image: string;
    url: string;
    author: string | null;
    publishedAt: string | null;
  },
): string {
  const title = escapeAttr(meta.title);
  const desc = escapeAttr(meta.description);
  const image = escapeAttr(meta.image);
  const url = escapeAttr(meta.url);

  let out = html;

  // <title>
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);

  // description
  out = replaceMeta(out, /name="description"/i, `<meta name="description" content="${desc}" />`);

  // Open Graph
  out = replaceMeta(out, /property="og:title"/i, `<meta property="og:title" content="${title}" />`);
  out = replaceMeta(out, /property="og:description"/i, `<meta property="og:description" content="${desc}" />`);
  out = replaceMeta(out, /property="og:image"/i, `<meta property="og:image" content="${image}" />`);
  out = replaceMeta(out, /property="og:url"/i, `<meta property="og:url" content="${url}" />`);
  out = replaceMeta(out, /property="og:type"/i, `<meta property="og:type" content="article" />`);

  // Twitter
  out = replaceMeta(out, /name="twitter:title"/i, `<meta name="twitter:title" content="${title}" />`);
  out = replaceMeta(out, /name="twitter:description"/i, `<meta name="twitter:description" content="${desc}" />`);
  out = replaceMeta(out, /name="twitter:image"/i, `<meta name="twitter:image" content="${image}" />`);

  // Garante og:image:width/height + alt (inseridos antes de </head> se não existirem)
  const extra =
    `<meta property="og:image:alt" content="${title}" />` +
    `<meta property="og:image:type" content="image/jpeg" />` +
    `<meta property="og:image:width" content="1200" />` +
    `<meta property="og:image:height" content="630" />` +
    (meta.author ? `<meta property="article:author" content="${escapeAttr(meta.author)}" />` : "") +
    (meta.publishedAt ? `<meta property="article:published_time" content="${escapeAttr(meta.publishedAt)}" />` : "");
  if (!out.includes('property="og:image:width"')) {
    out = out.replace(/<\/head>/i, `${extra}</head>`);
  }

  return out;
}

/**
 * Substitui uma <meta> existente (identificada por um atributo) pelo novo
 * conteúdo, ou insere antes de </head> se não existir.
 */
function replaceMeta(html: string, matcher: RegExp, replacement: string): string {
  const metaRegex = new RegExp(`<meta[^>]*${matcher.source}[^>]*>`, "i");
  if (metaRegex.test(html)) {
    return html.replace(metaRegex, replacement);
  }
  return html.replace(/<\/head>/i, `${replacement}</head>`);
}
