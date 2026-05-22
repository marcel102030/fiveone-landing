import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  listProducts,
  updateProduct,
  listPurchases,
  formatPriceBRL,
  type Product,
  type Purchase,
} from "../../services/products";
import { usePlatformContent } from "../../services/platformContent";

const WEBHOOK_URL = "https://rdzrwclljydbyfipukwx.supabase.co/functions/v1/hotmart-webhook";

const STATUS_LABEL: Record<Purchase["status"], { label: string; tone: string }> = {
  approved:   { label: "Aprovada",    tone: "bg-mint/10 text-mint border-mint/30" },
  pending:    { label: "Pendente",    tone: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
  refunded:   { label: "Reembolsada", tone: "bg-slate/10 text-slate-light border-slate/30" },
  chargeback: { label: "Chargeback",  tone: "bg-red-500/10 text-red-300 border-red-500/30" },
  expired:    { label: "Expirada",    tone: "bg-slate/10 text-slate-light border-slate/30" },
  canceled:   { label: "Cancelada",   tone: "bg-slate/10 text-slate-light border-slate/30" },
};

export default function Vendas() {
  document.title = "Vendas | Five One Admin";

  const { ministries } = usePlatformContent();
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  async function reload() {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([listProducts(), listPurchases(50)]);
      setProducts(p);
      setPurchases(c);
    } catch (e) {
      console.error(e);
      setToast({ msg: "Erro ao carregar dados", ok: false });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  const productMap = useMemo(() => {
    const m = new Map<string, Product>();
    products.forEach((p) => m.set(p.id, p));
    return m;
  }, [products]);

  const ministryMap = useMemo(() => {
    const m = new Map<string, string>();
    ministries.forEach((mi) => m.set(mi.id, mi.name));
    return m;
  }, [ministries]);

  const totals = useMemo(() => {
    const approved = purchases.filter((p) => p.status === "approved");
    const revenueCents = approved.reduce((acc, p) => acc + (p.amount_cents || 0), 0);
    return {
      approved: approved.length,
      revenueCents,
      pending: purchases.filter((p) => p.status === "pending").length,
      refunded: purchases.filter((p) => p.status === "refunded" || p.status === "chargeback").length,
    };
  }, [purchases]);

  async function handleSave(patch: Partial<Product>) {
    if (!editing) return;
    setSavingId(editing.id);
    try {
      await updateProduct(editing.id, patch);
      setEditing(null);
      await reload();
      showToast("Produto atualizado", true);
    } catch (e: any) {
      showToast(e?.message || "Falha ao salvar", false);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-navy text-slate-light">
      <header className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Link to="/admin/administracao" className="text-xs text-slate hover:text-mint">
              ← Voltar à administração
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-white mt-1">Vendas</h1>
            <p className="text-sm text-slate mt-0.5">
              Produtos comercializáveis e compras vindas do Hotmart
            </p>
          </div>
          <button
            onClick={() => setShowSetup(true)}
            className="px-4 py-2 rounded-xl border border-mint/40 text-mint text-sm hover:bg-mint/10 transition"
          >
            ⚙️ Configurar Hotmart
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        {/* Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Vendas aprovadas" value={totals.approved} accent />
          <StatCard label="Receita aprovada" value={formatPriceBRL(totals.revenueCents)} />
          <StatCard label="Pendentes" value={totals.pending} />
          <StatCard label="Reembolsos/Chargebacks" value={totals.refunded} />
        </section>

        {/* Produtos */}
        <section>
          <h2 className="text-lg font-semibold text-slate-white mb-3">Produtos</h2>
          {loading ? (
            <div className="bg-navy-light border border-slate/10 rounded-2xl p-8 text-slate text-sm">
              Carregando…
            </div>
          ) : products.length === 0 ? (
            <div className="bg-navy-light border border-slate/10 rounded-2xl p-8 text-slate text-sm">
              Nenhum produto cadastrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {products.map((p) => (
                <article
                  key={p.id}
                  className="bg-navy-light border border-slate/10 rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-slate-white font-semibold">{p.title}</p>
                      <p className="text-xs text-slate mt-0.5">
                        {p.ministry_id ? `Libera curso: ${ministryMap.get(p.ministry_id) || p.ministry_id}` : "Sem curso vinculado"}
                      </p>
                    </div>
                    <p className="text-mint font-semibold text-lg tabular-nums">
                      {formatPriceBRL(p.price_cents, p.currency)}
                    </p>
                  </div>

                  <dl className="text-xs space-y-1.5 mb-4">
                    <Row label="Hotmart product_id" value={p.hotmart_product_id || <em className="text-amber-300">não configurado</em>} />
                    <Row label="Offer codes" value={p.hotmart_offer_codes?.length ? p.hotmart_offer_codes.join(", ") : <em className="text-slate/60">nenhum</em>} />
                    <Row label="Checkout URL" value={p.checkout_url ? <a href={p.checkout_url} target="_blank" rel="noreferrer" className="text-mint hover:underline truncate inline-block max-w-[260px] align-bottom">{p.checkout_url}</a> : <em className="text-amber-300">não configurado</em>} />
                    <Row label="Status" value={p.is_active ? <span className="text-mint">Ativo</span> : <span className="text-slate">Inativo</span>} />
                  </dl>

                  <button
                    onClick={() => setEditing(p)}
                    className="text-sm px-3 py-2 rounded-lg border border-slate/20 hover:border-mint hover:text-mint transition"
                  >
                    Editar
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Histórico */}
        <section>
          <h2 className="text-lg font-semibold text-slate-white mb-3">Últimas compras</h2>
          {purchases.length === 0 ? (
            <div className="bg-navy-light border border-slate/10 rounded-2xl p-8 text-slate text-sm">
              Nenhuma compra registrada ainda. Quando o Hotmart enviar o primeiro webhook, ela aparece aqui.
            </div>
          ) : (
            <div className="bg-navy-light border border-slate/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-navy-lighter/40 text-slate text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Comprador</th>
                      <th className="text-left px-4 py-3">Produto</th>
                      <th className="text-right px-4 py-3">Valor</th>
                      <th className="text-left px-4 py-3">Pagamento</th>
                      <th className="text-left px-4 py-3">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate/10">
                    {purchases.map((c) => {
                      const product = c.product_id ? productMap.get(c.product_id) : null;
                      const st = STATUS_LABEL[c.status];
                      return (
                        <tr key={c.id} className="hover:bg-navy-lighter/30 transition">
                          <td className="px-4 py-3">
                            <span className={`inline-flex text-2xs uppercase tracking-wider px-2 py-1 rounded-full border ${st.tone}`}>
                              {st.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-slate-white">{c.buyer_name || c.user_email}</div>
                            <div className="text-xs text-slate">{c.user_email}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-light">{product?.title || c.product_id || "—"}</td>
                          <td className="px-4 py-3 text-right text-slate-white tabular-nums">
                            {c.amount_cents != null ? formatPriceBRL(c.amount_cents) : "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-light text-xs">{c.payment_method || "—"}</td>
                          <td className="px-4 py-3 text-slate text-xs">
                            {new Date(c.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl border shadow-card ${toast.ok ? "bg-mint/10 border-mint/40 text-mint" : "bg-red-500/10 border-red-500/40 text-red-300"}`}>
          {toast.msg}
        </div>
      )}

      {/* Editar produto modal */}
      {editing && (
        <EditProductModal
          product={editing}
          ministries={ministries.map((m) => ({ id: m.id, title: m.name }))}
          saving={savingId === editing.id}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      {/* Setup Hotmart modal */}
      {showSetup && <SetupModal onClose={() => setShowSetup(false)} />}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 flex flex-col gap-1 ${accent ? "bg-mint/10 border border-mint/30" : "bg-navy-light border border-slate/10"}`}>
      <p className="text-2xs text-slate uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${accent ? "text-mint" : "text-slate-white"}`}>{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-slate/70 shrink-0">{label}</dt>
      <dd className="text-slate-light text-right truncate">{value}</dd>
    </div>
  );
}

function EditProductModal({
  product,
  ministries,
  saving,
  onClose,
  onSave,
}: {
  product: Product;
  ministries: { id: string; title: string }[];
  saving: boolean;
  onClose: () => void;
  onSave: (patch: Partial<Product>) => void;
}) {
  const [form, setForm] = useState({
    title: product.title,
    description: product.description || "",
    ministry_id: product.ministry_id || "",
    price_cents: product.price_cents,
    hotmart_product_id: product.hotmart_product_id || "",
    hotmart_offer_codes: (product.hotmart_offer_codes || []).join(", "),
    checkout_url: product.checkout_url || "",
    is_active: product.is_active,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const offerCodes = form.hotmart_offer_codes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onSave({
      title: form.title,
      description: form.description || null,
      ministry_id: form.ministry_id || null,
      price_cents: Math.max(0, Math.round(Number(form.price_cents) || 0)),
      hotmart_product_id: form.hotmart_product_id || null,
      hotmart_offer_codes: offerCodes,
      checkout_url: form.checkout_url || null,
      is_active: form.is_active,
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-navy/80 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto">
      <form onSubmit={submit} className="w-full max-w-lg bg-navy-light border border-slate/10 rounded-2xl p-6 shadow-card animate-fade-in">
        <h3 className="text-slate-white font-semibold mb-1">Editar produto</h3>
        <p className="text-xs text-slate mb-5">ID: <code className="text-mint">{product.id}</code></p>

        <Field label="Título">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} required />
        </Field>
        <Field label="Descrição">
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} min-h-[70px]`} />
        </Field>
        <Field label="Curso que libera (ministry)">
          <select value={form.ministry_id} onChange={(e) => setForm({ ...form, ministry_id: e.target.value })} className={inputCls}>
            <option value="">— nenhum —</option>
            {ministries.map((m) => (
              <option key={m.id} value={m.id}>{m.title} ({m.id})</option>
            ))}
          </select>
        </Field>
        <Field label="Preço (centavos — ex: 29700 = R$ 297,00)">
          <input type="number" min={0} step={1} value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: Number(e.target.value) })} className={inputCls} required />
        </Field>
        <Field label="Hotmart product_id" hint="Id numérico do produto no Hotmart">
          <input value={form.hotmart_product_id} onChange={(e) => setForm({ ...form, hotmart_product_id: e.target.value })} className={inputCls} placeholder="ex: 1234567" />
        </Field>
        <Field label="Offer codes (separados por vírgula)" hint="Códigos das ofertas que liberam este produto">
          <input value={form.hotmart_offer_codes} onChange={(e) => setForm({ ...form, hotmart_offer_codes: e.target.value })} className={inputCls} placeholder="ex: OFER123, OFER456" />
        </Field>
        <Field label="Checkout URL" hint="Link público da página de checkout no Hotmart">
          <input value={form.checkout_url} onChange={(e) => setForm({ ...form, checkout_url: e.target.value })} className={inputCls} placeholder="https://pay.hotmart.com/..." />
        </Field>

        <label className="flex items-center gap-2 text-sm text-slate-light mb-5">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-mint" />
          Produto ativo (visível no catálogo)
        </label>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate/20 text-slate-light hover:border-slate/40">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="px-5 py-2 text-sm rounded-lg bg-mint text-navy font-semibold hover:shadow-mint transition disabled:opacity-50">
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SetupModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  async function copyWebhook() {
    try {
      await navigator.clipboard.writeText(WEBHOOK_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }
  return (
    <div className="fixed inset-0 z-50 bg-navy/80 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-2xl bg-navy-light border border-slate/10 rounded-2xl p-6 shadow-card animate-fade-in">
        <h3 className="text-slate-white font-semibold mb-1">Configurar webhook do Hotmart</h3>
        <p className="text-xs text-slate mb-5">Siga estes passos uma única vez na sua conta Hotmart.</p>

        <ol className="space-y-4 text-sm text-slate-light">
          <li>
            <p className="font-medium text-slate-white">1) Cadastre o produto no Hotmart</p>
            <p className="text-slate text-xs mt-1">
              Acesse <a className="text-mint hover:underline" href="https://app-vlc.hotmart.com/products" target="_blank" rel="noreferrer">Painel &gt; Produtos &gt; Novo Produto</a>.
              Configure preço, página de vendas e gere a oferta. Copie o <code className="text-mint">product_id</code> e o código da oferta.
            </p>
          </li>

          <li>
            <p className="font-medium text-slate-white">2) Cole esses dados aqui</p>
            <p className="text-slate text-xs mt-1">Abra o produto correspondente nesta tela e clique em <em>Editar</em>. Cole o <code className="text-mint">product_id</code> e o <code className="text-mint">offer code</code>.</p>
          </li>

          <li>
            <p className="font-medium text-slate-white">3) Configure o webhook (Postback) no Hotmart</p>
            <p className="text-slate text-xs mt-1">
              Em <a className="text-mint hover:underline" href="https://app-vlc.hotmart.com/tools/webhook" target="_blank" rel="noreferrer">Ferramentas &gt; Webhook</a> crie uma nova URL com a configuração abaixo:
            </p>
            <div className="mt-2 bg-navy rounded-lg p-3 border border-slate/10 text-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-slate shrink-0">URL:</span>
                <code className="text-mint break-all">{WEBHOOK_URL}</code>
                <button onClick={copyWebhook} className="ml-auto shrink-0 text-2xs px-2 py-1 rounded border border-slate/20 hover:border-mint hover:text-mint transition">
                  {copied ? "✓ Copiado" : "Copiar"}
                </button>
              </div>
              <div className="text-slate"><span className="text-slate-light">Versão:</span> 2.0.0</div>
              <div className="text-slate"><span className="text-slate-light">Eventos:</span> PURCHASE_APPROVED, PURCHASE_REFUNDED, PURCHASE_CHARGEBACK, PURCHASE_CANCELED, PURCHASE_DELAYED, PURCHASE_EXPIRED</div>
              <div className="text-slate"><span className="text-slate-light">Hottok:</span> gere no Hotmart e guarde — o próximo passo precisa dele</div>
            </div>
          </li>

          <li>
            <p className="font-medium text-slate-white">4) Salve o hottok como secret no Supabase</p>
            <p className="text-slate text-xs mt-1">
              Em <a className="text-mint hover:underline" href={`https://supabase.com/dashboard/project/rdzrwclljydbyfipukwx/settings/functions`} target="_blank" rel="noreferrer">Edge Functions &gt; Secrets</a>, adicione:
            </p>
            <pre className="mt-2 bg-navy rounded-lg p-3 border border-slate/10 text-xs overflow-x-auto"><code>HOTMART_HOTTOK=&lt;valor_gerado_no_hotmart&gt;</code></pre>
          </li>

          <li>
            <p className="font-medium text-slate-white">5) Teste com uma venda real ou simulada</p>
            <p className="text-slate text-xs mt-1">
              O Hotmart tem um botão "Disparar evento de teste" no painel do webhook. Após enviar, abra esta tela e verifique se a compra apareceu em <em>Últimas compras</em>.
              Se aparecer com status <span className="text-mint">Aprovada</span>, o aluno também já está matriculado no curso vinculado.
            </p>
          </li>
        </ol>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm rounded-lg bg-mint text-navy font-semibold hover:shadow-mint transition">
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-navy border border-slate/20 rounded-lg px-3 py-2 text-sm text-slate-light focus:outline-none focus:border-mint";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="block text-xs text-slate mb-1">{label}</span>
      {children}
      {hint && <span className="block text-2xs text-slate/60 mt-1">{hint}</span>}
    </label>
  );
}
