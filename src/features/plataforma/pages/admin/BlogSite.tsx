import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { marked } from "marked";
import {
  BLOG_CATEGORIES,
  type BlogCategory,
  type BlogPost,
  type BlogPostStatus,
  createPost,
  deletePost,
  formatPostDate,
  getPostByIdAdmin,
  listAllPostsAdmin,
  slugify,
  updatePost,
  uploadBlogCover,
} from "../../../institucional/services/blog";
import { buildShareUrl } from "../../../institucional/components/blog/blogHelpers";
import InstagramShareButton from "../../../institucional/components/blog/InstagramShareButton";
import { supabase } from "../../../../shared/lib/supabaseClient";

type Mode = "list" | "editor" | "subscribers";

export default function AdminBlogSite() {
  useEffect(() => {
    document.title = "Blog | Five One Admin";
  }, []);
  const [mode, setMode] = useState<Mode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  return (
    <div className="min-h-screen bg-navy text-slate-light">
      <header className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Link to="/admin/administracao" className="text-xs text-slate hover:text-mint">
              ← Voltar à administração
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-white mt-1">Blog do Site</h1>
          </div>
          <div className="flex items-center gap-2">
            {mode !== "editor" && (
              <>
                <button
                  onClick={() => setMode("list")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${mode === "list" ? "bg-mint text-navy" : "border border-slate/20 text-slate-light hover:border-mint/40"}`}
                >
                  Posts
                </button>
                <button
                  onClick={() => setMode("subscribers")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${mode === "subscribers" ? "bg-mint text-navy" : "border border-slate/20 text-slate-light hover:border-mint/40"}`}
                >
                  Assinantes
                </button>
              </>
            )}
            {mode === "editor" && (
              <button
                onClick={() => { setMode("list"); setEditingId(null); }}
                className="px-4 py-2 rounded-xl border border-slate/20 text-slate-light text-sm hover:border-mint/40 transition"
              >
                ← Voltar à lista
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {mode === "list" ? (
          <BlogList
            onEdit={(id) => {
              setEditingId(id);
              setMode("editor");
            }}
            onNew={() => {
              setEditingId(null);
              setMode("editor");
            }}
            onToast={showToast}
          />
        ) : mode === "subscribers" ? (
          <SubscribersList />
        ) : (
          <BlogEditor
            key={editingId || "new"}
            postId={editingId}
            onSaved={(post) => {
              showToast(`Post "${post.title}" salvo.`, true);
              setMode("list");
              setEditingId(null);
            }}
            onDeleted={() => {
              showToast("Post excluído.", true);
              setMode("list");
              setEditingId(null);
            }}
            onError={(msg) => showToast(msg, false)}
          />
        )}
      </main>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl border shadow-card ${
            toast.ok
              ? "bg-mint/10 border-mint/40 text-mint"
              : "bg-red-500/10 border-red-500/40 text-red-300"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Listagem
// ────────────────────────────────────────────────────────────

function BlogList({
  onEdit,
  onNew,
  onToast,
}: {
  onEdit: (id: string) => void;
  onNew: () => void;
  onToast: (msg: string, ok: boolean) => void;
}) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<BlogPostStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await listAllPostsAdmin({ status, search });
      setPosts(data);
    } catch (e) {
      console.error(e);
      onToast("Erro ao carregar posts.", false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function handleDelete(post: BlogPost) {
    if (!confirm(`Excluir "${post.title}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await deletePost(post.id);
      onToast("Post excluído.", true);
      await load();
    } catch (e: any) {
      onToast(e?.message || "Falha ao excluir.", false);
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return posts;
    const s = search.trim().toLowerCase();
    return posts.filter((p) => p.title.toLowerCase().includes(s) || p.slug.toLowerCase().includes(s));
  }, [posts, search]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-mint text-navy font-semibold rounded-xl shadow-mint hover:shadow-mint-strong transition"
        >
          + Novo post
        </button>
        <div className="flex-1" />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as BlogPostStatus | "ALL")}
          className="bg-navy-light border border-slate/20 rounded-lg px-3 py-2 text-sm text-slate-light"
        >
          <option value="ALL">Todos os status</option>
          <option value="published">Publicados</option>
          <option value="draft">Rascunhos</option>
        </select>
        <input
          type="search"
          placeholder="Buscar título…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-navy-light border border-slate/20 rounded-lg px-3 py-2 text-sm text-slate-light placeholder:text-slate/50 min-w-[180px]"
        />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="bg-navy-light/60 border border-slate/10 rounded-2xl p-8 text-slate text-sm text-center">
          Carregando…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-navy-light/60 border border-slate/10 rounded-2xl p-8 text-slate text-sm text-center">
          Nenhum post encontrado. Use <strong className="text-mint">+ Novo post</strong> ou{" "}
          <strong className="text-golden">Importar posts antigos</strong>.
        </div>
      ) : (
        <div className="bg-navy-light border border-slate/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy-lighter/40 text-slate text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Título</th>
                <th className="text-left px-4 py-3">Categoria</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Publicado</th>
                <th className="text-right px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate/10">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-navy-lighter/30 transition">
                  <td className="px-4 py-3">
                    <div className="text-slate-white font-medium flex items-center gap-2">
                      {p.is_featured && (
                        <span
                          title="Post em destaque na página Para Ler"
                          className="inline-flex items-center gap-1 text-2xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-golden/15 text-golden border border-golden/30"
                        >
                          ⭐ Destaque
                        </span>
                      )}
                      {p.title}
                    </div>
                    <div className="text-2xs text-slate mt-0.5"><code>/para-ler/{p.slug}</code></div>
                  </td>
                  <td className="px-4 py-3 text-slate-light">{p.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex text-2xs uppercase tracking-wider px-2 py-1 rounded-full border ${
                        p.status === "published"
                          ? "bg-mint/10 text-mint border-mint/30"
                          : "bg-slate/10 text-slate-light border-slate/30"
                      }`}
                    >
                      {p.status === "published" ? "Publicado" : "Rascunho"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate text-xs">
                    {formatPostDate(p.published_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      {p.status === "published" && (
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                buildShareUrl(p.slug, p.updated_at),
                              );
                              onToast("Link de compartilhamento copiado.", true);
                            } catch {
                              onToast("Não foi possível copiar o link.", false);
                            }
                          }}
                          title="Copia a URL com cache-busting — o WhatsApp re-busca o preview após edições"
                          className="text-xs px-3 py-1.5 rounded-lg border border-slate/20 hover:border-mint hover:text-mint transition"
                        >
                          Copiar link
                        </button>
                      )}
                      {p.status === "published" && (
                        <InstagramShareButton post={p} variant="compact" />
                      )}
                      {p.status === "published" && (
                        <button
                          onClick={async () => {
                            if (!confirm(`Notificar assinantes sobre "${p.title}"?\n\nIsso enviará um e-mail para todos os inscritos na newsletter.`)) return;
                            try {
                              // Busca o JWT da sessão Supabase (necessário para autenticar como admin)
                              const { data: sessionData } = await supabase.auth.getSession();
                              const token = sessionData?.session?.access_token || "";
                              if (!token) { onToast("Sessão expirada. Faça login novamente.", false); return; }
                              const res = await fetch("/api/newsletter-notify", {
                                method: "POST",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ title: p.title, excerpt: p.excerpt, slug: p.slug, category: p.category, cover_url: p.cover_url }),
                              });
                              const data = await res.json() as { ok: boolean; sent?: number; error?: string };
                              if (data.ok) onToast(`E-mail enviado para ${data.sent ?? 0} assinante(s).`, true);
                              else onToast(data.error || "Erro ao notificar.", false);
                            } catch { onToast("Erro de conexão.", false); }
                          }}
                          title="Notificar assinantes da newsletter sobre esta leitura"
                          className="text-xs px-3 py-1.5 rounded-lg border border-slate/20 hover:border-golden hover:text-golden transition"
                        >
                          📧 Notificar
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(p.id)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-slate/20 hover:border-mint hover:text-mint transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10 transition"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Editor
// ────────────────────────────────────────────────────────────

type EditorState = {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  cover_url: string;
  content_markdown: string;
  author_name: string;
  category: BlogCategory;
  tags: string;
  takeaways: string;
  status: BlogPostStatus;
  is_featured: boolean;
};

// Template padrão pra posts novos — garante estrutura consistente
const POST_TEMPLATE = `## Introdução

Comece aqui com um parágrafo que apresenta o tema do post. Capture a atenção do leitor logo nas primeiras linhas — qual problema você vai abordar? Por que isso importa?

Este parágrafo recebe o **drop cap** automaticamente (a primeira letra fica grande, em destaque), então comece com uma frase forte.

## O contexto

Apresente o cenário, o problema ou a situação que motiva a leitura. Use referências bíblicas quando necessário (Ef 4:11-13), cite autores entre aspas e mantenha o tom acessível.

Você pode usar **negrito** para destacar palavras-chave e *itálico* para títulos de livros como *Caminhos Esquecidos*.

## O argumento principal

Desenvolva sua tese aqui. Pode dividir em vários parágrafos. Quando quiser que uma frase impactante apareça destacada visualmente no meio do texto, use:

>! Uma frase curta e poderosa que resume a ideia do post

Esse comando vira uma citação grande centralizada na página — chama atenção e quebra o ritmo da leitura.

## Aplicação prática

Como o leitor pode aplicar isso na vida real, na igreja, no ministério? Seja concreto:

- Primeiro passo prático
- Segundo passo prático
- Terceiro passo prático

## Conclusão

Encerre amarrando a ideia central. Que pergunta fica pro leitor? Que próximo passo você sugere?

A pergunta certa não é "X", mas "Y".`;

function emptyState(): EditorState {
  return {
    title: "",
    slug: "",
    subtitle: "",
    excerpt: "",
    cover_url: "",
    content_markdown: POST_TEMPLATE,
    author_name: "Five One",
    category: BLOG_CATEGORIES[0],
    tags: "",
    takeaways: "",
    status: "draft",
    is_featured: false,
  };
}

function BlogEditor({
  postId,
  onSaved,
  onDeleted,
  onError,
}: {
  postId: string | null;
  onSaved: (p: BlogPost) => void;
  onDeleted: () => void;
  onError: (msg: string) => void;
}) {
  const [state, setState] = useState<EditorState>(emptyState());
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showExample, setShowExample] = useState(false);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite re-selecionar o mesmo arquivo
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Imagem muito grande (máx. 8MB).");
      return;
    }
    setUploadError(null);
    setUploadingCover(true);
    try {
      const url = await uploadBlogCover(file);
      setState((s) => ({ ...s, cover_url: url }));
    } catch (err: any) {
      setUploadError(err?.message || "Falha no upload.");
    } finally {
      setUploadingCover(false);
    }
  }

  // Carregar post existente
  useEffect(() => {
    if (!postId) {
      setState(emptyState());
      setLoading(false);
      setSlugTouched(false);
      return;
    }
    setLoading(true);
    getPostByIdAdmin(postId)
      .then((p) => {
        if (!p) {
          onError("Post não encontrado.");
          return;
        }
        setState({
          title: p.title,
          slug: p.slug,
          subtitle: p.subtitle || "",
          excerpt: p.excerpt || "",
          cover_url: p.cover_url || "",
          content_markdown: p.content_markdown,
          author_name: p.author_name,
          category: BLOG_CATEGORIES.includes(p.category as BlogCategory)
            ? (p.category as BlogCategory)
            : BLOG_CATEGORIES[0],
          tags: (p.tags || []).join(", "),
          takeaways: (p.takeaways || []).join("\n"),
          status: p.status,
          is_featured: !!p.is_featured,
        });
        setSlugTouched(true);
      })
      .catch((e) => onError(e?.message || "Erro ao carregar."))
      .finally(() => setLoading(false));
  }, [postId, onError]);

  // Auto-slug a partir do título quando slug ainda não foi tocado
  useEffect(() => {
    if (!slugTouched && state.title) {
      setState((s) => ({ ...s, slug: slugify(state.title) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.title]);

  function update<K extends keyof EditorState>(key: K, value: EditorState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!state.title.trim() || !state.slug.trim() || !state.content_markdown.trim()) {
      onError("Título, slug e conteúdo são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: state.title.trim(),
        slug: slugify(state.slug.trim()),
        subtitle: state.subtitle.trim() || null,
        excerpt: state.excerpt.trim() || null,
        cover_url: state.cover_url.trim() || null,
        content_markdown: state.content_markdown,
        author_name: state.author_name.trim() || "Five One",
        category: state.category,
        tags: state.tags.split(",").map((t) => t.trim()).filter(Boolean),
        takeaways: state.takeaways.split("\n").map((t) => t.trim()).filter(Boolean),
        status: state.status,
        is_featured: state.is_featured,
        published_at: null,
      };
      const saved = postId
        ? await updatePost(postId, payload)
        : await createPost(payload);
      onSaved(saved);
    } catch (e: any) {
      onError(e?.message || "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!postId) return;
    if (!confirm("Excluir este post? Esta ação não pode ser desfeita.")) return;
    try {
      await deletePost(postId);
      onDeleted();
    } catch (e: any) {
      onError(e?.message || "Falha ao excluir.");
    }
  }

  const previewHtml = useMemo(() => {
    try {
      return marked.parse(state.content_markdown || "*Sem conteúdo*", { async: false }) as string;
    } catch {
      return "<p>Erro ao processar markdown</p>";
    }
  }, [state.content_markdown]);

  if (loading) {
    return (
      <div className="bg-navy-light/60 border border-slate/10 rounded-2xl p-8 text-slate text-sm text-center">
        Carregando post…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Barra de ajuda: ver post de exemplo */}
      <div className="flex items-center justify-between gap-3 bg-mint/5 border border-mint/20 rounded-xl px-4 py-2.5">
        <p className="text-xs text-slate-light">
          💡 Primeira vez? Veja um <strong className="text-mint">post de exemplo</strong> pronto e copie cada parte.
        </p>
        <button
          type="button"
          onClick={() => setShowExample(true)}
          className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-mint/10 border border-mint/30 text-mint hover:bg-mint/20 transition"
        >
          📋 Ver post de exemplo
        </button>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        {/* Coluna principal — texto */}
        <div className="space-y-5">
          <Field label="Título" required>
            <input
              type="text"
              value={state.title}
              onChange={(e) => update("title", e.target.value)}
              required
              className={inputCls}
              placeholder="Como os 5 Ministérios mudam a igreja"
            />
          </Field>

          <Field
            label="Slug (URL)"
            hint={`Será acessível em /para-ler/${state.slug || "..."}`}
            required
          >
            <input
              type="text"
              value={state.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", e.target.value);
              }}
              required
              className={inputCls}
              placeholder="como-os-5-ministerios-mudam-igreja"
            />
          </Field>

          <Field label="Subtítulo">
            <input
              type="text"
              value={state.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
              className={inputCls}
              placeholder="Frase curta sob o título"
            />
          </Field>

          <Field label="Resumo (excerpt)" hint="Aparece nos cards da listagem (~200 caracteres)">
            <textarea
              value={state.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              className={`${inputCls} min-h-[80px]`}
              maxLength={280}
            />
          </Field>

          <Field label="Conteúdo (Markdown)" required>
            <div className="flex items-center justify-between mb-2">
              <p className="text-2xs text-slate">
                Estrutura padrão pronta. Edite os textos abaixo seguindo o esqueleto.
              </p>
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="text-2xs px-2.5 py-1 rounded border border-slate/20 text-slate-light hover:border-mint hover:text-mint transition"
              >
                {showPreview ? "Editar" : "Pré-visualizar"}
              </button>
            </div>

            {/* Guia de sintaxe rápido */}
            <details className="mb-3 bg-navy-light/40 border border-slate/10 rounded-lg text-xs">
              <summary className="cursor-pointer px-3 py-2 text-slate-light hover:text-mint">
                📖 Guia de formatação rápida
              </summary>
              <div className="px-3 pb-3 pt-1 text-slate space-y-1.5">
                <div><code className="text-mint">## Título da seção</code> — cria uma seção (aparece no sumário lateral)</div>
                <div><code className="text-mint">### Sub-título</code> — sub-seção</div>
                <div><code className="text-mint">**negrito**</code> · <code className="text-mint">*itálico*</code> · <code className="text-mint">[link](https://...)</code></div>
                <div><code className="text-mint">&gt;! Frase de impacto</code> — vira citação grande centralizada (pull-quote)</div>
                <div><code className="text-mint">- item da lista</code> — listas com bullet mint</div>
                <div><code className="text-mint">&gt; Citação normal</code> — cita Alan Hirsch ou outro autor</div>
                <div>Cole link do <strong>YouTube</strong> ou <strong>Spotify</strong> em linha própria — vira embed automático</div>
              </div>
            </details>

            {showPreview ? (
              <article
                className="prose prose-invert prose-sm max-w-none bg-navy border border-slate/20 rounded-lg p-4 min-h-[300px] text-slate-light"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <textarea
                value={state.content_markdown}
                onChange={(e) => update("content_markdown", e.target.value)}
                required
                className={`${inputCls} min-h-[400px] font-mono text-sm leading-relaxed`}
                placeholder={"# Título principal\n\nSeu conteúdo aqui…"}
              />
            )}
          </Field>

          <Field label="Takeaways" hint="Pontos-chave do post. Um por linha.">
            <textarea
              value={state.takeaways}
              onChange={(e) => update("takeaways", e.target.value)}
              className={`${inputCls} min-h-[120px]`}
              placeholder={"Primeira ideia principal\nSegunda ideia principal\n..."}
            />
          </Field>
        </div>

        {/* Coluna lateral — metadata */}
        <aside className="space-y-5">
          <div className="bg-navy-light/60 border border-slate/10 rounded-2xl p-5 space-y-4">
            <Field label="Status">
              <select
                value={state.status}
                onChange={(e) => update("status", e.target.value as BlogPostStatus)}
                className={inputCls}
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
              </select>
            </Field>

            <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-slate/15 bg-navy/40 px-3.5 py-3 hover:border-mint/40 transition">
              <input
                type="checkbox"
                checked={state.is_featured}
                onChange={(e) => update("is_featured", e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-mint cursor-pointer"
              />
              <span className="text-sm">
                <span className="font-medium text-slate-white flex items-center gap-1.5">
                  ⭐ Post em destaque
                </span>
                <span className="block text-2xs text-slate mt-0.5 leading-snug">
                  Ocupa o card principal em /para-ler. Marcar este desmarca
                  automaticamente o destaque anterior.
                </span>
              </span>
            </label>

            <Field label="Categoria">
              <select
                value={state.category}
                onChange={(e) => update("category", e.target.value as BlogCategory)}
                className={inputCls}
              >
                {BLOG_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Autor">
              <input
                type="text"
                value={state.author_name}
                onChange={(e) => update("author_name", e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="Tags" hint="Separadas por vírgula">
              <input
                type="text"
                value={state.tags}
                onChange={(e) => update("tags", e.target.value)}
                className={inputCls}
                placeholder="apologetica, fé, racional"
              />
            </Field>

            <Field label="Capa do post" hint="Anexe uma imagem (JPG/PNG/WEBP). Recomendado 1280×720.">
              {state.cover_url ? (
                <div className="space-y-2">
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-slate/10 bg-navy group">
                    <img
                      src={state.cover_url}
                      alt="Capa"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <button
                      type="button"
                      onClick={() => update("cover_url", "")}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-navy/80 border border-slate/30 text-slate-light hover:text-red-300 hover:border-red-400/40 backdrop-blur-sm transition flex items-center justify-center"
                      title="Remover capa"
                    >
                      ✕
                    </button>
                  </div>
                  <label className="block text-center text-2xs text-mint hover:underline cursor-pointer">
                    Trocar imagem
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverUpload}
                      disabled={uploadingCover}
                    />
                  </label>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center gap-2 aspect-video rounded-lg border-2 border-dashed transition cursor-pointer ${
                    uploadingCover
                      ? "border-mint/40 bg-mint/5"
                      : "border-slate/20 hover:border-mint/40 hover:bg-mint/5"
                  }`}
                >
                  {uploadingCover ? (
                    <>
                      <div className="w-6 h-6 border-2 border-mint border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-slate">Enviando…</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-7 h-7 text-slate/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span className="text-xs text-slate-light font-medium">Anexar imagem</span>
                      <span className="text-2xs text-slate/60">clique ou arraste</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                    disabled={uploadingCover}
                  />
                </label>
              )}
              {uploadError && (
                <p className="text-2xs text-red-300 mt-1">{uploadError}</p>
              )}
            </Field>
          </div>

          {/* Ações */}
          <div className="bg-navy-light/60 border border-slate/10 rounded-2xl p-5 space-y-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-mint text-navy font-semibold rounded-xl shadow-mint hover:shadow-mint-strong transition disabled:opacity-50"
            >
              {saving ? "Salvando…" : postId ? "Salvar alterações" : "Criar post"}
            </button>
            {postId && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-red-500/30 text-red-300 hover:bg-red-500/10 transition"
              >
                Excluir post
              </button>
            )}
          </div>
        </aside>
      </div>

      {showExample && <ExamplePostModal onClose={() => setShowExample(false)} />}
    </form>
  );
}

// ─── Modal de post de exemplo ───────────────────────────────

const EXAMPLE_POST = {
  titulo: "Quem é Jesus? Uma resposta para os céticos",
  subtitulo: "As evidências históricas e teológicas sobre a identidade de Cristo",
  resumo:
    "Muita gente admira Jesus como mestre moral, mas recua diante da pergunta central: ele é Deus? Esta leitura reúne as evidências e mostra por que essa resposta muda tudo.",
  categoria: "Apologética",
  tags: "jesus, cristologia, evidências, fé racional",
  conteudo: `## Uma pergunta inevitável

Mais cedo ou mais tarde, todo cristão é confrontado com a pergunta: "por que você acredita que Jesus é Deus?". E não basta responder "porque eu sinto" — precisamos de fundamento.

C. S. Lewis colocou o dilema de forma brilhante: ou Jesus era quem dizia ser, ou era um mentiroso, ou um lunático. O que não dá é chamá-lo apenas de "bom mestre".

## O que as fontes históricas dizem

Mesmo fora da Bíblia, autores como Tácito, Flávio Josefo e Plínio confirmam a existência histórica de Jesus e o impacto do movimento cristão primitivo.

>! Se Jesus não ressuscitou, o cristianismo é a maior fraude da história. Se ressuscitou, é a maior notícia.

Os relatos dos evangelhos foram escritos a poucas décadas dos eventos, por testemunhas ou com base em testemunhas — não são lendas tardias.

## A ressurreição como ponto central

Paulo é direto: "se Cristo não ressuscitou, é vã a nossa fé" (1 Co 15:14). A fé cristã não se apoia em sentimentos, mas em um evento histórico verificável.

As teorias alternativas (roubo do corpo, alucinação coletiva, morte aparente) esbarram em problemas sérios que examinaremos.

## Como conversar sobre isso

- Ouça a real objeção da pessoa antes de responder
- Use perguntas em vez de afirmações ("o que te faria considerar?")
- Aponte para as evidências, mas confie no Espírito Santo

## Conclusão

Responder "quem é Jesus?" não é exercício acadêmico — é a pergunta que define a eternidade. E a boa notícia é que a fé cristã resiste ao escrutínio mais rigoroso.`,
  takeaways: `Jesus não deixou a opção de ser apenas um "bom mestre"
Há evidências históricas extrabíblicas da existência de Jesus
A ressurreição é o fundamento verificável da fé cristã`,
};

function CopyRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }
  return (
    <div className="border border-slate/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between gap-2 bg-navy-lighter/40 px-3 py-2">
        <span className="text-2xs uppercase tracking-wider text-slate font-semibold">{label}</span>
        <button
          type="button"
          onClick={copy}
          className="text-2xs px-2.5 py-1 rounded-md border border-slate/20 text-slate-light hover:border-mint hover:text-mint transition"
        >
          {copied ? "✓ Copiado" : "Copiar"}
        </button>
      </div>
      <div className={`px-3 py-2.5 text-sm text-slate-light ${multiline ? "whitespace-pre-wrap font-mono text-xs leading-relaxed max-h-60 overflow-y-auto" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function ExamplePostModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-navy/80 backdrop-blur-sm flex items-start justify-center px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-2xl bg-navy-light border border-slate/10 rounded-2xl shadow-card my-auto">
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-slate/10 sticky top-0 bg-navy-light rounded-t-2xl z-10">
          <div>
            <h3 className="text-slate-white font-semibold">Post de exemplo</h3>
            <p className="text-2xs text-slate mt-0.5">Copie cada parte e cole no campo correspondente.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-lg border border-slate/20 text-slate-light hover:border-mint hover:text-mint transition flex items-center justify-center"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-3">
          <CopyRow label="Título" value={EXAMPLE_POST.titulo} />
          <CopyRow label="Subtítulo" value={EXAMPLE_POST.subtitulo} />
          <CopyRow label="Resumo (excerpt)" value={EXAMPLE_POST.resumo} />
          <div className="grid grid-cols-2 gap-3">
            <CopyRow label="Categoria" value={EXAMPLE_POST.categoria} />
            <CopyRow label="Tags" value={EXAMPLE_POST.tags} />
          </div>
          <CopyRow label="Conteúdo (Markdown)" value={EXAMPLE_POST.conteudo} multiline />
          <CopyRow label="Takeaways (1 por linha)" value={EXAMPLE_POST.takeaways} multiline />

          <div className="bg-mint/5 border border-mint/20 rounded-xl px-4 py-3 text-2xs text-slate-light leading-relaxed">
            <strong className="text-mint">Estrutura recomendada:</strong> Introdução →
            Contexto → Argumento principal (com 1 pull-quote <code className="text-mint">&gt;!</code>) →
            Aplicação prática (lista) → Conclusão. Use <code className="text-mint">## Título</code>
            {" "}em cada seção pra ativar o sumário lateral no post.
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm rounded-lg bg-mint text-navy font-semibold hover:shadow-mint transition"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Sub-helpers
// ────────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-navy border border-slate/20 rounded-lg px-3 py-2 text-sm text-slate-light focus:outline-none focus:border-mint placeholder:text-slate/40";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-slate mb-1">
        {label}
        {required && <span className="text-mint ml-1">*</span>}
      </span>
      {children}
      {hint && <span className="block text-2xs text-slate/60 mt-1">{hint}</span>}
    </label>
  );
}


// ─── Assinantes da newsletter ───────────────────────────────

type Subscriber = {
  id: string;
  name: string | null;
  email: string;
  source: string;
  confirmed: boolean;
  subscribed_at: string;
};

function SubscribersList() {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("platform_newsletter_subscriber")
      .select("id,name,email,source,confirmed,subscribed_at")
      .is("unsubscribed_at", null)
      .order("subscribed_at", { ascending: false })
      .then(({ data }) => {
        setSubs((data as Subscriber[]) || []);
        setLoading(false);
      });
  }, []);

  function copyCSV() {
    const header = "Nome,E-mail,Origem,Data";
    const rows = subs.map((s) =>
      [s.name || "", s.email, s.source, new Date(s.subscribed_at).toLocaleDateString("pt-BR")].join(",")
    );
    navigator.clipboard.writeText([header, ...rows].join("\n"));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-white">Assinantes da newsletter</h2>
          <p className="text-sm text-slate mt-0.5">
            {loading ? "Carregando…" : `${subs.length} assinante${subs.length !== 1 ? "s" : ""} confirmado${subs.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {subs.length > 0 && (
          <button
            onClick={copyCSV}
            className="px-4 py-2 text-sm rounded-xl border border-slate/20 text-slate-light hover:border-mint hover:text-mint transition"
          >
            📋 Copiar lista (CSV)
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-navy-light/60 border border-slate/10 rounded-2xl p-8 text-center text-slate text-sm">
          Carregando…
        </div>
      ) : subs.length === 0 ? (
        <div className="bg-navy-light/60 border border-slate/10 rounded-2xl p-10 text-center">
          <p className="text-3xl mb-3">📭</p>
          <p className="text-slate-white font-medium">Nenhum assinante ainda</p>
          <p className="text-sm text-slate mt-1">Assim que alguém se inscrever no "Para Ler", aparece aqui.</p>
        </div>
      ) : (
        <div className="bg-navy-light border border-slate/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy-lighter/40 text-slate text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Nome</th>
                <th className="text-left px-4 py-3">E-mail</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Origem</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Inscrito em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate/10">
              {subs.map((s) => (
                <tr key={s.id} className="hover:bg-navy-lighter/20 transition">
                  <td className="px-4 py-3 text-slate-white">
                    {s.name || <span className="text-slate/40 italic">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-light">{s.email}</td>
                  <td className="px-4 py-3 text-slate text-xs hidden sm:table-cell">{s.source}</td>
                  <td className="px-4 py-3 text-slate text-xs hidden md:table-cell">
                    {new Date(s.subscribed_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
