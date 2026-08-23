import jsPDF from "jspdf";
import {
  DOMS,
  DOM_ORDER,
  DomKey,
  combinationText,
  tieText,
  PLANO_30,
} from "./ministerialContent";
import { FRAUNCES_DISPLAY, FRAUNCES_ITALIC } from "./frauncesFont";

// Fonte serifada de display (Fraunces) — registrada no doc em generateMinisterialPdf
const SERIF = "Fraunces";

// ── Paleta (RGB) ──────────────────────────────────────────────────────────────
type RGB = [number, number, number];
const C = {
  navy: [13, 27, 42] as RGB,
  panel: [18, 41, 61] as RGB,
  panelSoft: [16, 32, 49] as RGB,
  mint: [100, 255, 218] as RGB,
  gold: [216, 180, 90] as RGB,
  text: [207, 216, 220] as RGB,
  muted: [154, 176, 188] as RGB,
  label: [127, 152, 166] as RGB,
  white: [244, 248, 251] as RGB,
  line: [42, 60, 78] as RGB,
};

const PAGE = { w: 210, h: 297 };
const M = 18; // margem
const CW = PAGE.w - 2 * M; // largura de conteúdo (174)

const ANGLES: Record<DomKey, number> = {
  apostolo: -90,
  profeta: -18,
  evangelista: 54,
  pastor: 126,
  mestre: 198,
};

// ── Helpers de baixo nível ────────────────────────────────────────────────────
const blend = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] * t + b[0] * (1 - t)),
  Math.round(a[1] * t + b[1] * (1 - t)),
  Math.round(a[2] * t + b[2] * (1 - t)),
];
const tc = (d: jsPDF, c: RGB) => d.setTextColor(c[0], c[1], c[2]);
const fc = (d: jsPDF, c: RGB) => d.setFillColor(c[0], c[1], c[2]);
const dc = (d: jsPDF, c: RGB) => d.setDrawColor(c[0], c[1], c[2]);

function bg(d: jsPDF) {
  fc(d, C.navy);
  d.rect(0, 0, PAGE.w, PAGE.h, "F");
}
function addPage(d: jsPDF) {
  d.addPage();
  bg(d);
}

// eyebrow (rótulo uppercase espaçado)
function eyebrow(d: jsPDF, text: string, x: number, y: number, color: RGB = C.mint) {
  d.setFont("helvetica", "bold");
  d.setFontSize(7.6);
  tc(d, color);
  d.text(text.toUpperCase(), x, y, { charSpace: 0.7 });
}
function heading(d: jsPDF, text: string, x: number, y: number, size: number, color: RGB = C.white) {
  d.setFont(SERIF, "normal");
  d.setFontSize(size);
  tc(d, color);
  d.text(text, x, y);
}
// parágrafo, retorna y final
function para(
  d: jsPDF,
  text: string,
  x: number,
  y: number,
  w: number,
  size: number,
  color: RGB,
  lh = 1.5,
  font: [string, string] = ["helvetica", "normal"],
): number {
  d.setFont(font[0], font[1]);
  d.setFontSize(size);
  tc(d, color);
  const lines = d.splitTextToSize(text, w) as string[];
  const step = size * 0.352778 * lh; // pt→mm * lineheight
  lines.forEach((ln, i) => d.text(ln, x, y + i * step));
  return y + lines.length * step;
}
function footer(d: jsPDF, left: string, pageStr: string) {
  const y = 283;
  dc(d, C.line);
  d.setLineWidth(0.2);
  d.line(M, y, PAGE.w - M, y);
  d.setFont("helvetica", "normal");
  d.setFontSize(7.5);
  tc(d, C.label);
  d.text(left, M, y + 5);
  d.text(pageStr, PAGE.w - M, y + 5, { align: "right" });
}
// título de seção (eyebrow colorido)
function sectionTitle(d: jsPDF, text: string, x: number, y: number, color: RGB = C.mint) {
  eyebrow(d, text, x, y, color);
  return y + 6;
}

