import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoSmall from "./assets/images/logo-fiveone-white-small.png";
import { supabase } from "../../../shared/lib/supabaseClient";
import { Button } from "../../../shared/components/ui/Button";
import { Input, FormField } from "../../../shared/components/ui/Input";

export default function EsqueciSenha() {
  const navigate = useNavigate();
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [erro,    setErro]    = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setErro("Informe seu e-mail."); return; }
    setErro("");
    setLoading(true);

    try {
      // URL de redirecionamento após clicar no link do email
      const redirectTo = `${window.location.origin}/#/redefinir-senha`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      // Por segurança, não revelamos se o e-mail existe ou não
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-navy px-6 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <img src={logoSmall} alt="Five One" className="h-9 w-9 object-contain" />
          <span className="text-sm font-semibold text-slate-light tracking-widest uppercase">
            Plataforma Five One
          </span>
        </div>

        <div className="bg-navy-light border border-slate/10 rounded-2xl p-8 shadow-card">
          {!sent ? (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-mint/10 border border-mint/20 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-white mb-2">Recuperar senha</h1>
                <p className="text-sm text-slate leading-relaxed">
                  Informe o e-mail da sua conta. Vamos enviar um link para redefinir sua senha.
                </p>
              </div>

              {erro && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-fade-in">
                  {erro}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <FormField label="E-mail" htmlFor="email">
                  <Input
                    id="email" type="email" placeholder="seuemail@exemplo.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    autoComplete="email" disabled={loading}
                  />
                </FormField>

                <div className="space-y-3 pt-2">
                  <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                    Enviar link de recuperação
                  </Button>
                  <Button type="button" variant="ghost" size="lg" fullWidth onClick={() => navigate("/login-aluno")}>
                    Voltar para o login
                  </Button>
                </div>
              </form>
            </>
          ) : (
            /* Estado: e-mail enviado */
            <div className="text-center py-4 animate-fade-in-up">
              <div className="w-16 h-16 rounded-full bg-mint/10 border border-mint/30 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-white mb-2">Verifique seu e-mail</h2>
              <p className="text-sm text-slate leading-relaxed mb-6">
                Se o e-mail <strong className="text-slate-light">{email}</strong> estiver cadastrado,
                você receberá um link para redefinir sua senha em breve.
              </p>
              <p className="text-xs text-slate/60 mb-6">
                Não recebeu? Verifique a pasta de spam ou tente novamente em alguns minutos.
              </p>
              <div className="space-y-3">
                <Button variant="outline" size="md" fullWidth onClick={() => setSent(false)}>
                  Tentar novamente
                </Button>
                <Button variant="ghost" size="md" fullWidth onClick={() => navigate("/login-aluno")}>
                  Voltar para o login
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
