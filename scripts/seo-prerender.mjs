// Pré-renderização leve para SEO + previews de link.
// Roda DEPOIS do `vite build`. Para cada rota abaixo, cria dist/<rota>/index.html
// = cópia do dist/index.html com <title>, description, canonical, Open Graph,
// Twitter e um bloco de conteúdo SEO dentro de #root (o app usa createRoot, então
// o React substitui esse conteúdo ao montar — sem erro de hidratação).
// Sem dependências extras (só fs). Google e scrapers passam a ler tudo no HTML cru.

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const BASE = "https://fiveonemovement.com";
const OG_IMAGE = `${BASE}/assets/og-image.jpg`;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const doms = [
  { slug: "apostolo", nome: "Apóstolo", frase: "Você tem visão estratégica e paixão por abrir novos caminhos.", intro: "O dom apostólico é marcado por uma visão clara e ampla sobre o propósito da igreja: pioneiro, estratégico e movido pela missão, lança fundamentos e cria caminhos onde ainda não existem." },
  { slug: "profeta", nome: "Profeta", frase: "Você é sensível à voz de Deus e movido por autenticidade espiritual.", intro: "O dom profético carrega profunda sensibilidade espiritual e a capacidade de perceber o que Deus está falando: guardião da aliança, chama a igreja de volta ao coração de Deus." },
  { slug: "evangelista", nome: "Evangelista", frase: "Você é movido pelo desejo de alcançar e transformar vidas.", intro: "O dom evangelístico é marcado por uma paixão profunda em compartilhar as boas novas de Cristo, com compaixão e senso de urgência pelos perdidos, criando pontes entre a igreja e o mundo." },
  { slug: "pastor", nome: "Pastor", frase: "Você tem coração para cuidar e caminhar ao lado das pessoas.", intro: "O dom pastoral é marcado por um profundo senso de cuidado, proteção e amor pelas pessoas: caminha ao lado, escuta e acompanha os discípulos em suas jornadas de fé." },
  { slug: "mestre", nome: "Mestre", frase: "Você tem paixão pelo ensino da Palavra e pela formação de discípulos.", intro: "O dom de mestre é marcado por um amor profundo pela Palavra e pelo desejo de ensinar com fidelidade, clareza e profundidade, protegendo a igreja de heresias e promovendo maturidade." },
];

const pages = [
  {
    path: "descubra-seu-dom",
    title: "Teste dos 5 Ministérios — Descubra seu Dom (Apóstolo, Profeta, Evangelista, Pastor, Mestre) | Five One",
    description: "Faça o Teste dos 5 Ministérios gratuito (~10 min) e descubra o seu dom ministerial — Apóstolo, Profeta, Evangelista, Pastor ou Mestre. Baseado em Efésios 4:11-13, com resultado completo em PDF.",
    h1: "Teste dos 5 Ministérios — Descubra o seu Dom",
    body: "Descubra o seu dom ministerial segundo Efésios 4:11-13. São 50 pares de afirmações, cerca de 10 minutos, com resultado do seu dom principal e secundário e um PDF completo do seu perfil.",
    type: "website",
  },
  ...doms.map((d) => ({
    path: `dom/${d.slug}`,
    title: `Dom de ${d.nome} — forças, pontos cegos e chamado (Efésios 4) | Five One`,
    description: `O dom de ${d.nome} nos 5 ministérios de Efésios 4: o que é, forças, pontos cegos, como se manifesta e como desenvolver. Descubra se é o seu dom no Teste dos 5 Ministérios.`,
    h1: `Dom de ${d.nome}`,
    body: `${d.frase} ${d.intro}`,
    type: "article",
  })),
];

const template = readFileSync(join(DIST, "index.html"), "utf8");

function build(page) {
  const url = `${BASE}/${page.path}`;
  let html = template;

  // title
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`);
  // description
  html = html.replace(
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${esc(page.description)}" />`,
  );
  // og
  html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(page.title)}" />`);
  html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(page.description)}" />`);
  html = html.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`);
  html = html.replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${page.type}" />`);
  // twitter
  html = html.replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(page.title)}" />`);
  html = html.replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(page.description)}" />`);

  // canonical + JSON-LD antes de </head>
  const jsonld = {
    "@context": "https://schema.org",
    "@type": page.type === "article" ? "Article" : "WebPage",
    headline: page.title,
    description: page.description,
    inLanguage: "pt-BR",
    url,
    image: OG_IMAGE,
    isPartOf: { "@type": "WebSite", name: "Five One", url: BASE },
    author: { "@type": "Person", name: "Marcelo Junior" },
    publisher: { "@type": "Organization", name: "Five One", url: BASE },
  };
  const headExtra =
    `  <link rel="canonical" href="${url}" />\n` +
    `  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n</head>`;
  html = html.replace("</head>", headExtra);

  // conteúdo SEO dentro de #root (React substitui ao montar via createRoot)
  const seoBody =
    `<main style="max-width:760px;margin:0 auto;padding:40px 20px;font-family:sans-serif;color:#cfd8dc">` +
    `<p style="color:#64ffda;font-weight:700;letter-spacing:.1em;text-transform:uppercase;font-size:13px">Efésios 4:11 · Five One</p>` +
    `<h1 style="font-size:32px;color:#e6eef2">${esc(page.h1)}</h1>` +
    `<p style="font-size:18px;line-height:1.7">${esc(page.body)}</p>` +
    `<p><a href="/descubra-seu-dom" style="color:#64ffda">Fazer o Teste dos 5 Ministérios →</a></p>` +
    `</main>`;
  html = html.replace(/<div id="root">\s*<\/div>/, `<div id="root">${seoBody}</div>`);

  const dir = join(DIST, page.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
  return page.path;
}

const done = pages.map(build);
console.log(`SEO prerender: ${done.length} páginas → ${done.map((p) => "/" + p).join(", ")}`);
