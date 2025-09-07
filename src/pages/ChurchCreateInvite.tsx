import { useState } from "react";
import { Link } from "react-router-dom";
import "./AdminChurches.css";
import "./ChurchCreateInvite.css";

type FormState = {
  name: string;
  email: string;
  leader_name: string;
  city: string;
  expected_members: string | number;
  notes: string;
};

type SuccessState = null | {
  name: string;
  slug: string;
  invite_url?: string;
  report_url?: string;
  quiz_url?: string;
  responsibleEmail?: string;
};

export default function ChurchCreateInvite() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    leader_name: "",
    city: "",
    expected_members: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [success, setSuccess] = useState<SuccessState>(null);

  async function copy(text: string) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        alert("Link copiado!");
      } else {
        const ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
        alert("Link copiado!");
      }
    } catch {
      alert("Não foi possível copiar o link");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Informe o nome da igreja");
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      alert("Informe um e-mail válido");
      return;
    }
    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await fetch("/api/church-create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          leader_name: form.leader_name.trim() || null,
          city: form.city.trim() || null,
          expected_members:
            typeof form.expected_members === "string"
              ? Number(form.expected_members || 0)
              : form.expected_members || 0,
          notes: form.notes?.trim() || null,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Erro ${res.status}`);
      }

      let payload: any = null;
      try { payload = await res.json(); } catch {}

      const slug = payload?.church?.slug || payload?.slug || "";
      const name = payload?.church?.name || form.name.trim();
      const successData: SuccessState = {
        name,
        slug,
        invite_url: payload?.invite_url,
        report_url: payload?.report_url,
        quiz_url: payload?.quiz_url,
        responsibleEmail: form.email.trim(),
      };
      setSuccess(successData);
      setFeedback({ type: "success", msg: "Igreja cadastrada com sucesso!" });

      // dispara email com instruções para o responsável
      try {
        const origin = (typeof window !== "undefined") ? window.location.origin : "";
        const testUrl = successData.quiz_url || `${origin}/#/teste-dons?churchSlug=${slug}`;
        const reportUrl = successData.report_url || `${origin}/#/relatorio/${slug}`;
        const whatsappUrl = `https://wa.me/5583989004764?text=${encodeURIComponent(`Olá! Cadastrei a igreja ${name} (slug: ${slug}). Poderiam me ajudar?`)}`;
        const resp = await fetch("/api/church-created-email", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            to: form.email.trim(),
            church: { name, slug },
            links: { testUrl, reportUrl, whatsappUrl },
            responsibleName: form.leader_name?.trim() || undefined
          })
        });
        if (!resp.ok) {
          const detail = await resp.text().catch(() => "");
          console.warn("Falha no email church-created:", resp.status, detail);
        }
      } catch (e) {
        // não bloqueia fluxo, apenas registra feedback
        console.warn("Falha ao enviar e-mail de instruções", e);
      }
    } catch (e: any) {
      setFeedback({ type: "error", msg: e?.message || "Falha ao criar igreja" });
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    const origin = (typeof window !== "undefined") ? window.location.origin : "";
    const quizLink = `${origin}/#/teste-dons?churchSlug=${success.slug}`;
    // const reportLink = success.report_url || `${origin}/#/relatorio/${success.slug}`;
    // const inviteLink = success.invite_url || `${origin}/c/${success.slug}`;
    return (
      <div className="invite-wrap">
        <header className="invite-hero">
          <h1 className="invite-title">Igreja criada com sucesso</h1>
          <p className="invite-sub">{success.name} foi cadastrada no sistema.</p>
          {success.responsibleEmail && (
            <p className="invite-sub" style={{ marginTop: 6 }}>
              Enviamos um e-mail com as instruções para <strong>{success.responsibleEmail}</strong>.
            </p>
          )}
        </header>

        <div className="invite-options">
          <section className="option-card">
            <div className="option-icon" aria-hidden>🎯</div>
            <div className="option-content">
              <h2 className="option-title">Compartilhar link de teste</h2>
              <p className="option-desc">Este é o link para que sua igreja faça o Teste dos 5 Ministérios.</p>
            </div>
            <div className="option-actions">
              <a className="admin-btn primary" href={quizLink} target="_blank" rel="noreferrer">Abrir link do teste</a>
              <button className="admin-btn" onClick={() => copy(quizLink)}>Copiar link</button>
            </div>
          </section>

          <section className="option-card">
            <div className="option-icon" aria-hidden>📊</div>
            <div className="option-content">
              <h2 className="option-title">Abrir relatório</h2>
              <p className="option-desc">Acompanhe o resultado geral da sua comunidade: porcentagem de dons, volume de respostas e mais.</p>
            </div>
            <div className="option-actions">
              <Link to={`/relatorio/${success.slug}`}><button className="admin-btn">Abrir relatório</button></Link>
            </div>
          </section>

          <section className="option-card">
            <div className="option-icon" aria-hidden>💬</div>
            <div className="option-content">
              <h2 className="option-title">Dúvidas</h2>
              <p className="option-desc">Fale com a equipe Five One pelo WhatsApp para tirar dúvidas.</p>
            </div>
            <div className="option-actions">
              <a className="admin-btn" target="_blank" rel="noreferrer" href={`https://wa.me/5583989004764?text=${encodeURIComponent(`Olá! Cadastrei a igreja ${success.name} (slug: ${success.slug}). Poderiam me ajudar?`)}`}>WhatsApp</a>
            </div>
          </section>
        </div>

        <div className="invite-footer-actions">
          <Link to="/"><button className="admin-btn">Voltar para o início</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="invite-wrap">
      <header className="invite-hero">
        <h1 className="invite-title">Cadastro de Igreja</h1>
        <p className="invite-sub">Preencha os dados e envie para cadastrar a igreja no sistema.</p>
      </header>

      <div className="invite-card">
        {feedback && feedback.type === "error" && (
          <div className="invite-alert invite-alert--error" role="alert">{feedback.msg}</div>
        )}
        {feedback && feedback.type === "success" && (
          <div className="invite-alert invite-alert--success" role="status">{feedback.msg}</div>
        )}
        <form onSubmit={onSubmit} className="modal-form">
          <div className="form-row">
            <label>Nome *</label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex.: Rede Five One - Centro"
              required
            />
          </div>

          <div className="form-row">
            <label>E-mail do responsável *</label>
            <input
              className="form-input"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="exemplo@igreja.com"
              required
            />
          </div>

          <div className="form-row">
            <label>Líder</label>
            <input
              className="form-input"
              value={form.leader_name}
              onChange={(e) => setForm((f) => ({ ...f, leader_name: e.target.value }))}
              placeholder="Ex.: Marcelo"
            />
          </div>

          <div className="form-row">
            <label>Cidade</label>
            <input
              className="form-input"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="Ex.: Campina Grande"
            />
          </div>

          <div className="form-row">
            <label>Membros previstos</label>
            <input
              className="form-input"
              type="number"
              min={0}
              value={form.expected_members}
              onChange={(e) => setForm((f) => ({ ...f, expected_members: e.target.value }))}
              placeholder="Ex.: 120"
            />
          </div>

          <div className="form-row">
            <label>Observações</label>
            <textarea
              className="form-input"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Opcional"
            />
          </div>

          <div className="invite-actions">
            <button type="submit" className="admin-btn primary" disabled={submitting} aria-busy={submitting}>
              {submitting ? "Enviando..." : "Enviar formulário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
