import "./Footer.css";
import {
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaIdCard,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="content-container footer-content">
        <div className="footer-section">
          <h3>ESCOLA FIVE ONE</h3>
          <p>
            Uma escola onde você pode contar com ensino que valoriza as
            Escrituras em primeiro lugar, com fundamentação da teologia, sem
            perder o foco na importância da vida devocional e do relacionamento
            pessoal com Deus.
          </p>
        </div>

        <div className="footer-section">
          <h3>CONTATO</h3>
          <div className="contact-info">
            <p>
              <span>
                <FaPhone /> Atendimento:{" "}
              </span>
              +55 (83) 98900-4764
            </p>
            <p>
              <span>
                <FaEnvelope />{" "}
              </span>
              escolafiveone@gmail.com
            </p>
            <p>
              <span>
                <FaBuilding />{" "}
              </span>
              Escola Five One Ltda
            </p>
            <p>
              <span>
                <FaIdCard /> CNPJ:{" "}
              </span>
              48.442.767/0001-05
            </p>
          </div>
        </div>

        <div className="footer-section">
          <h3>CONECTE-SE CONOSCO</h3>
          <div className="social-links">
            <a
              href="https://www.instagram.com/fiveone.oficial/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.youtube.com/@Escola_Five_One/videos"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaYoutube />
            </a>
            <a
              href="https://www.tiktok.com/@escola.five.one"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTiktok />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="copyright">© 2024 - Todos os direitos reservados</div>
      </div>
    </footer>
  );
};

export default Footer;
