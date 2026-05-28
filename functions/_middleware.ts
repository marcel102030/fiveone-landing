// Cloudflare Pages Function — Open Graph por rota (middleware global).
//
// Problema: o site é uma SPA, então TODAS as rotas servem o mesmo index.html.
// Como crawlers (WhatsApp/Facebook/Twitter) não executam JS, qualquer link
// compartilhado mostrava as meta tags padrão do index.html (que eram do Quiz).
//
// Aqui interceptamos as rotas públicas conhecidas e injetamos as meta tags
// (og:* / twitter:*) corretas de cada uma ANTES de servir. Rotas não mapeadas
// (assets, /api/*, /c/*, /insights/:post — que tem função própria) passam
// direto via next().

interface Env {
  ASSETS: { fetch: (input: RequestInfo | URL) => Promise<Response> };
}

const SITE = "https://fiveonemovement.com";
const DEFAULT_IMAGE = `${SITE}/assets/og-image.jpg`;

type RouteMeta = {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
};

// Cada rota pública com seu card único.
const ROUTE_META: Record<string, RouteMeta> = {
  "/": {
    title: "Five One — Movimento dos 5 Ministérios",
    description:
      "Cursos bíblicos com fundamento teológico, treinamentos dos 5 Ministérios e o Teste dos 5 Ministérios. Comece pelo Curso de Apologética.",
    url: `${SITE}/`,
  },
  "/insights": {
    title: "Para Ler | Five One",
    description:
      "Artigos teológicos, ministeriais e práticos do Five One sobre os 5 ministérios, vida cristã, apologética, igreja e cultura.",
    url: `${SITE}/insights`,
  },
  "/cursos": {
    title: "Cursos e Treinamentos | Five One",
    description:
      "Cursos bíblicos online e treinamentos dos 5 Ministérios para igrejas. Fundamento teológico, linguagem clara e aplicação prática.",
    url: `${SITE}/cursos`,
  },
  "/cursos/apologetica": {
    title: "Curso de Apologética | Five One",
    description:
      "Aprenda a defender a fé com solidez bíblica e racional. 20 aulas em vídeo, do básico ao avançado, com certificado.",
    url: `${SITE}/cursos/apologetica`,
  },
  "/contato": {
    title: "Contato | Five One",
    description:
      "Conecte-se com o Five One. Siga no Instagram, YouTube e TikTok, fale no WhatsApp ou envie uma mensagem.",
    url: `${SITE}/contato`,
  },
  "/descubra-seu-dom": {
    title: "Descubra seu Dom Ministerial - Five One",
    description:
      "Faça o teste e descubra qual dos 5 ministérios está mais presente na sua vida: Apóstolo, Profeta, Evangelista, Pastor ou Mestre.",
    url: `${SITE}/descubra-seu-dom`,
  },
};

export const onRequest = async (ctx: {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
}) => {
  const { request, env, next } = ctx;
  if (request.method !== "GET") return next();

  const url = new URL(request.url);
  let path = url.pathname.replace(/\/+$/, "");
  if (path === "") path = "/";

  const meta = ROUTE_META[path];
  if (!meta) return next(); // assets, /api/*, /c/*, /insights/:post, etc.

  // Carrega o index.html base e injeta as meta tags da rota.
  const indexResp = await env.ASSETS.fetch(new URL("/index.html", request.url));
  if (!indexResp.ok) return next();
  let html = await indexResp.text();
  html = injectMeta(html, meta);

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
};

// ── Helpers ───────────────────────────────────────────────────

function escapeAttr(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function injectMeta(html: string, meta: RouteMeta): string {
  const title = escapeAttr(meta.title);
  const desc = escapeAttr(meta.description);
  const image = escapeAttr(meta.image || DEFAULT_IMAGE);
  const url = escapeAttr(meta.url);
  const type = escapeAttr(meta.type || "website");

  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  out = replaceMeta(out, /name="description"/i, `<meta name="description" content="${desc}" />`);
  out = replaceMeta(out, /property="og:title"/i, `<meta property="og:title" content="${title}" />`);
  out = replaceMeta(out, /property="og:description"/i, `<meta property="og:description" content="${desc}" />`);
  out = replaceMeta(out, /property="og:image"/i, `<meta property="og:image" content="${image}" />`);
  out = replaceMeta(out, /property="og:url"/i, `<meta property="og:url" content="${url}" />`);
  out = replaceMeta(out, /property="og:type"/i, `<meta property="og:type" content="${type}" />`);
  out = replaceMeta(out, /name="twitter:title"/i, `<meta name="twitter:title" content="${title}" />`);
  out = replaceMeta(out, /name="twitter:description"/i, `<meta name="twitter:description" content="${desc}" />`);
  out = replaceMeta(out, /name="twitter:image"/i, `<meta name="twitter:image" content="${image}" />`);
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
