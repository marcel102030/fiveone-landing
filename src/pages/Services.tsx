import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./Services.css";

// Import icons
import pastorIcon from "../assets/images/icons/pastor.png";
import mestreIcon from "../assets/images/icons/mestre.png";
import profetaIcon from "../assets/images/icons/profeta.png";
import apostoloIcon from "../assets/images/icons/apostolo.png";
import evangelistaIcon from "../assets/images/icons/evangelista.png";

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

  return (
    <section className="services-section">
      <div className="content-container">
        <h1>Formação Ministerial</h1>

        <div className="track-tabs">
          {tracks.map((track) => (
            <button
              key={track.id}
              className={`track-tab ${
                selectedTrack === track.id ? "active" : ""
              }`}
              onClick={() => handleTrackChange(track.id)}
            >
              <img src={trackIcons[track.id]} alt={track.title} />
              <span>{track.title}</span>
            </button>
          ))}
        </div>

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
    </section>
  );
};

export default Services;
