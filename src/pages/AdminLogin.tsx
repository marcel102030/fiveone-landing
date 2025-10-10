import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  setAdminAuthenticated,
  isAdminAuthenticated,
  getAdminAuthData,
} from "../utils/adminAuth";
import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!getAdminAuthData()?.remember;
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const auth = getAdminAuthData();
    if (auth?.email && auth.remember) {
      setEmail(auth.email);
      setRememberMe(true);
    }
  }, []);

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
      const USERS: Record<string, { password: string; display: string }> = {
        "marcelojunio75@hotmail.com": { password: "M@r102030", display: "Marcelo Silva" },
        "sueniakarcia@gmail.com": { password: "123456", display: "Suenia Karcia" },
        "guhfarias@gmail.com": { password: "123456", display: "Gustavo Freitas" },
      };
      const key = email.trim().toLowerCase();
      if (USERS[key] && USERS[key].password === password) {
        setAdminAuthenticated(email, rememberMe);
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
        <aside className="admin-login-left" aria-hidden>
          <div className="admin-login-left-content">
            <div className="brand-mark">FIVE ONE</div>
            <h2>Transforme formações em jornadas memoráveis</h2>
            <p>Centralize módulos, acompanhe resultados e conduza seus alunos com rapidez.</p>
          </div>
        </aside>
        <div className="admin-login-card">
          <div className="admin-login-card-head">
            <span className="admin-login-tag">Painel administrativo</span>
            <h1 className="admin-login-title">Entrar</h1>
            <p className="admin-login-sub">Acesse com as credenciais de gestor da plataforma.</p>
          </div>
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
            <div className="login-options">
              <label className={`remember-toggle ${rememberMe ? "checked" : ""}`}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span className="remember-toggle-box">
                  <span className="remember-toggle-knob" />
                </span>
                Permanecer logado
              </label>
              <a className="link-ghost" href="#" onClick={(e) => e.preventDefault()}>
                Esqueceu a senha?
              </a>
            </div>
            <button type="submit" className="admin-login-button" disabled={submitting}>
              {submitting ? "Entrando…" : "Entrar"}
            </button>
            <div className="trust">Precisa de ajuda? Entre em contato com o time Five One.</div>
          </form>
        </div>
      </div>
    </div>
  );
}
