import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import logoUrl from "../../../assets/images/logo-fiveone-white.png";

import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    // Get the path after the repository name
    const currentPath =
      location.pathname.replace("/fiveone-landing", "") || "/";
    return currentPath === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo" onClick={() => setIsMenuOpen(false)}>
          <img src={logoUrl} alt="Five One" />
        </Link>

        <button
          className="mobile-menu-button"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMenuOpen ? "active" : ""}`}></span>
        </button>

        <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          <Link
            to="/quem-somos"
            className={`nav-link ${isActive("/quem-somos") ? "active" : ""}`}
            onClick={() => setIsMenuOpen(false)}
          >
            QUEM SOMOS
          </Link>
          <Link
            to="/teste-dons"
            className={`nav-link ${isActive("/teste-dons") ? "active" : ""}`}
            onClick={() => setIsMenuOpen(false)}
          >
            DESCUBRA O SEU DOM MINISTERIAL
          </Link>
          <Link
            to="/formacao-ministerial"
            className={`nav-link ${
              isActive("/formacao-ministerial") ? "active" : ""
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            FORMAÇÃO MINISTERIAL
          </Link>
          <Link
            to="/insights"
            className={`nav-link ${isActive("/insights") ? "active" : ""}`}
            onClick={() => setIsMenuOpen(false)}
          >
            INSIGHTS MINISTERIAIS
          </Link>
          <Link
            to="/contato"
            className={`nav-link ${isActive("/contato") ? "active" : ""}`}
            onClick={() => setIsMenuOpen(false)}
          >
            CONTATO
          </Link>
          <a
            href="https://alunos.escolafiveone.com/login"
            className="button-link"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)}
          >
            ALUNOS FIVE ONE
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
