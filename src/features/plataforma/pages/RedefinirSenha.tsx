import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoSmall from "./assets/images/logo-fiveone-white-small.png";
import { supabase } from "../../../shared/lib/supabaseClient";
import { Button } from "../../../shared/components/ui/Button";
import { Input, FormField } from "../../../shared/components/ui/Input";

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

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [novaSenha,    setNovaSenha]    = useState("");
  const [confirmar,    setConfirmar]    = useState("");
  const [showPwd1,     setShowPwd1]     = useState(false);
  const [showPwd2,     setShowPwd2]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [sucesso,      setSucesso]      = useState(false);
  const [erro,         setErro]         = useState("");
  const [tokenValido,  setTokenValido]  = useState<boolean | null>(null);

  // Verifica se há sessão ativa (Supabase injeta sessão via URL hash ao clicar no link)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setTokenValido(!!session);
    });
  }, []);

  const validateSenha = () => {
    if (novaSenha.length < 8)       return "A senha deve ter pelo menos 8 caracteres.";
    if (novaSenha !== confirmar)     return "As senhas não coincidem.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateSenha();
    if (validationError) { setErro(validationError); return; }
    setErro("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;
      setSucesso(true);
    } catch (err: any) {
      setErro(err?.message || "Erro ao redefinir a senha. O link pode ter expirado.");
    } finally {
      setLoading(false);
    }
  };

  // Carregando verificação do token
  if (tokenValido === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-mint" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-slate">Verificando link…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-navy px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <img src={logoSmall} alt="Five One" className="h-9 w-9 object-contain" />
          <span className="text-sm font-semibold text-slate-light tracking-widest uppercase">
            Plataforma Five One
          </span>
        </div>

        <div className="bg-navy-light border border-slate/10 rounded-2xl p-8 shadow-card">
          {!tokenValido ? (
            /* Token inválido ou expirado */
            <div className="text-center py-4 animate-fade-in-up">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-white mb-2">Link inválido ou expirado</h2>
              <p className="text-sm text-slate mb-6">
                Este link de redefinição de senha expirou ou já foi utilizado. Solicite um novo link.
              </p>
              <Button variant="primary" size="md" fullWidth onClick={() => navigate("/esqueci-senha")}>
                Solicitar novo link
              </Button>
            </div>
          ) : sucesso ? (
            /* Sucesso */
            <div className="text-center py-4 animate-fade-in-up">
              <div className="w-16 h-16 rounded-full bg-mint/10 border border-mint/30 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-white mb-2">Senha redefinida!</h2>
              <p className="text-sm text-slate mb-6">
                Sua senha foi alterada com sucesso. Você já pode entrar com a nova senha.
              </p>
              <Button variant="primary" size="md" fullWidth onClick={() => navigate("/login-aluno")}>
                Ir para o login
              </Button>
            </div>
          ) : (
            /* Formulário */
            <>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-mint/10 border border-mint/20 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-white mb-2">Nova senha</h1>
                <p className="text-sm text-slate">Escolha uma senha segura com pelo menos 8 caracteres.</p>
              </div>

              {erro && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-fade-in">
                  {erro}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <FormField label="Nova senha" htmlFor="nova-senha">
                  <Input
                    id="nova-senha" type={showPwd1 ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                    autoComplete="new-password" disabled={loading}
                    rightIcon={
                      <button type="button" onClick={() => setShowPwd1(v => !v)}
                        className="text-slate hover:text-mint transition-colors" tabIndex={-1}>
                        <EyeIcon open={showPwd1} />
                      </button>
                    }
                  />
                </FormField>

                <FormField label="Confirmar senha" htmlFor="confirmar-senha">
                  <Input
                    id="confirmar-senha" type={showPwd2 ? "text" : "password"}
                    placeholder="Repita a nova senha"
                    value={confirmar} onChange={e => setConfirmar(e.target.value)}
                    autoComplete="new-password" disabled={loading}
                    error={confirmar && confirmar !== novaSenha ? "As senhas não coincidem" : undefined}
                    rightIcon={
                      <button type="button" onClick={() => setShowPwd2(v => !v)}
                        className="text-slate hover:text-mint transition-colors" tabIndex={-1}>
                        <EyeIcon open={showPwd2} />
                      </button>
                    }
                  />
                </FormField>

                <div className="pt-2">
                  <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                    Salvar nova senha
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
