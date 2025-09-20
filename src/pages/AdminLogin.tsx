import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setAdminAuthenticated, isAdminAuthenticated } from "../utils/adminAuth";
import "./AdminLogin.css";

const DEFAULT_EMAIL = "marcelojunio75@hotmail.com";
const DEFAULT_PASSWORD = "M@r102030";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Administração | Five One";
    // If already logged in, push to dashboard
    if (isAdminAuthenticated()) {
      navigate("/admin/administracao", { replace: true });
    }
  }, [navigate]);

  function validateEmail(v: string) {
    // Simple RFC2822-like check
    return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(v);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Preencha e-mail e senha.");
      return;
    }
    if (!validateEmail(email)) {
      setError("E-mail inválido.");
      return;
    }
    setSubmitting(true);
    try {
      // Front-only auth for this phase
      if (email === DEFAULT_EMAIL && password === DEFAULT_PASSWORD) {
        setAdminAuthenticated(email);
        const to = location?.state?.from?.pathname || "/admin/administracao";
        navigate(to, { replace: true });
      } else {
        setError("E-mail ou senha incorretos.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <h1 className="admin-login-title">Administração — Five One</h1>
        
        {error && <div className="admin-login-error">{error}</div>}
        <form onSubmit={onSubmit} className="admin-login-form">
          <label className="admin-login-field">
            <span>E-mail</span>
            <input
              type="email"
              inputMode="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="admin-login-field">
            <span>Senha</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="admin-login-button" disabled={submitting}>
            {submitting ? "Entrando…" : "Entrar"}
          </button>
          <p className="admin-login-hint">
            Usuário: {DEFAULT_EMAIL} — Senha: {DEFAULT_PASSWORD}
          </p>
        </form>
      </div>
    </div>
  );
}
