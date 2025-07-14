import { useState } from 'react';
import './streamerApostolo.css';
import Header from './Header';

const StreamerApostolo = () => {
  const videoList = [
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U',
      title: 'Aula 01 – Introdução',
    },
    {
      url: 'https://www.youtube.com/embed/XQEGw923yD0',
      title: 'Aula 02 – A Igreja Primitiva',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 03 – Concílios e Doutrinas',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentVideo = videoList[currentIndex];
  const handleNext = () => {
    if (currentIndex < videoList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <>
      <Header />
      <div className="wrapper-central">
        <main className="streamer-video-area">
          <div className="video-wrapper">
            <h2 className="streamer-titulo">{currentVideo.title}</h2>
            <div className="video-container">
              <iframe
                src={currentVideo.url}
                title={currentVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="next-button-container">
              {currentIndex > 0 && (
                <button className="prev-lesson-button" onClick={handlePrevious}>
                  Aula Anterior
                </button>
              )}
              {currentIndex < videoList.length - 1 && (
                <button className="next-lesson-button" onClick={handleNext}>
                  Próxima Aula
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default StreamerApostolo;