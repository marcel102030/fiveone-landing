import logoSmall from "./assets/images/logo-fiveone-white-small.png";
import "./plataforma.css";

const Header = () => {
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
          <a href="https://fiveonemovement.com/" target="_blank" className="header-link">Site Five One</a>
        </nav>
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
