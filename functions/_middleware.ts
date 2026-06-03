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
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
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
      "Leituras teológicas, ministeriais e práticas do Five One sobre os 5 ministérios, vida cristã, apologética, igreja e cultura.",
    url: `${SITE}/insights`,
    image: `${SITE}/assets/og-para-ler.png`,
  },
  "/cursos": {
    title: "Cursos e Treinamentos | Five One",
    description:
      "Cursos bíblicos online e treinamentos dos 5 Ministérios para igrejas. Fundamento teológico, linguagem clara e aplicação prática.",
    url: `${SITE}/cursos`,
    image: `${SITE}/assets/og-cursos.jpg`,
  },
  "/cursos/apologetica": {
    title: "Curso de Apologética | Five One",
    description:
      "Aprenda a defender a fé com solidez bíblica e racional. 20 aulas em vídeo, do básico ao avançado, com certificado.",
    url: `${SITE}/cursos/apologetica`,
    image: `${SITE}/assets/og-cursos.jpg`,
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
    image: `${SITE}/assets/og-teste-ministerios.png`,
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

  // ── escolafiveone.com → redireciona para a plataforma ──────────────────────
  // Qualquer rota que não seja da plataforma vai para /plataforma
  if (url.hostname === "escolafiveone.com") {
    const isPlataformaPath =
      path.startsWith("/plataforma") ||
      path.startsWith("/login-aluno") ||
      path.startsWith("/certificado") ||
      path.startsWith("/resultado") ||
      path.startsWith("/perfil") ||
      path.startsWith("/meu-progresso") ||
      path.startsWith("/favoritos") ||
      path.startsWith("/certificados") ||
      path.startsWith("/c/") ||
      path.startsWith("/api/") ||
      path.startsWith("/assets/");
    if (!isPlataformaPath) {
      return Response.redirect(new URL("/plataforma", request.url).toString(), 302);
    }
    return next(); // já é rota da plataforma — serve normalmente
  }

  const meta = ROUTE_META[path];
  if (!meta) return next(); // assets, /api/*, /c/*, /insights/:post, etc.

  // /insights usa a capa do post em destaque (ou o mais recente) como imagem.
  const resolved = { ...meta };
  if (path === "/insights") {
    const cover = await featuredPostCover(env);
    if (cover) resolved.image = cover;
  }

  // Carrega o index.html base e injeta as meta tags da rota.
  const indexResp = await env.ASSETS.fetch(new URL("/index.html", request.url));
  if (!indexResp.ok) return next();
  let html = await indexResp.text();
  html = injectMeta(html, resolved);

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
};

// ── Helpers ───────────────────────────────────────────────────

/**
 * Busca a capa do post em destaque (is_featured) ou, na falta, do mais recente,
 * e devolve uma versão otimizada 1200×630 (via weserv) para o card OG.
 */
async function featuredPostCover(env: Env): Promise<string | null> {
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null;
    const api =
      `${env.SUPABASE_URL}/rest/v1/platform_blog_post` +
      `?status=eq.published&cover_url=not.is.null` +
      `&order=is_featured.desc,published_at.desc&limit=1&select=cover_url`;
    const resp = await fetch(api, {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        Accept: "application/json",
      },
    });
    if (!resp.ok) return null;
    const rows = (await resp.json()) as { cover_url?: string }[];
    const cover = Array.isArray(rows) ? rows[0]?.cover_url : null;
    if (!cover) return null;
    const noProto = String(cover).replace(/^https?:\/\//i, "");
    return (
      "https://images.weserv.nl/?url=" +
      encodeURIComponent("ssl:" + noProto) +
      "&w=1200&h=630&fit=cover&a=attention&output=jpg&q=82"
    );
  } catch {
    return null;
  }
}

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
