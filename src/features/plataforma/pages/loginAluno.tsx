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
import { supabase } from "../../../shared/lib/supabaseClient";
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

        // Bloqueia o acesso quando o admin desativou a conta.
        if ((row as any)?.is_active === false) {
          await supabase.auth.signOut().catch(() => {});
          setErro("Conta desativada. Entre em contato com o administrador.");
          setLoading(false);
          return;
        }

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

        const formation = (row?.formation as FormationKey | null) || null;
        if (formation) localStorage.setItem('platform_user_formation', formation);
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

  // Detecta quando o usuário veio por link de email (from_email=1)
  // OU está em browser interno sem suporte a PWA
  const isInAppBrowser = typeof window !== 'undefined' && (() => {
    // Veio pelo link do email — CCT do Gmail tem Chrome no UA mas não instala PWA
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from_email') === '1') return true;
    // Outros browsers internos detectáveis por UA
    const ua = navigator.userAgent;
    return (
      ua.includes('wv') ||       // Android WebView puro
      ua.includes('GSA') ||      // Gmail Search App (iOS)
      ua.includes('FBAN') ||     // Facebook
      ua.includes('FBAV') ||     // Facebook
      ua.includes('Instagram')
    );
  })();

  return (
    <div className="min-h-screen flex bg-[#07101f] relative overflow-hidden">

      {/* ── Orbs decorativos de fundo (visíveis mobile + desktop) ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-mint/8 blur-[100px]" />
        <div className="absolute top-1/3 -right-48 w-[560px] h-[560px] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute -bottom-48 left-1/3 w-[400px] h-[400px] rounded-full bg-[#1a3a6b]/50 blur-[80px]" />
        {/* Grid sutil de pontos — só mobile */}
        <div className="lg:hidden absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #64ffda 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      {/* ── Painel do formulário ── */}
      <div className="flex-1 flex flex-col justify-center px-5 py-10 lg:px-16 xl:px-24 max-w-xl w-full mx-auto lg:mx-0 relative z-10">

        {/* Brand */}
        <div className="mb-7 lg:mb-10">

          {/* ── Identidade da plataforma — herói da tela ── */}
          <div className="flex flex-col items-center mb-7 lg:mb-8 lg:items-start">
            {/* Logo grande */}
            <div className="relative shrink-0 mb-4">
              <div className="absolute inset-0 rounded-full bg-mint/25 blur-2xl scale-[3]" />
              <div className="absolute inset-0 rounded-full bg-blue-400/15 blur-3xl scale-[4]" />
              <img src={logoSmall} alt="Five One" className="relative h-24 w-24 lg:h-14 lg:w-14 object-contain drop-shadow-2xl" />
            </div>

            {/* Label pequeno */}
            <p className="text-mint/70 text-[10px] tracking-[0.35em] uppercase font-semibold text-center lg:text-left mb-1">
              Plataforma
            </p>
            {/* "FIVE ONE" — hero text máximo */}
            <h1 className="text-5xl sm:text-6xl lg:text-3xl font-black text-white tracking-[0.12em] uppercase leading-none text-center lg:text-left mb-2">
              Five One
            </h1>
            <p className="text-mint/60 text-[10px] tracking-[0.25em] uppercase font-medium text-center lg:text-left mb-5 lg:mb-0">
              Cursos · Progresso · Certificados
            </p>
          </div>

          {/* Subtítulo de ação — discreto */}
          <div className="text-center lg:text-left mb-1">
            <p className="text-base font-semibold text-slate-light/80 mb-1">
              Entre na sua conta
            </p>
            <p className="text-slate/60 text-xs leading-relaxed">
              Acesse seus cursos e acompanhe o progresso na plataforma Five One.
            </p>
          </div>
        </div>

        {/* Aviso de browser interno — Gmail/WebView não suporta instalação do app */}
        {isInAppBrowser && (
          <div className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
            <div className="flex items-start gap-3">
              <span className="text-amber-400 text-lg flex-shrink-0 mt-0.5">⚠️</span>
              <div>
                <p className="text-amber-300 text-sm font-semibold mb-1">Você está em um browser interno</p>
                <p className="text-amber-200/80 text-xs leading-relaxed mb-3">
                  Para instalar o aplicativo e ter a melhor experiência, abra este link no <strong>Google Chrome</strong>.
                </p>
                <a
                  href="https://escolafiveone.com/login-aluno"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 text-[#07101f] text-xs font-bold rounded-xl"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Abrir no Chrome
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Card glass — envolve o form no mobile */}
        <div className="bg-white/[0.04] lg:bg-transparent border border-white/[0.07] lg:border-0 rounded-2xl lg:rounded-none p-6 lg:p-0 backdrop-blur-sm lg:backdrop-blur-none shadow-[0_8px_32px_rgba(0,0,0,0.3)] lg:shadow-none">

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
                    className="text-slate hover:text-mint transition-colors p-3 -m-3" tabIndex={-1}
                    aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}>
                    <EyeIcon open={showPwd} />
                  </button>
                }
              />
            </FormField>

            {/* Opções */}
            <div className="flex items-center justify-between gap-2 pt-1">
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
                <span className="text-xs sm:text-sm text-slate group-hover:text-slate-light transition-colors whitespace-nowrap">
                  Permanecer logado
                </span>
              </label>

              <button type="button" onClick={() => navigate("/esqueci-senha")}
                className="text-xs sm:text-sm text-mint/80 hover:text-mint transition-colors whitespace-nowrap min-h-[44px] px-1">
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

        </div>{/* fim card glass */}

        <p className="mt-6 text-xs text-slate/50 text-center">
          Ao acessar você concorda com os{" "}
          <a href="/contato" className="text-slate/70 hover:text-mint transition-colors underline underline-offset-2">
            termos de uso e privacidade
          </a>{" "}
          da Five One.
        </p>
      </div>

      {/* ── Hero lateral (desktop) ── */}
      <aside className="hidden lg:flex flex-1 relative overflow-hidden" aria-hidden="true">
        <img src={heroBanner} alt="" className="absolute inset-0 w-full h-full object-cover object-center" loading="eager" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-navy/20 to-[#07101f]/70" />
        <div className="relative z-10 mt-auto p-10 pb-14">
          <div className="bg-navy/70 backdrop-blur-md rounded-2xl border border-white/10 p-6 max-w-sm shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
            <h2 className="text-xl font-bold text-white mb-3 leading-snug">
              Desenvolva o seu chamado
            </h2>
            <ul className="space-y-2.5">
              {[
                "Aulas, trilhas e materiais atualizados continuamente",
                "Suporte dedicado em cada curso",
                "Acompanhe seu progresso em cada módulo",
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-light/90">
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
