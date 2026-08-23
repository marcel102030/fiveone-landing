import jsPDF from "jspdf";
import {
  DOMS,
  DOM_ORDER,
  DomKey,
  combinationRich,
  comboSignificados,
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

// lista com marcador "›" (fluxo), retorna y final
function flowList(
  d: jsPDF,
  items: string[],
  x: number,
  y: number,
  w: number,
  size = 9.2,
  color: RGB = C.text,
): number {
  items.forEach((it) => {
    d.setFont("helvetica", "bold");
    d.setFontSize(size);
    tc(d, C.mint);
    d.text("›", x, y);
    y = para(d, it, x + 4.5, y, w - 4.5, size, color, 1.4);
    y += 2.8;
  });
  return y;
}

// chips (pílulas), retorna y final
function chips(d: jsPDF, items: string[], x: number, y: number, w: number): number {
  d.setFont("helvetica", "normal");
  d.setFontSize(8.6);
  const padX = 4;
  const gap = 2.6;
  const h = 7.4;
  let cx = x;
  let cy = y;
  items.forEach((it) => {
    const cw = d.getTextWidth(it) + padX * 2;
    if (cx + cw > x + w) {
      cx = x;
      cy += h + gap;
    }
    fc(d, C.panelSoft);
    dc(d, C.line);
    d.setLineWidth(0.2);
    d.roundedRect(cx, cy, cw, h, 3.7, 3.7, "FD");
    tc(d, C.text);
    d.text(it, cx + padX, cy + 5);
    cx += cw + gap;
  });
  return cy + h;
}

// imaturo × maduro — duas caixas lado a lado, retorna y final
function matBox(d: jsPDF, imaturo: string, maduro: string, x: number, y: number, w: number): number {
  const gap = 6;
  const bw = (w - gap) / 2;
  const items = [
    { h: "Quando imaturo", txt: imaturo, col: C.gold },
    { h: "Quando maduro", txt: maduro, col: C.mint },
  ];
  const size = 8.6;
  const step = size * 0.352778 * 1.4;
  let maxLines = 1;
  d.setFont("helvetica", "normal");
  d.setFontSize(size);
  items.forEach((it) => {
    maxLines = Math.max(maxLines, (d.splitTextToSize(it.txt, bw - 10) as string[]).length);
  });
  const boxH = 12 + maxLines * step + 3;
  items.forEach((it, i) => {
    const bx = x + i * (bw + gap);
    fc(d, blend(it.col, C.navy, 0.05));
    dc(d, blend(it.col, C.navy, 0.32));
    d.setLineWidth(0.2);
    d.roundedRect(bx, y, bw, boxH, 2.5, 2.5, "FD");
    d.setFont("helvetica", "bold");
    d.setFontSize(7.2);
    tc(d, it.col);
    d.text(it.h.toUpperCase(), bx + 5, y + 7, { charSpace: 0.5 });
    para(d, it.txt, bx + 5, y + 13, bw - 10, size, C.muted, 1.4);
  });
  return y + boxH;
}

// duas listas tituladas lado a lado, retorna y final
function twoLists(
  d: jsPDF,
  lt: string,
  li: string[],
  ltCol: RGB,
  rt: string,
  ri: string[],
  rtCol: RGB,
  x: number,
  y: number,
  w: number,
): number {
  const gap = 8;
  const colW = (w - gap) / 2;
  const cols = [
    { t: lt, items: li, col: ltCol },
    { t: rt, items: ri, col: rtCol },
  ];
  const size = 9;
  const step = size * 0.352778 * 1.32;
  let maxY = y;
  cols.forEach((c, ci) => {
    const cx = x + ci * (colW + gap);
    d.setFont("helvetica", "bold");
    d.setFontSize(7.6);
    tc(d, c.col);
    d.text(c.t.toUpperCase(), cx, y, { charSpace: 0.6 });
    let cy = y + 6.5;
    c.items.forEach((it) => {
      fc(d, c.col);
      d.circle(cx + 0.9, cy - 0.9, 0.8, "F");
      d.setFont("helvetica", "normal");
      d.setFontSize(size);
      tc(d, C.text);
      const lines = d.splitTextToSize(it, colW - 4) as string[];
      lines.forEach((ln, k) => d.text(ln, cx + 3.4, cy + k * step));
      cy += Math.max(lines.length, 1) * step + 1.8;
    });
    maxY = Math.max(maxY, cy);
  });
  return maxY;
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
  const total = Math.max(1, ranked.reduce((s, r) => s + Math.max(0, r.score), 0));
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
    // percentual RELATIVO entre os 5 dons (soma ~100%), não o score bruto
    const pct = Math.round((Math.max(0, r.score) / total) * 100);
    d.text(`${pct}%`, x + w, ry, { align: "right" });
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
  // Empates são definidos pelo PERCENTUAL ARREDONDADO (o número que a pessoa vê),
  // não pelo score cru — assim 20%/20% no display = empate de verdade no PDF.
  const total = Math.max(1, ranked.reduce((s, r) => s + Math.max(0, r.score), 0));
  const pctOf = (v: number) => Math.round((Math.max(0, v) / total) * 100);
  const withPct = ranked.map((r) => ({ ...r, pct: pctOf(r.score) }));

  const p1 = withPct[0].pct;
  const primaries = withPct.filter((r) => r.pct === p1).map((r) => r.dom);

  let mode: Analysis["mode"] = "normal";
  let secondaries: DomKey[] = [];
  if (primaries.length >= 4) {
    mode = "balanced";
  } else {
    mode = primaries.length === 1 ? "normal" : primaries.length === 2 ? "tie2" : "tie3";
    // secundário(s): próximo grupo de mesmo percentual (só quando há 1 ou 2 principais)
    if (primaries.length <= 2) {
      const rest = withPct.filter((r) => r.pct < p1);
      const p2 = rest.length ? rest[0].pct : -1;
      if (p2 > 0) secondaries = rest.filter((r) => r.pct === p2).map((r) => r.dom);
    }
  }
  const used = new Set<DomKey>([...primaries, ...secondaries]);
  const others = withPct.filter((r) => !used.has(r.dom)).map((r) => r.dom);
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
    // todas as caixas: principais + secundários (cobre empates de qualquer tamanho)
    const boxes: { label: string; dom: DomKey; sec: boolean }[] = [];
    a.primaries.forEach((dm) => boxes.push({ label: "Dom principal", dom: dm, sec: false }));
    a.secondaries.forEach((dm) => boxes.push({ label: "Dom secundário", dom: dm, sec: true }));

    const cols = boxes.length === 1 ? 1 : 2;
    const rows = Math.ceil(boxes.length / cols);
    const gap = 6;
    const vgap = 6;
    const h = rows >= 3 ? 22 : rows === 2 ? 26 : 30;
    const bw = cols === 1 ? CW : (CW - gap) / 2; // largura fixa (grade consistente)
    boxes.forEach((b, idx) => {
      const r = Math.floor(idx / cols);
      const col = idx % cols;
      const bx = M + col * (bw + gap);
      const by = y + r * (h + vgap);
      fc(d, C.panelSoft);
      dc(d, C.line);
      d.setLineWidth(0.2);
      d.roundedRect(bx, by, bw, h, 3.5, 3.5, "FD");
      eyebrow(d, b.label, bx + 7, by + h * 0.33, C.label);
      const nameFs = b.sec ? (h >= 26 ? 19 : 16) : h >= 26 ? 22 : 18;
      fc(d, DOMS[b.dom].cor);
      d.circle(bx + 8.4, by + h * 0.68, 2, "F");
      d.setFont(SERIF, "normal");
      d.setFontSize(nameFs);
      tc(d, b.sec ? C.muted : C.white);
      d.text(DOMS[b.dom].nome, bx + 13, by + h * 0.73 + 2);
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
  // combinação (texto mais completo) — cobre todos os empates
  const nameList = (doms: DomKey[]): string => {
    const ns = doms.map((dm) => DOMS[dm].nome);
    if (ns.length <= 1) return ns[0] ?? "";
    return `${ns.slice(0, -1).join(", ")} e ${ns[ns.length - 1]}`;
  };
  let comboTxt = "";
  let significados: string[] = [];
  if (a.mode === "balanced") {
    comboTxt =
      "Seus 5 dons aparecem muito próximos — um perfil equilibrado e versátil. Em vez de um chamado único e evidente, você transita por várias funções; explore o comparativo e observe onde mais se reconhece no dia a dia.";
  } else if (a.primaries.length >= 2) {
    const secTxt = a.secondaries.length
      ? ` Logo atrás vem ${nameList(a.secondaries)}${a.secondaries.length > 1 ? " (também empatados)" : ""}.`
      : "";
    comboTxt = `Empate técnico entre ${nameList(a.primaries)} — ${a.primaries.length} dons operando com força muito parecida em você. Nenhum é "o" principal sozinho; cada um é aprofundado nas próximas páginas.${secTxt}`;
    significados = [
      `Seus dons em destaque (${nameList(a.primaries)}) mostram por onde você mais serve e floresce — em equilíbrio.`,
      "Empate não é indefinição: é a marca de quem combina funções. Leia cada dom e veja como se somam.",
      "O ranking importa mais que os números: observe a ordem e como esses dons aparecem no seu dia a dia.",
    ];
  } else if (a.secondaries.length >= 2) {
    comboTxt = `${DOMS[a.primaries[0]].nome} é o seu dom principal, com ${nameList(a.secondaries)} empatados logo atrás. Na prática, você une ${DOMS[a.primaries[0]].contribuicao} a mais de uma força de apoio — um perfil versátil, que se expressa de formas diferentes conforme o contexto.`;
    significados = [
      `Seu dom principal (${DOMS[a.primaries[0]].nome}) mostra por onde você mais naturalmente serve e floresce.`,
      `Seus dons secundários (${nameList(a.secondaries)}) empataram — ambos temperam o principal e ampliam o seu alcance.`,
      "O ranking importa mais que os números: é a ordem que revela o seu jeito de servir.",
    ];
  } else if (a.secondaries.length === 1) {
    comboTxt = combinationRich(a.primaries[0], a.secondaries[0]);
    significados = comboSignificados(a.primaries[0], a.secondaries[0]);
  } else {
    comboTxt = `Seu dom principal é ${DOMS[a.primaries[0]].nome}. ${DOMS[a.primaries[0]].frase}`;
    significados = comboSignificados(a.primaries[0]);
  }
  fc(d, C.panelSoft);
  dc(d, C.line);
  d.setLineWidth(0.2);
  const comboLines = (d.splitTextToSize(comboTxt, CW - 14) as string[]).length;
  const comboH = 13 + comboLines * 5.1;
  d.roundedRect(M, y, CW, comboH, 3, 3, "FD");
  eyebrow(d, "Sua combinação", M + 7, y + 9, C.mint);
  para(d, comboTxt, M + 7, y + 16, CW - 14, 9.6, C.text, 1.45);
  y += comboH + 10;
  // o que isso significa
  if (significados.length) {
    y = sectionTitle(d, "O que isso significa", M, y);
    y += 2;
    y = flowList(d, significados, M, y, CW, 9);
    y += 8;
  }
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
  // ── página 1: essência · forças e pontos cegos · palavras · na prática ──
  addPage(d);
  let y = 28;
  y = domHeader(d, dom, kicker, y);
  y += 7;
  y = para(d, dc0.essencia, M, y, CW, 10, C.text, 1.55);
  y += 10;
  y = twoLists(
    d,
    "Características",
    dc0.caracteristicas.slice(0, 6),
    C.mint,
    "Pontos cegos",
    dc0.pontosCegos.slice(0, 6),
    C.gold,
    M,
    y,
    CW,
  );
  y += 11;
  y = sectionTitle(d, "Palavras-chave", M, y);
  y += 2;
  y = chips(d, dc0.palavras, M, y, CW);
  y += 12;
  y = sectionTitle(d, "Como se manifesta no dia a dia", M, y);
  y += 2;
  flowList(d, dc0.naPratica, M, y, CW);
  footer(d, `Perfil Ministerial · ${footerName}`, String(pageStart));

  // ── página 2: maturidade · funções · como desenvolver · versículo ──
  addPage(d);
  y = 28;
  domBadge(d, dom, M, y, 11);
  eyebrow(d, `${dc0.nome} · continuação`, M + 16, y + 4, C.label);
  heading(d, "Cuidados e crescimento", M + 16, y + 15, 18);
  y += 26;
  y = sectionTitle(d, "Imaturo × Maduro", M, y, C.gold);
  y += 2;
  y = matBox(d, dc0.imaturo, dc0.maduro, M, y, CW);
  y += 12;
  y = sectionTitle(d, "Funções principais", M, y);
  y = bullets2(d, dc0.funcoes.slice(0, 6), M, y, 9, C.mint);
  y += 11;
  y = sectionTitle(d, "Como desenvolver", M, y);
  y += 2;
  y = flowList(d, dc0.comoDesenvolver, M, y, CW);
  y += 8;
  verseBox(d, dc0.versiculo.texto, dc0.versiculo.ref, M, y, CW);
  footer(d, `Perfil Ministerial · ${footerName}`, String(pageStart + 1));
  return pageStart + 2;
}

// Secundário: 1 página completa
function renderSecondary(d: jsPDF, dom: DomKey, footerName: string, pageNum: number, coSec = false): number {
  const dc0 = DOMS[dom];
  addPage(d);
  let y = 28;
  y = domHeader(d, dom, coSec ? "Dom secundário (empate)" : "Dom secundário", y);
  y += 7;
  y = para(d, dc0.essencia, M, y, CW, 10, C.text, 1.55);
  y += 10;
  y = twoLists(
    d,
    "Características",
    dc0.caracteristicas.slice(0, 6),
    C.mint,
    "Pontos cegos",
    dc0.pontosCegos.slice(0, 6),
    C.gold,
    M,
    y,
    CW,
  );
  y += 11;
  y = sectionTitle(d, "Imaturo × Maduro", M, y, C.gold);
  y += 2;
  y = matBox(d, dc0.imaturo, dc0.maduro, M, y, CW);
  y += 10;
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
  y += 10;
  // percentual relativo entre os 5 dons (mesma base das barras da pág. 2)
  const total = Math.max(1, DOM_ORDER.reduce((s, k) => s + Math.max(0, scores[k] || 0), 0));
  const txtX = M + 26;
  const txtW = CW - 32;
  others.forEach((dom) => {
    d.setFont("helvetica", "normal");
    d.setFontSize(8.8);
    const lines = (d.splitTextToSize(DOMS[dom].resumoOutro, txtW) as string[]).length;
    const step = 8.8 * 0.352778 * 1.4;
    const h = 17 + lines * step + 8;
    fc(d, C.panelSoft);
    dc(d, C.line);
    d.setLineWidth(0.2);
    d.roundedRect(M, y, CW, h, 3, 3, "FD");
    domBadge(d, dom, M + 6, y + 6, 13);
    d.setFont(SERIF, "normal");
    d.setFontSize(14);
    tc(d, C.white);
    const pct = Math.round((Math.max(0, scores[dom] || 0) / total) * 100);
    d.text(`${DOMS[dom].nome} · ${pct}%`, txtX, y + 11);
    const endY = para(d, DOMS[dom].resumoOutro, txtX, y + 17, txtW, 8.8, C.muted, 1.4);
    d.setFont("helvetica", "bold");
    d.setFontSize(6.8);
    tc(d, blend(DOMS[dom].cor, C.navy, 0.8));
    d.text(DOMS[dom].palavras.slice(0, 4).join("   ·   ").toUpperCase(), txtX, endY + 3.5, { charSpace: 0.3 });
    y += h + 8;
  });
  // nota de fecho
  y += 1;
  const cl =
    "Estas capacidades não são fraquezas — são parte do time que Deus colocou em você. Desenvolva o seu dom principal sem ignorar as outras.";
  fc(d, blend(C.mint, C.navy, 0.05));
  dc(d, C.line);
  d.setLineWidth(0.2);
  const clLines = (d.splitTextToSize(cl, CW - 12) as string[]).length;
  const clH = 10 + clLines * 4.8;
  d.roundedRect(M, y, CW, clH, 3, 3, "FD");
  para(d, cl, M + 6, y + 7, CW - 12, 8.8, C.text, 1.45);
  footer(d, `Perfil Ministerial · ${footerName}`, String(pageNum));
  return pageNum + 1;
}

function renderComparativo(d: jsPDF, footerName: string, pageNum: number, highlight?: DomKey) {
  addPage(d);
  let y = 30;
  eyebrow(d, "Efésios 4 · em um olhar", M, y);
  y += 8;
  heading(d, "Os cinco dons lado a lado", M, y, 19);
  y += 8;
  y = para(
    d,
    "Cada dom pensa, foca e contribui de um jeito. Compare as cinco funções — a sua coluna está destacada.",
    M,
    y,
    CW,
    9,
    C.muted,
    1.45,
  );
  y += 8;

  const labelW = 20;
  const gap = 2.4;
  const colW = (CW - labelW - gap * 5) / 5;
  const rowY = y;
  const colX = (i: number) => M + labelW + gap + i * (colW + gap);
  // cabeçalho colorido
  DOM_ORDER.forEach((k, i) => {
    const x = colX(i);
    fc(d, DOMS[k].cor);
    d.roundedRect(x, rowY, colW, 11, 1.8, 1.8, "F");
    d.setFont("helvetica", "bold");
    d.setFontSize(7.2);
    tc(d, k === "evangelista" ? ([58, 47, 0] as RGB) : C.navy);
    d.text(DOMS[k].nome, x + colW / 2, rowY + 7, { align: "center" });
  });

  const rows: { label: string; get: (k: DomKey) => string; miss?: boolean }[] = [
    { label: "Vocação", get: (k) => DOMS[k].vocacao },
    { label: "Foco", get: (k) => DOMS[k].foco },
    { label: "Pergunta", get: (k) => DOMS[k].perguntaChave },
    { label: "Estilo", get: (k) => DOMS[k].estilo },
    { label: "Traz", get: (k) => DOMS[k].contribuicaoCurta },
    { label: "Se falta", get: (k) => DOMS[k].seFalta, miss: true },
  ];
  let ry = rowY + 14;
  const cellH = 14;
  rows.forEach((row) => {
    d.setFont("helvetica", "bold");
    d.setFontSize(7);
    tc(d, C.label);
    d.text(row.label.toUpperCase(), M + labelW - 2, ry + cellH / 2 + 1, { align: "right", charSpace: 0.3 });
    DOM_ORDER.forEach((k, i) => {
      const x = colX(i);
      const on = k === highlight;
      fc(d, on ? blend(DOMS[k].cor, C.navy, 0.12) : C.panelSoft);
      dc(d, C.line);
      d.setLineWidth(0.15);
      d.roundedRect(x, ry, colW, cellH, 1.6, 1.6, "FD");
      d.setFont("helvetica", on ? "bold" : "normal");
      d.setFontSize(7.2);
      tc(d, row.miss ? C.gold : on ? C.white : C.text);
      const lines = d.splitTextToSize(row.get(k), colW - 3) as string[];
      const lh = 7.2 * 0.352778 * 1.12;
      const startY = ry + cellH / 2 - ((lines.length - 1) * lh) / 2 + 1;
      lines.forEach((ln, li) => d.text(ln, x + colW / 2, startY + li * lh, { align: "center" }));
    });
    ry += cellH + gap;
  });

  // moldura de destaque na coluna do dom da pessoa
  if (highlight) {
    const i = DOM_ORDER.indexOf(highlight);
    if (i >= 0) {
      const x = colX(i);
      dc(d, DOMS[highlight].cor);
      d.setLineWidth(0.7);
      d.roundedRect(x - 0.8, rowY - 0.8, colW + 1.6, ry - gap - rowY + 1.6, 2.2, 2.2, "S");
      d.setFont("helvetica", "bold");
      d.setFontSize(6.4);
      tc(d, DOMS[highlight].cor);
      d.text("SEU DOM", x + colW / 2, ry + 2.5, { align: "center", charSpace: 0.4 });
    }
  }

  ry += highlight ? 8 : 6;
  const note =
    "Por que os cinco: cada dom é uma dimensão do próprio ministério de Cristo. Nenhum é melhor que o outro — juntos, e não isolados, edificam um corpo maduro, missionário e saudável. Onde você é forte, sirva; onde é fraco, cerque-se de quem completa.";
  fc(d, blend(C.gold, C.navy, 0.08));
  dc(d, blend(C.gold, C.navy, 0.3));
  d.setLineWidth(0.2);
  const noteLines = (d.splitTextToSize(note, CW - 12) as string[]).length;
  const noteH = 10 + noteLines * 4.7;
  d.roundedRect(M, ry, CW, noteH, 3, 3, "FD");
  para(d, note, M + 6, ry + 6.5, CW - 12, 8.7, C.text, 1.45);
  footer(d, `Perfil Ministerial · ${footerName}`, String(pageNum));
  return pageNum + 1;
}

function renderPlano(d: jsPDF, primaryName: string, footerName: string, pageNum: number) {
  addPage(d);
  let y = 30;
  eyebrow(d, "Do resultado à prática", M, y);
  y += 8;
  heading(d, "Seu plano de 30 dias", M, y, 20);
  y += 8;
  y = para(
    d,
    "Quatro semanas para transformar o seu resultado em prática. Um passo de cada vez — chamado se desenvolve com constância, não com pressa.",
    M,
    y,
    CW,
    9,
    C.muted,
    1.45,
  );
  y += 10;
  const colX = M + 32;
  const colW = CW - 32;
  PLANO_30.forEach((w, i) => {
    if (i > 0) {
      dc(d, C.line);
      d.setLineWidth(0.2);
      d.line(M, y - 6, PAGE.w - M, y - 6);
    }
    d.setFont(SERIF, "normal");
    d.setFontSize(11.5);
    tc(d, C.mint);
    d.text(w.semana, M, y + 1);
    d.setFont(SERIF, "normal");
    d.setFontSize(13);
    tc(d, C.white);
    d.text(w.titulo, colX, y + 1);
    let ty = para(d, w.texto.replace("{DOM}", primaryName), colX, y + 8, colW, 9.2, C.muted, 1.45);
    ty += 2;
    ty = para(d, w.passo, colX, ty, colW, 8.4, C.mint, 1.4, ["helvetica", "bold"]);
    y = ty + 9;
  });
  y += 1;
  verseBox(d, "Cada um exerça o dom que recebeu para servir aos outros.", "1 Pedro 4:10", M, y, CW);
  footer(d, `Perfil Ministerial · ${footerName}`, String(pageNum));
  return pageNum + 1;
}

function renderInstagram(d: jsPDF) {
  addPage(d);
  // brilho ambiente (antes do texto, igual à capa)
  softGlow(d, 174, 34, 92, 0.08);
  // topo
  d.setFont(SERIF, "normal");
  d.setFontSize(15);
  tc(d, C.white);
  d.text("Five One", M, 26);
  d.setFont("helvetica", "bold");
  d.setFontSize(7.6);
  tc(d, C.mint);
  d.text("VAMOS JUNTOS", PAGE.w - M, 25, { align: "right", charSpace: 0.7 });

  let y = 66;
  // badge instagram
  fc(d, [214, 41, 118]);
  d.roundedRect(M, y, 22, 22, 6, 6, "F");
  dc(d, C.white);
  d.setLineWidth(1);
  d.roundedRect(M + 5.5, y + 5.5, 11, 11, 3, 3, "S");
  d.circle(M + 11, y + 11, 3, "S");
  fc(d, C.white);
  d.circle(M + 15, y + 6.5, 0.9, "F");
  y += 33;

  heading(d, "Continue comigo", M, y, 27);
  y += 12;
  y = para(
    d,
    "Você descobriu o seu dom — agora vem a caminhada. Toda semana eu compartilho conteúdo pra te ajudar a desenvolver o seu chamado e viver a fé com profundidade.",
    M,
    y,
    128,
    10.5,
    C.muted,
    1.55,
  );
  y += 13;
  // o que você encontra
  y = sectionTitle(d, "O que você encontra por lá", M, y);
  y += 3;
  y = flowList(
    d,
    [
      "Estudos de Bíblia e teologia que cabem no seu dia",
      "Cultura e atualidade lidas à luz do Evangelho",
      "Ferramentas práticas para você exercer o seu dom",
    ],
    M,
    y,
    CW,
    9.6,
  );
  y += 15;
  // handles
  d.setFont(SERIF, "normal");
  d.setFontSize(22);
  tc(d, C.mint);
  d.text("@marcelojunior.fiveone", M, y);
  y += 8;
  d.setFont("helvetica", "normal");
  d.setFontSize(9.5);
  tc(d, C.muted);
  d.text("e também: @fiveone.oficial  ·  Teólogo · Dom de Mestre (Ef 4)", M, y);
  y += 15;
  // pílulas
  fc(d, C.mint);
  d.roundedRect(M, y, 64, 12, 6, 6, "F");
  d.setFont("helvetica", "bold");
  d.setFontSize(9.5);
  tc(d, [5, 46, 22]);
  d.text("Seguir no Instagram", M + 32, y + 7.6, { align: "center" });
  dc(d, C.line);
  d.setLineWidth(0.3);
  fc(d, C.panelSoft);
  d.roundedRect(M + 70, y, 58, 12, 6, 6, "FD");
  d.setFont("helvetica", "normal");
  tc(d, C.text);
  d.text("fiveonemovement.com", M + 70 + 29, y + 7.6, { align: "center" });
  y += 22;
  dc(d, C.mint);
  d.setLineWidth(0.6);
  d.line(M, y, M, y + 11);
  para(
    d,
    "Me marca nos stories contando qual foi o seu dom — vou adorar ver e caminhar com você nessa jornada!",
    M + 4,
    y + 3,
    CW - 4,
    9,
    C.muted,
    1.4,
  );

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
    const coSec = a.secondaries.length >= 2;
    a.secondaries.forEach((dom) => {
      page = renderSecondary(doc, dom, name || "Participante", page, coSec);
    });
  }
  if (a.others.length > 0) {
    page = renderOutras(doc, a.others, s, name || "Participante", page);
  }
  const highlightDom = a.mode === "balanced" ? undefined : a.primaries[0];
  page = renderComparativo(doc, name || "Participante", page, highlightDom);
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
