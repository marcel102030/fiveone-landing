// Gera uma arte 1080×1350 (feed retrato do Instagram) a partir de um post.
// Layout: a capa do post aparece INTEIRA (sem cortar) num quadro no topo —
// com um fundo desfocado da própria capa preenchendo as bordas (letterbox
// elegante) — e título + resumo + chamada numa faixa navy embaixo.
// Canvas 2D puro (sem html2canvas). Retorna um dataURL PNG pronto pra baixar.

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
      `&w=${CARD_W}&output=jpg&q=90`;
    return await loadImage(proxied);
  } catch {
    return null;
  }
}

// Desenha a imagem dentro de um retângulo com modo "cover" (preenche cortando)
// ou "contain" (cabe inteira, com sobra).
function drawFit(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  mode: "cover" | "contain",
) {
  const scale =
    mode === "cover"
      ? Math.max(w / img.width, h / img.height)
      : Math.min(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
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

// Texto com espaçamento entre letras (tracking), que o canvas não tem nativo.
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
        f.load("800 60px Inter"),
        f.load("400 32px Inter"),
        f.load("700 30px Inter"),
      ]);
    }
  } catch {
    /* fallback pra fonte do sistema */
  }

  const img = post.cover_url ? await loadCover(post.cover_url) : null;

  // Fundo navy + brilho mint sutil no topo
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  const glow = ctx.createRadialGradient(CARD_W / 2, 260, 40, CARD_W / 2, 260, 760);
  glow.addColorStop(0, "rgba(100,255,218,0.07)");
  glow.addColorStop(1, "rgba(10,25,47,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const PAD = 72;
  const contentW = CARD_W - PAD * 2;
  ctx.textBaseline = "top";

  // Rótulo da marca (topo)
  let y = PAD + 4;
  ctx.font = "700 30px Inter, Arial, sans-serif";
  ctx.fillStyle = MINT;
  drawSpaced(ctx, "PARA LER · FIVE ONE", PAD, y, 4);
  y += 30 + 38;

  // ── Quadro da capa (imagem inteira, sem cortar) ──
  const bandX = PAD;
  const bandY = y;
  const bandW = contentW;
  const bandH = 560;
  const radius = 28;

  ctx.save();
  roundRectPath(ctx, bandX, bandY, bandW, bandH, radius);
  ctx.clip();
  if (img) {
    // Fundo: a própria capa desfocada (preenche as bordas com elegância)
    ctx.filter = "blur(34px)";
    drawFit(ctx, img, bandX - 30, bandY - 30, bandW + 60, bandH + 60, "cover");
    ctx.filter = "none";
    ctx.fillStyle = "rgba(10,25,47,0.45)";
    ctx.fillRect(bandX, bandY, bandW, bandH);
    // Frente: a capa inteira (contain)
    drawFit(ctx, img, bandX, bandY, bandW, bandH, "contain");
  } else {
    ctx.fillStyle = "#13243f";
    ctx.fillRect(bandX, bandY, bandW, bandH);
  }
  ctx.restore();
  // Borda sutil do quadro
  roundRectPath(ctx, bandX, bandY, bandW, bandH, radius);
  ctx.strokeStyle = "rgba(230,241,255,0.10)";
  ctx.lineWidth = 2;
  ctx.stroke();

  y = bandY + bandH + 52;

  // ── Texto (categoria + título + resumo + CTA) ──
  const category = (post.category || "").toUpperCase();
  if (category) {
    ctx.font = "700 26px Inter, Arial, sans-serif";
    ctx.fillStyle = MINT;
    drawSpaced(ctx, category, PAD, y, 3);
    y += 26 + 22;
  }

  ctx.font = "800 60px Inter, Arial, sans-serif";
  ctx.fillStyle = WHITE;
  const titleLines = clampLines(ctx, wrapAll(ctx, post.title, contentW), 3, contentW);
  const titleLH = 72;
  for (const ln of titleLines) {
    ctx.fillText(ln, PAD, y);
    y += titleLH;
  }

  const sub = (post.excerpt || post.subtitle || "").replace(/\s+/g, " ").trim();
  if (sub) {
    y += 18;
    ctx.font = "400 32px Inter, Arial, sans-serif";
    ctx.fillStyle = SLATE;
    const subLines = clampLines(ctx, wrapAll(ctx, sub, contentW), 3, contentW);
    const subLH = 44;
    for (const ln of subLines) {
      ctx.fillText(ln, PAD, y);
      y += subLH;
    }
  }

  // CTA fixo no rodapé
  ctx.font = "700 30px Inter, Arial, sans-serif";
  ctx.fillStyle = MINT;
  ctx.fillText("Leia no site →  fiveonemovement.com", PAD, CARD_H - PAD - 30);

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
