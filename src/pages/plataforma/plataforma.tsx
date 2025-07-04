import logoSmall from "./assets/images/logo-fiveone-white-small.png";
const perfilLogo = "/assets/images/logo_maior.png";
import "./plataforma.css";
import { useState, useEffect, useRef } from "react";

const Header = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <img
          src={logoSmall}
          alt="Logo Five One"
          className="header-logo"
        />
        <nav className="header-nav">
          <a
            href="#"
            className="header-link"
            onClick={(e) => {
              e.preventDefault();
              const section = document.getElementById("inicio");
              section?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Início
          </a>
          <a
            href="https://discord.gg/aCNSSzpY"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link"
          >
            Comunidade Five One
          </a>
          <a
            href="https://fiveonemovement.com/#/teste-dons"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link"
          >
            Descubra o seu Dom Ministerial
          </a>
          <a
            href="https://fiveonemovement.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link"
          >
            Site Five One
          </a>
        </nav>
      </div>
      <div className="header-right">
        <div className="perfil-menu" ref={dropdownRef}>
          <button
            className="perfil-button"
            onClick={() => setDropdownOpen(!isDropdownOpen)}
          >
            <img src={perfilLogo} alt="Perfil" className="perfil-logo" />
          </button>
          {isDropdownOpen && (
            <div className="perfil-dropdown-menu active">
              <a href="/#/login-aluno" className="perfil-dropdown-item">Sair</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const PaginaInicial = () => {
  return (
    <>
      <Header />
      <div id="inicio" className="inicio-container">
        <h1>Bem-vindo à Plataforma Five One</h1>
        <div className="scroll-down-arrow">↓</div>
      </div>
      <section className="bem-vindos">
        <h2>Bem-Vindos</h2>
        <p>Sua Jornada Começa aqui</p>
        <div className="bem-vindos-container">
          <div
            className="bem-vindos-item"
            role="button"
            style={{ backgroundImage: "url('/assets/images/BemVindo.png')" }}
          />
          <div
            className="bem-vindos-item"
            role="button"
            style={{ backgroundImage: "url('/assets/images/OQueEFiveOne.png')" }}
          />
          <div
            className="bem-vindos-item"
            role="button"
            style={{ backgroundImage: "url('/assets/images/SuaJornada.png')" }}
          />
          <div
            className="bem-vindos-item"
            role="button"
            style={{ backgroundImage: "url('/assets/images/Conectese.png')" }}
          />
          <div
            className="bem-vindos-item"
            role="button"
            style={{ backgroundImage: "url('/assets/images/Explore.png')" }}
          />
        </div>
      </section>
      <section className="formacao-ministerial">
        <h2>Sua Formação Ministerial</h2>
        <div className="formacao-container">
          <div
            className="formacao-item"
            role="button"
            style={{ backgroundImage: "url('/assets/images/apostolo.png')" }}
          />
          <div
            className="formacao-item"
            role="button"
            style={{ backgroundImage: "url('/assets/images/profeta.png')" }}
          />
          <div
            className="formacao-item"
            role="button"
            style={{ backgroundImage: "url('/assets/images/evangelista.png')" }}
          />
          <div
            className="formacao-item"
            role="button"
            style={{ backgroundImage: "url('/assets/images/pastor.png')" }}
          />
          <div
            className="formacao-item"
            role="button"
            style={{ backgroundImage: "url('/assets/images/mestre.png')" }}
          />
        </div>
      </section>
    </>
  );
};

const AppRouter = () => {
  return <PaginaInicial />;
};

export default AppRouter;
