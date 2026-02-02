import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  setAdminAuthenticated,
  isAdminAuthenticated,
  getAdminAuthData,
} from "../utils/adminAuth";
import { setCurrentUser } from "../utils/user";
import { FormationKey, getUserByEmail, updateUserMemberLink, updateUserRole, verifyUser } from "../services/userAccount";
import { getRedeMemberByEmail } from "../services/redeIgrejas";
import { getUserProfileDetails } from "../services/userProfile";
import { storePlatformProfile } from "../hooks/usePlatformUserProfile";
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
        return;
      }

      const ok = await verifyUser(email, password);
      if (!ok) {
        setError("E-mail ou senha incorretos.");
        return;
      }
      const normalizedEmail = email.trim().toLowerCase();
      const [row, details] = await Promise.all([
        getUserByEmail(normalizedEmail),
        getUserProfileDetails(normalizedEmail).catch(() => null),
      ]);
      let memberId = (row as any)?.member_id || null;
      let role = (row as any)?.role || null;
      if (!memberId) {
        const matchedMember = await getRedeMemberByEmail(normalizedEmail);
        if (matchedMember?.id) {
          try {
            await updateUserMemberLink(normalizedEmail, matchedMember.id);
            await updateUserRole(normalizedEmail, "MEMBER");
            memberId = matchedMember.id;
            role = "MEMBER";
          } catch {
            // ignore linking errors
          }
        }
      }
      if (role !== "MEMBER") {
        setError("Este usuario nao possui perfil de membro.");
        return;
      }
      const formation = (row?.formation as FormationKey | null) || null;
      storePlatformProfile({
        email: normalizedEmail,
        name: (details?.display_name || [details?.first_name, details?.last_name].filter(Boolean).join(' ') || row?.name || null),
        formation,
        role,
        memberId,
        firstName: details?.first_name || null,
        lastName: details?.last_name || null,
        displayName: details?.display_name || null,
        avatarUrl: details?.avatar_url || null,
      });
      setCurrentUser(normalizedEmail, rememberMe);
      navigate("/membro", { replace: true });
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
            <span className="admin-login-tag">Painel administrativo e de membros</span>
            <h1 className="admin-login-title">Entrar</h1>
            <p className="admin-login-sub">Acesse como admin ou membro usando seu e-mail e senha.</p>
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
