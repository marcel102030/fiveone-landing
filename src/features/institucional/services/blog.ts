import { supabase } from "../../../shared/lib/supabaseClient";

// ── Categorias fixas ─────────────────────────────────────────
export const BLOG_CATEGORIES = [
  "Teologia",
  "Vida Cristã",
  "Igreja & Ministério",
  "5 Ministérios",
  "Apologética",
  "Cultura & Sociedade",
] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export type BlogPostStatus = "draft" | "published";
export type BlogCommentStatus = "pending" | "approved" | "rejected";

// ── Tipos ────────────────────────────────────────────────────
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  cover_url: string | null;
  content_markdown: string;
  author_name: string;
  category: string;
  tags: string[];
  takeaways: string[];
  status: BlogPostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type BlogPostInput = Omit<BlogPost, "id" | "created_at" | "updated_at">;

export interface BlogComment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string | null;
  content: string;
  status: BlogCommentStatus;
  created_at: string;
  updated_at: string;
}

// ── Listagem pública ─────────────────────────────────────────

export async function listPublishedPosts(opts?: {
  category?: BlogCategory | string;
  limit?: number;
  offset?: number;
}): Promise<BlogPost[]> {
  let q = supabase
    .from("platform_blog_post")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (opts?.category) q = q.eq("category", opts.category);
  if (opts?.limit) q = q.limit(opts.limit);
  if (opts?.offset !== undefined && opts?.limit) {
    q = q.range(opts.offset, opts.offset + opts.limit - 1);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as BlogPost[];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("platform_blog_post")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return (data as BlogPost) || null;
}

export async function listRelatedPosts(
  postId: string,
  category: string,
  limit = 3,
): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("platform_blog_post")
    .select("*")
    .eq("status", "published")
    .eq("category", category)
    .neq("id", postId)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as BlogPost[];
}

/**
 * Posts da mesma categoria excluindo IDs passados.
 */
