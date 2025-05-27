import { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./Services.css";

// Import icons
import pastorIcon from "../assets/images/icons/pastor.png";
import mestreIcon from "../assets/images/icons/mestre.png";
import profetaIcon from "../assets/images/icons/profeta.png";
import apostoloIcon from "../assets/images/icons/apostolo.png";
import evangelistaIcon from "../assets/images/icons/evangelista.png";
import escolaFiveOne from "../assets/images/escola-fiveone.jpeg";

const trackIcons: { [key: string]: string } = {
  apostle: apostoloIcon,
  prophet: profetaIcon,
  evangelist: evangelistaIcon,
  pastor: pastorIcon,
  teacher: mestreIcon,
};

import { Track } from "../data/courseModules/types";
import { apostleTrack } from "../data/courseModules/apostle";
import { prophetTrack } from "../data/courseModules/prophet";
import { evangelistTrack } from "../data/courseModules/evangelist";
import { pastorTrack } from "../data/courseModules/pastor";
import { teacherTrack } from "../data/courseModules/teacher";

const tracks: Track[] = [
  apostleTrack,
  prophetTrack,
  evangelistTrack,
  pastorTrack,
  teacherTrack,
];

interface SubmoduleAccordionProps {
  code: string;
  title: string;
  type: "T" | "M";
  instructor: string;
  lessons: { title: string }[];
  isOpen: boolean;
  onToggle: () => void;
}

const SubmoduleAccordion = ({
  code,
  title,
  type,
  instructor,
  lessons,
  isOpen,
  onToggle,
}: SubmoduleAccordionProps) => {
  return (
    <div className="submodule-item">
      <div className="submodule-header" onClick={onToggle}>
        <div className="submodule-header-content">
          <div className="submodule-info">
            <span className="submodule-code">{code}.</span>
            <h4 className="submodule-title">{title}</h4>
          </div>
          <div className="submodule-meta">
            <span className="submodule-instructor">
              Professor: {instructor}
            </span>
            <span
              className={`submodule-type ${type}`}
              title={type === "T" ? "Teológico" : "Ministerial"}
            >
              {type === "T" ? "Teológico" : "Ministerial"}
            </span>
          </div>
        </div>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </div>
      {isOpen && (
        <div className="submodule-content">
          <ul className="lessons-list">
            {lessons.map((lesson, index) => (
              <li key={index} className="lesson-item">
                {index + 1}. {lesson.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Services = () => {
  const [selectedTrack, setSelectedTrack] = useState(tracks[0].id);
  const [openSubmodules, setOpenSubmodules] = useState<{
    [key: string]: boolean;
  }>({});
  const [showModules, setShowModules] = useState(false);
  const [fadeInModules, setFadeInModules] = useState(false);

  const currentTrack = tracks.find((track) => track.id === selectedTrack);

  const toggleSubmodule = (moduleIndex: number, submoduleIndex: number) => {
    const key = `${moduleIndex}-${submoduleIndex}`;
    setOpenSubmodules((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleTrackChange = (trackId: string) => {
    setSelectedTrack(trackId);
    setOpenSubmodules({}); // Reset open submodules when changing tracks
  };

  useEffect(() => {
    if (showModules) {
      setFadeInModules(false);
      const timer = setTimeout(() => {
        setFadeInModules(true);
      }, 100); // small delay to restart animation
      return () => clearTimeout(timer);
    }
  }, [selectedTrack, showModules]);

  return (
    <section className="services-section">
      <div className="content-container">
        <div className="services-header">
          <h1>FORMAÇÕES TEOLÓGICAS À DISTÂNCIA</h1>
          <p>CURSOS COMPLETOS 100% ONLINE</p>
        </div>
        <div className="services-header">
          <h1>FORMAÇÕES TEOLÓGICAS À DISTÂNCIA</h1>
          <p>CURSOS COMPLETOS 100% ONLINE</p>
        </div>

        <div className="intro-platform">
          <div className="services-highlight">
            <h2 className="highlight-title">Descubra tudo o que a Escola Five One oferece para sua formação teológica e ministerial</h2>
            <div className="highlight-arrow-css"></div>
          </div>
          <div className="academic-structure">
            <h2 className="academic-title">ESTRUTURA ACADÊMICA</h2>
            <p className="academic-subtitle">Durante o curso você terá acesso a:</p>
            <div className="academic-features">
              <div className="academic-feature">
                <div className="icon icon-video" aria-hidden="true"></div>
                <p><strong>Descoberta do Dom Ministerial:</strong><br />
                  A Escola Five One ajuda cada aluno a identificar e desenvolver seu dom ministerial (Apóstolo, Profeta, Evangelista, Pastor ou Mestre), direcionando-o para o exercício pleno de seu chamado.
                </p>
              </div>
              <div className="academic-feature">
                <div className="icon icon-monitors" aria-hidden="true"></div>
                <p><strong>Formação Teológica Completa:</strong><br />
                  Além do treinamento ministerial no seu dom específico, oferecemos uma formação teológica sólida e abrangente, que inclui auxílio em Apologética, ensinando como defender a fé a partir do seu dom, conhecimento em história da igreja e interpretação bíblica e muito mais. Garantindo que nossos alunos tenham uma base completa para seu desenvolvimento ministerial.
                </p>
              </div>
              <div className="academic-feature">
                <div className="icon icon-monitors" aria-hidden="true"></div>
                <p><strong>Professores Especializados:</strong><br />
                  Contamos com professores experientes em diversos dons ministeriais, proporcionando uma abordagem rica e diversificada.
                </p>
              </div>
              <div className="academic-feature">
                <div className="icon icon-monitors" aria-hidden="true"></div>
                <p><strong>Plataforma:</strong><br />
                  Uma plataforma de aprendizado acessível e prática, onde cada aluno pode desenvolver seu dom em qualquer lugar.
                </p>
              </div>
              <div className="academic-feature">
                <div className="icon icon-disciplines" aria-hidden="true"></div>
                <p><strong>Aulas Ao Vivo e Gravadas:</strong><br />
                  Oferecemos aulas ao vivo que fortalecem o aprendizado e possibilitam a interação direta entre alunos e professores. As aulas Ao vivo irão ocorrer uma vez por semana, para que o aluno se aprofunde ainda mais no seu Dom. Novas aulas gravadas, lançadas toda segunda-feira. São quatro aulas por semana de até 25 minutos cada, para que você possa assistir quando e onde quiser. Com isso, você pode dedicar apenas 20 minutos por dia para investir no seu crescimento Teológico e Ministerial.
                </p>
              </div>
              <div className="academic-feature">
                <div className="icon icon-exercises" aria-hidden="true"></div>
                <p><strong>Mentorias e Grupos no Discord e WhatsApp:</strong><br />
                  A Escola promove a construção de uma comunidade de apoio e aprendizado, incentivando o crescimento mútuo. Através dos grupos, os alunos compartilham experiências, discutem temas e constroem laços de apoio.
                </p>
              </div>
            </div>

            <section className="promo-escola-section">
              <div className="promo-escola-image">
                <img src={escolaFiveOne} alt="Escola Five One" />
              </div>
              <div className="promo-escola-content">
                <h3>Descubra a Escola Five One</h3>
                <p>
                  Viva sua verdadeira identidade em Cristo. Descubra seu chamado, desenvolva seu dom
                  ministerial e conecte-se com uma comunidade de aprendizado e propósito.
                </p>
                <a href="https://alunos.escolafiveone.com" target="_blank" rel="noopener noreferrer">
                  Quero Fazer Parte
                </a>
              </div>
            </section>
            <div className="academic-buttons">
              <button
                className="btn-red"
                onClick={() => {
                  setShowModules((prev) => {
                    if (!prev) {
                      setFadeInModules(false);
                      setTimeout(() => setFadeInModules(true), 100);
                    }
                    return !prev;
                  });
                }}
              >
                {showModules ? "ESCONDER GRADE DA ESCOLA FIVE ONE" : "CONHEÇA A GRADE DA ESCOLA FIVE ONE"}
              </button>
            </div>
          </div>
        </div>

        <div
          className={`module-wrapper ${showModules ? "show" : ""} ${fadeInModules ? "fade-in" : ""}`}
          style={{
            visibility: showModules ? "visible" : "hidden",
            height: showModules ? "auto" : "0",
            overflow: "hidden",
            transition: "all 0.3s ease"
          }}
        >
          <div className="track-tabs">
            {tracks.map((track) => {
              const isSelected = selectedTrack === track.id;
              const currentTrackId = track.id;
              // Debug: log selected and current track
              console.log("Selected:", selectedTrack, "Current Track:", currentTrackId);
              return (
                <button
                  key={track.id}
                  className={`track-tab animate-tab ${isSelected ? "active" : ""}`}
                  onClick={() => handleTrackChange(track.id)}
                >
                  <img src={trackIcons[track.id]} alt={track.title} />
                  <span>{track.title}</span>
                </button>
              );
            })}
          </div>

          <div className="track-header-wrapper margin-top-track-header">
            <h2 className="current-track-title">
              <span className="track-prefix">Formação Ministerial:</span>{" "}
              <span className="track-highlight">{currentTrack?.title}</span>
            </h2>
          </div>

          <div style={{ marginTop: "40px" }}></div>
          <div className="module-grid">
            {currentTrack?.modules.map((module, moduleIndex) => (
              <div key={moduleIndex} className="module-card">
                <h2 className="module-title">{module.title}</h2>
                <div className="submodules-list">
                  {module.submodules.map((submodule, submoduleIndex) => (
                    <SubmoduleAccordion
                      key={submoduleIndex}
                      code={submodule.code}
                      title={submodule.title}
                      type={submodule.type}
                      instructor={submodule.instructor}
                      lessons={submodule.lessons}
                      isOpen={
                        !!openSubmodules[`${moduleIndex}-${submoduleIndex}`]
                      }
                      onToggle={() =>
                        toggleSubmodule(moduleIndex, submoduleIndex)
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
