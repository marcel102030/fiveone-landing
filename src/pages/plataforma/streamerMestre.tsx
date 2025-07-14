import { useEffect, useRef, useState } from 'react';
import './streamerMestre.css';
import Header from './Header';

const StreamerMestre = () => {
  const videoList = [
    {
      url: 'https://player.vimeo.com/video/1100734000',
      title: 'Aula 01 – Introdução à História da Igreja',
      thumbnail: '/assets/images/Introducao_historia_igreja.png',
    },
    {
      url: 'https://www.youtube.com/embed/XQEGw923yD0',
      title: 'Aula 02 – A Igreja Primitiva',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 03 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 04 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 05 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 06 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 07 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 08 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 09 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 10 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 11 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 12 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 13 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 14 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 15 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 16 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 17 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedVideos, setCompletedVideos] = useState<number[]>([]);
  const videoRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizeSidebar = () => {
      if (videoRef.current && sidebarRef.current) {
        const videoHeight = videoRef.current.offsetHeight;
        sidebarRef.current.style.height = `${videoHeight}px`;
      }
    };

    resizeSidebar();
    window.addEventListener('resize', resizeSidebar);

    return () => {
      window.removeEventListener('resize', resizeSidebar);
    };
  }, []);

  const handleMarkAsCompleted = () => {
    if (!completedVideos.includes(currentIndex)) {
      setCompletedVideos([...completedVideos, currentIndex]);
    }
  };
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
          <div className="video-and-sidebar">
            <div className="video-content">
              <h2 className="streamer-titulo">{currentVideo.title}</h2>
              <div className="video-container" ref={videoRef}>
                <iframe
                  src={currentVideo.url}
                  title={currentVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="next-button-container">
                <div className="button-group-center">
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
                {!completedVideos.includes(currentIndex) ? (
                  <button className="complete-lesson-button" onClick={handleMarkAsCompleted}>
                    Marcar como Concluído
                  </button>
                ) : (
                  <div className="completed-indicator">
                    Aula Concluída
                  </div>
                )}
              </div>
            </div>
            <div className="video-sidebar" ref={sidebarRef}>
              <h3 className="sidebar-title">Próximas Aulas</h3>
              <ul className="sidebar-list">
                {videoList.map((video, index) => (
                  <li
                    key={index}
                    className={`sidebar-item ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                  >
                    <img
                      src={video.thumbnail || '/assets/images/miniatura_fundamentos_apostololicos.png'}
                      alt={`Miniatura ${video.title}`}
                      className="sidebar-thumbnail"
                    />
                    <div className="sidebar-video-info">
                      <div className="sidebar-video-title">{video.title}</div>
                      <div className="status-indicator">
                        {completedVideos.includes(index) ? '✔️ Concluído' : ''}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default StreamerMestre;