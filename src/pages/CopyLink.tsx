import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import "./AdminChurches.css";

export default function CopyLink() {
  const loc = useLocation();
  const [copied, setCopied] = useState<boolean | null>(null);
  const url = useMemo(() => {
    const p = new URLSearchParams(loc.search);
    const raw = p.get("u") || p.get("url") || "";
    try { return decodeURIComponent(raw); } catch { return raw; }
  }, [loc.search]);

  useEffect(() => {
    (async () => {
      if (!url) { setCopied(false); return; }
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(url);
          setCopied(true);
        } else {
          const ta = document.createElement("textarea");
          ta.value = url; ta.style.position = "fixed"; ta.style.opacity = "0";
          document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
          setCopied(true);
        }
      } catch {
        setCopied(false);
      }
    })();
  }, [url]);

  return (
    <div className="invite-wrap" style={{ minHeight: 'calc(100vh - 40px)' }}>
      <header className="invite-hero">
        <h1 className="invite-title">{copied ? 'Link copiado' : 'Copiar link'}</h1>
        <p className="invite-sub">{copied ? 'O link foi copiado para sua área de transferência.' : 'Não conseguimos copiar automaticamente. Copie manualmente abaixo.'}</p>
      </header>
      <div className="invite-card" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="modal-form" style={{ gridTemplateColumns: '1fr' }}>
          <div className="form-row">
            <label>Link</label>
            <input className="form-input" value={url} readOnly onFocus={(e)=>e.currentTarget.select()} />
          </div>
          <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
            <button className="admin-btn" onClick={() => { if (url) window.open(url, '_blank'); }}>Abrir link</button>
            <button className="admin-btn" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true);} catch { setCopied(false);} }}>Copiar novamente</button>
            <Link to="/"><button className="admin-btn">Voltar</button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}

