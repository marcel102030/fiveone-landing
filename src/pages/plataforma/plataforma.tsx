import Header from "./Header";
import "./plataforma.css";
import { Link } from "react-router-dom";
import { useState } from "react";

const PaginaInicial = () => {
  const [modalContent, setModalContent] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = (message: string) => {
    setModalContent(message);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalContent("");
  };

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
        <div className="arrow-icon">↓</div>
        <h2>Sua Formação Ministerial</h2>
        <div className="formacao-container">
          <div
            className="formacao-item"
            style={{ backgroundImage: "url('/assets/images/apostolo.png')" }}
            onClick={() => handleShowModal('Em breve: O Dom Apostólico estará disponível com conteúdos exclusivos sobre como reconhecê-lo e desenvolvê-lo.')}
            role="button"
            tabIndex={0}
          />
          <div
            className="formacao-item"
            style={{ backgroundImage: "url('/assets/images/profeta.png')" }}
            onClick={() => handleShowModal('Em breve: O Dom Profético será ativado com recursos para interpretação, proclamação e exortação segundo a Palavra.')}
            role="button"
            tabIndex={0}
          />
          <div
            className="formacao-item"
            style={{ backgroundImage: "url('/assets/images/evangelista.png')" }}
            onClick={() => handleShowModal('Em breve: Conteúdos evangelísticos para equipar você na proclamação do Evangelho serão liberados.')}
            role="button"
            tabIndex={0}
          />
          <div
            className="formacao-item"
            style={{ backgroundImage: "url('/assets/images/pastor.png')" }}
            onClick={() => handleShowModal('Em breve: O Dom Pastoral estará disponível com fundamentos para cuidado e discipulado cristão.')}
            role="button"
            tabIndex={0}
          />
          <Link
            to="/streamer-mestre"
            className="formacao-item"
            style={{ backgroundImage: "url('/assets/images/mestre.png')" }}
          />
        </div>
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <p>{modalContent}</p>
              <button onClick={handleCloseModal} className="modal-close-button">Fechar</button>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

const AppRouter = () => {
  return <PaginaInicial />;
};

export default AppRouter;