export async function listPostsFromCategory(
  category: string,
  excludeIds: string[],
  limit = 3,
): Promise<BlogPost[]> {
  let q = supabase
    .from("platform_blog_post")
    .select("*")
    .eq("status", "published")
    .eq("category", category)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (excludeIds.length > 0) {
    q = q.not("id", "in", `(${excludeIds.join(",")})`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as BlogPost[];
}

/**
 * Posts de OUTRAS categorias, idealmente 1 por categoria pra descoberta horizontal.
 */
export async function listPostsFromOtherCategories(
  excludeCategory: string,
  excludeIds: string[],
  limit = 3,
): Promise<BlogPost[]> {
  let q = supabase
    .from("platform_blog_post")
    .select("*")
    .eq("status", "published")
    .neq("category", excludeCategory)
    .order("published_at", { ascending: false })
    .limit(limit * 3);
  if (excludeIds.length > 0) {
    q = q.not("id", "in", `(${excludeIds.join(",")})`);
  }
  const { data, error } = await q;
  if (error) throw error;
  // Diversifica: pega 1 por categoria distinta até atingir o limit
  const out: BlogPost[] = [];
  const seenCats = new Set<string>();
  for (const p of (data || []) as BlogPost[]) {
    if (out.length >= limit) break;
    if (seenCats.has(p.category)) continue;
    seenCats.add(p.category);
    out.push(p);
  }
  // Se faltou (poucas categorias), completa com sobras
  if (out.length < limit) {
    for (const p of (data || []) as BlogPost[]) {
      if (out.length >= limit) break;
      if (out.find((o) => o.id === p.id)) continue;
      out.push(p);
    }
  }
  return out;
}

/**
 * Posts mais reagidos (clap+insight+inspire), excluindo IDs.
 * Para sites jovens com poucas reações, ordenado por engajamento total.
 */
export async function listMostReactedPosts(
  excludeIds: string[],
  limit = 3,
): Promise<BlogPost[]> {
  let q = supabase
    .from("platform_blog_post")
    .select("*")
    .eq("status", "published")
    .order("reactions_clap", { ascending: false })
    .order("reactions_insight", { ascending: false })
    .order("reactions_inspire", { ascending: false })
    .limit(limit * 2);
  if (excludeIds.length > 0) {
    q = q.not("id", "in", `(${excludeIds.join(",")})`);
  }
  const { data, error } = await q;
  if (error) {
    // Se as colunas de reaction ainda não existem (migration não rodada), retorna []
    if (
      typeof error.message === "string" &&
      error.message.includes("reactions_")
    ) {
      return [];
    }
    throw error;
  }
  return ((data || []) as BlogPost[]).slice(0, limit);
}

// ── Admin (CRUD) ─────────────────────────────────────────────

export async function listAllPostsAdmin(opts?: {
  status?: BlogPostStatus | "ALL";
  search?: string;
}): Promise<BlogPost[]> {
  let q = supabase
    .from("platform_blog_post")
    .select("*")
    .order("updated_at", { ascending: false });

  if (opts?.status && opts.status !== "ALL") q = q.eq("status", opts.status);
  if (opts?.search && opts.search.trim()) {
    q = q.ilike("title", `%${opts.search.trim()}%`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as BlogPost[];
}

export async function getPostByIdAdmin(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("platform_blog_post")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as BlogPost) || null;
}

export async function createPost(input: BlogPostInput): Promise<BlogPost> {
  const payload = {
    ...input,
    published_at:
      input.status === "published"
        ? input.published_at || new Date().toISOString()
        : null,
  };
  const { data, error } = await supabase
    .from("platform_blog_post")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as BlogPost;
}

export async function updatePost(
  id: string,
  patch: Partial<BlogPostInput>,
): Promise<BlogPost> {
  // Se status mudou para published e não tem published_at, preencher
  const update: Record<string, unknown> = { ...patch };
  if (patch.status === "published" && !patch.published_at) {
    const current = await getPostByIdAdmin(id);
    if (current && !current.published_at) {
      update.published_at = new Date().toISOString();
    }
  } else if (patch.status === "draft") {
    update.published_at = null;
  }

  const { data, error } = await supabase
    .from("platform_blog_post")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as BlogPost;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase
    .from("platform_blog_post")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Comments ─────────────────────────────────────────────────

export async function listApprovedComments(postId: string): Promise<BlogComment[]> {
  const { data, error } = await supabase
    .from("platform_blog_comment")
    .select("*")
    .eq("post_id", postId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as BlogComment[];
}

export async function submitComment(input: {
  postId: string;
  authorName: string;
  authorEmail?: string;
  content: string;
}): Promise<void> {
  const { error } = await supabase.from("platform_blog_comment").insert({
    post_id: input.postId,
    author_name: input.authorName.trim(),
    author_email: input.authorEmail?.trim() || null,
    content: input.content.trim(),
    status: "pending",
    user_agent:
      typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : null,
  });
  if (error) throw error;
}

export async function listCommentsAdmin(opts?: {
  status?: BlogCommentStatus | "ALL";
}): Promise<(BlogComment & { post_title?: string; post_slug?: string })[]> {
  const status = opts?.status || "pending";
  let q = supabase
    .from("platform_blog_comment")
    .select("*, post:platform_blog_post(title, slug)")
    .order("created_at", { ascending: false });
  if (status !== "ALL") q = q.eq("status", status);

  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map((row) => {
    const r = row as BlogComment & { post?: { title: string; slug: string } };
    return {
      ...r,
      post_title: r.post?.title,
      post_slug: r.post?.slug,
    };
  });
}

export async function setCommentStatus(
  id: string,
  status: BlogCommentStatus,
): Promise<void> {
  const { error } = await supabase
    .from("platform_blog_comment")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase
    .from("platform_blog_comment")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Helpers ──────────────────────────────────────────────────

// Bucket reutilizado (já existe no projeto com políticas públicas)
const BLOG_COVER_BUCKET = "lesson-assets";

/**
 * Faz upload de uma imagem de capa pro Storage e retorna a URL pública.
 */
export async function uploadBlogCover(file: File): Promise<string> {
  const ext = (
    file.name.split(".").pop() ||
    file.type.split("/").pop() ||
    "jpg"
  ).toLowerCase();
  const ts = Date.now();
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "capa";
  const path = `blog/${base}-${ts}.${ext}`;
  const { error } = await supabase.storage
    .from(BLOG_COVER_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });
  if (error) throw error;
  const { data } = supabase.storage.from(BLOG_COVER_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export function formatPostDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

// ── Migração de posts legados (rodar 1x) ────────────────────
// Atualiza cover_url pra URLs estáveis em /public/blog/ + adiciona
// demo de headings e pull-quote no post da Pregação para mostrar
// recursos premium do reader (TOC + pull quotes).
const LEGACY_COVER_MAP: Record<string, string> = {
  "jornada-heroi": "/blog/jornada-heroi.png",
  "5q-como-jazz": "/blog/5q-como-jazz.png",
  "5q-identidade": "/blog/5q-identidade.jpg",
  "mulheres-5-ministerios": "/blog/mulheres-5-ministerios.jpeg",
  "supervalorização_Pregação_Púlpito": "/blog/pregacao-pulpito.jpg",
  "Você_provavelmente_inferno": "/blog/inferno.jpg",
  "sem_espaco_para_ansiedade": "/blog/ansiedade.jpg",
};

const PREGACAO_DEMO_CONTENT = `## O modelo que herdamos

Quando lemos o Novo Testamento, encontramos uma igreja marcada por comunhão, discipulado e ensino mútuo — não por espetáculos ou eventos centralizados em uma figura carismática. Jesus não construiu palcos, mas se assentava à mesa com seus discípulos. Ele ensinava em casas, nas estradas, à beira do mar — em lugares onde a vida era vivida e compartilhada (Mt 9:10; Mc 2:15).

A igreja primitiva crescia de casa em casa (At 2:42-47). Ali, partiam o pão, oravam, confessavam pecados, ensinavam uns aos outros e cuidavam mutuamente. Como destaca Wolfgang Simson, "o lar era o habitat natural da igreja". Ainda assim, muitos hoje vivem uma fé centrada no culto dominical, onde são apenas espectadores.

## Quando o culto vira consumo

Transformamos o culto em um centro de consumo. Esperamos uma "palavra poderosa" de um pregador especial, em um ambiente cuidadosamente montado, e esquecemos que a fé bíblica se desenvolve em discipulado constante, não em experiências esporádicas.

>! Troca-se a mutualidade pelo monólogo. A vida em corpo pela performance de um.

Como denuncia Alan Hirsch em *Caminhos Esquecidos*, o modelo centrado no palco não forma discípulos, mas consumidores religiosos. A própria linguagem que usamos denuncia nossa teologia distorcida: "vou assistir ao culto". No Novo Testamento, o culto não era assistido, mas vivido — por todos, como "sacrifício vivo, santo e agradável a Deus, que é o vosso culto racional" (Rm 12:1).

## O que a Escritura realmente ensina

O apóstolo Paulo descreve o encontro da igreja como um espaço onde "cada um tem" algo a oferecer (1 Co 14:26). Isso inclui salmos, doutrina, revelação, línguas e interpretação — não apenas o ensino de um só. A passividade do público é uma negação da eclesiologia bíblica.

Valorizamos quem prega para 200 pessoas, mas ignoramos quem discipula 8 pessoas com profundidade. Trocamos a multiplicação por audiência. E isso tem custos: igrejas grandes sem profundidade, líderes esgotados, fiéis imaturos.

## Reformar a prática

Reformar não significa abolir o púlpito. Significa devolvê-lo ao seu lugar — uma entre muitas práticas, não a prática central. Significa investir em mesa, casa, célula, mentoria. Significa formar discípulos que se reproduzem, não plateias que aplaudem.

A pergunta que precisamos fazer não é "como o nosso culto pode ser mais impactante?", mas "como a nossa igreja pode formar mais discípulos?". A resposta dificilmente passará por mais palco. Provavelmente passará por mais mesa.`;

/**
 * Limpa indentação inicial das linhas de markdown.
 * Posts importados do blogPosts.ts vinham com 4-6 espaços por linha (template literal),
 * o que faz o `marked` interpretar como code block (<pre>) e quebra a renderização.
 *
 * Também garante que separadores horizontais (`---`, `***`, `___`) tenham linha em
 * branco ANTES, senão o markdown interpreta como setext-style heading (H1/H2) e
 * o parágrafo anterior vira um título gigante.
 */
export function cleanLegacyMarkdown(text: string): string {
  if (!text) return text;
  // 1. Normalizar indentação
  const lines = text.split(/\r?\n/).map((line) => {
    if (/^\s*$/.test(line)) return "";
    return line.replace(/^[ \t]+/, "");
  });

  // 2. Garantir linha em branco ANTES de separador (--- / *** / ___ sozinhos)
  const isHrLine = (s: string) =>
    /^([-*_])\1{2,}\s*$/.test(s);
  const withHrFix: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const cur = lines[i];
    const prev = withHrFix[withHrFix.length - 1];
    if (isHrLine(cur) && prev !== undefined && prev !== "") {
      withHrFix.push(""); // injeta linha em branco antes
    }
    withHrFix.push(cur);
    // Linha em branco DEPOIS também (pra não confundir setext)
    if (isHrLine(cur)) {
      const next = lines[i + 1];
      if (next !== undefined && next !== "") {
        withHrFix.push("");
      }
    }
  }

  // 3. Colapsa múltiplas linhas em branco em 1
  const collapsed: string[] = [];
  let blank = 0;
  for (const l of withHrFix) {
    if (l === "") {
      blank++;
      if (blank <= 1) collapsed.push("");
    } else {
      blank = 0;
      collapsed.push(l);
    }
  }
  return collapsed.join("\n").trim();
}

/**
 * Executa migração de posts legados em uma única operação (idempotente):
 *  1. Atualiza cover_url de cada post pra URL estável em /blog/
 *  2. Limpa indentação do conteúdo (corrige code-block bug)
 *  3. Adiciona headings + pull quote no post da Pregação como demo
 */
export async function migrateLegacyPosts(): Promise<{
  coversUpdated: number;
  demoApplied: boolean;
  contentCleaned: number;
}> {
  let coversUpdated = 0;

  // 1. Capas
  for (const [slug, url] of Object.entries(LEGACY_COVER_MAP)) {
    const { error, count } = await supabase
      .from("platform_blog_post")
      .update({ cover_url: url }, { count: "exact" })
      .eq("slug", slug);
    if (error) {
      console.warn(`[migrate] falha em ${slug}:`, error);
      continue;
    }
    if ((count ?? 0) > 0) coversUpdated++;
  }

  // 2. Limpa indentação + separadores do conteúdo de TODOS os posts (idempotente)
  let contentCleaned = 0;
  const { data: allPosts } = await supabase
    .from("platform_blog_post")
    .select("id, slug, content_markdown");
  for (const p of (allPosts || []) as { id: string; slug: string; content_markdown: string }[]) {
    // O post demo da Pregação é sobrescrito no passo 3 abaixo, não precisa limpar
    if (p.slug === "supervalorização_Pregação_Púlpito") continue;
    const cleaned = cleanLegacyMarkdown(p.content_markdown);
    if (cleaned !== p.content_markdown) {
      await supabase
        .from("platform_blog_post")
        .update({ content_markdown: cleaned })
        .eq("id", p.id);
      contentCleaned++;
    }
  }

  // 3. Demo: enriquecer post da Pregação com headings + pull quote
  let demoApplied = false;
  const demoSlug = "supervalorização_Pregação_Púlpito";
  const { error: demoError } = await supabase
    .from("platform_blog_post")
    .update({ content_markdown: PREGACAO_DEMO_CONTENT })
    .eq("slug", demoSlug);
  if (!demoError) demoApplied = true;

  return { coversUpdated, demoApplied, contentCleaned };
}

// ── Seed dos 7 posts legados ────────────────────────────────
// Importado dinamicamente para não engordar bundle público
export async function seedLegacyPosts(): Promise<{
  inserted: number;
  skipped: number;
}> {
  const mod = await import("../data/blogPosts");
  const legacy = mod.blogPosts || [];

  // Mapeamento de categoria legada → nova categoria fixa
  const categoryMap: Record<string, BlogCategory> = {
    "Formação ministerial": "5 Ministérios",
    "Teologia bíblica": "Teologia",
    "Vida comunitária": "Igreja & Ministério",
    "Evangelismo": "Apologética",
    "Vida emocional": "Vida Cristã",
  };

  let inserted = 0;
  let skipped = 0;

  for (const p of legacy) {
    const slug = p.id; // ids antigos servem como slug
    // Checa se já existe pra não duplicar
    const { data: existing } = await supabase
      .from("platform_blog_post")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) {
      skipped++;
      continue;
    }

    const mappedCategory = categoryMap[p.category || ""] || "Teologia";

    const { error } = await supabase.from("platform_blog_post").insert({
      slug,
      title: p.title,
      subtitle: p.subtitle || null,
      excerpt: p.excerpt || null,
      cover_url: p.imageUrl || null, // está como import URL local — admin pode atualizar depois
      content_markdown: p.content,
      author_name: p.author || "Five One",
      category: mappedCategory,
      tags: p.tags || [],
      takeaways: p.takeaways || [],
      status: "published",
      published_at: p.date ? new Date(p.date).toISOString() : new Date().toISOString(),
    });
    if (error) throw error;
    inserted++;
  }

  return { inserted, skipped };
}
