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
import { SOCIAL } from "../../../config/social";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="content-container footer-content">
        <div className="footer-section">
          <h3>MOVIMENTO FIVE ONE</h3>
          <p>
            Um movimento que valoriza as Escrituras em primeiro lugar, com
            fundamentação da teologia, sem perder o foco na importância da vida
            devocional e do relacionamento pessoal com Deus.
          </p>
        </div>

        <div className="footer-section">
          <h3>CONTATO</h3>
          <div className="contact-info">
            <p>
              <span>
                <FaPhone /> Atendimento:{" "}
              </span>
              +55 {SOCIAL.whatsapp.display}
            </p>
            <p>
              <span>
                <FaEnvelope />{" "}
              </span>
              {SOCIAL.email}
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
            <a href={SOCIAL.instagram.url} target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href={SOCIAL.youtube.url} target="_blank" rel="noopener noreferrer">
              <FaYoutube />
            </a>
            <a href={SOCIAL.tiktok.url} target="_blank" rel="noopener noreferrer">
              <FaTiktok />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="copyright">© {new Date().getFullYear()} Five One — Todos os direitos reservados</div>
      </div>
    </footer>
  );
};

export default Footer;
