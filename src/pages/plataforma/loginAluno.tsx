import { useState } from "react";
import "./loginAluno.css";
import logoSmall from "./assets/images/logo-fiveone-white-small.png";
import { setCurrentUser } from "../../utils/user";
import { FormationKey, getUserByEmail, verifyUser } from "../../services/userAccount";
import { storePlatformProfile } from "../../hooks/usePlatformUserProfile";
import { getUserProfileDetails } from "../../services/userProfile";

const LoginAluno = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [tocado, setTocado] = useState({ email: false, senha: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTocado({ email: true, senha: true });

    if (!email || !senha) {
      setErro("Informe o seu e-mail e senha.");
      return;
    }
    try {
      const ok = await verifyUser(email, senha);
      if (!ok) { setErro('E-mail ou senha inválidos.'); return; }
      setErro("");
      try { setCurrentUser(email); } catch {}
      try {
        const normalizedEmail = email.trim().toLowerCase();
        const [row, details] = await Promise.all([
          getUserByEmail(normalizedEmail),
          getUserProfileDetails(normalizedEmail).catch(() => null),
        ]);
        const formation = (row?.formation as FormationKey | null) || 'MESTRE';
        localStorage.setItem('platform_user_formation', String(formation));
        storePlatformProfile({
          email: normalizedEmail,
          name: (details?.display_name || [details?.first_name, details?.last_name].filter(Boolean).join(' ') || row?.name || null),
          formation,
          firstName: details?.first_name || null,
          lastName: details?.last_name || null,
          displayName: details?.display_name || null,
        });
      } catch {
        try {
          storePlatformProfile({
            email: email.trim().toLowerCase(),
            name: null,
            formation: null,
            firstName: null,
            lastName: null,
            displayName: null,
          });
        } catch {}
      }
      onLogin();
    } catch (err: any) {
      setErro(err?.message || 'Falha ao processar.');
    }
  };

  return (
    <div>
      <div className="login-container">
        <div className="login-left">
          <div className="logo-topo">
            <img src={logoSmall} alt="Logo Five One" className="login-logo" />
          </div>
          <h2>Bem-vindo</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                border: tocado.email && !email ? "2px solid #f00" : undefined,
              }}
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={{
                border: tocado.senha && !senha ? "2px solid #f00" : undefined,
              }}
            />
            {erro && <div className="mensagem-erro">{erro}</div>}
            <div className="login-options">
              <div className="login-lembrar">
                <label className="checkbox-container">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  <span className="checkbox-text">Permanecer logado</span>
                </label>
              </div>
              <div className="login-recuperar">
                <a href="#">Esqueceu a senha?</a>
              </div>
            </div>
            <button type="submit">
              Entrar
            </button>
          </form>
          <button
            type="button"
            className="return-button"
            onClick={() => window.location.href = "/inicio"}
          >
            SITE FIVE ONE
          </button>
        </div>
        <div className="login-right" />
      </div>
    </div>
  );
};

export default LoginAluno;