// lista de bullets em 2 colunas, retorna y final
function bullets2(
  d: jsPDF,
  items: string[],
  x: number,
  y: number,
  size: number,
  dot: RGB,
  color: RGB = C.text,
): number {
  const colGap = 8;
  const colW = (CW - colGap) / 2;
  const half = Math.ceil(items.length / 2);
  const cols = [items.slice(0, half), items.slice(half)];
  const step = size * 0.352778 * 1.32;
  let maxY = y;
  cols.forEach((col, ci) => {
    const cx = x + ci * (colW + colGap);
    let cy = y;
    d.setFont("helvetica", "normal");
    d.setFontSize(size);
    col.forEach((it) => {
      fc(d, dot);
      d.circle(cx + 0.9, cy - 0.9, 0.8, "F");
      tc(d, color);
      const lines = d.splitTextToSize(it, colW - 4) as string[];
      lines.forEach((ln, li) => d.text(ln, cx + 3.4, cy + li * step));
      cy += Math.max(lines.length, 1) * step + 1.6;
    });
    maxY = Math.max(maxY, cy);
  });
  return maxY;
}

// versículo em destaque, retorna y final
function verseBox(d: jsPDF, texto: string, ref: string, x: number, y: number, w: number): number {
  d.setFont(SERIF, "italic");
  d.setFontSize(12);
  const lines = d.splitTextToSize(`"${texto}"`, w - 14) as string[];
  const lineStep = 12 * 0.352778 * 1.35;
  const h = 12 + lines.length * lineStep + 8;
  fc(d, blend(C.mint, C.navy, 0.05));
  dc(d, C.line);
  d.setLineWidth(0.2);
  d.roundedRect(x, y, w, h, 2.5, 2.5, "FD");
  tc(d, C.white);
  lines.forEach((ln, i) => d.text(ln, x + 7, y + 9 + i * lineStep));
  eyebrow(d, ref, x + 7, y + h - 5, C.mint);
  return y + h;
}

