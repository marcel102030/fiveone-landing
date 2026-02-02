import { useEffect, useRef, useState } from "react";
import "./loginAluno.css";
import logoSmall from "./assets/images/logo-fiveone-white-small.png";
import heroBanner from "./assets/images/banner-login-fiveone.png";
import { setCurrentUser, getStoredUser, StoredUserRecord } from "../../utils/user";
import { FormationKey, getUserByEmail, updateUserMemberLink, updateUserRole, verifyUser } from "../../services/userAccount";
import { getRedeMemberByEmail } from "../../services/redeIgrejas";
import { storePlatformProfile } from "../../hooks/usePlatformUserProfile";
import { getUserProfileDetails } from "../../services/userProfile";

const LoginAluno = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const MAX_ATTEMPTS = 3;
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const isLocked = attempts >= MAX_ATTEMPTS;
  const [tocado, setTocado] = useState({ email: false, senha: false });
  const redirectTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored: StoredUserRecord | null = getStoredUser();
    if (stored?.email) {
      setEmail(stored.email);
      setRememberMe(!!stored.remember);
    }
    return () => {
      if (redirectTimeout.current) {
        window.clearTimeout(redirectTimeout.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTocado({ email: true, senha: true });
    setErro("");
    setSucesso("");

    if (isLocked) {
      setErro("Muitas tentativas. Aguarde alguns instantes antes de tentar novamente.");
      return;
    }

    if (!email || !senha) {
      setErro("Informe o seu e-mail e senha.");
      return;
    }
    try {
      setLoading(true);
      const ok = await verifyUser(email, senha);
      if (!ok) {
        setErro('E-mail ou senha inválidos.');
        setAttempts((prev) => Math.min(prev + 1, MAX_ATTEMPTS));
        setLoading(false);
        return;
      }
      setErro("");
      setAttempts(0);
      try {
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
        const formation = (row?.formation as FormationKey | null) || 'MESTRE';
        localStorage.setItem('platform_user_formation', String(formation));
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
      } catch {
          try {
          storePlatformProfile({
            email: email.trim().toLowerCase(),
            name: null,
            formation: null,
            role: null,
            memberId: null,
            firstName: null,
            lastName: null,
            displayName: null,
            avatarUrl: null,
          });
        } catch {}
      }
      try { setCurrentUser(email, rememberMe); } catch {}
      setSucesso("Login realizado com sucesso! Redirecionando…");
      redirectTimeout.current = window.setTimeout(() => {
        onLogin();
      }, 800);
    } catch (err: any) {
      setErro(err?.message || 'Falha ao processar.');
    } finally {
      setLoading(false);
    }
  };

  const remainingAttempts = attempts >= MAX_ATTEMPTS ? 0 : MAX_ATTEMPTS - attempts;

  return (
    <div className="student-login">
      <div className="student-login__shell">
        <div className="student-login__panel">
          <div className="student-login__panel-head">
            <div className="student-login__brand">
              <img src={logoSmall} alt="Five One" className="student-login__logo" />
              Plataforma Five One
            </div>
            <h1 className="student-login__title">Entre na sua conta</h1>
            <p className="student-login__subtitle">
              Acesse as formações, continue seus módulos e acompanhe o seu progresso na jornada Five One.
            </p>
          </div>
          {erro && (
            <div className="login-feedback error" role="alert">
              {erro}
              {attempts > 0 && remainingAttempts > 0 && (
                <span style={{ display: 'block', marginTop: 4, fontSize: '0.8rem', opacity: 0.8 }}>
                  Tentativas restantes: {remainingAttempts}
                </span>
              )}
            </div>
          )}
          {sucesso && (
            <div className="login-feedback success" role="status">
              {sucesso}
            </div>
          )}
          <form onSubmit={handleSubmit} className="student-login__form">
            <label className="input-stack">
              <span>E-mail</span>
              <input
                type="email"
                className="student-input"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  borderColor: tocado.email && !email ? "#f87171" : undefined,
                  boxShadow: tocado.email && !email ? "0 0 0 3px rgba(248, 113, 113, 0.25)" : undefined,
                }}
                autoComplete="username"
                required
              />
            </label>
            <label className="input-stack">
              <span>Senha</span>
              <input
                type="password"
                className="student-input"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={{
                  borderColor: tocado.senha && !senha ? "#f87171" : undefined,
                  boxShadow: tocado.senha && !senha ? "0 0 0 3px rgba(248, 113, 113, 0.25)" : undefined,
                }}
                autoComplete="current-password"
                required
              />
            </label>
            <div className="student-login__options">
              <label className={`remember-toggle ${rememberMe ? "is-checked" : ""}`}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span className="remember-toggle__track">
                  <span className="remember-toggle__knob" />
                </span>
                Permanecer logado
              </label>
              <a href="#" onClick={(event) => event.preventDefault()} className="student-login__link">
                Esqueceu a senha?
              </a>
            </div>
            <button type="submit" className="student-btn primary" disabled={loading || isLocked}>
              {isLocked ? "Tentativas esgotadas" : loading ? "Entrando…" : "Entrar"}
            </button>
            <button
              type="button"
              className="student-btn ghost"
              onClick={() => (window.location.href = "/inicio")}
            >
              Ir para o site Five One
            </button>
          </form>
          <div className="student-login__footer-note">
            Ao acessar você concorda com os termos de uso e privacidade da Five One.
          </div>
        </div>
        <aside className="student-login__hero" aria-hidden>
          <div className="student-login__hero-media">
            <img src={heroBanner} alt="" loading="lazy" decoding="async" draggable={false} />
          </div>
          <div className="student-login__hero-content">
            <h2>Desenvolva o seu chamado</h2>
            {/* <p>
              Aprenda onde estiver e retome exatamente de onde parou. A Five One está ao seu lado em toda jornada ministerial.
            </p> */}
            <ul className="student-login__hero-bullets">
              <li>Aulas, trilhas e materiais atualizados continuamente</li>
              {/* <li>Histórico sincronizado em todos os seus dispositivos</li> */}
              <li>Suporte dedicado para cada formação ministerial</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default LoginAluno;
