// Gera uma arte 1080×1350 (feed retrato do Instagram) a partir de um post.
// Usa Canvas 2D puro (sem html2canvas) para controle total e previsibilidade:
// capa do post como fundo (cover-fit), gradiente navy por cima e título +
// resumo + chamada sobrepostos. Retorna um dataURL PNG pronto pra baixar.

const CARD_W = 1080;
const CARD_H = 1350;

const NAVY = "#0a192f";
const MINT = "#64ffda";
const WHITE = "#e6f1ff";
const SLATE = "#9fb3d1";

export type InstagramCardPost = {
  title: string;
  excerpt?: string | null;
  subtitle?: string | null;
  cover_url?: string | null;
  category?: string | null;
};

function loadImage(src: string, crossOrigin = true): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Tenta a URL original (mesma origem ou com CORS). Se falhar (ex.: imagem
// externa sem CORS, que tornaria o canvas "tainted"), cai no proxy weserv.nl
// que devolve cabeçalhos CORS permissivos.
async function loadCover(coverUrl: string): Promise<HTMLImageElement | null> {
  try {
    return await loadImage(coverUrl);
  } catch {
    /* tenta weserv */
  }
  try {
    const noProto = coverUrl.replace(/^https?:\/\//i, "");
    const proxied =
      "https://images.weserv.nl/?url=" +
      encodeURIComponent("ssl:" + noProto) +
      `&w=${CARD_W}&h=${CARD_H}&fit=cover&a=attention&output=jpg&q=90`;
    return await loadImage(proxied);
  } catch {
    return null;
  }
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  const scale = Math.max(CARD_W / img.width, CARD_H / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (CARD_W - w) / 2, (CARD_H - h) / 2, w, h);
}

function wrapAll(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function clampLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  maxLines: number,
  maxWidth: number,
): string[] {
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (last && ctx.measureText(`${last}…`).width > maxWidth) {
    last = last.slice(0, -1);
  }
  kept[maxLines - 1] = `${last.replace(/\s+$/, "")}…`;
  return kept;
}

// Desenha texto com espaçamento entre letras (tracking), que o canvas não tem
// nativo. Usado nos rótulos em caixa alta.
function drawSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
}

export async function generateInstagramCard(
  post: InstagramCardPost,
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não suportado");

  // Garante a fonte Inter carregada antes de medir/desenhar (se disponível).
  try {
    const f = (document as unknown as { fonts?: FontFaceSet }).fonts;
    if (f?.load) {
      await Promise.all([
        f.load("800 68px Inter"),
        f.load("400 34px Inter"),
        f.load("700 30px Inter"),
      ]);
    }
  } catch {
    /* fallback pra fonte do sistema */
  }

  // Fundo base
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Capa do post (cover-fit)
  if (post.cover_url) {
    const img = await loadCover(post.cover_url);
    if (img) drawCover(ctx, img);
  }

  // Gradiente navy: leve no topo, forte embaixo (legibilidade do texto)
  const grad = ctx.createLinearGradient(0, 0, 0, CARD_H);
  grad.addColorStop(0, "rgba(10,25,47,0.55)");
  grad.addColorStop(0.4, "rgba(10,25,47,0.12)");
  grad.addColorStop(0.66, "rgba(10,25,47,0.82)");
  grad.addColorStop(1, "rgba(10,25,47,0.98)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const PAD = 84;
  const maxW = CARD_W - PAD * 2;
  ctx.textBaseline = "top";

  // Rótulo da marca (topo)
  ctx.font = "700 30px Inter, Arial, sans-serif";
  ctx.fillStyle = MINT;
  drawSpaced(ctx, "PARA LER · FIVE ONE", PAD, PAD, 4);

  // ── Bloco inferior (categoria + título + resumo + CTA) ──
  const category = (post.category || "").toUpperCase();

  ctx.font = "800 68px Inter, Arial, sans-serif";
  const titleLines = clampLines(ctx, wrapAll(ctx, post.title, maxW), 4, maxW);
  const titleLH = 82;

  const sub = (post.excerpt || post.subtitle || "").replace(/\s+/g, " ").trim();
  ctx.font = "400 34px Inter, Arial, sans-serif";
  const subLines = sub ? clampLines(ctx, wrapAll(ctx, sub, maxW), 3, maxW) : [];
  const subLH = 48;

  const catH = category ? 38 : 0;
  const gapCatTitle = category ? 28 : 0;
  const gapTitleSub = subLines.length ? 30 : 0;
  const gapSubCta = 42;
  const ctaH = 38;

  const blockH =
    catH +
    gapCatTitle +
    titleLines.length * titleLH +
    gapTitleSub +
    subLines.length * subLH +
    gapSubCta +
    ctaH;

  let y = CARD_H - PAD - blockH;

  if (category) {
    ctx.font = "700 26px Inter, Arial, sans-serif";
    ctx.fillStyle = MINT;
    drawSpaced(ctx, category, PAD, y, 3);
    y += catH + gapCatTitle;
  }

  ctx.font = "800 68px Inter, Arial, sans-serif";
  ctx.fillStyle = WHITE;
  for (const ln of titleLines) {
    ctx.fillText(ln, PAD, y);
    y += titleLH;
  }
  y += gapTitleSub;

  if (subLines.length) {
    ctx.font = "400 34px Inter, Arial, sans-serif";
    ctx.fillStyle = SLATE;
    for (const ln of subLines) {
      ctx.fillText(ln, PAD, y);
      y += subLH;
    }
  }
  y += gapSubCta;

  ctx.font = "700 30px Inter, Arial, sans-serif";
  ctx.fillStyle = MINT;
  ctx.fillText("Leia no site →  fiveonemovement.com", PAD, y);

  return canvas.toDataURL("image/png");
}

// Legenda pronta pra colar no Instagram.
export function buildInstagramCaption(
  post: InstagramCardPost,
  shareUrl: string,
): string {
  const sub = (post.excerpt || post.subtitle || "").trim();
  const map: Record<string, string> = {
    Apologética: "#apologetica",
    Teologia: "#teologia",
    "Vida Cristã": "#vidacrista",
    "Igreja & Ministério": "#igreja",
    "5 Ministérios": "#cincoministerios",
    "Cultura & Sociedade": "#cultura",
  };
  const base = ["#fiveone", "#cincoministerios", "#efesios4", "#fé", "#teologia"];
  const extra = post.category && map[post.category] ? [map[post.category]] : [];
  const tags = Array.from(new Set([...base, ...extra])).join(" ");

  return [
    post.title,
    sub,
    "📖 Leia o artigo completo no site — link na bio 👆 (ou toque no link do story)",
    `🔗 ${shareUrl}`,
    tags,
  ]
    .filter(Boolean)
    .join("\n\n");
}