// ── Radar ─────────────────────────────────────────────────────────────────────
function radar(d: jsPDF, cx: number, cy: number, R: number, scores: Record<DomKey, number>) {
  const maxPct = Math.max(1, ...DOM_ORDER.map((k) => scores[k] || 0));
  const pt = (r: number, angDeg: number): [number, number] => {
    const a = (angDeg * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  // grades
  dc(d, C.line);
  d.setLineWidth(0.15);
  [0.25, 0.5, 0.75, 1].forEach((f) => {
    const pts = DOM_ORDER.map((k) => pt(R * f, ANGLES[k]));
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      d.line(a[0], a[1], b[0], b[1]);
    }
  });
  // eixos
  DOM_ORDER.forEach((k) => {
    const o = pt(R, ANGLES[k]);
    d.line(cx, cy, o[0], o[1]);
  });
  // polígono do score (escalado pelo máximo)
  const sp = DOM_ORDER.map((k) => pt(R * ((scores[k] || 0) / maxPct), ANGLES[k]));
  fc(d, blend(C.mint, C.navy, 0.22));
  dc(d, C.mint);
  d.setLineWidth(0.6);
  // desenha via linhas fechadas (fill + stroke)
  const deltas: [number, number][] = [];
  for (let i = 1; i < sp.length; i++) deltas.push([sp[i][0] - sp[i - 1][0], sp[i][1] - sp[i - 1][1]]);
  d.lines(deltas, sp[0][0], sp[0][1], [1, 1], "FD", true);
  // pontos
  DOM_ORDER.forEach((k) => {
    const p = pt(R * ((scores[k] || 0) / maxPct), ANGLES[k]);
    fc(d, DOMS[k].cor);
    dc(d, C.navy);
    d.setLineWidth(0.4);
    d.circle(p[0], p[1], 1.3, "FD");
  });
  // rótulos
  d.setFont("helvetica", "bold");
  d.setFontSize(7.5);
  tc(d, C.muted);
  DOM_ORDER.forEach((k) => {
    const lp = pt(R + 7, ANGLES[k]);
    d.text(DOMS[k].nome, lp[0], lp[1] + 1, { align: "center" });
  });
}

// ── Barras de ranking ─────────────────────────────────────────────────────────
function bars(d: jsPDF, ranked: { dom: DomKey; score: number }[], x: number, y: number, w: number) {
  const maxPct = Math.max(1, ...ranked.map((r) => r.score));
  const rowH = 11;
  ranked.forEach((r, i) => {
    const ry = y + i * rowH;
    // nome + dot
    fc(d, DOMS[r.dom].cor);
    d.circle(x + 1.4, ry - 1.2, 1.1, "F");
    d.setFont("helvetica", "normal");
    d.setFontSize(9);
    tc(d, C.text);
    d.text(DOMS[r.dom].nome, x + 4.5, ry);
    d.setFont("helvetica", "bold");
    tc(d, C.white);
    d.text(`${Math.round(r.score)}%`, x + w, ry, { align: "right" });
    // trilho
    const ty = ry + 1.5;
    fc(d, C.panel);
    d.roundedRect(x, ty, w, 2.4, 1.2, 1.2, "F");
    // preenchimento
    const fw = Math.max(2.4, (r.score / maxPct) * w);
    fc(d, DOMS[r.dom].cor);
    d.roundedRect(x, ty, fw, 2.4, 1.2, 1.2, "F");
  });
}

// ── Nome auto-ajustável ────────────────────────────────────────────────────────
function fitFontSize(d: jsPDF, text: string, maxW: number, base: number, font: [string, string]): number {
  d.setFont(font[0], font[1]);
  let size = base;
  while (size > 12) {
    d.setFontSize(size);
    if (d.getTextWidth(text) <= maxW) break;
    size -= 1;
  }
  return size;
}

// ── Análise (ranking + empates) ────────────────────────────────────────────────
type Analysis = {
  ranked: { dom: DomKey; score: number }[];
  primaries: DomKey[];
  secondaries: DomKey[];
  others: DomKey[];
  mode: "normal" | "tie2" | "tie3" | "balanced";
};
function analyze(scores: Record<DomKey, number>): Analysis {
  const ranked = DOM_ORDER.map((dom) => ({ dom, score: scores[dom] || 0 })).sort(
    (a, b) => b.score - a.score,
  );
  const max = ranked[0].score;
  const primaries = ranked.filter((r) => r.score === max).map((r) => r.dom);
  let mode: Analysis["mode"] = "normal";
  let secondaries: DomKey[] = [];
  if (primaries.length >= 4) {
    mode = "balanced";
  } else {
    if (primaries.length === 1) mode = "normal";
    else if (primaries.length === 2) mode = "tie2";
    else mode = "tie3";
    if (mode !== "tie3") {
      const rest = ranked.filter((r) => !primaries.includes(r.dom));
      const secScore = rest.length ? rest[0].score : -1;
      secondaries = rest.filter((r) => r.score === secScore && secScore > 0).map((r) => r.dom);
    }
  }
  const used = new Set([...primaries, ...secondaries]);
  const others = ranked.filter((r) => !used.has(r.dom)).map((r) => r.dom);
  return { ranked, primaries, secondaries, others, mode };
}

// ── Páginas ────────────────────────────────────────────────────────────────────
function domBadge(d: jsPDF, dom: DomKey, x: number, y: number, size: number) {
  fc(d, DOMS[dom].cor);
  d.circle(x + size / 2, y + size / 2, size / 2, "F");
  d.setFont(SERIF, "normal");
  d.setFontSize(size * 3);
  tc(d, C.navy);
  d.text(DOMS[dom].glyph, x + size / 2, y + size / 2 + size * 0.32, { align: "center" });
}

// brilho radial suave (anéis concêntricos) — evita o "disco chapado"
function softGlow(d: jsPDF, cx: number, cy: number, rMax: number, peak = 0.09) {
  const rings = 30;
  for (let i = rings; i >= 1; i--) {
    const r = (rMax * i) / rings;
    const t = peak * (1 - (i - 1) / rings);
    fc(d, blend(C.mint, C.navy, t));
    d.circle(cx, cy, r, "F");
  }
  fc(d, C.navy);
}

function renderCover(d: jsPDF, name: string, dateStr: string, a: Analysis) {
  bg(d);
  // brilho ambiente no topo-direito (desenhado ANTES do texto)
  softGlow(d, 172, 30, 96, 0.09);

  // topo
  d.setFont(SERIF, "normal");
  d.setFontSize(18);
  tc(d, C.white);
  d.text("Five One", M, 27);
  d.setFont("helvetica", "bold");
  d.setFontSize(7.8);
  tc(d, C.label);
  d.text("PERFIL MINISTERIAL", PAGE.w - M, 26, { align: "right", charSpace: 0.8 });

  // hero — bloco coeso e elevado (igual ao mockup)
  eyebrow(d, "Relatório de resultado", M, 108);
  const fs = fitFontSize(d, name, CW, 66, [SERIF, "normal"]);
  d.setFont(SERIF, "normal");
  d.setFontSize(fs);
  tc(d, C.white);
  const ascent = fs * 0.352778 * 0.72; // altura aprox. do nome em mm
  const nameBaseline = 108 + 7 + ascent;
  d.text(name, M, nameBaseline);
  let y = nameBaseline + 8;
  d.setFont("helvetica", "normal");
  d.setFontSize(11);
  tc(d, C.muted);
  d.text(`Avaliação realizada em ${dateStr}`, M, y);

  // caixas de dom
  y += 17;
  const coPrincipal = a.primaries.length >= 2;
  const boxes: { label: string; dom: DomKey; sec?: boolean }[] = [];
  if (a.mode === "balanced") {
    // sem principal único
  } else if (coPrincipal) {
    a.primaries.forEach((dm) => boxes.push({ label: "Dom principal", dom: dm }));
  } else {
    boxes.push({ label: "Dom principal", dom: a.primaries[0] });
    if (a.secondaries[0]) boxes.push({ label: "Dom secundário", dom: a.secondaries[0], sec: true });
  }
  if (a.mode === "balanced") {
    fc(d, C.panelSoft);
    dc(d, C.line);
    d.setLineWidth(0.2);
    d.roundedRect(M, y, CW, 30, 3.5, 3.5, "FD");
    eyebrow(d, "Resultado", M + 7, y + 11, C.gold);
    d.setFont(SERIF, "normal");
    d.setFontSize(21);
    tc(d, C.white);
    d.text("Perfil equilibrado", M + 7, y + 23);
  } else {
    const n = boxes.length;
    const gap = 6;
    const bw = (CW - gap * (n - 1)) / n;
    boxes.forEach((b, i) => {
      const bx = M + i * (bw + gap);
      fc(d, C.panelSoft);
      dc(d, C.line);
      d.setLineWidth(0.2);
      d.roundedRect(bx, y, bw, 30, 3.5, 3.5, "FD");
      eyebrow(d, b.label, bx + 7, y + 11, C.label);
      fc(d, DOMS[b.dom].cor);
      d.circle(bx + 8.4, y + 21.2, 2, "F");
      d.setFont(SERIF, "normal");
      d.setFontSize(b.sec ? 19 : 22);
      tc(d, b.sec ? C.muted : C.white);
      d.text(DOMS[b.dom].nome, bx + 13, y + 23.2);
    });
  }

  footer(d, "Efésios 4:11-13", "@marcelojunior.fiveone");
}

function renderResultado(d: jsPDF, name: string, a: Analysis, scores: Record<DomKey, number>) {
  addPage(d);
  let y = 30;
  eyebrow(d, "Seu perfil em um olhar", M, y);
  y += 8;
  heading(d, "Como os 5 dons se expressam em você", M, y, 20);
  y += 14;
  // radar (esquerda) + barras (direita)
  radar(d, M + 42, y + 42, 34, scores);
  bars(d, a.ranked, M + 96, y + 12, CW - 96);
  y += 96;
  // combinação
  let comboTxt = "";
  if (a.mode === "balanced") {
    comboTxt = "Seus 5 dons aparecem muito próximos — um perfil equilibrado e versátil.";
  } else if (a.primaries.length >= 2) {
    comboTxt = tieText(a.primaries[0], a.primaries[1]);
  } else if (a.secondaries[0]) {
    comboTxt = combinationText(a.primaries[0], a.secondaries[0]);
  } else {
    comboTxt = `Seu dom principal é ${DOMS[a.primaries[0]].nome}.`;
  }
  fc(d, C.panelSoft);
  dc(d, C.line);
  d.setLineWidth(0.2);
  const comboLines = (d.splitTextToSize(comboTxt, CW - 12) as string[]).length;
  const comboH = 12 + comboLines * 5.2;
  d.roundedRect(M, y, CW, comboH, 3, 3, "FD");
  eyebrow(d, "Sua combinação", M + 6, y + 8, C.mint);
  para(d, comboTxt, M + 6, y + 15, CW - 12, 10, C.text, 1.45);
  y += comboH + 8;
  // nota relativa
  dc(d, C.mint);
  d.setLineWidth(0.6);
  d.line(M, y, M, y + 14);
  para(
    d,
    "Os percentuais são relativos entre os 5 dons (somam ~100%). O que mais importa é o seu ranking — a ordem — e a combinação principal + secundário, não o número isolado.",
    M + 4,
    y + 3,
    CW - 4,
    8.5,
    C.muted,
    1.5,
  );
  footer(d, `Perfil Ministerial · ${name}`, "2");
}

function domHeader(d: jsPDF, dom: DomKey, kicker: string, y: number, small = false) {
  const size = small ? 11 : 13;
  domBadge(d, dom, M, y, size);
  eyebrow(d, kicker, M + size + 5, y + 4, C.label);
  heading(d, DOMS[dom].nome, M + size + 5, y + size, small ? 18 : 22);
  return y + size + 6;
}

// Primário: 2 páginas completas
function renderPrimary(d: jsPDF, dom: DomKey, kicker: string, footerName: string, pageStart: number): number {
  const dc0 = DOMS[dom];
  // página 1
  addPage(d);
  let y = 28;
  y = domHeader(d, dom, kicker, y);
  y += 6;
  y = para(d, dc0.essencia, M, y, CW, 10, C.text, 1.55);
  y += 8;
  y = sectionTitle(d, "Características", M, y);
  y = bullets2(d, dc0.caracteristicas.slice(0, 8), M, y, 9, C.mint);
  y += 8;
  y = sectionTitle(d, "Funções principais", M, y);
  y = bullets2(d, dc0.funcoes.slice(0, 6), M, y, 9, C.mint);
  footer(d, `Perfil Ministerial · ${footerName}`, String(pageStart));

  // página 2
  addPage(d);
  y = 28;
  domBadge(d, dom, M, y, 11);
  eyebrow(d, `${dc0.nome} · continuação`, M + 16, y + 4, C.label);
  heading(d, "Cuidados e crescimento", M + 16, y + 15, 18);
  y += 24;
  y = sectionTitle(d, "Pontos cegos", M, y, C.gold);
  y = bullets2(d, dc0.pontosCegos.slice(0, 8), M, y, 9, C.gold);
  y += 8;
  y = sectionTitle(d, "Como desenvolver", M, y);
  d.setFont("helvetica", "normal");
  d.setFontSize(9.2);
  dc0.comoDesenvolver.forEach((it) => {
    tc(d, C.mint);
    d.text("›", M, y);
    y = para(d, it, M + 4, y, CW - 4, 9.2, C.text, 1.4);
    y += 2.5;
  });
  y += 5;
  y = verseBox(d, dc0.versiculo.texto, dc0.versiculo.ref, M, y, CW);
  y += 8;
  y = sectionTitle(d, "Referências bíblicas", M, y);
  bullets2(d, dc0.referencias, M, y, 8.5, C.line, C.muted);
  footer(d, `Perfil Ministerial · ${footerName}`, String(pageStart + 1));
  return pageStart + 2;
}

// Secundário: 1 página condensada
function renderSecondary(d: jsPDF, dom: DomKey, footerName: string, pageNum: number): number {
  const dc0 = DOMS[dom];
  addPage(d);
  let y = 28;
  y = domHeader(d, dom, "Dom secundário", y);
  y += 6;
  y = para(d, dc0.essencia, M, y, CW, 10, C.text, 1.55);
  y += 8;
  y = sectionTitle(d, "Características", M, y);
  y = bullets2(d, dc0.caracteristicas.slice(0, 6), M, y, 9, C.mint);
  y += 8;
  y = sectionTitle(d, "Pontos cegos", M, y, C.gold);
  y = bullets2(d, dc0.pontosCegos.slice(0, 6), M, y, 9, C.gold);
  y += 8;
  verseBox(d, dc0.versiculo.texto, dc0.versiculo.ref, M, y, CW);
  footer(d, `Perfil Ministerial · ${footerName}`, String(pageNum));
  return pageNum + 1;
}

function renderOutras(d: jsPDF, others: DomKey[], scores: Record<DomKey, number>, footerName: string, pageNum: number) {
  addPage(d);
  let y = 30;
  eyebrow(d, "Você carrega um pouco de cada", M, y);
  y += 8;
  heading(d, "Suas outras capacidades", M, y, 20);
  y += 12;
  y = para(
    d,
    'Ninguém é "só" um dom. Estas aparecem em menor intensidade — reconhecê-las ajuda a equilibrar e amadurecer o seu chamado.',
    M,
    y,
    CW,
    9.5,
    C.muted,
    1.5,
  );
  y += 8;
  others.forEach((dom) => {
    const h = 22;
    fc(d, C.panelSoft);
    dc(d, C.line);
    d.setLineWidth(0.2);
    d.roundedRect(M, y, CW, h, 3, 3, "FD");
    domBadge(d, dom, M + 5, y + 5, 12);
    d.setFont(SERIF, "normal");
    d.setFontSize(13);
    tc(d, C.white);
    d.text(`${DOMS[dom].nome} · ${Math.round(scores[dom] || 0)}%`, M + 22, y + 9);
    para(d, DOMS[dom].frase, M + 22, y + 15, CW - 28, 8.6, C.muted, 1.35);
    y += h + 5;
  });
  footer(d, `Perfil Ministerial · ${footerName}`, String(pageNum));
  return pageNum + 1;
}

function renderComparativo(d: jsPDF, footerName: string, pageNum: number) {
  addPage(d);
  let y = 30;
  eyebrow(d, "Efésios 4 · em um olhar", M, y);
  y += 8;
  heading(d, "Os cinco dons lado a lado", M, y, 19);
  y += 12;

  const labelW = 22;
  const gap = 2;
  const colW = (CW - labelW - gap * 5) / 5;
  const rowY = y;
  // cabeçalho colorido
  DOM_ORDER.forEach((k, i) => {
    const x = M + labelW + gap + i * (colW + gap);
    fc(d, DOMS[k].cor);
    d.roundedRect(x, rowY, colW, 9, 1.6, 1.6, "F");
    d.setFont("helvetica", "bold");
    d.setFontSize(7.4);
    tc(d, k === "evangelista" ? ([58, 47, 0] as RGB) : C.navy);
    d.text(DOMS[k].nome, x + colW / 2, rowY + 6, { align: "center" });
  });

  const rows: { label: string; get: (k: DomKey) => string; miss?: boolean }[] = [
    { label: "Vocação", get: (k) => DOMS[k].vocacao },
    { label: "Foco", get: (k) => DOMS[k].foco },
    { label: "Estilo", get: (k) => DOMS[k].estilo },
    { label: "Se falta", get: (k) => DOMS[k].seFalta, miss: true },
  ];
  let ry = rowY + 12;
  const cellH = 12;
  rows.forEach((row) => {
    d.setFont("helvetica", "bold");
    d.setFontSize(7.4);
    tc(d, C.label);
    d.text(row.label.toUpperCase(), M + labelW - 2, ry + cellH / 2 + 1, { align: "right", charSpace: 0.4 });
    DOM_ORDER.forEach((k, i) => {
      const x = M + labelW + gap + i * (colW + gap);
      fc(d, C.panelSoft);
      dc(d, C.line);
      d.setLineWidth(0.15);
      d.roundedRect(x, ry, colW, cellH, 1.6, 1.6, "FD");
      d.setFont("helvetica", "normal");
      d.setFontSize(7.4);
      tc(d, row.miss ? C.gold : C.text);
      const lines = d.splitTextToSize(row.get(k), colW - 3) as string[];
      const lh = 7.4 * 0.352778 * 1.15;
      const startY = ry + cellH / 2 - ((lines.length - 1) * lh) / 2 + 1;
      lines.forEach((ln, li) => d.text(ln, x + colW / 2, startY + li * lh, { align: "center" }));
    });
    ry += cellH + gap;
  });

  ry += 6;
  fc(d, blend(C.gold, C.navy, 0.08));
  dc(d, blend(C.gold, C.navy, 0.3));
  d.setLineWidth(0.2);
  const noteLines = d.splitTextToSize(
    "Por que os cinco: cada dom é uma dimensão do próprio ministério de Cristo. Juntos — não isolados — edificam um corpo maduro, missionário e saudável.",
    CW - 12,
  ) as string[];
  const noteH = 10 + noteLines.length * 4.6;
  d.roundedRect(M, ry, CW, noteH, 3, 3, "FD");
  para(
    d,
    "Por que os cinco: cada dom é uma dimensão do próprio ministério de Cristo. Juntos — não isolados — edificam um corpo maduro, missionário e saudável.",
    M + 6,
    ry + 6,
    CW - 12,
    8.6,
    C.muted,
    1.4,
  );
  footer(d, `Perfil Ministerial · ${footerName}`, String(pageNum));
  return pageNum + 1;
}

function renderPlano(d: jsPDF, primaryName: string, footerName: string, pageNum: number) {
  addPage(d);
  let y = 30;
  eyebrow(d, "Do resultado à prática", M, y);
  y += 8;
  heading(d, "Seu plano de 30 dias", M, y, 20);
  y += 14;
  PLANO_30.forEach((w, i) => {
    if (i > 0) {
      dc(d, C.line);
      d.setLineWidth(0.2);
      d.line(M, y - 4, PAGE.w - M, y - 4);
    }
    d.setFont(SERIF, "normal");
    d.setFontSize(11);
    tc(d, C.mint);
    d.text(w.semana, M, y + 1);
    d.setFont(SERIF, "normal");
    d.setFontSize(11.5);
    tc(d, C.white);
    d.text(w.titulo, M + 30, y + 1);
    para(d, w.texto.replace("{DOM}", primaryName), M + 30, y + 7, CW - 30, 9.2, C.muted, 1.4);
    y += 22;
  });
  y += 2;
  verseBox(d, "Cada um exerça o dom que recebeu para servir aos outros.", "1 Pedro 4:10", M, y, CW);
  footer(d, `Perfil Ministerial · ${footerName}`, String(pageNum));
  return pageNum + 1;
}

function renderInstagram(d: jsPDF) {
  addPage(d);
  // topo
  d.setFont(SERIF, "normal");
  d.setFontSize(12);
  tc(d, C.white);
  d.text("Five One", M, 24);
  d.setFont("helvetica", "bold");
  d.setFontSize(7.6);
  tc(d, C.mint);
  d.text("VAMOS JUNTOS", PAGE.w - M, 23, { align: "right", charSpace: 0.7 });

  fc(d, blend(C.mint, C.navy, 0.05));
  d.circle(175, 55, 45, "F");

  let y = 110;
  // badge instagram
  fc(d, [214, 41, 118]);
  d.roundedRect(M, y, 22, 22, 6, 6, "F");
  dc(d, C.white);
  d.setLineWidth(1);
  d.roundedRect(M + 5.5, y + 5.5, 11, 11, 3, 3, "S");
  d.circle(M + 11, y + 11, 3, "S");
  fc(d, C.white);
  d.circle(M + 15, y + 6.5, 0.9, "F");
  y += 34;

  heading(d, "Continue comigo", M, y, 26);
  y += 12;
  y = para(
    d,
    "Toda semana eu compartilho Bíblia, teologia e cultura à luz do Evangelho — e conteúdos pra você desenvolver o seu chamado.",
    M,
    y,
    120,
    10.5,
    C.muted,
    1.55,
  );
  y += 10;
  d.setFont(SERIF, "normal");
  d.setFontSize(20);
  tc(d, C.mint);
  d.text("@marcelojunior.fiveone", M, y);
  y += 8;
  d.setFont("helvetica", "normal");
  d.setFontSize(9.5);
  tc(d, C.muted);
  d.text("e também: @fiveone.oficial", M, y);
  y += 6;
  tc(d, C.label);
  d.setFontSize(8.6);
  d.text("Teólogo · Dom de Mestre (Ef 4)", M, y);
  y += 14;
  // pílula
  fc(d, C.mint);
  d.roundedRect(M, y, 62, 11, 5.5, 5.5, "F");
  d.setFont("helvetica", "bold");
  d.setFontSize(9.5);
  tc(d, [5, 46, 22]);
  d.text("Seguir no Instagram", M + 31, y + 7, { align: "center" });
  y += 20;
  dc(d, C.mint);
  d.setLineWidth(0.6);
  d.line(M, y, M, y + 10);
  para(d, "Me marca contando qual foi o seu dom — vou adorar ver!", M + 4, y + 3, CW - 4, 9, C.muted, 1.4);

  footer(d, "Five One · Movimento dos 5 Ministérios", "@marcelojunior.fiveone");
}

// ── Entry point ─────────────────────────────────────────────────────────────────
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export interface MinisterialPdfResult {
  base64: string;
  filename: string;
}

export async function generateMinisterialPdf(
  name: string,
  dateStr: string,
  scores: Record<string, number>,
  download = true,
): Promise<MinisterialPdfResult> {
  const s = DOM_ORDER.reduce((acc, k) => {
    acc[k] = Number(scores[k] ?? 0);
    return acc;
  }, {} as Record<DomKey, number>);

  const a = analyze(s);
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });

  // registra a Fraunces (display + italic)
  doc.addFileToVFS("Fraunces.ttf", FRAUNCES_DISPLAY);
  doc.addFont("Fraunces.ttf", SERIF, "normal");
  doc.addFileToVFS("Fraunces-Italic.ttf", FRAUNCES_ITALIC);
  doc.addFont("Fraunces-Italic.ttf", SERIF, "italic");

  renderCover(doc, name || "Participante", dateStr, a);
  renderResultado(doc, name || "Participante", a, s);

  let page = 3;
  if (a.mode === "balanced") {
    // sem aprofundamento por dom; foco no comparativo
  } else {
    const coPrincipal = a.primaries.length >= 2;
    a.primaries.forEach((dom) => {
      const kicker = coPrincipal ? "Dom principal (empate)" : "Dom principal";
      page = renderPrimary(doc, dom, kicker, name || "Participante", page);
    });
    a.secondaries.forEach((dom) => {
      page = renderSecondary(doc, dom, name || "Participante", page);
    });
  }
  if (a.others.length > 0) {
    page = renderOutras(doc, a.others, s, name || "Participante", page);
  }
  page = renderComparativo(doc, name || "Participante", page);
  const primaryName = DOMS[a.primaries[0]].nome;
  page = renderPlano(doc, primaryName, name || "Participante", page);
  renderInstagram(doc);

  const filename = `Perfil_Ministerial_${(name || "Participante")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")}.pdf`;

  const base64 = arrayBufferToBase64(doc.output("arraybuffer") as ArrayBuffer);
  if (download) doc.save(filename);
  return { base64, filename };
}
