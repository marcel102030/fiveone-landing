
import { Link } from "react-router-dom";

const logoSmall = "/assets/images/logo-fiveone-white-small.png";
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
          <Link
            to="/plataforma"
            className="header-link"
          >
            Início
          </Link>
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

export default Header;