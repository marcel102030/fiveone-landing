import { useEffect, useRef, useState } from "react";
import logoSmall from "./assets/images/logo-fiveone-white-small.png";
import heroBanner from "./assets/images/banner-login-fiveone.png";
import { getStoredUser, StoredUserRecord } from "../../../shared/utils/user";
import { FormationKey, getUserByEmail, updateUserMemberLink, updateUserRole } from "../services/userAccount";
import { getRedeMemberByEmail } from "../../rede/services/redeIgrejas";
import { storePlatformProfile } from "../hooks/usePlatformUserProfile";
import { getUserProfileDetails } from "../services/userProfile";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { Button } from "../../../shared/components/ui/Button";
import { Input, FormField } from "../../../shared/components/ui/Input";

// ── Ícones inline ─────────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

const LoginAluno = ({ onLogin }: { onLogin: () => void }) => {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email,      setEmail]      = useState("");
  const [senha,      setSenha]      = useState("");
  const [showPwd,    setShowPwd]    = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [erro,       setErro]       = useState("");
  const [sucesso,    setSucesso]    = useState("");
  const [attempts,   setAttempts]   = useState(0);
  const [tocado,     setTocado]     = useState({ email: false, senha: false });

  const MAX_ATTEMPTS    = 3;
  const isLocked        = attempts >= MAX_ATTEMPTS;
  const redirectTimeout = useRef<number | null>(null);

  useEffect(() => {
    const stored: StoredUserRecord | null = getStoredUser();
    if (stored?.email) {
      setEmail(stored.email);
      setRememberMe(!!stored.remember);
    }
    return () => { if (redirectTimeout.current) window.clearTimeout(redirectTimeout.current); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTocado({ email: true, senha: true });
    setErro("");
    setSucesso("");

    if (isLocked) { setErro("Muitas tentativas. Aguarde alguns instantes."); return; }
    if (!email || !senha) { setErro("Informe o seu e-mail e senha."); return; }

    try {
      setLoading(true);

      const { error: authError } = await signIn(email, senha, rememberMe);
      if (authError) {
        setErro("E-mail ou senha inválidos.");
        setAttempts(prev => Math.min(prev + 1, MAX_ATTEMPTS));
        setLoading(false);
        return;
      }

      setAttempts(0);
      try {
        const normalizedEmail = email.trim().toLowerCase();
        const [row, details] = await Promise.all([
          getUserByEmail(normalizedEmail),
          getUserProfileDetails(normalizedEmail).catch(() => null),
        ]);

        let memberId = (row as any)?.member_id || null;
        let role     = (row as any)?.role || null;
        if (!memberId) {
          const matchedMember = await getRedeMemberByEmail(normalizedEmail);
          if (matchedMember?.id) {
            try {
              await updateUserMemberLink(normalizedEmail, matchedMember.id);
              await updateUserRole(normalizedEmail, "MEMBER");
              memberId = matchedMember.id;
              role     = "MEMBER";
            } catch { /* ignore */ }
          }
        }

        const formation = (row?.formation as FormationKey | null) || 'MESTRE';
        localStorage.setItem('platform_user_formation', String(formation));
        storePlatformProfile({
          email:       normalizedEmail,
          name:        (details?.display_name || [details?.first_name, details?.last_name].filter(Boolean).join(' ') || row?.name || null),
          formation,   role, memberId,
          firstName:   details?.first_name  || null,
          lastName:    details?.last_name   || null,
          displayName: details?.display_name || null,
          avatarUrl:   details?.avatar_url  || null,
        });
      } catch {
        try {
          storePlatformProfile({ email: email.trim().toLowerCase(), name: null, formation: null, role: null, memberId: null, firstName: null, lastName: null, displayName: null, avatarUrl: null });
        } catch {}
      }

      setSucesso("Login realizado! Redirecionando…");
      redirectTimeout.current = window.setTimeout(() => { onLogin(); }, 800);
    } catch (err: any) {
      setErro(err?.message || 'Falha ao processar.');
    } finally {
      setLoading(false);
    }
  };

  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - attempts);

  return (
    <div className="min-h-screen flex bg-navy">
      {/* ── Painel do formulário ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 max-w-xl w-full mx-auto lg:mx-0">

        {/* Brand */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-8">
            <img src={logoSmall} alt="Five One" className="h-9 w-9 object-contain" />
            <span className="text-sm font-semibold text-slate-light tracking-widest uppercase">
              Plataforma Five One
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-white leading-tight mb-2">
            Entre na sua conta
          </h1>
          <p className="text-slate text-sm leading-relaxed">
            Acesse as formações, continue seus módulos e acompanhe o seu progresso na jornada Five One.
          </p>
        </div>

        {/* Feedback de erro */}
        {erro && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-fade-in" role="alert">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                {erro}
                {attempts > 0 && remainingAttempts > 0 && (
                  <p className="mt-0.5 text-xs opacity-80">Tentativas restantes: {remainingAttempts}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Feedback de sucesso */}
        {sucesso && (
          <div className="mb-5 rounded-xl border border-mint/30 bg-mint/10 px-4 py-3 text-sm text-mint flex items-center gap-2 animate-fade-in" role="status">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {sucesso}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label="E-mail" htmlFor="email" error={tocado.email && !email ? "Campo obrigatório" : undefined}>
            <Input
              id="email" type="email" placeholder="seuemail@exemplo.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onBlur={() => setTocado(t => ({ ...t, email: true }))}
              autoComplete="username" disabled={loading}
              error={tocado.email && !email ? " " : undefined}
            />
          </FormField>

          <FormField label="Senha" htmlFor="senha" error={tocado.senha && !senha ? "Campo obrigatório" : undefined}>
            <Input
              id="senha" type={showPwd ? "text" : "password"} placeholder="Digite sua senha"
              value={senha} onChange={e => setSenha(e.target.value)}
              onBlur={() => setTocado(t => ({ ...t, senha: true }))}
              autoComplete="current-password" disabled={loading}
              error={tocado.senha && !senha ? " " : undefined}
              rightIcon={
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="text-slate hover:text-mint transition-colors" tabIndex={-1}
                  aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}>
                  <EyeIcon open={showPwd} />
                </button>
              }
            />
          </FormField>

          {/* Opções */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer group select-none">
              <div
                className={["relative w-10 h-6 rounded-full transition-colors duration-200",
                  rememberMe ? "bg-mint/80" : "bg-slate/20 border border-slate/30"].join(" ")}
                onClick={() => setRememberMe(v => !v)}
                role="checkbox" aria-checked={rememberMe} tabIndex={0}
                onKeyDown={e => e.key === ' ' && setRememberMe(v => !v)}
              >
                <span className={["absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200",
                  rememberMe ? "left-5" : "left-1"].join(" ")} />
              </div>
              <span className="text-sm text-slate group-hover:text-slate-light transition-colors">
                Permanecer logado
              </span>
            </label>

            <button type="button" onClick={() => navigate("/esqueci-senha")}
              className="text-sm text-mint/80 hover:text-mint transition-colors">
              Esqueceu a senha?
            </button>
          </div>

          {/* Botões */}
          <div className="pt-2 space-y-3">
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} disabled={isLocked}>
              {isLocked ? "Tentativas esgotadas" : "Entrar"}
            </Button>
            <Button type="button" variant="ghost" size="lg" fullWidth onClick={() => navigate("/")}>
              Ir para o site Five One
            </Button>
          </div>
        </form>

        <p className="mt-8 text-xs text-slate/60 text-center">
          Ao acessar você concorda com os{" "}
          <a href="/#/contato" className="text-slate/80 hover:text-mint transition-colors underline underline-offset-2">
            termos de uso e privacidade
          </a>{" "}
          da Five One.
        </p>
      </div>

      {/* ── Hero lateral ── */}
      <aside className="hidden lg:flex flex-1 relative overflow-hidden" aria-hidden="true">
        <img src={heroBanner} alt="" className="absolute inset-0 w-full h-full object-cover object-center" loading="eager" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-navy/20 to-navy/60" />
        <div className="relative z-10 mt-auto p-10 pb-14">
          <div className="bg-navy/60 backdrop-blur-sm rounded-2xl border border-slate/10 p-6 max-w-sm shadow-card">
            <h2 className="text-xl font-bold text-slate-white mb-3 leading-snug">
              Desenvolva o seu chamado
            </h2>
            <ul className="space-y-2">
              {[
                "Aulas, trilhas e materiais atualizados continuamente",
                "Suporte dedicado para cada formação ministerial",
                "Acompanhe seu progresso em cada módulo",
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-light/90">
                  <svg className="w-4 h-4 text-mint shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default LoginAluno;
