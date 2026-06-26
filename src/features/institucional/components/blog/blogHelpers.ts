/**
 * Helpers de leitura e processamento de markdown.
 */

const WORDS_PER_MINUTE = 200;

/**
 * Estimativa de tempo de leitura em minutos (mínimo 1).
 */
export function calculateReadingTime(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, "") // remove code blocks
    .replace(/`[^`]+`/g, "")
    .replace(/[#*_>!\[\]()]/g, " ")
    .trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

const SITE_ORIGIN = "https://fiveonemovement.com";

/**
 * Monta a URL de compartilhamento de um post, anexando um token de versão
 * derivado de `updatedAt`.
 *
 * Por que: WhatsApp/Facebook (Meta) cacheiam o card de preview por URL EXATA,
 * por ~7 dias. Uma vez que um link foi compartilhado, eles continuam exibindo
 * a imagem/título antigos mesmo depois de você editar o post — daí o sintoma
 * de "troquei a capa e o WhatsApp ainda mostra a antiga".
 *
 * Solução: versionar a URL com a data de atualização. Ao trocar a capa (ou
 * qualquer edição), `updated_at` muda → o token muda → vira uma URL nova que o
 * WhatsApp nunca viu → ele busca o card do zero e mostra a imagem/título atuais.
 * Sem edição, o token é o mesmo e a URL permanece estável (não fragmenta cache
 * à toa). O og:url canônico continua limpo; o token só afeta a chave de cache.
 */
export function buildShareUrl(slug: string, updatedAt?: string | null): string {
  const base = `${SITE_ORIGIN}/para-ler/${slug}`;
  if (!updatedAt) return base;
  const t = Date.parse(updatedAt);
  if (Number.isNaN(t)) return base;
  // Token compacto: minutos desde epoch em base36. Muda só quando o post muda.
  const token = Math.floor(t / 60000).toString(36);
  return `${base}?v=${token}`;
}

/**
 * Slugify de heading pra ancorar no HTML.
 */
export function headingSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

/**
 * Pré-processa markdown:
 *  - Linhas iniciando com `> !` viram pull-quotes (custom container)
 *  - Mantém o resto intacto
 *
 * Sintaxe:
 *    >! Texto da citação grande
 * Vira:
 *    <aside class="pull-quote">Texto da citação grande</aside>
 */
export function preprocessMarkdown(md: string): string {
  // Pull quotes: substitui linhas '>! conteúdo' por HTML inline (marked deixa HTML passar)
  const out = md
    .split(/\r?\n/)
    .map((line) => {
      const m = line.match(/^>\s*!\s*(.+)$/);
      if (m) {
        return `<aside class="pull-quote">${escapeForHtml(m[1].trim())}</aside>`;
      }
      return line;
    })
    .join("\n");
  return out;
}

function escapeForHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Extrai headings (H2/H3) de markdown para construir TOC.
 */
export type TocItem = { level: 2 | 3; text: string; slug: string };

export function extractToc(md: string): TocItem[] {
  const lines = md.split(/\r?\n/);
  const items: TocItem[] = [];
  let inCode = false;
  for (const line of lines) {
    if (line.startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (!m) continue;
    const level = m[1].length === 2 ? 2 : 3;
    const text = m[2].replace(/[*_`]/g, "").trim();
    if (!text) continue;
    items.push({ level, text, slug: headingSlug(text) });
  }
  return items;
}
