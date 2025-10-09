import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setAdminAuthenticated, isAdminAuthenticated } from "../utils/adminAuth";
import "./AdminLogin.css";

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
    if (isAdminAuthenticated()) navigate("/admin/administracao", { replace: true });
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
      // Front-only auth (whitelist). Trocar por backend quando disponível.
      const USERS: Record<string, { password: string; display: string }>= {
        "marcelojunio75@hotmail.com": { password: "M@r102030", display: "Marcelo Silva" },
        "sueniakarcia@gmail.com": { password: "123456", display: "Suenia Karcia" },
        "guhfariasd@gmail.com": { password: "123456", display: "Gustavo Freitas" },
      };
      const key = email.trim().toLowerCase();
      if (USERS[key] && USERS[key].password === password) {
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
    <div className="admin-login-wrap fancy">
      <div className="admin-login-shell">
        <div className="admin-login-left">
          <div className="brand">Five One</div>
          <h2>Bem-vindo ao Painel</h2>
          <p>Acesse sua conta de administração para gerenciar alunos, formações e relatórios.</p>
        </div>
        <div className="admin-login-card">
          <h1 className="admin-login-title">Entrar</h1>
          <p className="admin-login-sub">Administração — Five One</p>
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
                required
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
                required
              />
            </label>
            <div className="login-row">
              <a className="muted" href="#" onClick={(e)=> e.preventDefault()}>Esqueci minha senha</a>
            </div>
            <button type="submit" className="admin-login-button" disabled={submitting}>
              {submitting ? "Entrando…" : "Entrar"}
            </button>
            <div className="trust">Seus dados estão protegidos.</div>
          </form>
        </div>
      </div>
    </div>
  );
}
